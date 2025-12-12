/**
 * Snaps a position to the nearest grid point
 * 
 * @param {Object} position - The position to snap
 * @param {number} gridSize - The size of the grid
 * @returns {Object} - The snapped position
 */
export function snapToGrid(position, gridSize = 20) {
  return {
    x: Math.round(position.x / gridSize) * gridSize,
    y: Math.round(position.y / gridSize) * gridSize
  };
}

/**
 * Formats a position based on grid settings before applying to a component
 * 
 * @param {Object} position - The original position
 * @param {boolean} useGrid - Whether to use the grid
 * @param {number} gridSize - The size of the grid
 * @returns {Object} - The formatted position
 */
export function formatPosition(position, useGrid = true, gridSize = 20) {
  if (useGrid) {
    return snapToGrid(position, gridSize);
  }
  return position;
}