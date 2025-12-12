import React from 'react';
import { Handle, Position } from 'reactflow';

export default function BinaryComparator({ data, isConnectable }) {
  const { state, label, bits = 4 } = data;
  
  // Parse input values from state
  const inputA = Array.isArray(state?.inputA) ? state.inputA : Array(bits).fill(false);
  const inputB = Array.isArray(state?.inputB) ? state.inputB : Array(bits).fill(false);
  
  // Convert binary arrays to decimal values
  const valueA = inputA.reduce((acc, bit, index) => {
    return acc + (bit ? Math.pow(2, bits - 1 - index) : 0);
  }, 0);
  
  const valueB = inputB.reduce((acc, bit, index) => {
    return acc + (bit ? Math.pow(2, bits - 1 - index) : 0);
  }, 0);
  
  // Calculate comparison results
  const isEqual = valueA === valueB;
  const isGreater = valueA > valueB;
  const isLess = valueA < valueB;
  
  return (
    <div className="binary-comparator-node">
      {/* Input handles for A inputs */}
      {Array.from({ length: bits }, (_, i) => (
        <Handle
          key={`a${i}`}
          type="target"
          position={Position.Left}
          id={`a${i}`}
          style={{ top: `${10 + (i * 15)}%` }}
          isConnectable={isConnectable}
        />
      ))}
      
      {/* Input handles for B inputs */}
      {Array.from({ length: bits }, (_, i) => (
        <Handle
          key={`b${i}`}
          type="target"
          position={Position.Left}
          id={`b${i}`}
          style={{ top: `${60 + (i * 8)}%` }}
          isConnectable={isConnectable}
        />
      ))}
      
      {/* Component body */}
      <div className="binary-comparator-body">
        <div className="comparator-title">{label || '4-bit Comparator'}</div>
        
        <div className="comparator-display">
          {/* Input display */}
          <div className="input-display">
            <div className="input-a">
              A: {inputA.map(bit => bit ? '1' : '0').join('')} ({valueA})
            </div>
            <div className="input-b">
              B: {inputB.map(bit => bit ? '1' : '0').join('')} ({valueB})
            </div>
          </div>
          
          {/* Comparison results */}
          <div className="comparison-results">
            <div className={`result-equal ${isEqual ? 'active' : ''}`}>
              A = B: {isEqual ? '1' : '0'}
            </div>
            <div className={`result-greater ${isGreater ? 'active' : ''}`}>
              A &gt; B: {isGreater ? '1' : '0'}
            </div>
            <div className={`result-less ${isLess ? 'active' : ''}`}>
              A &lt; B: {isLess ? '1' : '0'}
            </div>
          </div>
          
          <div className="bit-labels">
            <div>A[{bits - 1}:0]</div>
            <div>B[{bits - 1}:0]</div>
          </div>
        </div>
      </div>
      
      {/* Output handles */}
      <Handle
        type="source"
        position={Position.Right}
        id="equal"
        style={{ top: '25%' }}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="greater"
        style={{ top: '50%' }}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="less"
        style={{ top: '75%' }}
        isConnectable={isConnectable}
      />
    </div>
  );
}
