"""
Model 7: AI Repair Priority Ranking Model
Multi-factor triage engine ranking municipal defect repairs and road maintenance queues.
Part of Prahari AI ML Subsystem.
"""

from typing import Dict, Any, List, Optional


class RepairPriorityRankingModel:
    """
    Backlog Triage & Ranking Engine:
    Ranks open infrastructure defect tickets into a single prioritized action list for municipal teams.
    """

    def __init__(self):
        pass

    def calculate_priority(self,
                           complaint_id: str,
                           defect_type: str = "Pothole",
                           severity: str = "HIGH",
                           road_segment_risk_score: float = 0.50,
                           accident_history_count: int = 0,
                           traffic_volume_daily: int = 20000,
                           population_density: str = "High",
                           days_open: int = 3) -> Dict[str, Any]:
        """
        Compute multi-factor priority score (0-100) for a single defect ticket.

        Args:
            complaint_id: Ticket ID (e.g. 'REP-PRG-10452')
            defect_type: 'Pothole', 'Streetlight Defect', 'Garbage Accumulation', 'Drainage Issues'
            severity: 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'
            road_segment_risk_score: Segment risk from Model 4 [0.0, 1.0] or [0, 100]
            accident_history_count: Historical accidents near this defect
            traffic_volume_daily: Vehicles per day on road
            population_density: 'High', 'Moderate', 'Low'
            days_open: Age of the unresolved ticket in days

        Returns:
            Dict containing priority_score, urgency_tier, and scoring factors breakdown.
        """
        # 1. Severity Factor (Max 35 pts)
        severity_map = {
            "CRITICAL": 35.0,
            "HIGH": 26.0,
            "MEDIUM": 16.0,
            "LOW": 7.0
        }
        sev_score = severity_map.get(severity.upper(), 16.0)

        # Defect type multiplier (Potholes and Drainage on fast roads have higher life-safety hazard)
        if defect_type.lower() in ["pothole", "drainage issues"]:
            sev_score = min(35.0, sev_score * 1.1)

        # 2. Road Segment Risk Score (Max 25 pts)
        r_norm = road_segment_risk_score if road_segment_risk_score <= 1.0 else road_segment_risk_score / 100.0
        risk_pts = min(25.0, r_norm * 25.0)

        # 3. Traffic Exposure & Road Usage (Max 20 pts)
        if traffic_volume_daily >= 35000 or population_density.lower() == "high":
            traffic_pts = 20.0
        elif traffic_volume_daily >= 18000 or population_density.lower() == "moderate":
            traffic_pts = 14.0
        elif traffic_volume_daily >= 8000:
            traffic_pts = 8.0
        else:
            traffic_pts = 4.0

        # 4. Aging Backlog Penalty (Max 10 pts)
        # Tickets open longer escalate in priority
        aging_pts = min(10.0, days_open * 1.2)

        # 5. Accident History Proximity (Max 10 pts)
        accident_pts = min(10.0, accident_history_count * 3.0)

        # Composite Priority Score [0, 100]
        total_priority = round(min(100.0, sev_score + risk_pts + traffic_pts + aging_pts + accident_pts), 2)

        # Urgency Tier
        if total_priority >= 80.0:
            urgency = "EMERGENCY_INTERVENTION"
        elif total_priority >= 60.0:
            urgency = "HIGH_PRIORITY"
        elif total_priority >= 40.0:
            urgency = "MEDIUM_PRIORITY"
        else:
            urgency = "ROUTINE"

        return {
            "complaint_id": complaint_id,
            "defect_type": defect_type,
            "priority_score": total_priority,
            "urgency_level": urgency,
            "factors_breakdown": {
                "severity_contribution": round(sev_score, 2),
                "corridor_risk_contribution": round(risk_pts, 2),
                "traffic_exposure_contribution": round(traffic_pts, 2),
                "aging_backlog_contribution": round(aging_pts, 2),
                "accident_proximity_contribution": round(accident_pts, 2)
            }
        }

    def rank_backlog(self, complaints: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Rank an entire queue of open defect complaints by priority score.
        Assigns integer queue rank (1, 2, 3...) to each ticket.
        """
        scored_list = []
        for comp in complaints:
            c_id = comp.get("id") or comp.get("complaint_id") or "UNKNOWN"
            d_type = comp.get("defect_type", "Pothole")
            sev = comp.get("severity", "MEDIUM")
            risk = comp.get("risk_score", 0.40)
            acc = comp.get("accident_history_count", 0)
            traffic = comp.get("traffic_volume_daily", 15000)
            pop = comp.get("population_density", "Moderate")
            days = comp.get("days_open", 2)

            res = self.calculate_priority(
                complaint_id=c_id,
                defect_type=d_type,
                severity=sev,
                road_segment_risk_score=risk,
                accident_history_count=acc,
                traffic_volume_daily=traffic,
                population_density=pop,
                days_open=days
            )
            scored_list.append({**comp, **res})

        # Sort descending by priority_score
        scored_list.sort(key=lambda x: x["priority_score"], reverse=True)

        # Assign rank
        for idx, item in enumerate(scored_list, 1):
            item["rank"] = idx

        return scored_list
