import React from 'react';
import { Handle, Position } from 'reactflow';

export default function FullAdder({ data, isConnectable }) {
  const { state, label } = data;
  
  return (
    <div className="full-adder-node">
      {/* Input handles */}
      <Handle
        type="target"
        position={Position.Left}
        id="a"
        style={{ top: '20%' }}
        isConnectable={isConnectable}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="b"
        style={{ top: '50%' }}
        isConnectable={isConnectable}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="cin"
        style={{ top: '80%' }}
        isConnectable={isConnectable}
      />
      
      {/* Component body */}
      <div className="full-adder-body">
        <div className="full-adder-title">Full Adder</div>
        <div className="full-adder-diagram">
          <svg viewBox="0 0 140 100" width="100%" height="100%">
            {/* First XOR gate */}
            <g className="xor-gate-1">
              <path d="M10 15 Q20 15 35 25 Q20 35 10 35 Q20 25 10 15 Z" 
                    fill="none" stroke="currentColor" strokeWidth="1"/>
              <path d="M5 15 Q15 25 5 35" 
                    fill="none" stroke="currentColor" strokeWidth="1"/>
              <text x="22" y="28" fontSize="6" textAnchor="middle">XOR</text>
            </g>
            
            {/* Second XOR gate for final Sum */}
            <g className="xor-gate-2">
              <path d="M50 25 Q60 25 75 35 Q60 45 50 45 Q60 35 50 35 Z" 
                    fill="none" stroke="currentColor" strokeWidth="1"/>
              <path d="M45 25 Q55 35 45 45" 
                    fill="none" stroke="currentColor" strokeWidth="1"/>
              <text x="62" y="38" fontSize="6" textAnchor="middle">XOR</text>
            </g>
            
            {/* AND gates for Carry */}
            <g className="and-gate-1">
              <path d="M10 55 L25 55 Q30 55 30 60 Q30 65 25 65 L10 65 Z" 
                    fill="none" stroke="currentColor" strokeWidth="1"/>
              <text x="20" y="63" fontSize="6" textAnchor="middle">AND</text>
            </g>
            
            <g className="and-gate-2">
              <path d="M50 55 L65 55 Q70 55 70 60 Q70 65 65 65 L50 65 Z" 
                    fill="none" stroke="currentColor" strokeWidth="1"/>
              <text x="60" y="63" fontSize="6" textAnchor="middle">AND</text>
            </g>
            
            {/* OR gate for final Carry */}
            <g className="or-gate">
              <path d="M85 55 Q95 55 105 60 Q95 65 85 65 Q95 60 85 55 Z" 
                    fill="none" stroke="currentColor" strokeWidth="1"/>
              <text x="95" y="63" fontSize="6" textAnchor="middle">OR</text>
            </g>
            
            {/* Output labels */}
            <text x="85" y="38" fontSize="8">Sum</text>
            <text x="115" y="63" fontSize="8">Cout</text>
          </svg>
        </div>
      </div>
      
      {/* Output handles */}
      <Handle
        type="source"
        position={Position.Right}
        id="sum"
        style={{ top: '30%' }}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="cout"
        style={{ top: '70%' }}
        isConnectable={isConnectable}
      />
      
      <div className="full-adder-label">{label}</div>
    </div>
  );
}
