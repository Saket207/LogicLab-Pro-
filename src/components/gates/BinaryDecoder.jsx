import React from 'react';
import { Handle, Position } from 'reactflow';

export default function BinaryDecoder({ data, isConnectable }) {
  const { state, label, inputBits = 2 } = data;
  
  // Number of output lines (2^inputBits)
  const outputLines = Math.pow(2, inputBits);
  
  // Extract input values from state
  const inputs = Array.isArray(state?.inputs) ? state.inputs : Array(inputBits).fill(false);
  const enable = state?.enable !== undefined ? state.enable : true;
  
  // Convert binary input to decimal
  const inputValue = inputs.reduce((acc, bit, index) => {
    return acc + (bit ? Math.pow(2, inputBits - 1 - index) : 0);
  }, 0);
  
  // Generate output array - only one output is high when enabled
  const outputs = Array.from({ length: outputLines }, (_, i) => {
    return enable && i === inputValue;
  });
  
  return (
    <div className="binary-decoder-node">
      {/* Input handles for binary input */}
      {Array.from({ length: inputBits }, (_, i) => (
        <Handle
          key={`in${i}`}
          type="target"
          position={Position.Left}
          id={`in${i}`}
          style={{ top: `${15 + (i * 20)}%` }}
          isConnectable={isConnectable}
        />
      ))}
      
      {/* Enable input handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="enable"
        style={{ top: '80%' }}
        isConnectable={isConnectable}
      />
      
      {/* Output handles */}
      {Array.from({ length: outputLines }, (_, i) => (
        <Handle
          key={`out${i}`}
          type="source"
          position={Position.Right}
          id={`out${i}`}
          style={{ top: `${((i + 1) / (outputLines + 1)) * 100}%` }}
          isConnectable={isConnectable}
        />
      ))}
      
      {/* Component body */}
      <div className="binary-decoder-body">
        <div className="decoder-title">{label || 'Decoder'}</div>
        
        <div className="decoder-display">
          <div className="input-status">
            <div className="binary-input">
              Input: {inputs.map(b => b ? '1' : '0').join('')}
            </div>
            <div className="decimal-input">
              Decimal: {inputValue}
            </div>
            <div className="enable-status">
              Enable: {enable ? '1' : '0'}
            </div>
          </div>
          
          <div className="output-status">
            <div className="outputs-label">Outputs:</div>
            <div className="output-grid">
              {outputs.map((output, index) => (
                <div 
                  key={index} 
                  className={`output-indicator ${output ? 'active' : ''}`}
                >
                  Y{index}: {output ? '1' : '0'}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="decoder-info">
          <small>{inputBits}:{outputLines} Decoder</small>
        </div>
      </div>
    </div>
  );
}
