document.addEventListener('DOMContentLoaded', () => {
    const gatesToolbox = document.getElementById('gates-toolbox');
    
    // Define gate components
    const gates = [
        { type: 'AND', name: 'AND Gate', description: 'Outputs 1 only when all inputs are 1' },
        { type: 'OR', name: 'OR Gate', description: 'Outputs 1 when at least one input is 1' },
        { type: 'NOT', name: 'NOT Gate', description: 'Inverts the input signal' },
        { type: 'NAND', name: 'NAND Gate', description: 'Outputs 0 only when all inputs are 1' },
        { type: 'NOR', name: 'NOR Gate', description: 'Outputs 1 only when all inputs are 0' },
        { type: 'XOR', name: 'XOR Gate', description: 'Outputs 1 when inputs are different' }
    ];

    // Create gate components in the toolbox
    gates.forEach(gate => {
        const gateElement = document.createElement('div');
        gateElement.className = 'component';
        gateElement.setAttribute('draggable', 'true');
        gateElement.setAttribute('data-type', gate.type);
        gateElement.setAttribute('data-description', gate.description);
        
        const iconElement = document.createElement('div');
        iconElement.className = `component-icon ${gate.type.toLowerCase()}-gate-icon`;
        
        const nameElement = document.createElement('span');
        nameElement.textContent = gate.name;
        
        gateElement.appendChild(iconElement);
        gateElement.appendChild(nameElement);
        gatesToolbox.appendChild(gateElement);
        
        console.log(`Added gate: ${gate.type}`); // Debugging
        
        // Set up drag event listeners
        gateElement.addEventListener('dragstart', (event) => {
            event.dataTransfer.setData('text/plain', gate.type);
            event.dataTransfer.effectAllowed = 'copy';
        });
        
        // Show component info on click
        gateElement.addEventListener('click', () => {
            showComponentDetails(gate);
        });
    });

    // Initialize buttons
    initializeButtons();
    
    // Initialize modal functionality
    initializeModal();
    
    console.log('Toolbar initialized with gates:', gates.length);
});

function showComponentDetails(component) {
    const detailsElement = document.getElementById('component-details');
    detailsElement.innerHTML = `
        <h4>${component.name}</h4>
        <p>${component.description}</p>
        ${component.type === 'AND' || component.type === 'OR' ? 
            `<div class="truth-table-mini">
                <table class="truth-table">
                    <tr><th>A</th><th>B</th><th>Out</th></tr>
                    ${component.type === 'AND' ? 
                        `<tr><td>0</td><td>0</td><td>0</td></tr>
                         <tr><td>0</td><td>1</td><td>0</td></tr>
                         <tr><td>1</td><td>0</td><td>0</td></tr>
                         <tr><td>1</td><td>1</td><td>1</td></tr>` :
                        `<tr><td>0</td><td>0</td><td>0</td></tr>
                         <tr><td>0</td><td>1</td><td>1</td></tr>
                         <tr><td>1</td><td>0</td><td>1</td></tr>
                         <tr><td>1</td><td>1</td><td>1</td></tr>`
                    }
                </table>
            </div>` : ''
        }
    `;
}

function initializeButtons() {
    const saveBtn = document.getElementById('save-btn');
    const loadBtn = document.getElementById('load-btn');
    const clearBtn = document.getElementById('clear-btn');
    const wireModeBtn = document.getElementById('wire-mode-btn');
    const deleteModeBtn = document.getElementById('delete-mode-btn');
    const generateTruthTableBtn = document.getElementById('generate-truth-table');
    
    saveBtn.addEventListener('click', () => saveCircuit());
    loadBtn.addEventListener('click', () => loadCircuit());
    clearBtn.addEventListener('click', () => clearWorkspace());
    wireModeBtn.addEventListener('click', () => setEditorMode('wire'));
    deleteModeBtn.addEventListener('click', () => setEditorMode('delete'));
    generateTruthTableBtn.addEventListener('click', () => generateTruthTable());
    
    // Challenge selector
    const challengeSelect = document.getElementById('challenge-select');
    challengeSelect.addEventListener('change', () => {
        loadChallenge(challengeSelect.value);
    });
}

function setEditorMode(mode) {
    const wireModeBtn = document.getElementById('wire-mode-btn');
    const deleteModeBtn = document.getElementById('delete-mode-btn');
    
    // Reset all mode buttons
    wireModeBtn.classList.remove('active');
    deleteModeBtn.classList.remove('active');
    
    // Set active mode button
    if (mode === 'wire') {
        wireModeBtn.classList.add('active');
    } else if (mode === 'delete') {
        deleteModeBtn.classList.add('active');
    }
    
    // Update the current mode in the app state
    // This would interact with your existing circuit/simulation code
    if (window.circuitApp) {
        window.circuitApp.setMode(mode);
    }
}

function initializeModal() {
    const modal = document.getElementById('help-modal');
    const helpLink = document.getElementById('help-link');
    const closeBtn = document.querySelector('.close-btn');
    
    helpLink.addEventListener('click', (e) => {
        e.preventDefault();
        modal.style.display = 'block';
    });
    
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

function saveCircuit() {
    // Implement this function to use your existing storage logic
    console.log('Saving circuit...');
    if (window.circuitApp && window.circuitApp.saveCircuit) {
        window.circuitApp.saveCircuit();
    }
}

function loadCircuit() {
    // Implement this function to use your existing storage logic
    console.log('Loading circuit...');
    if (window.circuitApp && window.circuitApp.loadCircuit) {
        window.circuitApp.loadCircuit();
    }
}

function clearWorkspace() {
    // Implement this function to clear the workspace
    console.log('Clearing workspace...');
    if (window.circuitApp && window.circuitApp.clearCircuit) {
        window.circuitApp.clearCircuit();
    }
}

function loadChallenge(challengeId) {
    const descriptionElement = document.getElementById('challenge-description');
    
    if (challengeId === 'none') {
        descriptionElement.textContent = 'Select a challenge to begin!';
        return;
    }
    
    const challenges = {
        'and': {
            title: 'AND Gate Challenge',
            description: 'Create a circuit where the LED lights up only when both switches are ON.',
            hint: 'Use an AND gate to combine the two inputs.'
        },
        'xor': {
            title: 'XOR Gate Challenge',
            description: 'Create a circuit where the LED lights up only when exactly one switch is ON.',
            hint: 'The XOR gate outputs 1 only when inputs differ.'
        },
        'adder': {
            title: 'Half-Adder Challenge',
            description: 'Build a half-adder circuit with two outputs: Sum and Carry.',
            hint: 'Use XOR for Sum and AND for Carry output.'
        }
    };
    
    const challenge = challenges[challengeId];
    if (challenge) {
        descriptionElement.innerHTML = `
            <h4>${challenge.title}</h4>
            <p>${challenge.description}</p>
            <div class="hint"><strong>Hint:</strong> ${challenge.hint}</div>
        `;
    }
}

function generateTruthTable() {
    // This would connect with your existing truth table generation logic
    console.log('Generating truth table...');
    if (window.circuitApp && window.circuitApp.generateTruthTable) {
        window.circuitApp.generateTruthTable();
    } else {
        const truthTableElement = document.getElementById('truth-table');
        truthTableElement.innerHTML = '<p>Circuit evaluation not available yet</p>';
    }
}