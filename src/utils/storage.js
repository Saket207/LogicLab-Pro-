function saveCircuit(circuit) {
    localStorage.setItem('circuitConfig', JSON.stringify(circuit));
}

function loadCircuit() {
    const circuitData = localStorage.getItem('circuitConfig');
    return circuitData ? JSON.parse(circuitData) : null;
}

function clearCircuit() {
    localStorage.removeItem('circuitConfig');
}