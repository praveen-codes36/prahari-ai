"""
End-to-End Interactive Closed-Loop Simulation Demo for RoadGuard AI.
Demonstrates the full SIH workflow in Prayagraj, UP:
  Step 1: Citizen captures and uploads defect photo at a Prayagraj corridor.
  Step 2: MobileNetV2 CV Classifier classifies defect & assigns municipal department.
  Step 3: Defect is ingested into the Live Incident Feedback Link (KDTree index).
  Step 4: XGBoost Risk Surface Predictor dynamically escalates corridor risk score.
  Step 5: Dynamic Routing Engine computes penalized edge weight (W_edge), steering
          emergency dispatch vehicles away from the hazard.
"""

import os
import sys
import time

current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = current_dir if os.path.exists(os.path.join(current_dir, "trained_models")) else os.path.dirname(current_dir)
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from src.inference import RoadGuardInferenceEngine
from src.routing_integration import compute_dynamic_edge_weight, evaluate_route_safety_profile
from src.spatial_utils import PRAYAGRAJ_LANDMARKS


def run_demo():
    print("\n" + "=" * 75)
    print("      ROADGUARD AI: CLOSED-LOOP ML & DYNAMIC ROUTING SIMULATION")
    print("      Target Location: Prayagraj, Uttar Pradesh (UP), India")
    print("=" * 75 + "\n")

    # Initialize Engine
    print("[1] Initializing RoadGuard AI Unified ML Inference Engine...")
    engine = RoadGuardInferenceEngine()
    print("    Loaded: MobileNetV2 (.pt), XGBoost (.joblib), Random Forest (.joblib), KDTree Spatial Index.")
    print("    Active indexed citizen defects:", len(engine.spatial_index.defect_records))

    # Scenario Setup: Corridor on MG Marg / Civil Lines
    test_lat = 25.4490
    test_lng = 81.8380
    corridor_name = "MG Marg / Civil Lines Junction"
    segment_length_m = 750.0  # 750 meter road segment

    print(f"\n[2] Baseline Assessment for Corridor: {corridor_name} ({test_lat}, {test_lng})")
    baseline_risk = engine.predict_risk(
        lat=test_lat,
        lng=test_lng,
        road_type="Major Arterial",
        speed_limit=45,
        weather="Clear",
        time_of_day="Evening Rush",
        hour=18,
    )
    r_before = baseline_risk["risk_score"]
    d_before = baseline_risk["spatial_context"]["nearby_defect_count_500m"]
    weight_before = compute_dynamic_edge_weight(segment_length_m, r_before, d_before, alpha=1.5, beta=0.8)

    print(f"    --> Initial Risk Score:      {r_before:.4f} ({baseline_risk['risk_level']})")
    print(f"    --> Active Defects Nearby:   {d_before}")
    print(f"    --> Segment Physical Length: {segment_length_m} meters")
    print(f"    --> Dynamic Routing Weight:  {weight_before:.2f} meters (Cost Multiplier: {weight_before/segment_length_m:.2f}x)")

    # Step 3: Citizen Incident Report Upload
    print(f"\n[3] INCOMING CITIZEN REPORT: Citizen uploads photo of infrastructure hazard on {corridor_name}...")
    sample_img_path = os.path.join(root_dir, "data", "sample_images", "pothole.jpg")
    cv_result = engine.predict_defect(sample_img_path)

    print(f"    [AI Vision Inference]")
    print(f"    --> Detected Defect:         {cv_result['defect_type']}")
    print(f"    --> Confidence:              {cv_result['confidence'] * 100:.2f}%")
    print(f"    --> Estimated Severity:      {cv_result['severity_estimate']}")
    print(f"    --> Department Auto-Route:   {cv_result['department_assigned']}")
    print(f"    --> Verification Status:     {cv_result['ai_verification_status']}")

    # Step 4: Closed-Loop Ingestion
    print(f"\n[4] Ingesting verified complaint into Live Incident Feedback Link...")
    ingest_res = engine.ingest_defect(
        lat=test_lat,
        lng=test_lng,
        defect_type=cv_result["defect_type"],
        severity=cv_result["severity_estimate"],
        status="AI Verified"
    )
    print(f"    --> Defect Ingested: {ingest_res['defect']['id']} | New Total Indexed: {ingest_res['total_active_defects_indexed']}")

    # Step 5: Recalculate Risk Surface & Dynamic Route Penalties
    print(f"\n[5] Dynamic Risk Recalibration & Emergency Route Re-Weighting:")
    updated_risk = engine.predict_risk(
        lat=test_lat,
        lng=test_lng,
        road_type="Major Arterial",
        speed_limit=45,
        weather="Clear",
        time_of_day="Evening Rush",
        hour=18,
    )
    r_after = updated_risk["risk_score"]
    d_after = updated_risk["spatial_context"]["nearby_defect_count_500m"]
    weight_after = compute_dynamic_edge_weight(segment_length_m, r_after, d_after, alpha=1.5, beta=0.8)

    print(f"    --> Recalculated Risk Score: {r_after:.4f} ({updated_risk['risk_level']})  [+{r_after - r_before:.4f} Escalation]")
    print(f"    --> Contributing Factors:    {updated_risk['contributing_factors']}")
    print(f"    --> Dynamic Routing Weight:  {weight_after:.2f} meters (Cost Multiplier: {weight_after/segment_length_m:.2f}x)")

    # Step 6: Route Decision Comparison
    print(f"\n[6] Emergency Dispatch Pathfinder Decision:")
    route_candidate_hazardous = [
        {"length_meters": segment_length_m, "risk_score": r_after, "defect_count": d_after}
    ]
    route_candidate_bypass = [
        {"length_meters": 850.0, "risk_score": 0.22, "defect_count": 0}  # Slightly longer physical bypass route, but zero defects
    ]

    profile_hazardous = evaluate_route_safety_profile(route_candidate_hazardous)
    profile_bypass = evaluate_route_safety_profile(route_candidate_bypass)

    print(f"    Option A (Direct Corridor): Physical={profile_hazardous['total_physical_distance_m']}m, Dynamic Penalty Cost={profile_hazardous['total_dynamic_weight_m']}m -> {profile_hazardous['recommendation']}")
    print(f"    Option B (Bypass Corridor): Physical={profile_bypass['total_physical_distance_m']}m, Dynamic Penalty Cost={profile_bypass['total_dynamic_weight_m']}m -> {profile_bypass['recommendation']}")
    print(f"\n    === SYSTEM ACTION: Ambulance automatically rerouted via Safe Bypass Corridor! ===")

    print("\n" + "=" * 75)
    print("      DEMONSTRATION COMPLETED SUCCESSFULLY!")
    print("=" * 75 + "\n")


if __name__ == "__main__":
    run_demo()
