# backend/

FastAPI (or Express) backend — all REST APIs, database models, and the
glue between the frontend, ML model, and routing engine.

## What goes here

- `main.py` (FastAPI entry point) or `index.js` (Express entry point)
- `models/` — database schema/models
- `routes/` — API endpoint definitions
- `requirements.txt` (Python) or `package.json` (Node)

## Core endpoints to build

- `POST /complaints` — submit defect report
- `GET /complaints` — list/filter complaints
- `PATCH /complaints/:id` — update status
- `GET /hotspots` — accident risk heatmap data
- `POST /emergency-route` — optimal route + nearby ambulance/hospital
- `GET /stats` — dashboard aggregate counts

## Setup (Python/FastAPI)

```bash
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install fastapi uvicorn python-multipart
pip freeze > requirements.txt
uvicorn main:app --reload
```

## Notes

- Copy `.env.example` from the repo root into this folder as `.env`.
- If using Python, prefer importing the ML model and routing functions
  directly rather than calling them over HTTP — saves a lot of
  integration time in 11 days.
