import osmnx as ox
import networkx as nx

class GraphManager:
    def __init__(self, place_name="Connaught Place, New Delhi, India"):
        self.place_name = place_name
        self.G = None

    def load_graph(self):
        print(f"Loading road network graph for {self.place_name}...")
        try:
            # Download the graph from OSM
            self.G = ox.graph_from_place(self.place_name, network_type='drive')
            # Add edge speeds and travel times
            self.G = ox.add_edge_speeds(self.G)
            self.G = ox.add_edge_travel_times(self.G)
            print("Graph loaded successfully.")
        except Exception as e:
            print(f"Error loading graph: {e}")
            self.G = None

    def get_nearest_node(self, lat, lng):
        if not self.G:
            return None
        return ox.distance.nearest_nodes(self.G, X=lng, Y=lat)

# Initialize a global instance
graph_manager = GraphManager()
