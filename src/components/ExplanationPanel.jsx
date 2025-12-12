import React, { useState } from 'react';

export default function ExplanationPanel({ circuit, nodes, edges }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Generate an explanation based on the circuit
  const generateExplanation = () => {
    if (nodes.length === 0) {
      return "Add components to your workspace to see an explanation of your circuit.";
    }
      const switches = nodes.filter(n => n.type === 'switch');
    const gates = nodes.filter(n => n.type.includes('Gate'));
    const leds = nodes.filter(n => n.type === 'led');
    const binaryComponents = nodes.filter(n => ['halfAdder', 'fullAdder', 'binaryDisplay', 'binaryClock', 'multiLED', 'binaryComparator', 'binaryEncoder', 'binaryDecoder', 'multiplexer'].includes(n.type));
    
    const hasOutputs = leds.length > 0 || binaryComponents.length > 0;
    
    if (switches.length === 0 || !hasOutputs) {
      return "Add at least one switch and one output component (LED or binary component) to create a functional circuit.";
    }
    
    let explanation = `Your circuit contains ${switches.length} switch${switches.length > 1 ? 'es' : ''}`;
    
    if (gates.length > 0) {
      explanation += `, ${gates.length} logic gate${gates.length > 1 ? 's' : ''}`;
    }
    
    if (leds.length > 0) {
      explanation += `, ${leds.length} LED${leds.length > 1 ? 's' : ''}`;
    }
    
    if (binaryComponents.length > 0) {
      explanation += `, and ${binaryComponents.length} binary component${binaryComponents.length > 1 ? 's' : ''}`;
    }
    
    explanation += '.';
    
    // Add explanations for binary components
    binaryComponents.forEach(component => {
      const inputEdges = edges.filter(e => e.target === component.id);
      const outputEdges = edges.filter(e => e.source === component.id);
      
      explanation += `\n\n• The ${component.data.label || component.type} component`;
      
      if (inputEdges.length > 0) {
        const inputNodes = inputEdges.map(e => {
          const sourceNode = nodes.find(n => n.id === e.source);
          return sourceNode ? sourceNode.data.label : "unknown";
        });
        explanation += ` receives ${inputNodes.join(' and ')} as input`;
      }
        // Add specific explanations for different binary components
      switch (component.type) {
        case 'halfAdder':
          explanation += `. It performs binary addition of two single bits, producing a sum output (A ⊕ B) and a carry output (A • B).`;
          break;
        case 'fullAdder':
          explanation += `. It performs binary addition of three single bits (A, B, and carry-in), producing a sum output (A ⊕ B ⊕ Cin) and a carry output.`;
          break;
        case 'binaryDisplay':
          explanation += `. It displays the binary representation of the input values.`;
          break;
        case 'binaryClock':
          explanation += `. It generates a clock signal for sequential circuits.`;
          break;
        case 'multiLED':
          explanation += `. It displays multiple LED outputs representing different bit positions.`;
          break;
        case 'binaryComparator':
          explanation += `. It compares two 4-bit binary numbers (A and B) and produces three outputs: A=B (equality), A>B (A greater than B), and A<B (A less than B). The comparator uses magnitude comparison logic to determine the relationship between the input numbers.`;
          break;
        case 'binaryEncoder':
          explanation += `. It is an 8:3 priority encoder that converts 8 input lines to a 3-bit binary output. The highest priority active input determines the output code. It also includes a validity output (V) that indicates whether any input is active.`;
          break;
        case 'binaryDecoder':
          explanation += `. It is a 3:8 decoder that converts a 3-bit binary input to activate one of 8 output lines. It includes an enable input (EN) - when enabled, exactly one output line corresponding to the binary input value will be active.`;
          break;
        case 'multiplexer':
          explanation += `. It is a 4:1 multiplexer (MUX) that selects one of four data inputs (D0-D3) based on a 2-bit select signal (S1,S0) and routes it to the output. This allows multiple data sources to share a single output line.`;
          break;
      }
    });
    
    // Add explanation for each gate
    gates.forEach(gate => {
      const inputEdges = edges.filter(e => e.target === gate.id);
      const outputEdges = edges.filter(e => e.source === gate.id);
      
      if (inputEdges.length > 0 && outputEdges.length > 0) {
        explanation += `\n\n• The ${gate.data.label} gate receives `;
        
        const inputNodes = inputEdges.map(e => {
          const sourceNode = nodes.find(n => n.id === e.source);
          return sourceNode ? sourceNode.data.label : "unknown";
        });
        
        explanation += inputNodes.join(' and ') + ' as input';
        
        const outputNodes = outputEdges.map(e => {
          const targetNode = nodes.find(n => n.id === e.target);
          return targetNode ? targetNode.data.label : "unknown";
        });
        
        explanation += `, and sends its output to ${outputNodes.join(' and ')}.`;
        
        // Add logic explanation based on gate type
        switch (gate.type) {
          case 'andGate':
            explanation += ` The output will be 1 only if all inputs are 1.`;
            break;
          case 'orGate':
            explanation += ` The output will be 1 if at least one input is 1.`;
            break;
          case 'xorGate':
            explanation += ` The output will be 1 if an odd number of inputs are 1.`;
            break;
          case 'notGate':
            explanation += ` The output will be the opposite of the input.`;
            break;
          case 'nandGate':
            explanation += ` The output will be 0 only if all inputs are 1.`;
            break;
          case 'norGate':
            explanation += ` The output will be 1 only if all inputs are 0.`;
            break;
          default:
            break;
        }
      }
    });
    
    return explanation;
  };
  
  return (
    <div className="sidebar-section explanation-panel">
      <div className="panel-header">
        <h3>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2m0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8m1-6.5v3.5h-2v-3.5m0-1.5v-2h2v2"></path>
          </svg>
          Circuit Explanation
        </h3>
        <button 
          className="toggle-button" 
          onClick={() => setIsExpanded(!isExpanded)}
          title={isExpanded ? "Collapse" : "Expand"}
        >
          {isExpanded ? "−" : "+"}
        </button>
      </div>
      
      <div className={`explanation-content ${isExpanded ? 'expanded' : ''}`}>
        <pre>{generateExplanation()}</pre>
      </div>
    </div>
  );
}