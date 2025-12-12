import React from 'react';
import { Handle, Position } from 'reactflow';

export default function Switch({ data, isConnectable }) {
  const { state, label } = data;
  
  // Add this console log to help debug switch rendering
  console.log(`Rendering switch ${label} with state:`, state);
  
  return (
    <div 
      className={`switch-node ${state ? 'on' : 'off'}`} 
      title="Click to toggle"
    >
      <div className="switch-label">{label}</div>
      
      <div className="switch-toggle" style={{
        backgroundColor: state ? 'var(--switch-on)' : 'var(--switch-off)'
      }}>
        <div className="switch-slider" style={{
          transform: state ? 'translateX(28px)' : 'translateX(0)'
        }}></div>
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