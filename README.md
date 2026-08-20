# PRAHARI — AI Sentinel for Safer Roads

**Smart India Hackathon 2026 | Theme: Transportation and Logistics**
**Team: COMMAND + WIN | MNNIT Allahabad**

PRAHARI is an AI-powered platform that combines crowdsourced road infrastructure
defect detection, accident hotspot prediction, and safety-aware emergency
routing into a single intelligence layer for Indian cities.

## The Problem

- Potholes, broken streetlights, garbage overflow, and drainage failures are
  reported manually and routed inconsistently between municipal departments.
- India records the highest road accident fatalities in the world, and
  emergency response is often delayed because routing tools optimize for
  distance, not safety or actual travel time.
- Infrastructure condition and accident risk are treated as unrelated
  problems — PRAHARI connects them.

## What It Does

1. **Detect** — Citizens photograph a defect; a CNN classifies it (pothole,
   streetlight, garbage, drainage) and geotags it automatically.
2. **Predict** — An ML model scores accident risk per zone using historical
   accident data, weather, traffic, and live defect density.
3. **Respond** — When an accident is reported, the routing engine finds the
   fastest *and safest* path for an ambulance — not just the shortest one.

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React (Vite) + Tailwind CSS v4 + Leaflet.js |
| Backend | FastAPI (Python) |
| ML — Risk Model | scikit-learn / XGBoost |
| ML — Defect Classifier | PyTorch / TensorFlow (transfer learning) |
| Routing Engine | NetworkX + OSMnx (Dijkstra/A*) |
| Database | PostgreSQL (+ PostGIS) or MongoDB |

## Repository Structure

```
prahari-ai/
├── frontend/          # React dashboard (Person 4, 5)
├── backend/           # FastAPI APIs (Person 2)
├── ml-model/           # Risk prediction + defect classifier (Person 1)
├── routing-engine/     # Road graph + routing logic (Person 3)
├── docs/                # PPT, architecture diagrams, PS document
└── README.md
```

## Getting Started

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### ML Model
```bash
cd ml-model
pip install -r requirements.txt
python train_risk_model.py
```

### Routing Engine
```bash
cd routing-engine
pip install -r requirements.txt
python build_graph.py
```

Copy `.env.example` to `.env` in each module that needs it, and fill in
your own values. Never commit `.env` files.

## Team — COMMAND + WIN

| Name | Role |
|---|---|
| TBD | Team Lead / Backend |
| TBD | ML — Risk Prediction |
| TBD | Routing / Algorithms |
| TBD | Frontend — Dashboard |
| TBD | Frontend — Alerts & UI |
| TBD | Data & Documentation |

## License

Private repository — internal SIH 2026 submission. Not licensed for public
use at this time.
