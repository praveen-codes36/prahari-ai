import osmnx as ox
import networkx as nx

from math import radians, cos, sin, asin, sqrt

def haversine(lat1, lon1, lat2, lon2):
    # Calculate distance in meters between two coordinates
    R = 6371000 
    dLat = radians(lat2 - lat1)
    dLon = radians(lon2 - lon1)
    a = sin(dLat/2)**2 + cos(radians(lat1))*cos(radians(lat2))*sin(dLon/2)**2
    c = 2*asin(sqrt(a))
    return R * c

class GraphManager:
    def __init__(self):
        self.cached_G = None
        self.cached_center = None

    def get_graph_for_location(self, lat, lng, radius=3000):
        # Check if we already downloaded a map for this general area (within 1km)
        if self.cached_G and self.cached_center:
            dist = haversine(lat, lng, self.cached_center[0], self.cached_center[1])
            if dist < 1000:
                print("Fast load: Using cached road network for this area.")
                return self.cached_G

        print(f"Dynamically downloading road network for {radius}m around {lat}, {lng} (takes 2-5 seconds)...")
        try:
            # Download small radius on the fly!
            G = ox.graph_from_point((lat, lng), dist=radius, network_type='drive')
            G = ox.add_edge_speeds(G)
            G = ox.add_edge_travel_times(G)
            print("Graph downloaded and processed successfully.")
            
            # Cache it for subsequent nearby requests
            self.cached_G = G
            self.cached_center = (lat, lng)
            return G
        except Exception as e:
            print(f"Error loading graph dynamically: {e}")
            return None

    def get_nearest_node(self, G, lat, lng):
        if not G:
            return None
        return ox.distance.nearest_nodes(G, X=lng, Y=lat)

# Initialize a global instance
graph_manager = GraphManager()
