import React from 'react';
import { Handle, Position } from 'reactflow';

export default function HalfAdder({ data, isConnectable }) {
  const { state, label } = data;
  
  return (
    <div className="half-adder-node">
      {/* Input handles */}
      <Handle
        type="target"
        position={Position.Left}
        id="a"
        style={{ top: '25%' }}
        isConnectable={isConnectable}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="b"
        style={{ top: '75%' }}
        isConnectable={isConnectable}
      />
      
      {/* Component body */}
      <div className="half-adder-body">
        <div className="half-adder-title">Half Adder</div>
        <div className="half-adder-diagram">
          <svg viewBox="0 0 120 80" width="100%" height="100%">
            {/* XOR gate for Sum */}
            <g className="xor-gate">
              <path d="M10 15 Q20 15 35 25 Q20 35 10 35 Q20 25 10 15 Z" 
                    fill="none" stroke="currentColor" strokeWidth="1"/>
              <path d="M5 15 Q15 25 5 35" 
                    fill="none" stroke="currentColor" strokeWidth="1"/>
              <text x="22" y="28" fontSize="8" textAnchor="middle">XOR</text>
            </g>
            
            {/* AND gate for Carry */}
            <g className="and-gate">
              <path d="M10 45 L30 45 Q40 45 40 55 Q40 65 30 65 L10 65 Z" 
                    fill="none" stroke="currentColor" strokeWidth="1"/>
              <text x="25" y="58" fontSize="8" textAnchor="middle">AND</text>
            </g>
            
            {/* Internal connections */}
            <line x1="45" y1="25" x2="60" y2="25" stroke="currentColor" strokeWidth="1"/>
            <line x1="45" y1="55" x2="60" y2="55" stroke="currentColor" strokeWidth="1"/>
            
            {/* Output labels */}
            <text x="70" y="28" fontSize="8">Sum</text>
            <text x="70" y="58" fontSize="8">Carry</text>
          </svg>
        </div>
      </div>
      
      {/* Output handles */}
      <Handle
        type="source"
        position={Position.Right}
        id="sum"
        style={{ top: '25%' }}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="carry"
        style={{ top: '75%' }}
        isConnectable={isConnectable}
      />
      
      <div className="half-adder-label">{label}</div>
    </div>
  );
}
