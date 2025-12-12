function generateTruthTable(circuit) {
    const gates = circuit.gates;
    const inputs = circuit.inputs;
    const numInputs = inputs.length;
    const truthTable = [];

    // Generate all combinations of input values
    const totalCombinations = Math.pow(2, numInputs);
    for (let i = 0; i < totalCombinations; i++) {
        const inputValues = [];
        for (let j = 0; j < numInputs; j++) {
            inputValues.push((i >> (numInputs - 1 - j)) & 1);
        }

        // Evaluate the circuit with the current input values
        const outputValues = evaluateCircuit(gates, inputs, inputValues);
        truthTable.push([...inputValues, ...outputValues]);
    }

    return truthTable;
}

function evaluateCircuit(gates, inputs, inputValues) {
    const outputValues = [];

    // Set input values
    inputs.forEach((input, index) => {
        input.value = inputValues[index];
    });

    // Evaluate each gate
    gates.forEach(gate => {
        outputValues.push(gate.evaluate());
    });

    return outputValues;
}

function formatTruthTable(truthTable) {
    const header = truthTable[0].slice(0, -1).map((_, index) => `Input ${index + 1}`).concat('Output');
    const rows = truthTable.map(row => row.join(' | '));
    return [header.join(' | '), ...rows].join('\n');
}

export { generateTruthTable, formatTruthTable };