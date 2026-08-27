import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  Clock,
  MapPin,
  CheckCircle2,
  ChevronRight,
  Eye,
  X,
  Shield,
  Activity,
  Layers,
  Wrench,
  ThumbsUp,
} from 'lucide-react';
import { SeverityBadge, StatusBadge } from '../../components/common/Badges';
import { AIConfidenceRing } from '../../components/common/AIConfidenceRing';
import { MOCK_REPORTS } from '../../data/mockData';
import { DefectReport, ReportStatus } from '../../types';
import apiClient from '../../services/apiClient';

export const MyReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<DefectReport[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | ReportStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<DefectReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyReports = async () => {
      try {
        const res = await apiClient.get('/complaints/me');
        const data = res.data.data;
        
        const mapBackendStatus = (status: string): ReportStatus => {
          switch(status) {
            case 'REPORTED': return 'submitted';
            case 'AI_VERIFIED': return 'verified';
            case 'ASSIGNED': return 'assigned';
            case 'WORK_IN_PROGRESS': return 'in_progress';
            case 'RESOLVED': return 'resolved';
            default: return 'submitted';
          }
        };

        const mappedReports: DefectReport[] = data.map((c: any) => {
          // Fix URL slashes for windows paths
          let imgPath = c.photo_url || '';
          imgPath = imgPath.replace(/\\/g, '/');
          const imageUrl = imgPath.startsWith('http') ? imgPath : `http://localhost:5000/${imgPath}`;

          return {
            id: c._id.slice(-6).toUpperCase(), // Short ID
            title: `${(c.defect_type || 'Unknown').replace('_', ' ')} Detected`,
            defectType: (c.defect_type || 'OTHER').toLowerCase() as any,
            severity: (c.severity || 'MEDIUM').toLowerCase() as any,
            status: mapBackendStatus(c.status),
            location: {
              lat: c.location?.coordinates[1] || 0,
              lng: c.location?.coordinates[0] || 0,
              address: 'GPS Coordinate Location',
              city: 'Local Area'
            },
            imageUrl: imageUrl,
            aiAnalysis: {
              defectType: (c.defect_type || 'OTHER').toLowerCase() as any,
              defectName: c.defect_type || 'Unknown Defect',
              confidence: c.confidence_score || 50,
              severity: (c.severity || 'MEDIUM').toLowerCase() as any,
              riskScore: c.confidence_score || 50,
              departmentRouting: c.assigned_department_id ? 'Assigned' : 'Pending',
              priorityLevel: 'P3',
              reasoning: {
                edgeDetection: 'AI scanning completed.',
                depthEstimation: 'Visual assessment recorded.',
                trafficCorrelation: 'N/A',
                pedestrianRisk: 'N/A'
              }
            },
            reportedAt: c.createdAt,
            updatedAt: c.updatedAt,
            reportedBy: { name: 'Citizen', isAnonymous: false },
            timeline: [
              {
                status: 'submitted',
                title: 'Report Submitted',
                timestamp: new Date(c.createdAt).toLocaleDateString(),
                description: 'Hazard report filed successfully.'
              }
            ],
            commentsCount: 0,
            upvotes: 0
          };
        });

        setReports(mappedReports);
      } catch (error) {
        console.error('Failed to fetch reports:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyReports();
  }, []);

  const filteredReports = reports.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      return (
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.location.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-24 pt-2">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            My Hazard Reports
            <span className="text-xs font-mono bg-[#191f2f] text-[#00daf3] px-2.5 py-0.5 rounded-full border border-[#00e3fd]/30">
              {filteredReports.length} Active
            </span>
          </h1>
          <p className="text-xs text-[#8c90a1]">
            Track status milestones, repair crew assignments, and AI verification for your submitted incidents.
          </p>
        </div>

        <button
          onClick={() => navigate('/citizen/report-defect')}
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-[#b3c5ff] hover:bg-[#dae1ff] text-[#002b75] font-bold text-xs shadow-lg transition-all"
        >
          + File New Report
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <div className="flex items-center bg-[#151b2b] rounded-xl px-3.5 py-2 border border-white/10 focus-within:border-[#00daf3]">
            <Search className="w-4 h-4 text-[#8c90a1] mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, road, or description..."
              className="bg-transparent text-xs text-white placeholder:text-[#8c90a1] w-full focus:outline-none font-mono"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-[#8c90a1] hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'All Reports' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'assigned', label: 'Assigned' },
            { id: 'verified', label: 'AI Verified' },
            { id: 'resolved', label: 'Resolved' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-2 rounded-xl text-xs font-mono transition-all whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-[#0066ff]/20 text-[#b3c5ff] border border-[#0066ff]/40 font-bold'
                  : 'bg-[#151b2b] text-[#8c90a1] hover:bg-[#191f2f] hover:text-white border border-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00daf3]"></div>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredReports.map((report) => (
          <div
            key={report.id}
            onClick={() => setSelectedReport(report)}
            className="bg-[#151b2b] hover:bg-[#191f2f] rounded-2xl border border-white/10 p-5 transition-all cursor-pointer group shadow-xl relative overflow-hidden"
          >
            <div className="flex flex-col md:flex-row gap-5">
              {/* Image Preview */}
              <div className="relative w-full md:w-44 h-40 md:h-32 rounded-xl overflow-hidden bg-[#0d1322] border border-white/10 shrink-0">
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

              {/* Info Column */}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#00daf3]">#{report.id}</span>
                    <StatusBadge status={report.status} />
                  </div>
                  <span className="text-xs font-mono text-[#8c90a1] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Reported {new Date(report.reportedAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-[#00daf3] transition-colors line-clamp-1">
                  {report.title}
                </h3>

                <div className="flex items-center gap-1.5 text-xs text-[#8c90a1] font-mono line-clamp-1">
                  <MapPin className="w-3.5 h-3.5 text-[#00daf3] shrink-0" />
                  <span>{report.location.address}</span>
                </div>

                {/* Progress Stepper Visual Bar */}
                <div className="pt-2">
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#8c90a1] mb-1">
                    <span className="text-[#00daf3] font-bold">1. Reported</span>
                    <span className={report.status !== 'submitted' ? 'text-[#00daf3] font-bold' : ''}>2. AI Verified</span>
                    <span className={report.status === 'assigned' || report.status === 'in_progress' || report.status === 'resolved' ? 'text-[#00daf3] font-bold' : ''}>3. Assigned</span>
                    <span className={report.status === 'in_progress' || report.status === 'resolved' ? 'text-[#00daf3] font-bold' : ''}>4. In Progress</span>
                    <span className={report.status === 'resolved' ? 'text-emerald-400 font-bold' : ''}>5. Resolved</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#0d1322] rounded-full overflow-hidden flex">
                    <div className="h-full bg-[#00daf3]" style={{
                      width: report.status === 'submitted' ? '20%' :
                             report.status === 'verified' ? '40%' :
                             report.status === 'assigned' ? '60%' :
                             report.status === 'in_progress' ? '80%' : '100%'
                    }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredReports.length === 0 && !loading && (
          <div className="text-center py-12 bg-[#151b2b] rounded-2xl border border-white/10">
            <FileText className="w-10 h-10 text-[#8c90a1] mx-auto mb-2 opacity-50" />
            <div className="text-sm font-semibold text-white">No Reports Found</div>
            <p className="text-xs text-[#8c90a1] mt-1">Try resetting your filter or file a new defect report.</p>
          </div>
        )}
      </div>
      )}

      {/* Report Detail Modal / Drawer */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#151b2b] rounded-2xl border border-white/15 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative space-y-5">
            {/* Close Button */}
            <button
              onClick={() => setSelectedReport(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#191f2f] hover:bg-[#242a3a] flex items-center justify-center text-[#c2c6d8] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold text-[#00daf3]">#{selectedReport.id}</span>
                <SeverityBadge severity={selectedReport.severity} size="sm" />
                <StatusBadge status={selectedReport.status} />
              </div>
              <h2 className="text-xl font-bold text-white">{selectedReport.title}</h2>
              <p className="text-xs font-mono text-[#8c90a1] mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#00daf3]" />
                {selectedReport.location.address}, {selectedReport.location.city}
              </p>
            </div>

            {/* Photo & AI Telemetry Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl overflow-hidden h-48 bg-[#0d1322] border border-white/10 relative">
                <img
                  src={selectedReport.imageUrl}
                  alt={selectedReport.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="bg-[#191f2f] rounded-xl p-4 border border-white/5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[#8c90a1]">AI Model Confidence</span>
                  <AIConfidenceRing score={selectedReport.aiAnalysis.confidence} size={40} />
                </div>
                <div className="text-xs font-mono text-[#c2c6d8]">
                  Defect Category: <strong className="text-white">{selectedReport.aiAnalysis.defectName}</strong>
                </div>
                <div className="text-xs font-mono text-[#c2c6d8]">
                  Routing: <strong className="text-[#00daf3]">{selectedReport.aiAnalysis.departmentRouting}</strong>
                </div>
                {selectedReport.assignedTeam && (
                  <div className="pt-2 border-t border-white/10 text-xs font-mono">
                    <span className="text-[#8c90a1] block">Assigned Squad:</span>
                    <strong className="text-white">{selectedReport.assignedTeam.name}</strong>
                    <span className="text-[10px] text-[#00daf3] block">Lead: {selectedReport.assignedTeam.lead}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline Progress */}
            <div className="space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-[#8c90a1] font-bold">
                Verification & Repair Timeline
              </h3>
              <div className="space-y-3 pl-2 border-l-2 border-[#0066ff]/40">
                {selectedReport.timeline.map((step, sIdx) => (
                  <div key={sIdx} className="relative pl-4">
                    <div className="absolute -left-[1.3rem] top-1 w-3 h-3 rounded-full bg-[#00daf3] shadow-[0_0_8px_#00daf3]" />
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white">{step.title}</span>
                      <span className="font-mono text-[10px] text-[#8c90a1]">{step.timestamp}</span>
                    </div>
                    <p className="text-xs text-[#c2c6d8] mt-0.5">{step.description}</p>
                    {step.actor && (
                      <span className="text-[10px] font-mono text-[#00daf3] block mt-0.5">
                        Actor: {step.actor}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-5 py-2 rounded-xl bg-[#191f2f] hover:bg-[#242a3a] text-xs font-mono text-white transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
