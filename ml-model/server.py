from fastapi import FastAPI, File, UploadFile, Body
from fastapi.responses import JSONResponse
import uvicorn
from predict import detect_defect, predict_risk

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

if __name__ == "__main__":
    print("Starting Prahari AI ML Server on http://127.0.0.1:8000")
    uvicorn.run(app, host="127.0.0.1", port=8000)
