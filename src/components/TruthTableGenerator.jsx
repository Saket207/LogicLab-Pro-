import React, { useState, useCallback, useMemo } from 'react';

export default function TruthTableGenerator({ nodes, edges }) {
  console.log('TruthTableGenerator rendering:', {
    nodesCount: nodes.length,
    edgesCount: edges.length,
    switches: nodes.filter(n => n.type === 'switch').length,
    leds: nodes.filter(n => n.type === 'led').length
  });
  
  const [expanded, setExpanded] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  
  // Get current states of all switches
  const currentSwitchStates = useMemo(() => {
    const states = {};
    nodes.filter(n => n.type === 'switch').forEach(sw => {
      states[sw.id] = sw.data.state;
    });
    return states;
  }, [nodes]);
  
  // Generate all possible combinations of inputs
  const generateCombinations = useCallback(() => {
    const switches = nodes.filter(n => n.type === 'switch');
    if (switches.length === 0) return [];
    
    const combinations = [];
    const numCombinations = Math.pow(2, switches.length);
    
    for (let i = 0; i < numCombinations; i++) {
      const combination = {};
      switches.forEach((sw, index) => {
        combination[sw.id] = !!(i & (1 << (switches.length - 1 - index)));
      });
      combinations.push(combination);
    }
    
    return combinations;
  }, [nodes]);
  
  // Evaluate the circuit for a specific input combination
  const evaluateCircuit = useCallback((inputValues) => {
    const nodeMap = {};
    const nodeOutputs = {};
    
    // Set all switch values
    nodes.forEach(node => {
      nodeMap[node.id] = node;
      if (node.type === 'switch') {
        nodeOutputs[node.id] = inputValues[node.id] || false;
      }
    });
    
    // Process nodes in topological order (simplified)
    let changed = true;
    let iterations = 0;
    const maxIterations = 10;
    
    while (changed && iterations < maxIterations) {
      changed = false;
      iterations++;
      
      nodes.forEach(node => {
        // Skip switches (their values are set directly)
        if (node.type === 'switch') return;
        
        // Get input values for this node
        const inputEdges = edges.filter(e => e.target === node.id);
        const inputValues = inputEdges.map(e => nodeOutputs[e.source] || false);
        
        // Default output
        let output = false;
        
        // Apply gate logic
        switch (node.type) {
          case 'andGate':
            output = inputValues.length > 0 && inputValues.every(val => val === true);
            break;
          case 'orGate':
            output = inputValues.some(val => val === true);
            break;
          case 'notGate':
            output = inputValues.length > 0 ? !inputValues[0] : false;
            break;
          case 'xorGate':
            output = inputValues.filter(val => val === true).length % 2 === 1;
            break;
          case 'nandGate':
            output = !(inputValues.length > 0 && inputValues.every(val => val === true));
            break;
          case 'norGate':
            output = !inputValues.some(val => val === true);
            break;          case 'led':
            output = inputValues.length > 0 ? inputValues[0] : false;
            break;
          case 'halfAdder':
            // Half adder: sum = A XOR B, carry = A AND B
            if (inputValues.length >= 2) {
              const A = inputValues[0] || false;
              const B = inputValues[1] || false;
              // For truth table purposes, we'll use the sum output
              output = A !== B; // XOR for sum
              // Store carry for potential future use
              nodeOutputs[`${node.id}_carry`] = A && B;
            }
            break;
          case 'fullAdder':
            // Full adder: A, B, Cin inputs
            if (inputValues.length >= 3) {
              const A = inputValues[0] || false;
              const B = inputValues[1] || false;
              const Cin = inputValues[2] || false;
              // Sum = A XOR B XOR Cin
              output = (A !== B) !== Cin;
              // Carry = (A AND B) OR (Cin AND (A XOR B))
              const carry = (A && B) || (Cin && (A !== B));
              nodeOutputs[`${node.id}_carry`] = carry;
            }
            break;
          case 'binaryDisplay':
          case 'binaryClock':
          case 'multiLED':
            // These components pass through their input values
            output = inputValues.length > 0 ? inputValues[0] : false;
            break;
          default:
            break;
        }
        
        if (nodeOutputs[node.id] !== output) {
          nodeOutputs[node.id] = output;
          changed = true;
        }
      });
    }
      // Compute output values for LEDs and binary components
    const outputValues = {};
    // Include LEDs
    nodes.filter(n => n.type === 'led').forEach(led => {
      outputValues[led.id] = nodeOutputs[led.id] || false;
    });
    
    // Include binary components that can show output
    nodes.filter(n => ['halfAdder', 'fullAdder', 'binaryDisplay', 'multiLED'].includes(n.type)).forEach(component => {
      outputValues[component.id] = nodeOutputs[component.id] || false;
      // For adders, also include carry output
      if (['halfAdder', 'fullAdder'].includes(component.type) && nodeOutputs[`${component.id}_carry`] !== undefined) {
        outputValues[`${component.id}_carry`] = nodeOutputs[`${component.id}_carry`];
      }
    });
    
    return outputValues;
  }, [nodes, edges]);
    // Generate truth table data
  const truthTable = useMemo(() => {
    const switches = nodes.filter(n => n.type === 'switch');
    const leds = nodes.filter(n => n.type === 'led');
    const binaryComponents = nodes.filter(n => ['halfAdder', 'fullAdder', 'binaryDisplay', 'multiLED'].includes(n.type));
    
    if (switches.length === 0 || (leds.length === 0 && binaryComponents.length === 0)) {
      return { headers: [], rows: [] };
    }
    
    // Generate headers
    const headers = [
      ...switches.map(sw => sw.data.label),
      ...leds.map(led => led.data.label),
      ...binaryComponents.flatMap(comp => {
        const baseLabel = comp.data.label;
        if (['halfAdder', 'fullAdder'].includes(comp.type)) {
          return [`${baseLabel}_Sum`, `${baseLabel}_Carry`];
        }
        return [baseLabel];
      })
    ];
    
    // Generate rows
    const combinations = generateCombinations();
    const rows = combinations.map(combination => {
      const outputValues = evaluateCircuit(combination);
      
      // Check if this is the current state
      let isCurrentState = true;
      for (const [id, value] of Object.entries(combination)) {
        if (value !== currentSwitchStates[id]) {
          isCurrentState = false;
          break;
        }
      }
        // Create cells array
      const cells = [
        ...switches.map(sw => combination[sw.id] ? '1' : '0'),
        ...leds.map(led => outputValues[led.id] ? '1' : '0'),
        ...binaryComponents.flatMap(comp => {
          if (['halfAdder', 'fullAdder'].includes(comp.type)) {
            return [
              outputValues[comp.id] ? '1' : '0', // Sum
              outputValues[`${comp.id}_carry`] ? '1' : '0' // Carry
            ];
          }
          return [outputValues[comp.id] ? '1' : '0'];
        })
      ];
      
      return { cells, isCurrentState };
    });
      return { headers, rows };
  }, [nodes, edges, generateCombinations, evaluateCircuit, currentSwitchStates]);
  
  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
  };
  
  if (truthTable.headers.length === 0) {
    return (      <div className="truth-table-generator sidebar-section">
        <h3>Truth Table</h3>
        <div className="empty-message">
          Add switches and LEDs/binary components to generate a truth table.
        </div>
      </div>
    );
  }
  
  return (
    <div className={`truth-table-generator sidebar-section ${fullscreen ? 'fullscreen' : ''}`}>
      <div className="table-header">
        <h3>Truth Table</h3>
        <div className="table-controls">
          <button 
            className="expand-button"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Collapse' : 'Expand'}
          </button>
          <button 
            className="fullscreen-button"
            onClick={toggleFullscreen}
          >
            {fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </button>
        </div>
      </div>
      
      <div className={`table-container ${expanded ? 'expanded' : ''}`}>
        <table className="truth-table">
          <thead>
            <tr>
              {truthTable.headers.map((header, i) => (
                <th key={i}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {truthTable.rows.map((row, rowIndex) => (
              <tr 
                key={rowIndex} 
                className={row.isCurrentState ? 'current-state' : ''}
              >
                {row.cells.map((cell, cellIndex) => {
                  const isInput = cellIndex < nodes.filter(n => n.type === 'switch').length;
                  const isOutput = !isInput;
                  const isOne = cell === '1';
                  return (
                    <td 
                      key={cellIndex}
                      className={`
                        ${isInput ? 'input-cell' : 'output-cell'}
                        ${isOne ? 'value-one' : 'value-zero'}
                      `}
                    >
                      {cell}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {fullscreen && (
        <div className="fullscreen-overlay" onClick={toggleFullscreen}>
          <div className="fullscreen-content" onClick={e => e.stopPropagation()}>
            <div className="fullscreen-header">
              <h2>Truth Table</h2>
              <button className="close-fullscreen" onClick={toggleFullscreen}>×</button>
            </div>
            <table className="truth-table">
              <thead>
                <tr>
                  {truthTable.headers.map((header, i) => (
                    <th key={i}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {truthTable.rows.map((row, rowIndex) => (
                  <tr 
                    key={rowIndex} 
                    className={row.isCurrentState ? 'current-state' : ''}
                  >
                    {row.cells.map((cell, cellIndex) => {
                      const isInput = cellIndex < nodes.filter(n => n.type === 'switch').length;
                      const isOutput = !isInput;
                      const isOne = cell === '1';
                      return (
                        <td 
                          key={cellIndex}
                          className={`
                            ${isInput ? 'input-cell' : 'output-cell'}
                            ${isOne ? 'value-one' : 'value-zero'}
                          `}
                        >
                          {cell}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}