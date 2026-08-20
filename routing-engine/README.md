# routing-engine/

Road network graph + safety-aware emergency routing (Dijkstra/A\*).

## What goes here

- `build_graph.py` — pulls the road network for the chosen city via OSMnx
  and caches it locally
- `routing.py` — core routing logic:
  - `get_optimal_route(start, end) -> route_coords, eta, distance`
  - custom edge-weight function combining distance + risk score + defect
    density (this is the project's core differentiator — see root README)
- `nearest.py` — nearest ambulance/hospital lookup (KDTree or Haversine)
- `cache/` — cached `.graphml` road network files (excluded from Git —
  regenerate locally with `build_graph.py`)

## Setup

```bash
pip install osmnx networkx scipy
```

## Notes

- Keep the graph scoped to ONE city/district (set in `.env` as
  `CITY_NAME`) — an all-India graph is too large and slow for an 11-day
  build.
- Coordinate with Person 1 on the exact format for risk scores per road
  segment, and with Person 2 on the exact request/response shape for
  `/emergency-route`.
