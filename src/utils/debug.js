export function logCircuitState(nodes, edges, nodeMap, inputMap, outputMap) {
  console.group('Circuit State');
  
  console.log('Nodes:', nodes.map(n => ({
    id: n.id,
    type: n.type,
    state: n.data.state
  })));
  
  console.log('Edges:', edges);
  console.log('Node Map:', nodeMap);
  console.log('Input Map:', inputMap);
  console.log('Output Map:', outputMap);
  
  console.groupEnd();
}

export function debugEvaluation(gateType, inputs, output) {
  console.log(`Gate: ${gateType}, Inputs: ${inputs}, Output: ${output}`);
}