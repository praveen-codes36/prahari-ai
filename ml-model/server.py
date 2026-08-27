from fastapi import FastAPI, File, UploadFile, Body
from fastapi.responses import JSONResponse
import uvicorn
from predict import detect_defect, predict_risk
from src.routing_integration import EmergencyRoutingEngine

engine = EmergencyRoutingEngine()
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
        
        if not start_lat or not start_lng:
            return JSONResponse(status_code=400, content={"error": "accident_location required"})
            
        result = engine.compute_emergency_route(
            start_lat=start_lat,
            start_lng=start_lng,
            dest_lat=dest_lat,
            dest_lng=dest_lng
        )
        
        # Format response to match expected frontend structure (from models.py structure)
        # fastest_route is ROUTE-A-DIRECT, safest_route is ROUTE-B-BYPASS
        direct_route = next((r for r in result["candidate_routes"] if "DIRECT" in r["route_id"]), result["candidate_routes"][0])
        bypass_route = next((r for r in result["candidate_routes"] if "BYPASS" in r["route_id"]), result["candidate_routes"][-1])
        
        formatted_result = {
            "recommended_route_type": "safest" if "BYPASS" in result["recommended_route_id"] else "fastest",
            "fastest_route_coords": [{"lat": c[0], "lng": c[1]} for c in direct_route["path_coordinates"]],
            "fastest_route_eta_mins": direct_route["eta_minutes"],
            "safest_route_coords": [{"lat": c[0], "lng": c[1]} for c in bypass_route["path_coordinates"]],
            "safest_route_eta_mins": bypass_route["eta_minutes"],
            "safest_route_pothole_count": bypass_route["pothole_defect_count"],
            "safest_route_avg_risk": bypass_route["average_risk_score"]
        }
        
        return JSONResponse(content=formatted_result)
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

if __name__ == "__main__":
    print("Starting Prahari AI ML Server on http://127.0.0.1:8000")
    uvicorn.run(app, host="127.0.0.1", port=8000)
