import React, { useState } from 'react';
import {
  ClipboardList,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  Eye,
  X,
  Shield,
  Layers,
  ChevronRight,
  User,
  ThumbsUp,
} from 'lucide-react';
import { SeverityBadge, StatusBadge } from '../../components/common/Badges';
import { AIConfidenceRing } from '../../components/common/AIConfidenceRing';
import { MOCK_REPORTS } from '../../data/mockData';
import { DefectReport, ReportStatus, SeverityLevel } from '../../types';
import apiClient from '../../services/apiClient';
import { reverseGeocode } from '../../utils/location';

export const ComplaintsManagement: React.FC = () => {
  const [reports, setReports] = useState<DefectReport[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | SeverityLevel>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | ReportStatus>('all');
  const [selectedReport, setSelectedReport] = useState<DefectReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await apiClient.get('/complaints');
        if (response.data.success && response.data.data) {
          const rawComplaints = response.data.data;
          
          const formattedReports: DefectReport[] = rawComplaints.map((item: any) => {
            const imgPath = item.photo_url;
            const absoluteImageUrl = imgPath 
                ? (imgPath.startsWith('http') ? imgPath : (imgPath.startsWith('/') ? imgPath : `/${imgPath}`))
                : 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80';

            return {
              id: item._id,
              title: item.defect_type,
              defectType: item.defect_type.toLowerCase(),
              severity: item.severity?.toLowerCase() || 'medium',
              status: item.status?.toLowerCase() || 'submitted',
              location: {
                lat: item.location?.coordinates?.[1] || 0,
                lng: item.location?.coordinates?.[0] || 0,
                address: 'Loading address...', // Will be updated via reverse geocoding if needed
                city: 'Unknown'
              },
              imageUrl: absoluteImageUrl,
              aiAnalysis: {
                defectType: item.defect_type.toLowerCase(),
                defectName: item.defect_type,
                confidence: item.confidence_score || 85,
                severity: item.severity?.toLowerCase() || 'medium',
                riskScore: 0, // Removed hardcoding, falling back to 0
                departmentRouting: item.assigned_department_id?.name || 'Unassigned',
                priorityLevel: 'P2',
              },
              reportedAt: item.createdAt || new Date().toISOString(),
              updatedAt: item.updatedAt || new Date().toISOString(),
              reportedBy: { name: 'Citizen', isAnonymous: true },
              timeline: [],
              commentsCount: 0,
              upvotes: 0
            };
          });
          
          setReports(formattedReports);
          
          // Enhance with reverse geocoding
          formattedReports.forEach(async (report) => {
            if (report.location.lat && report.location.lng) {
               try {
                 const addressInfo = await reverseGeocode(report.location.lat, report.location.lng);
                 setReports(prev => prev.map(r => r.id === report.id ? {
                   ...r, 
                   location: { ...r.location, address: addressInfo.address, city: addressInfo.city }
                 } : r));
               } catch (e) {
                 // ignore
               }
            }
          });
        }
      } catch (error) {
        console.error('Failed to fetch complaints:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  const filteredReports = reports.filter((r) => {
    if (severityFilter !== 'all' && r.severity !== severityFilter) return false;
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      return (
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.aiAnalysis.departmentRouting.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  const handleStatusUpdate = async (reportId: string, newStatus: ReportStatus) => {
    try {
      const response = await apiClient.patch(`/complaints/${reportId}/status`, { status: newStatus.toUpperCase() });
      if (response.data.success) {
        setReports((prev) =>
          prev.map((r) => (r.id === reportId ? { ...r, status: newStatus } : r))
        );
        if (selectedReport && selectedReport.id === reportId) {
          setSelectedReport({ ...selectedReport, status: newStatus });
        }
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status. Please check backend connection.');
    }
  };

  return (
    <div className="space-y-6 pb-20 pt-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#00daf3] bg-[#00e3fd]/10 px-2 py-0.5 rounded border border-[#00e3fd]/30">
              CITIZEN COMPLAINTS DESK
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Manage Citizen Complaints
          </h1>
          <p className="text-xs md:text-sm text-[#8c90a1]">
            Review citizen reports, check AI analysis, and send repair orders to the right department.
          </p>
        </div>
      </div>

      {/* Search & Multi-Filter Bar */}
      <div className="bg-[#151b2b] p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <div className="flex items-center bg-[#191f2f] rounded-xl px-3.5 py-2 border border-white/10 focus-within:border-[#00daf3]">
            <Search className="w-4 h-4 text-[#8c90a1] mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by report ID, location, or department (e.g. BMC PWD, NHAI)..."
              className="bg-transparent text-xs text-white placeholder:text-[#8c90a1] w-full focus:outline-none font-mono"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-[#8c90a1] hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Severity filter */}
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value as any)}
          className="bg-[#191f2f] border border-white/10 text-xs font-mono text-white rounded-xl px-3 py-2 focus:outline-none focus:border-[#00daf3]"
        >
          <option value="all">All Severities</option>
          <option value="critical">Critical (P1)</option>
          <option value="high">High (P2)</option>
          <option value="medium">Medium (P3)</option>
          <option value="low">Low (P4)</option>
        </select>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="bg-[#191f2f] border border-white/10 text-xs font-mono text-white rounded-xl px-3 py-2 focus:outline-none focus:border-[#00daf3]"
        >
          <option value="all">All Statuses</option>
          <option value="submitted">Reported</option>
          <option value="under_review">Under Review</option>
          <option value="verified">AI Verified</option>
          <option value="assigned">Assigned</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* Reports Table / Card Feed */}
      <div className="bg-[#151b2b] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-[#191f2f]/80 text-[10px] font-mono text-[#8c90a1] uppercase tracking-wider">
                <th className="py-3.5 px-4">Report ID</th>
                <th className="py-3.5 px-4">Hazard Description</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Severity</th>
                <th className="py-3.5 px-4">AI Confidence</th>
                <th className="py-3.5 px-4">Assigned Dept</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs font-mono">
              {filteredReports.map((report) => (
                <tr
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className="hover:bg-[#191f2f] cursor-pointer transition-colors"
                >
                  <td className="py-3.5 px-4 font-bold text-[#00daf3]">#{report.id}</td>
                  <td className="py-3.5 px-4 text-white font-semibold line-clamp-1 max-w-[200px]">
                    {report.title}
                  </td>
                  <td className="py-3.5 px-4 text-[#c2c6d8] truncate max-w-[180px]">
                    {report.location.address}
                  </td>
                  <td className="py-3.5 px-4">
                    <SeverityBadge severity={report.severity} size="sm" />
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-[#00daf3] font-bold">{report.aiAnalysis.confidence}%</span>
                  </td>
                  <td className="py-3.5 px-4 text-[#8c90a1] truncate max-w-[140px]">
                    {report.aiAnalysis.departmentRouting}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={report.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedReport(report);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#0066ff]/20 text-[#b3c5ff] hover:bg-[#0066ff]/30 text-[11px]"
                    >
                      Audit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Full Audit Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#151b2b] rounded-2xl border border-white/15 max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative space-y-5">
            <button
              onClick={() => setSelectedReport(null)}
              className="absolute top-5 right-5 text-[#8c90a1] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold text-[#00daf3]">#{selectedReport.id}</span>
                <SeverityBadge severity={selectedReport.severity} />
                <StatusBadge status={selectedReport.status} />
              </div>
              <h2 className="text-xl font-bold text-white">{selectedReport.title}</h2>
              <p className="text-xs font-mono text-[#8c90a1] mt-1">
                {selectedReport.location.address}, {selectedReport.location.city}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="h-56 rounded-xl overflow-hidden bg-[#080e1d] border border-white/10 relative">
                <img
                  src={selectedReport.imageUrl}
                  alt={selectedReport.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="bg-[#191f2f] p-4 rounded-xl space-y-3 border border-white/5 text-xs font-mono">
                <div className="flex justify-between items-center">
                  <span className="text-[#8c90a1]">AI Accuracy:</span>
                  <AIConfidenceRing score={selectedReport.aiAnalysis.confidence} size={40} />
                </div>
                {selectedReport.aiAnalysis.estimatedDimensions && (
                  <div>
                    <span className="text-[#8c90a1] block">Defect Dimensions:</span>
                    <span className="text-white font-bold">{selectedReport.aiAnalysis.estimatedDimensions}</span>
                  </div>
                )}
                {selectedReport.aiAnalysis.estimatedDepth && (
                  <div>
                    <span className="text-[#8c90a1] block">Estimated Depth:</span>
                    <span className="text-[#ffb4ab] font-bold">{selectedReport.aiAnalysis.estimatedDepth}</span>
                  </div>
                )}
                <div>
                  <span className="text-[#8c90a1] block">Department Allocation:</span>
                  <span className="text-[#00daf3] font-bold">{selectedReport.aiAnalysis.departmentRouting}</span>
                </div>
              </div>
            </div>

            {/* Quick Status State Switcher */}
            <div className="p-4 bg-[#0d1322] rounded-xl border border-white/5 space-y-2">
              <span className="text-xs font-mono text-[#8c90a1] uppercase font-bold block">
                Change Status:
              </span>
              <div className="flex flex-wrap gap-2">
                {(['under_review', 'verified', 'assigned', 'in_progress', 'resolved'] as ReportStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusUpdate(selectedReport.id, st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                      selectedReport.status === st
                        ? 'bg-[#00daf3] text-[#002b75] font-bold shadow-lg'
                        : 'bg-[#191f2f] text-[#c2c6d8] hover:bg-[#242a3a]'
                    }`}
                  >
                    {st.replace('_', ' ').toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
