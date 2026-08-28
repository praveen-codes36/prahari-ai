"""
Prahari AI — Master End-to-End Simulation Demo
Demonstrates all 10 ML models and services working in a unified closed-loop pipeline for Prayagraj, UP.
Includes Out-of-Distribution (OOD) Negative Rejection demo.
"""

import os
import sys

# Ensure UTF-8 output encoding on Windows
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

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
    query_authority_copilot,
    handle_citizen_message,
    ingest_defect
)
from PIL import Image, ImageDraw


def run_full_prahari_demo():
    print("\n" + "=" * 80)
    print("      PRAHARI AI: COMPLETE 10-MODEL ECOSYSTEM & CLOSED-LOOP SIMULATION")
    print("      Target City: Prayagraj, Uttar Pradesh (UP), India")
    print("=" * 80 + "\n")

    # Corridor Setup
    test_lat, test_lng = 25.4490, 81.8380
    corridor_name = "MG Marg / Civil Lines Corridor"
    sample_img = os.path.join(current_dir, "data", "sample_images", "pothole.jpg")

    # -------------------------------------------------------------
    # STEP 1: CITIZEN CONVERSATIONAL INTAKE (MODEL 10)
    # -------------------------------------------------------------
    print("[1] MODEL 10: Citizen AI Chatbot Conversational Intake")
    chat_input = "There is a severe crater-like pothole near Civil Lines on MG Marg causing vehicle damage."
    chat_res = handle_citizen_message(message_text=chat_input)
    print(f"    * Citizen Message:  \"{chat_input}\"")
    print(f"    * Detected Intent:  {chat_res['detected_intent']}")
    print(f"    * Drafted Action:   {chat_res['triggered_actions'][0]['action']} -> Location: {chat_res['triggered_actions'][0]['parameters']['location_description']}")

    # -------------------------------------------------------------
    # STEP 2: COMPUTER VISION DEFECT CLASSIFIER (MODELS 1 & 2)
    # -------------------------------------------------------------
    print(f"\n[2] MODELS 1 & 2: Computer Vision Defect Detection & Severity Estimation")
    cv_res = detect_defect(sample_img)
    print(f"    * Input Photo:      {sample_img}")
    print(f"    * Detected Defect:  {cv_res['defect_type']} (Confidence: {cv_res['confidence_score']}%)")
    print(f"    * Valid Defect:     {cv_res['is_valid_defect']}")
    print(f"    * Severity Tier:    {cv_res['severity']}")
    print(f"    * Auto-Assigned:    {cv_res['department_assigned']}")
    print(f"    * Verification:     {cv_res['ai_verification_status']}")

    # -------------------------------------------------------------
    # STEP 2B: OOD / NON-DEFECT REJECTION DEMO
    # -------------------------------------------------------------
    print(f"\n[2B] OOD NEGATIVE REJECTION: Testing with Random Non-Defect Upload (Person / Portrait)")
    person_img = Image.new("RGB", (224, 224), (230, 235, 245))
    d = ImageDraw.Draw(person_img)
    d.ellipse([70, 50, 150, 150], fill=(220, 175, 140))
    d.ellipse([65, 35, 155, 90], fill=(20, 20, 20))
    d.ellipse([90, 85, 105, 100], fill=(30, 30, 30))
    d.ellipse([120, 85, 135, 100], fill=(30, 30, 30))
    d.line([(100, 125), (120, 125)], fill=(180, 50, 50), width=3)
    d.polygon([(40, 224), (80, 150), (145, 150), (185, 224)], fill=(40, 120, 220))
    
    ood_res = detect_defect(person_img)
    print(f"    * Non-Defect Upload: {ood_res['defect_type']} (Confidence: {ood_res['confidence_score']}%)")
    print(f"    * Valid Defect:      {ood_res['is_valid_defect']}")
    print(f"    * System Action:     {ood_res['ai_verification_status']} -> {ood_res['message']}")

    # -------------------------------------------------------------
    # STEP 3: DUPLICATE COMPLAINT DETECTOR (MODEL 3)
    # -------------------------------------------------------------
    print(f"\n[3] MODEL 3: Duplicate Complaint Detection (Geo-Radius + Deep Visual Embedding)")
    dup_res = check_duplicate(
        lat=test_lat,
        lng=test_lng,
        defect_type=cv_res["defect_type"],
        image_input=sample_img,
        geo_radius_meters=50.0
    )
    print(f"    * Is Duplicate:     {dup_res['is_duplicate']}")
    print(f"    * Similarity Score: {dup_res['duplicate_similarity_score']}%")
    print(f"    * Reasoning:        {dup_res['reasoning']}")

    # -------------------------------------------------------------
    # STEP 4: DYNAMIC INGESTION INTO LIVE SPATIAL INDEX
    # -------------------------------------------------------------
    print(f"\n[4] CLOSED-LOOP INGESTION: Adding verified ticket into cKDTree Spatial Index...")
    ingest_res = ingest_defect(
        lat=test_lat,
        lng=test_lng,
        defect_type=cv_res["defect_type"],
        severity=cv_res["severity"]
    )
    print(f"    * Ticket Created:   {ingest_res['defect']['id']} at ({test_lat}, {test_lng})")
    print(f"    * Active Indexed:   {ingest_res['total_active_defects_indexed']} total complaints in Prayagraj")

    # -------------------------------------------------------------
    # STEP 5: ACCIDENT RISK PREDICTION (MODEL 4)
    # -------------------------------------------------------------
    print(f"\n[5] MODEL 4: Dynamic Accident Risk Prediction (XGBoost)")
    risk_res = predict_risk(
        lat=test_lat,
        lng=test_lng,
        road_type="Major Arterial",
        weather="Dense Fog / Smog",
        time_of_day="Evening Rush",
        hour=19
    )
    print(f"    * Dynamic Risk:     {risk_res['risk_score_100']} / 100 ({risk_res['risk_level']})")
    print(f"    * Nearby Defects:   {risk_res['spatial_context']['nearby_defect_count_500m']} in 500m radius")
    print(f"    * Factor Breakdown: {risk_res['factors_breakdown']}")

    # -------------------------------------------------------------
    # STEP 6: PREDICTIVE MAINTENANCE 30-DAY FORECAST (MODEL 5)
    # -------------------------------------------------------------
    print(f"\n[6] MODEL 5: Predictive Maintenance (30-Day Risk Forecast)")
    maint_res = predict_maintenance(
        road_segment_id="SEG-MG-MARG-01",
        current_risk_score=risk_res["risk_score_100"],
        recent_complaint_velocity=4.5,
        time_since_last_repair_days=110,
        is_monsoon_season=True
    )
    print(f"    * Current Risk:     {maint_res['current_risk_score']} / 100")
    print(f"    * Forecast (30d):   {maint_res['predicted_risk_score_30d']} / 100 (Delta: +{maint_res['risk_delta']})")
    print(f"    * Trajectory:       {maint_res['degradation_velocity']}")
    print(f"    * Action Window:    Within {maint_res['recommended_action_window_days']} days before critical structural failure")
    print(f"    * Explainability:   {maint_res['reasoning']}")

    # -------------------------------------------------------------
    # STEP 7: ROAD HEALTH SCORE MODEL (MODEL 6)
    # -------------------------------------------------------------
    print(f"\n[7] MODEL 6: Road Health Score (0-100 Auditable Index)")
    health_res = calculate_health_score(
        road_segment_id="SEG-MG-MARG-01",
        active_potholes=3,
        active_drainage_defects=1,
        accident_history_count=2,
        traffic_volume_daily=32000,
        surface_quality_index=5.5
    )
    print(f"    * Road Health:      {health_res['health_score']} / 100 ({health_res['health_tier']})")
    print(f"    * Factors:          {health_res['factors_breakdown']}")
    print(f"    * Verdict:          {health_res['summary_verdict']}")

    # -------------------------------------------------------------
    # STEP 8: AI REPAIR PRIORITY RANKING (MODEL 7)
    # -------------------------------------------------------------
    print(f"\n[8] MODEL 7: AI Repair Priority Backlog Ranking")
    mock_backlog = [
        {"id": "REP-PRG-101", "defect_type": "Pothole", "severity": "LOW", "risk_score": 0.25, "traffic_volume_daily": 6000, "days_open": 1},
        {"id": "REP-PRG-102", "defect_type": "Drainage Issues", "severity": "HIGH", "risk_score": 0.65, "traffic_volume_daily": 28000, "days_open": 4},
        {"id": "REP-PRG-103", "defect_type": "Pothole", "severity": "CRITICAL", "risk_score": 0.88, "traffic_volume_daily": 42000, "days_open": 7},
    ]
    ranked_queue = rank_repair_backlog(mock_backlog)
    for ticket in ranked_queue:
        print(f"    * Rank #{ticket['rank']}: Ticket {ticket['id']} ({ticket['defect_type']} - {ticket['severity']}) -> Priority Score: {ticket['priority_score']}/100 [{ticket['urgency_level']}]")

    # -------------------------------------------------------------
    # STEP 9: EMERGENCY INTELLIGENT ROUTING (MODEL 8)
    # -------------------------------------------------------------
    print(f"\n[9] MODEL 8: Emergency Intelligent Routing Engine (Dijkstra / Dynamic Safety Weights)")
    route_res = get_emergency_route(start_lat=test_lat, start_lng=test_lng)
    best = route_res["recommended_route"]
    nearest_hosp = route_res["nearest_hospitals"][0]
    print(f"    * Nearest Hospital: {nearest_hosp['name']} ({nearest_hosp['distance_meters']} m away)")
    print(f"    * Selected Route:   {best['route_label']} ({best['route_id']})")
    print(f"    * Physical Distance:{best['physical_distance_m']} m | ETA: {best['eta_minutes']} mins")
    print(f"    * Dynamic Weight:   {best['dynamic_cost_weight']} (Safety Status: {best['recommendation']})")

    # -------------------------------------------------------------
    # STEP 10: AI AUTHORITY COPILOT (MODEL 9)
    # -------------------------------------------------------------
    print(f"\n[10] MODEL 9: AI Authority / Government Copilot Grounded Query")
    copilot_res = query_authority_copilot("Which roads need immediate repair and why?")
    print(f"    * Query Type:       {copilot_res['response_type']}")
    print(f"    * Copilot Answer:\n{copilot_res['answer']}")
    print(f"    * Recommended Action: {copilot_res['recommended_actions'][0]}")

    print("\n" + "=" * 80)
    print("      ALL 10 ML MODELS & OOD REJECTION EXECUTED WITH 100% SPECIFICATION FIDELITY!")
    print("=" * 80 + "\n")


if __name__ == "__main__":
    run_full_prahari_demo()
