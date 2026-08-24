"""
Dynamic Routing Integration Module.
Implements edge-weight formulation for Person 4 (Dynamic Routing & Spatial Graph Lead).
Formula:
    W_edge = d * (1 + alpha * R + beta * D)
Where:
    d = Physical length of road segment (meters)
    R = ML predicted risk score of segment [0, 1]
    D = Active defect count within n-meter radius of segment
    alpha, beta = Penalty multipliers prioritizing safety over raw minimal distance
"""

import math
from typing import Dict, Any, List, Tuple, Optional
import numpy as np

from src.spatial_utils import haversine_distance


def compute_dynamic_edge_weight(distance_meters: float,
                                risk_score: float,
                                nearby_defect_count: int,
                                alpha: float = 1.5,
                                beta: float = 0.8) -> float:
    """
    Calculate risk-penalized edge weight for emergency vehicle routing.
    Formula: W_edge = d * (1 + alpha * R + beta * D)
    """
    penalty_multiplier = 1.0 + (alpha * float(risk_score)) + (beta * float(nearby_defect_count))
    dynamic_weight = distance_meters * penalty_multiplier
    return round(float(dynamic_weight), 3)


def evaluate_route_safety_profile(segments: List[Dict[str, Any]],
                                  alpha: float = 1.5,
                                  beta: float = 0.8) -> Dict[str, Any]:
    """
    Evaluate total physical distance vs dynamic penalized length for a candidate route.
    """
    total_physical_dist = 0.0
    total_penalized_dist = 0.0
    risk_scores = []
    total_defects = 0

    for seg in segments:
        d = float(seg["length_meters"])
        r = float(seg.get("risk_score", 0.2))
        cnt = int(seg.get("defect_count", 0))

        w = compute_dynamic_edge_weight(d, r, cnt, alpha=alpha, beta=beta)
        total_physical_dist += d
        total_penalized_dist += w
        risk_scores.append(r)
        total_defects += cnt

    avg_risk = float(np.mean(risk_scores)) if risk_scores else 0.0
    safety_penalty_ratio = (total_penalized_dist / total_physical_dist) if total_physical_dist > 0 else 1.0

    return {
        "total_physical_distance_m": round(total_physical_dist, 2),
        "total_dynamic_weight_m": round(total_penalized_dist, 2),
        "safety_penalty_ratio": round(safety_penalty_ratio, 3),
        "average_segment_risk": round(avg_risk, 3),
        "total_active_defects_on_path": total_defects,
        "recommendation": "SAFE_FOR_EMERGENCY_DISPATCH" if avg_risk < 0.50 and total_defects == 0 else "REROUTE_RECOMMENDED"
    }
