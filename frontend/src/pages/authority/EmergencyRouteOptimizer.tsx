import React, { useState } from 'react';
import {
  Navigation,
  Radio,
  Clock,
  Shield,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Zap,
  MapPin,
  TrendingDown,
  Layers,
  ChevronRight,
  Hospital,
} from 'lucide-react';
import { RouteOptimizationMap } from '../../components/map/RouteOptimizationMap';
import { EmergencyRouteOption } from '../../types';
import apiClient from '../../services/apiClient';

export const EmergencyRouteOptimizer: React.FC = () => {
  const [routes, setRoutes] = useState<EmergencyRouteOption[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<'A' | 'B' | 'C'>('A');
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [dispatchStatus, setDispatchStatus] = useState<{
    isDispatched: boolean;
    dispatchId?: string;
    signalsPreempted?: number;
  }>({ isDispatched: false });

  const fetchRoutes = async () => {
    setIsRecalculating(true);
    try {
      // Pass coordinates for Prayagraj center for demo purposes
      const response = await apiClient.post('/emergency/route', {
        longitude: 81.8463, 
        latitude: 25.4358
      });
      if (response.data.success && response.data.data) {
        const { route } = response.data.data;
        const formattedRoutes: EmergencyRouteOption[] = [
          {
            id: 'A',
            name: 'Fastest AI Route',
            isRecommended: true,
            riskLevel: 'low',
            distanceKm: route.fastest_route_coords?.length ? (route.fastest_route_coords.length * 0.1).toFixed(1) as any : 4.5,
            estimatedEtaMin: route.fastest_route_eta_mins || 12,
            trafficStatus: 'Clear',
            bottlenecks: [],
            advantages: ['Fastest time', 'Low risk'],
            aiAssessment: 'Optimal path minimizing risk and travel time.',
            signalPreemptionNodes: 4
          }
        ];
        setRoutes(formattedRoutes);
        setSelectedRouteId('A');
      }
    } catch (error) {
      console.error('Failed to calculate routes:', error);
    } finally {
      setIsRecalculating(false);
    }
  };

  React.useEffect(() => {
    fetchRoutes();
  }, []);

  const handleRecalculate = () => {
    fetchRoutes();
  };

  const handleDispatch = async () => {
    // In a real scenario, this would POST to a dispatch endpoint
    setDispatchStatus({
      isDispatched: true,
      dispatchId: `DISP-${Math.floor(Math.random() * 10000)}`,
      signalsPreempted: 4,
    });
  };

  return (
    <div className="space-y-6 pb-20 pt-2">
      {/* Header with Title and Recalculate Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#00daf3] bg-[#00e3fd]/10 px-2 py-0.5 rounded border border-[#00e3fd]/30">
              TRAFFIC SIGNAL PREEMPTION & EMERGENCY GREEN WAVE
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Emergency Route Optimization
          </h1>
          <p className="text-xs md:text-sm text-[#8c90a1]">
            AI dynamically routes EMS units to bypass severe potholes, construction zones, and traffic gridlocks.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRecalculate}
            disabled={isRecalculating}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#191f2f] hover:bg-[#242a3a] text-xs font-mono text-[#c2c6d8] hover:text-white border border-white/10 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRecalculating ? 'animate-spin text-[#00daf3]' : ''}`} />
            <span>Recalculate AI Routes</span>
          </button>

          <button
            onClick={handleDispatch}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#b3c5ff] hover:bg-[#dae1ff] text-[#002b75] font-bold text-xs shadow-[0_0_20px_rgba(179,197,255,0.4)] transition-all active:scale-95"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Dispatch Route {selectedRouteId} (Green Wave)</span>
          </button>
        </div>
      </div>

      {/* Live Vector Map Visualizer */}
      <RouteOptimizationMap
        selectedRouteId={selectedRouteId}
        onSelectRoute={setSelectedRouteId}
        routes={routes}
      />

      {/* Route Comparison Cards (Matching Stitch Screen Layout) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {routes.map((route) => {
          const isSelected = selectedRouteId === route.id;
          return (
            <div
              key={route.id}
              onClick={() => setSelectedRouteId(route.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xl relative overflow-hidden ${
                isSelected
                  ? route.isRecommended
                    ? 'bg-[#151b2b] border-[#00daf3] shadow-[0_0_20px_rgba(0,227,253,0.25)]'
                    : 'bg-[#151b2b] border-[#ff5252] shadow-[0_0_20px_rgba(255,82,82,0.2)]'
                  : 'bg-[#151b2b]/70 border-white/10 hover:bg-[#191f2f]'
              }`}
            >
              {route.isRecommended && (
                <div className="absolute top-0 right-0 bg-[#00daf3] text-[#002b75] font-mono text-[9px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                  AI Recommended
                </div>
              )}

              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`w-7 h-7 rounded-lg font-mono text-xs font-bold flex items-center justify-center ${
                    route.id === 'B'
                      ? 'bg-[#00daf3] text-[#002b75]'
                      : route.id === 'A'
                      ? 'bg-[#93000a] text-[#ffdad6]'
                      : 'bg-[#242a3a] text-white'
                  }`}
                >
                  {route.id}
                </span>
                <span className="font-bold text-white text-sm truncate">{route.name}</span>
              </div>

              {/* Time & Distance Metric */}
              <div className="flex items-baseline gap-2 mb-3">
                <span
                  className={`text-3xl font-bold font-mono ${
                    route.id === 'B' ? 'text-[#00daf3]' : 'text-white'
                  }`}
                >
                  {route.estimatedEtaMin} min
                </span>
                <span className="text-xs font-mono text-[#8c90a1]">({route.distanceKm} km)</span>
              </div>

              <p className="text-xs text-[#c2c6d8] mb-3 leading-relaxed">
                {route.aiAssessment}
              </p>

              {/* Preemption Signals Tag */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono">
                <span className="text-[#8c90a1]">Signals Preempted:</span>
                <strong className="text-[#00daf3]">{route.signalPreemptionNodes} Intersections</strong>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Dispatch Confirmation Alert Modal / Banner */}
      {dispatchStatus.isDispatched && (
        <div className="bg-[#00e3fd]/15 border border-[#00e3fd]/40 rounded-2xl p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00daf3] text-[#002b75] flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Green Corridor Active · Dispatch #{dispatchStatus.dispatchId}
              </h3>
              <p className="text-xs text-[#c2c6d8] font-mono">
                {dispatchStatus.signalsPreempted} traffic signal controllers overridden with 90s preemptive green waves.
              </p>
            </div>
          </div>
          <button
            onClick={() => setDispatchStatus({ isDispatched: false })}
            className="px-4 py-2 rounded-xl bg-[#00daf3] text-[#002b75] font-bold text-xs font-mono"
          >
            Acknowledge & Monitor Corridor
          </button>
        </div>
      )}
    </div>
  );
};
