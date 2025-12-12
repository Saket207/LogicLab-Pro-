import React from 'react';
import { Handle, Position } from 'reactflow';

export default function NandGate({ data, isConnectable }) {
  return (
    <div className="gate-node nand-gate">
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
          <circle cx="90" cy="30" r="10" />
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