"""
Dataset Generator for Prayagraj, Uttar Pradesh (UP), India.
Generates realistic historical accident data, live citizen defect records,
risk grid GeoJSON, and sample defect images for model training and verification.
"""

import os
import sys
import json
import random
from typing import Dict, Any, List, Optional, Tuple
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from PIL import Image, ImageDraw, ImageFilter

current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(current_dir)
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from src.spatial_utils import (
    PRAYAGRAJ_BOUNDS,
    PRAYAGRAJ_LANDMARKS,
    DefectSpatialIndex,
    latlng_to_cartesian_meters,
)

# Seed for reproducibility
np.random.seed(42)
random.seed(42)

ROAD_TYPES = [
    "National Highway",
    "State Highway",
    "Major Arterial",
    "Dense Urban Street",
    "Suburban Arterial",
    "Bridge / Flyover",
    "Local Residential",
]

WEATHER_CONDITIONS = ["Clear", "Rain", "Dense Fog / Smog", "Monsoon Overcast", "Dust Storm"]

DEFECT_TYPES = ["Pothole", "Streetlight Defect", "Garbage Accumulation", "Drainage Issues"]

DEPARTMENTS = {
    "Pothole": "PWD_Road_Maintenance",
    "Streetlight Defect": "UPPCL_Streetlight_Cell",
    "Garbage Accumulation": "Prayagraj_Nagar_Nigam_Sanitation",
    "Drainage Issues": "Jal_Sansthan_Drainage_Div",
}

DEFECT_SEVERITIES = ["Low", "Moderate", "High", "Critical"]


def generate_defects_dataset(num_records: int = 1500, output_path: str = "data/prayagraj_defects_database.csv") -> pd.DataFrame:
    """Generate citizen defect reports across Prayagraj clusters."""
    landmarks_list = list(PRAYAGRAJ_LANDMARKS.items())
    records = []
    base_time = datetime(2026, 1, 1, 8, 0, 0)

    for i in range(num_records):
        name, lm = random.choice(landmarks_list)
        lat_jitter = float(np.random.normal(0, 0.008))
        lng_jitter = float(np.random.normal(0, 0.008))

        lat = float(np.clip(lm["lat"] + lat_jitter, PRAYAGRAJ_BOUNDS["min_lat"], PRAYAGRAJ_BOUNDS["max_lat"]))
        lng = float(np.clip(lm["lng"] + lng_jitter, PRAYAGRAJ_BOUNDS["min_lng"], PRAYAGRAJ_BOUNDS["max_lng"]))

        defect_type = random.choices(
            DEFECT_TYPES,
            weights=[0.42, 0.23, 0.18, 0.17],
            k=1
        )[0]

        severity = random.choices(
            DEFECT_SEVERITIES,
            weights=[0.20, 0.40, 0.28, 0.12],
            k=1
        )[0]

        status = random.choices(
            ["Reported", "AI Verified", "Assigned", "In Progress", "Resolved"],
            weights=[0.15, 0.35, 0.25, 0.15, 0.10],
            k=1
        )[0]

        created_offset = random.randint(0, 180) * 86400 + random.randint(0, 86400)
        created_at = base_time + timedelta(seconds=created_offset)
        resolved_at = created_at + timedelta(days=random.randint(2, 14)) if status == "Resolved" else None

        records.append({
            "id": f"REP-PRG-{10000 + i}",
            "defect_type": defect_type,
            "lat": round(lat, 6),
            "lng": round(lng, 6),
            "nearest_cluster": name,
            "severity": severity,
            "status": status,
            "department_id": DEPARTMENTS[defect_type],
            "photo_url": f"https://storage.roadguard.ai/prayagraj/defects/img_{10000 + i}.jpg",
            "created_at": created_at.isoformat(),
            "resolved_at": resolved_at.isoformat() if resolved_at else "",
            "is_active": 1 if status != "Resolved" else 0,
        })

    df = pd.DataFrame(records)
    out_full = os.path.join(root_dir, output_path)
    os.makedirs(os.path.dirname(out_full), exist_ok=True)
    df.to_csv(out_full, index=False)
    print(f"Generated {len(df)} defect records at {out_full}")
    return df


def generate_accidents_dataset(num_records: int = 12000,
                               defects_df: pd.DataFrame = None,
                               output_path: str = "data/prayagraj_accidents.csv") -> pd.DataFrame:
    """
    Generate realistic multi-factor accident records and safety risk profiles for Prayagraj.
    Incorporates the Live Incident Feedback Link (nearby defects in 500m radius).
    """
    if defects_df is None:
        defects_df = generate_defects_dataset()

    active_defects = defects_df[defects_df["is_active"] == 1].to_dict(orient="records")
    spatial_index = DefectSpatialIndex(active_defects)

    landmarks_list = list(PRAYAGRAJ_LANDMARKS.items())
    records = []
    base_time = datetime(2025, 1, 1, 0, 0, 0)

    for i in range(num_records):
        lm_name, lm = random.choice(landmarks_list)
        if random.random() < 0.85:
            lat = float(np.clip(lm["lat"] + float(np.random.normal(0, 0.007)), PRAYAGRAJ_BOUNDS["min_lat"], PRAYAGRAJ_BOUNDS["max_lat"]))
            lng = float(np.clip(lm["lng"] + float(np.random.normal(0, 0.007)), PRAYAGRAJ_BOUNDS["min_lng"], PRAYAGRAJ_BOUNDS["max_lng"]))
            speed_limit = lm["speed_limit"]
            base_risk = lm["base_risk"]
        else:
            lat = float(np.random.uniform(PRAYAGRAJ_BOUNDS["min_lat"], PRAYAGRAJ_BOUNDS["max_lat"]))
            lng = float(np.random.uniform(PRAYAGRAJ_BOUNDS["min_lng"], PRAYAGRAJ_BOUNDS["max_lng"]))
            speed_limit = random.choice([30, 40, 50, 60, 70, 80])
            base_risk = 0.35

        days_offset = random.randint(0, 580)
        hour = random.randint(0, 23)
        dt = base_time + timedelta(days=days_offset, hours=hour, minutes=random.randint(0, 59))
        day_of_week = dt.weekday()
        is_weekend = 1 if day_of_week in [5, 6] else 0
        month = dt.month

        if 6 <= hour < 10:
            time_of_day = "Morning Rush"
            time_risk = 0.20
        elif 10 <= hour < 16:
            time_of_day = "Afternoon Off-Peak"
            time_risk = 0.05
        elif 16 <= hour < 21:
            time_of_day = "Evening Rush"
            time_risk = 0.30
        elif 21 <= hour < 24:
            time_of_day = "Late Night"
            time_risk = 0.25
        else:
            time_of_day = "Early Hours"
            time_risk = 0.15

        if month in [12, 1]:
            weather = random.choices(WEATHER_CONDITIONS, weights=[0.40, 0.05, 0.45, 0.05, 0.05], k=1)[0]
        elif month in [7, 8, 9]:
            weather = random.choices(WEATHER_CONDITIONS, weights=[0.25, 0.45, 0.05, 0.25, 0.00], k=1)[0]
        elif month in [4, 5, 6]:
            weather = random.choices(WEATHER_CONDITIONS, weights=[0.70, 0.05, 0.00, 0.10, 0.15], k=1)[0]
        else:
            weather = random.choices(WEATHER_CONDITIONS, weights=[0.80, 0.10, 0.05, 0.05, 0.00], k=1)[0]

        weather_risk_map = {
            "Clear": 0.0,
            "Monsoon Overcast": 0.15,
            "Rain": 0.35,
            "Dense Fog / Smog": 0.45,
            "Dust Storm": 0.30,
        }
        weather_risk = weather_risk_map.get(weather, 0.1)

        if speed_limit >= 65:
            road_type = "National Highway"
            lane_count = random.choice([4, 6])
            road_risk = 0.30
        elif "Bridge" in lm_name:
            road_type = "Bridge / Flyover"
            lane_count = random.choice([2, 4])
            road_risk = 0.25
        elif speed_limit >= 45:
            road_type = random.choice(["Major Arterial", "State Highway", "Suburban Arterial"])
            lane_count = random.choice([2, 4])
            road_risk = 0.18
        else:
            road_type = random.choice(["Dense Urban Street", "Local Residential"])
            lane_count = random.choice([1, 2])
            road_risk = 0.10

        traffic_density = random.choices(["Low", "Moderate", "High", "Congested"], weights=[0.2, 0.4, 0.3, 0.1], k=1)[0]
        traffic_risk = {"Low": 0.0, "Moderate": 0.10, "High": 0.22, "Congested": 0.28}[traffic_density]

        # Live Incident Feedback Link
        nearby_defect_count, defect_severity_idx = spatial_index.count_defects_in_radius(lat, lng, radius_meters=500.0)
        defect_risk = min(0.40, (nearby_defect_count * 0.08) + (defect_severity_idx * 0.03))

        raw_risk = (
            base_risk * 0.25 +
            time_risk * 0.18 +
            weather_risk * 0.22 +
            road_risk * 0.12 +
            traffic_risk * 0.08 +
            defect_risk * 0.35 +
            float(np.random.normal(0, 0.04))
        )
        risk_score = float(np.clip(raw_risk, 0.02, 0.98))

        if risk_score > 0.72:
            severity_code = random.choices([2, 3], weights=[0.6, 0.4], k=1)[0]
            is_high_risk = 1
        elif risk_score > 0.48:
            severity_code = random.choices([1, 2], weights=[0.7, 0.3], k=1)[0]
            is_high_risk = 1 if severity_code >= 2 else 0
        elif risk_score > 0.25:
            severity_code = random.choices([0, 1], weights=[0.75, 0.25], k=1)[0]
            is_high_risk = 0
        else:
            severity_code = 0
            is_high_risk = 0

        records.append({
            "accident_id": f"ACC-PRG-{20000 + i}",
            "timestamp": dt.isoformat(),
            "lat": round(lat, 6),
            "lng": round(lng, 6),
            "nearest_cluster": lm_name,
            "road_type": road_type,
            "speed_limit": speed_limit,
            "lane_count": lane_count,
            "traffic_density": traffic_density,
            "weather": weather,
            "time_of_day": time_of_day,
            "hour": hour,
            "day_of_week": day_of_week,
            "is_weekend": is_weekend,
            "month": month,
            "nearby_defect_count_500m": nearby_defect_count,
            "defect_severity_index": defect_severity_idx,
            "risk_score": round(risk_score, 4),
            "accident_severity_code": severity_code,
            "is_high_risk": is_high_risk,
        })

    df = pd.DataFrame(records)
    out_full = os.path.join(root_dir, output_path)
    os.makedirs(os.path.dirname(out_full), exist_ok=True)
    df.to_csv(out_full, index=False)
    print(f"Generated {len(df)} accident records at {out_full}")
    return df


def generate_risk_grid_geojson(spatial_index: DefectSpatialIndex,
                               grid_steps: int = 25,
                               output_path: str = "data/prayagraj_risk_grid.geojson") -> Dict[str, Any]:
    """Generate spatial risk grid for Prayagraj city map heatmaps."""
    lats = np.linspace(PRAYAGRAJ_BOUNDS["min_lat"], PRAYAGRAJ_BOUNDS["max_lat"], grid_steps)
    lngs = np.linspace(PRAYAGRAJ_BOUNDS["min_lng"], PRAYAGRAJ_BOUNDS["max_lng"], grid_steps)

    features = []
    for lat in lats:
        for lng in lngs:
            defect_cnt, sev_idx = spatial_index.count_defects_in_radius(lat, lng, 600.0)
            min_d = 1e9
            base_risk = 0.30
            for name, lm in PRAYAGRAJ_LANDMARKS.items():
                d = latlng_to_cartesian_meters(lat, lng, lm["lat"], lm["lng"])
                dist = float(np.hypot(d[0], d[1]))
                if dist < min_d:
                    min_d = dist
                    base_risk = lm.get("base_risk", 0.30)

            proximity_factor = max(0.0, 1.0 - (min_d / 5000.0))
            calc_risk = min(0.95, base_risk * 0.6 + (defect_cnt * 0.06) + (sev_idx * 0.02) + proximity_factor * 0.15)

            features.append({
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [round(float(lng), 6), round(float(lat), 6)],
                },
                "properties": {
                    "risk_score": round(float(calc_risk), 3),
                    "risk_level": "Critical" if calc_risk > 0.75 else ("High" if calc_risk > 0.55 else ("Medium" if calc_risk > 0.30 else "Low")),
                    "active_defects_nearby": defect_cnt,
                    "defect_severity_index": sev_idx,
                }
            })

    geojson = {
        "type": "FeatureCollection",
        "metadata": {
            "city": "Prayagraj, Uttar Pradesh",
            "bounds": PRAYAGRAJ_BOUNDS,
            "generated_at": datetime.utcnow().isoformat(),
        },
        "features": features
    }

    out_full = os.path.join(root_dir, output_path)
    os.makedirs(os.path.dirname(out_full), exist_ok=True)
    with open(out_full, "w", encoding="utf-8") as f:
        json.dump(geojson, f, indent=2)
    print(f"Generated {len(features)} risk grid points at {out_full}")
    return geojson


def generate_sample_defect_images(output_dir: str = "data/sample_images"):
    """
    Generate sample test images representing the 4 road defect categories:
    1. Pothole
    2. Streetlight Defect
    3. Garbage Accumulation
    4. Drainage Issues
    """
    out_full = os.path.join(root_dir, output_dir)
    os.makedirs(out_full, exist_ok=True)

    # 1. Pothole Image
    img_pothole = Image.new("RGB", (256, 256), color=(85, 85, 90))
    draw = ImageDraw.Draw(img_pothole)
    for _ in range(3000):
        x, y = random.randint(0, 255), random.randint(0, 255)
        c = random.randint(60, 110)
        draw.point((x, y), fill=(c, c, c))
    pothole_pts = [(70, 110), (110, 80), (170, 95), (200, 140), (180, 190), (120, 200), (65, 160)]
    draw.polygon(pothole_pts, fill=(28, 25, 22), outline=(15, 15, 15))
    draw.ellipse([90, 120, 160, 170], fill=(18, 16, 14))
    img_pothole.filter(ImageFilter.GaussianBlur(1.0)).save(os.path.join(out_full, "pothole.jpg"), quality=92)

    # 2. Streetlight Defect Image
    img_light = Image.new("RGB", (256, 256), color=(20, 24, 35))
    draw = ImageDraw.Draw(img_light)
    draw.rectangle([118, 50, 138, 255], fill=(70, 75, 80))
    draw.line([(128, 70), (185, 45)], fill=(80, 85, 90), width=6)
    draw.polygon([(175, 45), (210, 40), (205, 65), (170, 60)], fill=(45, 50, 55), outline=(120, 60, 50))
    draw.line([(190, 65), (195, 95), (188, 110)], fill=(180, 120, 40), width=2)
    img_light.save(os.path.join(out_full, "streetlight_defect.jpg"), quality=92)

    # 3. Garbage Accumulation Image
    img_garbage = Image.new("RGB", (256, 256), color=(140, 135, 125))
    draw = ImageDraw.Draw(img_garbage)
    draw.line([(0, 180), (255, 180)], fill=(80, 80, 80), width=8)
    garbage_heap = [(40, 180), (70, 110), (120, 90), (190, 105), (225, 180)]
    draw.polygon(garbage_heap, fill=(110, 95, 75))
    colors = [(200, 50, 50), (40, 160, 220), (230, 210, 50), (240, 240, 240), (50, 130, 60)]
    for _ in range(60):
        gx = random.randint(60, 200)
        gy = random.randint(110, 175)
        rad = random.randint(3, 9)
        draw.ellipse([gx - rad, gy - rad, gx + rad, gy + rad], fill=random.choice(colors))
    img_garbage.save(os.path.join(out_full, "garbage_accumulation.jpg"), quality=92)

    # 4. Drainage Issues Image
    img_drainage = Image.new("RGB", (256, 256), color=(75, 75, 80))
    draw = ImageDraw.Draw(img_drainage)
    for _ in range(2000):
        x, y = random.randint(0, 255), random.randint(0, 255)
        c = random.randint(55, 95)
        draw.point((x, y), fill=(c, c, c))
    puddle_pts = [(30, 130), (80, 90), (160, 85), (230, 120), (210, 210), (130, 230), (50, 200)]
    draw.polygon(puddle_pts, fill=(45, 65, 75), outline=(60, 90, 105))
    draw.rectangle([190, 160, 245, 215], fill=(30, 30, 30), outline=(20, 20, 20))
    for gy in range(165, 215, 8):
        draw.line([(192, gy), (243, gy)], fill=(15, 15, 15), width=2)
    draw.arc([70, 130, 170, 180], 0, 180, fill=(90, 125, 145), width=2)
    img_drainage.filter(ImageFilter.GaussianBlur(0.8)).save(os.path.join(out_full, "drainage_issue.jpg"), quality=92)

    print(f"Generated 4 sample defect images in {out_full}")


def main():
    print("=== Generating Prayagraj, UP Synthetic Dataset for RoadGuard AI ===")
    defects_df = generate_defects_dataset(num_records=1500)
    spatial_index = DefectSpatialIndex(defects_df[defects_df["is_active"] == 1].to_dict(orient="records"))
    accidents_df = generate_accidents_dataset(num_records=12000, defects_df=defects_df)
    generate_risk_grid_geojson(spatial_index)
    generate_sample_defect_images()
    print("=== Dataset Generation Complete! ===")


if __name__ == "__main__":
    main()
