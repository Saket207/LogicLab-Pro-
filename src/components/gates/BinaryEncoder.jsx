import React from 'react';
import { Handle, Position } from 'reactflow';

export default function BinaryEncoder({ data, isConnectable }) {
  const { state, label, inputSize = 4 } = data;
  
  // Number of output bits needed (log2 of input size)
  const outputBits = Math.ceil(Math.log2(inputSize));
  
  // Extract input values from state
  const inputs = Array.isArray(state?.inputs) ? state.inputs : Array(inputSize).fill(false);
  
  // Find the highest priority active input (priority encoder)
  let encodedValue = 0;
  let validOutput = false;
  
  for (let i = inputSize - 1; i >= 0; i--) {
    if (inputs[i]) {
      encodedValue = i;
      validOutput = true;
      break;
    }
  }
  
  // Convert to binary output
  const binaryOutput = Array.from({ length: outputBits }, (_, i) => {
    return validOutput && ((encodedValue >> (outputBits - 1 - i)) & 1) === 1;
  });
  
  return (
    <div className="binary-encoder-node">
      {/* Input handles */}
      {Array.from({ length: inputSize }, (_, i) => (
        <Handle
          key={`in${i}`}
          type="target"
          position={Position.Left}
          id={`in${i}`}
          style={{ top: `${((i + 1) / (inputSize + 1)) * 100}%` }}
          isConnectable={isConnectable}
        />
      ))}
      
      {/* Output handles */}
      {Array.from({ length: outputBits }, (_, i) => (
        <Handle
          key={`out${i}`}
          type="source"
          position={Position.Right}
          id={`out${i}`}
          style={{ top: `${((i + 1) / (outputBits + 1)) * 100}%` }}
          isConnectable={isConnectable}
        />
      ))}
      
      {/* Valid output handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="valid"
        style={{ top: '90%' }}
        isConnectable={isConnectable}
      />
      
      {/* Component body */}
      <div className="binary-encoder-body">
        <div className="encoder-title">{label || 'Encoder'}</div>
        
        <div className="encoder-display">
          <div className="input-status">
            <div className="inputs-label">Inputs:</div>
            <div className="input-grid">
              {inputs.map((input, index) => (
                <div 
                  key={index} 
                  className={`input-indicator ${input ? 'active' : ''}`}
                >
                  {index}: {input ? '1' : '0'}
                </div>
              ))}
            </div>
          </div>
          
          <div className="output-status">
            <div className="encoded-value">
              Encoded: {validOutput ? encodedValue : 'X'}
            </div>
            <div className="binary-output">
              Binary: {binaryOutput.map(b => b ? '1' : '0').join('')}
            </div>
            <div className="valid-indicator">
              Valid: {validOutput ? '1' : '0'}
            </div>
          </div>
        </div>
        
        <div className="encoder-info">
          <small>{inputSize}:{outputBits} Priority Encoder</small>
        </div>
      </div>
    </div>
  );
}
