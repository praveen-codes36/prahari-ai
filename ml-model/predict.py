"""
Prahari AI — Master Production ML Gateway (predict.py)
Direct programmatic interface for FastAPI/Node.js Backend and Routing Engine.
Implements all 10 services defined in the RoadGuard / Prahari AI ML Specification:

  1. Defect Type Classifier (CNN)               -> detect_defect()
  2. Defect Severity Estimation                 -> estimate_severity()
  3. Duplicate Complaint Detector (Geo+Embedding)-> check_duplicate()
  4. Accident Risk Prediction Model (XGBoost)   -> predict_risk()
  5. Predictive Maintenance Model (30-Day Trend)-> predict_maintenance()
  6. Road Health Score Model (0-100)            -> calculate_health_score()
  7. AI Repair Priority Ranking Model           -> calculate_repair_priority(), rank_repair_backlog()
  8. Emergency Intelligent Routing Engine       -> get_emergency_route(), compute_dynamic_edge_weight()
  9. AI Authority / Government Copilot          -> query_authority_copilot()
  10. Citizen AI Chatbot Engine                 -> handle_citizen_message()
"""

import os
import sys
from typing import Dict, Any, List, Optional, Union
from PIL import Image

# Ensure current directory is on Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from src.inference import RoadGuardInferenceEngine
from src.routing_integration import compute_dynamic_edge_weight as _compute_weight, evaluate_route_safety_profile as _eval_route

# Global Lazy-loaded Inference Engine Singleton
_ENGINE_INSTANCE: Optional[RoadGuardInferenceEngine] = None


def get_inference_engine() -> RoadGuardInferenceEngine:
    """Get or initialize the master ML inference engine singleton."""
    global _ENGINE_INSTANCE
    if _ENGINE_INSTANCE is None:
        models_dir = os.path.join(current_dir, "trained_models")
        defects_csv = os.path.join(current_dir, "data", "prayagraj_defects_database.csv")
        _ENGINE_INSTANCE = RoadGuardInferenceEngine(
            models_dir=models_dir,
            defects_data_path=defects_csv if os.path.exists(defects_csv) else None
        )
    return _ENGINE_INSTANCE


# =====================================================================
# SERVICE 1 & 2: DEFECT DETECTION & SEVERITY ESTIMATION
# Feeds: POST /api/internal/detect-defect
# =====================================================================
def detect_defect(image_input: Union[str, bytes, Image.Image]) -> Dict[str, Any]:
    """
    Service 1 & 2: Classify road defect photo into 4 municipal categories and estimate severity.
    Output: defect_type, confidence_score, severity (LOW/MEDIUM/HIGH/CRITICAL), department_assigned.
    """
    engine = get_inference_engine()
    return engine.predict_defect(image_input)


# Alias matching legacy naming
classify_defect = detect_defect


def estimate_severity(image_input: Union[str, bytes, Image.Image], defect_type: str = "Pothole") -> Dict[str, Any]:
    """
    Service 2: Dedicated severity estimation head.
    """
    res = detect_defect(image_input)
    return {
        "defect_type": res["defect_type"],
        "severity": res["severity"],
        "confidence_score": res["confidence_score"]
    }


# =====================================================================
# SERVICE 3: DUPLICATE COMPLAINT DETECTOR
# Feeds: POST /api/internal/check-duplicate
# =====================================================================
def check_duplicate(lat: float,
                    lng: float,
                    defect_type: str,
                    image_input: Optional[Union[str, bytes, Image.Image]] = None,
                    existing_complaints: Optional[List[Dict[str, Any]]] = None,
                    geo_radius_meters: float = 50.0,
                    similarity_threshold: float = 75.0) -> Dict[str, Any]:
    """
    Service 3: Two-stage duplicate detection (50m spatial radius + deep image embedding cosine similarity).
    Output: is_duplicate, duplicate_of, duplicate_similarity_score (0-100), matched_distance_meters, reasoning.
    """
    engine = get_inference_engine()
    return engine.check_duplicate(
        lat=lat,
        lng=lng,
        defect_type=defect_type,
        image_input=image_input,
        existing_complaints=existing_complaints,
        geo_radius_meters=geo_radius_meters,
        similarity_threshold=similarity_threshold
    )


# =====================================================================
# SERVICE 4: ACCIDENT RISK PREDICTION MODEL
# Feeds: POST /api/internal/predict-risk
# =====================================================================
def predict_risk(lat: float,
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
    Service 4: Predict dynamic accident risk score [0-100] and contributing factor breakdown.
    Output: risk_score (0-100), risk_level (LOW/MEDIUM/HIGH/CRITICAL), factors_breakdown object.
    """
    engine = get_inference_engine()
    return engine.predict_risk(
        lat=lat,
        lng=lng,
        road_type=road_type,
        speed_limit=speed_limit,
        lane_count=lane_count,
        traffic_density=traffic_density,
        weather=weather,
        time_of_day=time_of_day,
        hour=hour,
        day_of_week=day_of_week,
        is_weekend=is_weekend,
        month=month,
        nearby_defect_count=nearby_defect_count,
        defect_severity_index=defect_severity_index,
        model_type=model_type
    )


# =====================================================================
# SERVICE 5: PREDICTIVE MAINTENANCE (30-DAY RISK FORECAST)
# Feeds: POST /api/internal/predict-maintenance
# =====================================================================
def predict_maintenance(road_segment_id: str,
                        current_risk_score: float,
                        recent_complaint_velocity: float = 1.0,
                        recent_traffic_trend: float = 1.0,
                        time_since_last_repair_days: int = 90,
                        is_monsoon_season: bool = False,
                        road_type: str = "Major Arterial") -> Dict[str, Any]:
    """
    Service 5: 30-day proactive degradation risk forecaster.
    Output: predicted_risk_score_30d, risk_delta, degradation_velocity, reasoning array.
    """
    engine = get_inference_engine()
    return engine.predict_maintenance(
        road_segment_id=road_segment_id,
        current_risk_score=current_risk_score,
        recent_complaint_velocity=recent_complaint_velocity,
        recent_traffic_trend=recent_traffic_trend,
        time_since_last_repair_days=time_since_last_repair_days,
        is_monsoon_season=is_monsoon_season,
        road_type=road_type
    )


# =====================================================================
# SERVICE 6: ROAD HEALTH SCORE MODEL (0-100)
# Feeds: POST /api/internal/calculate-health-score
# =====================================================================
def calculate_health_score(road_segment_id: str,
                           accident_history_count: int = 0,
                           active_potholes: int = 0,
                           active_streetlight_defects: int = 0,
                           active_garbage_defects: int = 0,
                           active_drainage_defects: int = 0,
                           traffic_volume_daily: int = 15000,
                           lighting_coverage_pct: float = 85.0,
                           drainage_functional: bool = True,
                           surface_quality_index: float = 8.0) -> Dict[str, Any]:
    """
    Service 6: Transparent weighted road asset health score (0-100).
    Output: health_score, health_tier, factors_breakdown (potholes, accidents, drainage, lighting, traffic).
    """
    engine = get_inference_engine()
    return engine.calculate_health_score(
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


# =====================================================================
# SERVICE 7: AI REPAIR PRIORITY RANKING MODEL
# Feeds: POST /api/internal/calculate-priority
# =====================================================================
def calculate_repair_priority(complaint_id: str,
                              defect_type: str = "Pothole",
                              severity: str = "HIGH",
                              road_segment_risk_score: float = 0.50,
                              accident_history_count: int = 0,
                              traffic_volume_daily: int = 20000,
                              population_density: str = "High",
                              days_open: int = 3) -> Dict[str, Any]:
    """
    Service 7: Multi-factor triage priority score (0-100).
    """
    engine = get_inference_engine()
    return engine.calculate_repair_priority(
        complaint_id=complaint_id,
        defect_type=defect_type,
        severity=severity,
        road_segment_risk_score=road_segment_risk_score,
        accident_history_count=accident_history_count,
        traffic_volume_daily=traffic_volume_daily,
        population_density=population_density,
        days_open=days_open
    )


def rank_repair_backlog(complaints: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Service 7: Rank an entire queue of open defect tickets into an ordered action list with integer rank.
    """
    engine = get_inference_engine()
    return engine.rank_repair_backlog(complaints)


# =====================================================================
# SERVICE 8: EMERGENCY INTELLIGENT ROUTING ENGINE
# Feeds: POST /api/emergency/route
# =====================================================================
def get_emergency_route(start_lat: float,
                        start_lng: float,
                        dest_lat: Optional[float] = None,
                        dest_lng: Optional[float] = None,
                        weather: str = "Clear",
                        time_of_day: str = "Evening Rush") -> Dict[str, Any]:
    """
    Service 8: Compute safety-penalized optimal emergency route and nearest trauma centers.
    Output: recommended_route, candidate_routes, nearest_hospitals.
    """
    engine = get_inference_engine()
    return engine.compute_emergency_route(
        start_lat=start_lat,
        start_lng=start_lng,
        dest_lat=dest_lat,
        dest_lng=dest_lng,
        weather=weather,
        time_of_day=time_of_day
    )


def compute_dynamic_edge_weight(distance_meters: float,
                                risk_score: float,
                                nearby_defect_count: int = 0,
                                traffic_level: str = "Moderate",
                                is_blocked: bool = False,
                                alpha: float = 1.5,
                                beta: float = 0.8,
                                gamma: float = 0.5) -> float:
    """
    Calculate dynamic safety-penalized edge weight: W_edge = d * (1 + alpha*R + beta*D + gamma*T)
    """
    return _compute_weight(
        distance_meters=distance_meters,
        risk_score=risk_score,
        nearby_defect_count=nearby_defect_count,
        traffic_level=traffic_level,
        is_blocked=is_blocked,
        alpha=alpha,
        beta=beta,
        gamma=gamma
    )


def evaluate_route(segments: List[Dict[str, Any]], alpha: float = 1.5, beta: float = 0.8) -> Dict[str, Any]:
    """Evaluate overall route safety profile for candidate emergency paths."""
    return _eval_route(segments, alpha=alpha, beta=beta)


# =====================================================================
# SERVICE 9: AI AUTHORITY / GOVERNMENT COPILOT
# Feeds: POST /api/copilot/authority/query, /explain/:id
# =====================================================================
def query_authority_copilot(query: str, retrieved_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Service 9: Grounded natural language query & factor explainability for city administrators.
    Output: response_type (RANKED_LIST/EXPLANATION/STAT), answer, grounded_facts, recommended_actions.
    """
    engine = get_inference_engine()
    return engine.query_authority_copilot(query=query, retrieved_data=retrieved_data)


# =====================================================================
# SERVICE 10: CITIZEN AI CHATBOT ENGINE
# Feeds: POST /api/chatbot/citizen/message
# =====================================================================
def handle_citizen_message(message_text: str,
                           image_input: Optional[Union[str, bytes, Image.Image]] = None,
                           user_id: str = "CITIZEN_DEFAULT") -> Dict[str, Any]:
    """
    Service 10: Conversational assistant coordinating defect intake, status tracking, and dispatch.
    Output: reply_text, detected_intent, triggered_actions, defect_classification.
    """
    engine = get_inference_engine()
    return engine.handle_citizen_message(
        message_text=message_text,
        image_input=image_input,
        user_id=user_id
    )


# =====================================================================
# CLOSED-LOOP FEEDBACK & HEATMAP UTILITIES
# =====================================================================
def ingest_defect(lat: float,
                   lng: float,
                   defect_type: str,
                   severity: str = "Moderate",
                   status: str = "AI Verified",
                   photo_url: str = "") -> Dict[str, Any]:
    """Dynamically ingest verified defect into live spatial cKDTree index."""
    engine = get_inference_engine()
    return engine.ingest_defect(
        lat=lat,
        lng=lng,
        defect_type=defect_type,
        severity=severity,
        status=status,
        photo_url=photo_url
    )


def get_heatmap_grid(steps: int = 20) -> List[Dict[str, Any]]:
    """Compute spatial risk heatmap points across Prayagraj."""
    engine = get_inference_engine()
    return engine.batch_predict_grid(grid_steps=steps)
