from fastapi import FastAPI, File, UploadFile, Body
from fastapi.responses import JSONResponse
import uvicorn
from predict import detect_defect, predict_risk
from src.routing_integration import EmergencyRoutingEngine
from src.predictive_maintenance import PredictiveMaintenanceForecaster
from src.road_health import RoadHealthScoreModel
from src.repair_priority import RepairPriorityRankingModel
from src.copilot_engine import AuthorityCopilotEngine

engine = EmergencyRoutingEngine()
pm_engine = PredictiveMaintenanceForecaster()
rh_engine = RoadHealthScoreModel()
rp_engine = RepairPriorityRankingModel()
copilot = AuthorityCopilotEngine()
app = FastAPI(
    title="Prahari AI ML Server",
    description="FastAPI server for RoadGuard/Prahari AI Machine Learning Models",
    version="1.0"
)

@app.post("/predict")
async def predict_defect_api(file: UploadFile = File(...)):
    """
    Exposes Service 1 & 2: Defect Detection & Severity Estimation.
    Used by the Node.js backend.
    """
    try:
        # Read image bytes
        image_bytes = await file.read()
        
        # Call the machine learning function from predict.py
        result = detect_defect(image_bytes)
        
        return JSONResponse(content=result)
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/verify_repair")
async def verify_repair_api(file: UploadFile = File(...)):
    """
    Feeds: POST /api/complaints/:id/verify (Node.js backend).
    Runs the after-repair photo back through the defect classifier. If the
    model no longer sees a strong defect signal, the repair is considered verified.
    """
    try:
        image_bytes = await file.read()
        result = detect_defect(image_bytes)
        residual_confidence = result.get("confidence_score", 0)
        repaired = residual_confidence < 40  # low residual defect confidence => surface looks clear

        return JSONResponse(content={
            "repaired": repaired,
            "residual_defect_type": result.get("defect_type"),
            "residual_confidence": residual_confidence,
            "message": (
                "Repair verified: no significant defect detected on re-scan."
                if repaired else
                f"Defect still detected ({result.get('defect_type')}, {residual_confidence}% confidence) — sending to inspection queue."
            )
        })
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/predict_risk")
async def predict_risk_api(payload: dict = Body(...)):
    """
    Exposes Service 4: Accident Risk Prediction Model.
    """
    try:
        result = predict_risk(
            lat=payload.get("lat", 25.4358),
            lng=payload.get("lng", 81.8463),
            weather=payload.get("weather", "Clear"),
            traffic_density=payload.get("traffic_density", "Moderate"),
            nearby_defect_count=payload.get("nearby_defect_count", 0),
            defect_severity_index=payload.get("defect_severity_index", 0.0)
        )
        return JSONResponse(content=result)
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/route")
async def get_emergency_route(payload: dict = Body(...)):
    """
    Exposes Service 8: Emergency Intelligent Routing Engine.
    """
    try:
        acc_loc = payload.get("accident_location", {})
        hosp_loc = payload.get("hospital_location", {})
        
        start_lat = acc_loc.get("lat")
        start_lng = acc_loc.get("lng")
        dest_lat = hosp_loc.get("lat")
        dest_lng = hosp_loc.get("lng")
        
        osrm_routes = payload.get("osrm_routes", None)
        potholes = payload.get("potholes", [])
        blockages = payload.get("blockages", [])
        
        if not start_lat or not start_lng:
            return JSONResponse(status_code=400, content={"error": "accident_location required"})
            
        result = engine.compute_emergency_route(
            start_lat=start_lat,
            start_lng=start_lng,
            dest_lat=dest_lat,
            dest_lng=dest_lng,
            osrm_routes=osrm_routes,
            potholes=potholes,
            blockages=blockages
        )
        
        # Format response to match expected frontend structure (from models.py structure)
        # fastest_route is ROUTE-A-DIRECT, safest_route is ROUTE-B-BYPASS
        direct_route = next((r for r in result["candidate_routes"] if "DIRECT" in r["route_id"]), result["candidate_routes"][0])
        bypass_route = next((r for r in result["candidate_routes"] if "BYPASS" in r["route_id"]), result["candidate_routes"][-1])

        def format_coords(coords):
            if not coords: return []
            if isinstance(coords[0], dict): return coords
            return [{"lat": c[0], "lng": c[1]} for c in coords]

        formatted_result = {
            "recommended_route_type": "safest" if "BYPASS" in result["recommended_route_id"] else "fastest",
            "fastest_route_coords": format_coords(direct_route["path_coordinates"]),
            "fastest_route_eta_mins": direct_route["eta_minutes"],
            "fastest_route_distance": direct_route.get("physical_distance_m", 0) / 1000.0,
            "safest_route_coords": format_coords(bypass_route["path_coordinates"]),
            "safest_route_eta_mins": bypass_route["eta_minutes"],
            "safest_route_distance": bypass_route.get("physical_distance_m", 0) / 1000.0,
            "safest_route_pothole_count": bypass_route["pothole_defect_count"],
            "safest_route_avg_risk": bypass_route["average_risk_score"]
        }
        
        return JSONResponse(content=formatted_result)
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/predict_maintenance")
async def predict_maintenance_api(payload: dict = Body(...)):
    try:
        res = pm_engine.predict_maintenance(
            road_segment_id=payload.get("road_segment_id", "UNKNOWN"),
            current_risk_score=payload.get("current_risk_score", 50.0),
            recent_complaint_velocity=payload.get("recent_complaint_velocity", 1.0),
            recent_traffic_trend=payload.get("recent_traffic_trend", 1.0),
            time_since_last_repair_days=payload.get("time_since_last_repair_days", 90),
            is_monsoon_season=payload.get("is_monsoon_season", False),
            road_type=payload.get("road_type", "Major Arterial")
        )
        return JSONResponse(content=res)
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/calculate_health")
async def calculate_health_api(payload: dict = Body(...)):
    try:
        res = rh_engine.calculate_health_score(
            road_segment_id=payload.get("road_segment_id", "UNKNOWN"),
            accident_history_count=payload.get("accident_history_count", 0),
            active_potholes=payload.get("active_potholes", 0),
            active_streetlight_defects=payload.get("active_streetlight_defects", 0),
            active_garbage_defects=payload.get("active_garbage_defects", 0),
            active_drainage_defects=payload.get("active_drainage_defects", 0),
            traffic_volume_daily=payload.get("traffic_volume_daily", 15000),
            lighting_coverage_pct=payload.get("lighting_coverage_pct", 85.0),
            drainage_functional=payload.get("drainage_functional", True),
            surface_quality_index=payload.get("surface_quality_index", 8.0)
        )
        return JSONResponse(content=res)
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/calculate_priority")
async def calculate_priority_api(payload: dict = Body(...)):
    try:
        res = rp_engine.calculate_priority(
            complaint_id=payload.get("complaint_id", "UNKNOWN"),
            defect_type=payload.get("defect_type", "Pothole"),
            severity=payload.get("severity", "HIGH"),
            road_segment_risk_score=payload.get("road_segment_risk_score", 0.50),
            accident_history_count=payload.get("accident_history_count", 0),
            traffic_volume_daily=payload.get("traffic_volume_daily", 20000),
            population_density=payload.get("population_density", "High"),
            days_open=payload.get("days_open", 3)
        )
        return JSONResponse(content=res)
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/copilot/query")
async def copilot_query_api(payload: dict = Body(...)):
    try:
        res = copilot.query(
            user_query=payload.get("query", ""),
            retrieved_data=payload.get("retrieved_data", None)
        )
        return JSONResponse(content=res)
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

if __name__ == "__main__":
    print("Starting Prahari AI ML Server on http://127.0.0.1:8000")
    uvicorn.run(app, host="127.0.0.1", port=8000)
