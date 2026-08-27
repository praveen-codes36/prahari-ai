import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wrench,
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCheck2,
  Sparkles,
  Layers,
  Calendar,
  Filter,
  DollarSign,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  X,
  Camera,
} from 'lucide-react';
import { MOCK_FIELD_TEAMS } from '../../data/mockData';
import { MaintenanceWorkOrder } from '../../types';
import apiClient from '../../services/apiClient';
import { reverseGeocode } from '../../utils/location';

export const MaintenanceCommandCenter: React.FC = () => {
  const navigate = useNavigate();
  const [workOrders, setWorkOrders] = useState<MaintenanceWorkOrder[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'P1' | 'P2' | 'P3'>('ALL');
  const [assignModalOrder, setAssignModalOrder] = useState<MaintenanceWorkOrder | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('TEAM-ALPHA');
  const [assignSuccess, setAssignSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const fetchWorkOrders = async () => {
      try {
        const response = await apiClient.get('/complaints');
        if (response.data.success && response.data.data) {
          const formatted: MaintenanceWorkOrder[] = await Promise.all(response.data.data.map(async (item: any) => {
            const risk = item.confidence_score || 50;
            const priority = risk > 80 ? 'P1' : risk > 60 ? 'P2' : 'P3';
            
            let address = item.location?.address || 'Unknown Location';
            const coords = item.location?.coordinates;
            
            if (coords && coords.length === 2 && (!address || address === 'Unknown Location' || address === '')) {
              try {
                const geo = await reverseGeocode(coords[1], coords[0]);
                address = geo.address || geo.city || address;
              } catch (e) {
                console.error("Geocoding failed for work order", item._id);
              }
            }

            return {
              id: item._id,
              reportId: item._id,
              roadName: item.defect_type,
              location: address,
              defectType: item.defect_type.toLowerCase(),
              department: item.assigned_department_id?.name || 'Unassigned',
              priority,
              riskScore: risk,
              status: item.status === 'RESOLVED' ? 'Completed' : 'Assigned',
              crewName: 'Pending Assignment',
              assignedVehicle: 'N/A',
              scheduledTime: 'ASAP',
              estimatedCompletion: '4 hrs',
              materialsNeeded: 'Standard Repair Kit',
              estimatedCostInr: Math.floor(Math.random() * 50000) + 10000,
              beforePhotoUrl: item.photo_url || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7',
            };
          }));
          setWorkOrders(formatted);
        }
      } catch (error) {
        console.error('Failed to fetch work orders:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWorkOrders();
  }, []);
  const filteredOrders = workOrders.filter((order) => {
    if (selectedFilter === 'ALL') return true;
    return order.priority === selectedFilter;
  });

  const handleAssignTeam = () => {
    if (!assignModalOrder) return;
    const team = MOCK_FIELD_TEAMS.find((t) => t.id === selectedTeamId);
    setAssignSuccess(true);
    setTimeout(() => {
      setWorkOrders((prev) =>
        prev.map((o) =>
          o.id === assignModalOrder.id
            ? {
                ...o,
                crewName: team?.name || o.crewName,
                teamId: team?.id,
                status: 'En Route',
              }
            : o
        )
      );
      setAssignSuccess(false);
      setAssignModalOrder(null);
    }, 1000);
  };

  return (
    <div className="space-y-6 pb-20 pt-1">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0e1626] p-5 rounded-2xl border border-slate-800 shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/40">
              FIELD MAINTENANCE SQUAD COMMAND
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Maintenance Command Center
          </h1>
          <p className="text-xs md:text-sm text-slate-300">
            Convert infrastructure intelligence into field action. Assign paver fleets, track cold-mix batches, and manage repair lifecycles.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/authority/field-teams')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-semibold border border-slate-700 transition-all"
          >
            <Truck className="w-4 h-4 text-emerald-400" />
            <span>Field Teams (16 Live)</span>
          </button>
          <button
            onClick={() => navigate('/authority/field-app')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-950/60 hover:bg-cyan-950 text-[#00e3fd] font-mono text-xs font-semibold border border-cyan-500/40 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Field Worker Mobile App</span>
          </button>
        </div>
      </div>

      {/* Top 5 KPIs Matrix (Section 15) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-[#0e1626] p-4 rounded-xl border border-blue-500/30 shadow-lg">
          <div className="text-[10px] font-mono text-slate-400 uppercase">OPEN WORK ORDERS</div>
          <div className="text-2xl font-black text-white mt-1 font-mono">42</div>
          <div className="text-[10px] font-mono text-blue-300 mt-1">Across 4 municipal zones</div>
        </div>

        <div className="bg-[#0e1626] p-4 rounded-xl border border-red-500/40 shadow-lg bg-red-950/20">
          <div className="text-[10px] font-mono text-red-400 uppercase font-bold">P1 CRITICAL</div>
          <div className="text-2xl font-black text-red-400 mt-1 font-mono animate-pulse">07</div>
          <div className="text-[10px] font-mono text-red-300 mt-1">Requires 6h intervention</div>
        </div>

        <div className="bg-[#0e1626] p-4 rounded-xl border border-emerald-500/30 shadow-lg">
          <div className="text-[10px] font-mono text-slate-400 uppercase">TEAMS DEPLOYED</div>
          <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">16</div>
          <div className="text-[10px] font-mono text-emerald-300 mt-1">100% squad mobilization</div>
        </div>

        <div className="bg-[#0e1626] p-4 rounded-xl border border-cyan-500/30 shadow-lg">
          <div className="text-[10px] font-mono text-slate-400 uppercase">REPAIRS COMPLETED</div>
          <div className="text-2xl font-black text-cyan-400 mt-1 font-mono">128</div>
          <div className="text-[10px] font-mono text-cyan-300 mt-1">This month (99.2% verified)</div>
        </div>

        <div className="bg-[#0e1626] p-4 rounded-xl border border-purple-500/30 shadow-lg">
          <div className="text-[10px] font-mono text-slate-400 uppercase">AVG REPAIR TIME</div>
          <div className="text-2xl font-black text-purple-400 mt-1 font-mono">3.8 <span className="text-xs text-slate-400">hrs</span></div>
          <div className="text-[10px] font-mono text-purple-300 mt-1">Turnaround from detection</div>
        </div>
      </div>

      {/* Main View: AI Generated Maintenance Queue */}
      <div className="bg-[#0e1626] p-5 md:p-6 rounded-2xl border border-slate-800 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              AI Generated Maintenance Dispatch Queue
            </h3>
            <p className="text-xs text-slate-400">
              Ranked automatically by public safety impact, traffic density, and failure velocity
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
            {(['ALL', 'P1', 'P2', 'P3'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  selectedFilter === filter
                    ? filter === 'P1'
                      ? 'bg-red-600 text-white'
                      : 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Work Order Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-4 shadow-lg flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                          order.priority === 'P1'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        }`}
                      >
                        {order.priority} CRITICAL
                      </span>
                      <span className="text-xs font-mono text-cyan-400 font-bold">{order.id}</span>
                    </div>
                    <h4 className="text-base font-bold text-white mt-1">{order.roadName}</h4>
                    <div className="text-xs text-slate-400">{order.location}</div>
                  </div>

                  <span className="text-xs font-mono font-black text-red-400 bg-slate-800 px-2 py-1 rounded border border-slate-700">
                    Risk {order.riskScore}/100
                  </span>
                </div>

                {/* AI Recommendation & Materials */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-1.5">
                  <div className="text-slate-300">
                    <strong className="text-white">Required Materials:</strong> {order.materialsNeeded}
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono pt-1 text-slate-400 border-t border-slate-800/80">
                    <span className="text-amber-400 font-bold">
                      Est. Cost: ₹{order.estimatedCostInr.toLocaleString('en-IN')}
                    </span>
                    <span className="text-cyan-400 font-bold">
                      Assigned: {order.crewName}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <div className="text-[10px] font-mono text-slate-400">
                  Status: <strong className="text-white">{order.status}</strong>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate('/authority/work-orders')}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => setAssignModalOrder(order)}
                    className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-[#001738] font-black text-xs shadow-md transition-all flex items-center gap-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Assign Team</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ASSIGN TEAM MODAL */}
      {assignModalOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e1626] border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono text-cyan-400">ASSIGN FIELD CREW</span>
                <h3 className="text-base font-bold text-white mt-0.5">{assignModalOrder.roadName}</h3>
              </div>
              <button onClick={() => setAssignModalOrder(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-mono text-slate-400 block">Select Available Field Squad:</label>
              <div className="space-y-2">
                {MOCK_FIELD_TEAMS.map((team) => (
                  <div
                    key={team.id}
                    onClick={() => setSelectedTeamId(team.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      selectedTeamId === team.id
                        ? 'bg-blue-600/20 border-cyan-500 shadow-[0_0_12px_rgba(0,227,253,0.2)]'
                        : 'bg-slate-900 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-white">{team.name}</div>
                      <div className="text-[10px] text-slate-400">{team.locationName} · {team.vehiclePlate}</div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded">
                      {team.status}
                    </span>
                  </div>
                ))}
              </div>

              {assignSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500 text-center text-xs font-bold text-emerald-300">
                  ✓ SQUAD DISPATCHED & WORK ORDER UPDATED
                </div>
              )}
            </div>

            {!assignSuccess && (
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setAssignModalOrder(null)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignTeam}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-[#001738] font-black text-xs shadow-lg"
                >
                  Confirm Dispatch
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
