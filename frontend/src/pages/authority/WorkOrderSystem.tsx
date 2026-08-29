import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileCheck2,
  CheckCircle2,
  Clock,
  MapPin,
  Camera,
  ShieldCheck,
  Sparkles,
  DollarSign,
  ChevronRight,
  AlertOctagon,
  Wrench,
  Truck,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { MaintenanceWorkOrder } from '../../types';
import { getWorkOrders } from '../../services/fieldOpsService';

export const WorkOrderSystem: React.FC = () => {
  const navigate = useNavigate();
  const [workOrders, setWorkOrders] = useState<MaintenanceWorkOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<MaintenanceWorkOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const loadOrders = async () => {
      try {
        const orders = await getWorkOrders();
        setWorkOrders(orders);
        setSelectedOrder(orders[0] || null);
      } catch (error) {
        console.error('Failed to fetch work orders:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadOrders();
  }, []);

  const steps = ['Assigned', 'En Route', 'On Site', 'Repairing', 'Inspection', 'Completed'] as const;

  const currentStepIndex = selectedOrder ? steps.indexOf(selectedOrder.status as any) : -1;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 text-slate-400 font-mono text-sm">
        Loading work orders from backend…
      </div>
    );
  }

  if (!selectedOrder) {
    return (
      <div className="flex items-center justify-center h-96 text-slate-400 font-mono text-sm">
        No active work orders found.
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 pt-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0e1626] p-5 rounded-2xl border border-slate-800 shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#00e3fd] bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
              NATIONAL ROAD REPAIR AUDIT & VERIFICATION
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Work Order Lifecycle & AI Verification
          </h1>
          <p className="text-xs md:text-sm text-slate-300">
            End-to-end accountability from defect priority check to optical AI before/after repair verification and GPS geofence auditing.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/authority/maintenance-command')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-semibold border border-slate-700 transition-all"
          >
            <Wrench className="w-4 h-4 text-amber-400" />
            <span>Maintenance Command</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Orders List & Detailed Lifecycle Stepper View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 4.5 Cols: Orders List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-mono font-bold text-slate-400 uppercase px-1">
            ACTIVE WORK ORDERS ({workOrders.length})
          </div>

          <div className="space-y-3">
            {workOrders.map((order) => {
              const isSelected = selectedOrder.id === order.id;
              return (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                    isSelected
                      ? 'bg-[#0e1626] border-[#00e3fd] shadow-[0_0_20px_rgba(0,227,253,0.15)]'
                      : 'bg-[#0e1626]/70 border-slate-800 hover:bg-[#0e1626] hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-cyan-400">{order.id}</span>
                        <span
                          className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                            order.priority === 'P1'
                              ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {order.priority}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1">{order.roadName}</h4>
                      <div className="text-xs text-slate-400">{order.location}</div>
                    </div>

                    <span className="text-xs font-mono font-black text-amber-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      ₹{order.estimatedCostInr.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-800/60">
                    <span className="text-slate-400 font-mono text-[11px]">
                      Crew: <strong className="text-slate-200">{order.crewName}</strong>
                    </span>
                    <span className="text-cyan-300 font-mono text-[11px] font-bold">
                      {order.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 7.5 Cols: Work Order Lifecycle Stepper & Before/After Verification */}
        <div className="lg:col-span-7 bg-[#0e1626] p-6 rounded-2xl border border-slate-800 shadow-2xl space-y-6">
          {/* Order Header */}
          <div className="border-b border-slate-800 pb-4 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#00e3fd] bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                  {selectedOrder.id} · {selectedOrder.department}
                </span>
                <span className="text-xs font-mono text-emerald-400">
                  GPS AUDITED (1.2m Accuracy)
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">{selectedOrder.roadName}</h2>
              <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-red-400" />
                <span>{selectedOrder.location}</span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] font-mono text-slate-400">TOTAL COST</div>
              <div className="text-lg font-mono font-black text-amber-400">
                ₹{selectedOrder.estimatedCostInr.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* 6-Stage Progress Stepper */}
          <div className="space-y-2">
            <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">
              WORK ORDER EXECUTION TIMELINE:
            </div>
            <div className="grid grid-cols-6 gap-1.5">
              {steps.map((stepName, idx) => {
                const isPassed = currentStepIndex >= idx;
                const isCurrent = currentStepIndex === idx;
                return (
                  <div key={stepName} className="text-center space-y-1">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isPassed
                          ? isCurrent
                            ? 'bg-[#00e3fd] shadow-[0_0_10px_rgba(0,227,253,0.8)]'
                            : 'bg-emerald-400'
                          : 'bg-slate-800'
                      }`}
                    />
                    <span
                      className={`text-[9px] font-mono block truncate ${
                        isPassed ? 'text-white font-bold' : 'text-slate-400'
                      }`}
                    >
                      {stepName}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Before & After Optical AI Verification (Section 17) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-mono font-bold text-white uppercase flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#00e3fd]" />
                Optical AI Computer Vision Repair Verification
              </div>
              <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/40">
                {selectedOrder.status === 'Completed' && selectedOrder.aiVerificationScore ? `${selectedOrder.aiVerificationScore}% VERIFIED` : selectedOrder.status === 'Inspection' ? 'PENDING INSPECTION' : 'AWAITING VERIFICATION'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Before Image Card */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-red-400 font-bold uppercase">Before Defect</span>
                  <span className="text-slate-400">Citizen & AI Drone Scan</span>
                </div>
                <div className="relative rounded-lg overflow-hidden h-40 bg-slate-950 flex items-center justify-center">
                  {selectedOrder.beforePhotoUrl ? (
                    <img src={selectedOrder.beforePhotoUrl} alt="Before Repair" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-xs text-slate-500">No inspection photo available</div>
                  )}
                  <div className="absolute bottom-2 left-2 bg-black/80 text-red-400 text-[9px] font-mono px-1.5 py-0.5 rounded border border-red-500/40">
                    Defect: {selectedOrder.defectType} · Priority {selectedOrder.priority}
                  </div>
                </div>
              </div>

              {/* After Image Card */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-emerald-400 font-bold uppercase">After Repair Verification</span>
                  <span className="text-cyan-400 font-bold">{selectedOrder.afterPhotoUrl ? (selectedOrder.status === 'Completed' ? 'AI VERIFIED' : 'UNDER REVIEW') : 'NOT SUBMITTED'}</span>
                </div>
                <div className="relative rounded-lg overflow-hidden h-40 bg-slate-950 flex items-center justify-center">
                  {selectedOrder.afterPhotoUrl ? (
                    <img src={selectedOrder.afterPhotoUrl} alt="After Repair" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-xs text-slate-500">Awaiting after-repair evidence</div>
                  )}
                  <div className="absolute bottom-2 left-2 bg-black/80 text-emerald-400 text-[9px] font-mono px-1.5 py-0.5 rounded border border-emerald-500/40">
                    {selectedOrder.aiVerificationNotes || (selectedOrder.afterPhotoUrl ? 'After-repair evidence submitted' : 'No after-repair evidence yet')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Audit Verification Log */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between font-mono text-[10px] text-slate-400">
              <span className="text-cyan-400 font-bold">DIGITAL AUDIT STAMP</span>
              <span>Ref: NHAI-AUD-{selectedOrder.id}</span>
            </div>
            <div className="text-slate-300">
              {selectedOrder.aiVerificationNotes || `Work order ${selectedOrder.status}. Location: ${selectedOrder.location}. Crew: ${selectedOrder.crewName}.`}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => navigate(`/authority/field-app?orderId=${selectedOrder.id}`)}
              className="py-2.5 px-5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-[#001738] font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Open Field Companion App</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
