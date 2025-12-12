import DLCS from 'dlcs';

export function createDLCSNode(type, value = false) {
  switch (type) {
    case 'switch':
      const node = new DLCS(DLCS.inputnode);
      node.setOutputValues([value ? 1 : 0]);
      return node;
      
    case 'andGate':
      return new DLCS(DLCS.andgate);
      
    case 'orGate':
      return new DLCS(DLCS.orgate);
      
    case 'notGate':
      return new DLCS(DLCS.notgate);
      
    case 'xorGate':
      return new DLCS(DLCS.xorgate);
      
    case 'nandGate': {
      // Create custom NAND gate using DLCS
      const customFunction = function(input) {
        return [(input[0] && input[1]) ? 0 : 1];
      };
      
      return new DLCS({
        inputs: 2,
        name: "nand",
        outputs: 1,
        outputvalues: [-1],
        outputfunction: customFunction
      });
    }
    
    case 'norGate': {
      // Create custom NOR gate using DLCS
      const customFunction = function(input) {
        return [(input[0] || input[1]) ? 0 : 1];
      };
      
      return new DLCS({
        inputs: 2,
        name: "nor",
        outputs: 1,
        outputvalues: [-1],
        outputfunction: customFunction
      });
    }
    
    case 'led':
      return new DLCS(DLCS.outputnode);
      
    default:
      return new DLCS(DLCS.node);
  }
}

export function buildCircuit(nodes, edges) {
  const dlcsNodes = {};
  
  // First create all DLCS nodes
  nodes.forEach(node => {
    dlcsNodes[node.id] = createDLCSNode(
      node.type, 
      node.data.state
    );
  });
  
  // Connect nodes based on edges
  edges.forEach(edge => {
    if (dlcsNodes[edge.source] && dlcsNodes[edge.target]) {
      dlcsNodes[edge.target].addInput(dlcsNodes[edge.source]);
    }
  });
  
  return dlcsNodes;
}

export function simulateCircuit(dlcsNodes, nodeId) {
  if (!dlcsNodes[nodeId]) return null;
  
  try {
    const result = dlcsNodes[nodeId].simulate().getOutputValues();
    return result;
  } catch (err) {
    console.error(`Error simulating node ${nodeId}:`, err);
    return [0];
  }
}

export function createFullAdder() {
  return {
    components: [
      { id: 'input-a', type: 'switch', position: { x: 100, y: 100 }, data: { label: 'A', state: false } },
      { id: 'input-b', type: 'switch', position: { x: 100, y: 200 }, data: { label: 'B', state: false } },
      { id: 'input-cin', type: 'switch', position: { x: 100, y: 300 }, data: { label: 'CIN', state: false } },
      
      { id: 'xor-1', type: 'xorGate', position: { x: 250, y: 150 }, data: { label: 'XOR' } },
      { id: 'xor-2', type: 'xorGate', position: { x: 400, y: 150 }, data: { label: 'XOR' } },
      
      { id: 'and-1', type: 'andGate', position: { x: 250, y: 250 }, data: { label: 'AND' } },
      { id: 'and-2', type: 'andGate', position: { x: 400, y: 250 }, data: { label: 'AND' } },
      
      { id: 'or-1', type: 'orGate', position: { x: 550, y: 250 }, data: { label: 'OR' } },
      
      { id: 'output-s', type: 'led', position: { x: 550, y: 150 }, data: { label: 'SUM', state: false } },
      { id: 'output-c', type: 'led', position: { x: 700, y: 250 }, data: { label: 'CARRY', state: false } }
    ],
    connections: [
      { source: 'input-a', target: 'xor-1', sourceHandle: 'out', targetHandle: 'in1' },
      { source: 'input-b', target: 'xor-1', sourceHandle: 'out', targetHandle: 'in2' },
      { source: 'xor-1', target: 'xor-2', sourceHandle: 'out', targetHandle: 'in1' },
      { source: 'input-cin', target: 'xor-2', sourceHandle: 'out', targetHandle: 'in2' },
      { source: 'xor-2', target: 'output-s', sourceHandle: 'out', targetHandle: 'in' },
      
      { source: 'input-a', target: 'and-1', sourceHandle: 'out', targetHandle: 'in1' },
      { source: 'input-b', target: 'and-1', sourceHandle: 'out', targetHandle: 'in2' },
      
      { source: 'xor-1', target: 'and-2', sourceHandle: 'out', targetHandle: 'in1' },
      { source: 'input-cin', target: 'and-2', sourceHandle: 'out', targetHandle: 'in2' },
      
      { source: 'and-1', target: 'or-1', sourceHandle: 'out', targetHandle: 'in1' },
      { source: 'and-2', target: 'or-1', sourceHandle: 'out', targetHandle: 'in2' },
      
      { source: 'or-1', target: 'output-c', sourceHandle: 'out', targetHandle: 'in' }
    ]
  };
}