"""
Prahari AI — Production ML Prediction Interface (predict.py)
Direct programmatic interface for FastAPI Backend (Person 2) and Routing Engine (Person 4).

Usage:
    from ml_model.predict import classify_defect, predict_risk, ingest_defect, compute_dynamic_edge_weight
    # or within ml-model directory:
    from predict import classify_defect, predict_risk, ingest_defect, compute_dynamic_edge_weight
"""

import os
import sys
from typing import Dict, Any, List, Optional, Union
from PIL import Image

# Ensure current directory is in sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from src.inference import RoadGuardInferenceEngine
from src.routing_integration import compute_dynamic_edge_weight as _compute_weight, evaluate_route_safety_profile as _eval_route

# Global Lazy-loaded Inference Engine Singleton
_ENGINE_INSTANCE: Optional[RoadGuardInferenceEngine] = None


def get_inference_engine() -> RoadGuardInferenceEngine:
    """Get or initialize the singleton ML inference engine."""
    global _ENGINE_INSTANCE
    if _ENGINE_INSTANCE is None:
        models_dir = os.path.join(current_dir, "trained_models")
        if not os.path.exists(models_dir):
            models_dir = os.path.join(current_dir, "checkpoints")
        defects_csv = os.path.join(current_dir, "data", "prayagraj_defects_database.csv")
        _ENGINE_INSTANCE = RoadGuardInferenceEngine(
            models_dir=models_dir,
            defects_data_path=defects_csv if os.path.exists(defects_csv) else None
        )
    return _ENGINE_INSTANCE


def classify_defect(image_input: Union[str, bytes, Image.Image]) -> Dict[str, Any]:
    """
    Classify uploaded road defect image into 1 of 4 categories:
      - Pothole (Assigned to PWD Road Maintenance)
      - Streetlight Defect (Assigned to UPPCL Streetlight Cell)
      - Garbage Accumulation (Assigned to Prayagraj Nagar Nigam Sanitation)
      - Drainage Issues (Assigned to Jal Sansthan Drainage Division)

    Args:
        image_input: Filepath (str), raw image bytes (bytes), or PIL.Image object.

    Returns:
        Dict containing:
            - defect_type (str): Top predicted category
            - confidence (float): Softmax probability [0.0, 1.0]
            - severity_estimate (str): 'Low', 'Moderate', 'High'
            - department_assigned (str): Target municipal agency
            - probabilities (Dict[str, float]): Full multi-class probability distribution
            - ai_verification_status (str): 'AI_VERIFIED' or 'REQUIRES_MANUAL_REVIEW'
    """
    engine = get_inference_engine()
    return engine.predict_defect(image_input)


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
    Predict dynamic accident risk score [0.0, 1.0] for a specific geographic coordinate.
    Automatically queries the cKDTree spatial index for live citizen defect density within 500m.

    Args:
        lat, lng: Coordinate in Prayagraj (25.30N-25.55N, 81.70E-82.00E)
        road_type: 'National Highway', 'Major Arterial', 'Bridge / Flyover', 'Dense Urban Street', etc.
        speed_limit: Corridor speed limit in km/h (e.g. 30, 45, 65, 80)
        lane_count: Number of lanes (1, 2, 4, 6)
        traffic_density: 'Low', 'Moderate', 'High', 'Congested'
        weather: 'Clear', 'Rain', 'Dense Fog / Smog', 'Monsoon Overcast', 'Dust Storm'
        time_of_day: 'Morning Rush', 'Afternoon Off-Peak', 'Evening Rush', 'Late Night', 'Early Hours'
        hour: Hour of day (0-23)
        day_of_week: Day of week (0=Mon, 6=Sun)
        is_weekend: 1 if weekend, 0 otherwise
        month: Month (1-12)
        nearby_defect_count: Optional override for defect count in 500m
        defect_severity_index: Optional override for defect severity index
        model_type: 'xgboost' (default) or 'random_forest'

    Returns:
        Dict containing:
            - risk_score (float): Calibrated risk score [0.0, 1.0]
            - risk_level (str): 'Low', 'Medium', 'High', 'Critical'
            - model (str): 'XGBoost' or 'RandomForest'
            - spatial_context (Dict): Contains nearby defect count & Prayagraj boundary check
            - contributing_factors (List[str]): Explanatory hazard drivers
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


def ingest_defect(lat: float,
                   lng: float,
                   defect_type: str,
                   severity: str = "Moderate",
                   status: str = "AI Verified",
                   photo_url: str = "") -> Dict[str, Any]:
    """
    Closed-Loop Feedback Link:
    Dynamically ingest a verified citizen defect report and immediately update
    the live cKDTree spatial index so all subsequent risk predictions reflect the hazard.
    """
    engine = get_inference_engine()
    return engine.ingest_defect(
        lat=lat,
        lng=lng,
        defect_type=defect_type,
        severity=severity,
        status=status,
        photo_url=photo_url
    )


def compute_dynamic_edge_weight(distance_meters: float,
                                risk_score: float,
                                nearby_defect_count: int,
                                alpha: float = 1.5,
                                beta: float = 0.8) -> float:
    """
    Calculate dynamic safety-penalized edge weight for emergency pathfinding.
    Formula: W_edge = d * (1 + alpha * R + beta * D)
    """
    return _compute_weight(
        distance_meters=distance_meters,
        risk_score=risk_score,
        nearby_defect_count=nearby_defect_count,
        alpha=alpha,
        beta=beta
    )


def evaluate_route(segments: List[Dict[str, Any]], alpha: float = 1.5, beta: float = 0.8) -> Dict[str, Any]:
    """Evaluate overall route safety profile for candidate emergency paths."""
    return _eval_route(segments, alpha=alpha, beta=beta)


def get_heatmap_grid(steps: int = 20) -> List[Dict[str, Any]]:
    """Compute spatial risk heatmap points across Prayagraj for frontend visualization."""
    engine = get_inference_engine()
    return engine.batch_predict_grid(grid_steps=steps)
