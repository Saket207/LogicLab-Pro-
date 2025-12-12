document.addEventListener('DOMContentLoaded', () => {
    console.log('Debug: Checking for drop event conflicts');
    
    // Monitor dragover and drop events
    const workspace = document.getElementById('workspace');
    if (workspace) {
        workspace.addEventListener('dragover', (e) => {
            console.log('Dragover event triggered on workspace', e);
        });
        
        workspace.addEventListener('drop', (e) => {
            console.log('Drop event triggered on workspace', e);
        });
    }
    
    // Check for global event handlers
    console.log('Looking for event handler conflicts...');
    
    if (window.drop) {
        console.warn('Found global drop function that might conflict:', window.drop);
    }
    
    // This can detect some extensions that hook into the Event prototype
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(type, listener, options) {
        if (type === 'drop') {
            console.log('Drop event listener being added to:', this);
        }
        return originalAddEventListener.call(this, type, listener, options);
    };
    
    // Add to imports in app.js
    console.log('Debug-drop script loaded');
});