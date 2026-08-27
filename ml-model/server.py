from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
import uvicorn
from predict import detect_defect

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

if __name__ == "__main__":
    print("Starting Prahari AI ML Server on http://127.0.0.1:8000")
    uvicorn.run(app, host="127.0.0.1", port=8000)
