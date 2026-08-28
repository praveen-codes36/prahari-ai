"""
Unified Production Inference Engine for Prahari AI.
Implements Two-Tier Hierarchical Vision Verification with Out-of-Distribution (OOD) Rejection:
  - Tier 1: Deep Semantic Domain Gate (Filters out People, Screens, Indoor Objects, Animals, Food)
  - Tier 2: Specialized Road Infrastructure Defect Classifier (Pothole, Streetlight, Garbage, Drainage)
"""

import os
import sys
import io
import json
import joblib
from typing import Dict, Any, List, Optional, Union, Tuple
import numpy as np
import pandas as pd
from PIL import Image
import torch
import torch.nn as nn
import torchvision.transforms as transforms
import torchvision.models as models

current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(current_dir) if "src" in current_dir else current_dir
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from src.spatial_utils import (
    PRAYAGRAJ_BOUNDS,
    PRAYAGRAJ_LANDMARKS,
    DefectSpatialIndex,
    is_within_prayagraj,
    haversine_distance
)
from src.duplicate_detector import DuplicateComplaintDetector
from src.predictive_maintenance import PredictiveMaintenanceForecaster
from src.road_health import RoadHealthScoreModel
from src.repair_priority import RepairPriorityRankingModel
from src.routing_integration import EmergencyRoutingEngine, compute_dynamic_edge_weight, evaluate_route_safety_profile
from src.copilot_engine import AuthorityCopilotEngine
from src.citizen_chatbot import CitizenChatbotEngine

DEFECT_CLASSES = ["Pothole", "Streetlight Defect", "Garbage Accumulation", "Drainage Issues", "Other / No Defect"]

DEPARTMENT_MAPPING = {
    "Pothole": "PWD_Road_Maintenance",
    "Streetlight Defect": "UPPCL_Streetlight_Cell",
    "Garbage Accumulation": "Prayagraj_Nagar_Nigam_Sanitation",
    "Drainage Issues": "Jal_Sansthan_Drainage_Div",
    "Other / No Defect": "None"
}

# =====================================================================
# TIER 1: SEMANTIC OOD REJECTION RULES (ImageNet-1K Taxonomy)
# =====================================================================
ANIMAL_INDICES = set(range(0, 398))

CLOTHING_KEYWORDS = {
    "suit", "dress", "gown", "jersey", "trench_coat", "coat", "bikini", "abaya", "wig", 
    "cloak", "bonnet", "hat", "cap", "sunglasses", "sunglass", "tie", "jean", "sweatshirt", 
    "sock", "shoe", "sandal", "brassiere", "pajama", "kimono", "uniform", "vest", "apron",
    "seat_belt", "maillot", "cardigan", "skirt", "turban", "sombrero", "cowboy_hat"
}

SCREEN_AND_TECH_KEYWORDS = {
    "screen", "monitor", "television", "cash_machine", "cellular_telephone", "phone", "laptop", 
    "computer", "notebook", "ipod", "mouse", "keyboard", "printer", "remote_control"
}

INDOOR_AND_FOOD_KEYWORDS = {
    "table", "desk", "couch", "sofa", "bed", "wardrobe", "refrigerator", "microwave", 
    "dishwasher", "oven", "toaster", "plate", "cup", "mug", "pizza", "bagel", "cheeseburger", 
    "hotdog", "sandwich", "ice_cream", "pillow", "bookcase", "cabinet", "home_theater",
    "candle", "table_lamp", "vase", "tub", "toilet", "washbasin", "soap_dispenser"
}


def build_mobilenetv2_model(num_classes: int = 5) -> nn.Module:
    """Build MobileNetV2 architecture matching trained 5-class checkpoint."""
    model = models.mobilenet_v2(weights=None)
    in_features = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(p=0.2),
        nn.Linear(in_features, 128),
        nn.ReLU(inplace=True),
        nn.Dropout(p=0.1),
        nn.Linear(128, num_classes)
    )
    return model


class RoadGuardInferenceEngine:
    """
    Master Production ML Engine for Prahari AI / RoadGuard AI.
    Features Two-Tier Semantic Domain Filtering & Real-World Defect Classification.
    """

    def __init__(self,
                 models_dir: str = "trained_models",
                 defects_data_path: Optional[str] = "data/prayagraj_defects_database.csv",
                 device: Optional[str] = None):
        self.models_dir = os.path.join(root_dir, models_dir) if not os.path.isabs(models_dir) else models_dir
        self.device = torch.device(device if device else ("cuda" if torch.cuda.is_available() else "cpu"))

        # 1. Load Pretrained ImageNet Model for Tier 1 Semantic OOD Filtering
        self.imagenet_backbone = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.DEFAULT)
        self.imagenet_backbone.to(self.device)
        self.imagenet_backbone.eval()

        # Load ImageNet class taxonomy dict
        tax_path = os.path.join(self.models_dir, "imagenet_class_index.json")
        if os.path.exists(tax_path):
            with open(tax_path, "r", encoding="utf-8") as f:
                self.class_idx = json.load(f)
        else:
            self.class_idx = {}

        # 2. Load Specialized Defect Model (Tier 2)
        cv_weights_path = os.path.join(self.models_dir, "defect_classifier_mobilenetv2.pt")
        self.cv_model = build_mobilenetv2_model(num_classes=5)
        if os.path.exists(cv_weights_path):
            checkpoint = torch.load(cv_weights_path, map_location=self.device)
            self.cv_model.load_state_dict(checkpoint["model_state_dict"])
            self.classes = checkpoint.get("classes", DEFECT_CLASSES)
            self.idx_to_class = checkpoint.get("idx_to_class", {i: c for i, c in enumerate(DEFECT_CLASSES)})
        else:
            self.classes = DEFECT_CLASSES
            self.idx_to_class = {i: c for i, c in enumerate(DEFECT_CLASSES)}

        self.cv_model.to(self.device)
        self.cv_model.eval()

        self.img_transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])

        # 3. Load Tabular Risk Models and Preprocessor
        xgb_path = os.path.join(self.models_dir, "risk_predictor_xgboost.joblib")
        rf_path = os.path.join(self.models_dir, "risk_predictor_rf.joblib")
        preproc_path = os.path.join(self.models_dir, "risk_preprocessor.joblib")

        self.xgb_model = joblib.load(xgb_path) if os.path.exists(xgb_path) else None
        self.rf_model = joblib.load(rf_path) if os.path.exists(rf_path) else None
        self.preprocessor = joblib.load(preproc_path) if os.path.exists(preproc_path) else None

        # 4. Initialize Live Defect Spatial Index (cKDTree)
        self.spatial_index = DefectSpatialIndex()
        if defects_data_path:
            full_defects_path = os.path.join(root_dir, defects_data_path) if not os.path.isabs(defects_data_path) else defects_data_path
            if os.path.exists(full_defects_path):
                df_defects = pd.read_csv(full_defects_path)
                if "is_active" in df_defects.columns:
                    active = df_defects[df_defects["is_active"] == 1].to_dict(orient="records")
                else:
                    active = df_defects.to_dict(orient="records")
                self.spatial_index.build_index(active)

        # 5. Initialize Subsystem Models
        self.duplicate_detector = DuplicateComplaintDetector(cv_model=self.cv_model, device=self.device)
        self.maintenance_forecaster = PredictiveMaintenanceForecaster()
        self.road_health_model = RoadHealthScoreModel()
        self.priority_ranking_model = RepairPriorityRankingModel()
        self.routing_engine = EmergencyRoutingEngine()
        self.copilot_engine = AuthorityCopilotEngine()
        self.chatbot_engine = CitizenChatbotEngine(cv_classifier=self)

    # -------------------------------------------------------------
    # TIER 1: SEMANTIC OOD REJECTION CHECK
    # -------------------------------------------------------------
    def check_semantic_ood(self, tensor: torch.Tensor) -> Tuple[bool, str]:
        """
        Check if image is an Out-of-Distribution non-defect concept (Person, Screen, Indoor, Animal).
        Returns: (is_ood: bool, rejection_reason: str)
        """
        if not self.class_idx:
            return False, ""

        with torch.no_grad():
            out = self.imagenet_backbone(tensor)
            probs = torch.softmax(out, dim=1).squeeze(0)
            top5 = torch.topk(probs, 5)

        top_indices = [top5.indices[i].item() for i in range(5)]
        top_labels = [self.class_idx.get(str(idx), ["", "unknown"])[1] for idx in top_indices]
        top_probs = [top5.values[i].item() for i in range(5)]

        top1_idx = top_indices[0]
        top1_lbl = top_labels[0].lower()

        # Check 1: Animal
        if top1_idx in ANIMAL_INDICES:
            return True, f"Animal detected: '{top_labels[0]}' ({top_probs[0]*100:.1f}%)"

        # Check 2: Clothing / Apparel / People
        for lbl in top_labels[:3]:
            lbl_clean = lbl.lower()
            if any(kw in lbl_clean for kw in CLOTHING_KEYWORDS):
                return True, f"Person / Apparel detected: '{lbl}'"

        # Check 3: Screen / Monitor / Electronics
        for lbl in top_labels[:3]:
            lbl_clean = lbl.lower()
            if any(kw in lbl_clean for kw in SCREEN_AND_TECH_KEYWORDS):
                return True, f"Screen / Electronics detected: '{lbl}'"

        # Check 4: Indoor Furniture / Food
        for lbl in top_labels[:2]:
            lbl_clean = lbl.lower()
            if any(kw in lbl_clean for kw in INDOOR_AND_FOOD_KEYWORDS) and not ("street" in lbl_clean or "pole" in lbl_clean):
                return True, f"Indoor / Household object detected: '{lbl}'"

        return False, ""

    # -------------------------------------------------------------
    # MODEL 1 & 2: DEFECT DETECTION & SEVERITY ESTIMATION
    # -------------------------------------------------------------
    def predict_defect(self, image_input: Union[str, bytes, Image.Image]) -> Dict[str, Any]:
        """
        Two-Tier Vision Model:
          Tier 1: Semantic OOD Domain Gate
          Tier 2: Specialized Defect Classifier (Pothole, Streetlight, Garbage, Drainage)
        """
        if isinstance(image_input, str):
            image = Image.open(image_input).convert("RGB")
        elif isinstance(image_input, bytes):
            image = Image.open(io.BytesIO(image_input)).convert("RGB")
        elif isinstance(image_input, Image.Image):
            image = image_input.convert("RGB")
        else:
            raise ValueError(f"Unsupported image input type: {type(image_input)}")

        tensor = self.img_transform(image).unsqueeze(0).to(self.device)

        # -------------------------------------------------------------
        # TIER 1: SEMANTIC OOD FILTER
        # -------------------------------------------------------------
        is_ood, ood_reason = self.check_semantic_ood(tensor)
        if is_ood:
            return {
                "defect_type": "Other / No Defect",
                "is_valid_defect": False,
                "confidence_score": 99.5,
                "confidence": 0.995,
                "severity": "NONE",
                "severity_estimate": "NONE",
                "probabilities": {
                    "Pothole": 0.0,
                    "Streetlight Defect": 0.0,
                    "Garbage Accumulation": 0.0,
                    "Drainage Issues": 0.0,
                    "Other / No Defect": 0.995
                },
                "department_assigned": "None",
                "ai_verification_status": "REJECTED_NON_DEFECT",
                "rejection_reason": ood_reason,
                "message": f"Non-defect upload rejected ({ood_reason}). Skipped risk and routing calculation."
            }

        # -------------------------------------------------------------
        # TIER 2: SPECIALIZED ROAD DEFECT CLASSIFIER
        # -------------------------------------------------------------
        with torch.no_grad():
            outputs = self.cv_model(tensor)
            probabilities = torch.softmax(outputs, dim=1).squeeze(0).cpu().numpy()

        top_idx = int(np.argmax(probabilities))
        top_class = self.idx_to_class[top_idx]
        confidence = float(probabilities[top_idx])

        # Check if Tier 2 flags as Other / No Defect
        if top_class == "Other / No Defect" or confidence < 0.50:
            return {
                "defect_type": "Other / No Defect",
                "is_valid_defect": False,
                "confidence_score": round(confidence * 100.0, 2),
                "confidence": round(confidence, 4),
                "severity": "NONE",
                "severity_estimate": "NONE",
                "probabilities": {self.idx_to_class[i]: round(float(probabilities[i]), 4) for i in range(len(self.classes))},
                "department_assigned": "None",
                "ai_verification_status": "REJECTED_NON_DEFECT",
                "rejection_reason": "Low defect confidence or normal undamaged road surface",
                "message": "No municipal road defect detected. Image rejected from risk and routing calculations."
            }

        # Severity Estimation Logic for Valid Defects
        if confidence > 0.90:
            severity = "CRITICAL" if top_class in ["Pothole", "Drainage Issues"] else "HIGH"
        elif confidence > 0.70:
            severity = "HIGH" if top_class == "Pothole" else "MEDIUM"
        else:
            severity = "MEDIUM"

        prob_dict = {self.idx_to_class[i]: round(float(probabilities[i]), 4) for i in range(len(self.classes))}

        return {
            "defect_type": top_class,
            "is_valid_defect": True,
            "confidence_score": round(confidence * 100.0, 2),
            "confidence": round(confidence, 4),
            "severity": severity,
            "severity_estimate": severity,
            "probabilities": prob_dict,
            "department_assigned": DEPARTMENT_MAPPING.get(top_class, "PWD_Road_Maintenance"),
            "ai_verification_status": "AI_VERIFIED",
            "rejection_reason": None,
            "message": "Valid road defect verified and assigned to municipal department."
        }

    # -------------------------------------------------------------
    # MODEL 3: DUPLICATE COMPLAINT DETECTOR
    # -------------------------------------------------------------
    def check_duplicate(self,
                        lat: float,
                        lng: float,
                        defect_type: str,
                        image_input: Optional[Union[str, bytes, Image.Image]] = None,
                        existing_complaints: Optional[List[Dict[str, Any]]] = None,
                        geo_radius_meters: float = 50.0,
                        similarity_threshold: float = 75.0) -> Dict[str, Any]:
        """Model 3: Check if complaint is a duplicate of existing open tickets."""
        if defect_type.lower() in ["other / no defect", "other", "none"]:
            return {
                "is_duplicate": False,
                "duplicate_of": None,
                "duplicate_similarity_score": 0.0,
                "matched_distance_meters": None,
                "reasoning": "Non-defect image. Skipped duplicate evaluation."
            }

        if existing_complaints is None:
            existing_complaints = self.spatial_index.defect_records

        return self.duplicate_detector.check_duplicate(
            new_lat=lat,
            new_lng=lng,
            new_defect_type=defect_type,
            new_image_input=image_input,
            existing_complaints=existing_complaints,
            geo_radius_meters=geo_radius_meters,
            similarity_threshold=similarity_threshold
        )

    # -------------------------------------------------------------
    # MODEL 4: ACCIDENT RISK PREDICTION MODEL
    # -------------------------------------------------------------
    def predict_risk(self,
                     lat: float,
                     lng: float,
                     road_type: str = "Major Arterial",
                     speed_limit: int = 45,
                     lane_count: int = 2,
                     traffic_density: str = "Moderate",
                     weather: str = "Clear",
                     time_of_day: str = "Evening Rush",
                     hour: int = 18,
                     day_of_week: int = 2,
                     is_weekend: int = 0,
                     month: int = 8,
                     nearby_defect_count: Optional[int] = None,
                     defect_severity_index: Optional[float] = None,
                     model_type: str = "xgboost") -> Dict[str, Any]:
        """Model 4: Predict dynamic accident risk score [0-100] and contributing factor breakdown."""
        if nearby_defect_count is None or defect_severity_index is None:
            kdtree_count, kdtree_sev = self.spatial_index.count_defects_in_radius(lat, lng, radius_meters=500.0)
            if nearby_defect_count is None:
                nearby_defect_count = kdtree_count
            if defect_severity_index is None:
                defect_severity_index = kdtree_sev

        hour_sin = np.sin(2 * np.pi * hour / 24.0)
        hour_cos = np.cos(2 * np.pi * hour / 24.0)
        day_sin = np.sin(2 * np.pi * day_of_week / 7.0)
        day_cos = np.cos(2 * np.pi * day_of_week / 7.0)
        month_sin = np.sin(2 * np.pi * month / 12.0)
        month_cos = np.cos(2 * np.pi * month / 12.0)

        df_input = pd.DataFrame({
            "lat": [lat],
            "lng": [lng],
            "road_type": [road_type],
            "speed_limit": [speed_limit],
            "lane_count": [lane_count],
            "traffic_density": [traffic_density],
            "weather": [weather],
            "time_of_day": [time_of_day],
            "is_weekend": [is_weekend],
            "nearby_defect_count_500m": [nearby_defect_count],
            "defect_severity_index": [defect_severity_index],
            "hour_sin": [hour_sin],
            "hour_cos": [hour_cos],
            "day_sin": [day_sin],
            "day_cos": [day_cos],
            "month_sin": [month_sin],
            "month_cos": [month_cos],
        })

        X_trans = self.preprocessor.transform(df_input)

        if model_type.lower() == "random_forest" and self.rf_model is not None:
            raw_score = float(self.rf_model.predict(X_trans)[0])
            active_model = "RandomForest"
        else:
            raw_score = float(self.xgb_model.predict(X_trans)[0])
            active_model = "XGBoost"

        calibrated_risk = float(np.clip(raw_score, 0.01, 0.99))
        risk_score_100 = round(calibrated_risk * 100.0, 1)

        # Risk Classification
        if calibrated_risk >= 0.75:
            risk_level = "CRITICAL"
        elif calibrated_risk >= 0.55:
            risk_level = "HIGH"
        elif calibrated_risk >= 0.30:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"

        factors_breakdown = {
            "infrastructure_defect_impact": round(min(40.0, (nearby_defect_count * 8.0) + (defect_severity_index * 3.0)), 1),
            "meteorological_impact": 25.0 if weather in ["Dense Fog / Smog", "Rain"] else 5.0,
            "traffic_rush_impact": 20.0 if time_of_day in ["Evening Rush", "Morning Rush"] else 5.0,
            "speed_corridor_impact": 15.0 if speed_limit >= 65 else 5.0
        }

        factors_list = []
        if nearby_defect_count >= 3:
            factors_list.append(f"High local defect density: {nearby_defect_count} active defect(s) in 500m")
        if weather in ["Dense Fog / Smog", "Rain", "Monsoon Overcast"]:
            factors_list.append(f"Adverse weather condition: {weather}")
        if time_of_day in ["Evening Rush", "Late Night", "Morning Rush"]:
            factors_list.append(f"High incident probability time window: {time_of_day}")
        if not factors_list:
            factors_list.append("Nominal road and weather conditions")

        return {
            "risk_score": calibrated_risk,
            "risk_score_100": risk_score_100,
            "risk_level": risk_level,
            "model": active_model,
            "spatial_context": {
                "latitude": round(lat, 6),
                "longitude": round(lng, 6),
                "within_prayagraj_bounds": is_within_prayagraj(lat, lng),
                "nearby_defect_count_500m": nearby_defect_count,
                "defect_severity_index": round(defect_severity_index, 2),
            },
            "factors_breakdown": factors_breakdown,
            "contributing_factors": factors_list,
        }

    # -------------------------------------------------------------
    # MODEL 5: PREDICTIVE MAINTENANCE FORECAST (30-DAY RISK)
    # -------------------------------------------------------------
    def predict_maintenance(self,
                            road_segment_id: str,
                            current_risk_score: float,
                            recent_complaint_velocity: float = 1.0,
                            recent_traffic_trend: float = 1.0,
                            time_since_last_repair_days: int = 90,
                            is_monsoon_season: bool = False,
                            road_type: str = "Major Arterial") -> Dict[str, Any]:
        """Model 5: Forecast 30-day degradation risk and proactive action window."""
        return self.maintenance_forecaster.predict_maintenance(
            road_segment_id=road_segment_id,
            current_risk_score=current_risk_score,
            recent_complaint_velocity=recent_complaint_velocity,
            recent_traffic_trend=recent_traffic_trend,
            time_since_last_repair_days=time_since_last_repair_days,
            is_monsoon_season=is_monsoon_season,
            road_type=road_type
        )

    # -------------------------------------------------------------
    # MODEL 6: ROAD HEALTH SCORE (0-100)
    # -------------------------------------------------------------
    def calculate_health_score(self,
                               road_segment_id: str,
                               accident_history_count: int = 0,
                               active_potholes: int = 0,
                               active_streetlight_defects: int = 0,
                               active_garbage_defects: int = 0,
                               active_drainage_defects: int = 0,
                               traffic_volume_daily: int = 15000,
                               lighting_coverage_pct: float = 85.0,
                               drainage_functional: bool = True,
                               surface_quality_index: float = 8.0) -> Dict[str, Any]:
        """Model 6: Compute transparent, auditable 0-100 road health index."""
        return self.road_health_model.calculate_health_score(
            road_segment_id=road_segment_id,
            accident_history_count=accident_history_count,
            active_potholes=active_potholes,
            active_streetlight_defects=active_streetlight_defects,
            active_garbage_defects=active_garbage_defects,
            active_drainage_defects=active_drainage_defects,
            traffic_volume_daily=traffic_volume_daily,
            lighting_coverage_pct=lighting_coverage_pct,
            drainage_functional=drainage_functional,
            surface_quality_index=surface_quality_index
        )

    # -------------------------------------------------------------
    # MODEL 7: AI REPAIR PRIORITY RANKING
    # -------------------------------------------------------------
    def calculate_repair_priority(self,
                                  complaint_id: str,
                                  defect_type: str = "Pothole",
                                  severity: str = "HIGH",
                                  road_segment_risk_score: float = 0.50,
                                  accident_history_count: int = 0,
                                  traffic_volume_daily: int = 20000,
                                  population_density: str = "High",
                                  days_open: int = 3) -> Dict[str, Any]:
        """Model 7: Calculate backlog triage priority score (0-100)."""
        return self.priority_ranking_model.calculate_priority(
            complaint_id=complaint_id,
            defect_type=defect_type,
            severity=severity,
            road_segment_risk_score=road_segment_risk_score,
            accident_history_count=accident_history_count,
            traffic_volume_daily=traffic_volume_daily,
            population_density=population_density,
            days_open=days_open
        )

    def rank_repair_backlog(self, complaints: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Model 7: Rank an entire queue of open defect tickets into an ordered action list."""
        return self.priority_ranking_model.rank_backlog(complaints)

    # -------------------------------------------------------------
    # MODEL 8: EMERGENCY INTELLIGENT ROUTING
    # -------------------------------------------------------------
    def compute_emergency_route(self,
                                start_lat: float,
                                start_lng: float,
                                dest_lat: Optional[float] = None,
                                dest_lng: Optional[float] = None,
                                weather: str = "Clear",
                                time_of_day: str = "Evening Rush") -> Dict[str, Any]:
        """Model 8: Calculate safety-penalized optimal emergency route and nearest trauma centers."""
        return self.routing_engine.compute_emergency_route(
            start_lat=start_lat,
            start_lng=start_lng,
            dest_lat=dest_lat,
            dest_lng=dest_lng,
            weather=weather,
            time_of_day=time_of_day
        )

    # -------------------------------------------------------------
    # MODEL 9: AI AUTHORITY COPILOT
    # -------------------------------------------------------------
    def query_authority_copilot(self, query: str, retrieved_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Model 9: Natural language query and factor explainability for city administrators."""
        return self.copilot_engine.query(user_query=query, retrieved_data=retrieved_data)

    # -------------------------------------------------------------
    # MODEL 10: CITIZEN AI CHATBOT
    # -------------------------------------------------------------
    def handle_citizen_message(self,
                               message_text: str,
                               image_input: Optional[Union[str, bytes, Image.Image]] = None,
                               user_id: str = "CITIZEN_DEFAULT") -> Dict[str, Any]:
        """Model 10: Conversational assistant coordinating defect intake, status tracking, and dispatch."""
        return self.chatbot_engine.handle_message(
            message_text=message_text,
            image_input=image_input,
            user_id=user_id
        )

    # -------------------------------------------------------------
    # DYNAMIC INGESTION (CLOSED-LOOP LINK)
    # -------------------------------------------------------------
    def ingest_defect(self,
                       lat: float,
                       lng: float,
                       defect_type: str,
                       severity: str = "Moderate",
                       status: str = "AI Verified",
                       photo_url: str = "") -> Dict[str, Any]:
        """
        Dynamically ingest verified defect into live spatial index.
        Rejects non-defect uploads to prevent polluting the risk surface.
        """
        if defect_type.lower() in ["other / no defect", "other", "none", "no defect"]:
            return {
                "status": "rejected",
                "message": "Ignored non-defect upload. Spatial risk index was not modified.",
                "defect": None,
                "total_active_defects_indexed": len(self.spatial_index.defect_records)
            }

        record = {
            "id": f"REP-LIVE-{np.random.randint(100000, 999999)}",
            "defect_type": defect_type,
            "lat": lat,
            "lng": lng,
            "severity": severity,
            "status": status,
            "photo_url": photo_url,
            "department_id": DEPARTMENT_MAPPING.get(defect_type, "PWD_Road_Maintenance"),
            "is_active": 1 if status != "Resolved" else 0,
        }
        self.spatial_index.add_defect(record)
        return {
            "status": "success",
            "message": "Defect ingested into live spatial index successfully",
            "defect": record,
            "total_active_defects_indexed": len(self.spatial_index.defect_records)
        }

    def batch_predict_grid(self, grid_steps: int = 15) -> List[Dict[str, Any]]:
        """Generate spatial risk points for frontend heatmap."""
        lats = np.linspace(PRAYAGRAJ_BOUNDS["min_lat"], PRAYAGRAJ_BOUNDS["max_lat"], grid_steps)
        lngs = np.linspace(PRAYAGRAJ_BOUNDS["min_lng"], PRAYAGRAJ_BOUNDS["max_lng"], grid_steps)
        results = []
        for lat in lats:
            for lng in lngs:
                res = self.predict_risk(lat=float(lat), lng=float(lng))
                results.append({
                    "lat": round(float(lat), 6),
                    "lng": round(float(lng), 6),
                    "risk_score": res["risk_score"],
                    "risk_score_100": res["risk_score_100"],
                    "risk_level": res["risk_level"],
                    "defects_nearby": res["spatial_context"]["nearby_defect_count_500m"]
                })
        return results
