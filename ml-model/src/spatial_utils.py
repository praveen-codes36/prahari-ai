"""
Spatial Utilities & Geographic Bounds for Prayagraj, Uttar Pradesh (UP), India.
Part of RoadGuard AI - SIH Machine Learning Subsystem.
"""

import math
from typing import List, Tuple, Dict, Any, Optional
import numpy as np
from scipy.spatial import cKDTree

# Prayagraj Geographic Bounding Box (Urban and Peri-Urban Corridor)
PRAYAGRAJ_BOUNDS = {
    "min_lat": 25.3000,
    "max_lat": 25.5500,
    "min_lng": 81.7000,
    "max_lng": 82.0000,
    "center_lat": 25.4358,
    "center_lng": 81.8463,
}

# Major Key Geographic Clusters & Corridors in Prayagraj
PRAYAGRAJ_LANDMARKS = {
    "Civil Lines": {"lat": 25.4526, "lng": 81.8349, "type": "commercial_hub", "speed_limit": 40, "base_risk": 0.25},
    "MG Marg Corridor": {"lat": 25.4490, "lng": 81.8380, "type": "major_arterial", "speed_limit": 45, "base_risk": 0.35},
    "Sangam / Daraganj": {"lat": 25.4300, "lng": 81.8800, "type": "pilgrimage_zone", "speed_limit": 30, "base_risk": 0.40},
    "Naini Industrial Area": {"lat": 25.3850, "lng": 81.8650, "type": "industrial_heavy", "speed_limit": 50, "base_risk": 0.55},
    "Naini Old Bridge (Yamuna)": {"lat": 25.4180, "lng": 81.8550, "type": "bridge", "speed_limit": 35, "base_risk": 0.50},
    "Shastri Bridge (Ganga)": {"lat": 25.4390, "lng": 81.8900, "type": "bridge", "speed_limit": 50, "base_risk": 0.48},
    "Curzon Bridge / Phaphamau": {"lat": 25.5120, "lng": 81.8580, "type": "bridge_arterial", "speed_limit": 50, "base_risk": 0.52},
    "Phaphamau NH-19 Junction": {"lat": 25.5250, "lng": 81.8650, "type": "national_highway", "speed_limit": 70, "base_risk": 0.60},
    "Katra / Allahabad Univ": {"lat": 25.4600, "lng": 81.8550, "type": "institutional", "speed_limit": 30, "base_risk": 0.28},
    "Georgetown": {"lat": 25.4450, "lng": 81.8590, "type": "residential_arterial", "speed_limit": 35, "base_risk": 0.22},
    "Kareli Urban Zone": {"lat": 25.4200, "lng": 81.8200, "type": "dense_urban", "speed_limit": 30, "base_risk": 0.38},
    "Jhalwa / IIIT-A Corridor": {"lat": 25.4280, "lng": 81.7700, "type": "suburban_arterial", "speed_limit": 45, "base_risk": 0.30},
    "Teliyarganj / MNNIT Area": {"lat": 25.4920, "lng": 81.8630, "type": "educational_arterial", "speed_limit": 40, "base_risk": 0.32},
    "GT Road / Bamrauli Corridor": {"lat": 25.4500, "lng": 81.7400, "type": "national_highway", "speed_limit": 65, "base_risk": 0.58},
    "NH-19 Bypass (Varanasi-Kanpur)": {"lat": 25.5100, "lng": 81.9300, "type": "national_highway", "speed_limit": 80, "base_risk": 0.65},
    "Rambagh Railway Station Area": {"lat": 25.4395, "lng": 81.8480, "type": "transport_hub", "speed_limit": 30, "base_risk": 0.42},
    "Prayagraj Junction (Civil Lines side)": {"lat": 25.4470, "lng": 81.8280, "type": "transport_hub", "speed_limit": 25, "base_risk": 0.36},
}


def haversine_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """
    Calculate the great-circle distance between two points in meters using the Haversine formula.
    """
    r_earth = 6371000.0  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lng2 - lng1)

    a = math.sin(delta_phi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return r_earth * c


def latlng_to_cartesian_meters(lat: float, lng: float, ref_lat: float = PRAYAGRAJ_BOUNDS["center_lat"],
                                ref_lng: float = PRAYAGRAJ_BOUNDS["center_lng"]) -> Tuple[float, float]:
    """
    Convert (lat, lng) to local Cartesian metric offset (x_m, y_m) relative to a reference center.
    Accurate for local city-scale spatial indexing (<50 km).
    """
    meters_per_deg_lat = 111132.954
    meters_per_deg_lng = 111412.84 * math.cos(math.radians(ref_lat))

    y_m = (lat - ref_lat) * meters_per_deg_lat
    x_m = (lng - ref_lng) * meters_per_deg_lng
    return x_m, y_m


class DefectSpatialIndex:
    """
    High-performance KDTree spatial index for live citizen defect reports.
    Enables sub-millisecond radius searches to implement the Live Incident Feedback Link.
    """

    def __init__(self, defect_records: Optional[List[Dict[str, Any]]] = None):
        self.defect_records = []
        self.tree: Optional[cKDTree] = None
        self.coords_xy: Optional[np.ndarray] = None
        if defect_records:
            self.build_index(defect_records)

    def build_index(self, defect_records: List[Dict[str, Any]]):
        self.defect_records = list(defect_records)
        if not defect_records:
            self.tree = None
            self.coords_xy = None
            return

        points = []
        for d in defect_records:
            x, y = latlng_to_cartesian_meters(float(d["lat"]), float(d["lng"]))
            points.append([x, y])

        self.coords_xy = np.array(points, dtype=np.float64)
        self.tree = cKDTree(self.coords_xy)

    def count_defects_in_radius(self, lat: float, lng: float, radius_meters: float = 500.0) -> Tuple[int, float]:
        """
        Query the count and weighted severity of active defects within radius_meters.
        Returns:
            (defect_count, weighted_severity_score)
        """
        if self.tree is None or len(self.defect_records) == 0:
            return 0, 0.0

        qx, qy = latlng_to_cartesian_meters(lat, lng)
        indices = self.tree.query_ball_point([qx, qy], r=radius_meters)

        if not indices:
            return 0, 0.0

        defect_count = len(indices)
        severity_weights = {"Low": 1.0, "Moderate": 2.0, "High": 3.0, "Critical": 4.0}
        defect_type_weights = {
            "Pothole": 3.5,
            "Drainage Issues": 3.0,
            "Streetlight Defect": 2.0,
            "Garbage Accumulation": 1.5,
        }

        total_severity = 0.0
        for idx in indices:
            rec = self.defect_records[idx]
            s_weight = severity_weights.get(rec.get("severity", "Moderate"), 2.0)
            t_weight = defect_type_weights.get(rec.get("defect_type", "Pothole"), 2.5)
            total_severity += s_weight * t_weight

        # Normalized defect severity index (0.0 to 10.0 scale)
        weighted_index = round(min(10.0, total_severity / 2.0), 3)
        return defect_count, weighted_index

    def add_defect(self, defect_dict: Dict[str, Any]):
        """Dynamically ingest a new citizen defect report and rebuild the index."""
        self.defect_records.append(defect_dict)
        self.build_index(self.defect_records)


def is_within_prayagraj(lat: float, lng: float) -> bool:
    """Verify if a coordinate falls within the Prayagraj bounding box."""
    return (PRAYAGRAJ_BOUNDS["min_lat"] <= lat <= PRAYAGRAJ_BOUNDS["max_lat"] and
            PRAYAGRAJ_BOUNDS["min_lng"] <= lng <= PRAYAGRAJ_BOUNDS["max_lng"])
