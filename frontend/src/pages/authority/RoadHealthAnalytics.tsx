import React, { useState } from 'react';
import {
  Activity,
  BarChart3,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Layers,
  Sparkles,
  Search,
  Filter,
  Shield,
} from 'lucide-react';
import { HealthScoreCircle } from '../../components/common/HealthScoreCircle';
import { SeverityBadge } from '../../components/common/Badges';
import { MOCK_ROAD_SEGMENTS } from '../../data/mockData';

export const RoadHealthAnalytics: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<'All' | 'Mumbai' | 'Delhi' | 'Bengaluru'>('All');

  const filteredSegments = MOCK_ROAD_SEGMENTS.filter((s) =>
    selectedCity === 'All' ? true : s.city === selectedCity
  );

  const avgHealthScore = Math.round(
    filteredSegments.reduce((acc, curr) => acc + curr.healthScore, 0) / (filteredSegments.length || 1)
  );

  return (
    <div className="space-y-6 pb-20 pt-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#00daf3] bg-[#00e3fd]/10 px-2 py-0.5 rounded border border-[#00e3fd]/30">
              PAVEMENT QUALITY INDEX & STRUCTURAL DEGRADATION
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Road Network Health Analytics
          </h1>
          <p className="text-xs md:text-sm text-[#8c90a1]">
            Comprehensive PCI (Pavement Condition Index) scoring, monsoon weathering rates, and axle-load degradation forecasts.
          </p>
        </div>

        {/* City Switcher */}
        <div className="flex items-center bg-[#151b2b] p-1 rounded-xl border border-white/10">
          {(['All', 'Mumbai', 'Delhi', 'Bengaluru'] as const).map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                selectedCity === city
                  ? 'bg-[#0066ff] text-white font-bold'
                  : 'text-[#8c90a1] hover:text-white'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#151b2b] p-5 rounded-2xl border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-[#8c90a1] uppercase block">
              Network Avg Health Score
            </span>
            <span className="text-3xl font-bold text-white font-mono">{avgHealthScore}/100</span>
            <span className="text-[11px] font-mono text-[#ffa000] block mt-1">
              -4.2% Degradation this Monsoon
            </span>
          </div>
          <HealthScoreCircle score={avgHealthScore} size={54} />
        </div>

        <div className="bg-[#151b2b] p-5 rounded-2xl border border-white/10">
          <span className="text-[10px] font-mono text-[#8c90a1] uppercase block">
            Monsoon Rainfall Pothole Surge
          </span>
          <span className="text-3xl font-bold text-[#ffb4ab] font-mono">+24.0%</span>
          <span className="text-[11px] font-mono text-[#8c90a1] block mt-1">
            Predicted over next 48 hours
          </span>
        </div>

        <div className="bg-[#151b2b] p-5 rounded-2xl border border-white/10">
          <span className="text-[10px] font-mono text-[#8c90a1] uppercase block">
            Active Telemetry Sensors
          </span>
          <span className="text-3xl font-bold text-[#00daf3] font-mono">142 Live</span>
          <span className="text-[11px] font-mono text-emerald-400 block mt-1">
            99.8% Uplink Uptime
          </span>
        </div>
      </div>

      {/* Monitored Road Segments Table */}
      <div className="bg-[#151b2b] rounded-2xl border border-white/10 overflow-hidden shadow-2xl space-y-4 p-5">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#00daf3]" />
          Monitored Road Corridors & Degradation Telemetry
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSegments.map((segment) => (
            <div
              key={segment.id}
              className="bg-[#191f2f] p-4 rounded-xl border border-white/10 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <HealthScoreCircle score={segment.healthScore} size={44} />
                  <div>
                    <h4 className="text-sm font-bold text-white">{segment.name}</h4>
                    <span className="text-[10px] font-mono text-[#8c90a1]">
                      {segment.district}, {segment.city} · {segment.lengthKm} km
                    </span>
                  </div>
                </div>
                <SeverityBadge severity={segment.riskLevel} size="sm" />
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                <div className="bg-[#0d1322] p-2 rounded-lg border border-white/5">
                  <span className="text-[9px] text-[#8c90a1] block">Traffic</span>
                  <span className="text-white font-bold">{segment.trafficVolume}</span>
                </div>
                <div className="bg-[#0d1322] p-2 rounded-lg border border-white/5">
                  <span className="text-[9px] text-[#8c90a1] block">Lighting</span>
                  <span className="text-white font-bold">{segment.lightingStatus}</span>
                </div>
                <div className="bg-[#0d1322] p-2 rounded-lg border border-white/5">
                  <span className="text-[9px] text-[#8c90a1] block">Anomalies</span>
                  <span className="text-[#ffb4ab] font-bold">{segment.activeAnomaliesCount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
