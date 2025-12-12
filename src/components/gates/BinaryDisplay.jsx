import React from 'react';
import { Handle, Position } from 'reactflow';

export default function BinaryDisplay({ data, isConnectable }) {
  const { state, label, bits = 4 } = data;
    // Convert state to proper display values
  const binaryValue = Array.isArray(state) ? state : Array(bits).fill(false);
  
  // Use precomputed values from evaluation if available
  const decimalValue = data.decimalValue !== undefined 
    ? data.decimalValue 
    : binaryValue.reduce((acc, bit, index) => {
        return acc + (bit ? Math.pow(2, bits - 1 - index) : 0);
      }, 0);
  
  const hexValue = data.hexValue !== undefined
    ? data.hexValue
    : decimalValue.toString(16).toUpperCase();
  
  return (
    <div className="binary-display-node">
      {/* Input handles for each bit */}
      {Array.from({ length: bits }, (_, i) => (
        <Handle
          key={`bit${i}`}
          type="target"
          position={Position.Left}
          id={`bit${i}`}
          style={{ top: `${((i + 1) / (bits + 1)) * 100}%` }}
          isConnectable={isConnectable}
        />
      ))}
      
      {/* Display body */}
      <div className="binary-display-body">
        <div className="binary-display-title">{label}</div>
        
        {/* Binary representation */}
        <div className="binary-bits">
          {binaryValue.map((bit, index) => (
            <div 
              key={index} 
              className={`binary-bit ${bit ? 'on' : 'off'}`}
            >
              {bit ? '1' : '0'}
            </div>
          ))}
        </div>
        
        {/* Decimal value */}
        <div className="decimal-value">
          Dec: {decimalValue}
        </div>
        
        {/* Hexadecimal value */}
        <div className="hex-value">
          Hex: {hexValue}
        </div>
        
        {/* Bit position labels */}
        <div className="bit-labels">
          {Array.from({ length: bits }, (_, i) => (
            <div key={i} className="bit-label">
              {Math.pow(2, bits - 1 - i)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
