// Circuit Sharing Tests
import { 
  validateCircuitData, 
  compressCircuit, 
  decompressCircuit, 
  exportCircuitToFile,
  createShareableUrl,
  importCircuitFromUrl
} from '../src/utils/circuitSharingService';

// Sample test circuit
const testCircuit = {
  nodes: [
    {
      id: 'switch-1',
      type: 'switch',
      position: { x: 100, y: 100 },
      data: { label: 'Input A', state: false }
    },
    {
      id: 'switch-2',
      type: 'switch',
      position: { x: 100, y: 200 },
      data: { label: 'Input B', state: false }
    },
    {
      id: 'and-1',
      type: 'andGate',
      position: { x: 300, y: 150 },
      data: { label: 'AND' }
    },
    {
      id: 'led-1',
      type: 'led',
      position: { x: 500, y: 150 },
      data: { label: 'Output', state: false }
    }
  ],
  edges: [
    {
      id: 'edge-1',
      source: 'switch-1',
      target: 'and-1',
      sourceHandle: 'output',
      targetHandle: 'input1'
    },
    {
      id: 'edge-2',
      source: 'switch-2',
      target: 'and-1',
      sourceHandle: 'output',
      targetHandle: 'input2'
    },
    {
      id: 'edge-3',
      source: 'and-1',
      target: 'led-1',
      sourceHandle: 'output',
      targetHandle: 'input'
    }
  ]
};

// Mock window.location
const originalLocation = window.location;
beforeEach(() => {
  delete window.location;
  window.location = {
    href: 'http://localhost:3000/',
    search: '',
    toString: function() { return this.href + this.search; }
  };
});

afterEach(() => {
  window.location = originalLocation;
});

// Mock URL class
global.URL = class URL {
  constructor(url) {
    this.url = url || 'http://localhost:3000/';
    this.searchParams = new URLSearchParams();
  }
  
  toString() {
    const params = this.searchParams.toString();
    return params ? `${this.url}?${params}` : this.url;
  }
};

global.URL.createObjectURL = jest.fn(() => 'blob:test');

// Mock document methods
document.createElement = jest.fn(() => ({
  href: '',
  download: '',
  click: jest.fn(),
  appendChild: jest.fn(),
  removeChild: jest.fn()
}));

document.body = {
  appendChild: jest.fn(),
  removeChild: jest.fn()
};

// Tests
describe('Circuit Sharing Service', () => {
  test('validateCircuitData should validate circuit structure', () => {
    expect(validateCircuitData(testCircuit)).toBe(true);
    expect(validateCircuitData({})).toBe(false);
    expect(validateCircuitData({ nodes: [], edges: null })).toBe(false);
  });

  test('compressCircuit should create a smaller representation', () => {
    const compressed = compressCircuit(testCircuit);
    expect(compressed).toHaveProperty('n');
    expect(compressed).toHaveProperty('e');
    expect(compressed.n[0].i).toBe(testCircuit.nodes[0].id);
    expect(compressed.e[0].s).toBe(testCircuit.edges[0].source);
  });

  test('decompressCircuit should restore the original circuit', () => {
    const compressed = compressCircuit(testCircuit);
    const decompressed = decompressCircuit(compressed);
    
    expect(decompressed.nodes.length).toBe(testCircuit.nodes.length);
    expect(decompressed.edges.length).toBe(testCircuit.edges.length);
    expect(decompressed.nodes[0].id).toBe(testCircuit.nodes[0].id);
  });

  test('exportCircuitToFile should create a download link', () => {
    const result = exportCircuitToFile(testCircuit, 'test-circuit');
    expect(result.success).toBe(true);
    expect(document.createElement).toHaveBeenCalledWith('a');
  });

  test('createShareableUrl should generate a valid URL', () => {
    const result = createShareableUrl(testCircuit);
    expect(result.success).toBe(true);
    expect(result.url).toContain('circuit=');
  });
});
