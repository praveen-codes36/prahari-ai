import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertOctagon,
  TrendingUp,
  Search,
  Filter,
  CheckCircle2,
  Wrench,
  Truck,
  Shield,
  Layers,
  ChevronRight,
  Sparkles,
  Info,
  Calendar,
  X,
  ArrowUpRight,
} from 'lucide-react';
import { AIConfidenceRing } from '../../components/common/AIConfidenceRing';
import { SeverityBadge } from '../../components/common/Badges';
import { MOCK_PRIORITY_QUEUE } from '../../data/mockData';
import { PriorityQueueItem } from '../../types';
import apiClient from '../../services/apiClient';
import { reverseGeocode } from '../../utils/location';

export const RepairPriorityQueue: React.FC = () => {
  const navigate = useNavigate();
  const [queueItems, setQueueItems] = useState<PriorityQueueItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<PriorityQueueItem | null>(null);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [deploySuccess, setDeploySuccess] = useState(false);
  const [selectedCrew, setSelectedCrew] = useState('Quick Response Unit 01 (8 technicians + 1 paver)');
  const [allocatedAsphalt, setAllocatedAsphalt] = useState('5.0 Metric Tons (Polymer Cold-Mix)');
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const fetchQueue = async () => {
      try {
        const response = await apiClient.get('/priority/queue');
        if (response.data.success && response.data.data) {
          // Map backend data to frontend PriorityQueueItem structure
          const formatted = await Promise.all(response.data.data.map(async (item: any, index: number) => {
            let address = item.complaint_id?.location?.address || 'Unknown Location';
            const coords = item.complaint_id?.location?.coordinates || item.road_segment_id?.start_coordinates?.coordinates;
            
            if (coords && coords.length === 2 && (!address || address === 'Unknown Location')) {
              try {
                // coords are usually [lng, lat] in GeoJSON
                const geo = await reverseGeocode(coords[1], coords[0]);
                address = geo.address || geo.city || address;
              } catch (e) {
                console.error("Geocoding failed for item", item._id);
              }
            }

            const severityLevel = item.factors?.severity?.toUpperCase() || 'HIGH';
            const severityScoreMap: Record<string, number> = { 'CRITICAL': 95, 'HIGH': 80, 'MEDIUM': 50, 'LOW': 25 };
            const severityScore = severityScoreMap[severityLevel] || 80;
            
            const trafficLevel = item.factors?.traffic?.toUpperCase() || 'HIGH';
            const trafficScoreMap: Record<string, number> = { 'HIGH': 90, 'MEDIUM': 60, 'LOW': 30 };
            const trafficScore = trafficScoreMap[trafficLevel] || 90;
            const vehiclesPerDay = trafficLevel === 'HIGH' ? 35000 : (trafficLevel === 'MEDIUM' ? 15000 : 5000);

            const accidentHistory = item.factors?.accident_history || 0;
            const accidentScore = Math.min(accidentHistory * 20 + 10, 100);

            const priorityScore = Math.round(item.priority_score || 0);

            const imgPath = item.complaint_id?.photo_url;
            const absoluteImageUrl = imgPath 
                ? (imgPath.startsWith('http') ? imgPath : (imgPath.startsWith('/') ? imgPath : `/${imgPath}`))
                : 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80';

            return {
              id: item.complaint_id?._id || item._id,
              rank: item.rank || (index + 1),
              roadName: item.road_segment_id?.road_name || item.complaint_id?.defect_type || 'Unknown Location',
              district: address,
              city: 'Prayagraj', // Could be extracted from geo.city
              affectedLengthKm: 0.5,
              severityLevel: severityLevel.toLowerCase(),
              triageScore: priorityScore,
              aiConfidence: Math.round((priorityScore + severityScore) / 2), 
              anomaliesDetected: accidentHistory + (item.factors?.location_risk > 50 ? 1 : 0) || 1,
              anomalyDelta: item.factors?.location_risk > 70 ? 'High Risk Zone' : 'Standard Priority',
              accidentCountLast30Days: accidentHistory,
              trafficVolumeText: trafficLevel,
              vehiclesPerDay: vehiclesPerDay,
              imageUrl: absoluteImageUrl,
              reasoning: {
                severityIndex: { score: severityScore, text: `Severity: ${severityLevel}` },
                locationRisk: { score: item.factors?.location_risk || 80, text: `Location risk score: ${item.factors?.location_risk || 80}` },
                accidentCorrelation: { score: accidentScore, text: `${accidentHistory} recent accidents recorded.` },
                trafficImpact: { score: trafficScore, text: `Traffic Volume: ${trafficLevel} (${vehiclesPerDay.toLocaleString()} veh/day)` },
              },
              recommendedAction: severityLevel === 'CRITICAL' ? 'Immediate Deployment Required' : 'Schedule within 48 hours',
              allocatedDepartment: item.complaint_id?.assigned_department_id?.name || 'PWD',
              estimatedRepairCost: '₹' + (priorityScore * 1200 + 15000).toLocaleString('en-IN'),
              requiredCrew: severityLevel === 'CRITICAL' ? 'Heavy Paver Squad' : 'Quick Response Unit',
            };
          }));
          setQueueItems(formatted);
          if (formatted.length > 0) setSelectedItem(formatted[0]);
        }
      } catch (error) {
        console.error('Failed to fetch priority queue:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQueue();
  }, []);

  const handleDeployCrew = async () => {
    if (!selectedItem) return;
    try {
      await apiClient.patch(`/complaints/${selectedItem.id}/status`, { status: "ASSIGNED" });
      setDeploySuccess(true);
      setTimeout(() => {
        setDeploySuccess(false);
        setShowDeployModal(false);
        // Refresh the queue locally or re-fetch
        setQueueItems(queueItems.filter(i => i.id !== selectedItem.id));
        setSelectedItem(queueItems.find(i => i.id !== selectedItem.id) || null);
      }, 1800);
    } catch (e) {
      console.error("Failed to assign crew", e);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-96 text-[#00daf3]">Loading Priority Queue...</div>;
  }

  if (!selectedItem) {
    return <div className="flex items-center justify-center h-96 text-white">No items in the Priority Queue.</div>;
  }

  return (
    <div className="space-y-6 pb-20 pt-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#ff5252] bg-[#93000a]/30 px-2 py-0.5 rounded border border-[#ffb4ab]/30">
              AI NEURAL TRIAGE QUEUE
            </span>
            <span className="text-[10px] font-mono text-[#8c90a1]">Ranked by Accident Risk & Traffic Impact</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            AI Repair Priority Queue
          </h1>
          <p className="text-xs md:text-sm text-[#8c90a1]">
            Multi-variable algorithmic scoring determines repair precedence across municipal and national highway networks.
          </p>
        </div>

        <button
          onClick={() => setShowDeployModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#b3c5ff] hover:bg-[#dae1ff] text-[#002b75] font-bold text-xs shadow-[0_0_20px_rgba(179,197,255,0.4)] transition-all active:scale-95"
        >
          <Truck className="w-4 h-4 stroke-[2.5]" />
          <span>Deploy Field Crew for #{selectedItem.rank}</span>
        </button>
      </div>

      {/* Hero Card: Currently Selected / #1 Priority Item (Matching Stitch Screen Layout) */}
      <div className="bg-[#151b2b] rounded-2xl p-6 md:p-8 border border-white/15 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column: Image with Overlays */}
          <div className="w-full lg:w-5/12 space-y-3 shrink-0">
            <div className="relative h-64 md:h-72 rounded-2xl overflow-hidden bg-[#080e1d] border border-white/10 shadow-lg">
              <img
                src={selectedItem.imageUrl}
                alt={selectedItem.roadName}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/sample_images/pothole_critical_deep.jpg';
                }}
              />
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-[#93000a] text-[#ffdad6] font-mono text-sm font-bold flex items-center justify-center shadow-lg">
                  #{selectedItem.rank}
                </span>
                <SeverityBadge severity={selectedItem.severityLevel} size="md" />
              </div>
              <div className="absolute bottom-3 inset-x-3 bg-[#0d1322]/85 backdrop-blur-md p-2.5 rounded-xl border border-white/10 flex items-center justify-between text-xs font-mono">
                <span className="text-[#8c90a1]">Issues: <strong className="text-white">{selectedItem.anomaliesDetected}</strong></span>
                <span className="text-[#ffb4ab] font-bold">{selectedItem.anomalyDelta}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-[#191f2f] p-2.5 rounded-xl border border-white/5">
                <span className="text-[10px] text-[#8c90a1] block">Traffic Volume</span>
                <strong className="text-white">{selectedItem.vehiclesPerDay.toLocaleString()} veh/day</strong>
              </div>
              <div className="bg-[#191f2f] p-2.5 rounded-xl border border-white/5">
                <span className="text-[10px] text-[#8c90a1] block">Estimated Cost</span>
                <strong className="text-[#00daf3]">{selectedItem.estimatedRepairCost}</strong>
              </div>
            </div>
          </div>

          {/* Right Column: Deep Algorithmic Reasoning & Score Gauges */}
          <div className="flex-1 space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="text-xs font-mono text-[#00daf3]">
                  {selectedItem.district}, {selectedItem.city}
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-white mt-0.5">
                  {selectedItem.roadName}
                </h2>
                <p className="text-xs text-[#8c90a1] mt-1 font-mono">
                  Allocated Department: <strong className="text-white">{selectedItem.allocatedDepartment}</strong>
                </p>
              </div>

              {/* Priority Check Score & AI Confidence Gauges */}
              <div className="flex items-center gap-4 bg-[#191f2f] p-3 rounded-2xl border border-white/10">
                <div className="text-right">
                  <span className="text-[10px] font-mono text-[#8c90a1] block">TRIAGE SCORE</span>
                  <span className="text-2xl font-bold text-[#ffb4ab] font-mono leading-none">
                    {selectedItem.triageScore}/100
                  </span>
                </div>
                <div className="border-l border-white/10 pl-3 flex items-center gap-2">
                  <AIConfidenceRing score={selectedItem.aiConfidence} size={48} />
                </div>
              </div>
            </div>

            {/* Algorithmic Reasoning 4-Point Factor Breakdown (Matching Stitch Screen) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs font-mono text-[#8c90a1]">
                <span className="uppercase font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#00daf3]" />
                  AI Algorithmic Reasoning Matrix
                </span>
                <span>Smart Weighting Engine</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Severity Index */}
                <div className="bg-[#191f2f] p-3.5 rounded-xl border border-white/5 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white font-mono">1. Severity Index</span>
                    <span className="text-xs font-bold text-[#ffb4ab] font-mono">
                      {selectedItem.reasoning.severityIndex.score}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#0d1322] rounded-full overflow-hidden">
                    <div className="h-full bg-[#ff5252]" style={{ width: `${selectedItem.reasoning.severityIndex.score}%` }} />
                  </div>
                  <p className="text-[11px] text-[#c2c6d8] leading-relaxed">
                    {selectedItem.reasoning.severityIndex.text}
                  </p>
                </div>

                {/* 2. Location Risk */}
                <div className="bg-[#191f2f] p-3.5 rounded-xl border border-white/5 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white font-mono">2. Location Risk</span>
                    <span className="text-xs font-bold text-[#ffa000] font-mono">
                      {selectedItem.reasoning.locationRisk.score}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#0d1322] rounded-full overflow-hidden">
                    <div className="h-full bg-[#ffa000]" style={{ width: `${selectedItem.reasoning.locationRisk.score}%` }} />
                  </div>
                  <p className="text-[11px] text-[#c2c6d8] leading-relaxed">
                    {selectedItem.reasoning.locationRisk.text}
                  </p>
                </div>

                {/* 3. Accident Correlation */}
                <div className="bg-[#191f2f] p-3.5 rounded-xl border border-white/5 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white font-mono">3. Accident History Correlation</span>
                    <span className="text-xs font-bold text-[#ffb4ab] font-mono">
                      {selectedItem.reasoning.accidentCorrelation.score}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#0d1322] rounded-full overflow-hidden">
                    <div className="h-full bg-[#ff5252]" style={{ width: `${selectedItem.reasoning.accidentCorrelation.score}%` }} />
                  </div>
                  <p className="text-[11px] text-[#c2c6d8] leading-relaxed">
                    {selectedItem.reasoning.accidentCorrelation.text}
                  </p>
                </div>

                {/* 4. Traffic Impact */}
                <div className="bg-[#191f2f] p-3.5 rounded-xl border border-white/5 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white font-mono">4. Traffic Impact</span>
                    <span className="text-xs font-bold text-[#00daf3] font-mono">
                      {selectedItem.reasoning.trafficImpact.score}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#0d1322] rounded-full overflow-hidden">
                    <div className="h-full bg-[#00daf3]" style={{ width: `${selectedItem.reasoning.trafficImpact.score}%` }} />
                  </div>
                  <p className="text-[11px] text-[#c2c6d8] leading-relaxed">
                    {selectedItem.reasoning.trafficImpact.text}
                  </p>
                </div>
              </div>
            </div>

            {/* Recommended Action CTA */}
            <div className="bg-[#00e3fd]/10 border border-[#00e3fd]/30 rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
              <div className="text-[#c2c6d8]">
                <strong className="text-white block">Recommended Operational Action:</strong>
                <span>{selectedItem.recommendedAction}</span>
              </div>
              <button
                onClick={() => setShowDeployModal(true)}
                className="px-4 py-2 rounded-lg bg-[#00daf3] hover:bg-[#00e3fd] text-[#002b75] font-bold font-mono text-xs shrink-0 shadow-lg"
              >
                Authorize Dispatch
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Subsequent Ranked Queue Items List */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#00daf3]" />
          Subsequent Prioritized Road Network Targets
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {queueItems.map((item) => {
            const isSelected = selectedItem.id === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`p-4 rounded-xl border transition-all cursor-pointer shadow-lg relative ${
                  isSelected
                    ? 'bg-[#191f2f] border-[#00daf3] shadow-[0_0_15px_rgba(0,227,253,0.2)]'
                    : 'bg-[#151b2b] border-white/10 hover:bg-[#191f2f]'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-[#242a3a] text-white font-mono text-xs font-bold flex items-center justify-center">
                      #{item.rank}
                    </span>
                    <span className="font-bold text-white text-sm line-clamp-1">{item.roadName}</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-[#00daf3]">
                    {item.triageScore}/100
                  </span>
                </div>

                <p className="text-xs text-[#8c90a1] line-clamp-2 mb-3">
                  {item.reasoning.severityIndex.text}
                </p>

                <div className="flex items-center justify-between text-[10px] font-mono text-[#8c90a1] pt-2 border-t border-white/5">
                  <span>{item.city}</span>
                  <span className="text-white">{item.anomaliesDetected} Issues</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Crew Deployment Authorization Modal */}
      {showDeployModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#151b2b] rounded-2xl border border-white/15 max-w-lg w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowDeployModal(false)}
              className="absolute top-4 right-4 text-[#8c90a1] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#b3c5ff]/10 text-[#b3c5ff] flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Deploy Field Repair Crew</h3>
                <span className="text-xs font-mono text-[#00daf3]">Target: {selectedItem.roadName} (Rank #{selectedItem.rank})</span>
              </div>
            </div>

            {deploySuccess ? (
              <div className="py-8 text-center space-y-2 animate-in zoom-in-95 duration-200">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="text-base font-bold text-white">Work Order Generated & Dispatched</h4>
                <p className="text-xs text-[#8c90a1]">Crew Unit 01 notified with priority GPS route lock.</p>
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-mono text-[#8c90a1] mb-1">
                    Select Quick Response Unit
                  </label>
                  <select
                    value={selectedCrew}
                    onChange={(e) => setSelectedCrew(e.target.value)}
                    className="w-full bg-[#191f2f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00daf3]"
                  >
                    <option>Quick Response Unit 01 (8 technicians + 1 paver)</option>
                    <option>Suburban Heavy Paver Squad 04 (12 technicians + 2 rollers)</option>
                    <option>Overnight Micro-Surfacing Contractor Team Alpha</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#8c90a1] mb-1">
                    Asphalt / Material Batch Allocation
                  </label>
                  <input
                    type="text"
                    value={allocatedAsphalt}
                    onChange={(e) => setAllocatedAsphalt(e.target.value)}
                    className="w-full bg-[#191f2f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00daf3]"
                  />
                </div>

                <div className="p-3 rounded-xl bg-[#0d1322] border border-white/5 text-xs text-[#8c90a1] space-y-1">
                  <div className="flex justify-between">
                    <span>Estimated Budget Draw:</span>
                    <strong className="text-white">{selectedItem.estimatedRepairCost}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Scheduled Execution:</span>
                    <strong className="text-[#00daf3]">Immediate Emergency Window</strong>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowDeployModal(false)}
                    className="px-4 py-2 rounded-xl bg-[#191f2f] text-xs font-mono text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeployCrew}
                    className="px-6 py-2 rounded-xl bg-[#b3c5ff] text-[#002b75] font-bold text-xs shadow-lg hover:bg-[#dae1ff]"
                  >
                    Confirm & Dispatch Crew
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
