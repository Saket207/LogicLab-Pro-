// This file handles the logic for creating and managing the circuit, including adding gates, connecting wires, and updating the circuit state based on user interactions.

class Circuit {
    constructor() {
        this.components = new Map(); // Map of component IDs to component objects
        this.connections = []; // Array of {source, target} connections
        this.updateCallbacks = []; // Callbacks to run when circuit is updated
    }
    
    // Add a new component to the circuit
    addComponent(id, type) {
        let component;
        
        switch (type) {
            case 'AND':
            case 'OR':
            case 'NOT':
            case 'NAND':
            case 'NOR':
            case 'XOR':
                component = new Gate(id, type);
                break;
            case 'switch':
                component = new Switch(id);
                break;
            case 'led':
                component = new LED(id);
                break;
            default:
                console.error('Unknown component type:', type);
                return;
        }
        
        this.components.set(id, component);
        return component;
    }
    
    // Connect two components together
    connect(sourceId, targetId) {
        const sourceComponent = this.components.get(sourceId);
        const targetComponent = this.components.get(targetId);
        
        if (!sourceComponent || !targetComponent) {
            console.error('Cannot connect: component not found');
            return false;
        }
        
        // Add to connections list
        this.connections.push({ source: sourceId, target: targetId });
        
        // Update the component connections
        sourceComponent.addOutput(targetComponent);
        targetComponent.addInput(sourceComponent);
        
        // Evaluate the circuit after making a connection
        this.evaluate();
        
        return true;
    }
    
    // Disconnect two components
    disconnect(sourceId, targetId) {
        const sourceComponent = this.components.get(sourceId);
        const targetComponent = this.components.get(targetId);
        
        if (!sourceComponent || !targetComponent) {
            console.error('Cannot disconnect: component not found');
            return false;
        }
        
        // Remove from connections list
        this.connections = this.connections.filter(
            conn => !(conn.source === sourceId && conn.target === targetId)
        );
        
        // Update the component connections
        sourceComponent.removeOutput(targetComponent);
        targetComponent.removeInput(sourceComponent);
        
        // Evaluate the circuit after removing a connection
        this.evaluate();
        
        return true;
    }
    
    // Remove a component and all its connections
    removeComponent(id) {
        const component = this.components.get(id);
        if (!component) return false;
        
        // Remove all connections involving this component
        this.connections = this.connections.filter(
            conn => conn.source !== id && conn.target !== id
        );
        
        // Remove references from other components
        this.components.forEach(comp => {
            if (comp !== component) {
                comp.removeInput(component);
                comp.removeOutput(component);
            }
        });
        
        // Remove the component
        this.components.delete(id);
        
        // Evaluate the circuit after removing a component
        this.evaluate();
        
        return true;
    }
    
    // Set the state of a switch
    setSwitch(id, state) {
        const component = this.components.get(id);
        if (!component || component.type !== 'switch') {
            console.error('Not a switch:', id);
            return false;
        }
        
        component.setState(state);
        
        // Evaluate the circuit after changing a switch state
        this.evaluate();
        
        return true;
    }
    
    // Evaluate the entire circuit
    evaluate() {
        // Use a visited set to detect cycles
        const visited = new Set();
        const evaluating = new Set();
        let maxDepth = 20; // Limit evaluation depth
        
        // Reset all gates before evaluation
        this.components.forEach(component => {
            if (component.type !== 'switch') {
                component.resetOutputs();
            }
        });
        
        // Get evaluation order
        const order = this.getEvaluationOrder();
        
        // Evaluate each component in order
        order.forEach(id => {
            const component = this.components.get(id);
            if (component && !visited.has(id)) {
                this.evaluateComponent(component, visited, evaluating, 0, maxDepth);
            }
        });
        
        // Update all LEDs
        this.components.forEach(component => {
            if (component.type === 'led') {
                component.update();
            }
        });
        
        // Call any update callbacks
        this.notifyUpdate();
        
        return true;
    }
    
    // Add this helper method for safe evaluation
    evaluateComponent(component, visited, evaluating, depth, maxDepth) {
        if (depth > maxDepth) {
            console.warn('Max evaluation depth reached, possible circular reference');
            return;
        }
        
        // Add null/undefined check for component
        if (!component) {
            console.warn('Undefined component in evaluation');
            return;
        }
        
        const id = component.id;
        
        // If already evaluating this component, we have a cycle
        if (evaluating.has(id)) {
            console.warn('Cycle detected in circuit evaluation');
            return;
        }
        
        // If already visited and evaluated
        if (visited.has(id)) {
            return;
        }
        
        // Mark as being evaluated
        evaluating.add(id);
        
        // First evaluate all inputs - ADD CHECK FOR inputs PROPERTY
        if (component.inputs && Array.isArray(component.inputs)) {
            component.inputs.forEach(input => {
                if (input && input.id && !visited.has(input.id)) {
                    this.evaluateComponent(input, visited, evaluating, depth + 1, maxDepth);
                }
            });
        }
        
        // Now evaluate this component
        component.evaluate();
        
        // Mark as visited
        visited.add(id);
        
        // Remove from currently evaluating
        evaluating.delete(id);
    }
    
    // Get the correct order to evaluate components (topological sort)
    getEvaluationOrder() {
        const visited = new Set();
        const order = [];
        
        // Start with switches (inputs)
        this.components.forEach((component, id) => {
            if (component.type === 'switch') {
                this.visit(id, visited, order);
            }
        });
        
        // Then process any unvisited components
        this.components.forEach((_, id) => {
            if (!visited.has(id)) {
                this.visit(id, visited, order);
            }
        });
        
        return order;
    }
    
    // Helper for topological sort
    visit(id, visited, order) {
        if (visited.has(id)) return;
        visited.add(id);
        
        // First visit all components that provide input to this one
        this.connections.forEach(conn => {
            if (conn.target === id) {
                this.visit(conn.source, visited, order);
            }
        });
        
        // Then add this component to the order
        order.push(id);
    }
    
    // Register a callback to be called when the circuit is updated
    onUpdate(callback) {
        this.updateCallbacks.push(callback);
    }
    
    // Notify all callbacks about an update
    notifyUpdate() {
        this.updateCallbacks.forEach(callback => callback());
    }
    
    // Clear the entire circuit
    clear() {
        this.components.clear();
        this.connections = [];
        this.notifyUpdate();
    }
}

// Define Gate component for the circuit model
class Gate {
    constructor(id, type) {
        this.id = id;
        this.type = type;
        this.inputs = [];
        this.outputs = [];
        this.outputValue = 0;
    }
    
    addInput(component) {
        if (!this.inputs.includes(component)) {
            this.inputs.push(component);
        }
    }
    
    addOutput(component) {
        if (!this.outputs.includes(component)) {
            this.outputs.push(component);
        }
    }
    
    removeInput(component) {
        const index = this.inputs.indexOf(component);
        if (index !== -1) {
            this.inputs.splice(index, 1);
        }
    }
    
    removeOutput(component) {
        const index = this.outputs.indexOf(component);
        if (index !== -1) {
            this.outputs.splice(index, 1);
        }
    }
    
    resetOutputs() {
        this.outputValue = 0;
    }
    
    evaluate() {
        // Get input values
        const inputValues = this.inputs.map(input => input.getOutput());
        
        // Evaluate based on gate type
        switch (this.type) {
            case 'AND':
                this.outputValue = inputValues.length > 0 && 
                                   inputValues.every(val => val === 1) ? 1 : 0;
                break;
            case 'OR':
                this.outputValue = inputValues.length > 0 && 
                                   inputValues.some(val => val === 1) ? 1 : 0;
                break;
            case 'NOT':
                this.outputValue = inputValues.length > 0 && inputValues[0] === 0 ? 1 : 0;
                break;
            case 'NAND':
                this.outputValue = inputValues.length === 0 || 
                                   !inputValues.every(val => val === 1) ? 1 : 0;
                break;
            case 'NOR':
                this.outputValue = inputValues.length === 0 || 
                                   !inputValues.some(val => val === 1) ? 1 : 0;
                break;
            case 'XOR':
                this.outputValue = inputValues.filter(val => val === 1).length % 2 === 1 ? 1 : 0;
                break;
            default:
                this.outputValue = 0;
        }
    }
    
    getOutput() {
        return this.outputValue;
    }
}

// Define Switch component for the circuit model
class Switch {
    constructor(id) {
        this.id = id;
        this.type = 'switch';
        this.state = 0;
        this.outputs = [];
    }
    
    setState(state) {
        this.state = state ? 1 : 0;
    }
    
    addOutput(component) {
        if (!this.outputs.includes(component)) {
            this.outputs.push(component);
        }
    }
    
    removeOutput(component) {
        const index = this.outputs.indexOf(component);
        if (index !== -1) {
            this.outputs.splice(index, 1);
        }
    }
    
    evaluate() {
        // Switches just pass through their current state
    }
    
    getOutput() {
        return this.state;
    }
    
    // These are needed for the common component interface
    addInput() {}
    removeInput() {}
    resetOutputs() {}
}

// Define LED component for the circuit model
class LED {
    constructor(id) {
        this.id = id;
        this.type = 'led';
        this.inputs = [];
        this.state = 0;
    }
    
    addInput(component) {
        if (!this.inputs.includes(component)) {
            this.inputs.push(component);
        }
    }
    
    removeInput(component) {
        const index = this.inputs.indexOf(component);
        if (index !== -1) {
            this.inputs.splice(index, 1);
        }
    }
    
    update() {
        // Get input value (use first connected input)
        if (this.inputs.length > 0) {
            this.state = this.inputs[0].getOutput();
        } else {
            this.state = 0;
        }
        
        // Update the visual LED element
        this.updateVisual();
    }
    
    updateVisual() {
        const ledElement = document.getElementById(this.id);
        if (ledElement) {
            if (this.state === 1) {
                ledElement.classList.add('on');
            } else {
                ledElement.classList.remove('on');
            }
        }
    }
    
    getOutput() {
        return this.state;
    }
    
    // These are needed for the common component interface
    addOutput() {}
    removeOutput() {}
    evaluate() {}
    resetOutputs() {}
}

// Create a global circuit instance
window.circuit = new Circuit();

// Connect with the UI through the global app object
if (!window.circuitApp) window.circuitApp = {};

window.circuitApp.connectComponents = function(sourceId, sourceType, targetId, targetType) {
    // Create components if they don't exist yet
    if (!window.circuit.components.has(sourceId)) {
        window.circuit.addComponent(sourceId, sourceType);
    }
    
    if (!window.circuit.components.has(targetId)) {
        window.circuit.addComponent(targetId, targetType);
    }
    
    // Connect the components
    window.circuit.connect(sourceId, targetId);
};

window.circuitApp.disconnectComponents = function(sourceId, targetId) {
    window.circuit.disconnect(sourceId, targetId);
};

window.circuitApp.deleteComponent = function(componentId) {
    window.circuit.removeComponent(componentId);
};

window.circuitApp.updateSwitch = function(switchId, state) {
    window.circuit.setSwitch(switchId, state);
};

window.circuitApp.clearCircuit = function() {
    window.circuit.clear();
};