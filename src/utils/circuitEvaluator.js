/**
 * Circuit Evaluator Utility
 * Handles evaluation of logic circuits with support for various gate types
 * and advanced components like adders, displays, etc.
 */

/**
 * Evaluates a circuit given nodes and edges
 * @param {Array} nodes - Array of circuit nodes
 * @param {Array} edges - Array of circuit edges
 * @returns {Array} Updated nodes with calculated states
 */
export function evaluateCircuit(nodes, edges) {
  if (!nodes || !edges || !Array.isArray(nodes) || !Array.isArray(edges)) {
    console.error("Invalid nodes or edges provided to evaluateCircuit");
    return nodes || [];
  }

  // Create a working copy to avoid mutating original nodes
  const nodesCopy = nodes.map(node => ({
    ...node,
    data: { ...node.data }
  }));

  const nodeMap = {};
  nodesCopy.forEach(node => {
    nodeMap[node.id] = node;
  });

  // Process nodes in proper order (switches first, then gates, then outputs)
  const switches = nodesCopy.filter(n => n.type === 'switch');
  const gates = nodesCopy.filter(n => ['andGate', 'orGate', 'notGate', 'nandGate', 'norGate', 'xorGate'].includes(n.type));
  const adders = nodesCopy.filter(n => ['halfAdder', 'fullAdder'].includes(n.type));
  const displays = nodesCopy.filter(n => ['binaryDisplay', 'multiLED', 'binaryClock'].includes(n.type));
  const leds = nodesCopy.filter(n => n.type === 'led');

  // Evaluate basic gates
  gates.forEach(node => {
    evaluateGate(node, edges, nodeMap);
  });

  // Evaluate adders
  adders.forEach(node => {
    evaluateAdder(node, edges, nodeMap);
  });

  // Evaluate displays
  displays.forEach(node => {
    evaluateDisplay(node, edges, nodeMap);
  });

  // Evaluate LEDs
  leds.forEach(node => {
    evaluateLED(node, edges, nodeMap);
  });

  return nodesCopy;
}

/**
 * Evaluates a basic logic gate
 * @param {Object} node - The gate node
 * @param {Array} edges - Circuit edges
 * @param {Object} nodeMap - Map of node IDs to nodes
 */
function evaluateGate(node, edges, nodeMap) {
  const inputEdges = edges.filter(e => e.target === node.id);
  const inputValues = inputEdges.map(edge => {
    const sourceNode = nodeMap[edge.source];
    return sourceNode?.data?.state || false;
  });

  let outputValue = false;

  switch (node.type) {
    case 'andGate':
      outputValue = inputValues.length > 0 && inputValues.every(val => val === true);
      break;
    case 'orGate':
      outputValue = inputValues.length > 0 && inputValues.some(val => val === true);
      break;
    case 'notGate':
      outputValue = inputValues.length > 0 ? !inputValues[0] : false;
      break;
    case 'nandGate':
      outputValue = !(inputValues.length > 0 && inputValues.every(val => val === true));
      break;
    case 'norGate':
      outputValue = !(inputValues.length > 0 && inputValues.some(val => val === true));
      break;
    case 'xorGate':
      outputValue = inputValues.filter(val => val === true).length % 2 !== 0;
      break;
    default:
      outputValue = false;
  }

  node.data.state = outputValue;
}

/**
 * Evaluates adder components (half and full adders)
 * @param {Object} node - The adder node
 * @param {Array} edges - Circuit edges
 * @param {Object} nodeMap - Map of node IDs to nodes
 */
function evaluateAdder(node, edges, nodeMap) {
  const inputEdges = edges.filter(e => e.target === node.id);
  const inputValues = inputEdges.map(edge => {
    const sourceNode = nodeMap[edge.source];
    return sourceNode?.data?.state || false;
  });

  if (node.type === 'halfAdder') {
    // Half adder: sum = A XOR B, carry = A AND B
    const A = inputValues[0] || false;
    const B = inputValues[1] || false;
    node.data.sum = A !== B; // XOR
    node.data.carry = A && B; // AND
    node.data.state = node.data.sum; // Primary output is sum
  } else if (node.type === 'fullAdder') {
    // Full adder: A, B, Cin inputs
    const inputA = inputValues[0] || false;
    const inputB = inputValues[1] || false;
    const carryIn = inputValues[2] || false;
    const sum = (inputA !== inputB) !== carryIn; // XOR of all three
    const carryOut = (inputA && inputB) || (carryIn && (inputA !== inputB));
    node.data.sum = sum;
    node.data.carryOut = carryOut;
    node.data.state = sum; // Primary output is sum
  }
}

/**
 * Evaluates display components
 * @param {Object} node - The display node
 * @param {Array} edges - Circuit edges
 * @param {Object} nodeMap - Map of node IDs to nodes
 */
function evaluateDisplay(node, edges, nodeMap) {
  const inputEdges = edges.filter(e => e.target === node.id);

  if (node.type === 'binaryDisplay') {
    const displayBits = node.data.bitWidth || 4;
    const displayValues = [];

    // Process input edges to get bit values
    inputEdges.forEach(edge => {
      if (edge.targetHandle && edge.targetHandle.startsWith('bit')) {
        const bitIndex = parseInt(edge.targetHandle.substring(3), 10);
        if (bitIndex < displayBits) {
          displayValues[bitIndex] = nodeMap[edge.source]?.data?.state || false;
        }
      }
    });

    // Fill in missing values with false
    for (let i = 0; i < displayBits; i++) {
      if (displayValues[i] === undefined) displayValues[i] = false;
    }

    // Calculate decimal value
    const decimalValue = displayValues.reduce((acc, bit, index) => {
      return acc + (bit ? Math.pow(2, displayBits - 1 - index) : 0);
    }, 0);

    node.data.values = displayValues;
    node.data.state = displayValues;
    node.data.decimal = decimalValue;
    node.data.hex = decimalValue.toString(16).toUpperCase();
  } else if (node.type === 'multiLED') {
    // Handle multi-LED displays
    const ledCount = node.data.ledCount || 4;
    const ledStates = [];

    for (let i = 0; i < ledCount; i++) {
      const ledEdge = inputEdges.find(e => e.targetHandle === `led${i}`);
      if (ledEdge) {
        ledStates[i] = nodeMap[ledEdge.source]?.data?.state || false;
      } else {
        ledStates[i] = false;
      }
    }

    node.data.ledStates = ledStates;
    node.data.state = ledStates;
  }
}

/**
 * Evaluates LED components
 * @param {Object} node - The LED node
 * @param {Array} edges - Circuit edges
 * @param {Object} nodeMap - Map of node IDs to nodes
 */
function evaluateLED(node, edges, nodeMap) {
  const inputEdges = edges.filter(e => e.target === node.id);
  
  if (inputEdges.length > 0) {
    // LED is on if any input is true
    const inputValues = inputEdges.map(edge => {
      const sourceNode = nodeMap[edge.source];
      return sourceNode?.data?.state || false;
    });
    node.data.state = inputValues.some(val => val === true);
  } else {
    // No inputs, LED is off
    node.data.state = false;
  }
}

/**
 * Evaluates a simplified circuit for truth table generation
 * @param {Array} gates - Array of gate objects
 * @param {Array} inputs - Array of input objects
 * @param {Array} inputValues - Array of input values (0 or 1)
 * @returns {Array} Array of output values
 */
export function evaluateSimpleCircuit(gates, inputs, inputValues) {
  const outputValues = [];

  // Set input values
  inputs.forEach((input, index) => {
    if (input && typeof input === 'object') {
      input.value = inputValues[index];
    }
  });

  // Evaluate each gate
  gates.forEach(gate => {
    if (gate && typeof gate.evaluate === 'function') {
      outputValues.push(gate.evaluate());
    }
  });

  return outputValues;
}

/**
 * Gets the output state of a node
 * @param {Object} node - The node to get output from
 * @returns {boolean|Array} The output state
 */
export function getNodeOutput(node) {
  if (!node || !node.data) return false;
  
  // For complex components, return the primary output
  if (node.type === 'halfAdder' || node.type === 'fullAdder') {
    return node.data.sum;
  }
  
  return node.data.state || false;
}

/**
 * Checks if a circuit has cycles
 * @param {Array} nodes - Circuit nodes
 * @param {Array} edges - Circuit edges
 * @returns {boolean} True if circuit has cycles
 */
export function hasCycles(nodes, edges) {
  const visited = new Set();
  const recursionStack = new Set();

  function dfs(nodeId) {
    if (recursionStack.has(nodeId)) return true;
    if (visited.has(nodeId)) return false;

    visited.add(nodeId);
    recursionStack.add(nodeId);

    const outgoingEdges = edges.filter(e => e.source === nodeId);
    for (const edge of outgoingEdges) {
      if (dfs(edge.target)) return true;
    }

    recursionStack.delete(nodeId);
    return false;
  }

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      if (dfs(node.id)) return true;
    }
  }

  return false;
}

export default evaluateCircuit;
