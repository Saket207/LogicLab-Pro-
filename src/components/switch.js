import React from 'react';
import { Handle, Position } from 'reactflow';

export default function Switch({ data, isConnectable }) {
  const { state, label } = data;
  
  console.log(`Rendering switch ${label} with state:`, state);
  
  return (
    <div 
      className={`switch-node ${state ? 'on' : 'off'}`} 
      title="Click to toggle"
    >
      <div className="switch-label">{label}</div>
      
      <div 
        className="switch-toggle" 
        style={{
          backgroundColor: state ? '#4CAF50' : '#ccc'
        }}
      >
        <div 
          className="switch-slider" 
          style={{
            transform: state ? 'translateX(28px)' : 'translateX(0)',
            transition: 'transform 0.3s ease'
          }}
        />
        <div className="switch-text">{state ? '1' : '0'}</div>
      </div>
      
      <Handle
        type="source"
        position={Position.Right}
        id="out"
        isConnectable={isConnectable}
      />
    </div>
  );
}