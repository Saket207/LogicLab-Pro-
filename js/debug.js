// Add this file to check if SVG files are loading correctly

document.addEventListener('DOMContentLoaded', () => {
    console.log('Debug: Checking SVG paths');
    
    const svgPaths = [
        '../assets/icons/and-gate.svg',
        '../assets/icons/or-gate.svg',
        '../assets/icons/not-gate.svg',
        '../assets/icons/nand-gate.svg', 
        '../assets/icons/nor-gate.svg',
        '../assets/icons/xor-gate.svg',
        '../assets/icons/switch.svg',
        '../assets/icons/led.svg'
    ];
    
    svgPaths.forEach(path => {
        const img = new Image();
        img.onload = () => console.log(`✓ Loaded: ${path}`);
        img.onerror = () => console.error(`✗ Failed to load: ${path}`);
        img.src = path;
    });
    
    // Also check all toolbox components
    setTimeout(() => {
        const components = document.querySelectorAll('.component');
        console.log(`Found ${components.length} components in toolbox`);
        components.forEach(comp => {
            const type = comp.getAttribute('data-type');
            const icon = comp.querySelector('.component-icon');
            console.log(`Component: ${type}`, {
                hasDragEvent: !!comp._dragstart,
                iconClass: icon ? icon.className : 'none'
            });
        });
    }, 1000);
});