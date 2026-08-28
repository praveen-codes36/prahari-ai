import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Brain,
  Sparkles,
  CloudRain,
  Truck,
  History,
  ShieldCheck,
  Eye,
  FileCheck2,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import apiClient from '../../services/apiClient';

export const AIRiskIntelligencePage: React.FC = () => {
  const navigate = useNavigate();
  
  // State for available road segments
  const [segments, setSegments] = useState<any[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  
  // States for API data
  const [riskData, setRiskData] = useState<any>(null);
  const [maintenanceData, setMaintenanceData] = useState<any>(null);
  const [explanationData, setExplanationData] = useState<any>(null);
  
  // Loading and Error states
  const [isLoadingSegments, setIsLoadingSegments] = useState(true);
  const [isLoadingAsset, setIsLoadingAsset] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch available road segments on mount
  useEffect(() => {
    const fetchSegments = async () => {
      try {
        const res = await apiClient.get('/roads/health-scores');
        const data = res.data?.data || [];
        setSegments(data);
        if (data.length > 0) {
          // Default to the first segment available
          const firstSegmentId = data[0].road_segment_id || data[0]._id;
          setSelectedAssetId(firstSegmentId);
        }
      } catch (err: any) {
        console.error("Failed to load road segments", err);
        setError("Failed to load available road segments.");
      } finally {
        setIsLoadingSegments(false);
      }
    };
    fetchSegments();
  }, []);

  // Fetch data for the selected asset
  useEffect(() => {
    if (!selectedAssetId) return;

    const fetchAssetData = async () => {
      setIsLoadingAsset(true);
      setError(null);
      try {
        // Fetch Risk, Maintenance, and Explanation data in parallel
        const [riskRes, maintenanceRes, explanationRes] = await Promise.allSettled([
          apiClient.get(`/risk/segment/${selectedAssetId}`),
          apiClient.get(`/maintenance/predictions/${selectedAssetId}`),
          apiClient.get(`/copilot/authority/explain/${selectedAssetId}`)
        ]);

        if (riskRes.status === 'fulfilled') {
          setRiskData(riskRes.value.data?.data);
        } else {
          setRiskData(null);
        }

        if (maintenanceRes.status === 'fulfilled') {
          setMaintenanceData(maintenanceRes.value.data?.data);
        } else {
          setMaintenanceData(null);
        }

        if (explanationRes.status === 'fulfilled') {
          setExplanationData(explanationRes.value.data?.data);
        } else {
          setExplanationData(null);
        }
        
      } catch (err: any) {
        console.error("Failed to load asset data", err);
        setError("Failed to load data for the selected road segment.");
      } finally {
        setIsLoadingAsset(false);
      }
    };

    fetchAssetData();
  }, [selectedAssetId]);

  const selectedSegmentName = segments.find(s => (s.road_segment_id || s._id) === selectedAssetId)?.road_name || selectedAssetId;
  const currentHealth = segments.find(s => (s.road_segment_id || s._id) === selectedAssetId);

  const displayRiskScore = riskData?.risk_score ?? currentHealth?.health_score ?? '--';
  const displayRiskLevel = riskData?.risk_level ?? currentHealth?.band ?? 'UNKNOWN';

  // Process risk factors into a sortable array for display
  const rawFactors = riskData?.factors ?? currentHealth?.factors;
  const breakdownFactors = rawFactors ? Object.entries(rawFactors)
    .filter(([key]) => key !== '_id' && key !== 'id')
    .map(([key, value]) => ({
      label: key.replace(/_/g, ' ').toUpperCase(),
      score: Number(value) || 0
    })).sort((a, b) => b.score - a.score) : [];

  const renderExplanation = (text: string) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={i} className="mb-2">
          {parts.map((part, j) => 
            part.startsWith('**') && part.endsWith('**') 
              ? <strong key={j} className="text-white">{part.slice(2, -2)}</strong>
              : part
          )}
        </p>
      );
    });
  };

  const explanationText = explanationData?.explanation || explanationData?.answer || explanationData?.response_payload?.answer;

  return (
    <div className="space-y-6 pb-20 pt-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0e1626] p-5 rounded-2xl border border-slate-800 shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#00e3fd] bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
              PRAHARI NEURAL PREDICTION ENGINE v4.8
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            AI Risk Smart System & Explainability Core
          </h1>
          <p className="text-xs md:text-sm text-slate-300">
            Multi-modal explainable AI correlating Computer Vision data info, heavy freight loads, monsoon forecasts, and citizen reports.
          </p>
        </div>

        {/* Asset Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-mono text-slate-400">Target Asset:</label>
          <select
            value={selectedAssetId}
            onChange={(e) => setSelectedAssetId(e.target.value)}
            disabled={isLoadingSegments}
            className="bg-[#080d17] text-white border border-slate-700 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-[#00e3fd] disabled:opacity-50"
          >
            {isLoadingSegments && <option>Loading...</option>}
            {!isLoadingSegments && segments.length === 0 && <option>No roads found</option>}
            {segments.map((s) => (
              <option key={s.road_segment_id || s._id} value={s.road_segment_id || s._id}>
                {s.road_name || s._id}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {error && (
        <div className="p-4 rounded-xl bg-red-950/50 border border-red-500/50 text-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Main Grid: Asset Risk Trend & Explainability WHY panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols: Risk Score & Predictive Trend */}
        <div className="lg:col-span-5 bg-[#0e1626] p-6 rounded-2xl border border-slate-800 shadow-2xl space-y-6 flex flex-col justify-between">
          
          {isLoadingAsset ? (
            <div className="flex items-center justify-center h-48 text-cyan-500">
              <Sparkles className="w-6 h-6 animate-pulse" />
              <span className="ml-2 text-sm font-mono">Analyzing Asset Data...</span>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="border-b border-slate-800 pb-4">
                <div className="text-[10px] font-mono text-cyan-400">{selectedAssetId}</div>
                <h2 className="text-xl font-bold text-white mt-0.5">{selectedSegmentName}</h2>
              </div>

              {/* Current vs Predicted Trend Cards */}
              <div className="grid grid-cols-2 gap-2.5 text-center">
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400">CURRENT RISK</div>
                  <div className="text-2xl font-mono font-black text-amber-400 mt-1">
                    {displayRiskScore} <span className="text-xs text-slate-500">/100</span>
                  </div>
                  <div className="text-[9px] font-mono text-amber-300 mt-0.5">{displayRiskLevel}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/90 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                  <div className="text-[10px] font-mono text-slate-400">PREDICTED 30-DAY RISK</div>
                  <div className="text-2xl font-mono font-black text-red-400 mt-1">
                    {maintenanceData?.predicted_risk_score_30d ?? '--'} <span className="text-xs text-slate-500">/100</span>
                  </div>
                  <div className="text-[9px] font-mono text-red-300 mt-0.5">Predictive Maintenance Model</div>
                </div>
              </div>

              {/* AI Confidence Meter (Dynamic or hidden if not provided) */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/40 to-cyan-950/30 border border-cyan-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-[#00e3fd] flex items-center justify-center font-mono font-bold">
                    <Brain className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">AI ANALYSIS STATUS</div>
                    <div className="text-[10px] font-mono text-slate-400">Trained on live sensor & report data</div>
                  </div>
                </div>
                <div className="text-sm font-mono font-bold text-[#00e3fd]">
                  {displayRiskScore !== '--' ? 'ACTIVE' : 'NO DATA'}
                </div>
              </div>

              {/* Recommended Action Card */}
              {maintenanceData?.reasoning && maintenanceData.reasoning.length > 0 && (
                <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/40 space-y-2">
                  <div className="text-[10px] font-mono font-bold text-red-400 uppercase flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                    Predictive Reasoning
                  </div>
                  <ul className="text-xs font-bold text-white tracking-wide list-disc pl-4 space-y-1">
                    {maintenanceData.reasoning.map((reason: string, idx: number) => (
                      <li key={idx}>{reason}</li>
                    ))}
                  </ul>
                  <div className="text-[11px] font-mono text-red-300 flex items-center gap-1 mt-2">
                    <Clock className="w-3.5 h-3.5" />
                    Generated: {new Date(maintenanceData.predicted_at || Date.now()).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Direct Action Trigger Buttons */}
          <div className="space-y-2 pt-4 border-t border-slate-800">
            <button
              onClick={() => navigate('/authority/maintenance-command')}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-[#001738] font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Create P1 Work Order for Squad</span>
            </button>
            <button
              onClick={() => navigate('/authority/emergency-ops')}
              className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-red-400" />
              <span>Simulate Emergency Lane Diversion</span>
            </button>
          </div>
        </div>

        {/* Right 7 Cols: Multi-Factor AI Reasoning "WHY?" Breakdown */}
        <div className="lg:col-span-7 bg-[#0e1626] p-6 rounded-2xl border border-slate-800 shadow-2xl space-y-6">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#00e3fd]" />
                AI Explainability Breakdown (WHY this is risky)
              </h3>
              <p className="text-xs text-slate-400">
                Mathematical contribution matrix determining the composite risk index
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
              SHAP / Attention Matrix
            </span>
          </div>

          {isLoadingAsset ? (
            <div className="flex flex-col gap-4 animate-pulse">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-slate-800/50 rounded-xl"></div>
              ))}
            </div>
          ) : (
            <>
              {/* Factor Weight Bars */}
              {breakdownFactors.length > 0 ? (
                <div className="space-y-3.5">
                  {breakdownFactors.map((factor, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-slate-800 text-[10px] font-mono text-slate-300 flex items-center justify-center font-bold">
                            0{idx + 1}
                          </span>
                          <span className="text-xs font-bold text-white">{factor.label}</span>
                        </div>
                        <span className="text-xs font-mono font-bold text-cyan-400">{factor.score} pts</span>
                      </div>

                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            factor.score > 20
                              ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                              : factor.score > 10
                              ? 'bg-amber-400'
                              : 'bg-[#00e3fd]'
                          }`}
                          style={{ width: `${Math.min(factor.score * 5, 100)}%` }} // Scaled roughly for visualization
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-400 text-sm italic">No risk factor breakdown available for this segment.</div>
              )}

              {/* Copilot Explanation Section (Replaces Hardcoded Multimodal Badges) */}
              {explanationData && (
                 <div className="mt-6 pt-4 border-t border-slate-800">
                    <div className="flex items-center gap-2 mb-3">
                      <Brain className="w-4 h-4 text-purple-400" />
                      <div className="text-[10px] font-mono text-purple-400 font-bold tracking-wider">COPILOT EXPLANATION (LLM SYNTHESIS)</div>
                    </div>
                    <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/20 text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                       {explanationText ? renderExplanation(explanationText) : JSON.stringify(explanationData)}
                    </div>
                 </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
