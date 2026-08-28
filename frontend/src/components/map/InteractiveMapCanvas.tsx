import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  AlertTriangle,
  Lightbulb,
  History,
  Navigation,
  Search,
  X,
  Crosshair,
  Shield,
  Layers,
  MapPin,
  Activity,
  Plus,
} from 'lucide-react';
import { HealthScoreCircle } from '../common/HealthScoreCircle';
import { RoadSegment, SeverityLevel } from '../../types';
import { MOCK_ROAD_SEGMENTS } from '../../data/mockData';
import apiClient from '../../services/apiClient';

// Helper component to re-center the map when the selected segment changes
const MapRecenter = ({ center }: { center: { lat: number, lng: number } }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], map.getZoom());
  }, [center, map]);
  return null;
};

// Custom Overlay that uses useMap hook
const MapControls = ({ selectedSegment, setSelectedSegment, segments }: any) => {
  const map = useMap();
  return (
    <div className="absolute right-4 top-20 z-[1000] flex flex-col gap-2">
      <button
        onClick={() => map.zoomIn()}
        className="w-8 h-8 rounded-lg bg-[#151b2b]/90 hover:bg-[#242a3a] border border-white/10 text-white font-mono flex items-center justify-center shadow-lg active:scale-95"
        title="Zoom In"
      >
        +
      </button>
      <button
        onClick={() => map.zoomOut()}
        className="w-8 h-8 rounded-lg bg-[#151b2b]/90 hover:bg-[#242a3a] border border-white/10 text-white font-mono flex items-center justify-center shadow-lg active:scale-95"
        title="Zoom Out"
      >
        -
      </button>
      <button
        onClick={() => {
          if (segments && segments.length > 0) {
            setSelectedSegment(segments[0]);
            map.setView([segments[0].coordinates.lat, segments[0].coordinates.lng], 13);
          }
        }}
        className="w-8 h-8 rounded-lg bg-[#151b2b]/90 hover:bg-[#242a3a] border border-white/10 text-[#00daf3] flex items-center justify-center shadow-lg active:scale-95"
        title="Recenter GPS"
      >
        <Crosshair className="w-4 h-4" />
      </button>
    </div>
  );
};

interface InteractiveMapCanvasProps {
  initialSelectedId?: string;
  onReportClick?: (segment: RoadSegment) => void;
  heightClass?: string;
  isAuthorityMode?: boolean;
}

export const InteractiveMapCanvas: React.FC<InteractiveMapCanvasProps> = ({
  initialSelectedId = 'RD-MUM-01',
  onReportClick,
  heightClass = 'h-[650px] lg:h-[750px]',
  isAuthorityMode = false,
}) => {
  const navigate = useNavigate();
  const [segments, setSegments] = useState<RoadSegment[]>(MOCK_ROAD_SEGMENTS);
  const [activeFilter, setActiveFilter] = useState<'all' | 'high' | 'med_low' | 'pothole' | 'lighting'>('all');
  const [selectedSegment, setSelectedSegment] = useState<RoadSegment | null>(() => {
    return MOCK_ROAD_SEGMENTS.find((s) => s.id === initialSelectedId) || MOCK_ROAD_SEGMENTS[0];
  });
  const [mapSearch, setMapSearch] = useState('');
  
  const defaultCenter = { lat: 25.4358, lng: 81.8463 }; // Prayagraj

  useEffect(() => {
    const fetchSegments = async () => {
      try {
        // Fetch road health scores for both Authority and Citizen modes for now
        // since the heatmap is for Road Risk and Health Scores.
        const res = await apiClient.get('/roads/health-scores');
        const data = res.data?.data;
        if (data && data.length > 0) {
          const mapped: RoadSegment[] = data.map((item: any) => ({
            id: item._id || item.road_segment_id,
            name: item.road_name,
            district: 'Prayagraj',
            city: 'Prayagraj',
            lengthKm: 5.0,
            healthScore: item.health_score,
            riskLevel: item.health_score < 40 ? 'critical' : item.health_score < 70 ? 'high' : 'low',
            accidentHistoryCount: item.factors?.accident_history || 0,
            lightingStatus: item.factors?.lighting > 20 ? 'Good' : 'Poor',
            trafficVolume: 'Moderate',
            vehiclesPerDay: 15000,
            activeAnomaliesCount: item.factors?.potholes || 0,
            lastScanned: new Date(item.last_calculated_at).toLocaleDateString(),
            coordinates: {
              lat: item.coordinates ? item.coordinates[1] : 25.4358, 
              lng: item.coordinates ? item.coordinates[0] : 81.8463
            }
          }));
          setSegments(mapped);
          if (!selectedSegment || !mapped.find(m => m.id === selectedSegment?.id)) {
             setSelectedSegment(mapped[0]);
          }
        } else {
          setSegments([]); // No data, empty map instead of mock data
        }
      } catch (err) {
        console.error('Failed to fetch map data:', err);
        setSegments([]);
      }
    };
    fetchSegments();
  }, [isAuthorityMode]);

  // Filter items
  const filteredSegments = segments.filter((s) => {
    if (activeFilter === 'high') return s.riskLevel === 'critical' || s.riskLevel === 'high';
    if (activeFilter === 'med_low') return s.riskLevel === 'medium' || s.riskLevel === 'low';
    if (activeFilter === 'lighting') return s.lightingStatus === 'Poor' || s.lightingStatus === 'Outage';
    if (activeFilter === 'pothole') return s.activeAnomaliesCount > 5;
    if (mapSearch.trim()) {
      return (
        s.name.toLowerCase().includes(mapSearch.toLowerCase()) ||
        s.district.toLowerCase().includes(mapSearch.toLowerCase()) ||
        s.city.toLowerCase().includes(mapSearch.toLowerCase())
      );
    }
    return true;
  });

  const handleMarkerClick = (segment: RoadSegment) => {
    setSelectedSegment(segment);
  };

  const handleReportAction = () => {
    if (onReportClick && selectedSegment) {
      onReportClick(selectedSegment);
    } else {
      navigate('/citizen/report-defect');
    }
  };

  const createCustomIcon = (seg: RoadSegment) => {
    const isCritical = seg.healthScore < 40;
    const isHigh = seg.healthScore >= 40 && seg.healthScore < 70;
    
    const pingHtml = isCritical ? `<div class="absolute w-9 h-9 rounded-full bg-[#ff5252]/25 animate-ping"></div>` : '';
    const bgColor = isCritical ? 'bg-[#ff5252] shadow-[0_0_15px_#ff5252]' : isHigh ? 'bg-[#ffa000] shadow-[0_0_15px_#ffa000]' : 'bg-[#00daf3] shadow-[0_0_15px_#00daf3]';
    const labelColor = isCritical ? 'border-[#ffb4ab]/40 text-[#ffdad6]' : isHigh ? 'border-[#ffa000]/40 text-[#ffa000]' : 'border-[#00daf3]/40 text-[#00daf3]';

    return L.divIcon({
      className: 'custom-map-icon group',
      html: `
        <div class="relative flex items-center justify-center">
          ${pingHtml}
          <div class="w-5 h-5 rounded-full border-2 border-[#0d1322] group-hover:scale-125 transition-transform ${bgColor}"></div>
          <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-[#151b2b]/95 border px-2 py-0.5 rounded text-[10px] font-mono whitespace-nowrap shadow-lg pointer-events-none ${labelColor}">
            ${seg.name.substring(0, 15)} &middot; Score: ${Math.round(seg.healthScore)}
          </div>
        </div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  };

  return (
    <div className={`relative w-full ${heightClass} bg-[#080e1d] rounded-2xl overflow-hidden border border-white/10 shadow-2xl select-none`}>
      <MapContainer 
        center={[defaultCenter.lat, defaultCenter.lng]} 
        zoom={13} 
        style={{ height: '100%', width: '100%', zIndex: 10 }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles-dark-mode"
        />

        {selectedSegment && <MapRecenter center={selectedSegment.coordinates} />}

        {filteredSegments.map((seg) => (
          <Marker
            key={seg.id}
            position={[seg.coordinates.lat, seg.coordinates.lng]}
            icon={createCustomIcon(seg)}
            eventHandlers={{
              click: () => handleMarkerClick(seg),
            }}
          />
        ))}

        <MapControls selectedSegment={selectedSegment} setSelectedSegment={setSelectedSegment} segments={segments} />
      </MapContainer>

      {/* Floating Filter Chips and Search Bar (Top Overlay) */}
      <div className="absolute top-4 inset-x-4 z-[1000] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pointer-events-none">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pointer-events-auto">
          <button
            onClick={() => setActiveFilter('high')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg backdrop-blur-md text-xs font-mono transition-all whitespace-nowrap active:scale-95 ${
              activeFilter === 'high'
                ? 'bg-[#93000a]/70 text-[#ffdad6] border border-[#ffb4ab]/60 shadow-[0_0_15px_rgba(255,180,171,0.4)]'
                : 'bg-[#242a3a]/80 text-[#c2c6d8] hover:bg-[#2f3445]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#ff5252] animate-pulse"></span>
            High Risk
          </button>

          <button
            onClick={() => setActiveFilter('med_low')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg backdrop-blur-md text-xs font-mono transition-all whitespace-nowrap active:scale-95 ${
              activeFilter === 'med_low'
                ? 'bg-[#00e3fd]/20 text-[#00daf3] border border-[#00e3fd]/50 shadow-[0_0_12px_rgba(0,227,253,0.3)]'
                : 'bg-[#242a3a]/80 text-[#c2c6d8] hover:bg-[#2f3445]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#00daf3]"></span>
            Med/Low Risk
          </button>

          <button
            onClick={() => setActiveFilter('pothole')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg backdrop-blur-md text-xs font-mono transition-all whitespace-nowrap active:scale-95 ${
              activeFilter === 'pothole'
                ? 'bg-[#ffa000]/20 text-[#ffa000] border border-[#ffa000]/50 shadow-[0_0_12px_rgba(255,160,0,0.3)]'
                : 'bg-[#242a3a]/80 text-[#c2c6d8] hover:bg-[#2f3445]'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-[#ffa000]" />
            Potholes
          </button>

          <button
            onClick={() => setActiveFilter('lighting')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg backdrop-blur-md text-xs font-mono transition-all whitespace-nowrap active:scale-95 ${
              activeFilter === 'lighting'
                ? 'bg-[#b3c5ff]/20 text-[#b3c5ff] border border-[#b3c5ff]/50 shadow-[0_0_12px_rgba(179,197,255,0.3)]'
                : 'bg-[#242a3a]/80 text-[#c2c6d8] hover:bg-[#2f3445]'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5 text-[#b3c5ff]" />
            Lighting
          </button>

          {activeFilter !== 'all' && (
            <button
              onClick={() => setActiveFilter('all')}
              className="px-2 py-1 rounded-lg bg-white/10 text-[10px] font-mono text-white hover:bg-white/20 pointer-events-auto"
            >
              Reset
            </button>
          )}
        </div>

        {/* Search within map */}
        <div className="relative min-w-[200px] sm:w-64 pointer-events-auto">
          <div className="flex items-center bg-[#151b2b]/90 backdrop-blur-xl rounded-lg px-3 py-1.5 border border-white/15 shadow-lg">
            <Search className="w-3.5 h-3.5 text-[#8c90a1] mr-2" />
            <input
              type="text"
              value={mapSearch}
              onChange={(e) => setMapSearch(e.target.value)}
              placeholder="Search area (e.g. Andheri, Powai)..."
              className="bg-transparent text-xs text-white placeholder:text-[#8c90a1] w-full focus:outline-none font-mono"
            />
            {mapSearch && (
              <button onClick={() => setMapSearch('')} className="text-[#8c90a1] hover:text-white">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Center GPS User Position Indicator */}
      <div className="absolute top-[48%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-[1000] flex flex-col items-center justify-center pointer-events-none">
        <div className="w-14 h-14 rounded-full bg-[#0066ff]/20 flex items-center justify-center animate-ping absolute" />
        <div className="w-10 h-10 rounded-full bg-[#00e3fd]/25 flex items-center justify-center border border-[#00e3fd]/50">
          <div className="w-3.5 h-3.5 bg-[#00e3fd] rounded-full shadow-[0_0_15px_#00e3fd]" />
        </div>
        <span className="text-[10px] font-mono font-bold text-[#00daf3] bg-[#0d1322]/80 px-2 py-0.5 rounded mt-1 backdrop-blur-sm border border-[#00e3fd]/30">
          GPS LOCK: ACTIVE
        </span>
      </div>

      {/* Detail Panel Bottom Sheet (Matching Stitch Screen Design) */}
      {selectedSegment && (
        <div className="absolute bottom-4 inset-x-4 max-w-xl mx-auto z-[1000] transform transition-all duration-300 ease-out pointer-events-none">
          <div className="w-full rounded-2xl p-5 shadow-2xl relative overflow-hidden bg-[#242a3a]/90 backdrop-blur-2xl border border-white/15 pointer-events-auto">
            {/* Close Button */}
            <button
              onClick={() => setSelectedSegment(null)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-[#2f3445] flex items-center justify-center text-[#c2c6d8] hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header with Health Score Ring */}
            <div className="flex items-start gap-4 mb-4">
              <HealthScoreCircle score={selectedSegment.healthScore} size={48} />
              <div>
                <h3 className="text-lg font-bold text-white mb-0.5">{selectedSegment.name}</h3>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      selectedSegment.healthScore < 40
                        ? 'bg-[#ff5252] shadow-[0_0_8px_#ff5252]'
                        : selectedSegment.healthScore < 70
                        ? 'bg-[#ffa000] shadow-[0_0_8px_#ffa000]'
                        : 'bg-[#00daf3] shadow-[0_0_8px_#00daf3]'
                    }`}
                  />
                  <span
                    className={`font-mono text-xs uppercase font-bold tracking-wider ${
                      selectedSegment.healthScore < 40
                        ? 'text-[#ffb4ab]'
                        : selectedSegment.healthScore < 70
                        ? 'text-[#ffa000]'
                        : 'text-[#00daf3]'
                    }`}
                  >
                    {selectedSegment.riskLevel} Risk ({Math.round(selectedSegment.healthScore)}/100)
                  </span>
                </div>
              </div>
            </div>

            {/* Data Grid with Accident History & Lighting */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-[#0d1322]/60 rounded-xl p-3 border border-white/5">
                <div className="flex items-center gap-1.5 mb-1 text-[#8c90a1]">
                  <History className="w-3.5 h-3.5 text-[#8c90a1]" />
                  <span className="font-mono text-[10px] uppercase">Accident Hist.</span>
                </div>
                <div className="text-sm font-semibold text-white">
                  {selectedSegment.accidentHistoryCount} Incidents (30d)
                </div>
              </div>

              <div className="bg-[#0d1322]/60 rounded-xl p-3 border border-white/5">
                <div className="flex items-center gap-1.5 mb-1 text-[#8c90a1]">
                  <Lightbulb className="w-3.5 h-3.5 text-[#8c90a1]" />
                  <span className="font-mono text-[10px] uppercase">Lighting</span>
                </div>
                <div className="text-sm font-semibold text-white">
                  {selectedSegment.lightingStatus}
                </div>
              </div>
            </div>

            {/* Action CTA Button */}
            <button
              onClick={handleReportAction}
              className="w-full h-12 bg-[#b3c5ff] hover:bg-[#dae1ff] text-[#002b75] rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(179,197,255,0.4)] active:scale-98 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              Report Hazard Here
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
