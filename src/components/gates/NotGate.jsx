import React from 'react';
import { Handle, Position } from 'reactflow';

export default function NotGate({ data, isConnectable }) {
  return (
    <div className="gate-node not-gate">
      <Handle
        type="target"
        position={Position.Left}
        id="in"
        isConnectable={isConnectable}
      />
      
      <div className="gate-label">{data.label}</div>
      
      <svg width="60" height="60" viewBox="0 0 100 60">
        <g fill="none" stroke="#333" strokeWidth="2">
          {/* Triangle */}
          <path d="M20 10 L70 30 L20 50 Z" />
          {/* Bubble */}
          <circle cx="80" cy="30" r="10" />
        </g>
      </svg>
      
      <Handle
        type="source"
        position={Position.Right}
        id="out"
        isConnectable={isConnectable}
      />
    </div>
  );
}