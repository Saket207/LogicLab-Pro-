import React from 'react';
import { Handle, Position } from 'reactflow';

export default function MultiLED({ data, isConnectable }) {
  const { state, label, ledCount = 8 } = data;
    // Convert state to array if it's not already
  const ledStates = Array.isArray(state) ? state : Array(ledCount).fill(false);
  
  // Ensure we have the right number of LEDs
  const normalizedStates = Array.from({ length: ledCount }, (_, i) => 
    ledStates[i] || false
  );
  
  // Use precomputed values if available from circuit evaluation
  const activeCount = data.activeCount !== undefined ? 
    data.activeCount : normalizedStates.filter(Boolean).length;
  
  const binaryPattern = data.binaryPattern !== undefined ?
    data.binaryPattern : normalizedStates.map(state => state ? '1' : '0').join('');
    
  // Calculate decimal value of the LED array (for display purposes)
  const decimalValue = normalizedStates.reduce((acc, bit, index) => {
    return acc + (bit ? Math.pow(2, ledCount - 1 - index) : 0);
  }, 0);
  
  return (
    <div className="multi-led-node">
      {/* Input handles for each LED */}
      {Array.from({ length: ledCount }, (_, i) => (
        <Handle
          key={`led${i}`}
          type="target"
          position={Position.Left}
          id={`led${i}`}
          style={{ top: `${((i + 1) / (ledCount + 1)) * 100}%` }}
          isConnectable={isConnectable}
        />
      ))}
      
      {/* LED array body */}
      <div className="multi-led-body">
        <div className="multi-led-title">{label}</div>
        
        {/* LED grid */}
        <div className="led-grid">
          {normalizedStates.map((isOn, index) => (
            <div 
              key={index} 
              className={`multi-led-item ${isOn ? 'on' : 'off'}`}
              title={`LED ${index}: ${isOn ? 'ON' : 'OFF'}`}
            >
              <div className="led-circle">
                <div className="led-shine"></div>
              </div>
              <div className="led-index">{index}</div>
            </div>
          ))}
        </div>
        
        {/* Status summary */}
        <div className="led-status">
          <div className="active-count">
            Active: {activeCount}/{ledCount}
          </div>
          <div className="binary-pattern">
            {binaryPattern}
          </div>          <div className="decimal-value">
            Dec: {decimalValue}
          </div>
        </div>
      </div>
    </div>
  );
}
