import React from 'react';

// Basic Logic Gate Icons
export const AndGateIcon = () => (
  <svg viewBox="0 0 100 60" width="100%" height="100%">
    <path d="M20 10 L50 10 Q70 10 70 30 Q70 50 50 50 L20 50 Z" 
          fill="currentColor" stroke="currentColor" strokeWidth="2"/>
    <text x="45" y="35" fontSize="12" textAnchor="middle" fill="white">AND</text>
  </svg>
);

export const OrGateIcon = () => (
  <svg viewBox="0 0 100 60" width="100%" height="100%">
    <path d="M20 10 Q40 10 50 30 Q40 50 20 50 Q35 30 20 10 Z" 
          fill="currentColor" stroke="currentColor" strokeWidth="2"/>
    <text x="40" y="35" fontSize="12" textAnchor="middle" fill="white">OR</text>
  </svg>
);

export const NotGateIcon = () => (
  <svg viewBox="0 0 100 60" width="100%" height="100%">
    <path d="M20 10 L60 30 L20 50 Z" 
          fill="currentColor" stroke="currentColor" strokeWidth="2"/>
    <circle cx="65" cy="30" r="5" fill="currentColor" stroke="currentColor"/>
    <text x="35" y="35" fontSize="10" textAnchor="middle" fill="white">NOT</text>
  </svg>
);

export const XorGateIcon = () => (
  <svg viewBox="0 0 100 60" width="100%" height="100%">
    <path d="M20 10 Q40 10 50 30 Q40 50 20 50 Q35 30 20 10 Z" 
          fill="currentColor" stroke="currentColor" strokeWidth="2"/>
    <path d="M15 10 Q30 30 15 50" fill="none" stroke="currentColor" strokeWidth="2"/>
    <text x="40" y="35" fontSize="12" textAnchor="middle" fill="white">XOR</text>
  </svg>
);

export const NandGateIcon = () => (
  <svg viewBox="0 0 100 60" width="100%" height="100%">
    <path d="M20 10 L50 10 Q70 10 70 30 Q70 50 50 50 L20 50 Z" 
          fill="currentColor" stroke="currentColor" strokeWidth="2"/>
    <circle cx="75" cy="30" r="5" fill="currentColor" stroke="currentColor"/>
    <text x="45" y="35" fontSize="10" textAnchor="middle" fill="white">NAND</text>
  </svg>
);

export const NorGateIcon = () => (
  <svg viewBox="0 0 100 60" width="100%" height="100%">
    <path d="M20 10 Q40 10 50 30 Q40 50 20 50 Q35 30 20 10 Z" 
          fill="currentColor" stroke="currentColor" strokeWidth="2"/>
    <circle cx="55" cy="30" r="5" fill="currentColor" stroke="currentColor"/>
    <text x="40" y="35" fontSize="11" textAnchor="middle" fill="white">NOR</text>
  </svg>
);

export const SwitchIcon = () => (
  <svg viewBox="0 0 100 60" width="100%" height="100%">
    <rect x="15" y="22" width="70" height="16" rx="8" ry="8" 
          fill="currentColor" stroke="currentColor" strokeWidth="2"/>
    <circle cx="70" cy="30" r="10" fill="white" stroke="currentColor" strokeWidth="2"/>
    <text x="35" y="34" fontSize="12" textAnchor="middle" fill="white">0/1</text>
  </svg>
);

// Generic gate icon component that can render different gate types
export const GateIcon = ({ type, className, ...props }) => {
  const iconMap = {
    andGate: AndGateIcon,
    orGate: OrGateIcon,
    notGate: NotGateIcon,
    xorGate: XorGateIcon,
    nandGate: NandGateIcon,
    norGate: NorGateIcon,
    switch: SwitchIcon
  };

  const IconComponent = iconMap[type];
  
  if (!IconComponent) {
    return (
      <svg viewBox="0 0 100 60" width="100%" height="100%" className={className} {...props}>
        <rect x="10" y="10" width="80" height="40" fill="currentColor" stroke="currentColor" strokeWidth="2"/>
        <text x="50" y="35" fontSize="12" textAnchor="middle" fill="white">?</text>
      </svg>
    );
  }

  return (
    <div className={className} {...props}>
      <IconComponent />
    </div>
  );
};

// Info icon component
export const InfoIcon = ({ className, ...props }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    width="18" 
    height="18" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
);

// Trash icon component
export const TrashIcon = ({ className, ...props }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    width="18" 
    height="18" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <polyline points="3,6 5,6 21,6" />
    <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

// Save icon component
export const SaveIcon = ({ className, ...props }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    width="18" 
    height="18" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17,21 17,13 7,13 7,21" />
    <polyline points="7,3 7,8 15,8" />
  </svg>
);

// Load icon component
export const LoadIcon = ({ className, ...props }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    width="18" 
    height="18" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14,2 14,8 20,8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10,9 9,9 8,9" />
  </svg>
);

// Share icon component
export const ShareIcon = ({ className, ...props }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    width="18" 
    height="18" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);