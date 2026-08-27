"""
Model 5: Predictive Maintenance Model (30-Day Risk Forecast)
Time-series and rolling-trend degradation forecaster for proactive road asset management.
Part of Prahari AI ML Subsystem.
"""

import math
from typing import Dict, Any, List, Optional


class PredictiveMaintenanceForecaster:
    """
    Forecasting Engine:
    Predicts road corridor risk score 30 days into the future if left unmaintained.
    Generates explainable degradation factors and proactive maintenance intervention windows.
    """

    def __init__(self):
        pass

    def predict_maintenance(self,
                            road_segment_id: str,
                            current_risk_score: float,
                            recent_complaint_velocity: float = 1.0,
                            recent_traffic_trend: float = 1.0,
                            time_since_last_repair_days: int = 90,
                            is_monsoon_season: bool = False,
                            road_type: str = "Major Arterial") -> Dict[str, Any]:
        """
        Forecast risk score 30 days ahead based on rolling complaint velocity and road wear.

        Args:
            road_segment_id: Identifier or name of the corridor (e.g. 'SEG-MG-MARG-04')
            current_risk_score: Current risk score [0.0, 1.0] or [0, 100]
            recent_complaint_velocity: New complaints per week on this segment (e.g. 0.5 to 8.0)
            recent_traffic_trend: Multiplier for recent traffic growth (e.g. 1.0 = baseline, 1.3 = +30%)
            time_since_last_repair_days: Days elapsed since last municipal resurfacing/patching
            is_monsoon_season: True if currently in monsoon period (accelerates water ingress)
            road_type: Classification of the road

        Returns:
            Dict containing:
                - road_segment_id (str)
                - current_risk_score (float 0-100)
                - predicted_risk_score_30d (float 0-100)
                - risk_delta (float)
                - degradation_velocity (str)
                - reasoning (List[str])
                - recommended_action_window_days (int)
        """
        # Normalize current risk to 0-100 scale
        r_curr = current_risk_score * 100.0 if current_risk_score <= 1.0 else current_risk_score
        r_curr = max(0.0, min(100.0, r_curr))

        reasoning = []

        # 1. Structural Aging Degradation (Exponential wear with time since repair)
        aging_months = time_since_last_repair_days / 30.0
        if time_since_last_repair_days > 180:
            aging_penalty = min(15.0, (aging_months - 6.0) * 1.8 + 8.0)
            reasoning.append(f"Overdue maintenance: {time_since_last_repair_days} days since last structural repair.")
        elif time_since_last_repair_days > 90:
            aging_penalty = (aging_months - 3.0) * 1.5 + 3.0
            reasoning.append(f"Aging surface: {time_since_last_repair_days} days since last maintenance.")
        else:
            aging_penalty = 1.0

        # 2. Defect Influx & Complaint Velocity Compounding
        if recent_complaint_velocity >= 3.0:
            velocity_penalty = recent_complaint_velocity * 3.2
            reasoning.append(f"High complaint velocity: {recent_complaint_velocity:.1f} new defect reports/week.")
        elif recent_complaint_velocity >= 1.0:
            velocity_penalty = recent_complaint_velocity * 2.0
            reasoning.append(f"Moderate complaint velocity: {recent_complaint_velocity:.1f} reports/week.")
        else:
            velocity_penalty = recent_complaint_velocity * 1.0

        # 3. Traffic Stress Multiplier
        road_stress_map = {
            "National Highway": 1.4,
            "Major Arterial": 1.25,
            "Bridge / Flyover": 1.3,
            "Dense Urban Street": 1.1,
            "Suburban Arterial": 1.0,
            "Local Residential": 0.8
        }
        stress_mult = road_stress_map.get(road_type, 1.1) * max(0.8, min(1.8, recent_traffic_trend))

        # 4. Environmental Monsoon Degradation
        monsoon_mult = 1.45 if is_monsoon_season else 1.0
        if is_monsoon_season:
            reasoning.append("Monsoon season active: Accelerates asphalt pothole formation and waterlogging.")

        # Combined forecasted delta
        raw_growth = (aging_penalty * 0.4 + velocity_penalty * 0.6) * stress_mult * monsoon_mult
        predicted_30d = min(100.0, r_curr + raw_growth)
        risk_delta = round(predicted_30d - r_curr, 2)

        # Categorize velocity tier
        if risk_delta >= 25.0 or predicted_30d >= 80.0:
            velocity_tier = "CRITICAL_FAILURE_IMMINENT"
            action_window = 7
        elif risk_delta >= 14.0 or predicted_30d >= 60.0:
            velocity_tier = "RAPID_DETERIORATION"
            action_window = 14
        elif risk_delta >= 6.0:
            velocity_tier = "MODERATE_DEGRADATION"
            action_window = 30
        else:
            velocity_tier = "STABLE"
            action_window = 60

        if not reasoning:
            reasoning.append("Road segment exhibiting stable structural condition with low defect velocity.")

        return {
            "road_segment_id": road_segment_id,
            "current_risk_score": round(r_curr, 2),
            "predicted_risk_score_30d": round(predicted_30d, 2),
            "risk_delta": risk_delta,
            "degradation_velocity": velocity_tier,
            "reasoning": reasoning,
            "recommended_action_window_days": action_window
        }
