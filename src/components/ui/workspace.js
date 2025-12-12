const workspace = document.getElementById('workspace');

let components = [];

function addComponent(component) {
    components.push(component);
    render();
}

function removeComponent(component) {
    components = components.filter(c => c !== component);
    render();
}

function render() {
    workspace.innerHTML = '';
    components.forEach(component => {
        workspace.appendChild(component.render());
    });
}

function clearWorkspace() {
    components = [];
    render();
}

export { addComponent, removeComponent, clearWorkspace };