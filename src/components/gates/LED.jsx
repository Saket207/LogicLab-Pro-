import React from 'react';
import { Handle, Position } from 'reactflow';

export default function LED({ data, isConnectable }) {
  const { state, label } = data;
  
  return (
    <div className={`led-node ${state ? 'on' : 'off'}`}>
      <Handle
        type="target"
        position={Position.Left}
        id="in"
        isConnectable={isConnectable}
      />
      
      <div className="led-circle"></div>
      <div className="led-label">{label} ({state ? '1' : '0'})</div>
    </div>
  );
}