from fastapi import FastAPI, HTTPException
from contextlib import asynccontextmanager
from models import RouteRequest, RouteResponse
from routing_algorithm import calculate_routes
from graph_manager import graph_manager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load the graph on startup
    graph_manager.load_graph()
    yield
    # Clean up on shutdown if necessary

app = FastAPI(title="RoadGuard AI - Routing Engine", lifespan=lifespan)

@app.post("/route", response_model=RouteResponse)
async def get_emergency_route(request: RouteRequest):
    try:
        result = calculate_routes(request)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
