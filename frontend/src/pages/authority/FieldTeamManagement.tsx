import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck,
  Battery,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertOctagon,
  Wrench,
  Sparkles,
  PhoneCall,
  Navigation,
  FileCheck2,
  ChevronRight,
  Radio,
  Sliders,
  Search,
  Zap,
  Activity,
  Send,
  UserCheck,
} from 'lucide-react';
import { MOCK_FIELD_TEAMS } from '../../data/mockData';
import { FieldTeam } from '../../types';

export const FieldTeamManagement: React.FC = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<FieldTeam[]>(MOCK_FIELD_TEAMS);
  const [selectedTeam, setSelectedTeam] = useState<FieldTeam>(MOCK_FIELD_TEAMS[0] || {} as FieldTeam);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ON SITE' | 'EN ROUTE' | 'AVAILABLE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [radioMessage, setRadioMessage] = useState('');
  const [radioLogs, setRadioLogs] = useState<Array<{ sender: string; time: string; text: string }>>([
    {
      sender: 'Insp. R. Yadav (Squad 04)',
      time: '2 mins ago',
      text: 'Arrived on site at Andheri link. Traffic diversion cones deployed. Prepping cold asphalt injection.',
    },
    {
      sender: 'Eng. Sunil Verma (Squad 01)',
      time: '6 mins ago',
      text: 'En route NH-48 KM 14.2 with geo-grid mesh rolls and cold milling unit. ETA 22 min.',
    },
    {
      sender: 'HQ Dispatch',
      time: '12 mins ago',
      text: 'Priority escalation: Heavy monsoon alert active in Western zone. Expedite sub-base sealing.',
    },
  ]);

  const filteredTeams = teams.filter((team) => {
    const matchesFilter =
      statusFilter === 'ALL' ||
      team.status?.toUpperCase() === statusFilter;
    const matchesSearch =
      !searchQuery ||
      team.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.callsign?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.leadName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.vehiclePlate?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.locationName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleSendRadio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!radioMessage.trim()) return;
    const newLog = {
      sender: 'HQ Dispatch',
      time: 'Just now',
      text: radioMessage.trim(),
    };
    setRadioLogs((prev) => [newLog, ...prev]);
    setRadioMessage('');
  };

  const handleUpdateTeamStatus = (newStatus: 'AVAILABLE' | 'EN ROUTE' | 'ON SITE') => {
    if (!selectedTeam) return;
    const updated = { ...selectedTeam, status: newStatus };
    setSelectedTeam(updated);
    setTeams((prev) => prev.map((t) => (t.id === selectedTeam.id ? updated : t)));
  };

  const getEquipmentList = (team: FieldTeam): string[] => {
    if (Array.isArray(team.equipment) && team.equipment.length > 0) {
      return team.equipment;
    }
    if (Array.isArray((team as any).equipmentLoadout) && (team as any).equipmentLoadout.length > 0) {
      return (team as any).equipmentLoadout;
    }
    return [
      '✓ Polymer Cold-Mix (450kg)',
      '✓ Vibro-Compactor 1.2T',
      '✓ Safety Barrier Cones (24x)',
      '✓ AI Laser Depth Gauge',
    ];
  };

  const getBatteryPct = (team: FieldTeam): number => {
    if (typeof team.batteryPct === 'number') return team.batteryPct;
    if (typeof (team as any).batteryPercent === 'number') return (team as any).batteryPercent;
    return 85;
  };

  const getMembersCount = (team: FieldTeam): number => {
    if (typeof team.membersCount === 'number') return team.membersCount;
    if (typeof (team as any).memberCount === 'number') return (team as any).memberCount;
    return 4;
  };

  return (
    <div className="space-y-6 pb-20 pt-1">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0e1626] p-5 rounded-2xl border border-slate-800 shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/40">
              MUNICIPAL & HIGHWAY FLEET TELEMETRY
            </span>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-500/30">
              ● 16 SQUADS LIVE
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Field Squad Command & Resource Fleet
          </h1>
          <p className="text-xs md:text-sm text-slate-300">
            Real-time GPS tracking, vehicle loadouts, crew communication channels, and active task coordination.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => navigate('/authority/maintenance-command')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-semibold border border-slate-700 transition-all"
          >
            <Wrench className="w-4 h-4 text-amber-400" />
            <span>Maintenance Command</span>
          </button>
          <button
            onClick={() => navigate('/authority/field-app')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-[#001738] font-black text-xs shadow-lg transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Squad Tablet UI</span>
          </button>
        </div>
      </div>

      {/* Fleet KPI Quick Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-[#0e1626] border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase">ACTIVE SQUADS</span>
            <div className="text-xl font-mono font-black text-white mt-0.5">{teams.length} Live</div>
          </div>
          <Truck className="w-6 h-6 text-cyan-400/60" />
        </div>
        <div className="p-3.5 rounded-xl bg-[#0e1626] border border-emerald-500/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-emerald-400 uppercase">ON SITE REPAIRING</span>
            <div className="text-xl font-mono font-black text-emerald-400 mt-0.5">
              {teams.filter((t) => t.status?.toUpperCase() === 'ON SITE').length}
            </div>
          </div>
          <Activity className="w-6 h-6 text-emerald-400/60" />
        </div>
        <div className="p-3.5 rounded-xl bg-[#0e1626] border border-blue-500/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-blue-400 uppercase">EN ROUTE TRANSIT</span>
            <div className="text-xl font-mono font-black text-blue-400 mt-0.5">
              {teams.filter((t) => t.status?.toUpperCase() === 'EN ROUTE').length}
            </div>
          </div>
          <Navigation className="w-6 h-6 text-blue-400/60" />
        </div>
        <div className="p-3.5 rounded-xl bg-[#0e1626] border border-cyan-500/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase">AVG BATTERY / FLEET</span>
            <div className="text-xl font-mono font-black text-cyan-300 mt-0.5">
              {Math.round(teams.reduce((acc, t) => acc + getBatteryPct(t), 0) / (teams.length || 1))}%
            </div>
          </div>
          <Battery className="w-6 h-6 text-cyan-400/60" />
        </div>
      </div>

      {/* Main Grid: Teams List & Detailed Team Telemetry Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols: Field Teams List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between gap-2 px-1">
            <div className="text-xs font-mono font-bold text-slate-400 uppercase">
              DEPLOYED SQUADS ({filteredTeams.length})
            </div>
            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
              {(['ALL', 'ON SITE', 'EN ROUTE', 'AVAILABLE'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                    statusFilter === filter
                      ? 'bg-[#00e3fd] text-[#001738]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search squad by callsign, vehicle, or lead..."
              className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00e3fd]"
            />
          </div>

          {/* Squad Cards List */}
          <div className="space-y-3 max-h-[720px] overflow-y-auto pr-1">
            {filteredTeams.map((team) => {
              const isSelected = selectedTeam?.id === team.id;
              const battery = getBatteryPct(team);
              const members = getMembersCount(team);
              const isStatusOnSite = team.status?.toUpperCase() === 'ON SITE';
              const isStatusEnRoute = team.status?.toUpperCase() === 'EN ROUTE';

              return (
                <div
                  key={team.id}
                  onClick={() => setSelectedTeam(team)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                    isSelected
                      ? 'bg-[#0e1626] border-[#00e3fd] shadow-[0_0_20px_rgba(0,227,253,0.15)]'
                      : 'bg-[#0e1626]/70 border-slate-800 hover:bg-[#0e1626] hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-cyan-400">{team.callsign}</span>
                        <h3 className="text-sm font-bold text-white">{team.name}</h3>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Lead: <strong className="text-slate-200">{team.leadName}</strong> ({members} members)
                      </div>
                    </div>

                    <span
                      className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                        isStatusOnSite
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : isStatusEnRoute
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {team.status}
                    </span>
                  </div>

                  {/* Telemetry Row */}
                  <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono pt-2 border-t border-slate-800/80">
                    <div className="bg-slate-900/80 p-1.5 rounded-lg">
                      <span className="text-slate-400 block">VEHICLE</span>
                      <span className="text-white font-bold">{team.vehiclePlate || 'MH-04-FT'}</span>
                    </div>
                    <div className="bg-slate-900/80 p-1.5 rounded-lg">
                      <span className="text-slate-400 block">BATTERY</span>
                      <span className="text-emerald-400 font-bold">{battery}%</span>
                    </div>
                    <div className="bg-slate-900/80 p-1.5 rounded-lg">
                      <span className="text-slate-400 block">ETA</span>
                      <span className="text-cyan-400 font-bold">{team.etaMin ?? 0} min</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-300 flex items-center justify-between">
                    <span className="truncate">Current: <strong className="text-white">{team.currentTask || 'Patrol Standby'}</strong></span>
                    <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  </div>
                </div>
              );
            })}

            {filteredTeams.length === 0 && (
              <div className="p-8 text-center bg-slate-900/50 rounded-2xl border border-slate-800 text-slate-400 text-xs">
                No field squads match the selected filter or query.
              </div>
            )}
          </div>
        </div>

        {/* Right 7 Cols: Selected Squad Deep Command Workspace */}
        {selectedTeam && selectedTeam.id ? (
          <div className="lg:col-span-7 bg-[#0e1626] p-6 rounded-2xl border border-slate-800 shadow-2xl space-y-6 flex flex-col justify-between">
            <div className="space-y-5">
              {/* Squad Header */}
              <div className="border-b border-slate-800 pb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                      {selectedTeam.callsign} · GPS LOCKED
                    </span>
                    <span className="text-xs font-mono text-emerald-400">
                      {getBatteryPct(selectedTeam)}% Fleet Power
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white mt-1">{selectedTeam.name}</h2>
                  <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-red-400" />
                    <span>{selectedTeam.locationName || 'Assigned Highway Sector'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate('/authority/field-app')}
                    className="px-3.5 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-cyan-300 text-xs font-bold rounded-xl border border-cyan-500/30 flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#00e3fd]" />
                    <span>Field Tablet View</span>
                  </button>
                </div>
              </div>

              {/* Status Update Quick Bar */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                <span className="font-mono text-slate-400">SQUAD DISPATCH STATUS:</span>
                <div className="flex items-center gap-1.5">
                  {(['ON SITE', 'EN ROUTE', 'AVAILABLE'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleUpdateTeamStatus(st)}
                      className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold transition-all ${
                        selectedTeam.status?.toUpperCase() === st
                          ? 'bg-cyan-500 text-[#001738] shadow-md'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Current Active Task Card */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-mono font-bold text-amber-400 uppercase flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-amber-400" />
                    Active Work Assignment
                  </div>
                  {selectedTeam.currentWorkOrderId && (
                    <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30">
                      Order: {selectedTeam.currentWorkOrderId}
                    </span>
                  )}
                </div>
                <div className="text-sm font-bold text-white">
                  {selectedTeam.currentTask || 'Standard Highway Patrol & Preventive Triage'}
                </div>
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-1">
                  <span>
                    GPS: {selectedTeam.coordinates?.lat?.toFixed(4) ?? '19.1158'},{' '}
                    {selectedTeam.coordinates?.lng?.toFixed(4) ?? '72.8682'}
                  </span>
                  <span className="text-emerald-400 font-bold">
                    Shift: {selectedTeam.shiftHours || '06:00 - 18:00 IST'}
                  </span>
                </div>
              </div>

              {/* Equipment & Tool Loadout */}
              <div className="space-y-2">
                <div className="text-xs font-mono font-bold text-slate-400 uppercase">
                  ONBOARD EQUIPMENT & MATERIAL LOADOUT:
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
                  {getEquipmentList(selectedTeam).map((eq, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                      <span className="text-slate-200 truncate">{eq}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Communications Channel */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800/80 pb-2">
                  <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                    <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                    RADIO CHANNEL: VHF-148.25 MHz
                  </span>
                  <span className="text-emerald-400 font-bold">Signal: 98% (Encrypted)</span>
                </div>

                {/* Radio Log Messages */}
                <div className="space-y-2 max-h-36 overflow-y-auto text-xs pr-1">
                  {radioLogs.map((log, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 space-y-0.5">
                      <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400">
                        <span className="font-bold">{log.sender}</span>
                        <span className="text-slate-500">{log.time}</span>
                      </div>
                      <div className="text-slate-300 text-[11px]">"{log.text}"</div>
                    </div>
                  ))}
                </div>

                {/* Send Broadcast Box */}
                <form onSubmit={handleSendRadio} className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={radioMessage}
                    onChange={(e) => setRadioMessage(e.target.value)}
                    placeholder={`Transmit directive to ${selectedTeam.callsign}...`}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-[#001738] font-bold text-xs rounded-lg flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => navigate('/authority/work-orders')}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-colors"
              >
                <FileCheck2 className="w-4 h-4 text-cyan-400" />
                <span>Review Work Orders</span>
              </button>
              <button
                onClick={() => navigate('/authority/maintenance-command')}
                className="py-2.5 px-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-[#001738] font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all"
              >
                <Truck className="w-4 h-4" />
                <span>Maintenance Command</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-7 bg-[#0e1626] p-12 rounded-2xl border border-slate-800 text-center text-slate-400">
            Select a field squad to inspect live telemetry.
          </div>
        )}
      </div>
    </div>
  );
};

