import React from 'react';
import { Handle, Position } from 'reactflow';

export default function AndGate({ data, isConnectable }) {
  return (
    <div className="gate-node and-gate">
      <Handle
        type="target"
        position={Position.Left}
        id="in1"
        style={{ top: '30%' }}
        isConnectable={isConnectable}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="in2"
        style={{ top: '70%' }}
        isConnectable={isConnectable}
      />
      
      <div className="gate-label">{data.label}</div>
      
      <svg width="60" height="60" viewBox="0 0 100 60">
        <g fill="none" stroke="#333" strokeWidth="2">
          <path d="M20 10 L60 10 Q80 10 80 30 Q80 50 60 50 L20 50 Z" />
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