import networkx as nx
import osmnx as ox
from models import RouteRequest
from graph_manager import graph_manager

# Tuning parameters for custom cost (seconds)
POTHOLE_PENALTY_SECONDS = {
    'LOW': 5,
    'MEDIUM': 10,
    'HIGH': 30,
    'CRITICAL': 60
}

def calculate_routes(request: RouteRequest):
    # 1. Dynamically load the road network around the accident (3km radius)
    G = graph_manager.get_graph_for_location(
        request.accident_location.lat, 
        request.accident_location.lng, 
        radius=3000
    )
    
    if not G:
        raise ValueError("Could not load road network for this location")

    start_node = graph_manager.get_nearest_node(G, request.accident_location.lat, request.accident_location.lng)
    end_node = graph_manager.get_nearest_node(G, request.hospital_location.lat, request.hospital_location.lng)

    if not start_node or not end_node:
        raise ValueError("Could not find nearest nodes on the graph. The hospital might be too far from the accident.")

    # 1. Calculate Fastest Route (Base Dijkstra on travel_time)
    try:
        fastest_path = nx.shortest_path(G, source=start_node, target=end_node, weight='travel_time')
        fastest_route_gdf = ox.routing.route_to_gdf(G, fastest_path, weight='travel_time')
        fastest_eta = fastest_route_gdf['travel_time'].sum() / 60.0
    except nx.NetworkXNoPath:
        fastest_path = []
        fastest_eta = 0.0

    # 2. Calculate Safest Route (Dijkstra on custom_cost)
    # First, reset custom costs to travel_time
    for u, v, k, data in G.edges(keys=True, data=True):
        data['custom_cost'] = data.get('travel_time', 10)
    
    # Inject Pothole Penalties
    for pothole in request.potholes:
        nearest_node = graph_manager.get_nearest_node(G, pothole.location.lat, pothole.location.lng)
        # Add penalty to edges connected to this node
        for neighbor in G.neighbors(nearest_node):
            if G.has_edge(nearest_node, neighbor):
                for key in G[nearest_node][neighbor]:
                    G[nearest_node][neighbor][key]['custom_cost'] += POTHOLE_PENALTY_SECONDS.get(pothole.severity, 10)

    # Inject Blockages (Infinite weight)
    for blockage in request.blockages:
        nearest_node = graph_manager.get_nearest_node(G, blockage.location.lat, blockage.location.lng)
        for neighbor in G.neighbors(nearest_node):
            if G.has_edge(nearest_node, neighbor):
                for key in G[nearest_node][neighbor]:
                    G[nearest_node][neighbor][key]['custom_cost'] += 999999 # Effectively block it

    # Run shortest path on custom cost
    try:
        safest_path = nx.shortest_path(G, source=start_node, target=end_node, weight='custom_cost')
        safest_route_gdf = ox.routing.route_to_gdf(G, safest_path, weight='custom_cost')
        safest_eta = safest_route_gdf['travel_time'].sum() / 60.0 # Return real ETA, not cost ETA
    except nx.NetworkXNoPath:
        safest_path = []
        safest_eta = 0.0

    # Convert node paths back to coordinates
    fastest_coords = [{"lat": G.nodes[n]['y'], "lng": G.nodes[n]['x']} for n in fastest_path]
    safest_coords = [{"lat": G.nodes[n]['y'], "lng": G.nodes[n]['x']} for n in safest_path]

    return {
        "recommended_route_type": "safest" if safest_eta < fastest_eta + 5 else "fastest", # Recommend safest if it's not much slower
        "fastest_route_coords": fastest_coords,
        "fastest_route_eta_mins": round(fastest_eta, 2),
        "safest_route_coords": safest_coords,
        "safest_route_eta_mins": round(safest_eta, 2),
        "safest_route_pothole_count": 0, # Would calculate actual intersection here
        "safest_route_avg_risk": 20.0 # Mock value for now
    }
