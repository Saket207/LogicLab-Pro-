// Unique ID generator to prevent React key duplication errors
let counter = 0;

/**
 * Generate a unique ID with a prefix
 * @param {string} prefix - The prefix for the ID
 * @returns {string} A unique ID
 */
export function generateUniqueId(prefix = 'id') {
  counter++;
  return `${prefix}-${Date.now()}-${counter}`;
}

/**
 * Generate a unique edge ID between two nodes
 * @param {string} sourceId - Source node ID
 * @param {string} targetId - Target node ID
 * @param {string} sourceHandle - Source handle (optional)
 * @param {string} targetHandle - Target handle (optional)
 * @returns {string} A unique edge ID
 */
export function generateEdgeId(sourceId, targetId, sourceHandle = 'out', targetHandle = 'in') {
  counter++;
  return `e-${sourceId}-${targetId}-${sourceHandle}-${targetHandle}-${Date.now()}-${counter}`;
}

/**
 * Generate a unique node ID with type
 * @param {string} nodeType - Type of the node
 * @returns {string} A unique node ID
 */
export function generateNodeId(nodeType) {
  counter++;
  return `${nodeType}-${Date.now()}-${counter}`;
}

/**
 * Reset the counter (useful for testing)
 */
export function resetCounter() {
  counter = 0;
}
