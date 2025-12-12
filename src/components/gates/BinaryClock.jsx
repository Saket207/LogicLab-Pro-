import React, { useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';

export default function BinaryClock({ data, isConnectable }) {
  const { label = "Binary Clock" } = data;
  const [time, setTime] = useState(new Date());
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Convert time to binary
  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();
  
  const toBinary = (num, bits = 6) => {
    return Array.from({ length: bits }, (_, i) => {
      return Boolean(num & (1 << (bits - 1 - i)));
    });
  };
  
  const hoursBinary = toBinary(hours, 6);   // 0-23 needs 6 bits
  const minutesBinary = toBinary(minutes, 6); // 0-59 needs 6 bits
  const secondsBinary = toBinary(seconds, 6); // 0-59 needs 6 bits
  
  const TimeColumn = ({ value, binary, label: colLabel }) => (
    <div className="time-column">
      <div className="time-label">{colLabel}</div>
      <div className="decimal-time">{value.toString().padStart(2, '0')}</div>
      <div className="binary-column">
        {binary.map((bit, index) => (
          <div 
            key={index} 
            className={`binary-clock-bit ${bit ? 'on' : 'off'}`}
            title={`Bit ${5-index}: ${bit ? '1' : '0'}`}
          >
            <div className="bit-dot"></div>
          </div>
        ))}
      </div>
      <div className="bit-values">
        {[32, 16, 8, 4, 2, 1].map((val, index) => (
          <div key={index} className="bit-value">{val}</div>
        ))}
      </div>
    </div>
  );
  
  return (
    <div className="binary-clock-node">
      {/* Output handles for each time component */}
      {/* Hours outputs */}
      {hoursBinary.map((_, i) => (
        <Handle
          key={`hour${i}`}
          type="source"
          position={Position.Right}
          id={`hour${i}`}
          style={{ top: `${5 + (i * 8)}%` }}
          isConnectable={isConnectable}
        />
      ))}
      
      {/* Minutes outputs */}
      {minutesBinary.map((_, i) => (
        <Handle
          key={`minute${i}`}
          type="source"
          position={Position.Right}
          id={`minute${i}`}
          style={{ top: `${55 + (i * 6)}%` }}
          isConnectable={isConnectable}
        />
      ))}
      
      {/* Seconds outputs (bottom) */}
      {secondsBinary.map((_, i) => (
        <Handle
          key={`second${i}`}
          type="source"
          position={Position.Bottom}
          id={`second${i}`}
          style={{ left: `${15 + (i * 12)}%` }}
          isConnectable={isConnectable}
        />
      ))}
      
      {/* Clock body */}
      <div className="binary-clock-body">
        <div className="binary-clock-title">{label}</div>
        
        {/* Digital time display */}
        <div className="digital-time">
          {time.toLocaleTimeString()}
        </div>
        
        {/* Binary time display */}
        <div className="binary-time-display">
          <TimeColumn 
            value={hours} 
            binary={hoursBinary} 
            label="Hours" 
          />
          <div className="time-separator">:</div>
          <TimeColumn 
            value={minutes} 
            binary={minutesBinary} 
            label="Minutes" 
          />
          <div className="time-separator">:</div>
          <TimeColumn 
            value={seconds} 
            binary={secondsBinary} 
            label="Seconds" 
          />
        </div>
        
        {/* Legend */}
        <div className="binary-clock-legend">
          <div className="legend-item">
            <div className="legend-dot on"></div>
            <span>1</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot off"></div>
            <span>0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
