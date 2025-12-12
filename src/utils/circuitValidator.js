
/**
 * Utility functions for validating logic circuits
 */

// Generate all possible combinations of inputs
export const generateCombinations = (switches) => {
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
};

// Evaluate the circuit for a specific input combination
export const evaluateCircuitState = (nodes, edges, inputValues) => {
    const nodeMap = {};
    const nodeOutputs = {};

    // Set all switch values
    nodes.forEach(node => {
        nodeMap[node.id] = node;
        if (node.type === 'switch') {
            nodeOutputs[node.id] = inputValues[node.id] || false;
        }
    });

    // Process nodes in topological order (simplified loop with max iterations)
    let changed = true;
    let iterations = 0;
    const maxIterations = 20; // Increased for complex circuits

    while (changed && iterations < maxIterations) {
        changed = false;
        iterations++;

        nodes.forEach(node => {
            // Skip switches (their values are set directly)
            if (node.type === 'switch') return;

            // Get input values for this node
            const inputEdges = edges.filter(e => e.target === node.id);
            const inputValuesForNode = inputEdges.map(e => nodeOutputs[e.source] || false);

            // Default output
            let output = false;

            // Apply gate logic
            switch (node.type) {
                case 'andGate':
                    output = inputValuesForNode.length > 0 && inputValuesForNode.every(val => val === true);
                    break;
                case 'orGate':
                    output = inputValuesForNode.some(val => val === true);
                    break;
                case 'notGate':
                    // For NOT gate, use the first input (it should only have one)
                    output = inputValuesForNode.length > 0 ? !inputValuesForNode[0] : false; // Default to false if no input (effectively low input -> high output? No, floating input usually 0)
                    // Actually, disconnected NOT gate input is 0, so output is 1.
                    // Logic: "inputValuesForNode[0] || false" -> !0 = 1.
                    break;
                case 'xorGate':
                    output = inputValuesForNode.filter(val => val === true).length % 2 === 1;
                    break;
                case 'nandGate':
                    output = !(inputValuesForNode.length > 0 && inputValuesForNode.every(val => val === true));
                    break;
                case 'norGate':
                    output = !inputValuesForNode.some(val => val === true);
                    break;
                case 'led':
                    output = inputValuesForNode.length > 0 ? inputValuesForNode[0] : false;
                    break;
                case 'halfAdder':
                    if (inputValuesForNode.length >= 2) {
                        const A = inputValuesForNode[0] || false;
                        const B = inputValuesForNode[1] || false;
                        output = A !== B; // Sum
                        nodeOutputs[`${node.id}_carry`] = A && B;
                    }
                    break;
                case 'fullAdder':
                    if (inputValuesForNode.length >= 3) {
                        const A = inputValuesForNode[0] || false;
                        const B = inputValuesForNode[1] || false;
                        const Cin = inputValuesForNode[2] || false;
                        const sum = (A !== B) !== Cin;
                        const carry = (A && B) || (Cin && (A !== B));
                        output = sum;
                        nodeOutputs[`${node.id}_carry`] = carry;
                    }
                    break;
                // Pass-through components
                case 'binaryDisplay':
                case 'binaryClock':
                case 'multiLED':
                    output = inputValuesForNode.length > 0 ? inputValuesForNode[0] : false;
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

    // Collect final outputs
    const outputValues = {};

    // Include LEDs
    nodes.filter(n => n.type === 'led').forEach(led => {
        outputValues[led.id] = nodeOutputs[led.id] || false;
    });

    // Include binary components
    nodes.filter(n => ['halfAdder', 'fullAdder', 'binaryDisplay', 'multiLED'].includes(n.type)).forEach(component => {
        outputValues[component.id] = nodeOutputs[component.id] || false;
        if (['halfAdder', 'fullAdder'].includes(component.type) && nodeOutputs[`${component.id}_carry`] !== undefined) {
            outputValues[`${component.id}_carry`] = nodeOutputs[`${component.id}_carry`];
        }
    });

    return outputValues;
};

// Generate complete truth table for a circuit
export const generateTruthTable = (nodes, edges) => {
    const switches = nodes.filter(n => n.type === 'switch').sort((a, b) => a.data.label.localeCompare(b.data.label));
    const leds = nodes.filter(n => n.type === 'led').sort((a, b) => a.data.label.localeCompare(b.data.label));
    const binaryComponents = nodes.filter(n => ['halfAdder', 'fullAdder', 'binaryDisplay', 'multiLED'].includes(n.type));

    if (switches.length === 0) { //  || (leds.length === 0 && binaryComponents.length === 0) // Allow inputs only for partial designs? No, need outputs to compare.
        return { headers: [], rows: [] };
    }

    // Generate headers (Inputs then Outputs)
    // Important: We need a stable order for comparison. Sorting by label is good.
    const inputHeaders = switches.map(sw => ({ id: sw.id, label: sw.data.label, type: 'input' }));
    const outputHeaders = [
        ...leds.map(led => ({ id: led.id, label: led.data.label, type: 'output' })),
        ...binaryComponents.flatMap(comp => {
            const baseLabel = comp.data.label;
            if (['halfAdder', 'fullAdder'].includes(comp.type)) {
                return [
                    { id: comp.id, label: `${baseLabel}_Sum`, type: 'output', subType: 'sum' },
                    { id: `${comp.id}_carry`, label: `${baseLabel}_Carry`, type: 'output', subType: 'carry' }
                ];
            }
            return [{ id: comp.id, label: baseLabel, type: 'output' }];
        })
    ];

    const headers = [...inputHeaders, ...outputHeaders].map(h => h.label);

    // Generate rows
    const combinations = generateCombinations(switches);
    const rows = combinations.map(combination => {
        const evalResult = evaluateCircuitState(nodes, edges, combination);

        // Create cells array corresponding to headers
        const cells = [
            ...inputHeaders.map(h => combination[h.id] ? '1' : '0'),
            ...outputHeaders.map(h => {
                // Handle special carry outputs which keys might diff
                return evalResult[h.id] ? '1' : '0';
            })
        ];

        return cells; // Pure data array
    });

    return { headers, rows };
};

// Validate student circuit against target truth table
export const validateChallenge = (currentNodes, currentEdges, targetTruthTable) => {
    // Generate truth table for current circuit
    const currentTruthTable = generateTruthTable(currentNodes, currentEdges);

    // 1. Check Input/Output matching (Headers)
    // We can't strictly header match because labels might differ?
    // Ideally, we compare functionality.
    // Assumption: The Challenge defines required inputs and outputs.
    // The student must name them the same OR we just matched by count and order of "switch" and "led" if we assume a rigorous template.
    // Let's assume the template provides the Inputs/Outputs and the student shouldn't delete them.
    // So we match based on the stored "Target Behavior".

    // If headers don't match, we warn user?
    // "Your circuit inputs/outputs don't match the required challenge structure."

    if (currentTruthTable.headers.length !== targetTruthTable.headers.length) {
        return {
            success: false,
            message: `Component mismatch: Expected ${targetTruthTable.headers.length} columns (inputs+outputs), found ${currentTruthTable.headers.length}. Do not delete the provided switches/LEDs!`
        };
    }

    // Compare Headers (optional, strict mode)
    /*
    const headerMatch = currentTruthTable.headers.every((h, i) => h === targetTruthTable.headers[i]);
    if (!headerMatch) {
       return { success: false, message: "Use the same labels for inputs and outputs as the challenge." };
    }
    */

    // Compare Rows
    if (currentTruthTable.rows.length !== targetTruthTable.rows.length) {
        return { success: false, message: "Input combination mismatch. Did you add/remove switches?" };
    }

    let mismatchCount = 0;

    for (let i = 0; i < currentTruthTable.rows.length; i++) {
        const currentRow = currentTruthTable.rows[i];
        const targetRow = targetTruthTable.rows[i];

        // Compare each cell
        const rowMatch = currentRow.every((cell, index) => cell === targetRow[index]);

        if (!rowMatch) {
            mismatchCount++;
        }
    }

    if (mismatchCount === 0) {
        return { success: true, message: "Excellent! Your circuit works perfectly." };
    } else {
        return {
            success: false,
            message: `Validation failed: ${mismatchCount} out of ${currentTruthTable.rows.length} test cases failed. Check your logic!`
        };
    }
};
