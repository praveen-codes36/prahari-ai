import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  MapPin,
  X,
  Shield,
  Layers,
  ChevronRight,
  RefreshCw,
  Trash2,
  Navigation,
  ExternalLink,
  Flame,
  AlertOctagon,
  Sparkles,
} from 'lucide-react';
import apiClient from '../../services/apiClient';
import { reverseGeocode } from '../../utils/location';

interface AlertItem {
  _id: string;
  type: 'ACCIDENT' | 'HIGH_RISK_ZONE' | 'BLOCKAGE' | 'DEFECT';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  message: string;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  is_simulated?: boolean;
  location?: {
    type: string;
    coordinates: [number, number]; // [lng, lat]
  };
  addressStr?: string;
  created_at: string;
}

export const SystemAlertsPage: React.FC = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'ACCIDENT' | 'HIGH_RISK_ZONE' | 'BLOCKAGE' | 'DEFECT'>('ALL');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'ACKNOWLEDGED'>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAlerts = async (showRefreshSpinner = false) => {
    if (showRefreshSpinner) setIsRefreshing(true);
    try {
      const response = await apiClient.get('/alerts/active');
      if (response.data?.data) {
        const rawAlerts: AlertItem[] = response.data.data;
        const formatted = await Promise.all(
          rawAlerts.map(async (item) => {
            let addressStr = 'Prayagraj Corridor';
            const coords = item.location?.coordinates;
            if (coords && coords.length === 2) {
              try {
                const geo = await reverseGeocode(coords[1], coords[0]);
                addressStr = geo.address || geo.city || addressStr;
              } catch {
                addressStr = `${coords[1].toFixed(4)}°N, ${coords[0].toFixed(4)}°E`;
              }
            }

            return {
              ...item,
              severity: item.severity || 'HIGH',
              status: item.status || 'ACTIVE',
              addressStr,
            };
          })
        );
        setAlerts(formatted);
      }
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleAcknowledge = async (id: string) => {
    try {
      await apiClient.patch(`/alerts/${id}/status`, { status: 'ACKNOWLEDGED' });
      setAlerts((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status: 'ACKNOWLEDGED' } : a))
      );
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await apiClient.patch(`/alerts/${id}/status`, { status: 'RESOLVED' });
      setAlerts((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status: 'RESOLVED' } : a))
      );
    } catch (err) {
      console.error('Failed to resolve alert:', err);
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      await apiClient.delete(`/alerts/${id}`);
      setAlerts((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      console.error('Failed to dismiss alert:', err);
    }
  };

  const formatTimestamp = (dateStr?: string) => {
    if (!dateStr) return 'Just now';
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) +
      ', ' +
      d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const filteredAlerts = alerts.filter((a) => {
    const matchesCategory = categoryFilter === 'ALL' || a.type === categoryFilter;
    const matchesSeverity = severityFilter === 'ALL' || a.severity === severityFilter;
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    return matchesCategory && matchesSeverity && matchesStatus;
  });

  // Calculate live statistics
  const stats = {
    total: alerts.length,
    critical: alerts.filter((a) => a.severity === 'CRITICAL').length,
    accidents: alerts.filter((a) => a.type === 'ACCIDENT').length,
    blockages: alerts.filter((a) => a.type === 'BLOCKAGE').length,
  };

  const getTypeTheme = (type: string, severity: string) => {
    if (type === 'ACCIDENT' || severity === 'CRITICAL') {
      return {
        badgeBg: 'bg-[#93000a] text-[#ffdad6] border-[#ffb4ab]/40',
        cardBorder: 'border-l-4 border-l-[#ff5252] border-white/10',
        icon: Flame,
        color: '#ff5252',
      };
    }
    if (type === 'HIGH_RISK_ZONE' || severity === 'HIGH') {
      return {
        badgeBg: 'bg-[#ffa000]/20 text-[#ffa000] border-[#ffa000]/40',
        cardBorder: 'border-l-4 border-l-[#ffa000] border-white/10',
        icon: AlertTriangle,
        color: '#ffa000',
      };
    }
    if (type === 'BLOCKAGE') {
      return {
        badgeBg: 'bg-amber-950/40 text-amber-300 border-amber-500/40',
        cardBorder: 'border-l-4 border-l-amber-400 border-white/10',
        icon: AlertOctagon,
        color: '#fbbf24',
      };
    }
    return {
      badgeBg: 'bg-[#00e3fd]/15 text-[#00daf3] border-[#00e3fd]/30',
      cardBorder: 'border-l-4 border-l-[#00daf3] border-white/10',
      icon: Info,
      color: '#00daf3',
    };
  };

  return (
    <div className="space-y-6 pb-20 pt-2 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#ff5252] bg-[#93000a]/30 px-2 py-0.5 rounded border border-[#ffb4ab]/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff5252] animate-ping" />
              REAL-TIME INCIDENT NOTIFICATIONS
            </span>
            <span className="text-[10px] font-mono text-[#8c90a1] bg-[#151b2b] px-2 py-0.5 rounded border border-white/10">
              FEATURE 12 · MUNICIPAL DISPATCH
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            System & Road Network Alerts
          </h1>
          <p className="text-xs md:text-sm text-[#8c90a1]">
            Automated alerts generated by smart computer vision, environmental flood sensors, and road patrol telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchAlerts(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#191f2f] hover:bg-[#242a3a] border border-white/10 text-xs font-mono text-[#b3c5ff] hover:text-white transition-all disabled:opacity-50"
            title="Refresh Live Alerts"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => navigate('/authority/simulation')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#b3c5ff] hover:bg-[#dae1ff] text-[#002b75] font-bold text-xs font-mono transition-all shadow-md"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Trigger Sandbox</span>
          </button>
        </div>
      </div>

      {/* Live Status KPI Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#151b2b] p-3.5 rounded-xl border border-white/10 flex items-center gap-3 shadow-md">
          <Bell className="w-4 h-4 text-[#00daf3]" />
          <div>
            <span className="text-[10px] font-mono text-[#8c90a1] block uppercase">Active Alerts</span>
            <strong className="text-sm text-white font-mono">{stats.total} Total</strong>
          </div>
        </div>

        <div className="bg-[#151b2b] p-3.5 rounded-xl border border-white/10 flex items-center gap-3 shadow-md">
          <Flame className="w-4 h-4 text-[#ff5252]" />
          <div>
            <span className="text-[10px] font-mono text-[#8c90a1] block uppercase">Critical Incidents</span>
            <strong className="text-sm text-[#ff5252] font-mono">{stats.critical} Emergency</strong>
          </div>
        </div>

        <div className="bg-[#151b2b] p-3.5 rounded-xl border border-white/10 flex items-center gap-3 shadow-md">
          <AlertTriangle className="w-4 h-4 text-[#ffa000]" />
          <div>
            <span className="text-[10px] font-mono text-[#8c90a1] block uppercase">Accidents Reported</span>
            <strong className="text-sm text-white font-mono">{stats.accidents} Incidents</strong>
          </div>
        </div>

        <div className="bg-[#151b2b] p-3.5 rounded-xl border border-white/10 flex items-center gap-3 shadow-md">
          <AlertOctagon className="w-4 h-4 text-amber-400" />
          <div>
            <span className="text-[10px] font-mono text-[#8c90a1] block uppercase">Blockages / Hazards</span>
            <strong className="text-sm text-amber-300 font-mono">{stats.blockages} Active</strong>
          </div>
        </div>
      </div>

      {/* Category Filter Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#151b2b] p-2 rounded-2xl border border-white/10 shadow-lg">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { key: 'ALL', label: 'All Alerts' },
            { key: 'ACCIDENT', label: '🚨 Accidents' },
            { key: 'HIGH_RISK_ZONE', label: '⚠️ Risk Zones' },
            { key: 'BLOCKAGE', label: '⛔ Blockages' },
            { key: 'DEFECT', label: '🛠 Defects' },
          ].map((cat) => (
            <button
              key={cat.key}
              onClick={() => setCategoryFilter(cat.key as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-all ${
                categoryFilter === cat.key
                  ? 'bg-[#0066ff] text-white font-bold shadow-[0_0_12px_rgba(0,102,255,0.4)]'
                  : 'text-[#8c90a1] hover:text-white hover:bg-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Severity / Status Dropdowns */}
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as any)}
            className="bg-[#0d1322] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-[#c2c6d8] focus:outline-none focus:border-[#00daf3] font-mono"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="HIGH">High Severity</option>
            <option value="MEDIUM">Medium Severity</option>
            <option value="LOW">Low Severity</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-[#0d1322] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-[#c2c6d8] focus:outline-none focus:border-[#00daf3] font-mono"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="ACKNOWLEDGED">Acknowledged</option>
          </select>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-5 rounded-2xl bg-[#151b2b] border border-white/10 animate-pulse space-y-3">
              <div className="h-4 bg-white/10 rounded w-1/4" />
              <div className="h-5 bg-white/10 rounded w-1/2" />
              <div className="h-3 bg-white/10 rounded w-3/4" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredAlerts.length === 0 && (
        <div className="bg-[#151b2b] rounded-2xl p-10 border border-white/10 text-center space-y-3 shadow-xl">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
          <h3 className="text-base font-bold text-white">No Active Alerts Found</h3>
          <p className="text-xs text-[#8c90a1] max-w-md mx-auto">
            {categoryFilter !== 'ALL' || severityFilter !== 'ALL' || statusFilter !== 'ALL'
              ? 'No alerts match your active filter criteria. Try changing the category or severity filters.'
              : 'All Prayagraj arterial corridors are currently operating without critical emergency alerts.'}
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={() => {
                setCategoryFilter('ALL');
                setSeverityFilter('ALL');
                setStatusFilter('ALL');
              }}
              className="px-4 py-2 rounded-xl bg-[#191f2f] hover:bg-[#242a3a] border border-white/10 text-xs font-mono text-[#b3c5ff]"
            >
              Reset Filters
            </button>
            <button
              onClick={() => navigate('/authority/simulation')}
              className="px-4 py-2 rounded-xl bg-[#0066ff] hover:bg-[#0052cc] text-white text-xs font-mono font-bold"
            >
              Trigger Simulated Accident
            </button>
          </div>
        </div>
      )}

      {/* Alerts Feed */}
      {!isLoading && (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => {
            const theme = getTypeTheme(alert.type, alert.severity);
            const IconComp = theme.icon;
            const shortId = alert._id ? `#ALT-${alert._id.slice(-6).toUpperCase()}` : '#ALT-LIVE';

            return (
              <div
                key={alert._id}
                className={`p-5 rounded-2xl bg-[#151b2b] transition-all shadow-lg hover:border-white/20 ${theme.cardBorder}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    {/* Top Row Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded border flex items-center gap-1.5 ${theme.badgeBg}`}>
                        <IconComp className="w-3 h-3" />
                        {alert.type}
                      </span>

                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                        alert.severity === 'CRITICAL'
                          ? 'bg-[#93000a]/50 text-[#ffb4ab] border-[#ffb4ab]/40'
                          : alert.severity === 'HIGH'
                          ? 'bg-[#ffa000]/20 text-[#ffa000] border-[#ffa000]/40'
                          : 'bg-[#00e3fd]/15 text-[#00daf3] border-[#00e3fd]/30'
                      }`}>
                        {alert.severity} SEVERITY
                      </span>

                      {alert.is_simulated && (
                        <span className="text-[10px] font-mono text-purple-300 bg-purple-950/50 px-2 py-0.5 rounded border border-purple-500/30">
                          SIMULATED
                        </span>
                      )}

                      {alert.status === 'ACKNOWLEDGED' && (
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                          ACKNOWLEDGED
                        </span>
                      )}

                      {alert.status === 'RESOLVED' && (
                        <span className="text-[10px] font-mono text-emerald-300 bg-emerald-900/40 px-2 py-0.5 rounded border border-emerald-400/30">
                          RESOLVED
                        </span>
                      )}

                      <span className="font-mono text-xs text-[#8c90a1]">{shortId}</span>

                      <span className="text-xs font-mono text-[#8c90a1] flex items-center gap-1 ml-auto sm:ml-0">
                        <Clock className="w-3 h-3" />
                        {formatTimestamp(alert.created_at)}
                      </span>
                    </div>

                    {/* Alert Title & Message */}
                    <h3 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
                      {alert.type === 'ACCIDENT'
                        ? '🚨 Vehicle Collision Incident'
                        : alert.type === 'HIGH_RISK_ZONE'
                        ? '⚠️ Critical Road Risk Spike'
                        : alert.type === 'BLOCKAGE'
                        ? '⛔ Road Blockage / Lane Closure'
                        : '🛠 Road Infrastructure Defect'}
                    </h3>
                    <p className="text-xs md:text-sm text-[#c2c6d8] leading-relaxed font-sans">{alert.message}</p>

                    {/* Location Info */}
                    <div className="flex items-center gap-1.5 text-xs text-[#8c90a1] font-mono pt-1">
                      <MapPin className="w-3.5 h-3.5 text-[#00daf3] shrink-0" />
                      <span className="text-white/90">{alert.addressStr}</span>
                      {alert.location?.coordinates && (
                        <span className="text-[#8c90a1] text-[11px] hidden sm:inline">
                          ({alert.location.coordinates[1].toFixed(4)}°N, {alert.location.coordinates[0].toFixed(4)}°E)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Action Control Buttons */}
                  <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                    {alert.type === 'ACCIDENT' && (
                      <button
                        onClick={() => navigate('/authority/emergency-routes')}
                        className="px-3.5 py-1.5 rounded-xl bg-[#b3c5ff] hover:bg-[#dae1ff] text-[#002b75] font-bold text-xs font-mono transition-all flex items-center gap-1.5 shadow-md"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Emergency Route</span>
                      </button>
                    )}

                    {alert.type !== 'ACCIDENT' && (
                      <button
                        onClick={() => navigate('/authority/global-map')}
                        className="px-3.5 py-1.5 rounded-xl bg-[#191f2f] hover:bg-[#242a3a] border border-white/10 text-xs font-mono text-[#b3c5ff] hover:text-white transition-colors flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View Map</span>
                      </button>
                    )}

                    {alert.status === 'ACTIVE' && (
                      <button
                        onClick={() => handleAcknowledge(alert._id)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#191f2f] hover:bg-[#242a3a] border border-white/10 text-xs font-mono text-[#00daf3] transition-colors"
                      >
                        Acknowledge
                      </button>
                    )}

                    {alert.status === 'ACKNOWLEDGED' && (
                      <button
                        onClick={() => handleResolve(alert._id)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 text-xs font-mono text-emerald-400 transition-colors"
                      >
                        Resolve
                      </button>
                    )}

                    <button
                      onClick={() => handleDismiss(alert._id)}
                      className="p-1.5 rounded-lg text-[#8c90a1] hover:text-[#ff5252] hover:bg-[#93000a]/20 transition-colors"
                      title="Dismiss Alert"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
