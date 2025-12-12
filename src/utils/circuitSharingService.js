/**
 * Circuit Sharing Service
 * Provides utilities for exporting and importing circuits via JSON files or URL parameters
 */

/**
 * Exports a circuit to a downloadable JSON file
 * @param {Object} circuit - Circuit data containing nodes and edges
 * @param {string} filename - Name of the file to download
 */
export function exportCircuitToFile(circuit, filename = 'circuit') {
  try {
    // Ensure filename has .circuit extension
    if (!filename.endsWith('.circuit')) {
      filename += '.circuit';
    }
    
    // Create a blob with the JSON data
    const blob = new Blob([JSON.stringify(circuit, null, 2)], { type: 'application/json' });
    
    // Create download link and trigger download
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return { success: true };
  } catch (error) {
    console.error('Error exporting circuit:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Gets the base URL for the application
 * @returns {string} The base URL
 */
function getBaseUrl() {
  return import.meta.env.BASE_URL || '/';
}

/**
 * Creates a shareable URL for a circuit
 * @param {Object} circuit - Circuit data containing nodes and edges
 * @returns {Object} Object with success flag and generated URL or error message
 */
export function createShareableUrl(circuit) {
  try {
    const compressed = compressCircuit(circuit);
    const encodedData = btoa(JSON.stringify(compressed));
    
    // Use the correct base URL for production
    const baseUrl = window.location.origin + getBaseUrl();
    const url = new URL(baseUrl);
    url.searchParams.set('circuit', encodedData);
    
    return {
      success: true,
      url: url.toString()
    };
  } catch (error) {
    console.error('Error creating shareable URL:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Imports a circuit from a file
 * @param {File} file - The circuit file to import
 * @returns {Promise} Promise resolving to the imported circuit or error
 */
export function importCircuitFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const circuit = JSON.parse(event.target.result);
        // Validate the circuit data
        if (!validateCircuitData(circuit)) {
          reject(new Error('Invalid circuit file format'));
          return;
        }
        resolve(circuit);
      } catch (error) {
        console.error('Error parsing circuit file:', error);
        reject(new Error('Invalid circuit file format'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read the file'));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Imports a circuit from URL parameters
 * @returns {Object|null} The circuit data if found in URL, or null
 */
export function importCircuitFromUrl() {
  try {
    const url = new URL(window.location.href);
    const circuitParam = url.searchParams.get('circuit');
    
    if (!circuitParam) {
      return null;
    }
    
    // Decode the base64 encoded circuit data
    const decodedData = atob(circuitParam);
    const compressedCircuit = JSON.parse(decodedData);
    
    // Decompress the circuit data
    const circuit = decompressCircuit(compressedCircuit);
    
    // Validate the circuit data
    if (!validateCircuitData(circuit)) {
      console.error('Invalid circuit data in URL');
      return null;
    }
    
    // Remove the circuit parameter from the URL to prevent reloading the same circuit
    url.searchParams.delete('circuit');
    window.history.replaceState({}, document.title, url.toString());
    
    return circuit;
  } catch (error) {
    console.error('Error importing circuit from URL:', error);
    return null;
  }
}

/**
 * Helper function to validate circuit data structure
 * @param {Object} circuit - The circuit data to validate
 * @returns {boolean} True if valid, false otherwise
 */
function validateCircuitData(circuit) {
  // Check if circuit has nodes and edges
  if (!circuit || !Array.isArray(circuit.nodes) || !Array.isArray(circuit.edges)) {
    return false;
  }
  
  // Basic validation of nodes
  const validNodes = circuit.nodes.every(node => 
    node && 
    typeof node.id === 'string' && 
    typeof node.type === 'string' && 
    node.position && 
    typeof node.position.x === 'number' && 
    typeof node.position.y === 'number'
  );
  
  // Basic validation of edges
  const validEdges = circuit.edges.every(edge => 
    edge && 
    typeof edge.id === 'string' && 
    typeof edge.source === 'string' && 
    typeof edge.target === 'string'
  );
  
  return validNodes && validEdges;
}

/**
 * Compresses circuit data to reduce URL size
 * @param {Object} circuit - The circuit data to compress
 * @returns {Object} Compressed circuit data
 */
function compressCircuit(circuit) {
  // Create a minimal representation of the circuit
  const compressedNodes = circuit.nodes.map(node => {
    const compressedNode = {
      i: node.id,
      t: node.type,
      p: { x: node.position.x, y: node.position.y },
    };
    
    // Include only necessary data properties
    if (node.data) {
      const compressedData = {};
      
      if (node.data.label) compressedData.l = node.data.label;
      if (node.data.state !== undefined) compressedData.s = node.data.state;
      
      // For more complex node types, selectively include required properties
      if (node.type === 'switch' || node.type === 'led') {
        // Include specific data for these types
        if (Object.keys(compressedData).length > 0) {
          compressedNode.d = compressedData;
        }
      } else {
        // For other node types, include the full data object
        compressedNode.d = node.data;
      }
    }
    
    return compressedNode;
  });
  
  const compressedEdges = circuit.edges.map(edge => ({
    i: edge.id,
    s: edge.source,
    t: edge.target,
    st: edge.sourceHandle,
    tt: edge.targetHandle
  }));
  
  return {
    n: compressedNodes,
    e: compressedEdges
  };
}

/**
 * Decompresses circuit data from compressed format
 * @param {Object} compressedCircuit - The compressed circuit data
 * @returns {Object} Decompressed circuit data
 */
function decompressCircuit(compressedCircuit) {
  const decompressedNodes = compressedCircuit.n.map(node => {
    const decompressedNode = {
      id: node.i,
      type: node.t,
      position: node.p,
      data: node.d || {}
    };
    
    // Expand compressed data properties
    if (node.d) {
      if (node.d.l) decompressedNode.data.label = node.d.l;
      if (node.d.s !== undefined) decompressedNode.data.state = node.d.s;
    }
    
    return decompressedNode;
  });
  
  const decompressedEdges = compressedCircuit.e.map(edge => ({
    id: edge.i,
    source: edge.s,
    target: edge.t,
    sourceHandle: edge.st,
    targetHandle: edge.tt
  }));
  
  return {
    nodes: decompressedNodes,
    edges: decompressedEdges
  };
}
