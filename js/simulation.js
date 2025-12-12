// This file manages the simulation logic, including evaluating the circuit and updating the outputs (LEDs) based on the current state of the inputs (switches).

class Simulation {
    constructor(circuit) {
        this.circuit = circuit;
    }

    evaluate() {
        this.circuit.gates.forEach(gate => {
            gate.evaluate();
        });
        this.updateOutputs();
    }

    updateOutputs() {
        this.circuit.leds.forEach(led => {
            led.updateState();
        });
    }

    toggleSwitch(switchId) {
        const switchComponent = this.circuit.switches.find(s => s.id === switchId);
        if (switchComponent) {
            switchComponent.toggle();
            this.evaluate();
        }
    }
}

// Export the Simulation class for use in other modules
export default Simulation;