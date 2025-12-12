import React from 'react';

const GateIcon = ({ type, className, ...props }) => {
  const iconComponents = {
    andGate: () => (
      <svg viewBox="0 0 100 60" width="100%" height="100%">
        <path d="M20 10 L50 10 Q70 10 70 30 Q70 50 50 50 L20 50 Z" 
              fill="currentColor" stroke="currentColor" strokeWidth="2"/>
        <text x="45" y="35" fontSize="12" textAnchor="middle" fill="white">AND</text>
      </svg>
    ),
    orGate: () => (
      <svg viewBox="0 0 100 60" width="100%" height="100%">
        <path d="M20 10 Q40 10 50 30 Q40 50 20 50 Q35 30 20 10 Z" 
              fill="currentColor" stroke="currentColor" strokeWidth="2"/>
        <text x="40" y="35" fontSize="12" textAnchor="middle" fill="white">OR</text>
      </svg>
    ),
    notGate: () => (
      <svg viewBox="0 0 100 60" width="100%" height="100%">
        <path d="M20 10 L60 30 L20 50 Z" 
              fill="currentColor" stroke="currentColor" strokeWidth="2"/>
        <circle cx="65" cy="30" r="5" fill="currentColor" stroke="currentColor"/>
        <text x="35" y="35" fontSize="10" textAnchor="middle" fill="white">NOT</text>
      </svg>
    ),
    xorGate: () => (
      <svg viewBox="0 0 100 60" width="100%" height="100%">
        <path d="M20 10 Q40 10 50 30 Q40 50 20 50 Q35 30 20 10 Z" 
              fill="currentColor" stroke="currentColor" strokeWidth="2"/>
        <path d="M15 10 Q30 30 15 50" fill="none" stroke="currentColor" strokeWidth="2"/>
        <text x="40" y="35" fontSize="12" textAnchor="middle" fill="white">XOR</text>
      </svg>
    ),
    nandGate: () => (
      <svg viewBox="0 0 100 60" width="100%" height="100%">
        <path d="M20 10 L50 10 Q70 10 70 30 Q70 50 50 50 L20 50 Z" 
              fill="currentColor" stroke="currentColor" strokeWidth="2"/>
        <circle cx="75" cy="30" r="5" fill="currentColor" stroke="currentColor"/>
        <text x="45" y="35" fontSize="10" textAnchor="middle" fill="white">NAND</text>
      </svg>
    ),
    norGate: () => (
      <svg viewBox="0 0 100 60" width="100%" height="100%">
        <path d="M20 10 Q40 10 50 30 Q40 50 20 50 Q35 30 20 10 Z" 
              fill="currentColor" stroke="currentColor" strokeWidth="2"/>
        <circle cx="55" cy="30" r="5" fill="currentColor" stroke="currentColor"/>
        <text x="40" y="35" fontSize="11" textAnchor="middle" fill="white">NOR</text>
      </svg>
    ),
    switch: () => (
      <svg viewBox="0 0 60 40" width="100%" height="100%">
        <rect x="10" y="15" width="40" height="10" rx="5" 
              fill="currentColor" stroke="currentColor" strokeWidth="2"/>
        <circle cx="35" cy="20" r="6" fill="white" stroke="currentColor" strokeWidth="2"/>
        <text x="30" y="38" fontSize="8" textAnchor="middle" fill="currentColor">SW</text>
      </svg>
    ),
    led: () => (
      <svg viewBox="0 0 40 40" width="100%" height="100%">
        <circle cx="20" cy="20" r="15" fill="currentColor" stroke="currentColor" strokeWidth="2"/>
        <circle cx="20" cy="20" r="8" fill="white" opacity="0.7"/>
        <text x="20" y="36" fontSize="8" textAnchor="middle" fill="currentColor">LED</text>
      </svg>
    )
  };

  const IconComponent = iconComponents[type];
  
  if (!IconComponent) {
    return (
      <svg viewBox="0 0 40 40" width="100%" height="100%" className={className} {...props}>
        <rect x="5" y="5" width="30" height="30" fill="currentColor" stroke="currentColor" strokeWidth="2"/>
        <text x="20" y="25" fontSize="12" textAnchor="middle" fill="white">?</text>
      </svg>
    );
  }

  return (
    <div className={className} {...props}>
      <IconComponent />
    </div>
  );
};

export default GateIcon;