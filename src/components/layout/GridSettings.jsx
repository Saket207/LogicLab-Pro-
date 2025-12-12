import React from 'react';

const GridSettings = ({ snapGrid, setSnapGrid, gridSize, setGridSize }) => {
  return (
    <div className="grid-settings">
      <h4>Grid Settings</h4>
      <div className="setting-row">
        <label htmlFor="snap-grid">
          <input
            type="checkbox"
            id="snap-grid"
            checked={snapGrid}
            onChange={(e) => setSnapGrid(e.target.checked)}
          />
          Snap to Grid
        </label>
      </div>
      <div className="setting-row">
        <label htmlFor="grid-size">Grid Size:</label>
        <input
          type="range"
          id="grid-size"
          min="10"
          max="50"
          step="5"
          value={gridSize}
          onChange={(e) => setGridSize(parseInt(e.target.value))}
          disabled={!snapGrid}
        />
        <span className="range-value">{gridSize}px</span>
      </div>
    </div>
  );
};

export default GridSettings;