import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Bell,
  Activity,
  Radio,
  User,
  ShieldCheck,
  Zap,
  Globe2,
  X,
  ExternalLink,
  ChevronDown,
  Layers,
  Wrench,
  Sparkles,
  MapPin,
  FileCheck2,
  Truck,
  AlertOctagon,
  Bot,
  LogOut,
  Flame,
  AlertTriangle,
} from 'lucide-react';
import { UserRole } from '../../types';
import { authService, ROLE_PRESETS } from '../../services/authService';
import apiClient from '../../services/apiClient';
import { reverseGeocode } from '../../utils/location';
import {
  MOCK_ROAD_SEGMENTS,
  MOCK_WORK_ORDERS,
  MOCK_FIELD_TEAMS,
  MOCK_EMERGENCY_INCIDENTS,
} from '../../data/mockData';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

interface LiveHeaderAlert {
  id: string;
  type: string;
  severity: string;
  title: string;
  message: string;
  location: string;
  timestamp: string;
  isRead: boolean;
  status: string;
}

export const Header: React.FC<HeaderProps> = ({ currentRole, onRoleChange }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [unreadAlerts, setUnreadAlerts] = useState<LiveHeaderAlert[]>([]);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const fetchLiveAlerts = async () => {
    try {
      const res = await apiClient.get('/alerts/active');
      if (res.data?.data && Array.isArray(res.data.data)) {
        const formatted: LiveHeaderAlert[] = await Promise.all(
          res.data.data.slice(0, 10).map(async (item: any) => {
            let locStr = 'Prayagraj Corridor';
            const coords = item.location?.coordinates;
            if (coords && coords.length === 2) {
              try {
                const geo = await reverseGeocode(coords[1], coords[0]);
                locStr = geo.address || geo.city || locStr;
              } catch {
                locStr = `${coords[1].toFixed(4)}°N, ${coords[0].toFixed(4)}°E`;
              }
            }

            const diffMins = Math.round((Date.now() - new Date(item.created_at || Date.now()).getTime()) / 60000);
            const timeLabel = diffMins <= 1 ? 'Just now' : diffMins < 60 ? `${diffMins} mins ago` : `${Math.round(diffMins / 60)} hrs ago`;

            return {
              id: item._id,
              type: item.type || 'ACCIDENT',
              severity: item.severity || 'HIGH',
              title: item.type === 'ACCIDENT' ? 'Critical Collision Incident' : item.type === 'HIGH_RISK_ZONE' ? 'High Risk Road Surge' : `${item.type} Alert`,
              message: item.message || 'Active road safety anomaly detected.',
              location: locStr,
              timestamp: timeLabel,
              isRead: item.status === 'ACKNOWLEDGED' || item.status === 'RESOLVED',
              status: item.status || 'ACTIVE'
            };
          })
        );
        setUnreadAlerts(formatted);
      }
    } catch {
      // Non-critical fallback
    }
  };

  useEffect(() => {
    fetchLiveAlerts();
    const interval = setInterval(fetchLiveAlerts, 15000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter search results across all entities
  const filteredRoads = MOCK_ROAD_SEGMENTS.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.city.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 3);

  const filteredIncidents = MOCK_EMERGENCY_INCIDENTS.filter(
    (inc) =>
      inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.location.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 3);

  const filteredWorkOrders = MOCK_WORK_ORDERS.filter(
    (wo) =>
      wo.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.roadName.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 3);

  const filteredTeams = MOCK_FIELD_TEAMS.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.callsign.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.vehiclePlate.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 2);

  const totalResults =
    filteredRoads.length + filteredIncidents.length + filteredWorkOrders.length + filteredTeams.length;

  // Role switching is disabled in strict authentication mode
  // Users must logout and login again to change roles.

  const handleLogout = () => {
    authService.logout();
    setIsRoleDropdownOpen(false);
    navigate('/login');
  };

  const criticalAlertCount = unreadAlerts.filter((a) => a.type === 'CRITICAL' && !a.isRead).length;

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-[#080d17]/95 backdrop-blur-2xl border-b border-slate-800/80 z-50 flex items-center justify-between px-3 md:px-6">
      {/* Brand & Mission Control ID */}
      <div className="flex items-center gap-3 md:gap-4">
        <Link to="/authority" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-cyan-500 to-emerald-400 p-[1.5px] shadow-[0_0_20px_rgba(0,227,253,0.3)]">
            <div className="w-full h-full bg-[#080d17] rounded-[10px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#00e3fd] group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm md:text-base tracking-wider text-white">
                PRAHARI
              </span>
              <span className="text-[10px] font-mono font-bold text-[#00e3fd] bg-cyan-950/60 px-1.5 py-0.2 rounded border border-cyan-500/40">
                AI NETWORK
              </span>
            </div>
            <div className="text-[9px] font-mono tracking-widest text-slate-400 uppercase">
              ROADGUARD INTELLIGENCE · PWD / NHAI
            </div>
          </div>
        </Link>
      </div>

      {/* Global Command Center Search Bar */}
      <div ref={searchRef} className="relative hidden md:block flex-1 max-w-lg mx-6">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            placeholder="Search road, asset ID, incident, work order, team, location..."
            className="w-full bg-[#0e1626] border border-slate-700/80 rounded-xl pl-9.5 pr-8 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#00e3fd] focus:ring-1 focus:ring-[#00e3fd]/40 transition-all font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setIsSearchOpen(false);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Universal Search Results Popover */}
        {isSearchOpen && searchQuery.trim() !== '' && (
          <div className="absolute top-full mt-2 inset-x-0 bg-[#0d1424] border border-slate-700 rounded-xl shadow-2xl p-3 z-50 max-h-96 overflow-y-auto space-y-3">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 border-b border-slate-800 pb-1.5">
              <span>SEARCH RESULTS ({totalResults})</span>
              <span>ESC to dismiss</span>
            </div>

            {/* Incidents Matches */}
            {filteredIncidents.length > 0 && (
              <div className="space-y-1">
                <div className="text-[10px] font-mono font-bold text-red-400 uppercase flex items-center gap-1">
                  <Radio className="w-3 h-3 text-red-400" />
                  Emergency Incidents
                </div>
                {filteredIncidents.map((inc) => (
                  <div
                    key={inc.id}
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery('');
                      navigate('/authority/emergency-ops');
                    }}
                    className="p-2 rounded-lg hover:bg-slate-800/80 cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-[#00e3fd]">
                        {inc.id} · {inc.title}
                      </div>
                      <div className="text-[10px] text-slate-400">{inc.location}</div>
                    </div>
                    <span className="text-[10px] font-mono text-red-400 bg-red-950/60 px-1.5 py-0.5 rounded border border-red-500/30">
                      Risk {inc.riskScore}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Road Assets Matches */}
            {filteredRoads.length > 0 && (
              <div className="space-y-1">
                <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-cyan-400" />
                  Road Network Corridors
                </div>
                {filteredRoads.map((road) => (
                  <div
                    key={road.id}
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery('');
                      navigate('/authority/global-map');
                    }}
                    className="p-2 rounded-lg hover:bg-slate-800/80 cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-[#00e3fd]">
                        {road.name}
                      </div>
                      <div className="text-[10px] text-slate-400">{road.district}, {road.city}</div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded">
                      Health {road.healthScore}%
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Work Orders Matches */}
            {filteredWorkOrders.length > 0 && (
              <div className="space-y-1">
                <div className="text-[10px] font-mono font-bold text-amber-400 uppercase flex items-center gap-1">
                  <FileCheck2 className="w-3 h-3 text-amber-400" />
                  Work Orders
                </div>
                {filteredWorkOrders.map((wo) => (
                  <div
                    key={wo.id}
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery('');
                      navigate('/authority/work-orders');
                    }}
                    className="p-2 rounded-lg hover:bg-slate-800/80 cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-[#00e3fd]">
                        {wo.id} · {wo.roadName}
                      </div>
                      <div className="text-[10px] text-slate-400">{wo.department}</div>
                    </div>
                    <span className="text-[10px] font-mono text-amber-300 bg-amber-950/60 px-1.5 py-0.5 rounded">
                      {wo.status}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Field Teams Matches */}
            {filteredTeams.length > 0 && (
              <div className="space-y-1">
                <div className="text-[10px] font-mono font-bold text-emerald-400 uppercase flex items-center gap-1">
                  <Truck className="w-3 h-3 text-emerald-400" />
                  Field Squads
                </div>
                {filteredTeams.map((team) => (
                  <div
                    key={team.id}
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery('');
                      navigate('/authority/field-teams');
                    }}
                    className="p-2 rounded-lg hover:bg-slate-800/80 cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-[#00e3fd]">
                        {team.name} ({team.callsign})
                      </div>
                      <div className="text-[10px] text-slate-400">{team.locationName} · {team.vehiclePlate}</div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/60 px-1.5 py-0.5 rounded">
                      {team.status}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {totalResults === 0 && (
              <div className="p-4 text-center text-xs text-slate-400 font-mono">
                No matching road assets, incidents, or work orders found.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Center/Right Data Info & Role Action Cluster */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* System & AI Operational Data Info (Desktop) */}
        <div className="hidden xl:flex items-center gap-3 px-3 py-1.5 bg-[#0e1626] border border-slate-800 rounded-xl text-[10px] font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-400">SYSTEM:</span>
            <span className="text-emerald-400 font-bold">OPERATIONAL</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00e3fd]"></span>
            <span className="text-slate-400">AI ENGINE:</span>
            <span className="text-[#00e3fd] font-bold">14.2ms</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">GPS GRID:</span>
            <span className="text-white font-bold">SYNCED</span>
          </div>
        </div>

        {/* Notifications Popover */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 rounded-xl bg-[#0e1626] hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition-colors"
            title="System Alerts & Incident Data Info"
          >
            <Bell className="w-4 h-4" />
            {unreadAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#ff5252] text-white font-mono text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse shadow-md">
                {unreadAlerts.length}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#0d1424] border border-slate-700 rounded-xl shadow-2xl p-4 z-50 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-[#ff5252] animate-pulse" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Operational Alerts
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#00daf3]">
                  {unreadAlerts.length} total
                </span>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {unreadAlerts.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400 font-mono">
                    No active operational alerts.
                  </div>
                ) : (
                  unreadAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      onClick={() => {
                        setIsNotificationsOpen(false);
                        if (alert.type === 'ACCIDENT') navigate('/authority/emergency-routes');
                        else navigate('/authority/alerts');
                      }}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                        alert.severity === 'CRITICAL' || alert.type === 'ACCIDENT'
                          ? 'bg-red-950/20 border-red-500/30 hover:bg-red-950/40 border-l-2 border-l-[#ff5252]'
                          : alert.severity === 'HIGH' || alert.type === 'HIGH_RISK_ZONE'
                          ? 'bg-amber-950/20 border-amber-500/30 hover:bg-amber-950/40 border-l-2 border-l-[#ffa000]'
                          : 'bg-slate-800/40 border-slate-700 hover:bg-slate-800 border-l-2 border-l-[#00daf3]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                              alert.severity === 'CRITICAL' || alert.type === 'ACCIDENT'
                                ? 'bg-red-500/30 text-red-300'
                                : alert.severity === 'HIGH'
                                ? 'bg-amber-500/30 text-amber-300'
                                : 'bg-cyan-500/30 text-cyan-300'
                            }`}
                          >
                            {alert.type}
                          </span>
                          <span className="text-[9px] font-mono text-slate-400">
                            {alert.severity}
                          </span>
                        </div>
                        <span className="text-[9px] font-mono text-slate-400">{alert.timestamp}</span>
                      </div>
                      <div className="text-xs font-bold text-white line-clamp-1">{alert.title}</div>
                      <div className="text-[11px] text-slate-300 line-clamp-2 mt-0.5">{alert.message}</div>
                      <div className="text-[10px] font-mono text-[#00daf3] mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#00daf3]" />
                        <span className="truncate">{alert.location}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between">
                <button
                  onClick={() => {
                    setIsNotificationsOpen(false);
                    navigate('/authority/alerts');
                  }}
                  className="text-xs font-mono text-[#00e3fd] hover:underline flex items-center gap-1"
                >
                  View All Alerts →
                </button>
                <button
                  onClick={async () => {
                    setUnreadAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
                    try {
                      await Promise.all(
                        unreadAlerts.filter((a) => !a.isRead).map((a) =>
                          apiClient.patch(`/alerts/${a.id}/status`, { status: 'ACKNOWLEDGED' })
                        )
                      );
                    } catch {}
                  }}
                  className="text-[11px] text-slate-400 hover:text-white font-mono"
                >
                  Mark All Read
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile / Logout */}
        <div className="relative">
          <button
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0e1626] hover:bg-slate-800 border border-slate-700/80 text-xs font-bold text-white transition-all shadow-sm"
          >
            <div className="w-2 h-2 rounded-full bg-[#00e3fd]"></div>
            <span className="hidden sm:inline capitalize">{currentRole}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isRoleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[#0d1424] border border-slate-700 rounded-xl shadow-2xl p-2 z-50 space-y-1">
              <div className="px-2 py-1 text-[10px] font-mono text-slate-400 uppercase">
                ACTIVE SESSION
              </div>
              <div className="px-2 py-1 text-xs text-white capitalize font-bold">
                 Role: {currentRole}
              </div>
              
              <div className="pt-1.5 mt-1.5 border-t border-slate-800">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between p-2 rounded-lg text-xs font-mono text-red-300 hover:bg-red-950/40 hover:text-red-200 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <LogOut className="w-3.5 h-3.5 text-red-400" />
                    <span>LOGOUT</span>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
