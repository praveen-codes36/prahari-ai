import React from 'react';
import { GeoCityNode, GeoNetworkEdge } from '../../data/indiaGeoData';

interface InfrastructureRoutesProps {
  edges: GeoNetworkEdge[];
  nodesMap: Map<string, { x: number; y: number; node: GeoCityNode }>;
}

export const InfrastructureRoutes: React.FC<InfrastructureRoutesProps> = ({ edges, nodesMap }) => {
  return (
    <g className="road network-routes-layer pointer-events-none">
      {edges.map((edge) => {
        const fromPos = nodesMap.get(edge.from);
        const toPos = nodesMap.get(edge.to);

        if (!fromPos || !toPos) return null;

        const isEmergency = edge.isEmergency;
        const dx = toPos.x - fromPos.x;
        const dy = toPos.y - fromPos.y;
        const cx = (fromPos.x + toPos.x) / 2 - dy * 0.04;
        const cy = (fromPos.y + toPos.y) / 2 + dx * 0.04;
        const pathData = `M ${fromPos.x} ${fromPos.y} Q ${cx} ${cy} ${toPos.x} ${toPos.y}`;

        return (
          <g key={edge.id}>
            {/* Base Highway Network Line */}
            <path
              d={pathData}
              fill="none"
              stroke={isEmergency ? '#00e3fd' : '#1e3860'}
              strokeWidth={isEmergency ? 2.5 : 1.3}
              strokeOpacity={isEmergency ? 0.9 : 0.55}
              strokeLinecap="round"
              className={isEmergency ? 'drop-shadow-[0_0_10px_rgba(0,227,253,0.8)]' : ''}
            />

            {/* Moving Data Info Particle Animation on Routes */}
            <path
              d={pathData}
              fill="none"
              stroke={isEmergency ? '#10b981' : '#00e3fd'}
              strokeWidth={isEmergency ? 3 : 1.8}
              strokeDasharray={isEmergency ? '16 110' : '8 140'}
              strokeLinecap="round"
              className="route-pulse-particle"
            >
              <animate
                attributeName="stroke-dashoffset"
                values="240;0"
                dur={isEmergency ? '2.4s' : '5s'}
                repeatCount="indefinite"
              />
            </path>
          </g>
        );
      })}
    </g>
  );
};
