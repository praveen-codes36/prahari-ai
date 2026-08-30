import React, { useState, useEffect } from 'react';
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

  // Map state
  const [routeACoords, setRouteACoords] = useState<{lat: number, lng: number}[]>([]);
  const [routeBCoords, setRouteBCoords] = useState<{lat: number, lng: number}[]>([]);
  const [mapOrigin, setMapOrigin] = useState<{lat: number, lng: number} | undefined>(undefined);
  const [mapDestination, setMapDestination] = useState<{lat: number, lng: number} | undefined>(undefined);
  const [mapAccident, setMapAccident] = useState<{lat: number, lng: number} | undefined>(undefined);
  const [routeHazards, setRouteHazards] = useState<any>({ potholes: [], blockages: [] });
  const [originCallsign, setOriginCallsign] = useState<string>('');
  const [destinationName, setDestinationName] = useState<string>('');
  const [activeAccident, setActiveAccident] = useState<any>(null);

  const [allAccidents, setAllAccidents] = useState<any[]>([]);

  const fetchAccidents = async () => {
    try {
      const res = await apiClient.get('/accidents');
      if (res.data.success && res.data.data) {
        const activeAccidents = res.data.data.filter((a: any) => a.status !== 'CLEARED');
        setAllAccidents(activeAccidents);
        if (activeAccidents.length > 0 && !activeAccident) {
          setActiveAccident(activeAccidents[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch accidents:', error);
    }
  };

  const fetchRoutes = async (accidentId?: string) => {
    if (!accidentId && !activeAccident) return;
    setIsRecalculating(true);
    try {
      const idToFetch = accidentId || activeAccident._id;
      const acc = allAccidents.find(a => a._id === idToFetch) || activeAccident;
      
      if (acc) {
        setActiveAccident(acc);
        setMapAccident({ lat: acc.location.coordinates[1], lng: acc.location.coordinates[0] });
      }

      const payload = { accident_id: idToFetch };
      const response = await apiClient.post('/emergency/route', payload);
      
      if (response.data.success && response.data.data) {
        const { route, ambulance, hospital, hazards } = response.data.data;
        
        if (hazards) {
          setRouteHazards(hazards);
        }

        if (ambulance) {
           setMapOrigin({ lat: ambulance.current_location.coordinates[1], lng: ambulance.current_location.coordinates[0] });
           setOriginCallsign(ambulance.vehicle_number);
        }
        if (hospital) {
           setMapDestination({ lat: hospital.location.coordinates[1], lng: hospital.location.coordinates[0] });
           setDestinationName(hospital.name);
        }
        
        const formattedRoutes: EmergencyRouteOption[] = [];
        
        if (route.fastest_route_coords && route.fastest_route_coords.length > 0) {
           setRouteACoords(route.fastest_route_coords);
           formattedRoutes.push({
             id: 'A',
             name: 'Fastest Route',
             isRecommended: route.recommended_route_type === 'fastest',
             riskLevel: route.fastest_route_avg_risk > 0.6 ? 'high' : route.fastest_route_avg_risk > 0.3 ? 'medium' : 'low',
             distanceKm: parseFloat((route.fastest_route_distance || 0).toFixed(2)),
             estimatedEtaMin: Math.ceil(route.fastest_route_eta_mins || 0),
             trafficStatus: 'Moderate',
             bottlenecks: [],
             advantages: ['Optimized for minimum travel time.'],
             aiAssessment: 'Fastest path based on current traffic.',
             signalPreemptionNodes: 4
           });
        }
        if (route.safest_route_coords && route.safest_route_coords.length > 0 && JSON.stringify(route.safest_route_coords) !== JSON.stringify(route.fastest_route_coords)) {
           setRouteBCoords(route.safest_route_coords);
           formattedRoutes.push({
             id: 'B',
             name: 'Safest Route',
             isRecommended: route.recommended_route_type === 'safest',
             riskLevel: route.safest_route_avg_risk > 0.6 ? 'high' : route.safest_route_avg_risk > 0.3 ? 'medium' : 'low',
             distanceKm: parseFloat((route.safest_route_distance || 0).toFixed(2)),
             estimatedEtaMin: Math.ceil(route.safest_route_eta_mins || 0),
             trafficStatus: 'Low',
             bottlenecks: [],
             advantages: [`Safest path avoiding ${route.safest_route_pothole_count || 0} potholes.`],
             aiAssessment: 'Safest path bypassing identified risk zones.',
             signalPreemptionNodes: 3
           });
        }
        
        if (formattedRoutes.length === 1) {
           formattedRoutes.push({
             id: 'B',
             name: 'Alternative Routes',
             isRecommended: false,
             riskLevel: 'low',
             distanceKm: formattedRoutes[0].distanceKm,
             estimatedEtaMin: formattedRoutes[0].estimatedEtaMin,
             trafficStatus: 'N/A',
             bottlenecks: [],
             advantages: [],
             aiAssessment: 'No significantly safer alternative route exists.',
             signalPreemptionNodes: 0
           });
        }

        
        setRoutes(formattedRoutes);
        setSelectedRouteId(formattedRoutes[0]?.id || 'A');
      }
    } catch (error) {
      console.error('Failed to calculate routes:', error);
      // Clear data if backend fails
      setMapOrigin(undefined);
      setMapDestination(undefined);
      setOriginCallsign('');
      setDestinationName('');
      setRouteACoords([]);
      setRouteBCoords([]);
      setRoutes([]);
      setRouteHazards({ potholes: [], blockages: [] });
    } finally {
      setIsRecalculating(false);
    }
  };

  useEffect(() => {
    fetchAccidents().then(() => fetchRoutes());
  }, []);

  const handleRecalculate = () => {
    fetchRoutes();
  };

  const handleAccidentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    fetchRoutes(selectedId);
  };

  const handleDispatch = async () => {
    try {
      if (activeAccident) {
         await apiClient.patch(`/accidents/${activeAccident._id}/status`, { status: 'RESPONDING' });
      }
      const selected = routes.find(r => r.id === selectedRouteId);
      setDispatchStatus({
        isDispatched: true,
        dispatchId: `DISP-${Math.floor(Math.random() * 10000)}`,
        signalsPreempted: selected?.signalPreemptionNodes || 0,
      });
    } catch (error) {
       console.error("Failed to dispatch", error);
       alert("Dispatch failed. Check console.");
    }
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
          <select 
            value={activeAccident?._id || ''} 
            onChange={handleAccidentChange}
            className="bg-[#191f2f] text-xs font-mono text-[#c2c6d8] border border-white/10 rounded-xl px-3 py-2.5 outline-none focus:border-[#00daf3]"
          >
            <option value="" disabled>Select Incident</option>
            {allAccidents.map(acc => (
              <option key={acc._id} value={acc._id}>
                Incident {acc._id.substring(0, 6)} ({acc.severity})
              </option>
            ))}
          </select>

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
            disabled={dispatchStatus.isDispatched}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#b3c5ff] hover:bg-[#dae1ff] text-[#002b75] font-bold text-xs shadow-[0_0_20px_rgba(179,197,255,0.4)] transition-all active:scale-95 disabled:opacity-50"
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
        origin={mapOrigin}
        destination={mapDestination}
        accidentCoords={mapAccident}
        routeACoords={routeACoords}
        routeBCoords={routeBCoords}
        originCallsign={originCallsign}
        destinationName={destinationName}
        hazards={routeHazards}
      />

      {/* Route Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              {/* Priority Access Signals Tag */}
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
