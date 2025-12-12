/**
 * Generates a boolean expression from the circuit structure
 */
export function generateExpression(nodes, edges) {
  try {
    // Safety checks
    if (!nodes || !edges || !Array.isArray(nodes) || !Array.isArray(edges)) {
      console.error("Invalid nodes or edges provided:", { nodes, edges });
      return {};
    }
    
    const expressions = {};
    const cache = {}; // Add a cache object to store intermediate results
    
    // Find LED nodes and binary components (outputs)
    const outputNodes = [
      ...nodes.filter(node => node.type === 'led'),
      ...nodes.filter(node => ['halfAdder', 'fullAdder', 'binaryDisplay', 'multiLED'].includes(node.type))
    ];
    console.log(`Found ${outputNodes.length} output nodes`);
    
    // For each output node, generate expression by traversing backwards
    outputNodes.forEach(outputNode => {
      // Use a fresh processed set for each output to avoid interference
      const processed = new Set();
      
      if (outputNode.type === 'led') {
        const expression = generateNodeExpression(outputNode.id, nodes, edges, processed, cache);
        expressions[outputNode.id] = {
          label: outputNode.data.label || 'LED',
          expression: expression || '?'
        };
      } else if (['halfAdder', 'fullAdder'].includes(outputNode.type)) {
        // Generate expressions for sum and carry outputs
        const sumExpression = generateBinaryComponentExpression(outputNode.id, 'sum', nodes, edges, new Set(), cache);
        const carryExpression = generateBinaryComponentExpression(outputNode.id, 'carry', nodes, edges, new Set(), cache);
        
        expressions[`${outputNode.id}_sum`] = {
          label: `${outputNode.data.label || outputNode.type}_Sum`,
          expression: sumExpression || '?'
        };
        expressions[`${outputNode.id}_carry`] = {
          label: `${outputNode.data.label || outputNode.type}_Carry`,
          expression: carryExpression || '?'
        };
      } else {
        // For other binary components, generate single expression
        const expression = generateNodeExpression(outputNode.id, nodes, edges, processed, cache);
        expressions[outputNode.id] = {
          label: outputNode.data.label || outputNode.type,
          expression: expression || '?'
        };
      }
    });
    
    return expressions;
  } catch (err) {
    console.error("Error in generateExpression:", err);
    return {};
  }
}

function generateNodeExpression(nodeId, nodes, edges, processed, cache) {
  try {
    // Check if we already have the result cached
    if (cache[nodeId] !== undefined) {
      return cache[nodeId];
    }
    
    // Avoid cycles - if we're currently processing this node, return a placeholder
    if (processed.has(nodeId)) {
      return `[${nodeId}]`; // Cycle detected, return placeholder
    }
    
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return '?';
    
    // Mark this node as being processed to detect cycles
    processed.add(nodeId);
    
    // Input switches just return their labels (as variables)
    if (node.type === 'switch') {
      const expr = node.data?.label || 'Switch';
      cache[nodeId] = expr;
      return expr;
    }
    
    // LED nodes - get inputs and return their expression
    if (node.type === 'led') {
      const inputEdges = edges.filter(e => e.target === nodeId);
      if (inputEdges.length === 0) {
        cache[nodeId] = '0';
        return '0';
      }
      
      // LED has one input, use that expression
      const sourceId = inputEdges[0].source;
      const result = generateNodeExpression(sourceId, nodes, edges, processed, cache);
      cache[nodeId] = result;
      return result;
    }
    
    // For gates, get all inputs
    const inputEdges = edges.filter(e => e.target === nodeId);
    const inputExpressions = inputEdges.map(edge => 
      generateNodeExpression(edge.source, nodes, edges, processed, cache)
    );
      if (inputExpressions.length === 0) {
      cache[nodeId] = '?';
      return '?';
    }
    
    let result = '';
    // Handle different gate types
    switch (node.type) {
      case 'andGate':
        result = inputExpressions.join(' • ');
        if (inputExpressions.length > 1) result = `(${result})`;
        break;
      case 'orGate':
        result = inputExpressions.join(' + ');
        if (inputExpressions.length > 1) result = `(${result})`;
        break;
      case 'notGate':
        result = `¬${inputExpressions[0]}`;
        break;
      case 'xorGate':
        result = inputExpressions.join(' ⊕ ');
        if (inputExpressions.length > 1) result = `(${result})`;
        break;
      case 'nandGate':
        result = `¬(${inputExpressions.join(' • ')})`;
        break;
      case 'norGate':
        result = `¬(${inputExpressions.join(' + ')})`;
        break;
      default:
        result = inputExpressions.join(', ');
    }
    
    // Cache the result and remove from processing set
    cache[nodeId] = result;
    processed.delete(nodeId); // Remove after processing is complete
    return result;
  } catch (err) {
    console.error("Error in generateNodeExpression for node", nodeId, err);
    return '?';
  }
}

/**
 * Generates expression for specific outputs of binary components (sum, carry)
 */
function generateBinaryComponentExpression(nodeId, outputType, nodes, edges, processed, cache) {
  try {
    const cacheKey = `${nodeId}_${outputType}`;
    
    // Check if we already have the result cached
    if (cache[cacheKey] !== undefined) {
      return cache[cacheKey];
    }
    
    // Avoid cycles - if we're currently processing this node, return a placeholder
    if (processed.has(cacheKey)) {
      return `[${cacheKey}]`; // Cycle detected, return placeholder
    }
    
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return '?';
    
    // Mark this node as being processed to detect cycles
    processed.add(cacheKey);
    
    // Get all input edges to this binary component
    const inputEdges = edges.filter(e => e.target === nodeId);
    if (inputEdges.length === 0) {
      cache[cacheKey] = '?';
      processed.delete(cacheKey);
      return '?';
    }
    
    // Get input expressions
    const inputExpressions = inputEdges.map(edge => 
      generateNodeExpression(edge.source, nodes, edges, processed, cache)
    );
    
    let result = '';
    
    // Generate expressions based on component type and output
    switch (node.type) {
      case 'halfAdder':
        if (outputType === 'sum') {
          // Sum = A XOR B
          result = inputExpressions.length >= 2 ? 
            `(${inputExpressions[0]} ⊕ ${inputExpressions[1]})` : '?';
        } else if (outputType === 'carry') {
          // Carry = A AND B
          result = inputExpressions.length >= 2 ? 
            `(${inputExpressions[0]} • ${inputExpressions[1]})` : '?';
        }
        break;
        
      case 'fullAdder':
        if (outputType === 'sum') {
          // Sum = A XOR B XOR Cin
          result = inputExpressions.length >= 3 ? 
            `(${inputExpressions[0]} ⊕ ${inputExpressions[1]} ⊕ ${inputExpressions[2]})` : '?';
        } else if (outputType === 'carry') {
          // Carry = AB + Cin(A XOR B)
          result = inputExpressions.length >= 3 ? 
            `((${inputExpressions[0]} • ${inputExpressions[1]}) + (${inputExpressions[2]} • (${inputExpressions[0]} ⊕ ${inputExpressions[1]})))` : '?';
        }
        break;
        
      default:
        result = '?';
    }
      // Cache the result and remove from processing set
    cache[cacheKey] = result;
    processed.delete(cacheKey); // Remove after processing is complete
    return result;
  } catch (err) {
    console.error("Error in generateBinaryComponentExpression for node", nodeId, outputType, err);
    return '?';
  }
}

/**
 * Simplifies Boolean expressions (basic implementation)
 */
export function simplifyExpression(expr) {
  // Add null check to handle undefined inputs
  if (expr === undefined || expr === null || typeof expr !== 'string') {
    return '';
  }
  
  // Basic simplifications
  let simplified = expr;
  
  // A • 1 = A
  simplified = simplified.replace(/([A-Za-z0-9_]+) • 1/g, '$1');
  simplified = simplified.replace(/1 • ([A-Za-z0-9_]+)/g, '$1');
  
  // A • 0 = 0
  simplified = simplified.replace(/([A-Za-z0-9_]+) • 0/g, '0');
  simplified = simplified.replace(/0 • ([A-Za-z0-9_]+)/g, '0');
  
  // A + 1 = 1
  simplified = simplified.replace(/([A-Za-z0-9_]+) \+ 1/g, '1');
  simplified = simplified.replace(/1 \+ ([A-Za-z0-9_]+)/g, '1');
  
  // A + 0 = A
  simplified = simplified.replace(/([A-Za-z0-9_]+) \+ 0/g, '$1');
  simplified = simplified.replace(/0 \+ ([A-Za-z0-9_]+)/g, '$1');
  
  // ¬¬A = A
  simplified = simplified.replace(/¬¬([A-Za-z0-9_]+)/g, '$1');
  
  return simplified;
}