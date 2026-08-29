import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Smartphone, MapPin, CheckCircle2, Camera, AlertTriangle, Wrench, ChevronRight, CheckSquare, Square } from 'lucide-react';
import { FieldTeam, MaintenanceWorkOrder } from '../../types';
import {
  getCurrentTeamWorkOrder,
  getWorkOrderById,
  submitRepairVerification,
  updateMaterialsUsed,
  updateWorkOrderStatus,
} from '../../services/fieldOpsService';

const stepFromStatus = (status?: MaintenanceWorkOrder['status']) => {
  if (status === 'Completed') return 6;
  if (status === 'Inspection') return 5;
  if (status === 'Repairing') return 4;
  if (status === 'On Site') return 2;
  return 1;
};

export const FieldWorkerMobileApp: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const teamId = searchParams.get('teamId');
  const orderId = searchParams.get('orderId');
  const [team, setTeam] = useState<FieldTeam | null>(null);
  const [activeOrder, setActiveOrder] = useState<MaintenanceWorkOrder | null>(null);
  const [activeStep, setActiveStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [coldMixBags, setColdMixBags] = useState(0);
  const [compactorTimeMin, setCompactorTimeMin] = useState(0);
  const [savingMaterials, setSavingMaterials] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');
  const [checklist, setChecklist] = useState({ roadSurface: false, defectMeasured: false, structuralDamage: false, drainage: false, safetyBarriers: false });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadAssignment = async () => {
    setLoading(true);
    try {
      if (teamId) {
        const data = await getCurrentTeamWorkOrder(teamId);
        setTeam(data.team);
        setActiveOrder(data.workOrder);
        setActiveStep(stepFromStatus(data.workOrder?.status));
        if (data.workOrder) {
          setColdMixBags(data.workOrder.materialsUsed?.coldMixBags ?? 0);
          setCompactorTimeMin(data.workOrder.materialsUsed?.compactorMinutes ?? 0);
        }
      } else if (orderId) {
        const order = await getWorkOrderById(orderId);
        setActiveOrder(order);
        setActiveStep(stepFromStatus(order.status));
        setColdMixBags(order.materialsUsed?.coldMixBags ?? 0);
        setCompactorTimeMin(order.materialsUsed?.compactorMinutes ?? 0);
      } else {
        setActiveOrder(null);
      }
    } catch (error) {
      console.error('Failed to load field assignment:', error);
      setActiveOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAssignment(); }, [teamId, orderId]);

  const moveToStep = async (step: number) => {
    if (!activeOrder) return;
    const statusByStep: Record<number, MaintenanceWorkOrder['status']> = {
      1: 'En Route', 2: 'On Site', 4: 'Repairing', 5: 'Inspection', 6: 'Completed',
    };
    const status = statusByStep[step];
    if (status) {
      try {
        await updateWorkOrderStatus(activeOrder.id, status);
        setActiveOrder({ ...activeOrder, status });
      } catch (error) {
        console.error('Failed to update work order:', error);
        alert('Could not update the work-order status.');
        return;
      }
    }
    setActiveStep(step);
  };

  const saveMaterials = async (nextBags: number, nextCompactor: number) => {
    if (!activeOrder) return;
    setSavingMaterials(true);
    try {
      await updateMaterialsUsed(activeOrder.id, { coldMixBags: Math.max(0, nextBags), compactorMinutes: Math.max(0, nextCompactor) });
      setColdMixBags(Math.max(0, nextBags));
      setCompactorTimeMin(Math.max(0, nextCompactor));
    } catch (error) {
      console.error('Failed to save materials:', error);
      alert('Material log could not be saved.');
    } finally {
      setSavingMaterials(false);
    }
  };

  const handleAfterPhotoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeOrder) return;
    setIsVerifying(true);
    try {
      const result = await submitRepairVerification(activeOrder.id, file);
      setVerificationMessage(result.message);
      await loadAssignment();
    } catch (error) {
      console.error('Repair verification failed:', error);
      setVerificationMessage('Verification could not be completed. The work order remains open for manual review.');
    } finally {
      setIsVerifying(false);
      e.target.value = '';
    }
  };

  const toggle = (key: keyof typeof checklist) => setChecklist((v) => ({ ...v, [key]: !v[key] }));
  const defectMeasurementLabel = activeOrder?.depthMeasurementCm ? `Defect depth measured (${activeOrder.depthMeasurementCm} cm)` : 'Defect dimensions measured and recorded';

  return (
    <div className="space-y-6 pb-20 pt-1">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0e1626] p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">FIELD CREW COMPANION</div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">Field Worker Mobile Tablet App</h1>
          <p className="text-sm text-slate-300">Live assignment, repair logging, and backend-backed AI verification.</p>
        </div>
        <button onClick={() => navigate('/authority/field-teams')} className="px-3.5 py-2 rounded-xl bg-slate-800 text-white text-xs">Back to Fleet Command</button>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-7 bg-[#0b101c] p-6 rounded-3xl border-2 border-slate-700 space-y-6">
          <div className="flex items-center justify-between text-[11px] font-mono border-b border-slate-800 pb-3">
            <div className="flex items-center gap-1.5 text-[#00e3fd] font-bold"><Smartphone className="w-4 h-4" />
              <span>{team ? `SQUAD TABLET · ${team.name.toUpperCase()} (${team.vehiclePlate})` : 'SQUAD TABLET · SELECT A FIELD TEAM'}</span>
            </div>
            <span className="text-emerald-400">{team ? `${team.batteryPct}% BATTERY` : 'OFFLINE'}</span>
          </div>

          {loading ? <div className="text-slate-400 text-sm">Loading assignment…</div> : !activeOrder ? (
            <div className="p-8 rounded-2xl border border-slate-800 text-center text-slate-400">No active work order is assigned to this field team.</div>
          ) : <>
            <div className="p-4 rounded-2xl bg-slate-900 border border-cyan-500/30 space-y-2">
              <div className="flex justify-between"><span className="text-xs font-mono text-red-400">{activeOrder.priority} TASK</span><span className="text-xs text-slate-400">Order #{activeOrder.id}</span></div>
              <h3 className="text-lg font-black text-white">{activeOrder.roadName}</h3>
              <div className="text-xs text-slate-300 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{activeOrder.location}</div>
              <div className="text-xs text-cyan-300">Status: {activeOrder.status}</div>
            </div>

            <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-mono font-bold">
              {[{step:1,label:'En Route'},{step:2,label:'On Site'},{step:4,label:'Repairing'},{step:6,label:'Verified'}].map((s) => (
                <button key={s.step} onClick={() => moveToStep(s.step)} className={`py-2 rounded-xl ${activeStep >= s.step ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-400'}`}>{s.label}</button>
              ))}
            </div>

            {activeStep === 2 && <div className="space-y-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <h4 className="text-xs font-mono font-bold text-white flex gap-2"><CheckSquare className="w-4 h-4 text-cyan-400" />FIELD SAFETY CHECKLIST</h4>
              {[
                ['roadSurface','Road surface perimeter cleared of loose debris'],
                ['defectMeasured',defectMeasurementLabel],
                ['structuralDamage','Adjacent structural damage inspected'],
                ['drainage','Drainage and nearby utilities inspected'],
                ['safetyBarriers','Safety barriers and warning signs placed'],
              ].map(([key,label]) => <button key={key} onClick={() => toggle(key as keyof typeof checklist)} className="w-full p-3 rounded-xl border border-slate-800 flex gap-3 text-left text-xs text-slate-200">
                {checklist[key as keyof typeof checklist] ? <CheckCircle2 className="w-4 h-4 text-cyan-400" /> : <Square className="w-4 h-4 text-slate-500" />} {label}
              </button>)}
              <button onClick={() => moveToStep(4)} className="w-full py-3 bg-cyan-500 text-slate-950 font-black text-xs rounded-xl">Checklist Complete → Start Repair</button>
            </div>}

            {activeStep === 4 && <div className="space-y-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <h4 className="text-xs font-mono font-bold text-white flex gap-2"><Wrench className="w-4 h-4 text-amber-400" />MATERIAL USAGE & COMPACTION LOG</h4>
              <div className="grid grid-cols-2 gap-3">
                <Counter title="COLD MIX BAGS (25kg)" value={coldMixBags} disabled={savingMaterials} onChange={(v) => saveMaterials(v, compactorTimeMin)} footer={`Total: ${coldMixBags * 25} kg`} />
                <Counter title="PLATE COMPACTION (min)" value={compactorTimeMin} step={5} disabled={savingMaterials} onChange={(v) => saveMaterials(coldMixBags, v)} footer={savingMaterials ? 'Saving…' : 'Saved to work order'} />
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleAfterPhotoSelected} />
              <button onClick={() => fileInputRef.current?.click()} disabled={isVerifying} className="w-full py-3 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl flex justify-center gap-2"><Camera className="w-4 h-4" />{isVerifying ? 'Running AI verification…' : 'Capture After-Repair Photo & Verify'}</button>
              {verificationMessage && <div className="p-3 rounded-xl bg-slate-950 text-xs text-slate-300">{verificationMessage}</div>}
            </div>}
          </>}
        </div>

        <div className="md:col-span-5 bg-[#0e1626] p-6 rounded-3xl border border-cyan-500/40 space-y-4">
          <h3 className="text-lg font-bold text-white">AI FIELD COPILOT</h3>
          {!activeOrder?.aiRecommendation?.available ? <div className="p-4 rounded-xl bg-slate-900 text-sm text-slate-400">No live AI repair recommendation is available for this work order.</div> : <>
            <div className="p-4 rounded-xl bg-slate-900 text-sm text-slate-200 space-y-2">
              {activeOrder.depthMeasurementCm != null && <div>Detected defect depth: <b>{activeOrder.depthMeasurementCm} cm</b></div>}
              {activeOrder.aiRecommendation.material && <div>Recommended material: <b>{activeOrder.aiRecommendation.material}{activeOrder.aiRecommendation.materialKg != null ? ` ${activeOrder.aiRecommendation.materialKg} kg` : ''}</b></div>}
              {activeOrder.aiRecommendation.safetyZoneM != null && <div>Recommended safety zone: <b>{activeOrder.aiRecommendation.safetyZoneM} m</b></div>}
              {activeOrder.aiRecommendation.notes && <div>{activeOrder.aiRecommendation.notes}</div>}
            </div>
            {activeOrder.repairInstructions?.length ? <div className="space-y-2">{activeOrder.repairInstructions.map((x) => <div key={x} className="text-xs text-amber-300 flex gap-2"><AlertTriangle className="w-4 h-4" />{x}</div>)}</div> : null}
          </>}
          <div className="text-xs text-slate-500">All displayed recommendations come from the backend. No fixed demo measurements are used.</div>
        </div>
      </div>
    </div>
  );
};

const Counter: React.FC<{ title:string; value:number; step?:number; disabled:boolean; onChange:(v:number)=>void; footer:string }> = ({ title, value, step=1, disabled, onChange, footer }) => (
  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-center">
    <div className="text-[10px] font-mono text-slate-400">{title}</div>
    <div className="flex items-center justify-center gap-3">
      <button disabled={disabled || value <= 0} onClick={() => onChange(Math.max(0, value-step))} className="w-8 h-8 rounded-lg bg-slate-800 text-white disabled:opacity-50">-</button>
      <span className="text-2xl font-mono font-bold text-white">{value}</span>
      <button disabled={disabled} onClick={() => onChange(value+step)} className="w-8 h-8 rounded-lg bg-slate-800 text-white disabled:opacity-50">+</button>
    </div>
    <div className="text-[10px] font-mono text-cyan-400">{footer}</div>
  </div>
);
