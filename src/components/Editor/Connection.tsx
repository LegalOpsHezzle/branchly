import React from 'react';
import { Position } from '../../types';

interface ConnectionProps {
  start: Position;
  end: Position;
  label: string;
  isExternal: boolean;
}

export const Connection: React.FC<ConnectionProps> = ({ start, end, label, isExternal }) => {
  // Constants for node size
  const NODE_WIDTH = 220;
  const NODE_HEIGHT = 140;

  // Calculate coordinates relative to node centers/edges
  const x1 = start.x + NODE_WIDTH / 2;
  const y1 = start.y + NODE_HEIGHT;
  const x2 = end.x + NODE_WIDTH / 2;
  const y2 = end.y;

  // Bezier curve points
  const cp1y = y1 + (y2 - y1) / 2;
  const cp2y = y1 + (y2 - y1) / 2;

  const path = `M ${x1} ${y1} C ${x1} ${cp1y}, ${x2} ${cp2y}, ${x2} ${y2}`;
  const color = isExternal ? '#a855f7' : '#9ca3af'; // Purple for external, gray for internal
  const strokeWidth = 2;

  // Label position (rough midpoint)
  const labelX = (x1 + x2) / 2;
  const labelY = (y1 + y2) / 2;

  return (
    <g className="pointer-events-none">
      <defs>
        <marker
          id={`arrow-${isExternal ? 'purple' : 'gray'}`}
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="5"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,10 L10,5 z" fill={color} />
        </marker>
      </defs>
      <path
        d={path}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="transparent"
        markerEnd={`url(#arrow-${isExternal ? 'purple' : 'gray'})`}
      />
      {label && (
        <g transform={`translate(${labelX}, ${labelY})`}>
          <rect
            x="-40"
            y="-10"
            width="80"
            height="20"
            rx="4"
            fill="white"
            stroke={color}
            strokeWidth="1"
          />
          <text
            textAnchor="middle"
            dy="4"
            fontSize="10"
            fontWeight="600"
            fill={color}
          >
            {label.length > 15 ? label.substring(0, 12) + '...' : label}
          </text>
        </g>
      )}
    </g>
  );
};
