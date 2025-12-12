import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

// Gate information data
const gateInfo = {
  andGate: {
    name: 'AND Gate',
    description: 'Outputs 1 (true) only when all inputs are 1.',
    symbol: '•',
    truthTable: [
      { inputs: ['0', '0'], output: '0' },
      { inputs: ['0', '1'], output: '0' },
      { inputs: ['1', '0'], output: '0' },
      { inputs: ['1', '1'], output: '1' }
    ]
  },
  orGate: {
    name: 'OR Gate',
    description: 'Outputs 1 (true) when at least one input is 1.',
    symbol: '+',
    truthTable: [
      { inputs: ['0', '0'], output: '0' },
      { inputs: ['0', '1'], output: '1' },
      { inputs: ['1', '0'], output: '1' },
      { inputs: ['1', '1'], output: '1' }
    ]
  },
  notGate: {
    name: 'NOT Gate',
    description: 'Inverts the input. Outputs 1 when input is 0, and outputs 0 when input is 1.',
    symbol: '¬',
    truthTable: [
      { inputs: ['0'], output: '1' },
      { inputs: ['1'], output: '0' }
    ]
  },
  xorGate: {
    name: 'XOR Gate',
    description: 'Outputs 1 when exactly one input is 1 (inputs are different).',
    symbol: '⊕',
    truthTable: [
      { inputs: ['0', '0'], output: '0' },
      { inputs: ['0', '1'], output: '1' },
      { inputs: ['1', '0'], output: '1' },
      { inputs: ['1', '1'], output: '0' }
    ]
  },
  nandGate: {
    name: 'NAND Gate',
    description: 'Outputs 0 only when all inputs are 1. (NOT of AND)',
    symbol: '↑',
    truthTable: [
      { inputs: ['0', '0'], output: '1' },
      { inputs: ['0', '1'], output: '1' },
      { inputs: ['1', '0'], output: '1' },
      { inputs: ['1', '1'], output: '0' }
    ]
  },
  norGate: {
    name: 'NOR Gate',
    description: 'Outputs 1 only when all inputs are 0. (NOT of OR)',
    symbol: '↓',
    truthTable: [
      { inputs: ['0', '0'], output: '1' },
      { inputs: ['0', '1'], output: '0' },
      { inputs: ['1', '0'], output: '0' },
      { inputs: ['1', '1'], output: '0' }
    ]
  }
};

export default function GateTooltip({ nodeType, position, onClose }) {
  const tooltipRef = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  
  // Get gate data
  const gate = gateInfo[nodeType] || {
    name: 'Unknown Gate',
    description: 'No description available',
    symbol: '?',
    truthTable: []
  };

  useEffect(() => {
    // Position the tooltip
    if (tooltipRef.current) {
      const tooltipWidth = tooltipRef.current.offsetWidth;
      const tooltipHeight = tooltipRef.current.offsetHeight;
      
      // Calculate position to keep tooltip on screen
      const x = Math.min(
        position.x + 10, 
        window.innerWidth - tooltipWidth - 20
      );
      
      const y = Math.min(
        position.y + 10,
        window.innerHeight - tooltipHeight - 20
      );
      
      setPos({ x, y });
    }
    
    // Close tooltip when clicking outside
    const handleClickOutside = (e) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target)) {
        onClose();
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [position, onClose]);

  return createPortal(
    <div 
      className="gate-tooltip" 
      style={{ 
        left: `${pos.x}px`, 
        top: `${pos.y}px` 
      }}
      ref={tooltipRef}
    >
      <div className="tooltip-header">
        <h3>{gate.name}</h3>
        <button className="tooltip-close" onClick={onClose}>×</button>
      </div>
      
      <div className="tooltip-body">
        <div className="tooltip-description">
          {gate.description}
        </div>
        
        <div className="tooltip-symbol">
          <strong>Symbol:</strong> {gate.symbol}
        </div>
        
        <div className="tooltip-truth-table">
          <h4>Truth Table</h4>
          <table>
            <thead>
              <tr>
                {gate.truthTable[0]?.inputs.map((_, i) => (
                  <th key={i}>In {i+1}</th>
                ))}
                <th>Out</th>
              </tr>
            </thead>
            <tbody>
              {gate.truthTable.map((row, i) => (
                <tr key={i}>
                  {row.inputs.map((input, j) => (
                    <td key={j} className={input === '1' ? 'value-one' : 'value-zero'}>
                      {input}
                    </td>
                  ))}
                  <td className={row.output === '1' ? 'value-one' : 'value-zero'}>
                    {row.output}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>,
    document.body
  );
}