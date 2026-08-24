"""
Unified Inference Engine for RoadGuard AI.
Integrates Computer Vision Defect Classifier and Tabular Risk Surface Predictor
with Live Incident Feedback Link for Prayagraj, UP.
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
root_dir = os.path.dirname(current_dir)
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from src.spatial_utils import (
    PRAYAGRAJ_BOUNDS,
    PRAYAGRAJ_LANDMARKS,
    DefectSpatialIndex,
    is_within_prayagraj,
)

DEFECT_CLASSES = ["Pothole", "Streetlight Defect", "Garbage Accumulation", "Drainage Issues"]

DEPARTMENT_MAPPING = {
    "Pothole": "PWD_Road_Maintenance",
    "Streetlight Defect": "UPPCL_Streetlight_Cell",
    "Garbage Accumulation": "Prayagraj_Nagar_Nigam_Sanitation",
    "Drainage Issues": "Jal_Sansthan_Drainage_Div",
}


def build_mobilenetv2_model(num_classes: int = 4) -> nn.Module:
    """Build MobileNetV2 architecture matching trained checkpoint."""
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
    Production-grade Unified Inference Engine for RoadGuard AI.
    Exposes clean APIs for defect classification, dynamic risk prediction,
    and closed-loop citizen defect ingestion.
    """

    def __init__(self,
                 models_dir: str = "trained_models",
                 defects_data_path: Optional[str] = "data/prayagraj_defects_database.csv",
                 device: Optional[str] = None):
        self.models_dir = os.path.join(root_dir, models_dir)
        self.device = torch.device(device if device else ("cuda" if torch.cuda.is_available() else "cpu"))

        # 1. Load Computer Vision Model
        cv_weights_path = os.path.join(self.models_dir, "defect_classifier_mobilenetv2.pt")
        self.cv_model = build_mobilenetv2_model(num_classes=4)
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

        # 2. Load Tabular Risk Models and Preprocessor
        xgb_path = os.path.join(self.models_dir, "risk_predictor_xgboost.joblib")
        rf_path = os.path.join(self.models_dir, "risk_predictor_rf.joblib")
        preproc_path = os.path.join(self.models_dir, "risk_preprocessor.joblib")

        self.xgb_model = joblib.load(xgb_path) if os.path.exists(xgb_path) else None
        self.rf_model = joblib.load(rf_path) if os.path.exists(rf_path) else None
        self.preprocessor = joblib.load(preproc_path) if os.path.exists(preproc_path) else None

        # 3. Initialize Live Defect Spatial Index (KDTree)
        self.spatial_index = DefectSpatialIndex()
        if defects_data_path:
            full_defects_path = os.path.join(root_dir, defects_data_path)
            if os.path.exists(full_defects_path):
                df_defects = pd.read_csv(full_defects_path)
                if "is_active" in df_defects.columns:
                    active = df_defects[df_defects["is_active"] == 1].to_dict(orient="records")
                else:
                    active = df_defects.to_dict(orient="records")
                self.spatial_index.build_index(active)

        # 4. Load Metadata
        meta_path = os.path.join(self.models_dir, "model_metadata.json")
        self.metadata = {}
        if os.path.exists(meta_path):
            with open(meta_path, "r", encoding="utf-8") as f:
                self.metadata = json.load(f)

    def predict_defect(self, image_input: Union[str, bytes, Image.Image]) -> Dict[str, Any]:
        """
        Classify uploaded road defect image into 1 of 4 categories:
        - Pothole
        - Streetlight Defect
        - Garbage Accumulation
        - Drainage Issues
        """
        # Load PIL Image
        if isinstance(image_input, str):
            image = Image.open(image_input).convert("RGB")
        elif isinstance(image_input, bytes):
            image = Image.open(io.BytesIO(image_input)).convert("RGB")
        elif isinstance(image_input, Image.Image):
            image = image_input.convert("RGB")
        else:
            raise ValueError(f"Unsupported image input type: {type(image_input)}")

        tensor = self.img_transform(image).unsqueeze(0).to(self.device)

        with torch.no_grad():
            outputs = self.cv_model(tensor)
            probabilities = torch.softmax(outputs, dim=1).squeeze(0).cpu().numpy()

        top_idx = int(np.argmax(probabilities))
        top_class = self.idx_to_class[top_idx]
        confidence = float(probabilities[top_idx])

        # Estimated defect severity
        if confidence > 0.85:
            severity = "High" if top_class in ["Pothole", "Drainage Issues"] else "Moderate"
        elif confidence > 0.60:
            severity = "Moderate"
        else:
            severity = "Low"

        prob_dict = {self.idx_to_class[i]: round(float(probabilities[i]), 4) for i in range(len(self.classes))}

        return {
            "defect_type": top_class,
            "confidence": round(confidence, 4),
            "severity_estimate": severity,
            "probabilities": prob_dict,
            "department_assigned": DEPARTMENT_MAPPING.get(top_class, "PWD_Road_Maintenance"),
            "ai_verification_status": "AI_VERIFIED" if confidence >= 0.50 else "REQUIRES_MANUAL_REVIEW"
        }

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
        """
        Compute dynamic accident risk score [0.0, 1.0] for a specific road segment.
        Automatically queries KDTree spatial index for nearby defects within 500m.
        """
        # If not provided, query KDTree live feedback link
        if nearby_defect_count is None or defect_severity_index is None:
            kdtree_count, kdtree_sev = self.spatial_index.count_defects_in_radius(lat, lng, radius_meters=500.0)
            if nearby_defect_count is None:
                nearby_defect_count = kdtree_count
            if defect_severity_index is None:
                defect_severity_index = kdtree_sev

        # Compute cyclical temporal variables
        hour_sin = np.sin(2 * np.pi * hour / 24.0)
        hour_cos = np.cos(2 * np.pi * hour / 24.0)
        day_sin = np.sin(2 * np.pi * day_of_week / 7.0)
        day_cos = np.cos(2 * np.pi * day_of_week / 7.0)
        month_sin = np.sin(2 * np.pi * month / 12.0)
        month_cos = np.cos(2 * np.pi * month / 12.0)

        feature_dict = {
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
        }

        df_input = pd.DataFrame(feature_dict)
        X_trans = self.preprocessor.transform(df_input)

        if model_type.lower() == "random_forest" and self.rf_model is not None:
            raw_score = float(self.rf_model.predict(X_trans)[0])
            active_model = "RandomForest"
        else:
            raw_score = float(self.xgb_model.predict(X_trans)[0])
            active_model = "XGBoost"

        calibrated_risk = float(np.clip(raw_score, 0.01, 0.99))

        # Risk Classification
        if calibrated_risk >= 0.75:
            risk_level = "Critical"
        elif calibrated_risk >= 0.55:
            risk_level = "High"
        elif calibrated_risk >= 0.30:
            risk_level = "Medium"
        else:
            risk_level = "Low"

        # Contributing Hazard Factors Analysis
        factors = []
        if nearby_defect_count >= 3 or defect_severity_index >= 4.0:
            factors.append(f"High local infrastructure hazard: {nearby_defect_count} active defect(s) within 500m")
        elif nearby_defect_count > 0:
            factors.append(f"Active infrastructure defect present within 500m (Count: {nearby_defect_count})")

        if weather in ["Dense Fog / Smog", "Rain", "Monsoon Overcast"]:
            factors.append(f"Adverse meteorological conditions: {weather}")

        if time_of_day in ["Evening Rush", "Late Night", "Morning Rush"]:
            factors.append(f"High incident probability time window: {time_of_day}")

        if speed_limit >= 65:
            factors.append(f"High-speed highway corridor ({speed_limit} km/h limit)")

        if traffic_density in ["High", "Congested"]:
            factors.append(f"Elevated traffic density: {traffic_density}")

        if not factors:
            factors.append("Nominal road and weather conditions")

        return {
            "risk_score": round(calibrated_risk, 4),
            "risk_level": risk_level,
            "model": active_model,
            "spatial_context": {
                "latitude": round(lat, 6),
                "longitude": round(lng, 6),
                "within_prayagraj_bounds": is_within_prayagraj(lat, lng),
                "nearby_defect_count_500m": nearby_defect_count,
                "defect_severity_index": round(defect_severity_index, 2),
            },
            "contributing_factors": factors,
        }

    def ingest_defect(self,
                       lat: float,
                       lng: float,
                       defect_type: str,
                       severity: str = "Moderate",
                       status: str = "Reported",
                       photo_url: str = "") -> Dict[str, Any]:
        """
        Dynamic Ingestion Link: Ingest a newly reported/verified defect and immediately
        update the live spatial KDTree index so risk evaluations reflect it instantly.
        """
        defect_record = {
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
        self.spatial_index.add_defect(defect_record)
        return {
            "message": "Defect ingested successfully and KDTree spatial index updated",
            "defect": defect_record,
            "total_active_defects_indexed": len(self.spatial_index.defect_records)
        }

    def batch_predict_grid(self,
                           grid_steps: int = 15,
                           weather: str = "Clear",
                           time_of_day: str = "Evening Rush") -> List[Dict[str, Any]]:
        """Compute spatial risk heatmap points across Prayagraj."""
        lats = np.linspace(PRAYAGRAJ_BOUNDS["min_lat"], PRAYAGRAJ_BOUNDS["max_lat"], grid_steps)
        lngs = np.linspace(PRAYAGRAJ_BOUNDS["min_lng"], PRAYAGRAJ_BOUNDS["max_lng"], grid_steps)

        results = []
        for lat in lats:
            for lng in lngs:
                res = self.predict_risk(
                    lat=float(lat),
                    lng=float(lng),
                    weather=weather,
                    time_of_day=time_of_day
                )
                results.append({
                    "lat": round(float(lat), 6),
                    "lng": round(float(lng), 6),
                    "risk_score": res["risk_score"],
                    "risk_level": res["risk_level"],
                    "defects_nearby": res["spatial_context"]["nearby_defect_count_500m"]
                })
        return results
