import React, { useEffect } from 'react';
import { Shield, Radio, Navigation, CheckCircle2, AlertTriangle, Hospital, Flame } from 'lucide-react';
import { EmergencyRouteOption } from '../../types';
import { MapContainer, TileLayer, Marker, Polyline, useMap, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface HazardPothole {
  location: { lat: number, lng: number };
  severity: string;
}

interface HazardBlockage {
  location: { lat: number, lng: number };
  reason: string;
}

interface RouteOptimizationMapProps {
  selectedRouteId: 'A' | 'B' | 'C';
  onSelectRoute: (id: 'A' | 'B' | 'C') => void;
  routes: EmergencyRouteOption[];
  origin?: { lat: number, lng: number };
  destination?: { lat: number, lng: number };
  accidentCoords?: { lat: number, lng: number };
  routeACoords?: { lat: number, lng: number }[];
  routeBCoords?: { lat: number, lng: number }[];
  originCallsign?: string;
  destinationName?: string;
  hazards?: { potholes: HazardPothole[], blockages: HazardBlockage[] };
}

const MapRecenter = ({ center }: { center: { lat: number, lng: number } }) => {
  const map = useMap();
  useEffect(() => {
    if (center.lat && center.lng) {
      map.setView([center.lat, center.lng], 13);
    }
  }, [center, map]);
  return null;
};

// Custom Icons
const potholeIcon = L.divIcon({
  className: 'custom-map-icon',
  html: `
    <div class="relative flex flex-col items-center group">
      <div class="w-6 h-6 rounded-full bg-orange-500 border-2 border-white text-white flex items-center justify-center shadow-[0_0_10px_rgba(249,115,22,0.8)] z-10 transition-transform group-hover:scale-110">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
      </div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const blockageIcon = L.divIcon({
  className: 'custom-map-icon',
  html: `
    <div class="relative flex flex-col items-center group">
      <div class="w-6 h-6 rounded-md bg-purple-600 border-2 border-white text-white flex items-center justify-center shadow-[0_0_10px_rgba(147,51,234,0.8)] z-10 transition-transform group-hover:scale-110">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      </div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const originIcon = L.divIcon({
  className: 'custom-map-icon',
  html: `
    <div class="relative flex flex-col items-center group">
      <div class="w-8 h-8 rounded-full bg-cyan-500 border-2 border-white text-[#001738] flex items-center justify-center shadow-[0_0_15px_rgba(0,227,253,0.8)] z-10 transition-transform group-hover:scale-110">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
      </div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const destIcon = L.divIcon({
  className: 'custom-map-icon',
  html: `
    <div class="relative flex flex-col items-center group">
      <div class="w-9 h-9 rounded-lg bg-emerald-600 border-2 border-white text-white flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.8)] z-10 transition-transform group-hover:scale-110">
         <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6v4"/><path d="M14 14h-4"/><path d="M14 18h-4"/><path d="M14 8h-4"/><path d="M18 12h2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4h2"/><path d="M18 22V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16"/></svg>
      </div>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const accidentIcon = L.divIcon({
  className: 'custom-map-icon',
  html: `
    <div class="relative flex items-center justify-center">
      <div class="absolute w-12 h-12 rounded-full bg-red-500/30 animate-ping"></div>
      <div class="w-8 h-8 rounded-full bg-red-600 border-2 border-white text-white flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.8)] z-10">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
      </div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

export const RouteOptimizationMap: React.FC<RouteOptimizationMapProps> = ({
  selectedRouteId,
  onSelectRoute,
  routes,
  origin,
  destination,
  accidentCoords,
  routeACoords,
  routeBCoords,
  originCallsign,
  destinationName,
  hazards
}) => {
  const defaultCenter = { lat: 25.4358, lng: 81.8463 };
  
  return (
    <div className="relative w-full h-[420px] lg:h-[500px] bg-[#080e1d] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl z-0">
      <MapContainer 
        center={origin ? [origin.lat, origin.lng] : [defaultCenter.lat, defaultCenter.lng]} 
        zoom={13} 
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="opacity-90"
        />
        {origin && <MapRecenter center={origin} />}
        
        {/* Origin Marker */}
        {origin && (
           <Marker position={[origin.lat, origin.lng]} icon={originIcon}>
              <Popup className="custom-popup">
                 <div className="p-1 min-w-[120px]">
                   <div className="text-[10px] font-mono text-cyan-500 font-bold mb-1">ORIGIN</div>
                   <div className="text-sm font-bold text-slate-800 leading-tight">{originCallsign || 'EMS Unit'}</div>
                 </div>
              </Popup>
           </Marker>
        )}
        
        {/* Destination Marker */}
        {destination && (
           <Marker position={[destination.lat, destination.lng]} icon={destIcon}>
              <Popup className="custom-popup">
                 <div className="p-1 min-w-[120px]">
                   <div className="text-[10px] font-mono text-emerald-500 font-bold mb-1">DESTINATION</div>
                   <div className="text-sm font-bold text-slate-800 leading-tight">{destinationName || 'Hospital'}</div>
                 </div>
              </Popup>
           </Marker>
        )}
        
        {/* Accident Marker */}
        {accidentCoords && (
           <Marker position={[accidentCoords.lat, accidentCoords.lng]} icon={accidentIcon}>
              <Popup className="custom-popup">
                 <div className="p-1 min-w-[120px]">
                   <div className="text-[10px] font-mono text-red-500 font-bold mb-1">INCIDENT SITE</div>
                 </div>
              </Popup>
           </Marker>
        )}

        {/* Polylines for Routes */}
        {routeACoords && routeACoords.length > 0 && (
          <Polyline 
            key={`route-A-${selectedRouteId}`}
            positions={routeACoords.map(coord => [coord.lat, coord.lng])} 
            color={selectedRouteId === 'A' ? "#ff5252" : "#888"}
            weight={selectedRouteId === 'A' ? 6 : 3}
            opacity={selectedRouteId === 'A' ? 1 : 0.4}
            dashArray={selectedRouteId === 'A' ? "0" : "5, 10"}
          />
        )}
        
        {routeBCoords && routeBCoords.length > 0 && (
          <Polyline 
            key={`route-B-${selectedRouteId}`}
            positions={routeBCoords.map(coord => [coord.lat, coord.lng])} 
            color={selectedRouteId === 'B' ? "#00daf3" : "#888"}
            weight={selectedRouteId === 'B' ? 7 : 3}
            opacity={selectedRouteId === 'B' ? 1 : 0.4}
            dashArray={selectedRouteId === 'B' ? "0" : "5, 10"}
          />
        )}

        {hazards?.potholes?.map((p, i) => (
          <Marker 
            key={`pothole-${i}`} 
            position={[p.location.lat, p.location.lng]} 
            icon={potholeIcon}
          >
            <Popup className="custom-popup">
              <div className="font-bold text-orange-500">Hazard: Pothole</div>
              <div className="text-xs text-slate-300">Severity: {p.severity}</div>
            </Popup>
          </Marker>
        ))}

        {hazards?.blockages?.map((b, i) => (
          <Marker 
            key={`blockage-${i}`} 
            position={[b.location.lat, b.location.lng]} 
            icon={blockageIcon}
          >
            <Popup className="custom-popup">
              <div className="font-bold text-purple-500">Hazard: Roadblock</div>
              <div className="text-xs text-slate-300">Reason: {b.reason}</div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Interactive Floating Route Selector Overlay */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        {routes.map((route) => {
          const isSelected = selectedRouteId === route.id;
          return (
            <button
              key={route.id}
              onClick={() => onSelectRoute(route.id as 'A' | 'B' | 'C')}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs font-semibold flex items-center gap-1.5 transition-all shadow-lg backdrop-blur-md border ${
                isSelected
                  ? route.isRecommended
                    ? 'bg-[#00e3fd]/20 text-[#00daf3] border-[#00e3fd]/60 shadow-[0_0_15px_rgba(0,227,253,0.4)]'
                    : 'bg-[#ff5252]/20 text-[#ffb4ab] border-[#ffb4ab]/60 shadow-[0_0_15px_rgba(255,180,171,0.4)]'
                  : 'bg-[#151b2b]/80 text-[#8c90a1] border-white/10 hover:bg-[#242a3a]'
              }`}
            >
              <span>Route {route.id}</span>
              <span className="text-[10px] opacity-80">({route.estimatedEtaMin}m)</span>
              {route.isRecommended && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#00daf3] animate-pulse"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Data Info Live Badge */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#151b2b]/90 backdrop-blur-md border border-white/10 text-[10px] font-mono text-[#8c90a1]">
        <span className="w-2 h-2 rounded-full bg-[#00daf3] animate-pulse"></span>
        SIGNAL PREEMPTION: {routes.find(r => r.id === selectedRouteId)?.signalPreemptionNodes || 0} NODES ARMED
      </div>
    </div>
  );
};
