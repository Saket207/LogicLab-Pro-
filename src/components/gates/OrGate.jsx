import React from 'react';
import { Handle, Position } from 'reactflow';

export default function OrGate({ data, isConnectable }) {
  return (
    <div className="gate-node or-gate">
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
          <path d="M20 10 Q40 10 60 30 Q40 50 20 50 Q40 30 20 10 Z" />
          <path d="M20 10 C30 10 45 15 60 30 C45 45 30 50 20 50" />
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