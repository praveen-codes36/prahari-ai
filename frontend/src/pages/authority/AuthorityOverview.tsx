import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertOctagon,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  Bot,
  MapPin,
  Clock,
  Shield,
  Layers,
  Sparkles,
  BarChart3,
  Calendar,
  Radio,
  Truck,
  Wrench,
  FileCheck2,
  Cpu,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { SeverityBadge, StatusBadge } from '../../components/common/Badges';
import {
  MOCK_ROAD_SEGMENTS,
  MOCK_PRIORITY_QUEUE,
  MOCK_REPORTS,
  MOCK_EMERGENCY_INCIDENTS,
  MOCK_WORK_ORDERS,
  MOCK_FIELD_TEAMS,
  MOCK_PREDICTIVE_ASSETS,
} from '../../data/mockData';

export const AuthorityOverview: React.FC = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<'1W' | '1M' | '1Y'>('1M');
  const [activeChartBar, setActiveChartBar] = useState<number | null>(null);

  // Dynamic Chart Data based on time range
  const chartData = {
    '1W': [
      { label: 'Mon', count: 42, critical: 8, prevented: 3 },
      { label: 'Tue', count: 58, critical: 12, prevented: 5 },
      { label: 'Wed', count: 65, critical: 15, prevented: 6 },
      { label: 'Thu', count: 88, critical: 24, prevented: 9 },
      { label: 'Fri', count: 94, critical: 28, prevented: 12 },
      { label: 'Sat', count: 72, critical: 18, prevented: 8 },
      { label: 'Sun', count: 54, critical: 11, prevented: 4 },
    ],
    '1M': [
      { label: 'Week 1', count: 320, critical: 68, prevented: 24 },
      { label: 'Week 2', count: 450, critical: 92, prevented: 38 },
      { label: 'Week 3', count: 580, critical: 142, prevented: 62 },
      { label: 'Week 4', count: 620, critical: 154, prevented: 74 },
    ],
    '1Y': [
      { label: 'Q1', count: 2400, critical: 480, prevented: 180 },
      { label: 'Q2', count: 3800, critical: 890, prevented: 340 },
      { label: 'Q3', count: 4900, critical: 1240, prevented: 510 },
      { label: 'Q4', count: 3108, critical: 630, prevented: 290 },
    ],
  }[timeRange];

  const maxChartCount = Math.max(...chartData.map((d) => d.count));

  return (
    <div className="space-y-6 pb-20 pt-1">
      {/* Executive Command Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-[#0d1424] via-[#0f172a] to-[#0d1424] p-5 md:p-6 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-full bg-gradient-to-l from-blue-600/10 via-cyan-500/5 to-transparent pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#00e3fd] bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
              PRAHARI COMMAND CENTER · NHAI & STATE PWD
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              ALL SYSTEMS SYNCHRONIZED
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            National Infrastructure Intelligence & Emergency Command
          </h1>
          <p className="text-xs md:text-sm text-slate-300 max-w-3xl mt-1">
            Real-time computer vision defect triage, automated P1 repair prioritisation, emergency green corridor preemption, and field fleet telemetry.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => navigate('/authority/emergency-ops')}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 font-mono text-xs font-bold border border-red-500/40 transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)] animate-pulse"
          >
            <Radio className="w-4 h-4 text-red-400" />
            <span>Emergency Ops (03)</span>
          </button>

          <button
            onClick={() => navigate('/authority/risk-intel')}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#00e3fd]/15 hover:bg-[#00e3fd]/25 text-[#00e3fd] font-mono text-xs font-semibold border border-[#00e3fd]/30 transition-all shadow-[0_0_15px_rgba(0,227,253,0.15)]"
          >
            <Cpu className="w-4 h-4" />
            <span>AI Risk Engine</span>
          </button>

          <button
            onClick={() => navigate('/authority/priority')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-[#001738] font-black text-xs shadow-lg transition-all"
          >
            <span>Triage Priority Queue</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Top 6 KPI Matrix (Matching Prompt Section 5) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* 1. CRITICAL ASSETS */}
        <div
          onClick={() => navigate('/authority/global-map')}
          className="bg-[#0e1626] p-4 rounded-xl border border-red-500/30 hover:border-red-500/60 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase">
            <span>CRITICAL ASSETS</span>
            <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
          </div>
          <div className="text-2xl font-black text-white mt-1 font-mono group-hover:text-red-400 transition-colors">
            24
          </div>
          <div className="flex items-center gap-1 text-[10px] font-mono text-red-400 mt-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>+8.2% this week (Increasing)</span>
          </div>
        </div>

        {/* 2. ACTIVE INCIDENTS */}
        <div
          onClick={() => navigate('/authority/emergency-ops')}
          className="bg-[#0e1626] p-4 rounded-xl border border-amber-500/30 hover:border-amber-500/60 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase">
            <span>ACTIVE INCIDENTS</span>
            <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-white mt-1 font-mono group-hover:text-amber-400 transition-colors">
            08
          </div>
          <div className="flex items-center gap-1 text-[10px] font-mono text-amber-400 mt-1">
            <ArrowDownRight className="w-3 h-3 text-emerald-400" />
            <span>3 Critical · 5 High</span>
          </div>
        </div>

        {/* 3. PREDICTIVE RISKS */}
        <div
          onClick={() => navigate('/authority/predictive')}
          className="bg-[#0e1626] p-4 rounded-xl border border-cyan-500/30 hover:border-cyan-500/60 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase">
            <span>PREDICTIVE RISKS</span>
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white mt-1 font-mono group-hover:text-cyan-400 transition-colors">
            37
          </div>
          <div className="flex items-center gap-1 text-[10px] font-mono text-cyan-400 mt-1">
            <Zap className="w-3 h-3" />
            <span>90d Forecast Curve</span>
          </div>
        </div>

        {/* 4. FIELD TEAMS ACTIVE */}
        <div
          onClick={() => navigate('/authority/field-teams')}
          className="bg-[#0e1626] p-4 rounded-xl border border-emerald-500/30 hover:border-emerald-500/60 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase">
            <span>FIELD TEAMS ACTIVE</span>
            <Truck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white mt-1 font-mono group-hover:text-emerald-400 transition-colors">
            16
          </div>
          <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 mt-1">
            <span>100% capacity deployed</span>
          </div>
        </div>

        {/* 5. OPEN WORK ORDERS */}
        <div
          onClick={() => navigate('/authority/work-orders')}
          className="bg-[#0e1626] p-4 rounded-xl border border-blue-500/30 hover:border-blue-500/60 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase">
            <span>OPEN WORK ORDERS</span>
            <FileCheck2 className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white mt-1 font-mono group-hover:text-blue-400 transition-colors">
            42
          </div>
          <div className="flex items-center gap-1 text-[10px] font-mono text-blue-300 mt-1">
            <span>12 completed today</span>
          </div>
        </div>

        {/* 6. AVG RESPONSE TIME */}
        <div
          onClick={() => navigate('/authority/emergency-routes')}
          className="bg-[#0e1626] p-4 rounded-xl border border-purple-500/30 hover:border-purple-500/60 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase">
            <span>AVG RESPONSE TIME</span>
            <Clock className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white mt-1 font-mono group-hover:text-purple-400 transition-colors">
            12.4 <span className="text-xs font-normal text-slate-400">min</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 mt-1">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>6 min saved with AI</span>
          </div>
        </div>
      </div>

      {/* Quick Judge-Winning Closed Loop Stepper Banner */}
      <div
        onClick={() => navigate('/authority/intelligence-loop')}
        className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-cyan-950/30 to-slate-900 border border-cyan-500/30 hover:border-cyan-500/60 transition-all cursor-pointer shadow-xl flex flex-col md:flex-row items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-[#00e3fd] flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                ROADGUARD CLOSED-LOOP INTELLIGENCE ECOSYSTEM
              </span>
              <span className="text-[9px] font-mono bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded">
                LIVE END-TO-END
              </span>
            </div>
            <div className="text-[11px] text-slate-300 hidden sm:block">
              Citizen Report → AI Vision → Risk Matrix → Authority Decision → Field Dispatch → Live Routing → Repair → Optical Verification
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#00e3fd]">
          <span>Explore Ecosystem Architecture</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>

      {/* Main Grid: Incident Trajectory Chart & Urgent Attention Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Incident Trajectory Analysis Chart & Response Savings */}
        <div className="lg:col-span-7 bg-[#0e1626] p-5 md:p-6 rounded-2xl border border-slate-800 shadow-2xl flex flex-col justify-between space-y-6">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#00e3fd]" />
                  Incident Trajectory & AI Anomaly Prevention Analysis
                </h3>
                <p className="text-xs text-slate-400">
                  Defect detection velocity vs potential catastrophic accidents prevented
                </p>
              </div>

              {/* Time Range Pills */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                {(['1W', '1M', '1Y'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                      timeRange === range
                        ? 'bg-blue-600 text-white font-bold shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Bar Visualization */}
            <div className="h-56 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-slate-800">
              {chartData.map((item, index) => {
                const totalHeight = (item.count / maxChartCount) * 100;
                const criticalHeight = (item.critical / item.count) * 100;
                const isHovered = activeChartBar === index;

                return (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center gap-2 group cursor-pointer h-full justify-end"
                    onMouseEnter={() => setActiveChartBar(index)}
                    onMouseLeave={() => setActiveChartBar(null)}
                  >
                    {/* Tooltip on hover */}
                    {isHovered && (
                      <div className="bg-slate-900 text-white text-[10px] font-mono px-2 py-1 rounded border border-slate-700 shadow-xl z-20 whitespace-nowrap mb-1">
                        <div>Total: {item.count}</div>
                        <div className="text-red-400">Critical: {item.critical}</div>
                        <div className="text-emerald-400">Prevented: {item.prevented}</div>
                      </div>
                    )}

                    <div className="w-full max-w-[40px] bg-slate-800/80 rounded-t-md overflow-hidden relative flex flex-col justify-end transition-all group-hover:bg-slate-700" style={{ height: `${totalHeight}%` }}>
                      {/* Prevented sub-bar */}
                      <div
                        className="w-full bg-emerald-500/80 transition-all"
                        style={{ height: `${(item.prevented / item.count) * 100}%` }}
                      />
                      {/* Critical sub-bar */}
                      <div
                        className="w-full bg-red-500/90 transition-all shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                        style={{ height: `${criticalHeight}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 group-hover:text-white">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 pt-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-slate-700"></span>
                <span>Normal Anomalies</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-red-500"></span>
                <span>P1 Critical</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400"></span>
                <span>Accidents Prevented by AI</span>
              </div>
            </div>
          </div>

          {/* Response Time Savings Callout Box (Prompt Requirement 29) */}
          <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-black">
                Δt
              </div>
              <div>
                <div className="text-xs font-bold text-white">
                  EMERGENCY DISPATCH LATENCY OPTIMIZATION
                </div>
                <div className="text-[11px] text-slate-400">
                  Green wave signal preemption + neural route bypass
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-center">
              <div>
                <div className="text-[10px] font-mono text-slate-400">WITHOUT AI</div>
                <div className="text-sm font-mono font-bold text-slate-300 line-through">18.0 min</div>
              </div>
              <div className="text-slate-600">→</div>
              <div>
                <div className="text-[10px] font-mono text-cyan-400">WITH PRAHARI</div>
                <div className="text-base font-mono font-bold text-cyan-300">12.4 min</div>
              </div>
              <div className="px-2 py-1 bg-emerald-950/80 border border-emerald-500/40 rounded-lg">
                <div className="text-[9px] font-mono text-emerald-300 font-bold">SAVINGS</div>
                <div className="text-xs font-mono font-black text-emerald-400">6.0 MIN (33.3%)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Urgent Attention & P1 Triage Queue */}
        <div className="lg:col-span-5 bg-[#0e1626] p-5 md:p-6 rounded-2xl border border-slate-800 shadow-2xl flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  Urgent Attention Feed
                </h3>
                <span className="text-xs text-slate-400">
                  Highest priority risk corridors requiring intervention
                </span>
              </div>
              <button
                onClick={() => navigate('/authority/priority')}
                className="text-xs font-mono text-[#00e3fd] hover:underline"
              >
                Full Queue →
              </button>
            </div>

            {/* List of top items */}
            <div className="space-y-3">
              {MOCK_PRIORITY_QUEUE.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate('/authority/priority')}
                  className="p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] font-mono font-bold text-red-400 bg-red-950/60 px-1.5 py-0.2 rounded border border-red-500/30">
                        #{item.rank} P1 CRITICAL
                      </span>
                      <span className="text-xs font-bold text-white truncate group-hover:text-[#00e3fd]">
                        {item.roadName}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-black text-red-400">
                      {item.triageScore}/100
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-300 line-clamp-2">
                    {item.reasoning.severityIndex.text}
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1.5 border-t border-slate-800/60">
                    <span className="text-amber-400">Cost: {item.estimatedRepairCost}</span>
                    <span className="text-cyan-400">Confidence: {item.aiConfidence}%</span>
                    <span className="text-red-300">{item.p1Deadline}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Dispatch Action */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => navigate('/authority/maintenance-command')}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-colors"
            >
              <Wrench className="w-3.5 h-3.5 text-amber-400" />
              <span>Launch Maintenance Command Workspaces</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
