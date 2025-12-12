// Import necessary modules
import '../js/ui/toolbar.js';
import '../js/ui/drag-drop.js';
import '../js/circuit.js';
import '../js/debug.js';
import '../js/debug-drop.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('Logic Gate Simulator initializing...');
    
    // Create global reference for components to access
    window.circuitApp = window.circuitApp || {};
    
    // Load basic circuit from saved data if available
    if (localStorage.getItem('logicGateCircuit')) {
        try {
            loadCircuitFromStorage();
        } catch (e) {
            console.error('Error loading saved circuit:', e);
            // Clear possibly corrupt data
            localStorage.removeItem('logicGateCircuit');
        }
    }
    
    // Set up save functionality
    window.circuitApp.saveCircuit = function() {
        saveCircuitToStorage();
    };
    
    // Set up load functionality
    window.circuitApp.loadCircuit = function() {
        loadCircuitFromStorage();
    };
    
    // Register update listeners
    if (window.circuit) {
        window.circuit.onUpdate(() => {
            updateTruthTable();
        });
    }
    
    // Initialize truth table generator
    window.circuitApp.generateTruthTable = updateTruthTable;
    
    // Initialize the toolbox components for debugging
    function initializeUI() {
        console.log('Initializing UI components...');
        
        // Check that essential elements exist
        const workspace = document.getElementById('workspace');
        const gatesToolbox = document.getElementById('gates-toolbox');
        
        if (!workspace) {
            console.error('Workspace element not found!');
        }
        
        if (!gatesToolbox) {
            console.error('Gates toolbox element not found!');
        }
        
        // Check that draggable components are initialized
        const draggable = document.querySelectorAll('[draggable="true"]');
        console.log(`Found ${draggable.length} draggable elements`);
        
        // Setup the clear button
        const clearBtn = document.getElementById('clear-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (window.circuitApp && window.circuitApp.clearCircuit) {
                    // Clear the workspace
                    document.getElementById('workspace').innerHTML = '';
                    window.circuitApp.clearCircuit();
                }
            });
        }
        
        // Set wire mode as active by default
        setTimeout(() => {
            if (window.circuitApp && window.circuitApp.setMode) {
                window.circuitApp.setMode('wire');
                
                // Update button UI
                const wireBtn = document.getElementById('wire-mode-btn');
                if (wireBtn) {
                    wireBtn.classList.add('active');
                }
            }
            
            // Load example circuit after setting wire mode
            loadExampleCircuit();
        }, 1000);
        
        console.log('UI initialization complete');
    }
    
    // Call the initialization function
    initializeUI();
    
    console.log('Logic Gate Simulator initialized successfully.');
});

// Save circuit to localStorage
function saveCircuitToStorage() {
    if (!window.circuit) return;
    
    // Get circuit components and connections
    const componentData = Array.from(window.circuit.components.entries()).map(([id, component]) => {
        return {
            id: id,
            type: component.type,
            state: component.type === 'switch' ? component.state : undefined
        };
    });
    
    const circuitData = {
        components: componentData,
        connections: window.circuit.connections
    };
    
    localStorage.setItem('logicGateCircuit', JSON.stringify(circuitData));
    
    // Show success message
    alert('Circuit saved successfully!');
}

// Load circuit from localStorage
function loadCircuitFromStorage() {
    const savedData = localStorage.getItem('logicGateCircuit');
    if (!savedData) {
        alert('No saved circuit found.');
        return;
    }
    
    try {
        const circuitData = JSON.parse(savedData);
        
        // Clear existing circuit
        window.circuit.clear();
        
        // Clear existing UI
        document.getElementById('workspace').innerHTML = '';
        
        // Create components
        circuitData.components.forEach(compData => {
            // Create component in the model
            window.circuit.addComponent(compData.id, compData.type);
            
            // Create UI element
            if (window.circuitApp.createComponent) {
                // Parse position from ID
                const position = getPositionFromId(compData.id);
                window.circuitApp.createComponent(compData.type, position.x, position.y);
            }
            
            // Set switch states if applicable
            if (compData.type === 'switch' && compData.state !== undefined) {
                window.circuit.setSwitch(compData.id, compData.state);
                
                // Update UI
                const switchEl = document.getElementById(compData.id);
                if (switchEl) {
                    if (compData.state === 1) {
                        switchEl.classList.add('on');
                        switchEl.setAttribute('data-state', '1');
                    } else {
                        switchEl.classList.remove('on');
                        switchEl.setAttribute('data-state', '0');
                    }
                    
                    const valueDisplay = switchEl.querySelector('.switch-value');
                    if (valueDisplay) {
                        valueDisplay.textContent = compData.state;
                    }
                }
            }
        });
        
        // Create connections
        circuitData.connections.forEach(conn => {
            window.circuit.connect(conn.source, conn.target);
            
            // Create wire in UI
            // Ideally, we would call a function to create the visual wire
            // But for now, the circuit will be evaluated correctly
        });
        
        // Evaluate the circuit
        window.circuit.evaluate();
        
        alert('Circuit loaded successfully!');
    } catch (e) {
        console.error('Error loading circuit:', e);
        alert('Error loading circuit. The saved data may be corrupted.');
    }
}

// Helper to extract position from a component ID (mock implementation)
function getPositionFromId(id) {
    // In a real implementation, you might store position in the ID or in separate storage
    return { x: Math.random() * 300 + 50, y: Math.random() * 200 + 50 };
}

// Replace the updateTruthTable function with this simplified version
function updateTruthTable() {
    const truthTableElement = document.getElementById('truth-table');
    if (!truthTableElement) return;
    
    try {
        // Find all switches and LEDs in the circuit
        const switches = [];
        const leds = [];
        
        if (!window.circuit || !window.circuit.components) {
            truthTableElement.innerHTML = '<p>Circuit system not initialized</p>';
            return;
        }
        
        // Safely collect switches and LEDs
        window.circuit.components.forEach((component, id) => {
            if (component && component.type === 'switch') {
                switches.push({ id, component });
            } else if (component && component.type === 'led') {
                leds.push({ id, component });
            }
        });
        
        // If there aren't enough components, show a message
        if (switches.length === 0 || leds.length === 0) {
            truthTableElement.innerHTML = '<p>Add switches and LEDs to see a truth table</p>';
            return;
        }
        
        // Store original switch states to restore later
        const originalStates = [];
        switches.forEach(s => {
            originalStates.push(s.component.state);
        });
        
        // Build a simple truth table with limited combinations
        let tableHtml = '<table class="truth-table">';
        
        // Header row
        tableHtml += '<tr>';
        switches.forEach((s, i) => {
            tableHtml += `<th>Switch ${i+1}</th>`;
        });
        leds.forEach((l, i) => {
            tableHtml += `<th>LED ${i+1}</th>`;
        });
        tableHtml += '</tr>';
        
        // Limit to a reasonable number of switches to prevent performance issues
        const maxSwitches = Math.min(switches.length, 3); // Max 8 combinations
        const totalCombinations = Math.pow(2, maxSwitches);
        
        // Generate each row of the truth table
        for (let i = 0; i < totalCombinations; i++) {
            tableHtml += '<tr>';
            
            // Set switch values for this combination
            for (let j = 0; j < maxSwitches; j++) {
                const value = (i >> j) & 1;
                try {
                    window.circuit.setSwitch(switches[j].id, value);
                    tableHtml += `<td>${value}</td>`;
                } catch (e) {
                    console.error(`Error setting switch ${j}:`, e);
                    tableHtml += `<td>?</td>`;
                }
            }
            
            // Now evaluate the circuit once and display LED values
            try {
                window.circuit.evaluate();
                
                // Show LED values
                leds.forEach(l => {
                    try {
                        tableHtml += `<td>${l.component.getOutput()}</td>`;
                    } catch (e) {
                        tableHtml += `<td>?</td>`;
                    }
                });
            } catch (e) {
                console.error('Circuit evaluation error:', e);
                leds.forEach(() => {
                    tableHtml += `<td>ERR</td>`;
                });
            }
            
            tableHtml += '</tr>';
        }
        
        tableHtml += '</table>';
        truthTableElement.innerHTML = tableHtml;
        
        // Restore original switch states
        for (let i = 0; i < switches.length; i++) {
            try {
                window.circuit.setSwitch(switches[i].id, originalStates[i] || 0);
            } catch (e) {
                console.warn(`Could not restore switch ${i} state:`, e);
            }
        }
        
        // Final evaluation to update the circuit display
        try {
            window.circuit.evaluate();
        } catch (e) {
            console.warn('Error in final circuit evaluation:', e);
        }
        
    } catch (e) {
        console.error('Error generating truth table:', e);
        truthTableElement.innerHTML = '<p>Error generating truth table. <button id="fix-circuit-btn" class="control-btn">Reset Circuit</button></p>';
        
        // Add a reset button to help users recover
        setTimeout(() => {
            const resetBtn = document.getElementById('fix-circuit-btn');
            if (resetBtn) {
                resetBtn.addEventListener('click', () => {
                    document.getElementById('workspace').innerHTML = '';
                    if (window.circuit) window.circuit.clear();
                });
            }
        }, 100);
    }
}

// Generate all combinations of switch inputs (0/1)
function generateCombinations(numSwitches) {
    const combinations = [];
    const totalCombinations = Math.pow(2, numSwitches);
    
    for (let i = 0; i < totalCombinations; i++) {
        const combination = [];
        for (let j = 0; j < numSwitches; j++) {
            // Extract each bit from the binary representation of i
            combination.push((i >> j) & 1);
        }
        combinations.push(combination);
    }
    
    return combinations;
}

// Add this function to app.js
function loadExampleCircuit() {
    console.log('Loading example circuit...');
    
    // First clear any existing circuit
    if (window.circuitApp && window.circuitApp.clearCircuit) {
        document.getElementById('workspace').innerHTML = '';
        window.circuitApp.clearCircuit();
    }
    
    // 1. Create components
    const switch1 = window.circuitApp.createComponent('switch', 50, 100);
    const switch2 = window.circuitApp.createComponent('switch', 50, 200);
    const andGate = window.circuitApp.createComponent('AND', 200, 150);
    const led = window.circuitApp.createComponent('led', 350, 150);
    
    // 2. Wait a moment for components to be fully initialized
    setTimeout(() => {
        // 3. Get connection points
        const switch1Out = switch1.querySelector('.connection-point.output');
        const switch2Out = switch2.querySelector('.connection-point.output');
        const andIn1 = andGate.querySelector('.connection-point.input[data-input-index="0"]');
        const andIn2 = andGate.querySelector('.connection-point.input[data-input-index="1"]');
        const andOut = andGate.querySelector('.connection-point.output');
        const ledIn = led.querySelector('.connection-point.input');
        
        // 4. Create wires
        const wireCreator = (from, to) => {
            const fromId = from.getAttribute('data-component-id');
            const toId = to.getAttribute('data-component-id');
            
            // Create a wire directly
            createWireConnection(fromId, toId, from, to);
        };
        
        // Create needed connections
        if (switch1Out && andIn1) wireCreator(switch1Out, andIn1);
        if (switch2Out && andIn2) wireCreator(switch2Out, andIn2);
        if (andOut && ledIn) wireCreator(andOut, ledIn);
        
        // 5. Add a helpful hint message
        const workspace = document.getElementById('workspace');
        const hint = document.createElement('div');
        hint.className = 'example-hint';
        hint.innerHTML = `
            <h3>Example AND Gate Circuit</h3>
            <p>This circuit uses an AND gate to light the LED only when both switches are ON.</p>
            <p>Try clicking the switches to toggle them!</p>
        `;
        hint.style.position = 'absolute';
        hint.style.top = '20px';
        hint.style.left = '20px';
        hint.style.backgroundColor = 'rgba(255,255,255,0.9)';
        hint.style.padding = '10px';
        hint.style.borderRadius = '5px';
        hint.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        hint.style.maxWidth = '300px';
        hint.style.zIndex = '100';
        workspace.appendChild(hint);
        
        console.log('Example circuit loaded!');
    }, 1000);
}

// Helper function to create wire connections for the example
function createWireConnection(sourceId, targetId, sourcePoint, targetPoint) {
    if (!window.circuitApp) return;
    
    // Use the existing wire creation function if available
    if (typeof window.circuitApp.createWireConnection === 'function') {
        window.circuitApp.createWireConnection(sourceId, targetId, sourcePoint, targetPoint);
        return;
    }
    
    // Get positions for visual wire
    const sourceRect = sourcePoint.getBoundingClientRect();
    const targetRect = targetPoint.getBoundingClientRect();
    const workspaceRect = document.getElementById('workspace').getBoundingClientRect();
    
    const startX = sourceRect.left + sourceRect.width / 2 - workspaceRect.left;
    const startY = sourceRect.top + sourceRect.height / 2 - workspaceRect.top;
    const endX = targetRect.left + targetRect.width / 2 - workspaceRect.left;
    const endY = targetRect.top + targetRect.height / 2 - workspaceRect.top;
    
    // Create wire SVG
    const wireId = `wire-${sourceId}-to-${targetId}-${Date.now()}`;
    const wireSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    wireSvg.classList.add('wire');
    wireSvg.id = wireId;
    wireSvg.style.position = 'absolute';
    wireSvg.style.top = '0';
    wireSvg.style.left = '0';
    wireSvg.style.width = '100%';
    wireSvg.style.height = '100%';
    wireSvg.setAttribute('data-source-id', sourceId);
    wireSvg.setAttribute('data-target-id', targetId);
    
    // Create wire path
    const dx = endX - startX;
    const controlPointOffset = Math.min(Math.abs(dx) / 2, 100);
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('stroke', '#555');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('fill', 'none');
    const d = `M ${startX},${startY} 
               C ${startX + controlPointOffset},${startY} 
                 ${endX - controlPointOffset},${endY} 
                 ${endX},${endY}`;
    path.setAttribute('d', d);
    
    // Add to SVG
    wireSvg.appendChild(path);
    document.getElementById('workspace').appendChild(wireSvg);
    
    // Connect in logic model
    if (window.circuitApp.connectComponents) {
        // Get component types
        const sourceType = sourcePoint.closest('.gate-component') ? 
            sourcePoint.closest('.gate-component').querySelector('.gate-label').textContent : 
            (sourcePoint.closest('.switch-component') ? 'switch' : 'unknown');
            
        const targetType = targetPoint.closest('.gate-component') ? 
            targetPoint.closest('.gate-component').querySelector('.gate-label').textContent : 
            (targetPoint.closest('.led-component') ? 'led' : 'unknown');
        
        window.circuitApp.connectComponents(sourceId, sourceType, targetId, targetType);
    }
    
    // Mark connection points as connected
    sourcePoint.classList.add('connected');
    targetPoint.classList.add('connected');
}