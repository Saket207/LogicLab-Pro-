/**
 * Signal Animation Manager
 * Manages animations for signal propagation through the circuit with realistic delays and visual effects
 */

class SignalAnimationManager {
  constructor() {
    this.activeAnimations = new Map(); // Map of edge IDs to animation states
    this.gateProcessingDelay = 150; // milliseconds for gate processing
    this.signalSpeed = 300; // pixels per second for signal travel
    this.animationCallbacks = new Set(); // Callbacks for animation updates
    this.isProcessing = false;
  }

  /**
   * Register a callback to be called when animations update
   */
  onAnimationUpdate(callback) {
    this.animationCallbacks.add(callback);
  }

  /**
   * Remove an animation callback
   */
  offAnimationUpdate(callback) {
    this.animationCallbacks.delete(callback);
  }

  /**
   * Notify all callbacks about animation updates
   */
  notifyAnimationUpdate() {
    this.animationCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Animation callback error:', error);
      }
    });
  }

  /**
   * Calculate distance between two points
   */
  calculateDistance(pos1, pos2) {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Start a signal animation along an edge
   */
  startSignalAnimation(edgeId, sourceNode, targetNode, signalValue) {
    // Calculate animation duration based on edge length
    const distance = this.calculateDistance(sourceNode.position, targetNode.position);
    const duration = Math.max(400, distance / this.signalSpeed * 1000); // minimum 400ms

    const animation = {
      edgeId,
      startTime: Date.now(),
      duration,
      signalValue,
      sourceNode,
      targetNode,
      progress: 0,
      isActive: true
    };

    this.activeAnimations.set(edgeId, animation);
    
    console.log(`🚀 Starting signal animation on edge ${edgeId}, duration: ${duration}ms, value: ${signalValue}`);

    // Start the animation loop for this edge
    this.animateSignal(edgeId);
    
    return animation;
  }

  /**
   * Animate a single signal
   */
  animateSignal(edgeId) {
    const animation = this.activeAnimations.get(edgeId);
    if (!animation || !animation.isActive) return;

    const elapsed = Date.now() - animation.startTime;
    animation.progress = Math.min(elapsed / animation.duration, 1);

    // Notify components about the animation update
    this.notifyAnimationUpdate();

    if (animation.progress >= 1) {
      // Animation complete
      this.completeSignalAnimation(edgeId);
    } else {
      // Continue animation
      requestAnimationFrame(() => this.animateSignal(edgeId));
    }
  }

  /**
   * Complete a signal animation
   */
  completeSignalAnimation(edgeId) {
    const animation = this.activeAnimations.get(edgeId);
    if (!animation) return;

    console.log(`✅ Signal animation completed for edge ${edgeId}`);
    
    // Mark as complete
    animation.isActive = false;
    animation.progress = 1;

    // Schedule removal of completed animation
    setTimeout(() => {
      this.activeAnimations.delete(edgeId);
      this.notifyAnimationUpdate();
    }, 200); // Keep it visible for a moment

    // Trigger gate processing delay
    if (animation.targetNode && animation.targetNode.type !== 'led' && animation.targetNode.type !== 'switch') {
      this.startGateProcessingAnimation(animation.targetNode.id);
    }

    this.notifyAnimationUpdate();
  }

  /**
   * Start gate processing animation (pulsing effect)
   */
  startGateProcessingAnimation(nodeId) {
    console.log(`⚡ Starting gate processing animation for node ${nodeId}`);
    
    // Add processing class for visual effect
    const nodeElement = document.querySelector(`[data-id="${nodeId}"]`);
    if (nodeElement) {
      nodeElement.classList.add('processing');
      
      setTimeout(() => {
        nodeElement.classList.remove('processing');
      }, this.gateProcessingDelay);
    }
  }

  /**
   * Get animation state for an edge
   */
  getAnimationState(edgeId) {
    return this.activeAnimations.get(edgeId);
  }

  /**
   * Get all active animations
   */
  getAllActiveAnimations() {
    return Array.from(this.activeAnimations.values()).filter(anim => anim.isActive);
  }

  /**
   * Clear all animations
   */
  clearAllAnimations() {
    this.activeAnimations.clear();
    this.notifyAnimationUpdate();
  }

  /**
   * Check if any animations are active
   */
  hasActiveAnimations() {
    return Array.from(this.activeAnimations.values()).some(anim => anim.isActive);
  }

  /**
   * Propagate signal through circuit with animations - triggered by switch toggle
   */
  async propagateSignalFromSwitch(switchNodeId, nodes, edges, evaluateCallback) {
    if (this.isProcessing) {
      console.log('⏳ Animation already in progress, skipping...');
      return;
    }

    const switchNode = nodes.find(n => n.id === switchNodeId);
    if (!switchNode || switchNode.type !== 'switch') return;

    // Only propagate if switch is ON (true)
    if (!switchNode.data.state) {
      console.log('🔴 Switch is OFF, no signal to propagate');
      if (evaluateCallback) evaluateCallback();
      return;
    }

    this.isProcessing = true;
    console.log(`🟢 Starting signal propagation from switch ${switchNodeId} (ON)`);

    try {
      // Find all edges connected to this switch
      const connectedEdges = edges.filter(edge => edge.source === switchNodeId);
      
      if (connectedEdges.length === 0) {
        console.log('📍 No connections from switch');
        if (evaluateCallback) evaluateCallback();
        return;
      }

      // Start animations for each connected edge
      const animationPromises = connectedEdges.map(edge => {
        const targetNode = nodes.find(n => n.id === edge.target);
        if (!targetNode) return Promise.resolve();

        const signalValue = switchNode.data.state;
        
        return new Promise((resolve) => {
          this.startSignalAnimation(edge.id, switchNode, targetNode, signalValue);
          
          // Wait for animation to complete
          const checkComplete = () => {
            const animation = this.getAnimationState(edge.id);
            if (!animation || !animation.isActive) {
              // Add gate processing delay for gates (not LEDs)
              if (targetNode.type !== 'led' && targetNode.type !== 'switch') {
                setTimeout(() => {
                  resolve();
                }, this.gateProcessingDelay);
              } else {
                resolve();
              }
            } else {
              setTimeout(checkComplete, 16); // Check every frame
            }
          };
          checkComplete();
        });
      });

      // Wait for all animations to complete
      await Promise.all(animationPromises);

      // Now propagate to subsequent gates if they exist
      await this.propagateToConnectedGates(switchNodeId, nodes, edges);

      console.log('🎯 Signal propagation completed from switch');
      
      // Update circuit state after all animations
      if (evaluateCallback) {
        evaluateCallback();
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Propagate signals to connected gates recursively
   */
  async propagateToConnectedGates(sourceNodeId, nodes, edges) {
    const connectedEdges = edges.filter(edge => edge.source === sourceNodeId);
    
    for (const edge of connectedEdges) {
      const targetNode = nodes.find(n => n.id === edge.target);
      if (!targetNode) continue;

      // If target is a gate (not LED), propagate further
      if (targetNode.type !== 'led' && targetNode.type !== 'switch') {
        const gateOutputEdges = edges.filter(e => e.source === targetNode.id);
        
        for (const outputEdge of gateOutputEdges) {
          const outputTarget = nodes.find(n => n.id === outputEdge.target);
          if (!outputTarget) continue;

          // Start animation for this connection with delay
          await new Promise(resolve => {
            setTimeout(() => {
              this.startSignalAnimation(outputEdge.id, targetNode, outputTarget, true);
              
              const checkComplete = () => {
                const animation = this.getAnimationState(outputEdge.id);
                if (!animation || !animation.isActive) {
                  resolve();
                } else {
                  setTimeout(checkComplete, 16);
                }
              };
              checkComplete();
            }, this.gateProcessingDelay);
          });
        }
      }
    }
  }

  /**
   * Legacy methods for backwards compatibility
   */
  queueAnimation(type, id, value, delay = null) {
    console.log(`Legacy animation queued: ${type} ${id} ${value}`);
  }

  animateEdge(edgeId, value, delay = null) {
    console.log(`Legacy animateEdge called: ${edgeId} ${value}`);
  }

  animateNode(nodeId, value, delay = null) {
    console.log(`Legacy animateNode called: ${nodeId} ${value}`);
  }

  clearAnimations() {
    this.clearAllAnimations();
  }

  isAnimating() {
    return this.hasActiveAnimations();
  }
}

// Create a singleton instance
const signalAnimationManager = new SignalAnimationManager();

export default signalAnimationManager;
export { SignalAnimationManager };
