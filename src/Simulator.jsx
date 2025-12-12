import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import ReactFlow, {
  useNodesState,
  useEdgesState,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Background,
  Controls,
  MiniMap,
  Panel,
  Position
} from 'reactflow';

// Import all gate components
import AndGate from './components/gates/AndGate';
import OrGate from './components/gates/OrGate';
import NotGate from './components/gates/NotGate';
import XorGate from './components/gates/XorGate';
import NandGate from './components/gates/NandGate';
import NorGate from './components/gates/NorGate';
import Switch from './components/gates/Switch';
import LED from './components/gates/LED';
import HalfAdder from './components/gates/HalfAdder';
import FullAdder from './components/gates/FullAdder';
import BinaryDisplay from './components/gates/BinaryDisplay';
import BinaryClock from './components/gates/BinaryClock';
import MultiLED from './components/gates/MultiLED';
import BinaryComparator from './components/gates/BinaryComparator';
import BinaryEncoder from './components/gates/BinaryEncoder';
import BinaryDecoder from './components/gates/BinaryDecoder';
import Multiplexer from './components/gates/Multiplexer';

// Import layout components
import AppHeader from './components/layout/AppHeader';
import GridSettings from './components/layout/GridSettings';

// Import utilities
import evaluateCircuit from './utils/circuitEvaluator';
import { generateExpression } from './utils/expressionGenerator';
import { snapToGrid } from './utils/gridHelpers';
import { generateUniqueId, generateNodeId, generateEdgeId } from './utils/idGenerator';
import { analyzeCircuitForRealWorldExamples, analyzeCircuitForRealWorldExample } from './utils/realWorldExamples';
import signalAnimationManager from './utils/signalAnimationManager';
import {
  exportCircuitToFile,
  createShareableUrl,
  importCircuitFromFile,
  importCircuitFromUrl
} from './utils/circuitSharingService';

// Import components
import TruthTableGenerator from './components/TruthTableGenerator';
import BooleanExpressionPanel from './components/BooleanExpressionPanel';
import ExplanationPanel from './components/ExplanationPanel';
import GateTooltip from './components/GateTooltip';
import RealWorldPopup from './components/RealWorldPopup';
import CircuitSharingPanel from './components/CircuitSharingPanel';
import BinaryCalculatorPanel from './components/BinaryCalculatorPanel';
import TeacherDashboard from './components/TeacherDashboard';
import StudentChallengePanel from './components/StudentChallengePanel';
import StudentDashboard from './components/StudentDashboard';
import { useAuth } from './contexts/AuthContext';

// Import hooks
import useBooleanExpression from './hooks/useBooleanExpression';

// Import styles
import 'reactflow/dist/style.css';
import './styles.css';

// Import icons
import {
  AndGateIcon,
  OrGateIcon,
  NotGateIcon,
  XorGateIcon,
  NandGateIcon,
  NorGateIcon,
  SwitchIcon,
  GateIcon,
  InfoIcon,
  TrashIcon,
  SaveIcon,
  LoadIcon,
  ShareIcon
} from './components/icons';

// Define custom node types
const nodeTypes = {
  andGate: AndGate,
  orGate: OrGate,
  notGate: NotGate,
  xorGate: XorGate,
  nandGate: NandGate,
  norGate: NorGate,
  switch: Switch,
  led: LED,
  halfAdder: HalfAdder,
  fullAdder: FullAdder,
  binaryDisplay: BinaryDisplay,
  binaryClock: BinaryClock,
  multiLED: MultiLED,
  binaryComparator: BinaryComparator,
  binaryEncoder: BinaryEncoder,
  binaryDecoder: BinaryDecoder,
  multiplexer: Multiplexer,
};

// Define custom edge types (empty object if not using custom edges)
const edgeTypes = {};

// Initial nodes setup
const initialNodes = [
  {
    id: 'switch-1',
    type: 'switch',
    position: { x: 100, y: 100 },
    data: { label: 'Switch 1', state: false },
  },
  {
    id: 'switch-2',
    type: 'switch',
    position: { x: 100, y: 200 },
    data: { label: 'Switch 2', state: false },
  },
  {
    id: 'and-1',
    type: 'andGate',
    position: { x: 300, y: 150 },
    data: { label: 'AND' },
  },
  {
    id: 'led-1',
    type: 'led',
    position: { x: 500, y: 150 },
    data: { label: 'LED', state: false },
  },
];

// Initial edges
const initialEdges = [
  { id: 'e-s1-a1', source: 'switch-1', target: 'and-1', sourceHandle: 'out', targetHandle: 'in1' },
  { id: 'e-s2-a1', source: 'switch-2', target: 'and-1', sourceHandle: 'out', targetHandle: 'in2' },
  { id: 'e-a1-l1', source: 'and-1', target: 'led-1', sourceHandle: 'out', targetHandle: 'in' },
];

function Simulator() {
  const { userRole, logout } = useAuth();
  const [nodes, setNodes, onNodesChangeOriginal] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { parseExpression, evaluate } = useBooleanExpression();
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [tooltipInfo, setTooltipInfo] = useState(null);
  const [snapGrid, setSnapGrid] = useState(true);
  const [gridSize, setGridSize] = useState(20);
  const [selectedNode, setSelectedNode] = useState(null);
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [teacherDashboardVisible, setTeacherDashboardVisible] = useState(false);
  const [studentDashboardVisible, setStudentDashboardVisible] = useState(false);
  const sidebarRef = useRef(null);
  const resizingRef = useRef(false);

  // Student Challenge Mode State
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [challengePoints, setChallengePoints] = useState(0);

  // Real-world examples popup state
  const [realWorldPopup, setRealWorldPopup] = useState({
    visible: false,
    message: '',
    timeoutId: null
  });

  // Circuit sharing panel state
  const [sharingPanelVisible, setSharingPanelVisible] = useState(false);

  // Notification state for operation feedback
  const [notification, setNotification] = useState({
    message: '',
    type: 'info',
    show: false
  });
  const showRealWorldExample = useCallback((message) => {
    // Clear any existing timeout
    if (realWorldPopup.timeoutId) {
      clearTimeout(realWorldPopup.timeoutId);
    }

    // Show the popup with new message
    setRealWorldPopup({
      visible: true,
      message,
      timeoutId: setTimeout(() => {
        hideRealWorldExample();
      }, 8000) // Hide popup after 8 seconds
    });
  }, [realWorldPopup]);

  // Hide the real-world example popup
  const hideRealWorldExample = useCallback(() => {
    setRealWorldPopup(prev => ({
      ...prev,
      visible: false,
      timeoutId: null
    }));
  }, []);

  // Modified onNodesChange function with snap-to-grid
  const onNodesChange = useCallback(
    (changes) => {
      // Filter out position changes to handle them with snapping
      const nonPositionChanges = changes.filter(
        (change) => change.type !== 'position'
      );

      // Handle position changes with snapping
      const positionChanges = changes
        .filter((change) => change.type === 'position')
        .map((change) => {
          if (snapGrid && change.position) {
            return {
              ...change,
              position: snapToGrid(change.position, gridSize),
            };
          }
          return change;
        });

      // Apply all changes
      setNodes((nds) =>
        applyNodeChanges([...nonPositionChanges, ...positionChanges], nds)
      );
    },
    [setNodes, snapGrid, gridSize]
  );
  // Helper function to evaluate circuit with specific nodes
  const evaluateCircuitWithNodes = useCallback((nodesToEvaluate) => {
    console.log("Evaluating circuit with provided nodes...");

    // Create a working copy that preserves switch states
    const nodesCopy = nodesToEvaluate.map(node => ({
      ...node,
      data: { ...node.data }
    }));

    const nodeMap = {};
    nodesCopy.forEach(node => {
      nodeMap[node.id] = node;
    });

    // Log switch states before processing
    const switches = nodesCopy.filter(n => n.type === 'switch');
    console.log("Switch states before evaluation:",
      switches.map(s => ({ id: s.id, state: s.data.state }))
    );

    // Only process gates and LEDs - NEVER modify switch states
    nodesCopy.forEach(node => {
      // Skip switches entirely - they maintain user-set state
      if (node.type === 'switch') {
        return;
      }

      // Find input edges for this node
      const inputEdges = edges.filter(e => e.target === node.id);

      // Get input values from source nodes
      const inputValues = inputEdges.map(edge => {
        const sourceNode = nodeMap[edge.source];
        return sourceNode?.data?.state || false;
      });
      // Calculate output based on gate type
      let outputValue = false;
      switch (node.type) {
        case 'andGate':
          outputValue = inputValues.every(val => val === true);
          break;
        case 'orGate':
          outputValue = inputValues.some(val => val === true);
          break;
        case 'notGate':
          outputValue = !inputValues[0];
          break;
        case 'nandGate':
          outputValue = !inputValues.every(val => val === true);
          break;
        case 'norGate':
          outputValue = !inputValues.some(val => val === true);
          break;
        case 'xorGate':
          outputValue = inputValues.filter(val => val === true).length % 2 !== 0;
          break;
        case 'halfAdder':
          // Half adder: sum = A XOR B, carry = A AND B
          const A = inputValues[0] || false;
          const B = inputValues[1] || false;
          node.data.sum = A !== B; // XOR
          node.data.carry = A && B; // AND
          outputValue = node.data.sum;
          break;
        case 'fullAdder':
          // Full adder: A, B, Cin inputs
          const inputA = inputValues[0] || false;
          const inputB = inputValues[1] || false;
          const carryIn = inputValues[2] || false;
          const sum = (inputA !== inputB) !== carryIn; // XOR of all three
          const carryOut = (inputA && inputB) || (carryIn && (inputA !== inputB));
          node.data.sum = sum; node.data.carryOut = carryOut;
          outputValue = sum;
          break; case 'binaryDisplay':
          // Binary display shows the input values as binary representation
          const displayBits = node.data.bitWidth || 4;
          const displayValues = [];

          // Process input edges to get bit values from connected switches
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

          // Calculate decimal and hex values for display
          const decimalValue = displayValues.reduce((acc, bit, index) => {
            return acc + (bit ? Math.pow(2, displayBits - 1 - index) : 0);
          }, 0);

          // Update node data
          node.data.values = displayValues;
          node.data.state = displayValues; // Set state to array for UI rendering
          node.data.decimalValue = decimalValue;
          node.data.hexValue = decimalValue.toString(16).toUpperCase();

          outputValue = displayValues[0] || false;
          break; case 'multiLED':
          // Multi-LED displays multiple input values
          const ledCount = node.data.ledCount || 6; // Default to 6-LED array
          const ledValues = [];

          // Process input edges to get LED values from connected switches
          inputEdges.forEach(edge => {
            if (edge.targetHandle && edge.targetHandle.startsWith('led')) {
              const ledIndex = parseInt(edge.targetHandle.substring(3), 10);
              if (ledIndex < ledCount) {
                ledValues[ledIndex] = nodeMap[edge.source]?.data?.state || false;
              }
            }
          });

          // Fill in missing values with false
          for (let i = 0; i < ledCount; i++) {
            if (ledValues[i] === undefined) ledValues[i] = false;
          }

          // Update node data with detailed information
          node.data.values = ledValues;
          node.data.state = ledValues; // Set state to array for UI rendering
          node.data.activeCount = ledValues.filter(Boolean).length;
          node.data.binaryPattern = ledValues.map(val => val ? '1' : '0').join('');

          // Set output value (true if any LED is on)
          outputValue = ledValues.some(val => val === true);
          break;
        case 'binaryComparator':
          // Get input values for A and B buses
          const inputAValues = [];
          const inputBValues = [];

          // Find input edges for this node and separate them into A and B inputs
          inputEdges.forEach(edge => {
            if (edge.targetHandle && edge.targetHandle.startsWith('a')) {
              const bitIndex = parseInt(edge.targetHandle.substring(1), 10);
              inputAValues[bitIndex] = nodeMap[edge.source]?.data?.state || false;
            } else if (edge.targetHandle && edge.targetHandle.startsWith('b')) {
              const bitIndex = parseInt(edge.targetHandle.substring(1), 10);
              inputBValues[bitIndex] = nodeMap[edge.source]?.data?.state || false;
            }
          });

          // Fill in any missing values with false
          const bits = node.data.bits || 4;
          for (let i = 0; i < bits; i++) {
            if (inputAValues[i] === undefined) inputAValues[i] = false;
            if (inputBValues[i] === undefined) inputBValues[i] = false;
          }

          // Convert binary arrays to decimal values
          const valueA = inputAValues.reduce((acc, bit, index) => {
            return acc + (bit ? Math.pow(2, bits - 1 - index) : 0);
          }, 0);

          const valueB = inputBValues.reduce((acc, bit, index) => {
            return acc + (bit ? Math.pow(2, bits - 1 - index) : 0);
          }, 0);

          // Calculate comparison results
          node.data.equal = valueA === valueB;
          node.data.greater = valueA > valueB;
          node.data.less = valueA < valueB;
          node.data.inputA = inputAValues;
          node.data.inputB = inputBValues;

          // Set primary output value (equal)
          outputValue = node.data.equal;
          break;
        case 'binaryEncoder':
          // Process inputs for encoder
          const encoderInputs = [];
          const inputSize = node.data.inputSize || 8;

          // Get input connections
          inputEdges.forEach(edge => {
            if (edge.targetHandle && edge.targetHandle.startsWith('in')) {
              const inputIndex = parseInt(edge.targetHandle.substring(2), 10);
              encoderInputs[inputIndex] = nodeMap[edge.source]?.data?.state || false;
            }
          });

          // Fill in missing values
          for (let i = 0; i < inputSize; i++) {
            if (encoderInputs[i] === undefined) encoderInputs[i] = false;
          }

          // Find highest priority active input (priority encoder)
          let encodedValue = 0;
          let validOutput = false;

          for (let i = inputSize - 1; i >= 0; i--) {
            if (encoderInputs[i]) {
              encodedValue = i;
              validOutput = true;
              break;
            }
          }

          // Number of output bits
          const outputBits = Math.ceil(Math.log2(inputSize));

          // Generate binary output
          const binaryOutput = Array.from({ length: outputBits }, (_, i) => {
            return validOutput && ((encodedValue >> (outputBits - 1 - i)) & 1) === 1;
          });

          // Update node data
          node.data.inputs = encoderInputs;
          node.data.outputs = binaryOutput;
          node.data.valid = validOutput;
          node.data.state = { inputs: encoderInputs, outputs: binaryOutput, valid: validOutput };

          // Set primary output value (valid signal)
          outputValue = validOutput;
          break;
        case 'binaryDecoder':
          // Get decoder input values
          const decoderInputs = [];
          const inputBits = node.data.inputBits || 2;
          let decoderEnable = true;

          // Get inputs from connections
          inputEdges.forEach(edge => {
            if (edge.targetHandle && edge.targetHandle.startsWith('in')) {
              const inputIndex = parseInt(edge.targetHandle.substring(2), 10);
              decoderInputs[inputIndex] = nodeMap[edge.source]?.data?.state || false;
            } else if (edge.targetHandle === 'enable') {
              decoderEnable = nodeMap[edge.source]?.data?.state !== false; // Default to true if not connected
            }
          });

          // Fill in any missing values
          for (let i = 0; i < inputBits; i++) {
            if (decoderInputs[i] === undefined) decoderInputs[i] = false;
          }

          // Calculate decoder value
          const decoderValue = decoderInputs.reduce((acc, bit, index) => {
            return acc + (bit ? Math.pow(2, inputBits - 1 - index) : 0);
          }, 0);

          // Generate outputs (one-hot encoding when enabled)
          const outputLines = Math.pow(2, inputBits);
          const decoderOutputs = Array.from({ length: outputLines }, (_, i) => {
            return decoderEnable && i === decoderValue;
          });

          // Update node data
          node.data.inputs = decoderInputs;
          node.data.enable = decoderEnable;
          node.data.outputs = decoderOutputs;
          node.data.state = { inputs: decoderInputs, enable: decoderEnable, outputs: decoderOutputs };

          // Set primary output to the first output line
          outputValue = decoderOutputs[0] || false;
          break;
        case 'multiplexer':
          // Get multiplexer inputs
          const selectBits = node.data.selectBits || 2;
          const dataInputCount = Math.pow(2, selectBits);
          const muxDataInputs = [];
          const selectInputs = [];
          let muxEnable = true;

          // Process input connections
          inputEdges.forEach(edge => {
            if (edge.targetHandle && edge.targetHandle.startsWith('data')) {
              const dataIndex = parseInt(edge.targetHandle.substring(4), 10);
              muxDataInputs[dataIndex] = nodeMap[edge.source]?.data?.state || false;
            } else if (edge.targetHandle && edge.targetHandle.startsWith('select')) {
              const selectIndex = parseInt(edge.targetHandle.substring(6), 10);
              selectInputs[selectIndex] = nodeMap[edge.source]?.data?.state || false;
            } else if (edge.targetHandle === 'enable') {
              muxEnable = nodeMap[edge.source]?.data?.state !== false; // Default to true if not connected
            }
          });

          // Fill in missing values
          for (let i = 0; i < dataInputCount; i++) {
            if (muxDataInputs[i] === undefined) muxDataInputs[i] = false;
          }

          for (let i = 0; i < selectBits; i++) {
            if (selectInputs[i] === undefined) selectInputs[i] = false;
          }

          // Calculate select value
          const selectValue = selectInputs.reduce((acc, bit, index) => {
            return acc + (bit ? Math.pow(2, selectBits - 1 - index) : 0);
          }, 0);

          // Determine output (selected input when enabled)
          let muxOutput = false;
          if (muxEnable && selectValue < dataInputCount) {
            muxOutput = muxDataInputs[selectValue];
          }

          // Update node data
          node.data.inputs = muxDataInputs;
          node.data.select = selectInputs;
          node.data.enable = muxEnable;
          node.data.state = { inputs: muxDataInputs, select: selectInputs, enable: muxEnable };

          // Set output value
          outputValue = muxOutput;
          break;
        case 'binaryClock':
          // Binary clock updates automatically and provides time outputs
          const now = new Date();
          const hours = now.getHours();
          const minutes = now.getMinutes();
          const seconds = now.getSeconds();

          // Store binary time values in node data for outputs
          node.data.hoursBinary = Array.from({ length: 6 }, (_, i) => Boolean(hours & (1 << (5 - i))));
          node.data.minutesBinary = Array.from({ length: 6 }, (_, i) => Boolean(minutes & (1 << (5 - i))));
          node.data.secondsBinary = Array.from({ length: 6 }, (_, i) => Boolean(seconds & (1 << (5 - i))));

          // Primary output is seconds LSB for general use
          outputValue = Boolean(seconds & 1);
          break;
        case 'led':
          outputValue = inputValues[0] || false;
          break;
        default:
          outputValue = false;
          break;
      }

      // Update only gate and LED states
      node.data.state = outputValue;
    });

    // Log switch states after processing to verify they weren't changed
    const switchesAfter = nodesCopy.filter(n => n.type === 'switch');
    console.log("Switch states after evaluation:",
      switchesAfter.map(s => ({ id: s.id, state: s.data.state }))
    );

    // Update React state only for gates and LEDs
    setNodes(nodesCopy);

    return nodeMap;
  }, [edges, setNodes]);

  // Evaluate the circuit using @hckrnews/logic-gates
  const evaluateCircuit = useCallback(() => {
    evaluateCircuitWithNodes(nodes);
  }, [nodes, evaluateCircuitWithNodes]);
  // Handle connections
  const onConnect = useCallback((params) => {
    console.log("New connection:", params);
    setEdges(eds => [...eds, {
      ...params,
      id: generateEdgeId(params.source, params.target, params.sourceHandle, params.targetHandle)
    }]);
  }, [setEdges]);

  // Toggle switch state
  const toggleSwitch = useCallback((id) => {
    console.log("Toggling switch:", id);
    setNodes(nds => {
      return nds.map(node => {
        if (node.id === id && node.type === 'switch') {
          return {
            ...node,
            data: {
              ...node.data,
              state: !node.data.state,
            },
          };
        }
        return node;
      });
    });
  }, [setNodes]);
  // Add a new node
  const addNode = useCallback((type) => {
    let nodeType;
    let label;

    switch (type) {
      case 'and':
        nodeType = 'andGate';
        label = 'AND';
        break;
      case 'or':
        nodeType = 'orGate';
        label = 'OR';
        break;
      case 'not':
        nodeType = 'notGate';
        label = 'NOT';
        break;
      case 'xor':
        nodeType = 'xorGate';
        label = 'XOR';
        break;
      case 'nand':
        nodeType = 'nandGate';
        label = 'NAND';
        break;
      case 'nor':
        nodeType = 'norGate';
        label = 'NOR';
        break;
      case 'switch':
        nodeType = 'switch';
        label = `Switch ${nodes.filter(n => n.type === 'switch').length + 1}`;
        break;
      case 'led':
        nodeType = 'led';
        label = `LED ${nodes.filter(n => n.type === 'led').length + 1}`;
        break;
      case 'halfAdder':
        nodeType = 'halfAdder';
        label = 'Half Adder';
        break;
      case 'fullAdder':
        nodeType = 'fullAdder';
        label = 'Full Adder';
        break;
      case 'binaryDisplay':
        nodeType = 'binaryDisplay';
        label = 'Binary Display';
        break;
      case 'binaryClock':
        nodeType = 'binaryClock';
        label = 'Binary Clock';
        break; case 'multiLED':
        nodeType = 'multiLED';
        label = 'Multi LED';
        break;
      case 'binaryComparator':
        nodeType = 'binaryComparator';
        label = 'Binary Comparator';
        break;
      case 'binaryEncoder':
        nodeType = 'binaryEncoder';
        label = 'Binary Encoder';
        break;
      case 'binaryDecoder':
        nodeType = 'binaryDecoder';
        label = 'Binary Decoder';
        break;
      case 'multiplexer':
        nodeType = 'multiplexer';
        label = 'Multiplexer';
        break;
      default:
        return;
    }      const newNode = {
      id: generateNodeId(type),
      type: nodeType,
      position: { x: 100, y: 100 + Math.random() * 200 },
      data: {
        label,
        state: type === 'switch' ? false : undefined,
        bitWidth: ['binaryDisplay', 'multiLED'].includes(type) ? 4 : undefined,
        bits: type === 'binaryComparator' ? 4 : undefined,
        inputSize: type === 'binaryEncoder' ? 8 : undefined,
        inputBits: type === 'binaryDecoder' ? 3 : undefined,
        selectBits: type === 'multiplexer' ? 2 : undefined
      }
    };

    setNodes(prevNodes => [...prevNodes, newNode]);
  }, [nodes, setNodes]);

  // Create a half adder
  const addHalfAdder = useCallback(() => {
    const baseX = 200;
    const baseY = 300;
    // Create the components
    const newNodes = [
      {
        id: generateNodeId('switch'),
        type: 'switch',
        position: { x: baseX - 150, y: baseY - 50 },
        data: { label: 'Input A', state: false },
      },
      {
        id: generateNodeId('switch'),
        type: 'switch',
        position: { x: baseX - 150, y: baseY + 50 },
        data: { label: 'Input B', state: false },
      },
      {
        id: generateNodeId('xor'),
        type: 'xorGate',
        position: { x: baseX, y: baseY - 50 },
        data: { label: 'XOR' },
      },
      {
        id: generateNodeId('and'),
        type: 'andGate',
        position: { x: baseX, y: baseY + 50 },
        data: { label: 'AND' },
      },
      {
        id: generateNodeId('led'),
        type: 'led',
        position: { x: baseX + 150, y: baseY - 50 },
        data: { label: 'Sum', state: false },
      },
      {
        id: generateNodeId('led'),
        type: 'led',
        position: { x: baseX + 150, y: baseY + 50 },
        data: { label: 'Carry', state: false },
      },
    ];

    // Create the edges
    const newEdges = [
      { id: generateEdgeId(newNodes[0].id, newNodes[2].id, 'out', 'in1'), source: newNodes[0].id, target: newNodes[2].id, sourceHandle: 'out', targetHandle: 'in1' },
      { id: generateEdgeId(newNodes[1].id, newNodes[2].id, 'out', 'in2'), source: newNodes[1].id, target: newNodes[2].id, sourceHandle: 'out', targetHandle: 'in2' },
      { id: generateEdgeId(newNodes[0].id, newNodes[3].id, 'out', 'in1'), source: newNodes[0].id, target: newNodes[3].id, sourceHandle: 'out', targetHandle: 'in1' },
      { id: generateEdgeId(newNodes[1].id, newNodes[3].id, 'out', 'in2'), source: newNodes[1].id, target: newNodes[3].id, sourceHandle: 'out', targetHandle: 'in2' },
      { id: generateEdgeId(newNodes[2].id, newNodes[4].id, 'out', 'in'), source: newNodes[2].id, target: newNodes[4].id, sourceHandle: 'out', targetHandle: 'in' },
      { id: generateEdgeId(newNodes[3].id, newNodes[5].id, 'out', 'in'), source: newNodes[3].id, target: newNodes[5].id, sourceHandle: 'out', targetHandle: 'in' },
    ];

    setNodes(prevNodes => [...prevNodes, ...newNodes]);
    setEdges(prevEdges => [...prevEdges, ...newEdges]);
  }, [setNodes, setEdges]);

  // Add full adder
  const addFullAdder = useCallback(() => {
    const baseX = 300;
    const baseY = 300;
    // Create full adder components
    const newNodes = [
      {
        id: generateNodeId('switch'),
        type: 'switch',
        position: { x: baseX - 200, y: baseY - 80 },
        data: { label: 'Input A', state: false },
      },
      {
        id: generateNodeId('switch'),
        type: 'switch',
        position: { x: baseX - 200, y: baseY },
        data: { label: 'Input B', state: false },
      },
      {
        id: generateNodeId('switch'),
        type: 'switch',
        position: { x: baseX - 200, y: baseY + 80 },
        data: { label: 'Carry In', state: false },
      },
      {
        id: generateNodeId('xor'),
        type: 'xorGate',
        position: { x: baseX, y: baseY - 40 },
        data: { label: 'XOR 1' },
      },
      {
        id: generateNodeId('and'),
        type: 'andGate',
        position: { x: baseX, y: baseY + 40 },
        data: { label: 'AND 1' },
      },
      // Second stage
      {
        id: generateNodeId('xor'),
        type: 'xorGate',
        position: { x: baseX + 150, y: baseY - 80 },
        data: { label: 'XOR 2' },
      },
      {
        id: generateNodeId('and'),
        type: 'andGate',
        position: { x: baseX + 150, y: baseY },
        data: { label: 'AND 2' },
      },
      // Output stage
      {
        id: generateNodeId('or'),
        type: 'orGate',
        position: { x: baseX + 300, y: baseY + 40 },
        data: { label: 'OR' },
      },
      // Outputs
      {
        id: generateNodeId('led'),
        type: 'led',
        position: { x: baseX + 300, y: baseY - 80 },
        data: { label: 'Sum', state: false },
      },
      {
        id: generateNodeId('led'),
        type: 'led',
        position: { x: baseX + 400, y: baseY + 40 },
        data: { label: 'Carry Out', state: false },
      },
    ];

    // Create the edges - connections between components
    const newEdges = [
      // A and B to XOR 1
      { id: generateEdgeId(newNodes[0].id, newNodes[3].id, 'out', 'in1'), source: newNodes[0].id, target: newNodes[3].id, sourceHandle: 'out', targetHandle: 'in1' },
      { id: generateEdgeId(newNodes[1].id, newNodes[3].id, 'out', 'in2'), source: newNodes[1].id, target: newNodes[3].id, sourceHandle: 'out', targetHandle: 'in2' },
      // A and B to AND 1
      { id: generateEdgeId(newNodes[0].id, newNodes[4].id, 'out', 'in1'), source: newNodes[0].id, target: newNodes[4].id, sourceHandle: 'out', targetHandle: 'in1' },
      { id: generateEdgeId(newNodes[1].id, newNodes[4].id, 'out', 'in2'), source: newNodes[1].id, target: newNodes[4].id, sourceHandle: 'out', targetHandle: 'in2' },
      // XOR 1 and Carry In to XOR 2
      { id: generateEdgeId(newNodes[3].id, newNodes[5].id, 'out', 'in1'), source: newNodes[3].id, target: newNodes[5].id, sourceHandle: 'out', targetHandle: 'in1' },
      { id: generateEdgeId(newNodes[2].id, newNodes[5].id, 'out', 'in2'), source: newNodes[2].id, target: newNodes[5].id, sourceHandle: 'out', targetHandle: 'in2' },
      // XOR 1 and Carry In to AND 2
      { id: generateEdgeId(newNodes[3].id, newNodes[6].id, 'out', 'in1'), source: newNodes[3].id, target: newNodes[6].id, sourceHandle: 'out', targetHandle: 'in1' },
      { id: generateEdgeId(newNodes[2].id, newNodes[6].id, 'out', 'in2'), source: newNodes[2].id, target: newNodes[6].id, sourceHandle: 'out', targetHandle: 'in2' },
      // AND 1 and AND 2 to OR
      { id: generateEdgeId(newNodes[4].id, newNodes[7].id, 'out', 'in1'), source: newNodes[4].id, target: newNodes[7].id, sourceHandle: 'out', targetHandle: 'in1' },
      { id: generateEdgeId(newNodes[6].id, newNodes[7].id, 'out', 'in2'), source: newNodes[6].id, target: newNodes[7].id, sourceHandle: 'out', targetHandle: 'in2' },
      // Connections to LEDs
      { id: generateEdgeId(newNodes[5].id, newNodes[8].id, 'out', 'in'), source: newNodes[5].id, target: newNodes[8].id, sourceHandle: 'out', targetHandle: 'in' },
      { id: generateEdgeId(newNodes[7].id, newNodes[9].id, 'out', 'in'), source: newNodes[7].id, target: newNodes[9].id, sourceHandle: 'out', targetHandle: 'in' },
    ];

    setNodes(prevNodes => [...prevNodes, ...newNodes]);
    setEdges(prevEdges => [...prevEdges, ...newEdges]);
  }, [setNodes, setEdges]);

  // Create a 4-bit binary adder
  const add4BitAdder = useCallback(() => {
    const baseX = 200;
    const baseY = 200;
    const spacing = 120;

    const newNodes = [];
    const newEdges = [];
    // Create 4 sets of input switches (A0-A3, B0-B3)
    for (let i = 0; i < 4; i++) {
      newNodes.push(
        {
          id: generateNodeId('switch'),
          type: 'switch',
          position: { x: baseX - 200, y: baseY + i * spacing },
          data: { label: `A${i}`, state: false },
        },
        {
          id: generateNodeId('switch'),
          type: 'switch',
          position: { x: baseX - 100, y: baseY + i * spacing },
          data: { label: `B${i}`, state: false },
        }
      );
    }

    // Create full adders for each bit
    for (let i = 0; i < 4; i++) {
      newNodes.push({
        id: generateNodeId('fullAdder'),
        type: 'fullAdder',
        position: { x: baseX + i * 150, y: baseY + 200 },
        data: { label: `FA${i}` },
      });
    }

    // Create output LEDs for sum
    for (let i = 0; i < 4; i++) {
      newNodes.push({
        id: generateNodeId('led'),
        type: 'led',
        position: { x: baseX + i * 150, y: baseY + 350 },
        data: { label: `S${i}`, state: false },
      });
    }

    // Create carry output LED
    newNodes.push({
      id: generateNodeId('led'),
      type: 'led',
      position: { x: baseX + 4 * 150, y: baseY + 350 },
      data: { label: 'Cout', state: false },
    });

    // Create binary display for result
    newNodes.push({
      id: generateNodeId('binaryDisplay'),
      type: 'binaryDisplay',
      position: { x: baseX + 200, y: baseY + 450 },
      data: { label: 'Result Display', bitWidth: 5 },
    });

    // Create connections (simplified - would need proper carry chain)
    for (let i = 0; i < 4; i++) {
      const aSwitch = newNodes[i * 2];
      const bSwitch = newNodes[i * 2 + 1];
      const fullAdder = newNodes[8 + i];
      const sumLED = newNodes[12 + i];

      // Connect inputs to full adder
      newEdges.push(
        { id: generateEdgeId(aSwitch.id, fullAdder.id, 'out', 'in1'), source: aSwitch.id, target: fullAdder.id, sourceHandle: 'out', targetHandle: 'in1' },
        { id: generateEdgeId(bSwitch.id, fullAdder.id, 'out', 'in2'), source: bSwitch.id, target: fullAdder.id, sourceHandle: 'out', targetHandle: 'in2' },
        { id: generateEdgeId(fullAdder.id, sumLED.id, 'sum', 'in'), source: fullAdder.id, target: sumLED.id, sourceHandle: 'sum', targetHandle: 'in' }
      );
    }

    setNodes(prevNodes => [...prevNodes, ...newNodes]);
    setEdges(prevEdges => [...prevEdges, ...newEdges]);
  }, [setNodes, setEdges]);
  // Create binary clock circuit
  const addBinaryClockCircuit = useCallback(() => {
    const baseX = 300;
    const baseY = 200;
    const clockId = generateNodeId('binaryClock');
    const hoursLEDId = generateNodeId('multiLED');
    const minutesLEDId = generateNodeId('multiLED');
    const secondsLEDId = generateNodeId('multiLED');

    const newNodes = [
      {
        id: clockId,
        type: 'binaryClock',
        position: { x: baseX, y: baseY },
        data: { label: 'Binary Clock' },
      },
      {
        id: hoursLEDId,
        type: 'multiLED',
        position: { x: baseX + 350, y: baseY - 100 },
        data: { label: 'Hours', ledCount: 6 },
      },
      {
        id: minutesLEDId,
        type: 'multiLED',
        position: { x: baseX + 350, y: baseY },
        data: { label: 'Minutes', ledCount: 6 },
      },
      {
        id: secondsLEDId,
        type: 'multiLED',
        position: { x: baseX + 350, y: baseY + 100 },
        data: { label: 'Seconds', ledCount: 6 },
      }
    ];

    const newEdges = [];

    // Connect hours bits
    for (let i = 0; i < 6; i++) {
      newEdges.push({
        id: generateEdgeId(clockId, hoursLEDId, `hour${i}`, `led${i}`),
        source: clockId,
        target: hoursLEDId,
        sourceHandle: `hour${i}`,
        targetHandle: `led${i}`
      });
    }

    // Connect minutes bits  
    for (let i = 0; i < 6; i++) {
      newEdges.push({
        id: generateEdgeId(clockId, minutesLEDId, `minute${i}`, `led${i}`),
        source: clockId,
        target: minutesLEDId,
        sourceHandle: `minute${i}`,
        targetHandle: `led${i}`
      });
    }

    // Connect seconds bits
    for (let i = 0; i < 6; i++) {
      newEdges.push({
        id: generateEdgeId(clockId, secondsLEDId, `second${i}`, `led${i}`),
        source: clockId,
        target: secondsLEDId,
        sourceHandle: `second${i}`,
        targetHandle: `led${i}`
      });
    }

    setNodes(prevNodes => [...prevNodes, ...newNodes]);
    setEdges(prevEdges => [...prevEdges, ...newEdges]);
  }, [setNodes, setEdges]);



  // Create binary comparator circuit
  const addBinaryComparator = useCallback(() => {
    const baseX = 250;
    const baseY = 200;
    const newNodes = [
      // Input A switches
      {
        id: generateNodeId('switch'),
        type: 'switch',
        position: { x: baseX - 200, y: baseY },
        data: { label: 'A3', state: false },
      },
      {
        id: generateNodeId('switch'),
        type: 'switch',
        position: { x: baseX - 200, y: baseY + 40 },
        data: { label: 'A2', state: false },
      },
      {
        id: generateNodeId('switch'),
        type: 'switch',
        position: { x: baseX - 200, y: baseY + 80 },
        data: { label: 'A1', state: false },
      },
      {
        id: generateNodeId('switch'),
        type: 'switch',
        position: { x: baseX - 200, y: baseY + 120 },
        data: { label: 'A0', state: false },
      },
      // Input B switches  
      {
        id: generateNodeId('switch'),
        type: 'switch',
        position: { x: baseX - 100, y: baseY },
        data: { label: 'B3', state: false },
      },
      {
        id: generateNodeId('switch'),
        type: 'switch',
        position: { x: baseX - 100, y: baseY + 40 },
        data: { label: 'B2', state: false },
      },
      {
        id: generateNodeId('switch'),
        type: 'switch',
        position: { x: baseX - 100, y: baseY + 80 },
        data: { label: 'B1', state: false },
      },
      {
        id: generateNodeId('switch'),
        type: 'switch',
        position: { x: baseX - 100, y: baseY + 120 },
        data: { label: 'B0', state: false },
      },
      // Binary comparator
      {
        id: generateNodeId('binaryComparator'),
        type: 'binaryComparator',
        position: { x: baseX, y: baseY + 60 },
        data: { label: '4-bit Comparator', bits: 4 },
      },
      // Output LEDs
      {
        id: generateNodeId('led'),
        type: 'led',
        position: { x: baseX + 200, y: baseY + 20 },
        data: { label: 'A=B', state: false },
      },
      {
        id: generateNodeId('led'),
        type: 'led',
        position: { x: baseX + 200, y: baseY + 70 },
        data: { label: 'A>B', state: false },
      },
      {
        id: generateNodeId('led'),
        type: 'led',
        position: { x: baseX + 200, y: baseY + 120 },
        data: { label: 'A<B', state: false },
      }
    ];

    const newEdges = [
      // Connect A inputs
      { id: generateEdgeId(newNodes[0].id, newNodes[8].id, 'out', 'a3'), source: newNodes[0].id, target: newNodes[8].id, sourceHandle: 'out', targetHandle: 'a3' },
      { id: generateEdgeId(newNodes[1].id, newNodes[8].id, 'out', 'a2'), source: newNodes[1].id, target: newNodes[8].id, sourceHandle: 'out', targetHandle: 'a2' },
      { id: generateEdgeId(newNodes[2].id, newNodes[8].id, 'out', 'a1'), source: newNodes[2].id, target: newNodes[8].id, sourceHandle: 'out', targetHandle: 'a1' },
      { id: generateEdgeId(newNodes[3].id, newNodes[8].id, 'out', 'a0'), source: newNodes[3].id, target: newNodes[8].id, sourceHandle: 'out', targetHandle: 'a0' },
      // Connect B inputs
      { id: generateEdgeId(newNodes[4].id, newNodes[8].id, 'out', 'b3'), source: newNodes[4].id, target: newNodes[8].id, sourceHandle: 'out', targetHandle: 'b3' },
      { id: generateEdgeId(newNodes[5].id, newNodes[8].id, 'out', 'b2'), source: newNodes[5].id, target: newNodes[8].id, sourceHandle: 'out', targetHandle: 'b2' },
      { id: generateEdgeId(newNodes[6].id, newNodes[8].id, 'out', 'b1'), source: newNodes[6].id, target: newNodes[8].id, sourceHandle: 'out', targetHandle: 'b1' },
      { id: generateEdgeId(newNodes[7].id, newNodes[8].id, 'out', 'b0'), source: newNodes[7].id, target: newNodes[8].id, sourceHandle: 'out', targetHandle: 'b0' },
      // Connect outputs
      { id: generateEdgeId(newNodes[8].id, newNodes[9].id, 'equal', 'in'), source: newNodes[8].id, target: newNodes[9].id, sourceHandle: 'equal', targetHandle: 'in' },
      { id: generateEdgeId(newNodes[8].id, newNodes[10].id, 'greater', 'in'), source: newNodes[8].id, target: newNodes[10].id, sourceHandle: 'greater', targetHandle: 'in' },
      { id: generateEdgeId(newNodes[8].id, newNodes[11].id, 'less', 'in'), source: newNodes[8].id, target: newNodes[11].id, sourceHandle: 'less', targetHandle: 'in' }
    ];

    setNodes(prevNodes => [...prevNodes, ...newNodes]);
    setEdges(prevEdges => [...prevEdges, ...newEdges]);
  }, [setNodes, setEdges]);

  // Create binary encoder circuit
  const addBinaryEncoder = useCallback(() => {
    const baseX = 250;
    const baseY = 200;
    const newNodes = [
      // Input switches (8 inputs for 3-bit encoder)
      ...Array.from({ length: 8 }, (_, i) => ({
        id: generateNodeId('switch'),
        type: 'switch',
        position: { x: baseX - 150, y: baseY + (i * 40) },
        data: { label: `I${i}`, state: false },
      })),
      // Binary encoder
      {
        id: generateNodeId('binaryEncoder'),
        type: 'binaryEncoder',
        position: { x: baseX, y: baseY + 140 },
        data: { label: '8:3 Encoder', inputSize: 8 },
      },
      // Output LEDs (3-bit output)
      {
        id: generateNodeId('led'),
        type: 'led',
        position: { x: baseX + 200, y: baseY + 100 },
        data: { label: 'Y2', state: false },
      },
      {
        id: generateNodeId('led'),
        type: 'led',
        position: { x: baseX + 200, y: baseY + 140 },
        data: { label: 'Y1', state: false },
      },
      {
        id: generateNodeId('led'),
        type: 'led',
        position: { x: baseX + 200, y: baseY + 180 },
        data: { label: 'Y0', state: false },
      },
      // Valid output LED
      {
        id: generateNodeId('led'),
        type: 'led',
        position: { x: baseX + 200, y: baseY + 220 },
        data: { label: 'Valid', state: false },
      }
    ];

    const newEdges = [
      // Connect inputs
      ...Array.from({ length: 8 }, (_, i) => ({
        id: generateEdgeId(newNodes[i].id, newNodes[8].id, 'out', `in${i}`),
        source: newNodes[i].id,
        target: newNodes[8].id,
        sourceHandle: 'out',
        targetHandle: `in${i}`
      })),
      // Connect outputs
      { id: generateEdgeId(newNodes[8].id, newNodes[9].id, 'out2', 'in'), source: newNodes[8].id, target: newNodes[9].id, sourceHandle: 'out2', targetHandle: 'in' },
      { id: generateEdgeId(newNodes[8].id, newNodes[10].id, 'out1', 'in'), source: newNodes[8].id, target: newNodes[10].id, sourceHandle: 'out1', targetHandle: 'in' },
      { id: generateEdgeId(newNodes[8].id, newNodes[11].id, 'out0', 'in'), source: newNodes[8].id, target: newNodes[11].id, sourceHandle: 'out0', targetHandle: 'in' },
      { id: generateEdgeId(newNodes[8].id, newNodes[12].id, 'valid', 'in'), source: newNodes[8].id, target: newNodes[12].id, sourceHandle: 'valid', targetHandle: 'in' }
    ];

    setNodes(prevNodes => [...prevNodes, ...newNodes]);
    setEdges(prevEdges => [...prevEdges, ...newEdges]);
  }, [setNodes, setEdges]);

  // Create binary decoder circuit
  const addBinaryDecoder = useCallback(() => {
    const baseX = 250;
    const baseY = 200;
    const newNodes = [
      // Input switches (3-bit input)
      {
        id: generateNodeId('switch'),
        type: 'switch',
        position: { x: baseX - 150, y: baseY },
        data: { label: 'A2', state: false },
      },
      {
        id: generateNodeId('switch'),
        type: 'switch',
        position: { x: baseX - 150, y: baseY + 40 },
        data: { label: 'A1', state: false },
      },
      {
        id: generateNodeId('switch'),
        type: 'switch',
        position: { x: baseX - 150, y: baseY + 80 },
        data: { label: 'A0', state: false },
      },
      // Enable switch
      {
        id: generateNodeId('switch'),
        type: 'switch',
        position: { x: baseX - 150, y: baseY + 140 },
        data: { label: 'Enable', state: true },
      },
      // Binary decoder
      {
        id: generateNodeId('binaryDecoder'),
        type: 'binaryDecoder',
        position: { x: baseX, y: baseY + 100 },
        data: { label: '3:8 Decoder', inputBits: 3 },
      },
      // Output LEDs (8 outputs)
      ...Array.from({ length: 8 }, (_, i) => ({
        id: generateNodeId('led'),
        type: 'led',
        position: { x: baseX + 200, y: baseY + (i * 35) },
        data: { label: `Y${i}`, state: false },
      }))
    ];

    const newEdges = [
      // Connect inputs
      { id: generateEdgeId(newNodes[0].id, newNodes[4].id, 'out', 'in2'), source: newNodes[0].id, target: newNodes[4].id, sourceHandle: 'out', targetHandle: 'in2' },
      { id: generateEdgeId(newNodes[1].id, newNodes[4].id, 'out', 'in1'), source: newNodes[1].id, target: newNodes[4].id, sourceHandle: 'out', targetHandle: 'in1' },
      { id: generateEdgeId(newNodes[2].id, newNodes[4].id, 'out', 'in0'), source: newNodes[2].id, target: newNodes[4].id, sourceHandle: 'out', targetHandle: 'in0' },
      { id: generateEdgeId(newNodes[3].id, newNodes[4].id, 'out', 'enable'), source: newNodes[3].id, target: newNodes[4].id, sourceHandle: 'out', targetHandle: 'enable' },
      // Connect outputs
      ...Array.from({ length: 8 }, (_, i) => ({
        id: generateEdgeId(newNodes[4].id, newNodes[5 + i].id, `out${i}`, 'in'),
        source: newNodes[4].id,
        target: newNodes[5 + i].id,
        sourceHandle: `out${i}`,
        targetHandle: 'in'
      }))
    ];

    setNodes(prevNodes => [...prevNodes, ...newNodes]);
    setEdges(prevEdges => [...prevEdges, ...newEdges]);
  }, [setNodes, setEdges]);

  // Create multiplexer circuit
  const addMultiplexer = useCallback(() => {
    const baseX = 250;
    const baseY = 200;
    const newNodes = [
      // Data input switches (4 data inputs)
      {
        id: generateNodeId('switch'),
        type: 'switch',
        position: { x: baseX - 150, y: baseY },
        data: { label: 'D0', state: false },
      },
      {
        id: generateNodeId('switch'),
        type: 'switch',
        position: { x: baseX - 150, y: baseY + 40 },
        data: { label: 'D1', state: false },
      },
      {
        id: generateNodeId('switch'),
        type: 'switch',
        position: { x: baseX - 150, y: baseY + 80 },
        data: { label: 'D2', state: false },
      },
      {
        id: generateNodeId('switch'),
        type: 'switch',
        position: { x: baseX - 150, y: baseY + 120 },
        data: { label: 'D3', state: false },
      },
      // Select input switches (2-bit select)
      {
        id: generateNodeId('switch'),
        type: 'switch',
        position: { x: baseX - 50, y: baseY + 160 },
        data: { label: 'S1', state: false },
      },
      {
        id: generateNodeId('switch'),
        type: 'switch',
        position: { x: baseX + 50, y: baseY + 160 },
        data: { label: 'S0', state: false },
      },
      // Enable switch
      {
        id: generateNodeId('switch'),
        type: 'switch',
        position: { x: baseX - 150, y: baseY + 160 },
        data: { label: 'Enable', state: true },
      },
      // Multiplexer
      {
        id: generateNodeId('multiplexer'),
        type: 'multiplexer',
        position: { x: baseX, y: baseY + 60 },
        data: { label: '4:1 MUX', selectBits: 2 },
      },
      // Output LED
      {
        id: generateNodeId('led'),
        type: 'led',
        position: { x: baseX + 200, y: baseY + 60 },
        data: { label: 'Output', state: false },
      }
    ];

    const newEdges = [
      // Connect data inputs
      { id: generateEdgeId(newNodes[0].id, newNodes[7].id, 'out', 'data0'), source: newNodes[0].id, target: newNodes[7].id, sourceHandle: 'out', targetHandle: 'data0' },
      { id: generateEdgeId(newNodes[1].id, newNodes[7].id, 'out', 'data1'), source: newNodes[1].id, target: newNodes[7].id, sourceHandle: 'out', targetHandle: 'data1' },
      { id: generateEdgeId(newNodes[2].id, newNodes[7].id, 'out', 'data2'), source: newNodes[2].id, target: newNodes[7].id, sourceHandle: 'out', targetHandle: 'data2' },
      { id: generateEdgeId(newNodes[3].id, newNodes[7].id, 'out', 'data3'), source: newNodes[3].id, target: newNodes[7].id, sourceHandle: 'out', targetHandle: 'data3' },
      // Connect select inputs
      { id: generateEdgeId(newNodes[4].id, newNodes[7].id, 'out', 'select1'), source: newNodes[4].id, target: newNodes[7].id, sourceHandle: 'out', targetHandle: 'select1' },
      { id: generateEdgeId(newNodes[5].id, newNodes[7].id, 'out', 'select0'), source: newNodes[5].id, target: newNodes[7].id, sourceHandle: 'out', targetHandle: 'select0' },
      // Connect enable
      { id: generateEdgeId(newNodes[6].id, newNodes[7].id, 'out', 'enable'), source: newNodes[6].id, target: newNodes[7].id, sourceHandle: 'out', targetHandle: 'enable' },
      // Connect output
      { id: generateEdgeId(newNodes[7].id, newNodes[8].id, 'output', 'in'), source: newNodes[7].id, target: newNodes[8].id, sourceHandle: 'output', targetHandle: 'in' }
    ];

    setNodes(prevNodes => [...prevNodes, ...newNodes]);
    setEdges(prevEdges => [...prevEdges, ...newEdges]);
  }, [setNodes, setEdges]);



  // SR Latch Circuit  
  const addSRLatch = useCallback(() => {
    const baseX = 300;
    const baseY = 250;
    const newNodes = [
      // S input
      {
        id: generateNodeId('switch'),
        type: 'switch',
        position: { x: baseX - 150, y: baseY - 50 },
        data: { label: 'S (Set)', state: false },
      },
      // R input
      {
        id: generateNodeId('switch'),
        type: 'switch',
        position: { x: baseX - 150, y: baseY + 50 },
        data: { label: 'R (Reset)', state: false },
      },
      // NOR gates for SR latch
      {
        id: generateNodeId('norGate'),
        type: 'norGate',
        position: { x: baseX, y: baseY - 50 },
        data: { label: 'NOR1' },
      },
      {
        id: generateNodeId('norGate'),
        type: 'norGate',
        position: { x: baseX, y: baseY + 50 },
        data: { label: 'NOR2' },
      },
      // Output LEDs
      {
        id: generateNodeId('led'),
        type: 'led',
        position: { x: baseX + 150, y: baseY - 50 },
        data: { label: 'Q', state: false },
      },
      {
        id: generateNodeId('led'),
        type: 'led',
        position: { x: baseX + 150, y: baseY + 50 },
        data: { label: 'Q\'', state: false },
      }
    ];

    const newEdges = [
      // S to NOR1 
      { id: generateEdgeId(newNodes[0].id, newNodes[2].id, 'out', 'in1'), source: newNodes[0].id, target: newNodes[2].id, sourceHandle: 'out', targetHandle: 'in1' },
      // R to NOR2
      { id: generateEdgeId(newNodes[1].id, newNodes[3].id, 'out', 'in1'), source: newNodes[1].id, target: newNodes[3].id, sourceHandle: 'out', targetHandle: 'in1' },
      // Cross-coupled feedback
      { id: generateEdgeId(newNodes[2].id, newNodes[3].id, 'out', 'in2'), source: newNodes[2].id, target: newNodes[3].id, sourceHandle: 'out', targetHandle: 'in2' },
      { id: generateEdgeId(newNodes[3].id, newNodes[2].id, 'out', 'in2'), source: newNodes[3].id, target: newNodes[2].id, sourceHandle: 'out', targetHandle: 'in2' },
      // Outputs to LEDs
      { id: generateEdgeId(newNodes[2].id, newNodes[4].id, 'out', 'in'), source: newNodes[2].id, target: newNodes[4].id, sourceHandle: 'out', targetHandle: 'in' },
      { id: generateEdgeId(newNodes[3].id, newNodes[5].id, 'out', 'in'), source: newNodes[3].id, target: newNodes[5].id, sourceHandle: 'out', targetHandle: 'in' }
    ];

    setNodes(prevNodes => [...prevNodes, ...newNodes]);
    setEdges(prevEdges => [...prevEdges, ...newEdges]);
  }, [setNodes, setEdges]);

  // D Flip-Flop Circuit
  const addDFlipFlop = useCallback(() => {
    const baseX = 300;
    const baseY = 250;
    const newNodes = [
      // D input
      {
        id: generateNodeId('switch'),
        type: 'switch',
        position: { x: baseX - 200, y: baseY - 50 },
        data: { label: 'D (Data)', state: false },
      },
      // Clock input
      {
        id: generateNodeId('switch'),
        type: 'switch',
        position: { x: baseX - 200, y: baseY + 50 },
        data: { label: 'CLK', state: false },
      },
      // NAND gates for D flip-flop (master-slave design)
      {
        id: generateNodeId('nandGate'),
        type: 'nandGate',
        position: { x: baseX - 100, y: baseY - 75 },
        data: { label: 'NAND1' },
      },
      {
        id: generateNodeId('nandGate'),
        type: 'nandGate',
        position: { x: baseX - 100, y: baseY - 25 },
        data: { label: 'NAND2' },
      },
      {
        id: generateNodeId('nandGate'),
        type: 'nandGate',
        position: { x: baseX + 50, y: baseY - 50 },
        data: { label: 'NAND3' },
      },
      {
        id: generateNodeId('nandGate'),
        type: 'nandGate',
        position: { x: baseX + 50, y: baseY + 50 },
        data: { label: 'NAND4' },
      },
      // NOT gate for inverted clock
      {
        id: generateNodeId('notGate'),
        type: 'notGate',
        position: { x: baseX - 50, y: baseY + 100 },
        data: { label: 'NOT' },
      },
      // Output LEDs
      {
        id: generateNodeId('led'),
        type: 'led',
        position: { x: baseX + 200, y: baseY - 50 },
        data: { label: 'Q', state: false },
      },
      {
        id: generateNodeId('led'),
        type: 'led',
        position: { x: baseX + 200, y: baseY + 50 },
        data: { label: 'Q\'', state: false },
      }
    ];

    const newEdges = [
      // D to NAND1
      { id: generateEdgeId(newNodes[0].id, newNodes[2].id, 'out', 'in1'), source: newNodes[0].id, target: newNodes[2].id, sourceHandle: 'out', targetHandle: 'in1' },
      // Clock connections (simplified for demonstration)
      { id: generateEdgeId(newNodes[1].id, newNodes[6].id, 'out', 'in'), source: newNodes[1].id, target: newNodes[6].id, sourceHandle: 'out', targetHandle: 'in' },
      // Cross-coupled outputs
      { id: generateEdgeId(newNodes[4].id, newNodes[5].id, 'out', 'in2'), source: newNodes[4].id, target: newNodes[5].id, sourceHandle: 'out', targetHandle: 'in2' },
      { id: generateEdgeId(newNodes[5].id, newNodes[4].id, 'out', 'in2'), source: newNodes[5].id, target: newNodes[4].id, sourceHandle: 'out', targetHandle: 'in2' },
      // Outputs to LEDs
      { id: generateEdgeId(newNodes[4].id, newNodes[7].id, 'out', 'in'), source: newNodes[4].id, target: newNodes[7].id, sourceHandle: 'out', targetHandle: 'in' },
      { id: generateEdgeId(newNodes[5].id, newNodes[8].id, 'out', 'in'), source: newNodes[5].id, target: newNodes[8].id, sourceHandle: 'out', targetHandle: 'in' }
    ];

    setNodes(prevNodes => [...prevNodes, ...newNodes]);
    setEdges(prevEdges => [...prevEdges, ...newEdges]);
  }, [setNodes, setEdges]);

  // 4-bit Shift Register Circuit
  const add4BitShiftRegister = useCallback(() => {
    const baseX = 200;
    const baseY = 250;
    const newNodes = [
      // Serial input
      {
        id: generateNodeId('switch'),
        type: 'switch',
        position: { x: baseX - 100, y: baseY },
        data: { label: 'Serial In', state: false },
      },
      // Clock input
      {
        id: generateNodeId('switch'),
        type: 'switch',
        position: { x: baseX - 100, y: baseY + 100 },
        data: { label: 'Clock', state: false },
      },
      // 4 D flip-flops (represented as individual components)
      ...Array.from({ length: 4 }, (_, i) => ({
        id: generateNodeId('led'),
        type: 'led',
        position: { x: baseX + (i * 100), y: baseY - 50 },
        data: { label: `Q${i}`, state: false },
      })),
      // Shift register visualization
      {
        id: generateNodeId('binaryDisplay'),
        type: 'binaryDisplay',
        position: { x: baseX + 200, y: baseY + 50 },
        data: { label: 'Shift Register', bitWidth: 4 },
      },
      // Output LED array
      {
        id: generateNodeId('multiLED'),
        type: 'multiLED',
        position: { x: baseX + 200, y: baseY + 150 },
        data: { label: '4-bit Output', ledCount: 4 },
      }
    ];

    setNodes(prevNodes => [...prevNodes, ...newNodes]);
    setEdges(prevEdges => [...prevEdges]);
  }, [setNodes, setEdges]);

  // Priority Encoder Circuit
  const addPriorityEncoder = useCallback(() => {
    const baseX = 250;
    const baseY = 200;
    const newNodes = [
      // 8 input switches (I0-I7)
      ...Array.from({ length: 8 }, (_, i) => ({
        id: generateNodeId('switch'),
        type: 'switch',
        position: { x: baseX - 150, y: baseY + (i * 40) },
        data: { label: `I${i}`, state: false },
      })),
      // Priority encoder component
      {
        id: generateNodeId('binaryEncoder'),
        type: 'binaryEncoder',
        position: { x: baseX + 50, y: baseY + 120 },
        data: { label: 'Priority Encoder', inputSize: 8 },
      },
      // Output LEDs (3-bit binary output)
      ...Array.from({ length: 3 }, (_, i) => ({
        id: generateNodeId('led'),
        type: 'led',
        position: { x: baseX + 250, y: baseY + 100 + (i * 40) },
        data: { label: `Y${2 - i}`, state: false },
      })),
      // Valid output LED
      {
        id: generateNodeId('led'),
        type: 'led',
        position: { x: baseX + 250, y: baseY + 240 },
        data: { label: 'Valid', state: false },
      }
    ];

    const newEdges = [
      // Connect inputs to encoder
      ...Array.from({ length: 8 }, (_, i) => ({
        id: generateEdgeId(newNodes[i].id, newNodes[8].id, 'out', `in${i}`),
        source: newNodes[i].id,
        target: newNodes[8].id,
        sourceHandle: 'out',
        targetHandle: `in${i}`
      })),
      // Connect encoder outputs to LEDs
      ...Array.from({ length: 3 }, (_, i) => ({
        id: generateEdgeId(newNodes[8].id, newNodes[9 + i].id, `out${i}`, 'in'),
        source: newNodes[8].id,
        target: newNodes[9 + i].id,
        sourceHandle: `out${i}`,
        targetHandle: 'in'
      })),
      // Connect valid output
      {
        id: generateEdgeId(newNodes[8].id, newNodes[12].id, 'valid', 'in'),
        source: newNodes[8].id,
        target: newNodes[12].id,
        sourceHandle: 'valid',
        targetHandle: 'in'
      }
    ];

    setNodes(prevNodes => [...prevNodes, ...newNodes]);
    setEdges(prevEdges => [...prevEdges, ...newEdges]);
  }, [setNodes, setEdges]);



  // Demultiplexer Circuit
  const addDemultiplexer = useCallback(() => {
    const baseX = 300;
    const baseY = 200;
    const newNodes = [
      // Data input
      {
        id: generateNodeId('switch'),
        type: 'switch',
        position: { x: baseX - 200, y: baseY },
        data: { label: 'Data In', state: false },
      },
      // Select inputs (2-bit for 1:4 demux)
      {
        id: generateNodeId('switch'),
        type: 'switch',
        position: { x: baseX - 100, y: baseY + 100 },
        data: { label: 'S1', state: false },
      },
      {
        id: generateNodeId('switch'),
        type: 'switch',
        position: { x: baseX - 50, y: baseY + 100 },
        data: { label: 'S0', state: false },
      },
      // Enable input
      {
        id: generateNodeId('switch'),
        type: 'switch',
        position: { x: baseX - 200, y: baseY + 100 },
        data: { label: 'Enable', state: true },
      },
      // Demux logic using decoder + AND gates (simplified representation)
      {
        id: generateNodeId('binaryDecoder'),
        type: 'binaryDecoder',
        position: { x: baseX, y: baseY + 50 },
        data: { label: '2:4 Decoder', inputBits: 2 },
      },
      // 4 output LEDs
      ...Array.from({ length: 4 }, (_, i) => ({
        id: generateNodeId('led'),
        type: 'led',
        position: { x: baseX + 200, y: baseY + (i * 40) },
        data: { label: `Y${i}`, state: false },
      })),
      // AND gates for demux outputs (simplified)
      ...Array.from({ length: 4 }, (_, i) => ({
        id: generateNodeId('andGate'),
        type: 'andGate',
        position: { x: baseX + 100, y: baseY + (i * 40) },
        data: { label: `AND${i}` },
      }))
    ];

    const newEdges = [
      // Connect select inputs to decoder
      { id: generateEdgeId(newNodes[1].id, newNodes[4].id, 'out', 'in1'), source: newNodes[1].id, target: newNodes[4].id, sourceHandle: 'out', targetHandle: 'in1' },
      { id: generateEdgeId(newNodes[2].id, newNodes[4].id, 'out', 'in0'), source: newNodes[2].id, target: newNodes[4].id, sourceHandle: 'out', targetHandle: 'in0' },
      // Connect enable to decoder
      { id: generateEdgeId(newNodes[3].id, newNodes[4].id, 'out', 'enable'), source: newNodes[3].id, target: newNodes[4].id, sourceHandle: 'out', targetHandle: 'enable' },
      // Connect data input to all AND gates
      ...Array.from({ length: 4 }, (_, i) => ({
        id: generateEdgeId(newNodes[0].id, newNodes[9 + i].id, 'out', 'in1'),
        source: newNodes[0].id,
        target: newNodes[9 + i].id,
        sourceHandle: 'out',
        targetHandle: 'in1'
      })),
      // Connect decoder outputs to AND gates
      ...Array.from({ length: 4 }, (_, i) => ({
        id: generateEdgeId(newNodes[4].id, newNodes[9 + i].id, `out${i}`, 'in2'),
        source: newNodes[4].id,
        target: newNodes[9 + i].id,
        sourceHandle: `out${i}`,
        targetHandle: 'in2'
      })),
      // Connect AND gates to output LEDs
      ...Array.from({ length: 4 }, (_, i) => ({
        id: generateEdgeId(newNodes[9 + i].id, newNodes[5 + i].id, 'out', 'in'),
        source: newNodes[9 + i].id,
        target: newNodes[5 + i].id,
        sourceHandle: 'out',
        targetHandle: 'in'
      }))
    ];

    setNodes(prevNodes => [...prevNodes, ...newNodes]);
    setEdges(prevEdges => [...prevEdges, ...newEdges]);
  }, [setNodes, setEdges]);





  // Add this function inside your App component:
  const onNodeDelete = useCallback((nodesToDelete) => {
    // Filter out the nodes to be deleted
    setNodes((nds) => nds.filter(node => !nodesToDelete.includes(node.id)));

    // Filter out any edges connected to the deleted nodes
    setEdges((eds) => eds.filter(edge =>
      !nodesToDelete.includes(edge.source) && !nodesToDelete.includes(edge.target)
    ));
  }, [setNodes, setEdges]);

  // Add this function inside your App component:

  const testSwitchToggle = useCallback((switchId) => {
    console.log(`Testing toggle for switch: ${switchId}`);

    setNodes(prevNodes => {
      const newNodes = prevNodes.map(node => {
        if (node.id === switchId && node.type === 'switch') {
          const newState = !node.data.state;
          console.log(`Manual toggle: ${node.id} from ${node.data.state} to ${newState}`);
          return {
            ...node,
            data: {
              ...node.data,
              state: newState
            }
          };
        }
        return node;
      });

      console.log("Nodes after manual toggle:", newNodes);
      return newNodes;
    });
  }, [setNodes]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Delete' && selectedNodes.length > 0) {
        onNodeDelete(selectedNodes);
        setSelectedNodes([]);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedNodes, onNodeDelete]);
  // Node click handler with selection functionality
  const onNodeClick = useCallback((event, node) => {
    if (node.type === 'switch') {
      console.log(`Switch clicked: ${node.id}, current state: ${node.data.state}`);

      // Create a new state with the toggled switch
      setNodes(prevNodes => {
        const newNodes = prevNodes.map(n => {
          if (n.id === node.id) {
            const newState = !n.data.state;
            console.log(`Toggling switch ${n.id} from ${n.data.state} to ${newState}`);
            return {
              ...n,
              data: {
                ...n.data,
                state: newState
              }
            };
          }
          return n;
        });

        // Evaluate circuit immediately with the new nodes
        setTimeout(() => {
          console.log("Evaluating circuit after switch toggle");
          // Create an inline evaluation to use the new nodes state
          evaluateCircuitWithNodes(newNodes);
        }, 10);

        return newNodes;
      });

    } else {
      // Handle selection for other node types
      setSelectedNodes(prev => {
        if (event.ctrlKey || event.metaKey) {
          if (prev.includes(node.id)) {
            return prev.filter(id => id !== node.id);
          } else {
            return [...prev, node.id];
          }
        } else {
          return [node.id];
        }
      });
    }
  }, [setNodes, setSelectedNodes, evaluateCircuitWithNodes]);

  // Save circuit to localStorage
  const saveCircuit = useCallback(() => {
    const circuit = { nodes, edges };
    localStorage.setItem('logicCircuit', JSON.stringify(circuit));
    alert('Circuit saved!');
  }, [nodes, edges]);

  // Load circuit from localStorage
  const loadCircuit = useCallback(() => {
    const saved = localStorage.getItem('logicCircuit');
    if (saved) {
      try {
        const circuit = JSON.parse(saved);
        setNodes(circuit.nodes || []);
        setEdges(circuit.edges || []);
      } catch (err) {
        console.error('Failed to load circuit:', err);
        alert('Failed to load circuit: ' + err.message);
      }
    } else {
      alert('No saved circuit found');
    }
  }, [setNodes, setEdges]);

  // Clear the workspace
  const clearCircuit = useCallback(() => {
    if (window.confirm('Are you sure you want to clear the workspace?')) {
      setNodes([]);
      setEdges([]);
    }
  }, [setNodes, setEdges]);
  // Export circuit with sharing functionality
  const exportCircuit = useCallback(() => {
    setSharingPanelVisible(true);
  }, []);

  // Import circuit from file or URL data
  const importCircuit = useCallback((importData) => {
    // Determine if it's a full challenge or just a circuit
    let circuitData = importData;
    let challengeData = null;

    if (importData && importData.circuit && importData.targetBehavior) {
      // It's a Challenge Object
      circuitData = importData.circuit;
      challengeData = importData;
    } else if (importData && importData.nodes) {
      // It's a raw circuit
      circuitData = importData;
    } else {
      console.error('Invalid import data format');
      return;
    }

    if (!circuitData || !circuitData.nodes || !circuitData.edges) {
      console.error('Invalid circuit data format');
      return;
    }

    try {
      setNodes(circuitData.nodes || []);
      setEdges(circuitData.edges || []);

      // Update logic handles that may exist in old format
      setTimeout(() => {
        evaluateCircuitWithNodes(circuitData.nodes);
      }, 100);

      // Show success notification
      if (challengeData) {
        setActiveChallenge(challengeData);
        setNotification({
          message: `Challenge "${challengeData.name}" loaded! Check the panel on the right.`,
          type: 'success',
          show: true
        });
      } else {
        setActiveChallenge(null); // Clear challenge if loading a plain circuit
        setNotification({
          message: 'Circuit imported successfully!',
          type: 'success',
          show: true
        });
      }
    } catch (error) {
      console.error('Failed to import circuit:', error);
      setNotification({
        message: 'Failed to import circuit: ' + error.message,
        type: 'error',
        show: true
      });
    }
  }, [setNodes, setEdges, evaluateCircuitWithNodes]);

  // Toggle sidebar visibility
  const toggleSidebar = useCallback(() => {
    setSidebarVisible(prev => !prev);
  }, []);

  // Add the missing functions
  const openTeacherDashboard = useCallback(() => {
    setTeacherDashboardVisible(true);
  }, []);

  const closeTeacherDashboard = useCallback(() => {
    setTeacherDashboardVisible(false);
  }, []);

  // Add this function to handle node hover
  const onNodeMouseEnter = useCallback((event, node) => {
    if (node.type.includes('Gate')) {
      // Only show tooltips for gate components
      const rect = event.target.getBoundingClientRect();
      setTooltipInfo({
        nodeType: node.type,
        position: {
          x: rect.left,
          y: rect.top
        }
      });
    }
  }, []);

  const onNodeMouseLeave = useCallback(() => {
    // Use a timeout to prevent the tooltip from disappearing 
    // when moving from the node to the tooltip itself
    setTimeout(() => {
      setTooltipInfo(prev => {
        if (prev && !document.querySelector('.gate-tooltip:hover')) {
          return null;
        }
        return prev;
      });
    }, 100);
  }, []);

  // Add this effect for handling the resize functionality
  useEffect(() => {
    const handleMouseDown = (e) => {
      if (e.target.className === 'sidebar-resizer') {
        resizingRef.current = true;
        document.body.style.cursor = 'ew-resize';
        document.body.style.userSelect = 'none';
      }
    };

    const handleMouseMove = (e) => {
      if (!resizingRef.current) return;

      // Calculate new width (minimum 200px, maximum 500px)
      const newWidth = Math.max(200, Math.min(500, e.clientX));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      if (resizingRef.current) {
        resizingRef.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);
  // Debug useEffect for circuit visualization (only in development)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log("Current nodes:", nodes.length);
      console.log("Current edges:", edges.length);

      // Check visibility of React Flow container with error handling
      const checkReactFlowContainer = () => {
        const reactFlowContainer = document.querySelector('.react-flow');
        if (reactFlowContainer) {
          console.log("ReactFlow container found and visible");
        }
      };

      // Only run after a delay to ensure DOM is ready
      setTimeout(checkReactFlowContainer, 2000);
    }
  }, [nodes, edges]);

  // Add this function inside your App component to handle edge styling with animation states

  // const getEdgeStyle = useCallback((edge) => {
  //   // Default style
  //   const style = {
  //     strokeWidth: 2,
  //     stroke: 'var(--edge-color)',
  //   };
  //   
  //   // Apply signal state styling from our animation manager
  //   const edgeAnimation = signalAnimationManager.edgeAnimations.get(edge.id);
  //   if (edgeAnimation) {
  //     if (edgeAnimation.state === true) {
  //       style.stroke = 'var(--success-color)';
  //       style.strokeWidth = 3;
  //     }
  //   }
  //   
  //   return style;
  // }, []);

  // Add this function to your App component to render a debug button:

  const renderDebugButton = () => {
    return (
      <div className="sidebar-section">
        <h3>Debug Tools</h3>
        <button
          className="debug-btn"
          onClick={() => {
            const switches = nodes.filter(n => n.type === 'switch');
            console.table(switches.map(s => ({
              id: s.id,
              label: s.data.label,
              state: s.data.state
            })));

            // Test manual toggle
            if (switches.length > 0) {
              testSwitchToggle(switches[0].id);
            }
          }}
        >
          Test Switch Toggle
        </button>

        <button
          className="debug-btn"
          onClick={() => {
            console.log("Manual circuit evaluation");
            evaluateCircuit();
          }}
        >
          Evaluate Circuit
        </button>
      </div>
    );
  };

  // Add this useEffect to monitor switch states:
  useEffect(() => {
    // Log switch states whenever they change
    const switches = nodes.filter(n => n.type === 'switch');
    if (switches.length > 0) {
      console.log("Current switch states:",
        switches.map(s => ({
          id: s.id,
          label: s.data.label,
          state: s.data.state
        }))
      );
    }
  }, [nodes]);

  // useEffect for monitoring circuit changes and showing real-world examples
  useEffect(() => {
    // Don't show examples too frequently
    const lastPopupTime = localStorage.getItem('lastRealWorldPopupTime');
    const now = Date.now();

    if (lastPopupTime && (now - parseInt(lastPopupTime)) < 60000) {
      // Don't show a popup if less than a minute has passed since the last one
      return;
    }

    // Only show examples when we have enough nodes to form an interesting circuit
    if (nodes.length >= 3 && edges.length >= 2) {
      const example = analyzeCircuitForRealWorldExample(nodes, edges);

      if (example) {
        showRealWorldExample(example.message);
        localStorage.setItem('lastRealWorldPopupTime', now.toString());
      }
    }
  }, [nodes, edges, showRealWorldExample]);

  // Check for circuit data in URL parameters on initial load
  useEffect(() => {
    const circuitFromUrl = importCircuitFromUrl();
    if (circuitFromUrl) {
      importCircuit(circuitFromUrl);
    }
  }, [importCircuit]);

  return (
    <div className="app-container">
      <AppHeader
        toggleSidebar={toggleSidebar}
        sidebarVisible={sidebarVisible}
        saveCircuit={saveCircuit}
        loadCircuit={loadCircuit}
        clearCircuit={clearCircuit}
        exportCircuit={exportCircuit}
        openTeacherDashboard={openTeacherDashboard}
        openStudentDashboard={() => setStudentDashboardVisible(true)}
        userRole={userRole}
        onLogout={logout}
      />

      <div className="main-content">
        {sidebarVisible && (
          <div className="sidebar" ref={sidebarRef} style={{ width: `${sidebarWidth}px` }}>
            <div className="sidebar-section">
              <h3>
                <GateIcon /> Logic Gates
              </h3>
              <div className="gates-container">
                <button onClick={() => addNode('and')} className="gate-btn">
                  <div className="gate-icon">
                    <svg viewBox="0 0 100 60" width="100%" height="100%">
                      <g fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 10 L60 10 Q80 10 80 30 Q80 50 60 50 L20 50 Z" />
                      </g>
                    </svg>
                  </div>
                  AND
                </button>
                <button onClick={() => addNode('or')} className="gate-btn">
                  <div className="gate-icon">
                    <svg viewBox="0 0 100 60" width="100%" height="100%">
                      <g fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 10 Q40 10 60 30 Q40 50 20 50 Q40 30 20 10 Z" />
                      </g>
                    </svg>
                  </div>
                  OR
                </button>
                <button onClick={() => addNode('not')} className="gate-btn">
                  <div className="gate-icon">
                    <svg viewBox="0 0 100 60" width="100%" height="100%">
                      <g fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 10 L70 30 L20 50 Z" />
                        <circle cx="80" cy="30" r="10" />
                      </g>
                    </svg>
                  </div>
                  NOT
                </button>
                <button onClick={() => addNode('xor')} className="gate-btn">
                  <div className="gate-icon">
                    <svg viewBox="0 0 100 60" width="100%" height="100%">
                      <g fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 10 Q30 30 15 50" />
                        <path d="M20 10 Q40 10 60 30 Q40 50 20 50 Q40 30 20 10 Z" />
                      </g>
                    </svg>
                  </div>
                  XOR
                </button>
                <button onClick={() => addNode('nand')} className="gate-btn">
                  <div className="gate-icon">                    <svg viewBox="0 0 100 60" width="100%" height="100%">
                    <g fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 10 L60 10 Q80 10 80 30 Q80 50 60 50 L20 50 Z" />
                      <circle cx="90" cy="30" r="10" />
                    </g>
                  </svg>
                  </div>
                  NAND
                </button>
                <button onClick={() => addNode('nor')} className="gate-btn">
                  <div className="gate-icon">
                    <svg viewBox="0 0 100 60" width="100%" height="100%">
                      <g fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 10 Q40 10 60 30 Q40 50 20 50 Q40 30 20 10 Z" />
                        <circle cx="70" cy="30" r="10" />
                      </g>
                    </svg>
                  </div>
                  NOR
                </button>
                <button onClick={() => addNode('switch')} className="gate-btn">
                  <div className="gate-icon">
                    <svg viewBox="0 0 100 60" width="100%" height="100%">
                      <rect x="20" y="20" width="60" height="20" rx="10" fill="none" stroke="currentColor" strokeWidth="2" />
                      <circle cx="65" cy="30" r="8" fill="currentColor" />
                    </svg>
                  </div>
                  Switch
                </button>
                <button onClick={() => addNode('led')} className="gate-btn">
                  <div className="gate-icon">
                    <svg viewBox="0 0 100 60" width="100%" height="100%">
                      <circle cx="50" cy="30" r="20" fill="none" stroke="currentColor" strokeWidth="2" />
                      <circle cx="50" cy="30" r="14" fill="currentColor" fillOpacity="0.3" />
                    </svg>
                  </div>
                  LED
                </button>
                <button onClick={addHalfAdder} className="advanced-btn">Add Half Adder</button>
                <button onClick={addFullAdder} className="advanced-btn">Add Full Adder</button>
                <button onClick={add4BitAdder} className="advanced-btn">Add 4-Bit Adder</button>
                <button onClick={addBinaryClockCircuit} className="advanced-btn">Add Binary Clock</button>

              </div>
            </div>
            <div className="sidebar-section">
              <h3>
                🔢 Binary Components
              </h3>
              <div className="gates-container">
                <button onClick={() => addNode('halfAdder')} className="gate-btn">
                  <div className="gate-icon">HA</div>
                  Half Adder
                </button>
                <button onClick={() => addNode('fullAdder')} className="gate-btn">
                  <div className="gate-icon">FA</div>
                  Full Adder
                </button>

                <button onClick={() => addNode('binaryClock')} className="gate-btn">
                  <div className="gate-icon">🕐</div>
                  Binary Clock
                </button>

                <button onClick={() => addNode('binaryComparator')} className="gate-btn">
                  <div className="gate-icon">⚖️</div>
                  Comparator
                </button>
                <button onClick={() => addNode('binaryEncoder')} className="gate-btn">
                  <div className="gate-icon">📤</div>
                  Encoder
                </button>
                <button onClick={() => addNode('binaryDecoder')} className="gate-btn">
                  <div className="gate-icon">📥</div>
                  Decoder
                </button>                <button onClick={() => addNode('multiplexer')} className="gate-btn">
                  <div className="gate-icon">🔀</div>
                  Multiplexer
                </button>
              </div>
            </div>

            <div className="sidebar-section">
              <h3>
                📚 Examples
              </h3>            <div className="gates-container">

                <button onClick={addSRLatch} className="example-btn">
                  <div className="gate-icon">🔒</div>
                  SR Latch
                </button>
                <button onClick={addDFlipFlop} className="example-btn">
                  <div className="gate-icon">🔄</div>
                  D Flip-Flop
                </button>
                <button onClick={add4BitShiftRegister} className="example-btn">
                  <div className="gate-icon">➡️</div>
                  4-bit Shift Register
                </button>

                <button onClick={addBinaryComparator} className="example-btn">
                  <div className="gate-icon">⚖️</div>
                  4-bit Comparator
                </button>
                <button onClick={addPriorityEncoder} className="example-btn">
                  <div className="gate-icon">🎯</div>
                  Priority Encoder
                </button>
                <button onClick={addDemultiplexer} className="example-btn">
                  <div className="gate-icon">🔀</div>
                  Demultiplexer
                </button>

              </div>
            </div>

            <div className="sidebar-section">
              <h3>
                <InfoIcon /> Circuit Info
              </h3>
              <div className="info-box">
                <div className="info-item">
                  <span>Components:</span>
                  <span className="info-value">{nodes.length}</span>
                </div>
                <div className="info-item">
                  <span>Connections:</span>
                  <span className="info-value">{edges.length}</span>
                </div>
                <div className="info-item">
                  <span>Switches On:</span>
                  <span className="info-value">{nodes.filter(n => n.type === 'switch' && n.data.state).length}</span>
                </div>
              </div>
            </div>

            <div className="control-buttons sidebar-section">
              <button
                onClick={() => selectedNodes.length > 0 && onNodeDelete(selectedNodes)}
                disabled={selectedNodes.length === 0}
                className="delete-btn"
              >
                <TrashIcon /> Delete Selected Components
              </button>
            </div>

            {/* Add Boolean Expression Panel */}
            <BooleanExpressionPanel
              key="boolean-panel"
              nodes={nodes}
              edges={edges}
            />
            {/* Add Truth Table Generator */}
            <TruthTableGenerator
              key="truth-table"
              nodes={nodes}
              edges={edges}
            />
            {/* Add Binary Calculator Panel */}
            <BinaryCalculatorPanel
              key="binary-calculator"
              nodes={nodes}
              edges={edges}
              onAddPrebuiltCircuit={(circuitType, options) => {
                switch (circuitType) {
                  case 'halfAdder':
                    addHalfAdder();
                    break;
                  case 'fullAdder':
                    addFullAdder();
                    break;
                  case '4bitAdder':
                    add4BitAdder();
                    break;
                  case 'binaryClock':
                    addBinaryClockCircuit();
                    break;

                  case 'binaryComparator':
                    addBinaryComparator();
                    break;
                  case 'binaryEncoder':
                    addBinaryEncoder();
                    break;
                  case 'binaryDecoder':
                    addBinaryDecoder();
                    break;
                  case 'multiplexer':
                    addMultiplexer();
                    break;
                  default:
                    console.log('Unknown circuit type:', circuitType);
                }
              }}
            />

            {/* Add Explanation Panel */}
            <div className="sidebar-section">
              <ExplanationPanel
                nodes={nodes}
                edges={edges}
                circuit={{}}
              />
            </div>

            {/* Add before the sidebar-resizer div */}
            {renderDebugButton()}

            <div className="sidebar-resizer"></div>
          </div>
        )}

        <div className="flow-container">
          <ReactFlow
            nodes={nodes.map(node => ({
              ...node,
              className: selectedNodes.includes(node.id) ? 'selected' : ''
            }))}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodeClick={onNodeClick}
            onNodeMouseEnter={onNodeMouseEnter}
            onNodeMouseLeave={onNodeMouseLeave}
            fitView
            defaultEdgeOptions={{
              type: 'smoothstep',
              animated: false,
              style: { stroke: 'var(--edge-color)', strokeWidth: 2 }
            }}
          >
            <Controls />
            <MiniMap />
            <Background
              variant="dots"
              gap={gridSize}
              size={1}
              color="var(--grid-color)"
              style={{ opacity: 1 }}
            />
            <Panel position="top-right" className="flow-panel">
              <div className="flow-controls">
                <button onClick={saveCircuit} className="flow-btn" title="Save Circuit">
                  <SaveIcon />
                </button>
                <button onClick={loadCircuit} className="flow-btn" title="Load Circuit">
                  <LoadIcon />
                </button>
                <button onClick={clearCircuit} className="flow-btn" title="Clear All">
                  <TrashIcon />
                </button>                <button onClick={exportCircuit} className="flow-btn share-btn" title="Export/Share Circuit">
                  <ShareIcon />
                </button>
              </div>
            </Panel>

            <Panel position="bottom-left" className="grid-panel">
              <GridSettings
                snapGrid={snapGrid}
                setSnapGrid={setSnapGrid}
                gridSize={gridSize}
                setGridSize={setGridSize}
              />
            </Panel>

            {/* Student Challenge Panel */}
            {activeChallenge && (
              <Panel position="top-right" className="student-panel-wrapper" style={{ marginTop: '60px', marginRight: '10px' }}>
                <StudentChallengePanel
                  challenge={activeChallenge}
                  nodes={nodes}
                  edges={edges}
                  onComplete={(points) => {
                    setChallengePoints(prev => prev + points);
                    setNotification({
                      message: `Challenge Complete! You earned ${points} points!`,
                      type: 'success',
                      show: true
                    });
                  }}
                />
              </Panel>
            )}
          </ReactFlow>
        </div>
      </div>

      {tooltipInfo && (
        <GateTooltip
          nodeType={tooltipInfo.nodeType}
          position={tooltipInfo.position}
          onClose={() => setTooltipInfo(null)}
        />
      )}

      {/* Add RealWorldPopup component */}
      <RealWorldPopup
        message={realWorldPopup.message}
        isVisible={realWorldPopup.visible}
        onClose={hideRealWorldExample}
      />

      {/* Notification component */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          <span>{notification.message}</span>
          <button
            className="close-notification"
            onClick={() => setNotification(prev => ({ ...prev, show: false }))}
          >
            ×
          </button>
        </div>
      )}

      {/* Circuit Sharing Panel */}
      {sharingPanelVisible && (
        <CircuitSharingPanel
          circuit={{ nodes, edges }}
          onImport={importCircuit}
          onClose={() => setSharingPanelVisible(false)}
        />
      )}

      {/* Teacher Dashboard Panel */}
      <TeacherDashboard
        isOpen={teacherDashboardVisible}
        onClose={closeTeacherDashboard}
        currentCircuit={{ nodes, edges }}
        onImportCircuit={importCircuit}
      />

      {/* Student Dashboard Panel */}
      <StudentDashboard
        isOpen={studentDashboardVisible}
        onClose={() => setStudentDashboardVisible(false)}
        onImportCircuit={importCircuit}
      />
    </div>
  );
}

export default Simulator;