document.addEventListener('DOMContentLoaded', () => {
    const workspace = document.getElementById('workspace');
    let isDragging = false;
    let selectedComponent = null;
    let offsetX, offsetY;
    let currentMode = 'component'; // 'component', 'wire', 'delete'
    
    // Store references to all components in the workspace
    const workspaceComponents = new Map();
    let nextComponentId = 1;
    
    // Wire drawing state
    let wireStartComponent = null;
    let wireStartPoint = null;
    let wireEndPoint = { x: 0, y: 0 };
    let temporaryWire = null;
    
    // Handle component dragging from toolbox
    initializeToolboxDragging();
    
    // Initialize workspace for component placement and manipulation
    initializeWorkspace();
    
    // Initialize editor modes (wire, delete, etc.)
    initializeEditorModes();
    
    // Make the workspace grid-aware for snapping
    makeWorkspaceGridAware();
    
    function initializeToolboxDragging() {
        // Select all draggable components in the toolbox
        const draggableComponents = document.querySelectorAll('.component[draggable="true"]');
        
        draggableComponents.forEach(component => {
            component.addEventListener('dragstart', (e) => {
                const type = component.getAttribute('data-type');
                e.dataTransfer.setData('text/plain', type);
                e.dataTransfer.effectAllowed = 'copy';
                console.log('Drag started:', type);
            });
        });
        
        // Prevent default behaviors to allow dropping
        workspace.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
        });
        
        workspace.addEventListener('drop', (e) => {
            e.preventDefault();
            const componentType = e.dataTransfer.getData('text/plain');
            console.log('Drop received:', componentType);
            
            if (componentType) {
                // Get drop position with workspace offset
                const rect = workspace.getBoundingClientRect();
                const x = Math.round((e.clientX - rect.left) / 20) * 20; // Snap to grid
                const y = Math.round((e.clientY - rect.top) / 20) * 20; // Snap to grid
                
                createComponent(componentType, x, y);
            }
        });
    }
    
    function initializeWorkspace() {
        // Handle component selection and movement within workspace
        workspace.addEventListener('mousedown', (e) => {
            if (currentMode === 'delete') return; // Don't select components in delete mode
            
            const target = e.target;
            let componentElement = null;
            
            // Find the component element that was clicked
            if (target.closest('.gate-component')) {
                componentElement = target.closest('.gate-component');
            } else if (target.closest('.switch-component')) {
                componentElement = target.closest('.switch-component');
            } else if (target.closest('.led-component')) {
                componentElement = target.closest('.led-component');
            }
            
            // Check if clicked on a connection point
            const connectionPoint = target.closest('.connection-point');
            if (connectionPoint && currentMode === 'wire') {
                handleConnectionPointClick(connectionPoint, e);
                return;
            }
            
            // Handle component selection and movement
            if (componentElement) {
                selectedComponent = componentElement;
                
                // Mark as selected
                clearComponentSelection();
                selectedComponent.classList.add('selected');
                
                // Get the offset of the mouse click relative to the component
                const rect = selectedComponent.getBoundingClientRect();
                offsetX = e.clientX - rect.left;
                offsetY = e.clientY - rect.top;
                
                isDragging = true;
                e.preventDefault(); // Prevent text selection during drag
            } else {
                // Clicked on empty workspace, clear selection
                clearComponentSelection();
                selectedComponent = null;
            }
        });
        
        // Handle component movement
        workspace.addEventListener('mousemove', (e) => {
            if (isDragging && selectedComponent) {
                // Move the component
                const rect = workspace.getBoundingClientRect();
                let x = e.clientX - rect.left - offsetX;
                let y = e.clientY - rect.top - offsetY;
                
                // Snap to grid (20px)
                x = Math.round(x / 20) * 20;
                y = Math.round(y / 20) * 20;
                
                // Apply the new position
                selectedComponent.style.left = `${x}px`;
                selectedComponent.style.top = `${y}px`;
                
                // Update any connected wires
                updateConnectedWires(selectedComponent.id);
            } else if (currentMode === 'wire' && wireStartPoint) {
                // Update the temporary wire end position while drawing
                const rect = workspace.getBoundingClientRect();
                wireEndPoint = {
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top
                };
                updateTemporaryWire();
                
                // Highlight connection points that are close enough to connect
                highlightNearbyConnectionPoints(e);
            }
        });
        
        // Handle end of dragging or wire drawing
        workspace.addEventListener('mouseup', (e) => {
            if (isDragging) {
                isDragging = false;
            }
            
            if (currentMode === 'wire' && wireStartPoint && temporaryWire) {
                // Check if we're hovering over a connection point
                const connectionPoint = findConnectionPointAt(e.clientX, e.clientY);
                if (connectionPoint && 
                    connectionPoint.getAttribute('data-type') === 'input' &&
                    wireStartPoint.getAttribute('data-type') === 'output') {
                    
                    // Complete the connection
                    handleConnectionPointClick(connectionPoint, e);
                } else {
                    // Remove the temporary wire
                    if (temporaryWire.parentNode) {
                        temporaryWire.parentNode.removeChild(temporaryWire);
                    }
                    temporaryWire = null;
                    wireStartPoint = null;
                    wireStartComponent = null;
                }
                
                // Remove highlights from all connection points
                removeAllConnectionHighlights();
            }
        });
        
        // Handle click for switches and click-and-hold for other interactions
        workspace.addEventListener('click', (e) => {
            const target = e.target;
            
            // Handle switch toggle - improve this section
            if (currentMode !== 'wire' && currentMode !== 'delete') {
                // Find if we clicked on any part of a switch component
                const switchComponent = target.closest('.switch-component');
                if (switchComponent) {
                    console.log('Switch clicked:', switchComponent.id);
                    toggleSwitch(switchComponent);
                    e.stopPropagation(); // Stop event propagation
                    return;
                }
            }
            
            // Handle delete mode
            if (currentMode === 'delete') {
                const component = target.closest('.gate-component, .switch-component, .led-component');
                if (component) {
                    deleteComponent(component);
                }
                
                const wire = target.closest('.wire');
                if (wire) {
                    deleteWire(wire);
                }
            }
        });
    }
    
    function initializeEditorModes() {
        // Set up the wire mode button
        const wireModeBtn = document.getElementById('wire-mode-btn');
        wireModeBtn.addEventListener('click', () => {
            setMode('wire');
        });
        
        // Set up the delete mode button
        const deleteModeBtn = document.getElementById('delete-mode-btn');
        deleteModeBtn.addEventListener('click', () => {
            setMode('delete');
        });
        
        // Register with the global app
        if (!window.circuitApp) window.circuitApp = {};
        window.circuitApp.setMode = setMode;
    }
    
    function setMode(mode) {
        currentMode = mode;
        
        // Update button states
        const wireModeBtn = document.getElementById('wire-mode-btn');
        const deleteModeBtn = document.getElementById('delete-mode-btn');
        
        wireModeBtn.classList.remove('active');
        deleteModeBtn.classList.remove('active');
        
        if (mode === 'wire') {
            wireModeBtn.classList.add('active');
            workspace.classList.add('wire-mode');
            workspace.classList.remove('delete-mode');
            document.body.style.cursor = 'crosshair';
        } else if (mode === 'delete') {
            deleteModeBtn.classList.add('active');
            workspace.classList.add('delete-mode');
            workspace.classList.remove('wire-mode');
            document.body.style.cursor = 'not-allowed';
        } else {
            workspace.classList.remove('wire-mode', 'delete-mode');
            document.body.style.cursor = 'default';
        }
        
        // Reset wire drawing state
        wireStartPoint = null;
        wireStartComponent = null;
        if (temporaryWire && temporaryWire.parentNode) {
            temporaryWire.parentNode.removeChild(temporaryWire);
        }
        temporaryWire = null;
        
        // Remove any connection highlights
        removeAllConnectionHighlights();
    }
    
    function makeWorkspaceGridAware() {
        // Toggle grid visibility
        const gridToggle = document.getElementById('grid-toggle');
        gridToggle.addEventListener('change', () => {
            if (gridToggle.checked) {
                workspace.style.backgroundImage = `
                    linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px)
                `;
            } else {
                workspace.style.backgroundImage = 'none';
            }
        });
    }
    
    function createComponent(type, x, y) {
        const componentId = `component-${nextComponentId++}`;
        let componentElement;
        
        if (type === 'AND' || type === 'OR' || type === 'NOT' || type === 'NAND' || type === 'NOR' || type === 'XOR') {
            componentElement = createGateComponent(type, componentId);
        } else if (type === 'switch') {
            componentElement = createSwitchComponent(componentId);
        } else if (type === 'led') {
            componentElement = createLedComponent(componentId);
        } else {
            console.error('Unknown component type:', type);
            return;
        }
        
        // Position the component
        componentElement.style.left = `${x}px`;
        componentElement.style.top = `${y}px`;
        
        // Add to workspace
        workspace.appendChild(componentElement);
        
        // Store reference
        workspaceComponents.set(componentId, {
            element: componentElement,
            type: type,
            connections: []
        });
        
        return componentElement;
    }
    
    function createGateComponent(type, id) {
        const gate = document.createElement('div');
        gate.className = 'gate-component';
        gate.id = id;
        
        const gateBody = document.createElement('div');
        gateBody.className = 'gate-body';
        
        // Add the gate icon from SVG
        const svgIcon = document.createElement('div');
        svgIcon.className = `component-icon ${type.toLowerCase()}-gate-icon`;
        svgIcon.style.width = '50px';
        svgIcon.style.height = '50px';
        
        gateBody.appendChild(svgIcon);
        gate.appendChild(gateBody);
        
        // Add label
        const label = document.createElement('div');
        label.className = 'gate-label';
        label.textContent = type;
        gate.appendChild(label);
        
        // Add connection points based on gate type
        addConnectionPoints(gate, type);
        
        // Make it draggable within the workspace
        gate.setAttribute('draggable', 'false'); // We handle custom dragging
        
        return gate;
    }
    
    function createSwitchComponent(id) {
        const switchComp = document.createElement('div');
        switchComp.className = 'switch-component';
        switchComp.id = id;
        switchComp.setAttribute('data-state', '0');
        
        const switchBody = document.createElement('div');
        switchBody.className = 'switch-body';
        
        const switchHandle = document.createElement('div');
        switchHandle.className = 'switch-handle';
        
        const switchValue = document.createElement('div');
        switchValue.className = 'switch-value';
        switchValue.textContent = '0';
        
        switchBody.appendChild(switchHandle);
        switchBody.appendChild(switchValue);
        switchComp.appendChild(switchBody);
        
        // Add label
        const label = document.createElement('div');
        label.className = 'gate-label';
        label.textContent = 'Switch';
        switchComp.appendChild(label);
        
        // Add output connection point
        const outputPoint = document.createElement('div');
        outputPoint.className = 'connection-point output';
        outputPoint.style.top = '20px';
        outputPoint.style.right = '-5px';
        outputPoint.setAttribute('data-type', 'output');
        outputPoint.setAttribute('data-component-id', id);
        switchComp.appendChild(outputPoint);
        
        return switchComp;
    }
    
    function createLedComponent(id) {
        const led = document.createElement('div');
        led.className = 'led-component';
        led.id = id;
        
        const ledBody = document.createElement('div');
        ledBody.className = 'led-body';
        
        led.appendChild(ledBody);
        
        // Add label
        const label = document.createElement('div');
        label.className = 'led-label';
        label.textContent = 'LED';
        led.appendChild(label);
        
        // Add input connection point
        const inputPoint = document.createElement('div');
        inputPoint.className = 'connection-point input';
        inputPoint.style.top = '20px';
        inputPoint.style.left = '-5px';
        inputPoint.setAttribute('data-type', 'input');
        inputPoint.setAttribute('data-component-id', id);
        led.appendChild(inputPoint);
        
        return led;
    }
    
    function addConnectionPoints(gate, gateType) {
        // For inputs (usually on the left)
        if (gateType === 'NOT') {
            // NOT gate has only one input
            const inputPoint = document.createElement('div');
            inputPoint.className = 'connection-point input';
            inputPoint.style.top = '30px';
            inputPoint.style.left = '-5px';
            inputPoint.setAttribute('data-type', 'input');
            inputPoint.setAttribute('data-input-index', '0');
            inputPoint.setAttribute('data-component-id', gate.id);
            gate.appendChild(inputPoint);
        } else {
            // Other gates have two inputs
            const inputPoint1 = document.createElement('div');
            inputPoint1.className = 'connection-point input';
            inputPoint1.style.top = '15px';
            inputPoint1.style.left = '-5px';
            inputPoint1.setAttribute('data-type', 'input');
            inputPoint1.setAttribute('data-input-index', '0');
            inputPoint1.setAttribute('data-component-id', gate.id);
            gate.appendChild(inputPoint1);
            
            const inputPoint2 = document.createElement('div');
            inputPoint2.className = 'connection-point input';
            inputPoint2.style.top = '45px';
            inputPoint2.style.left = '-5px';
            inputPoint2.setAttribute('data-type', 'input');
            inputPoint2.setAttribute('data-input-index', '1');
            inputPoint2.setAttribute('data-component-id', gate.id);
            gate.appendChild(inputPoint2);
        }
        
        // For output (usually on the right)
        const outputPoint = document.createElement('div');
        outputPoint.className = 'connection-point output';
        outputPoint.style.top = '30px';
        outputPoint.style.right = '-5px';
        outputPoint.setAttribute('data-type', 'output');
        outputPoint.setAttribute('data-component-id', gate.id);
        gate.appendChild(outputPoint);
    }
    
    function handleConnectionPointClick(connectionPoint, event) {
        const type = connectionPoint.getAttribute('data-type');
        const componentId = connectionPoint.getAttribute('data-component-id');
        
        // If this is the first point clicked (start of wire)
        if (!wireStartPoint) {
            // Only outputs can be starting points for wires
            if (type === 'output') {
                // Store both element and data
                wireStartPoint = {
                    element: connectionPoint,
                    type: type,
                    componentId: componentId
                };
                
                // Create temporary wire for visual feedback
                createTemporaryWire(connectionPoint);
            }
        } 
        // If this is the second point clicked (end of wire)
        else if (wireStartPoint.element !== connectionPoint) {
            // Only create a wire from output to input, not input to input or output to output
            if (wireStartPoint.type === 'output' && type === 'input') {
                // Create a permanent wire
                createWireConnection(
                    wireStartPoint.componentId,
                    componentId,
                    wireStartPoint.element,
                    connectionPoint
                );
            }
            
            // Reset wire drawing state
            wireStartPoint = null;
            wireStartComponent = null;
            if (temporaryWire && temporaryWire.parentNode) {
                temporaryWire.parentNode.removeChild(temporaryWire);
            }
            temporaryWire = null;
        }
    }
    
    function createTemporaryWire(startPoint) {
    // Get the position of the start point
    const rect = startPoint.getBoundingClientRect();
    const workspaceRect = workspace.getBoundingClientRect();
    
    // Save both the DOM element and coordinates
    wireStartPoint = {
        element: startPoint,
        x: rect.left + rect.width / 2 - workspaceRect.left,
        y: rect.top + rect.height / 2 - workspaceRect.top,
        type: startPoint.getAttribute('data-type'),
        componentId: startPoint.getAttribute('data-component-id')
    };
    
    // Initialize end point as the same as start point
    wireEndPoint = { 
        x: wireStartPoint.x, 
        y: wireStartPoint.y,
        connected: false 
    };
    
    // Create SVG element for the wire
    temporaryWire = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    temporaryWire.classList.add('wire', 'temporary-wire');
    temporaryWire.style.position = 'absolute';
    temporaryWire.style.top = '0';
    temporaryWire.style.left = '0';
    temporaryWire.style.width = '100%';
    temporaryWire.style.height = '100%';
    temporaryWire.style.pointerEvents = 'none';
    temporaryWire.style.zIndex = '5';
    
    // Create the path element
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('stroke', '#666');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('fill', 'none');
    
    temporaryWire.appendChild(path);
    workspace.appendChild(temporaryWire);
    
    updateTemporaryWire();
}
    
    function updateTemporaryWire() {
        if (!temporaryWire) return;
        
        const path = temporaryWire.querySelector('path');
        if (!path) return;
        
        // Calculate control points for a cubic Bezier curve
        const dx = wireEndPoint.x - wireStartPoint.x;
        const controlPointOffset = Math.min(Math.abs(dx) / 2, 100); // Adjust curve steepness
        
        const d = `M ${wireStartPoint.x},${wireStartPoint.y} 
                   C ${wireStartPoint.x + controlPointOffset},${wireStartPoint.y} 
                     ${wireEndPoint.x - controlPointOffset},${wireEndPoint.y} 
                     ${wireEndPoint.x},${wireEndPoint.y}`;
        
        path.setAttribute('d', d);
        
        // Update wire color based on whether it can connect
        if (wireEndPoint.connected) {
            path.setAttribute('stroke', '#4CAF50'); // Green for valid connection
            path.setAttribute('stroke-width', '3');
        } else {
            path.setAttribute('stroke', '#666'); // Default color
            path.setAttribute('stroke-width', '2');
        }
    }
    
    function highlightNearbyConnectionPoints(e) {
        // Remove previous highlights
        removeAllConnectionHighlights();
        
        // Find nearby connection points
        const connectionPoint = findConnectionPointAt(e.clientX, e.clientY);
        
        // If found a connection point and it's an input (since we're drawing from an output)
        if (connectionPoint && connectionPoint.getAttribute('data-type') === 'input') {
            connectionPoint.classList.add('connection-highlight');
            
            // Update wire end point state
            wireEndPoint.connected = true;
            updateTemporaryWire();
        } else {
            wireEndPoint.connected = false;
            updateTemporaryWire();
        }
    }
    
    function findConnectionPointAt(x, y) {
        // Get all connection points
        const connectionPoints = document.querySelectorAll('.connection-point');
        const tolerance = 15; // px
        
        // Check each point
        for (const point of connectionPoints) {
            const rect = point.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            // If cursor is within tolerance of this point
            if (Math.abs(x - centerX) < tolerance && Math.abs(y - centerY) < tolerance) {
                return point;
            }
        }
        
        return null;
    }
    
    function removeAllConnectionHighlights() {
        const highlightedPoints = document.querySelectorAll('.connection-highlight');
        highlightedPoints.forEach(point => {
            point.classList.remove('connection-highlight');
        });
    }
    
    // Fix the createWireConnection function to be more resilient
    function createWireConnection(sourceId, targetId, sourcePoint, targetPoint) {
        if (!sourceId || !targetId || !sourcePoint || !targetPoint) {
            console.error('Invalid parameters for wire connection');
            return null;
        }
        
        try {
            // Wire creation code...
            
            // Connect in logic model - more carefully
            if (window.circuit && window.circuit.connect) {
                window.circuit.connect(sourceId, targetId);
            } else if (window.circuitApp && window.circuitApp.connectComponents) {
                // Get component types safely
                const sourceType = sourcePoint.closest('.gate-component') ? 
                    (sourcePoint.closest('.gate-component').querySelector('.gate-label')?.textContent || 'unknown') : 
                    (sourcePoint.closest('.switch-component') ? 'switch' : 'unknown');
                    
                const targetType = targetPoint.closest('.gate-component') ? 
                    (targetPoint.closest('.gate-component').querySelector('.gate-label')?.textContent || 'unknown') : 
                    (targetPoint.closest('.led-component') ? 'led' : 'unknown');
                
                window.circuitApp.connectComponents(sourceId, sourceType, targetId, targetType);
            }
            
            // Mark connection points as connected
            sourcePoint.classList.add('connected');
            targetPoint.classList.add('connected');
            
            return wireSvg;
        } catch (error) {
            console.error('Error creating wire connection:', error);
            return null;
        }
    }
    
    function deleteComponent(component) {
        if (!component) return; // Add this check
    
        const componentId = component.id;
        if (!componentId) return; // Add this check
    
        // First delete all connected wires
        const componentData = workspaceComponents.get(componentId);
        if (componentData) {
            // Make a copy of connections array since we'll be modifying it during iteration
            const connections = [...componentData.connections];
            connections.forEach(connection => {
                const wire = document.getElementById(connection.wireId);
                if (wire) {
                    deleteWire(wire);
                }
            });
            
            // Remove from workspaceComponents
            workspaceComponents.delete(componentId);
        }
        
        // Remove the component element from DOM
        if (component.parentNode) {
            component.parentNode.removeChild(component);
        }
        
        // Notify circuit model
        if (window.circuitApp && window.circuitApp.deleteComponent) {
            window.circuitApp.deleteComponent(componentId);
        }
    }
    
    function deleteWire(wire) {
        const wireId = wire.id;
        const sourceId = wire.getAttribute('data-source-id');
        const targetId = wire.getAttribute('data-target-id');
        
        // Update the connection data for both components
        const sourceComponent = workspaceComponents.get(sourceId);
        const targetComponent = workspaceComponents.get(targetId);
        
        if (sourceComponent) {
            sourceComponent.connections = sourceComponent.connections.filter(conn => conn.wireId !== wireId);
        }
        
        if (targetComponent) {
            targetComponent.connections = targetComponent.connections.filter(conn => conn.wireId !== wireId);
        }
        
        // Remove visual connected indicators if components have no other connections
        updateConnectionPointsVisual(sourceId, 'output');
        updateConnectionPointsVisual(targetId, 'input');
        
        // Remove the wire element from DOM
        if (wire.parentNode) {
            wire.parentNode.removeChild(wire);
        }
        
        // Notify circuit model
        disconnectComponentsInCircuit(sourceId, targetId);
    }
    
    function updateConnectionPointsVisual(componentId, type) {
        const component = workspaceComponents.get(componentId);
        if (!component) return;
        
        // Check if this component has any remaining connections of the specified type
        const hasConnections = component.connections.some(conn => conn.type === type);
        
        // Update the visual state of connection points
        const componentElement = document.getElementById(componentId);
        if (componentElement) {
            const points = componentElement.querySelectorAll(`.connection-point.${type}`);
            points.forEach(point => {
                if (!hasConnections) {
                    point.classList.remove('connected');
                }
            });
        }
    }
    
    function toggleSwitch(switchComponent) {
        if (!switchComponent || !switchComponent.classList.contains('switch-component')) {
            console.error('Not a valid switch component:', switchComponent);
            return;
        }
        
        // Get current state
        const currentState = switchComponent.getAttribute('data-state');
        const newState = currentState === '1' ? '0' : '1';
        console.log(`Toggling switch ${switchComponent.id} from ${currentState} to ${newState}`);
        
        // Update switch visual state
        switchComponent.setAttribute('data-state', newState);
        
        if (newState === '1') {
            switchComponent.classList.add('on');
        } else {
            switchComponent.classList.remove('on');
        }
        
        // Update the value display
        const valueDisplay = switchComponent.querySelector('.switch-value');
        if (valueDisplay) {
            valueDisplay.textContent = newState;
        }
        
        // Notify the circuit model
        try {
            if (window.circuit && window.circuit.setSwitch) {
                window.circuit.setSwitch(switchComponent.id, parseInt(newState));
            } else if (window.circuitApp && window.circuitApp.updateSwitch) {
                window.circuitApp.updateSwitch(switchComponent.id, parseInt(newState));
            }
        } catch (e) {
            console.error('Error updating switch state:', e);
        }
    }
    
    function clearComponentSelection() {
        const selectedComponents = workspace.querySelectorAll('.gate-component.selected, .switch-component.selected, .led-component.selected');
        selectedComponents.forEach(component => {
            component.classList.remove('selected');
        });
    }
    
    function connectComponentsInCircuit(sourceId, targetId) {
        // Connect the components in the circuit model
        if (window.circuitApp && window.circuitApp.connectComponents) {
            const sourceComponent = workspaceComponents.get(sourceId);
            const targetComponent = workspaceComponents.get(targetId);
            
            if (sourceComponent && targetComponent) {
                window.circuitApp.connectComponents(sourceId, sourceComponent.type, targetId, targetComponent.type);
            }
        }
    }
    
    function disconnectComponentsInCircuit(sourceId, targetId) {
        // Disconnect the components in the circuit model
        if (window.circuitApp && window.circuitApp.disconnectComponents) {
            window.circuitApp.disconnectComponents(sourceId, targetId);
        }
    }
    
    // Expose key functionality to the global app object
    if (!window.circuitApp) window.circuitApp = {};
    
    window.circuitApp.createComponent = createComponent;
    window.circuitApp.deleteComponent = deleteComponent;
    window.circuitApp.toggleSwitch = toggleSwitch;
    window.circuitApp.updateConnectedWires = updateConnectedWires;
});