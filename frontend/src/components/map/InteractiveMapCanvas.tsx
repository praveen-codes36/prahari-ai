import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [activeFilter, setActiveFilter] = useState<'all' | 'high' | 'med_low' | 'pothole' | 'lighting'>('all');
  const [selectedSegment, setSelectedSegment] = useState<RoadSegment | null>(() => {
    return MOCK_ROAD_SEGMENTS.find((s) => s.id === initialSelectedId) || MOCK_ROAD_SEGMENTS[0];
  });
  const [mapSearch, setMapSearch] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);

  // Filter items
  const filteredSegments = MOCK_ROAD_SEGMENTS.filter((s) => {
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

  return (
    <div className={`relative w-full ${heightClass} bg-[#080e1d] rounded-2xl overflow-hidden border border-white/10 shadow-2xl select-none`}>
      {/* Dark Tactical Grid Background with Mumbai/Urban satellite aesthetic */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center opacity-65 mix-blend-luminosity scale-105 transition-transform duration-1000"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=1600&q=80')`,
        }}
      />

      {/* Grid Pattern and Dark Scrim */}
      <div className="absolute inset-0 bg-[#0d1322]/65 pointer-events-none" />
      <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0d1322] via-transparent to-[#0d1322]/40 pointer-events-none" />

      {/* Floating Filter Chips and Search Bar (Top Overlay) */}
      <div className="absolute top-4 inset-x-4 z-20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
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
              className="px-2 py-1 rounded-lg bg-white/10 text-[10px] font-mono text-white hover:bg-white/20"
            >
              Reset
            </button>
          )}
        </div>

        {/* Search within map */}
        <div className="relative min-w-[200px] sm:w-64">
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
      <div className="absolute top-[48%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center justify-center pointer-events-none">
        <div className="w-14 h-14 rounded-full bg-[#0066ff]/20 flex items-center justify-center animate-ping absolute" />
        <div className="w-10 h-10 rounded-full bg-[#00e3fd]/25 flex items-center justify-center border border-[#00e3fd]/50">
          <div className="w-3.5 h-3.5 bg-[#00e3fd] rounded-full shadow-[0_0_15px_#00e3fd]" />
        </div>
        <span className="text-[10px] font-mono font-bold text-[#00daf3] bg-[#0d1322]/80 px-2 py-0.5 rounded mt-1 backdrop-blur-sm border border-[#00e3fd]/30">
          GPS LOCK: ANDHERI EAST
        </span>
      </div>

      {/* Interactive Map Nodes / Markers */}
      {/* Marker 1: Andheri East Link (Critical) */}
      <div
        onClick={() => handleMarkerClick(MOCK_ROAD_SEGMENTS[0])}
        className="absolute top-[32%] left-[28%] z-20 cursor-pointer group"
        title="Andheri East Link (Critical Risk)"
      >
        <div className="relative flex items-center justify-center">
          <div className="absolute w-9 h-9 rounded-full bg-[#ff5252]/25 animate-ping" />
          <div className="w-5 h-5 bg-[#ff5252] rounded-full shadow-[0_0_15px_#ff5252] border-2 border-[#0d1322] group-hover:scale-125 transition-transform" />
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-[#151b2b]/95 border border-[#ffb4ab]/40 px-2 py-0.5 rounded text-[10px] font-mono text-[#ffdad6] whitespace-nowrap shadow-lg">
            Andheri Link · Score: 34
          </div>
        </div>
      </div>

      {/* Marker 2: Powai Lake Road (Medium) */}
      <div
        onClick={() => handleMarkerClick(MOCK_ROAD_SEGMENTS[1])}
        className="absolute top-[60%] left-[72%] z-20 cursor-pointer group"
        title="Powai Lake Road (Medium Risk)"
      >
        <div className="relative flex items-center justify-center">
          <div className="w-4 h-4 bg-[#ffa000] rounded-full shadow-[0_0_10px_#ffa000] border-2 border-[#0d1322] group-hover:scale-125 transition-transform" />
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-[#151b2b]/95 border border-[#ffa000]/40 px-2 py-0.5 rounded text-[10px] font-mono text-[#ffa000] whitespace-nowrap shadow-lg">
            Powai Lake · Score: 62
          </div>
        </div>
      </div>

      {/* Marker 3: JVLR Junction (Streetlight Outage) */}
      <div
        onClick={() => handleMarkerClick(MOCK_ROAD_SEGMENTS[2])}
        className="absolute top-[22%] left-[64%] z-20 cursor-pointer group"
        title="JVLR Junction (Lighting Outage)"
      >
        <div className="relative flex items-center justify-center">
          <div className="w-4 h-4 bg-[#00daf3] rounded-full shadow-[0_0_10px_#00daf3] border-2 border-[#0d1322] group-hover:scale-125 transition-transform" />
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-[#151b2b]/95 border border-[#00daf3]/40 px-2 py-0.5 rounded text-[10px] font-mono text-[#00daf3] whitespace-nowrap shadow-lg">
            JVLR Cross · Score: 78
          </div>
        </div>
      </div>

      {/* Marker 4: Civil Lines Delhi */}
      <div
        onClick={() => handleMarkerClick(MOCK_ROAD_SEGMENTS[3])}
        className="absolute top-[40%] left-[45%] z-20 cursor-pointer group"
        title="Civil Lines (Score: 28)"
      >
        <div className="relative flex items-center justify-center">
          <div className="absolute w-8 h-8 rounded-full bg-[#ff5252]/20 animate-pulse" />
          <div className="w-4 h-4 bg-[#ff5252] rounded-full shadow-[0_0_12px_#ff5252] border-2 border-[#0d1322] group-hover:scale-125 transition-transform" />
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-[#151b2b]/95 border border-[#ffb4ab]/40 px-2 py-0.5 rounded text-[10px] font-mono text-[#ffdad6] whitespace-nowrap shadow-lg">
            Civil Lines · Score: 28
          </div>
        </div>
      </div>

      {/* Map Control Tools (Zoom & Layer) */}
      <div className="absolute right-4 top-20 z-20 flex flex-col gap-2">
        <button
          onClick={() => setZoomLevel((z) => Math.min(z + 0.2, 1.6))}
          className="w-8 h-8 rounded-lg bg-[#151b2b]/90 hover:bg-[#242a3a] border border-white/10 text-white font-mono flex items-center justify-center shadow-lg active:scale-95"
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={() => setZoomLevel((z) => Math.max(z - 0.2, 0.8))}
          className="w-8 h-8 rounded-lg bg-[#151b2b]/90 hover:bg-[#242a3a] border border-white/10 text-white font-mono flex items-center justify-center shadow-lg active:scale-95"
          title="Zoom Out"
        >
          -
        </button>
        <button
          onClick={() => setSelectedSegment(MOCK_ROAD_SEGMENTS[0])}
          className="w-8 h-8 rounded-lg bg-[#151b2b]/90 hover:bg-[#242a3a] border border-white/10 text-[#00daf3] flex items-center justify-center shadow-lg active:scale-95"
          title="Recenter GPS"
        >
          <Crosshair className="w-4 h-4" />
        </button>
      </div>

      {/* Detail Panel Bottom Sheet (Matching Stitch Screen Design) */}
      {selectedSegment && (
        <div className="absolute bottom-4 inset-x-4 max-w-xl mx-auto z-30 transform transition-all duration-300 ease-out">
          <div className="w-full rounded-2xl p-5 shadow-2xl relative overflow-hidden bg-[#242a3a]/90 backdrop-blur-2xl border border-white/15">
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
                    {selectedSegment.riskLevel} Risk ({selectedSegment.healthScore}/100)
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
