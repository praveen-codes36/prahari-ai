import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  AlertTriangle,
  Zap,
  Calendar,
  Sparkles,
  DollarSign,
  ChevronRight,
  ShieldCheck,
  Activity,
  Layers,
  ArrowUpRight,
  FileCheck2,
  Sliders,
  CloudRain,
  Truck,
  Wrench,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ExternalLink,
  Info,
  X,
} from 'lucide-react';
import { PredictiveAsset } from '../../types';
import apiClient from '../../services/apiClient';

export const PredictiveMaintenancePage: React.FC = () => {
  const navigate = useNavigate();
  const [assets, setAssets] = useState<PredictiveAsset[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const response = await apiClient.get('/maintenance/predictions');
        if (response.data.success && response.data.data) {
          const formatted = response.data.data.map((item: any) => {
            const currentRisk = item.current_risk_score || 50;
            const pred30 = item.predicted_risk_score_30d || currentRisk + 10;
            return {
              id: item._id,
              name: item.road_segment_id?.road_name || 'Unknown Asset',
              assetType: 'Highway Segment',
              location: 'Prayagraj', // Should map to reverse geo later
              currentHealthPct: 100 - currentRisk,
              health30d: 100 - pred30,
              health60d: Math.max(5, 100 - pred30 - 15),
              health90d: Math.max(5, 100 - pred30 - 30),
              failureProbabilityPct: currentRisk,
              recommendedInterventionDays: item.recommended_intervention_days || (30 - Math.round(currentRisk / 10)),
              estimatedPreventiveCostInr: item.estimated_preventive_cost || 150000,
              estimatedCatastrophicCostInr: item.estimated_catastrophic_cost || 2500000,
              expectedDowntimeDays: 5,
              publicImpactScore: 85,
              aiPredictionSummary: item.reasoning?.join(' ') || 'Risk predicted based on historical complaint speed and structural decay rates.',
              stressFactors: [
                { name: 'Axle Load Shear', level: 'HIGH', description: 'Heavy freight divergence.' },
                { name: 'Monsoon Cavitation', level: 'MEDIUM', description: 'Subgrade washout.' }
              ],
              inspectionsCount: 4,
              lastUltrasoundScan: new Date().toLocaleDateString()
            };
          });
          setAssets(formatted);
          if (formatted.length > 0) setSelectedAssetId(formatted[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch predictions', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPredictions();
  }, []);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'risk' | 'urgency' | 'savings'>('risk');

  // What-If Simulation Modifiers
  const [monsoonModifier, setMonsoonModifier] = useState<'normal' | 'moderate' | 'cloudburst'>('normal');
  const [trafficDivertModifier, setTrafficDivertModifier] = useState<'normal' | 'diverted' | 'overload'>('normal');
  const [simulatedRepairApplied, setSimulatedRepairApplied] = useState(false);

  // Work Order Modal State
  const [showWorkOrderModal, setShowWorkOrderModal] = useState(false);
  const [workOrderSuccess, setWorkOrderSuccess] = useState(false);
  const [targetDepartment, setTargetDepartment] = useState('NHAI Heavy Civil Priority Check Cell');
  const [scheduledInterventionDate, setScheduledInterventionDate] = useState('Within 7 Days');
  const [assignedCrew, setAssignedCrew] = useState('Team Alpha (Squad 04)');

  const selectedAsset = useMemo(() => {
    return assets.find((a) => a.id === selectedAssetId) || assets[0];
  }, [assets, selectedAssetId]);

  // Filtered & Sorted Assets
  const filteredAssets = useMemo(() => {
    return assets
      .filter((a) => {
        const matchesSearch =
          a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = selectedType === 'ALL' || a.assetType === selectedType;
        return matchesSearch && matchesType;
      })
      .sort((a, b) => {
        if (sortBy === 'risk') return b.failureProbabilityPct - a.failureProbabilityPct;
        if (sortBy === 'urgency') return a.recommendedInterventionDays - b.recommendedInterventionDays;
        if (sortBy === 'savings') {
          const savingsA = a.estimatedCatastrophicCostInr - a.estimatedPreventiveCostInr;
          const savingsB = b.estimatedCatastrophicCostInr - b.estimatedPreventiveCostInr;
          return savingsB - savingsA;
        }
        return 0;
      });
  }, [assets, searchQuery, selectedType, sortBy]);

  // Overall Portfolio Totals
  const totalPreventiveBudget = useMemo(() => {
    return assets.reduce((sum, a) => sum + a.estimatedPreventiveCostInr, 0);
  }, [assets]);

  const totalCatastrophicLoss = useMemo(() => {
    return assets.reduce((sum, a) => sum + a.estimatedCatastrophicCostInr, 0);
  }, [assets]);

  const totalSavings = totalCatastrophicLoss - totalPreventiveBudget;
  const savingsPct = ((totalSavings / totalCatastrophicLoss) * 100).toFixed(1);

  // Calculate dynamic health curve under simulation modifiers
  const dynamicHealth = useMemo(() => {
    if (simulatedRepairApplied) {
      return {
        current: 96,
        d30: 95,
        d60: 94,
        d90: 93,
        failureProb: 3.2,
        windowDays: 365,
      };
    }

    let d30Delta = 0;
    let d60Delta = 0;
    let d90Delta = 0;
    let riskDelta = 0;

    if (monsoonModifier === 'moderate') {
      d30Delta -= 4;
      d60Delta -= 8;
      d90Delta -= 12;
      riskDelta += 6;
    } else if (monsoonModifier === 'cloudburst') {
      d30Delta -= 9;
      d60Delta -= 18;
      d90Delta -= 26;
      riskDelta += 14;
    }

    if (trafficDivertModifier === 'diverted') {
      d30Delta += 3;
      d60Delta += 6;
      d90Delta += 10;
      riskDelta -= 8;
    } else if (trafficDivertModifier === 'overload') {
      d30Delta -= 5;
      d60Delta -= 10;
      d90Delta -= 15;
      riskDelta += 9;
    }

    const current = selectedAsset.currentHealthPct;
    const d30 = Math.max(5, Math.min(100, selectedAsset.health30d + d30Delta));
    const d60 = Math.max(5, Math.min(100, selectedAsset.health60d + d60Delta));
    const d90 = Math.max(5, Math.min(100, selectedAsset.health90d + d90Delta));
    const failureProb = Math.max(2, Math.min(99.9, selectedAsset.failureProbabilityPct + riskDelta));
    const windowDays = Math.max(3, Math.round(selectedAsset.recommendedInterventionDays * (1 - riskDelta / 100)));

    return {
      current,
      d30,
      d60,
      d90,
      failureProb: Number(failureProb.toFixed(1)),
      windowDays,
    };
  }, [selectedAsset, monsoonModifier, trafficDivertModifier, simulatedRepairApplied]);

  const handleGenerateWorkOrder = () => {
    setWorkOrderSuccess(true);
    setTimeout(() => {
      setShowWorkOrderModal(false);
      setWorkOrderSuccess(false);
      navigate('/authority/work-orders');
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-20 pt-1">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0e1626] p-5 md:p-6 rounded-2xl border border-slate-800 shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#00e3fd] bg-cyan-950/70 px-2.5 py-0.5 rounded border border-cyan-500/30 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#00e3fd] animate-pulse" />
              PRAHARI FUTURE DAMAGE PREDICTIONS
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
              30-90 DAY PREDICTION
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Future Road Maintenance
          </h1>
          <p className="text-xs md:text-sm text-slate-300 max-w-3xl mt-1">
            Predicting road and bridge damage 30 to 90 days before it happens, so repairs can be done early.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={() => setShowWorkOrderModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 hover:from-blue-500 hover:to-cyan-300 text-[#001738] font-black text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Create Repair Order</span>
          </button>
        </div>
      </div>

      {/* Municipal Portfolio ROI & Risk Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#0e1626] border border-slate-800 space-y-1">
          <div className="text-[10px] font-mono uppercase text-slate-400 flex items-center justify-between">
            <span>TRACKED ROADS</span>
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-2xl font-mono font-black text-white">{assets.length} Assets</div>
          <div className="text-[10px] text-slate-400">Bridges, Flyovers, Tunnels & Highways</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0e1626] border border-amber-500/30 space-y-1">
          <div className="text-[10px] font-mono uppercase text-amber-400 flex items-center justify-between">
            <span>HIGH DAMAGE RISK</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-mono font-black text-amber-300">
            {assets.filter((a) => a.failureProbabilityPct > 70).length} Critical
          </div>
          <div className="text-[10px] text-amber-400/80">Failure likelihood &gt;70% within 90 days</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0e1626] border border-cyan-500/30 space-y-1">
          <div className="text-[10px] font-mono uppercase text-cyan-400 flex items-center justify-between">
            <span>ESTIMATED REPAIR COST</span>
            <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-2xl font-mono font-black text-cyan-300">
            ₹{(totalPreventiveBudget / 100000).toFixed(1)} Lakhs
          </div>
          <div className="text-[10px] text-slate-400">Immediate micro-surfacing & grouting</div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/40 space-y-1">
          <div className="text-[10px] font-mono uppercase text-emerald-400 flex items-center justify-between">
            <span>MONEY SAVED BY FIXING EARLY</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-mono font-black text-emerald-300">
            ₹{(totalSavings / 10000000).toFixed(2)} Crores
          </div>
          <div className="text-[10px] text-emerald-400/90 font-mono font-bold">
            {savingsPct}% Net Municipal Capital Saved
          </div>
        </div>
      </div>

      {/* Filters & Control Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#0e1626] p-3.5 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 flex-1 max-w-md bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-800">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search asset, corridor, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            {['ALL', 'Bridge', 'Expressway Flyover', 'Highway Segment', 'Underpass Tunnel'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap ${
                  selectedType === type
                    ? 'bg-blue-600 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {type === 'ALL' ? 'All Types' : type}
              </button>
            ))}
          </div>

          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="bg-slate-900 text-slate-300 text-xs font-mono px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="risk">Sort: Highest Failure Risk</option>
            <option value="urgency">Sort: Most Urgent Window</option>
            <option value="savings">Sort: Maximum Budget Savings</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Asset Selector & Deep-Dive Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): Predictive Assets Feed */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-400 uppercase px-1">
            <span>AT-RISK ROADS ({filteredAssets.length})</span>
            <span className="text-[10px] text-cyan-400">Click to inspect</span>
          </div>

          <div className="space-y-3">
            {filteredAssets.map((asset) => {
              const isSelected = selectedAsset.id === asset.id;
              const savingsLakhs = ((asset.estimatedCatastrophicCostInr - asset.estimatedPreventiveCostInr) / 100000).toFixed(1);

              return (
                <div
                  key={asset.id}
                  onClick={() => {
                    setSelectedAssetId(asset.id);
                    setSimulatedRepairApplied(false);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                    isSelected
                      ? 'bg-[#0e1626] border-cyan-500 shadow-[0_0_25px_rgba(0,227,253,0.18)] ring-1 ring-cyan-500/50'
                      : 'bg-[#0e1626]/70 border-slate-800 hover:bg-[#0e1626] hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-cyan-400">{asset.id}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/70 text-cyan-300 border border-cyan-500/20">
                          {asset.assetType}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1 line-clamp-1">{asset.name}</h4>
                      <div className="text-xs text-slate-400 line-clamp-1">{asset.location}</div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span
                        className={`text-xs font-mono font-black px-2 py-0.5 rounded border ${
                          asset.failureProbabilityPct > 80
                            ? 'text-red-300 bg-red-950/80 border-red-500/50'
                            : asset.failureProbabilityPct > 60
                            ? 'text-amber-300 bg-amber-950/80 border-amber-500/50'
                            : 'text-emerald-300 bg-emerald-950/80 border-emerald-500/50'
                        }`}
                      >
                        {asset.failureProbabilityPct}% Risk
                      </span>
                      <div className="text-[10px] font-mono text-emerald-400 mt-1">
                        Save ₹{savingsLakhs}L
                      </div>
                    </div>
                  </div>

                  {/* 4-Step Health Forecast Pills */}
                  <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-mono pt-2 border-t border-slate-800/80">
                    <div className="bg-slate-900/90 p-1.5 rounded-lg">
                      <span className="text-slate-400 block text-[9px]">NOW</span>
                      <span className="text-emerald-400 font-bold">{asset.currentHealthPct}%</span>
                    </div>
                    <div className="bg-slate-900/90 p-1.5 rounded-lg">
                      <span className="text-slate-400 block text-[9px]">+30D</span>
                      <span className="text-amber-400 font-bold">{asset.health30d}%</span>
                    </div>
                    <div className="bg-slate-900/90 p-1.5 rounded-lg">
                      <span className="text-slate-400 block text-[9px]">+60D</span>
                      <span className="text-orange-400 font-bold">{asset.health60d}%</span>
                    </div>
                    <div className="bg-slate-900/90 p-1.5 rounded-lg">
                      <span className="text-slate-400 block text-[9px]">+90D</span>
                      <span className="text-red-400 font-bold">{asset.health90d}%</span>
                    </div>
                  </div>

                  {/* Urgency Window Footnote */}
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-0.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      Repair Window: <strong className="text-amber-300 font-bold">{asset.recommendedInterventionDays} Days</strong>
                    </span>
                    <span className="text-slate-400">Impact Score: {asset.publicImpactScore}/100</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (7 Cols): 30/60/90 Day Damage Curve & What-If Workbench */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Inspection Workbench Card */}
          <div className="bg-[#0e1626] p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
            {/* Header with Asset Details */}
            <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/70 px-2.5 py-0.5 rounded border border-cyan-500/30">
                    {selectedAsset.id}
                  </span>
                  <span className="text-xs font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                    {selectedAsset.assetType}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                    <Activity className="w-3 h-3 text-cyan-400" />
                    Last Scan: {selectedAsset.lastUltrasoundScan}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white mt-1.5">{selectedAsset.name}</h2>
                <div className="text-xs text-slate-400 mt-0.5">{selectedAsset.location}</div>
              </div>

              <div className="text-left sm:text-right flex sm:flex-col items-center sm:items-end justify-between gap-1">
                <div className="text-[10px] font-mono text-slate-400 uppercase">RECOMMENDED WINDOW</div>
                <div className="text-xs font-mono font-black text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded-lg border border-amber-500/40">
                  {dynamicHealth.windowDays} Days Remaining
                </div>
              </div>
            </div>

            {/* AI Damage Curve Trend (SVG Visualization) */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-white font-bold uppercase flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  Road Damage Prediction (0 to 90 Days):
                </span>
                <span className="text-slate-400">
                  Failure Risk: <strong className="text-red-400 font-bold">{dynamicHealth.failureProb}%</strong>
                </span>
              </div>

              {/* Dynamic SVG Visualizer */}
              <div className="relative h-44 w-full bg-slate-900/60 rounded-xl p-3 border border-slate-800 overflow-hidden">
                {/* Danger Zone Threshold Line (<35%) */}
                <div className="absolute left-8 right-4 bottom-[35%] border-b border-dashed border-red-500/50 flex items-center justify-between text-[9px] font-mono text-red-400 pointer-events-none z-0">
                  <span>DANGEROUS DAMAGE LEVEL (35%)</span>
                  <span>COLLAPSE DANGER ZONE</span>
                </div>

                {/* SVG Curve */}
                <svg className="w-full h-full overflow-visible" viewBox="0 0 400 120" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="gradCurve" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="40%" stopColor="#f59e0b" />
                      <stop offset="70%" stopColor="#f97316" />
                      <stop offset="100%" stopColor="#ef4444" />
                    </linearGradient>
                    <linearGradient id="areaFill" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#00e3fd" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#00e3fd" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Path Calculation based on dynamicHealth */}
                  {(() => {
                    const y0 = 110 - (dynamicHealth.current / 100) * 95;
                    const y30 = 110 - (dynamicHealth.d30 / 100) * 95;
                    const y60 = 110 - (dynamicHealth.d60 / 100) * 95;
                    const y90 = 110 - (dynamicHealth.d90 / 100) * 95;

                    const dPath = `M 30 ${y0} C 80 ${y0}, 110 ${y30}, 150 ${y30} C 190 ${y30}, 230 ${y60}, 270 ${y60} C 310 ${y60}, 350 ${y90}, 380 ${y90}`;
                    const dArea = `M 30 ${y0} C 80 ${y0}, 110 ${y30}, 150 ${y30} C 190 ${y30}, 230 ${y60}, 270 ${y60} C 310 ${y60}, 350 ${y90}, 380 ${y90} L 380 115 L 30 115 Z`;

                    return (
                      <>
                        <path d={dArea} fill="url(#areaFill)" />
                        <path d={dPath} fill="none" stroke="url(#gradCurve)" strokeWidth="3.5" strokeLinecap="round" />

                        {/* Points */}
                        <circle cx="30" cy={y0} r="5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
                        <circle cx="150" cy={y30} r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
                        <circle cx="270" cy={y60} r="5" fill="#f97316" stroke="#ffffff" strokeWidth="1.5" />
                        <circle cx="380" cy={y90} r="5" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                      </>
                    );
                  })()}
                </svg>

                {/* X Axis Labels */}
                <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-1 px-2">
                  <span>Day 0 (Now): <strong className="text-emerald-400">{dynamicHealth.current}%</strong></span>
                  <span>+30 Days: <strong className="text-amber-400">{dynamicHealth.d30}%</strong></span>
                  <span>+60 Days: <strong className="text-orange-400">{dynamicHealth.d60}%</strong></span>
                  <span>+90 Days: <strong className="text-red-400">{dynamicHealth.d90}%</strong></span>
                </div>
              </div>

              {/* 4 Health Metrics Box */}
              <div className="grid grid-cols-4 gap-2.5 text-center">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-0.5">
                  <div className="text-[10px] font-mono text-slate-400">TODAY</div>
                  <div className="text-lg font-mono font-black text-emerald-400">{dynamicHealth.current}%</div>
                  <div className="text-[9px] text-slate-400">Surface Micro-Wear</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-amber-500/30 space-y-0.5">
                  <div className="text-[10px] font-mono text-slate-400">+30 DAYS</div>
                  <div className="text-lg font-mono font-black text-amber-400">{dynamicHealth.d30}%</div>
                  <div className="text-[9px] text-amber-300">Joint Delamination</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-orange-500/30 space-y-0.5">
                  <div className="text-[10px] font-mono text-slate-400">+60 DAYS</div>
                  <div className="text-lg font-mono font-black text-orange-400">{dynamicHealth.d60}%</div>
                  <div className="text-[9px] text-orange-300">Subgrade Cavity</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-red-500/40 space-y-0.5">
                  <div className="text-[10px] font-mono text-slate-400">+90 DAYS</div>
                  <div className="text-lg font-mono font-black text-red-400">{dynamicHealth.d90}%</div>
                  <div className="text-[9px] text-red-300 font-bold">Major Void</div>
                </div>
              </div>
            </div>

            {/* What-If Simulation Stress Test Modifiers */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-[#0e1626] border border-cyan-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  Test Different Conditions:
                </span>
                {simulatedRepairApplied && (
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/40">
                    SIMULATION: PREVENTIVE INTERVENTION ACTIVE
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {/* Monsoon Modifier */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                    <CloudRain className="w-3 h-3 text-blue-400" />
                    Monsoon Downpour:
                  </label>
                  <select
                    value={monsoonModifier}
                    onChange={(e: any) => {
                      setMonsoonModifier(e.target.value);
                      setSimulatedRepairApplied(false);
                    }}
                    className="w-full bg-slate-950 text-white font-mono text-[11px] p-2 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="normal">Normal Rainfall (Baseline)</option>
                    <option value="moderate">+50mm Heavy Downpour (+15% Wear)</option>
                    <option value="cloudburst">+150mm Cloudburst (+35% Cavity Risk)</option>
                  </select>
                </div>

                {/* Axle Load Modifier */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                    <Truck className="w-3 h-3 text-amber-400" />
                    Heavy Freight Load:
                  </label>
                  <select
                    value={trafficDivertModifier}
                    onChange={(e: any) => {
                      setTrafficDivertModifier(e.target.value);
                      setSimulatedRepairApplied(false);
                    }}
                    className="w-full bg-slate-950 text-white font-mono text-[11px] p-2 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="normal">Standard Freight Volume (28k VPD)</option>
                    <option value="diverted">-30% Divert Heavy Multi-Axle</option>
                    <option value="overload">+40% Peak Overload Freight Corridor</option>
                  </select>
                </div>

                {/* Simulate Preventive Fix */}
                <div className="space-y-1 flex flex-col justify-end">
                  <button
                    onClick={() => setSimulatedRepairApplied(!simulatedRepairApplied)}
                    className={`w-full p-2 rounded-xl font-mono text-[11px] font-bold transition-all border flex items-center justify-center gap-1.5 ${
                      simulatedRepairApplied
                        ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500 shadow-md'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    }`}
                  >
                    <Wrench className="w-3 h-3" />
                    <span>{simulatedRepairApplied ? 'Reset to Real Data Info' : 'Simulate Preventive Fix'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* AI Diagnostics & Mechanical Stress Factor Breakdown */}
            <div className="space-y-3">
              <div className="text-xs font-mono font-bold text-slate-400 uppercase">
                REASONS FOR DAMAGE:
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedAsset.stressFactors.map((factor, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{factor.name}</span>
                      <span
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${
                          factor.level === 'HIGH'
                            ? 'text-red-300 bg-red-950/80 border-red-500/40'
                            : factor.level === 'MEDIUM'
                            ? 'text-amber-300 bg-amber-950/80 border-amber-500/40'
                            : 'text-slate-300 bg-slate-800 border-slate-700'
                        }`}
                      >
                        {factor.level} IMPACT
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">{factor.description}</p>
                  </div>
                ))}
              </div>

              {/* AI Prediction Summary Box */}
              <div className="p-4 rounded-xl bg-slate-900 border border-cyan-500/30 space-y-1.5">
                <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI SUGGESTIONS FOR REPAIR:
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {selectedAsset.aiPredictionSummary}
                </p>
              </div>
            </div>

            {/* Economic ROI Cost Comparison */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/50 via-cyan-950/30 to-slate-900 border border-emerald-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  FINANCIAL IMPACT & MUNICIPAL ROI COMPARISON:
                </span>
                <span className="text-xs font-mono font-black text-emerald-300 bg-emerald-950 px-2.5 py-0.5 rounded border border-emerald-500/50">
                  {((1 - selectedAsset.estimatedPreventiveCostInr / selectedAsset.estimatedCatastrophicCostInr) * 100).toFixed(1)}% BUDGET SAVED
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/40">
                  <div className="text-slate-400 text-[10px]">PREVENTIVE INTERVENTION (SCHEDULED NOW)</div>
                  <div className="text-xl font-black text-emerald-400 mt-1">
                    ₹{selectedAsset.estimatedPreventiveCostInr.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Polymer micro-surfacing, elastomer pad replacement & drainage sealing. (Downtime: {selectedAsset.expectedDowntimeDays} Days)
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-red-500/40">
                  <div className="text-slate-400 text-[10px]">POST-COLLAPSE EMERGENCY RECONSTRUCTION</div>
                  <div className="text-xl font-black text-red-400 mt-1">
                    ₹{selectedAsset.estimatedCatastrophicCostInr.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Full corridor closure, structural pile reconstruction, and emergency bypass routing.
                  </div>
                </div>
              </div>

              <div className="text-xs font-mono text-cyan-300 text-center pt-1">
                Net Municipal Savings:{' '}
                <strong className="text-emerald-400 font-black text-sm">
                  ₹{((selectedAsset.estimatedCatastrophicCostInr - selectedAsset.estimatedPreventiveCostInr) / 100000).toFixed(1)} Lakhs
                </strong>{' '}
                by executing preventive work order in current window.
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <button
                onClick={() => navigate('/authority/smart system-loop')}
                className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-mono transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Inspect 12-Stage Smart System Loop Architecture</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setShowWorkOrderModal(true)}
                className="py-2.5 px-6 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 hover:from-blue-500 hover:to-cyan-300 text-[#001738] font-black text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
              >
                Dispatch Preventive Squad
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preventive Work Order Creation Modal */}
      {showWorkOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-[#0e1626] border border-cyan-500/50 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">
                  AUTHORITY PREVENTIVE ACTION
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">Generate Preventive Work Order</h3>
              </div>
              <button
                onClick={() => setShowWorkOrderModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="text-slate-400 text-[10px]">TARGET ASSET:</div>
                <div className="text-white font-bold">{selectedAsset.name}</div>
                <div className="text-slate-400 text-[11px]">{selectedAsset.location}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400">ASSIGNED SQUAD</label>
                  <select
                    value={assignedCrew}
                    onChange={(e) => setAssignedCrew(e.target.value)}
                    className="w-full bg-slate-900 text-white text-xs p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Team Alpha (Squad 04)">Team Alpha (Squad 04 - Micro-Pave)</option>
                    <option value="Team Bravo (Squad 01)">Team Bravo (Squad 01 - Heavy Civil)</option>
                    <option value="Team Charlie (Squad 02)">Team Charlie (Squad 02 - Structural Grout)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400">SCHEDULE WINDOW</label>
                  <select
                    value={scheduledInterventionDate}
                    onChange={(e) => setScheduledInterventionDate(e.target.value)}
                    className="w-full bg-slate-900 text-white text-xs p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Within 7 Days">Immediate (Next 7 Days)</option>
                    <option value="Within 14 Days">Target Window (Next 14 Days)</option>
                    <option value="Within 30 Days">Preventive (Next 30 Days)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400">DEPARTMENT & ESCROW ACCOUNT</label>
                <input
                  type="text"
                  value={targetDepartment}
                  onChange={(e) => setTargetDepartment(e.target.value)}
                  className="w-full bg-slate-900 text-white text-xs p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono text-slate-400">APPROVED PREVENTIVE BUDGET:</div>
                  <div className="text-base font-mono font-black text-emerald-400">
                    ₹{selectedAsset.estimatedPreventiveCostInr.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                    CAPITAL LOCKED
                  </span>
                </div>
              </div>
            </div>

            {workOrderSuccess ? (
              <div className="p-3 rounded-xl bg-emerald-600 text-[#001738] font-bold text-center text-xs flex items-center justify-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>Work Order Generated & Dispatched to Maintenance Queue!</span>
              </div>
            ) : (
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWorkOrderModal(false)}
                  className="px-4 py-2 text-xs text-slate-300 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleGenerateWorkOrder}
                  className="px-5 py-2 text-xs font-black text-[#001738] bg-gradient-to-r from-blue-600 to-cyan-400 hover:from-blue-500 hover:to-cyan-300 rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>Authorize & Dispatch</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
