"""
Model 6: Road Health Score Model (0-100)
Auditable, transparent weighted scoring index evaluating structural road asset health.
Part of Prahari AI ML Subsystem.
"""

from typing import Dict, Any, List, Optional


class RoadHealthScoreModel:
    """
    Transparent & Auditable Road Health Index:
    Combines accident history, open defects, traffic load, lighting, and drainage.
    Produces a 0-100 health score with fine-grained factor attribution for city engineers.
    """

    def __init__(self):
        pass

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
        """
        Calculate road health score (0-100, where 100 is pristine condition).

        Args:
            road_segment_id: Segment identifier (e.g. 'SEG-CIVIL-LINES-01')
            accident_history_count: Number of historical accidents on segment
            active_potholes: Number of open unresolved potholes
            active_streetlight_defects: Number of unlit / broken streetlights
            active_garbage_defects: Number of open garbage heaps
            active_drainage_defects: Number of open waterlogging/drain issues
            traffic_volume_daily: Estimated vehicles/day on corridor
            lighting_coverage_pct: Illumination coverage percentage (0-100)
            drainage_functional: Whether stormwater drains are clear
            surface_quality_index: Visual road rating from 1.0 (ruined) to 10.0 (smooth)

        Returns:
            Dict containing:
                - road_segment_id (str)
                - health_score (float 0-100)
                - health_tier (str)
                - factors_breakdown (Dict[str, float])
                - summary_verdict (str)
        """
        base_score = 100.0

        # 1. Pothole Penalty (Max -28 pts)
        pothole_penalty = min(28.0, active_potholes * 7.0)

        # 2. Accident History Penalty (Max -22 pts)
        accident_penalty = min(22.0, accident_history_count * 5.5)

        # 3. Drainage & Waterlogging Penalty (Max -18 pts)
        drainage_penalty = min(12.0, active_drainage_defects * 4.0) + (0.0 if drainage_functional else 6.0)

        # 4. Lighting Coverage Penalty (Max -14 pts)
        missing_lighting = max(0.0, 100.0 - lighting_coverage_pct)
        lighting_penalty = min(14.0, (missing_lighting / 100.0) * 8.0 + (active_streetlight_defects * 3.0))

        # 5. Traffic Load Wear (Max -10 pts)
        if traffic_volume_daily > 40000:
            traffic_penalty = 10.0
        elif traffic_volume_daily > 20000:
            traffic_penalty = 6.0
        elif traffic_volume_daily > 10000:
            traffic_penalty = 3.0
        else:
            traffic_penalty = 1.0

        # 6. Garbage & Shoulder Obstruction (Max -8 pts)
        garbage_penalty = min(8.0, active_garbage_defects * 2.5)

        # Surface rating modifier
        surface_modifier = (10.0 - surface_quality_index) * 1.5

        # Calculate final health score
        total_deductions = (pothole_penalty + accident_penalty + drainage_penalty +
                            lighting_penalty + traffic_penalty + garbage_penalty + surface_modifier)
        final_health = max(5.0, min(100.0, base_score - total_deductions))

        # Determine Tier
        if final_health >= 85.0:
            tier = "EXCELLENT"
            verdict = "Road segment in top-tier condition; regular monitoring sufficient."
        elif final_health >= 70.0:
            tier = "GOOD"
            verdict = "Minor surface wear detected; scheduled routine maintenance recommended."
        elif final_health >= 50.0:
            tier = "FAIR"
            verdict = "Moderate structural defects; prioritized patching needed within 30 days."
        elif final_health >= 30.0:
            tier = "POOR"
            verdict = "Significant degradation and safety hazards; immediate resurfacing required."
        else:
            tier = "CRITICAL"
            verdict = "Severe road failure with high accident hazard; emergency intervention needed."

        factors_breakdown = {
            "potholes_impact": round(-pothole_penalty, 2),
            "accident_history_impact": round(-accident_penalty, 2),
            "drainage_impact": round(-drainage_penalty, 2),
            "lighting_impact": round(-lighting_penalty, 2),
            "traffic_wear_impact": round(-traffic_penalty, 2),
            "garbage_obstruction_impact": round(-garbage_penalty, 2),
            "surface_quality_index": round(surface_quality_index, 1),
            "total_open_complaints": active_potholes + active_streetlight_defects + active_garbage_defects + active_drainage_defects
        }

        return {
            "road_segment_id": road_segment_id,
            "health_score": round(final_health, 2),
            "health_tier": tier,
            "factors_breakdown": factors_breakdown,
            "summary_verdict": verdict
        }
