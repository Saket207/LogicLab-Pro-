import React from 'react';
import { Handle, Position } from 'reactflow';

export default function Multiplexer({ data, isConnectable }) {
  const { state, label, selectBits = 2 } = data;
  
  // Number of data inputs (2^selectBits)
  const dataInputs = Math.pow(2, selectBits);
  
  // Extract values from state
  const inputs = Array.isArray(state?.inputs) ? state.inputs : Array(dataInputs).fill(false);
  const selectLines = Array.isArray(state?.select) ? state.select : Array(selectBits).fill(false);
  const enable = state?.enable !== undefined ? state.enable : true;
  
  // Convert select lines to decimal to determine which input to route
  const selectValue = selectLines.reduce((acc, bit, index) => {
    return acc + (bit ? Math.pow(2, selectBits - 1 - index) : 0);
  }, 0);
  
  // Output is the selected input (if enabled)
  const output = enable && selectValue < dataInputs ? inputs[selectValue] : false;
  
  return (
    <div className="multiplexer-node">
      {/* Data input handles */}
      {Array.from({ length: dataInputs }, (_, i) => (
        <Handle
          key={`data${i}`}
          type="target"
          position={Position.Left}
          id={`data${i}`}
          style={{ top: `${10 + (i * (70 / dataInputs))}%` }}
          isConnectable={isConnectable}
        />
      ))}
      
      {/* Select input handles (at bottom) */}
      {Array.from({ length: selectBits }, (_, i) => (
        <Handle
          key={`select${i}`}
          type="target"
          position={Position.Bottom}
          id={`select${i}`}
          style={{ left: `${20 + (i * 20)}%` }}
          isConnectable={isConnectable}
        />
      ))}
      
      {/* Enable input handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="enable"
        style={{ top: '90%' }}
        isConnectable={isConnectable}
      />
      
      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        style={{ top: '50%' }}
        isConnectable={isConnectable}
      />
      
      {/* Component body */}
      <div className="multiplexer-body">
        <div className="multiplexer-title">{label || 'MUX'}</div>
        
        <div className="multiplexer-display">
          <div className="data-inputs">
            <div className="inputs-label">Data:</div>
            {inputs.map((input, index) => (
              <div 
                key={index} 
                className={`data-input ${input ? 'active' : ''} ${index === selectValue && enable ? 'selected' : ''}`}
              >
                D{index}: {input ? '1' : '0'}
              </div>
            ))}
          </div>
          
          <div className="control-signals">
            <div className="select-display">
              Select: {selectLines.map(b => b ? '1' : '0').join('')} (={selectValue})
            </div>
            <div className="enable-display">
              Enable: {enable ? '1' : '0'}
            </div>
          </div>
          
          <div className="output-display">
            <div className={`output-value ${output ? 'active' : ''}`}>
              Output: {output ? '1' : '0'}
            </div>
            {enable && (
              <div className="routing-info">
                Routing D{selectValue} → Y
              </div>
            )}
          </div>
        </div>
        
        <div className="multiplexer-info">
          <small>{dataInputs}:1 MUX</small>
        </div>
      </div>
    </div>
  );
}
