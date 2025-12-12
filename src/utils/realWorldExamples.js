/**
 * Utility to analyze circuits and provide real-world examples
 */

// Circuit patterns that map to real-world examples
const REAL_WORLD_PATTERNS = {
  // Basic gate patterns
  AND_GATE: {
    message: "AND gates are used in security systems where multiple conditions must be true - like a door being closed AND the correct code entered.",
    conditions: (nodes, edges) => hasGateType(nodes, 'andGate') && nodes.length < 5
  },
  OR_GATE: {
    message: "OR gates are used in alarm systems to trigger when any sensor is activated, like motion OR window OR door sensors.",
    conditions: (nodes, edges) => hasGateType(nodes, 'orGate') && nodes.length < 5
  },
  NOT_GATE: {
    message: "NOT gates (inverters) are used in real systems to detect when something is missing or a condition fails, like a smoke detector alerting when clean air is NOT detected.",
    conditions: (nodes, edges) => hasGateType(nodes, 'notGate') && nodes.length < 4
  },
  
  // More complex patterns
  VOTING_SYSTEM: {
    message: "Your circuit resembles a voting system where multiple inputs are combined to make a single decision, similar to how electronic voting machines work.",
    conditions: (nodes, edges) => 
      nodes.filter(n => n.type === 'switch').length >= 3 && 
      (hasGateType(nodes, 'andGate') || hasGateType(nodes, 'orGate'))
  },
  ALARM_SYSTEM: {
    message: "This circuit behaves like a real alarm system where different sensors trigger alerts, used in home security systems and fire alarms.",
    conditions: (nodes, edges) => 
      hasGateType(nodes, 'orGate') && 
      nodes.filter(n => n.type === 'switch').length >= 2 && 
      (nodes.filter(n => n.type === 'led').length > 0 || nodes.filter(n => n.type === 'multiLED').length > 0)
  },
  DOOR_LOCK: {
    message: "Your circuit resembles an electronic door lock system that requires specific conditions to be met before unlocking, used in secure facilities.",
    conditions: (nodes, edges) => 
      hasGateType(nodes, 'andGate') && 
      nodes.filter(n => n.type === 'switch').length >= 2 &&
      nodes.filter(n => n.type === 'led').length > 0
  },
  ENCODER_SYSTEM: {
    message: "This encoder circuit is similar to systems used in computer keyboards and input devices to convert multiple button presses into digital codes.",
    conditions: (nodes, edges) => hasGateType(nodes, 'binaryEncoder')
  },
  DECODER_SYSTEM: {
    message: "Decoders like this are used in memory addressing in computers, converting binary addresses to select specific memory locations.",
    conditions: (nodes, edges) => hasGateType(nodes, 'binaryDecoder')
  },
  COMPARATOR_SYSTEM: {
    message: "Binary comparators are used in real-world temperature control systems and sorting machines to make equality or greater/less than decisions.",
    conditions: (nodes, edges) => hasGateType(nodes, 'binaryComparator')
  },
  MULTIPLEXER_SYSTEM: {
    message: "Multiplexers are used in telecommunication systems to combine multiple signals into one channel, like how cable TV delivers many channels over one wire.",
    conditions: (nodes, edges) => hasGateType(nodes, 'multiplexer')
  },
  ADDER_CIRCUIT: {
    message: "This adder circuit is the fundamental building block of arithmetic units in CPUs, performing all the calculations in your computer.",
    conditions: (nodes, edges) => 
      hasGateType(nodes, 'halfAdder') || hasGateType(nodes, 'fullAdder')
  },
  DISPLAY_CIRCUIT: {
    message: "This display circuit is similar to those used in digital scoreboard systems and numerical displays in electronics.",
    conditions: (nodes, edges) => hasGateType(nodes, 'binaryDisplay')
  }
};

// Helper function to check if nodes contain a specific gate type
function hasGateType(nodes, gateType) {
  return nodes.some(node => node.type === gateType);
}

/**
 * Analyzes the current circuit and returns real-world examples
 * @param {Array} nodes - Circuit nodes
 * @param {Array} edges - Circuit edges
 * @returns {Array} - Applicable real-world example messages
 */
export function analyzeCircuitForRealWorldExamples(nodes, edges) {
  const examples = [];
  
  // Check each pattern against the current circuit
  Object.entries(REAL_WORLD_PATTERNS).forEach(([patternName, pattern]) => {
    if (pattern.conditions(nodes, edges)) {
      examples.push({
        type: patternName,
        message: pattern.message
      });
    }
  });
  
  return examples;
}

/**
 * Analyze a circuit and return relevant real-world examples
 * @param {Array} nodes - Array of circuit nodes
 * @param {Array} edges - Array of circuit edges
 * @returns {Object|null} Real-world example object or null if none found
 */
export function analyzeCircuitForRealWorldExample(nodes, edges) {
  if (!nodes || nodes.length === 0) {
    return null;
  }

  // Count different types of components
  const componentCounts = nodes.reduce((counts, node) => {
    const type = node.type;
    counts[type] = (counts[type] || 0) + 1;
    return counts;
  }, {});

  // Analyze circuit patterns
  
  // Check for binary clock pattern
  if (componentCounts.binaryClock >= 1) {
    return realWorldExamples.binaryClock;
  }

  // Check for adder patterns
  if (componentCounts.fullAdder >= 1) {
    return realWorldExamples.fullAdder;
  }
  
  if (componentCounts.halfAdder >= 1) {
    return realWorldExamples.halfAdder;
  }

  // Check for complex components
  if (componentCounts.multiplexer >= 1) {
    return realWorldExamples.multiplexer;
  }

  if (componentCounts.binaryDisplay >= 1 || componentCounts.multiLED >= 1) {
    return realWorldExamples.binaryDisplay;
  }

  if (componentCounts.binaryDecoder >= 1) {
    return realWorldExamples.decoder;
  }

  if (componentCounts.binaryEncoder >= 1) {
    return realWorldExamples.encoder;
  }

  // Check for basic gate patterns
  const totalGates = (componentCounts.andGate || 0) + 
                    (componentCounts.orGate || 0) + 
                    (componentCounts.notGate || 0) + 
                    (componentCounts.xorGate || 0) + 
                    (componentCounts.nandGate || 0) + 
                    (componentCounts.norGate || 0);

  // Multi-gate circuits
  if (totalGates >= 3) {
    // Complex logic - look for dominant gate type
    const dominantGate = Object.entries(componentCounts)
      .filter(([type]) => type.includes('Gate'))
      .sort(([,a], [,b]) => b - a)[0];
    
    if (dominantGate && realWorldExamples[dominantGate[0]]) {
      return realWorldExamples[dominantGate[0]];
    }
  }

  // Single gate circuits
  if (componentCounts.andGate >= 1) {
    return realWorldExamples.andGate;
  }
  
  if (componentCounts.orGate >= 1) {
    return realWorldExamples.orGate;
  }
  
  if (componentCounts.notGate >= 1) {
    return realWorldExamples.notGate;
  }
  
  if (componentCounts.xorGate >= 1) {
    return realWorldExamples.xorGate;
  }
  
  if (componentCounts.nandGate >= 1) {
    return realWorldExamples.nandGate;
  }
  
  if (componentCounts.norGate >= 1) {
    return realWorldExamples.norGate;
  }

  // Default fallback
  return null;
}

/**
 * Gets a single random example from all applicable examples
 * @param {Array} nodes - Circuit nodes
 * @param {Array} edges - Circuit edges
 * @returns {Object|null} - A real-world example or null if none apply
 */
export function getRandomRealWorldExample(nodes, edges) {
  const examples = analyzeCircuitForRealWorldExamples(nodes, edges);
  
  if (examples.length === 0) {
    return null;
  }
  
  // Return a random example from the applicable ones
  const randomIndex = Math.floor(Math.random() * examples.length);
  return examples[randomIndex];
}

// Real-world examples database
const realWorldExamples = {
  // Basic logic gates
  andGate: {
    title: "Security Systems",
    description: "AND gates are used in security systems where multiple conditions must be met (keycard AND PIN) to grant access.",
    icon: "🔒"
  },
  orGate: {
    title: "Emergency Systems", 
    description: "OR gates activate emergency lighting when ANY smoke detector OR manual alarm is triggered.",
    icon: "🚨"
  },
  notGate: {
    title: "Automatic Lighting",
    description: "NOT gates turn on street lights when it's NOT daytime (inverting daylight sensor input).",
    icon: "💡"
  },
  xorGate: {
    title: "Two-Way Switches",
    description: "XOR gates control hallway lights that can be turned on/off from either end of the hallway.",
    icon: "💡"
  },
  nandGate: {
    title: "Computer Memory",
    description: "NAND gates are the building blocks of computer memory and processors due to their universal logic properties.",
    icon: "💾"
  },
  norGate: {
    title: "Industrial Safety",
    description: "NOR gates ensure machines stop when ANY safety condition fails (emergency stop OR door open OR guard removed).",
    icon: "⚠️"
  },

  // Complex circuits
  halfAdder: {
    title: "Calculator Circuits",
    description: "Half adders are fundamental building blocks in calculators and computers for binary arithmetic operations.",
    icon: "🧮"
  },
  fullAdder: {
    title: "CPU Arithmetic Unit",
    description: "Full adders chain together to create the arithmetic logic unit (ALU) in computer processors.",
    icon: "🖥️"
  },
  binaryClock: {
    title: "Digital Clocks",
    description: "Binary clocks demonstrate how time is stored and displayed in digital systems using binary representation.",
    icon: "⏰"
  },
  multiplexer: {
    title: "Data Routing",
    description: "Multiplexers route data in computer networks and select which input signal gets transmitted.",
    icon: "🌐"
  },
  binaryDisplay: {
    title: "Digital Displays",
    description: "Binary displays show how numbers are represented internally in computers and digital devices.",
    icon: "📟"
  },
  decoder: {
    title: "Address Decoding",
    description: "Decoders select specific memory locations in computer RAM based on binary address inputs.",
    icon: "🎯"
  },
  encoder: {
    title: "Keyboard Input",
    description: "Encoders convert keyboard presses into binary codes that computers can understand and process.",
    icon: "⌨️"
  }
};

/**
 * Get all available real-world examples
 * @returns {Object} All real-world examples
 */
export function getAllRealWorldExamples() {
  return realWorldExamples;
}

/**
 * Get a specific real-world example by key
 * @param {string} key - The example key
 * @returns {Object|null} The example object or null if not found
 */
export function getRealWorldExample(key) {
  return realWorldExamples[key] || null;
}

export default realWorldExamples;
