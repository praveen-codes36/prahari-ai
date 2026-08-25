import React, { useState } from 'react';
import {
  Wrench,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Camera,
  Layers,
  Sparkles,
  Calendar,
  AlertTriangle,
  Upload,
} from 'lucide-react';
import { MOCK_WORK_ORDERS } from '../../data/mockData';
import { MaintenanceWorkOrder } from '../../types';

export const MaintenanceDashboard: React.FC = () => {
  const [workOrders, setWorkOrders] = useState<MaintenanceWorkOrder[]>(MOCK_WORK_ORDERS);
  const [selectedOrder, setSelectedOrder] = useState<MaintenanceWorkOrder | null>(MOCK_WORK_ORDERS[0]);
  const [uploadProofModal, setUploadProofModal] = useState(false);
  const [completionSuccess, setCompletionSuccess] = useState(false);

  const handleCompleteOrder = (id: string) => {
    setCompletionSuccess(true);
    setTimeout(() => {
      setWorkOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: 'Completed' as const } : o))
      );
      if (selectedOrder?.id === id) {
        setSelectedOrder({ ...selectedOrder, status: 'Completed' });
      }
      setCompletionSuccess(false);
      setUploadProofModal(false);
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-20 pt-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#ffa000] bg-[#ffa000]/15 px-2 py-0.5 rounded border border-[#ffa000]/30">
              FIELD MAINTENANCE SQUAD OPS
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Field Maintenance & Paver Dispatch
          </h1>
          <p className="text-xs md:text-sm text-[#8c90a1]">
            Manage assigned road work orders, asphalt material batches, and upload before/after optical repair verification.
          </p>
        </div>
      </div>

      {/* Grid: Active Work Orders List & Selected Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Work Orders List (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#00daf3]" />
            Active Work Orders & Fleet Tasks
          </h3>

          {workOrders.map((order) => {
            const isSelected = selectedOrder?.id === order.id;
            return (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-lg ${
                  isSelected
                    ? 'bg-[#191f2f] border-[#00daf3] shadow-[0_0_15px_rgba(0,227,253,0.2)]'
                    : 'bg-[#151b2b] border-white/10 hover:bg-[#191f2f]'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-[#00daf3]">{order.id}</span>
                    <h4 className="text-sm md:text-base font-bold text-white mt-0.5">{order.roadName}</h4>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      order.status === 'Completed'
                        ? 'bg-emerald-950 text-emerald-300'
                        : order.status === "En Route"
                        ? 'bg-[#00e3fd]/20 text-[#00daf3] animate-pulse'
                        : 'bg-[#ffa000]/20 text-[#ffa000]'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="text-xs text-[#c2c6d8] space-y-1 mb-3">
                  <div>Department: <strong className="text-white">{order.department}</strong></div>
                  <div>Crew: <strong className="text-[#b3c5ff]">{order.crewName}</strong></div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-[#8c90a1] pt-2 border-t border-white/5">
                  <span>Sched: {order.scheduledTime}</span>
                  <span className="text-white">ETA: {order.estimatedCompletion}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Order Detail (5 Cols) */}
        {selectedOrder && (
          <div className="lg:col-span-5 bg-[#151b2b] p-6 rounded-2xl border border-white/10 shadow-2xl space-y-5">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-mono text-[#00daf3]">ORDER #{selectedOrder.id}</span>
                <h3 className="text-lg font-bold text-white mt-0.5">{selectedOrder.roadName}</h3>
              </div>
              <span className="text-xs font-mono text-[#ffb4ab] bg-[#93000a] px-2.5 py-0.5 rounded font-bold">
                {selectedOrder.priority}
              </span>
            </div>

            {/* Before / After Photo Comparison */}
            <div className="space-y-2">
              <span className="text-xs font-mono text-[#8c90a1] block">Optical Evidence (Before / After):</span>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-xl overflow-hidden h-32 bg-[#0d1322] border border-white/10 relative">
                  <img
                    src={selectedOrder.beforePhotoUrl}
                    alt="Before Repair"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute bottom-1 left-1 bg-[#0d1322]/80 text-white font-mono text-[9px] px-1.5 py-0.5 rounded">
                    BEFORE
                  </span>
                </div>

                <div className="rounded-xl overflow-hidden h-32 bg-[#0d1322] border border-dashed border-white/20 relative flex items-center justify-center">
                  {selectedOrder.afterPhotoUrl ? (
                    <>
                      <img
                        src={selectedOrder.afterPhotoUrl}
                        alt="After Repair"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute bottom-1 left-1 bg-emerald-950 text-emerald-300 font-mono text-[9px] px-1.5 py-0.5 rounded">
                        AFTER VERIFIED
                      </span>
                    </>
                  ) : (
                    <div className="text-center p-2">
                      <Camera className="w-5 h-5 text-[#8c90a1] mx-auto mb-1" />
                      <span className="text-[10px] font-mono text-[#8c90a1] block">Audit Photo Pending</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Materials & Vehicle */}
            <div className="space-y-2 text-xs font-mono">
              <div className="bg-[#191f2f] p-3 rounded-xl border border-white/5 space-y-1">
                <span className="text-[#8c90a1] block">Material Allocation:</span>
                <span className="text-white font-semibold">{selectedOrder.materialsNeeded}</span>
              </div>
              <div className="bg-[#191f2f] p-3 rounded-xl border border-white/5 space-y-1">
                <span className="text-[#8c90a1] block">Assigned Heavy Fleet Unit:</span>
                <span className="text-[#00daf3] font-semibold">{selectedOrder.assignedVehicle}</span>
              </div>
            </div>

            {/* Action CTA */}
            {selectedOrder.status !== 'Completed' ? (
              <button
                onClick={() => handleCompleteOrder(selectedOrder.id)}
                className="w-full py-3 rounded-xl bg-[#b3c5ff] hover:bg-[#dae1ff] text-[#002b75] font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                Mark Repair Completed & Verify
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-center text-xs font-mono text-emerald-300">
                Work Order Completed & Photometrically Audited
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
