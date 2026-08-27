"""
Comprehensive Automated Unit Test Suite for Prahari AI (All 10 Models & Services).
"""

import os
import sys
import unittest
from PIL import Image

current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(current_dir) if "tests" in current_dir else current_dir
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from predict import (
    detect_defect,
    estimate_severity,
    check_duplicate,
    predict_risk,
    predict_maintenance,
    calculate_health_score,
    calculate_repair_priority,
    rank_repair_backlog,
    get_emergency_route,
    compute_dynamic_edge_weight,
    query_authority_copilot,
    handle_citizen_message,
    ingest_defect
)
from src.spatial_utils import is_within_prayagraj, haversine_distance


class TestPrahariCompleteMLSuite(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.sample_img_dir = os.path.join(root_dir, "data", "sample_images")

    # 1. Test Defect Detection (Model 1)
    def test_01_detect_defect(self):
        pothole_path = os.path.join(self.sample_img_dir, "pothole.jpg")
        res = detect_defect(pothole_path)
        self.assertEqual(res["defect_type"], "Pothole")
        self.assertGreaterEqual(res["confidence_score"], 70.0)
        self.assertEqual(res["department_assigned"], "PWD_Road_Maintenance")
        self.assertIn("severity", res)

    # 2. Test Severity Estimation (Model 2)
    def test_02_estimate_severity(self):
        pothole_path = os.path.join(self.sample_img_dir, "pothole.jpg")
        res = estimate_severity(pothole_path, defect_type="Pothole")
        self.assertIn(res["severity"], ["LOW", "MEDIUM", "HIGH", "CRITICAL"])
        self.assertGreaterEqual(res["confidence_score"], 50.0)

    # 3. Test Duplicate Complaint Detector (Model 3)
    def test_03_check_duplicate_true_and_false(self):
        test_lat, test_lng = 25.4490, 81.8380
        existing = [
            {"id": "REP-PRG-EXISTING-01", "lat": 25.4491, "lng": 81.8381, "defect_type": "Pothole", "status": "In Progress"},
            {"id": "REP-PRG-EXISTING-02", "lat": 25.5100, "lng": 81.9300, "defect_type": "Pothole", "status": "In Progress"}
        ]
        # Complaint 15m away -> Duplicate
        res_dup = check_duplicate(test_lat, test_lng, defect_type="Pothole", existing_complaints=existing, geo_radius_meters=50.0)
        self.assertTrue(res_dup["is_duplicate"])
        self.assertEqual(res_dup["duplicate_of"], "REP-PRG-EXISTING-01")

        # Complaint far away -> Not duplicate
        res_non_dup = check_duplicate(25.3850, 81.8650, defect_type="Pothole", existing_complaints=existing, geo_radius_meters=50.0)
        self.assertFalse(res_non_dup["is_duplicate"])
        self.assertIsNone(res_non_dup["duplicate_of"])

    # 4. Test Accident Risk Prediction (Model 4)
    def test_04_predict_risk(self):
        res = predict_risk(lat=25.4526, lng=81.8349, road_type="Major Arterial", weather="Clear")
        self.assertIn("risk_score", res)
        self.assertIn("risk_score_100", res)
        self.assertIn(res["risk_level"], ["LOW", "MEDIUM", "HIGH", "CRITICAL"])
        self.assertIn("factors_breakdown", res)
        self.assertIn("infrastructure_defect_impact", res["factors_breakdown"])

    # 5. Test Predictive Maintenance Forecaster (Model 5)
    def test_05_predict_maintenance_30d(self):
        res = predict_maintenance(
            road_segment_id="SEG-MG-MARG-01",
            current_risk_score=35.0,
            recent_complaint_velocity=4.0,
            recent_traffic_trend=1.2,
            time_since_last_repair_days=120,
            is_monsoon_season=True
        )
        self.assertEqual(res["road_segment_id"], "SEG-MG-MARG-01")
        self.assertGreater(res["predicted_risk_score_30d"], res["current_risk_score"])
        self.assertGreater(res["risk_delta"], 0.0)
        self.assertTrue(len(res["reasoning"]) > 0)
        self.assertIn(res["degradation_velocity"], ["MODERATE_DEGRADATION", "RAPID_DETERIORATION", "CRITICAL_FAILURE_IMMINENT"])

    # 6. Test Road Health Score Model (Model 6)
    def test_06_calculate_health_score(self):
        res_good = calculate_health_score("SEG-CIVIL-LINES-01", active_potholes=0, accident_history_count=0, surface_quality_index=9.5)
        self.assertGreaterEqual(res_good["health_score"], 80.0)
        self.assertIn(res_good["health_tier"], ["EXCELLENT", "GOOD"])

        res_bad = calculate_health_score("SEG-NAINI-02", active_potholes=4, accident_history_count=3, active_drainage_defects=2, drainage_functional=False, surface_quality_index=3.0)
        self.assertLess(res_bad["health_score"], 50.0)
        self.assertIn(res_bad["health_tier"], ["POOR", "CRITICAL"])
        self.assertIn("factors_breakdown", res_bad)

    # 7. Test AI Repair Priority Ranking (Model 7)
    def test_07_repair_priority_ranking(self):
        tickets = [
            {"id": "TICKET-1", "defect_type": "Pothole", "severity": "LOW", "risk_score": 0.20, "traffic_volume_daily": 5000, "days_open": 1},
            {"id": "TICKET-2", "defect_type": "Pothole", "severity": "CRITICAL", "risk_score": 0.85, "traffic_volume_daily": 45000, "days_open": 10},
        ]
        ranked = rank_repair_backlog(tickets)
        self.assertEqual(ranked[0]["id"], "TICKET-2")  # Critical should be ranked #1
        self.assertEqual(ranked[0]["rank"], 1)
        self.assertEqual(ranked[1]["rank"], 2)
        self.assertGreater(ranked[0]["priority_score"], ranked[1]["priority_score"])

    # 8. Test Emergency Intelligent Routing (Model 8)
    def test_08_emergency_routing(self):
        res = get_emergency_route(start_lat=25.4526, start_lng=81.8349)
        self.assertIn("recommended_route", res)
        self.assertIn("candidate_routes", res)
        self.assertIn("nearest_hospitals", res)
        self.assertGreaterEqual(len(res["nearest_hospitals"]), 1)
        self.assertTrue(len(res["recommended_route"]["path_coordinates"]) >= 2)

    # 9. Test AI Authority Copilot (Model 9)
    def test_09_authority_copilot(self):
        res_priority = query_authority_copilot("Which roads need immediate repair?")
        self.assertEqual(res_priority["response_type"], "RANKED_LIST")
        self.assertTrue(len(res_priority["grounded_facts"]) > 0)
        self.assertIn("recommended_actions", res_priority)

        res_why = query_authority_copilot("Why is this road high risk?")
        self.assertEqual(res_why["response_type"], "EXPLANATION")

    # 10. Test Citizen AI Chatbot Engine (Model 10)
    def test_10_citizen_chatbot(self):
        # Reporting intent
        res_report = handle_citizen_message("There is a large dangerous pothole near Civil Lines on MG Marg")
        self.assertEqual(res_report["detected_intent"], "REPORT_DEFECT")
        self.assertTrue(len(res_report["triggered_actions"]) > 0)
        self.assertEqual(res_report["triggered_actions"][0]["action"], "CREATE_COMPLAINT_TICKET")

        # Status tracking intent
        res_status = handle_citizen_message("What is the status of my ticket REP-PRG-10452?")
        self.assertEqual(res_status["detected_intent"], "CHECK_STATUS")
        self.assertEqual(res_status["triggered_actions"][0]["parameters"]["complaint_id"], "REP-PRG-10452")

    # 11. Test Closed-Loop Live Feedback Link
    def test_11_closed_loop_feedback(self):
        test_lat, test_lng = 25.4600, 81.8200
        before = predict_risk(lat=test_lat, lng=test_lng)["risk_score"]
        ingest_defect(lat=test_lat, lng=test_lng, defect_type="Pothole", severity="Critical")
        after = predict_risk(lat=test_lat, lng=test_lng)["risk_score"]
        self.assertGreater(after, before)

    # 12. Test Prayagraj Geobounds
    def test_12_geobounds(self):
        self.assertTrue(is_within_prayagraj(25.4358, 81.8463))
        self.assertFalse(is_within_prayagraj(28.6139, 77.2090))


if __name__ == "__main__":
    unittest.main(verbosity=2)
