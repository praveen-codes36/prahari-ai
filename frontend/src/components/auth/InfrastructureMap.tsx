import React, { useState, useEffect, useMemo, useRef } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import {
  Activity,
  Sparkles,
  Cpu,
  Layers,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  INDIA_GEOJSON,
  GEO_CITY_NODES,
  GEO_NETWORK_EDGES,
  GeoCityNode,
} from '../../data/indiaGeoData';
import { InfrastructureNodes } from './InfrastructureNodes';
import { InfrastructureRoutes } from './InfrastructureRoutes';
import { MapTelemetry } from './MapTelemetry';

interface InfrastructureMapProps {
  isAuthenticating?: boolean;
}

export const InfrastructureMap: React.FC<InfrastructureMapProps> = ({
  isAuthenticating = false,
}) => {
  const [selectedNode, setSelectedNode] = useState<GeoCityNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GeoCityNode | null>(null);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  // SVG canvas fixed aspect coordinate space
  const svgWidth = 800;
  const svgHeight = 900;

  // D3-Geo Mercator Projection calibrated specifically to real India GeoJSON data
  const projection = useMemo(() => {
    return geoMercator().fitExtent(
      [
        [40, 50],
        [svgWidth - 40, svgHeight - 50],
      ],
      INDIA_GEOJSON
    );
  }, [svgWidth, svgHeight]);

  const pathGenerator = useMemo(() => {
    return geoPath().projection(projection);
  }, [projection]);

  // Project real GeoJSON geographic features to SVG paths
  const renderedCountryFeatures = useMemo(() => {
    return INDIA_GEOJSON.features.map((feature: any, idx: number) => ({
      id: feature.properties?.iso || `feature-${idx}`,
      name: feature.properties?.name || 'India Territory',
      d: pathGenerator(feature) || '',
    }));
  }, [pathGenerator]);

  // Project exact city geographic coordinates ([longitude, latitude]) to [x, y]
  const projectedNodes = useMemo(() => {
    return GEO_CITY_NODES.map((node) => {
      const coords = projection(node.coordinates);
      return {
        x: coords ? coords[0] : 0,
        y: coords ? coords[1] : 0,
        node,
      };
    });
  }, [projection]);

  // Map for fast Edge (route) lookups
  const nodesMap = useMemo(() => {
    const map = new Map<string, { x: number; y: number; node: GeoCityNode }>();
    projectedNodes.forEach((pn) => {
      map.set(pn.node.id, pn);
    });
    return map;
  }, [projectedNodes]);

  // Emergency EMS-42 unit positioned on projected route between Mumbai & Pune
  const emsLocation = useMemo(() => {
    const bom = nodesMap.get('BOM');
    const pnq = nodesMap.get('PNQ');
    if (bom && pnq) {
      return {
        x: bom.x + (pnq.x - bom.x) * 0.45,
        y: bom.y + (pnq.y - bom.y) * 0.45,
      };
    }
    return { x: 230, y: 550 };
  }, [nodesMap]);

  // Smooth AI Radar Sweep Animation across India's vertical extent
  useEffect(() => {
    let pos = 0;
    const animateSweep = () => {
      pos = (pos + 0.25) % 100;
      setScanProgress(pos);
      animationFrameRef.current = requestAnimationFrame(animateSweep);
    };
    animationFrameRef.current = requestAnimationFrame(animateSweep);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div
      className="relative w-full h-full min-h-[560px] lg:min-h-[660px] flex flex-col justify-between p-4 md:p-6 select-none overflow-hidden rounded-3xl bg-[#060a14] border border-slate-800/90 shadow-2xl"
      id="india-infrastructure-map-container"
    >
      {/* Background Deep Space Grid & Subtle Neural Ambient Glow */}
      <div className="absolute inset-0 grid-pattern opacity-25 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Map Header & Live Telemetry Counters */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-[#00e3fd] animate-ping opacity-75" />
            <div className="absolute w-2 h-2 rounded-full bg-[#00e3fd]" />
          </div>
          <div>
            <div className="text-[11px] font-mono font-bold tracking-widest text-[#00e3fd] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              LIVE INDIA INFRASTRUCTURE NERVOUS SYSTEM
            </div>
            <div className="text-[9px] font-mono text-slate-400">
              REAL GEOGRAPHIC GEOJSON PROJECTION · NATIONAL ARTERIAL AI GRID
            </div>
          </div>
        </div>

        {/* Real-Time Telemetry Badges */}
        <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono">
          <span className="px-2.5 py-1 rounded-md bg-slate-900/90 border border-slate-800 text-slate-300">
            AI NODES: <strong className="text-cyan-400 font-bold">284</strong>
          </span>
          <span className="px-2.5 py-1 rounded-md bg-slate-900/90 border border-slate-800 text-slate-300">
            INCIDENTS: <strong className="text-red-400 font-bold">07</strong>
          </span>
          <span className="px-2.5 py-1 rounded-md bg-slate-900/90 border border-slate-800 text-slate-300">
            EMS UNITS: <strong className="text-emerald-400 font-bold">18</strong>
          </span>
          <span className="px-2.5 py-1 rounded-md bg-slate-900/90 border border-slate-800 text-slate-300">
            CREWS: <strong className="text-amber-400 font-bold">42</strong>
          </span>
        </div>
      </div>

      {/* Main SVG Visualization Layer Stack */}
      <div className="relative flex-1 flex items-center justify-center my-2 overflow-hidden">
        {/* Layer 7: AI Scan Beam Overlay (Moves gracefully over the canvas) */}
        <div
          className="absolute inset-x-0 h-36 pointer-events-none z-10 transition-all duration-75"
          style={{
            top: `${scanProgress}%`,
            background:
              'linear-gradient(180deg, rgba(0, 227, 253, 0.0) 0%, rgba(0, 227, 253, 0.12) 50%, rgba(0, 227, 253, 0.0) 100%)',
            borderBottom: '1.5px solid rgba(0, 227, 253, 0.45)',
            boxShadow: '0 0 35px rgba(0, 227, 253, 0.3)',
          }}
        >
          <div className="absolute right-4 bottom-1 text-[9px] font-mono text-[#00e3fd] uppercase tracking-wider flex items-center gap-1.5 bg-slate-950/85 px-2 py-0.5 rounded border border-cyan-500/30 backdrop-blur-md">
            <Cpu className="w-3 h-3 animate-spin text-[#00e3fd]" />
            AI SCAN ACTIVE · 284 NODES ANALYZED
          </div>
        </div>

        {/* Master SVG Canvas */}
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full max-h-[540px] lg:max-h-[620px] drop-shadow-[0_0_40px_rgba(0,102,255,0.2)] overflow-visible"
        >
          <defs>
            {/* Territory Gradient Fill */}
            <linearGradient id="realIndiaLandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0f1d38" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#0a1428" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#060c18" stopOpacity="0.98" />
            </linearGradient>

            {/* Glowing Coastline/Border Stroke */}
            <linearGradient id="realIndiaBorderGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00e3fd" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#00e3fd" stopOpacity="0.85" />
            </linearGradient>

            {/* Glow Filters */}
            <filter id="cyanGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="redGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* LAYER 1, 2 & 3: Real India Geographic Boundary, Fill & Coastal Glow from GeoJSON */}
          <g className="geographic-base-layer">
            {renderedCountryFeatures.map((feat) => (
              <path
                key={feat.id}
                d={feat.d}
                fill="url(#realIndiaLandGrad)"
                stroke="url(#realIndiaBorderGrad)"
                strokeWidth="2.2"
                strokeLinejoin="round"
                strokeLinecap="round"
                className="transition-colors duration-500"
              />
            ))}
          </g>

          {/* Territory Lat/Lon Grid Lines (Subtle Geographic Mesh) */}
          <g className="geographic-grid-lines pointer-events-none" opacity="0.18">
            <line x1="100" y1="200" x2="700" y2="200" stroke="#00e3fd" strokeDasharray="3 6" strokeWidth="0.8" />
            <line x1="100" y1="400" x2="700" y2="400" stroke="#00e3fd" strokeDasharray="3 6" strokeWidth="0.8" />
            <line x1="100" y1="600" x2="700" y2="600" stroke="#00e3fd" strokeDasharray="3 6" strokeWidth="0.8" />
            <line x1="100" y1="750" x2="700" y2="750" stroke="#00e3fd" strokeDasharray="3 6" strokeWidth="0.8" />
            <line x1="300" y1="80" x2="300" y2="850" stroke="#00e3fd" strokeDasharray="3 6" strokeWidth="0.8" />
            <line x1="500" y1="80" x2="500" y2="850" stroke="#00e3fd" strokeDasharray="3 6" strokeWidth="0.8" />
          </g>

          {/* LAYER 4 & 6: Infrastructure Network Arterial Lines & Moving Telemetry Particles */}
          <InfrastructureRoutes edges={GEO_NETWORK_EDGES} nodesMap={nodesMap} />

          {/* LAYER 8: Emergency Response Active EMS-42 Unit on Mumbai-Pune corridor */}
          <g
            transform={`translate(${emsLocation.x}, ${emsLocation.y})`}
            className="animate-bounce pointer-events-none"
            style={{ animationDuration: '2.2s' }}
          >
            <circle r="13" fill="rgba(0, 227, 253, 0.25)" className="animate-ping" />
            <circle r="7.5" fill="#00e3fd" filter="url(#cyanGlow)" />
            <circle r="3.5" fill="#001738" />
            <g transform="translate(14, -7)">
              <rect
                x="0"
                y="0"
                width="88"
                height="23"
                rx="5"
                fill="#001738"
                stroke="#00e3fd"
                strokeWidth="1.2"
              />
              <text
                x="8"
                y="15.5"
                fill="#00e3fd"
                fontSize="9.5"
                fontFamily="monospace"
                fontWeight="bold"
              >
                ● EMS-42 LIVE
              </text>
            </g>
          </g>

          {/* LAYER 5, 9 & 10: Projected City Nodes, Risk Pulsers & Telemetry Labels */}
          <InfrastructureNodes
            projectedNodes={projectedNodes}
            selectedNode={selectedNode}
            hoveredNode={hoveredNode}
            onSelectNode={(node) => setSelectedNode(node)}
            onHoverNode={(node) => setHoveredNode(node)}
            scanProgress={scanProgress}
          />
        </svg>
      </div>

      {/* Floating Dynamic Map Alert & Route Telemetry Bottom Matrix */}
      <MapTelemetry />
    </div>
  );
};
