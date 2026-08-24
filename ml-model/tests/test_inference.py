"""
Unit Tests for RoadGuard AI Machine Learning Subsystem.
Tests:
  1. Computer Vision Defect Classifier (Input handling, class probabilities, severity)
  2. Tabular Risk Predictor (Coordinates, temporal features, weather, risk scoring)
  3. Closed-Loop Feedback Link (Dynamic defect ingestion & risk escalation)
  4. Dynamic Routing Edge Weights (Formula verification)
  5. Spatial Index & Geographic Bounds (Prayagraj constraints)
"""

import os
import sys
import unittest
import numpy as np
from PIL import Image

current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(current_dir)
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from src.spatial_utils import (
    PRAYAGRAJ_BOUNDS,
    PRAYAGRAJ_LANDMARKS,
    haversine_distance,
    is_within_prayagraj,
    DefectSpatialIndex,
)
from src.inference import RoadGuardInferenceEngine, DEFECT_CLASSES
from src.routing_integration import compute_dynamic_edge_weight, evaluate_route_safety_profile


class TestRoadGuardML(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.engine = RoadGuardInferenceEngine()
        cls.sample_images_dir = os.path.join(root_dir, "data", "sample_images")

    def test_01_prayagraj_geobounds(self):
        """Test Prayagraj bounding box verification."""
        # Valid Prayagraj coordinates (Civil Lines & Sangam)
        self.assertTrue(is_within_prayagraj(25.4526, 81.8349))
        self.assertTrue(is_within_prayagraj(25.4300, 81.8800))

        # Outside Prayagraj (Lucknow / Delhi)
        self.assertFalse(is_within_prayagraj(26.8467, 80.9462))
        self.assertFalse(is_within_prayagraj(28.6139, 77.2090))

    def test_02_haversine_distance(self):
        """Test Haversine distance accuracy between known Prayagraj landmarks."""
        # Distance between Civil Lines and Sangam (~6.5 km)
        d = haversine_distance(25.4526, 81.8349, 25.4300, 81.8800)
        self.assertGreater(d, 4000.0)
        self.assertLess(d, 8000.0)

    def test_03_cv_defect_classifier_pothole(self):
        """Test defect classifier prediction on sample pothole image."""
        pothole_path = os.path.join(self.sample_images_dir, "pothole.jpg")
        if os.path.exists(pothole_path):
            result = self.engine.predict_defect(pothole_path)
            self.assertEqual(result["defect_type"], "Pothole")
            self.assertGreaterEqual(result["confidence"], 0.70)
            self.assertEqual(result["department_assigned"], "PWD_Road_Maintenance")
            self.assertIn("probabilities", result)

    def test_04_cv_defect_classifier_all_classes(self):
        """Test defect classification across all 4 target categories."""
        class_files = {
            "Pothole": "pothole.jpg",
            "Streetlight Defect": "streetlight_defect.jpg",
            "Garbage Accumulation": "garbage_accumulation.jpg",
            "Drainage Issues": "drainage_issue.jpg",
        }
        for expected_class, filename in class_files.items():
            filepath = os.path.join(self.sample_images_dir, filename)
            if os.path.exists(filepath):
                res = self.engine.predict_defect(filepath)
                self.assertEqual(res["defect_type"], expected_class)
                self.assertGreaterEqual(res["confidence"], 0.50)

    def test_05_risk_prediction_baseline(self):
        """Test accident risk prediction for standard Prayagraj corridor."""
        res = self.engine.predict_risk(
            lat=25.4526,
            lng=81.8349,
            road_type="Major Arterial",
            speed_limit=45,
            weather="Clear",
            time_of_day="Evening Rush",
            hour=19,
        )
        self.assertIn("risk_score", res)
        self.assertGreaterEqual(res["risk_score"], 0.0)
        self.assertLessEqual(res["risk_score"], 1.0)
        self.assertIn(res["risk_level"], ["Low", "Medium", "High", "Critical"])
        self.assertTrue(len(res["contributing_factors"]) > 0)

    def test_06_adverse_weather_elevates_risk(self):
        """Verify that adverse conditions (Dense Fog / Rain) increase predicted risk."""
        res_clear = self.engine.predict_risk(
            lat=25.5100, lng=81.9300, road_type="National Highway", speed_limit=80,
            weather="Clear", time_of_day="Afternoon Off-Peak", hour=14
        )
        res_fog = self.engine.predict_risk(
            lat=25.5100, lng=81.9300, road_type="National Highway", speed_limit=80,
            weather="Dense Fog / Smog", time_of_day="Late Night", hour=23
        )
        self.assertGreater(res_fog["risk_score"], res_clear["risk_score"])

    def test_07_closed_loop_feedback_link(self):
        """
        CRITICAL SIH TEST:
        Verify closed-loop feedback mechanism:
        When a new defect is reported at a coordinate, subsequent risk predictions
        at that exact location must dynamically escalate.
        """
        test_lat = 25.4700
        test_lng = 81.8200

        # Baseline risk before defect report
        before_res = self.engine.predict_risk(
            lat=test_lat, lng=test_lng, road_type="Major Arterial",
            speed_limit=45, weather="Clear", time_of_day="Afternoon Off-Peak", hour=14
        )
        before_score = before_res["risk_score"]

        # Citizen reports a severe pothole at test coordinate
        ingest_res = self.engine.ingest_defect(
            lat=test_lat, lng=test_lng, defect_type="Pothole", severity="Critical"
        )
        self.assertIn("defect", ingest_res)

        # Recalculate risk immediately after defect ingestion
        after_res = self.engine.predict_risk(
            lat=test_lat, lng=test_lng, road_type="Major Arterial",
            speed_limit=45, weather="Clear", time_of_day="Afternoon Off-Peak", hour=14
        )
        after_score = after_res["risk_score"]

        # Verify dynamic escalation
        self.assertGreater(after_score, before_score,
                           f"Expected risk score to increase from {before_score}, got {after_score}")
        self.assertGreaterEqual(after_res["spatial_context"]["nearby_defect_count_500m"], 1)

    def test_08_dynamic_edge_weight_formula(self):
        """
        Verify Person 4 formula: W_edge = d * (1 + alpha * R + beta * D)
        """
        d = 1000.0  # 1 km physical road segment
        R = 0.50    # ML risk score
        D = 3       # 3 active defects
        alpha = 1.5
        beta = 0.8

        expected_w = 1000.0 * (1.0 + (1.5 * 0.50) + (0.8 * 3))  # 1000 * (1 + 0.75 + 2.4) = 4150.0
        computed_w = compute_dynamic_edge_weight(d, R, D, alpha=alpha, beta=beta)
        self.assertAlmostEqual(computed_w, expected_w, places=2)

    def test_09_route_safety_profile_evaluation(self):
        """Test full route risk evaluation wrapper for emergency dispatch."""
        segments = [
            {"length_meters": 400.0, "risk_score": 0.20, "defect_count": 0},
            {"length_meters": 600.0, "risk_score": 0.85, "defect_count": 2},
        ]
        profile = evaluate_route_safety_profile(segments, alpha=1.5, beta=0.8)
        self.assertEqual(profile["total_physical_distance_m"], 1000.0)
        self.assertGreater(profile["total_dynamic_weight_m"], 1000.0)
        self.assertEqual(profile["recommendation"], "REROUTE_RECOMMENDED")


if __name__ == "__main__":
    unittest.main(verbosity=2)
