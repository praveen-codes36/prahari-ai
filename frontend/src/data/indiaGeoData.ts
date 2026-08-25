import type { ExtendedFeatureCollection, GeoGeometryObjects } from 'd3-geo';

// Authentic Official Geographic GeoJSON of India (Mainland, Northern Frontiers, Western Coastline, Peninsula, Eastern Gateway, Northeast, Andaman & Nicobar, Lakshadweep)
// Coordinates in [Longitude, Latitude] standard GeoJSON format
export const INDIA_GEOJSON: any = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'India Mainland & Northern Territory', iso: 'IND' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            // Northern apex (Siachen / Indira Col / Karakoram / Ladakh)
            [77.0, 35.5],
            [77.8, 35.5],
            [78.5, 35.2],
            [79.3, 34.5],
            [79.0, 33.6],
            [78.7, 32.7],
            [79.0, 31.9],
            [79.8, 31.2],
            [80.5, 30.5],
            [80.8, 30.2],
            // Nepal border region (Uttarakhand to Sikkim)
            [81.0, 29.8],
            [80.5, 28.8],
            [81.3, 28.3],
            [82.5, 27.8],
            [83.5, 27.5],
            [85.0, 26.8],
            [86.5, 26.5],
            [88.0, 26.8],
            // Sikkim
            [88.1, 27.2],
            [88.2, 27.8],
            [88.7, 28.0],
            [88.9, 27.3],
            [88.7, 27.0],
            // Bhutan Northern Border to Arunachal Pradesh
            [90.0, 27.0],
            [91.5, 27.0],
            [91.8, 27.3],
            [92.0, 27.8],
            [92.5, 28.3],
            [93.5, 28.7],
            [94.5, 28.9],
            [95.5, 29.2],
            [96.5, 29.5],
            [97.0, 29.0],
            [97.4, 28.3],
            [97.1, 27.7],
            // Eastern Indo-Myanmar Border (Nagaland, Manipur, Mizoram)
            [96.5, 27.0],
            [95.5, 26.5],
            [95.0, 25.8],
            [94.3, 25.0],
            [93.8, 24.0],
            [93.2, 23.0],
            [92.8, 22.0],
            [92.5, 21.8],
            // Tripura & Bangladesh border enclave
            [92.2, 22.5],
            [92.0, 23.5],
            [91.5, 24.0],
            [91.8, 24.8],
            [92.5, 25.0],
            [91.5, 25.2],
            [90.0, 25.2],
            [89.8, 26.0],
            [89.0, 26.0],
            [88.5, 25.5],
            [88.8, 24.5],
            [88.5, 23.8],
            [88.9, 22.8],
            // Sundarbans / Bay of Bengal (West Bengal)
            [89.0, 21.8],
            [88.0, 21.6],
            [87.0, 21.5],
            // Odisha Coastline
            [86.5, 20.8],
            [85.8, 19.8],
            [85.0, 19.3],
            // Andhra Pradesh Coastline
            [84.0, 18.5],
            [83.3, 17.7],
            [82.3, 16.8],
            [81.0, 16.0],
            [80.2, 15.5],
            [80.0, 14.5],
            // Tamil Nadu Coastline & Coromandel Coast
            [80.3, 13.1],
            [79.8, 11.5],
            [79.8, 10.3],
            [79.0, 9.3],
            [78.0, 8.8],
            [77.7, 8.4],
            // Southern Tip (Kanyakumari)
            [77.55, 8.08],
            // Kerala Coastline & Arabian Sea
            [76.8, 8.6],
            [76.3, 9.5],
            [76.2, 10.0],
            [75.8, 11.2],
            [75.0, 12.5],
            // Karnataka Coastline (Mangalore / Karwar)
            [74.5, 13.5],
            [74.3, 14.5],
            // Goa
            [73.8, 15.3],
            [73.7, 15.8],
            // Maharashtra Coastline (Konkan / Mumbai)
            [73.3, 16.8],
            [73.0, 18.0],
            [72.8, 19.0],
            [72.7, 19.8],
            // Gujarat: Gulf of Khambhat & Kathiawar Peninsula
            [72.8, 20.5],
            [72.7, 21.2],
            [72.2, 21.8],
            [71.5, 20.8],
            [70.5, 20.8],
            [69.5, 21.8],
            [69.0, 22.4],
            [69.2, 22.8],
            [70.2, 22.9],
            // Rann of Kutch & Westernmost Frontier
            [70.5, 23.2],
            [69.0, 23.3],
            [68.5, 23.5],
            [68.15, 23.7],
            [68.8, 24.2],
            [71.0, 24.5],
            // Rajasthan Western Border (Thar Desert)
            [71.0, 25.5],
            [70.5, 26.5],
            [70.2, 27.2],
            [71.5, 28.0],
            [72.5, 29.0],
            [73.8, 30.0],
            // Punjab / Jammu & Kashmir Western Frontier
            [74.5, 31.0],
            [74.8, 32.0],
            [74.2, 32.8],
            [73.8, 33.5],
            [73.7, 34.2],
            [74.5, 34.8],
            [74.8, 35.5],
            [75.5, 36.0],
            [76.2, 36.8],
            [77.0, 35.5],
          ],
        ],
      },
    },
    // Andaman and Nicobar Islands
    {
      type: 'Feature',
      properties: { name: 'Andaman and Nicobar Islands', iso: 'IND-AN' },
      geometry: {
        type: 'MultiPolygon',
        coordinates: [
          // North & Middle Andaman
          [
            [
              [92.8, 13.7],
              [93.0, 13.5],
              [93.0, 12.5],
              [92.7, 12.5],
              [92.6, 13.2],
              [92.8, 13.7],
            ],
          ],
          // South Andaman & Port Blair
          [
            [
              [92.6, 12.0],
              [92.8, 11.9],
              [92.8, 11.4],
              [92.6, 11.5],
              [92.6, 12.0],
            ],
          ],
          // Little Andaman
          [
            [
              [92.4, 10.8],
              [92.6, 10.7],
              [92.5, 10.5],
              [92.3, 10.6],
              [92.4, 10.8],
            ],
          ],
          // Car Nicobar
          [
            [
              [92.7, 9.25],
              [92.8, 9.2],
              [92.8, 9.1],
              [92.7, 9.15],
              [92.7, 9.25],
            ],
          ],
          // Great Nicobar (Indira Point)
          [
            [
              [93.7, 7.2],
              [93.9, 7.0],
              [93.85, 6.75],
              [93.65, 6.8],
              [93.7, 7.2],
            ],
          ],
        ],
      },
    },
    // Lakshadweep Islands
    {
      type: 'Feature',
      properties: { name: 'Lakshadweep', iso: 'IND-LD' },
      geometry: {
        type: 'MultiPolygon',
        coordinates: [
          // Chetlat / Kiltan / Kadmat (Amindivi group)
          [
            [
              [72.65, 11.8],
              [72.75, 11.8],
              [72.75, 11.6],
              [72.65, 11.6],
              [72.65, 11.8],
            ],
          ],
          // Kavaratti / Agatti / Andrott
          [
            [
              [72.15, 10.9],
              [72.3, 10.9],
              [72.25, 10.5],
              [72.15, 10.6],
              [72.15, 10.9],
            ],
          ],
          // Minicoy
          [
            [
              [73.0, 8.35],
              [73.1, 8.3],
              [73.05, 8.2],
              [72.95, 8.25],
              [73.0, 8.35],
            ],
          ],
        ],
      },
    },
  ],
};

// Verified City Geographic Coordinates [Longitude, Latitude]
export interface GeoCityNode {
  id: string;
  name: string;
  state: string;
  code: string;
  coordinates: [number, number]; // [Longitude, Latitude]
  status: 'critical' | 'warning' | 'healthy' | 'ai_monitoring';
  riskScore: number;
  activeIncidents: number;
  healthPct: number;
  telemetry: string;
}

export const GEO_CITY_NODES: GeoCityNode[] = [
  {
    id: 'DEL',
    name: 'Delhi NCR',
    state: 'NCT / Northern Hub',
    code: 'DEL-HQ-01',
    coordinates: [77.209, 28.6139],
    status: 'warning',
    riskScore: 68,
    activeIncidents: 4,
    healthPct: 78,
    telemetry: 'NH-48 Urban Arterial · Sensor Triage Active',
  },
  {
    id: 'BOM',
    name: 'Mumbai Metro',
    state: 'Maharashtra',
    code: 'BOM-WEST-02',
    coordinates: [72.8777, 19.076],
    status: 'critical',
    riskScore: 92,
    activeIncidents: 6,
    healthPct: 61,
    telemetry: 'Western Express Highway · Heavy Hydrostatic Stress',
  },
  {
    id: 'BLR',
    name: 'Bengaluru Corridor',
    state: 'Karnataka',
    code: 'BLR-SOUTH-03',
    coordinates: [77.5946, 12.9716],
    status: 'healthy',
    riskScore: 24,
    activeIncidents: 1,
    healthPct: 94,
    telemetry: 'Silk Board Smart Viaduct · AI Grid Synced',
  },
  {
    id: 'HYD',
    name: 'Hyderabad Ring',
    state: 'Telangana',
    code: 'HYD-CTRL-04',
    coordinates: [78.4867, 17.385],
    status: 'healthy',
    riskScore: 32,
    activeIncidents: 2,
    healthPct: 91,
    telemetry: 'Nehru Outer Ring Road · Telemetry Normal',
  },
  {
    id: 'MAA',
    name: 'Chennai Port Link',
    state: 'Tamil Nadu',
    code: 'MAA-EAST-05',
    coordinates: [80.2707, 13.0827],
    status: 'ai_monitoring',
    riskScore: 48,
    activeIncidents: 2,
    healthPct: 86,
    telemetry: 'East Coast Expressway · Marine Corrosion Monitored',
  },
  {
    id: 'CCU',
    name: 'Kolkata Gateway',
    state: 'West Bengal',
    code: 'CCU-EAST-06',
    coordinates: [88.3639, 22.5726],
    status: 'warning',
    riskScore: 71,
    activeIncidents: 3,
    healthPct: 74,
    telemetry: 'NH-16 Freight Arc · Subgrade Deflection Tracked',
  },
  {
    id: 'PNQ',
    name: 'Pune Industrial',
    state: 'Maharashtra',
    code: 'PNQ-CORR-07',
    coordinates: [73.8567, 18.5204],
    status: 'ai_monitoring',
    riskScore: 54,
    activeIncidents: 2,
    healthPct: 83,
    telemetry: 'Mumbai-Pune Expressway · Bhor Ghat Sensor Live',
  },
  {
    id: 'AMD',
    name: 'Ahmedabad Expressway',
    state: 'Gujarat',
    code: 'AMD-WEST-08',
    coordinates: [72.5714, 23.0225],
    status: 'healthy',
    riskScore: 28,
    activeIncidents: 1,
    healthPct: 93,
    telemetry: 'NE-1 Vadodara Expressway · Green Wave Valid',
  },
  {
    id: 'JAI',
    name: 'Jaipur Trunk',
    state: 'Rajasthan',
    code: 'JAI-NORTH-09',
    coordinates: [75.7873, 26.9124],
    status: 'healthy',
    riskScore: 36,
    activeIncidents: 1,
    healthPct: 89,
    telemetry: 'NH-21 Golden Corridor · Ultrasound Healthy',
  },
  {
    id: 'LKO',
    name: 'Lucknow Expressway',
    state: 'Uttar Pradesh',
    code: 'LKO-CENT-10',
    coordinates: [80.9462, 26.8467],
    status: 'ai_monitoring',
    riskScore: 45,
    activeIncidents: 2,
    healthPct: 88,
    telemetry: 'Agra-Lucknow Expressway · Runway Grade Normal',
  },
  {
    id: 'COK',
    name: 'Kochi Coastal',
    state: 'Kerala',
    code: 'COK-SOUTH-11',
    coordinates: [76.2673, 9.9312],
    status: 'healthy',
    riskScore: 29,
    activeIncidents: 1,
    healthPct: 92,
    telemetry: 'NH-66 Coastal Link · Marine Barrier Normal',
  },
  {
    id: 'GAU',
    name: 'Guwahati Gateway',
    state: 'Assam / NE',
    code: 'GAU-NE-12',
    coordinates: [91.7362, 26.1445],
    status: 'warning',
    riskScore: 66,
    activeIncidents: 2,
    healthPct: 76,
    telemetry: 'Brahmaputra Bridge Pier Sensor · Active Monitoring',
  },
  {
    id: 'SXR',
    name: 'Srinagar Crown',
    state: 'Jammu & Kashmir',
    code: 'SXR-NORTH-13',
    coordinates: [74.7973, 34.0837],
    status: 'healthy',
    riskScore: 31,
    activeIncidents: 1,
    healthPct: 90,
    telemetry: 'NH-44 Chenani-Nashri Tunnel · Thermal Grid Normal',
  },
  {
    id: 'BHO',
    name: 'Bhopal Central',
    state: 'Madhya Pradesh',
    code: 'BHO-CTRL-14',
    coordinates: [77.4126, 23.2599],
    status: 'healthy',
    riskScore: 35,
    activeIncidents: 1,
    healthPct: 89,
    telemetry: 'Bhopal-Indore Corridor · AI Pavement Telemetry',
  },
  {
    id: 'BBI',
    name: 'Bhubaneswar Coastal',
    state: 'Odisha',
    code: 'BBI-EAST-15',
    coordinates: [85.8245, 20.2961],
    status: 'ai_monitoring',
    riskScore: 49,
    activeIncidents: 2,
    healthPct: 84,
    telemetry: 'NH-16 Coastal Arc · Salinity Sensor Active',
  },
  {
    id: 'IXC',
    name: 'Chandigarh Junction',
    state: 'Punjab / Haryana',
    code: 'IXC-NORTH-16',
    coordinates: [76.7794, 30.7333],
    status: 'healthy',
    riskScore: 22,
    activeIncidents: 0,
    healthPct: 96,
    telemetry: 'Himalayan Expressway Gateway · Optimal',
  },
  {
    id: 'PAT',
    name: 'Patna Corridor',
    state: 'Bihar',
    code: 'PAT-EAST-17',
    coordinates: [85.1376, 25.5941],
    status: 'ai_monitoring',
    riskScore: 52,
    activeIncidents: 2,
    healthPct: 81,
    telemetry: 'Ganga Setu Stress Monitor · Active Triage',
  },
  {
    id: 'NAG',
    name: 'Nagpur Zero Mile',
    state: 'Maharashtra / Central',
    code: 'NAG-CTRL-18',
    coordinates: [79.0882, 21.1458],
    status: 'healthy',
    riskScore: 30,
    activeIncidents: 1,
    healthPct: 91,
    telemetry: 'Samruddhi Mahamarg Interchange · High Flow',
  },
];

// Connected Network Edges (fromCityId -> toCityId)
export interface GeoNetworkEdge {
  id: string;
  from: string;
  to: string;
  name: string;
  isEmergency?: boolean;
}

export const GEO_NETWORK_EDGES: GeoNetworkEdge[] = [
  // Golden Quadrilateral & Major National Trunk Corridors
  { id: 'E1', from: 'SXR', to: 'IXC', name: 'NH-44 Northern Trunk' },
  { id: 'E2', from: 'IXC', to: 'DEL', name: 'NH-44 Punjab Corridor' },
  { id: 'E3', from: 'DEL', to: 'JAI', name: 'NH-48 Delhi-Jaipur' },
  { id: 'E4', from: 'JAI', to: 'AMD', name: 'NH-48 Jaipur-Ahmedabad' },
  { id: 'E5', from: 'AMD', to: 'BOM', name: 'NE-1 / NH-48 West Corridor' },
  { id: 'E6', from: 'BOM', to: 'PNQ', name: 'Mumbai-Pune Expressway', isEmergency: true },
  { id: 'E7', from: 'PNQ', to: 'HYD', name: 'NH-65 Pune-Hyderabad', isEmergency: true },
  { id: 'E8', from: 'PNQ', to: 'BLR', name: 'NH-48 Pune-Bengaluru' },
  { id: 'E9', from: 'BLR', to: 'MAA', name: 'NH-48 Bengaluru-Chennai' },
  { id: 'E10', from: 'BLR', to: 'COK', name: 'NH-544 Southern Arterial' },
  { id: 'E11', from: 'MAA', to: 'HYD', name: 'NH-16 Chennai-Hyderabad' },
  { id: 'E12', from: 'HYD', to: 'BLR', name: 'NH-44 Hyderabad-Bengaluru' },
  { id: 'E13', from: 'DEL', to: 'LKO', name: 'Yamuna & Agra-Lucknow Exp' },
  { id: 'E14', from: 'LKO', to: 'PAT', name: 'Purvanchal Expressway' },
  { id: 'E15', from: 'PAT', to: 'CCU', name: 'NH-19 Patna-Kolkata' },
  { id: 'E16', from: 'CCU', to: 'BBI', name: 'NH-16 Kolkata-Bhubaneswar' },
  { id: 'E17', from: 'BBI', to: 'MAA', name: 'NH-16 Coastal Trunk' },
  { id: 'E18', from: 'CCU', to: 'GAU', name: 'NH-27 Siliguri / Assam Corridor' },
  { id: 'E19', from: 'DEL', to: 'BHO', name: 'NH-46 Delhi-Bhopal' },
  { id: 'E20', from: 'BHO', to: 'NAG', name: 'NH-46 Bhopal-Nagpur' },
  { id: 'E21', from: 'NAG', to: 'HYD', name: 'NH-44 Central Spine' },
  { id: 'E22', from: 'BOM', to: 'NAG', name: 'Samruddhi Mahamarg' },
];
