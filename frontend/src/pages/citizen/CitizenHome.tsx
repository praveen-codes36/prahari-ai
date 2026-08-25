import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  AlertTriangle,
  Compass,
  MapPin,
  Clock,
  ThumbsUp,
  MessageSquare,
  Shield,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { SeverityBadge, StatusBadge } from '../../components/common/Badges';
import { MOCK_REPORTS, MOCK_ROAD_SEGMENTS } from '../../data/mockData';

export const CitizenHome: React.FC = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState(MOCK_REPORTS);

  const handleUpvote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, upvotes: r.upvotes + 1 } : r))
    );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20 pt-2">
      {/* Top Welcome & Telemetry Card */}
      <div className="bg-gradient-to-r from-[#151b2b] via-[#191f2f] to-[#151b2b] p-5 md:p-6 rounded-2xl border border-white/10 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#0066ff]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#00daf3] bg-[#00e3fd]/10 px-2 py-0.5 rounded border border-[#00e3fd]/20">
                Prahari Citizen Guard
              </span>
              <span className="text-[11px] font-mono text-[#8c90a1]">GPS Active: Mumbai</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Welcome, Aarav Sharma
            </h1>
            <p className="text-xs md:text-sm text-[#8c90a1] mt-1">
              Your reports help AI route emergency ambulances & prioritize municipal road repairs.
            </p>
          </div>

          <button
            onClick={() => navigate('/citizen/report-defect')}
            className="self-start md:self-auto flex items-center gap-2.5 px-5 py-3 rounded-xl bg-[#b3c5ff] hover:bg-[#dae1ff] text-[#002b75] font-bold text-sm shadow-[0_0_20px_rgba(179,197,255,0.4)] active:scale-95 transition-all"
          >
            <Camera className="w-5 h-5 stroke-[2.5]" />
            Report Road Hazard
          </button>
        </div>
      </div>

      {/* Quick Action & Radar Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nearby Road Risk Card */}
        <div
          onClick={() => navigate('/citizen/risk-map')}
          className="bg-[#191f2f]/90 hover:bg-[#242a3a]/90 p-5 rounded-2xl border border-white/10 shadow-lg cursor-pointer group transition-all relative overflow-hidden"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#ffb4ab]/15 flex items-center justify-center text-[#ffb4ab]">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-[#00daf3] transition-colors">
                  Nearby Road Risk Radar
                </h3>
                <span className="text-[10px] font-mono text-[#8c90a1]">Within 3.5 km radius</span>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-[#8c90a1] group-hover:text-white transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>

          <div className="grid grid-cols-3 gap-2 my-3 text-center">
            <div className="p-2 rounded-lg bg-[#0d1322]/80 border border-white/5">
              <div className="text-base font-bold text-[#ffb4ab]">3</div>
              <div className="text-[9px] font-mono text-[#8c90a1]">Critical Potholes</div>
            </div>
            <div className="p-2 rounded-lg bg-[#0d1322]/80 border border-white/5">
              <div className="text-base font-bold text-[#ffa000]">1</div>
              <div className="text-[9px] font-mono text-[#8c90a1]">Dark Zone</div>
            </div>
            <div className="p-2 rounded-lg bg-[#0d1322]/80 border border-white/5">
              <div className="text-base font-bold text-[#00daf3]">34/100</div>
              <div className="text-[9px] font-mono text-[#8c90a1]">Avg Health</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-[#00daf3] mt-2">
            <span>Explore full interactive map</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* AI Assistant Safety Advisory Card */}
        <div
          onClick={() => navigate('/citizen/assistant')}
          className="bg-[#191f2f]/90 hover:bg-[#242a3a]/90 p-5 rounded-2xl border border-white/10 shadow-lg cursor-pointer group transition-all relative overflow-hidden"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#00e3fd]/15 flex items-center justify-center text-[#00daf3]">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-[#00daf3] transition-colors">
                  AI Commute Advisor
                </h3>
                <span className="text-[10px] font-mono text-[#8c90a1]">Monsoon Hazard Predictor</span>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-[#8c90a1] group-hover:text-white transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>

          <p className="text-xs text-[#c2c6d8] my-3 leading-relaxed">
            "Andheri East Link Road has 2 active repair zones. Two-wheelers advised to take Jogeshwari bypass during rainfall."
          </p>

          <div className="flex items-center justify-between text-xs font-mono text-[#b3c5ff] mt-2">
            <span>Ask AI Copilot for route advice</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Community Hazard Reports Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">Active Community Reports</h2>
            <span className="text-xs font-mono bg-[#191f2f] text-[#00daf3] px-2 py-0.5 rounded-full border border-[#00e3fd]/30">
              {reports.length} Open
            </span>
          </div>
          <button
            onClick={() => navigate('/citizen/my-reports')}
            className="text-xs font-mono text-[#b3c5ff] hover:text-white flex items-center gap-1"
          >
            View My Reports <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {reports.map((report) => (
            <div
              key={report.id}
              onClick={() => navigate(`/citizen/reports/${report.id}`)}
              className="bg-[#191f2f]/90 hover:bg-[#242a3a]/90 rounded-xl border border-white/10 p-4 md:p-5 transition-all cursor-pointer group shadow-lg"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Defect Image Thumbnail */}
                <div className="relative w-full sm:w-36 h-36 sm:h-28 rounded-lg overflow-hidden shrink-0 bg-[#0d1322] border border-white/10">
                  <img
                    src={report.thumbnailUrl || report.imageUrl}
                    alt={report.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 left-2">
                    <SeverityBadge severity={report.severity} size="sm" />
                  </div>
                </div>

                {/* Report Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-[#8c90a1]">#{report.id}</span>
                      <StatusBadge status={report.status} />
                    </div>
                    <span className="text-[10px] font-mono text-[#8c90a1] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(report.reportedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-sm md:text-base font-bold text-white group-hover:text-[#00daf3] transition-colors mb-1 line-clamp-1">
                    {report.title}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-[#8c90a1] mb-2 font-mono line-clamp-1">
                    <MapPin className="w-3.5 h-3.5 text-[#00daf3] shrink-0" />
                    <span>{report.location.address}, {report.location.city}</span>
                  </div>

                  {/* AI Telemetry Tag */}
                  <div className="bg-[#0d1322]/80 rounded-lg px-3 py-1.5 border border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-[11px] font-mono text-[#c2c6d8]">
                      AI Conf: <strong className="text-[#00daf3]">{report.aiAnalysis.confidence}%</strong> · Route: <strong className="text-white">{report.aiAnalysis.departmentRouting}</strong>
                    </span>
                    <button
                      onClick={(e) => handleUpvote(report.id, e)}
                      className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-xs font-mono text-[#b3c5ff] active:scale-95 transition-all"
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>{report.upvotes} Upvotes</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
