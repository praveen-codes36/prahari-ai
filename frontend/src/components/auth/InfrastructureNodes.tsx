import React from 'react';
import { GeoCityNode } from '../../data/indiaGeoData';

interface ProjectedNode {
  x: number;
  y: number;
  node: GeoCityNode;
}

interface InfrastructureNodesProps {
  projectedNodes: ProjectedNode[];
  selectedNode: GeoCityNode | null;
  hoveredNode: GeoCityNode | null;
  onSelectNode: (node: GeoCityNode) => void;
  onHoverNode: (node: GeoCityNode | null) => void;
  scanProgress: number; // 0 to 100
}

export const InfrastructureNodes: React.FC<InfrastructureNodesProps> = ({
  projectedNodes,
  selectedNode,
  hoveredNode,
  onSelectNode,
  onHoverNode,
  scanProgress,
}) => {
  return (
    <g className="infrastructure-nodes-layer">
      {projectedNodes.map(({ x, y, node }) => {
        const isSelected = selectedNode?.id === node.id;
        const isHovered = hoveredNode?.id === node.id;
        const isCritical = node.status === 'critical';
        const isWarning = node.status === 'warning';
        const isHealthy = node.status === 'healthy';

        // Check if current scanning wave is passing close to this node (within 6% of canvas Y)
        const nodeNormalizedY = (y / 900) * 100;
        const isScanned = Math.abs(nodeNormalizedY - scanProgress) < 5;

        const dotColor = isCritical
          ? '#ef4444'
          : isWarning
          ? '#f59e0b'
          : isHealthy
          ? '#10b981'
          : '#00e3fd';

        const glowFilter = isCritical ? 'url(#redGlow)' : 'url(#cyanGlow)';

        return (
          <g
            key={node.id}
            transform={`translate(${x}, ${y})`}
            onClick={() => onSelectNode(node)}
            onMouseEnter={() => onHoverNode(node)}
            onMouseLeave={() => onHoverNode(null)}
            className="cursor-pointer group select-none"
            role="button"
            tabIndex={0}
          >
            {/* Outer Pulsing Radar Ring */}
            <circle
              r={isSelected || isHovered ? 18 : isCritical ? 14 : isScanned ? 12 : 9}
              fill="none"
              stroke={dotColor}
              strokeWidth={isScanned ? 2 : 1.2}
              strokeOpacity={isSelected || isHovered ? 0.9 : isScanned ? 0.85 : 0.4}
              className={`${isCritical ? 'animate-ping' : ''} transition-all duration-300`}
            />

            {/* Core Glowing Indicator Node */}
            <circle
              r={isSelected || isHovered ? 7 : isScanned ? 6 : 4.5}
              fill={dotColor}
              filter={glowFilter}
              className="transition-all duration-200 group-hover:scale-125"
            />

            {/* Inner Core Accent */}
            <circle r={2} fill="#ffffff" opacity={0.9} />

            {/* Primary City Label */}
            <text
              x={10}
              y={3.5}
              fill="#ffffff"
              fontSize={10}
              fontFamily="system-ui, -apple-system, sans-serif"
              fontWeight="bold"
              className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] opacity-90 group-hover:opacity-100 transition-opacity"
            >
              {node.name}
            </text>

            {/* Node Code & Health Index Subtitle */}
            <text
              x={10}
              y={14}
              fill="#94a3b8"
              fontSize={7.5}
              fontFamily="ui-monospace, monospace"
              className="opacity-80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
            >
              {node.code} · {node.healthPct}%
            </text>

            {/* Active Hover / Selected Interactive Telemetry Callout */}
            {(isSelected || isHovered) && (
              <g transform="translate(-10, -52)" className="pointer-events-none z-50 animate-in fade-in zoom-in-95 duration-150">
                <rect
                  x={-100}
                  y={0}
                  width={220}
                  height={44}
                  rx={6}
                  fill="#060c18"
                  stroke="#00e3fd"
                  strokeWidth={1.2}
                  className="shadow-2xl"
                  filter="drop-shadow(0 4px 12px rgba(0,0,0,0.8))"
                />
                <text x={-90} y={15} fill="#00e3fd" fontSize={8.5} fontFamily="ui-monospace, monospace" fontWeight="bold">
                  {node.code} · {node.state.toUpperCase()}
                </text>
                <text x={-90} y={28} fill="#ffffff" fontSize={8} fontFamily="system-ui, sans-serif">
                  {node.telemetry}
                </text>
                <text x={-90} y={39} fill={dotColor} fontSize={7.5} fontFamily="ui-monospace, monospace" fontWeight="bold">
                  HEALTH: {node.healthPct}% · INCIDENTS: 0{node.activeIncidents} · RISK: {node.riskScore}/100
                </text>
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
};
