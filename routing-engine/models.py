from pydantic import BaseModel, Field
from typing import List, Optional

class Coordinates(BaseModel):
    lat: float
    lng: float

class PotholeOverlay(BaseModel):
    location: Coordinates
    severity: str  # LOW, MEDIUM, HIGH, CRITICAL

class BlockageOverlay(BaseModel):
    location: Coordinates
    reason: Optional[str] = None

class RiskZoneOverlay(BaseModel):
    location: Coordinates
    risk_score: int  # 0-100

class RouteRequest(BaseModel):
    accident_location: Coordinates
    hospital_location: Coordinates
    potholes: List[PotholeOverlay] = []
    blockages: List[BlockageOverlay] = []
    risk_zones: List[RiskZoneOverlay] = []

class RouteResponse(BaseModel):
    recommended_route_type: str  # 'safest' or 'fastest'
    fastest_route_coords: List[Coordinates]
    fastest_route_eta_mins: float
    safest_route_coords: List[Coordinates]
    safest_route_eta_mins: float
    safest_route_pothole_count: int
    safest_route_avg_risk: float
