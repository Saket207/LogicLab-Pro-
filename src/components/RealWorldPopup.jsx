import React from 'react';
import { createPortal } from 'react-dom';
import '../styles.css';

const gateExamples = {
  andGate: {
    title: 'AND Gate',
    description: 'Outputs HIGH only when ALL inputs are HIGH. Think of it as requiring multiple conditions to be true.',
    examples: [
      {
        icon: '🚗',
        title: 'Car Safety System',
        description: 'Engine starts only when seatbelt is fastened AND key is turned',
        details: 'Modern cars use AND gates to ensure multiple safety conditions are met'
      },
      {
        icon: '🏠',
        title: 'Home Security',
        description: 'Alarm activates when motion is detected AND system is armed',
        details: 'Prevents false alarms by requiring multiple trigger conditions'
      },
      {
        icon: '💻',
        title: 'Computer Memory',
        description: 'Data is written when write signal AND address match are both active',
        details: 'Ensures data integrity by requiring precise timing and addressing'
      },
      {
        icon: '🏭',
        title: 'Industrial Control',
        description: 'Machine operates when power is on AND safety door is closed',
        details: 'Critical for worker safety in automated manufacturing'
      }
    ]
  },
  orGate: {
    title: 'OR Gate',
    description: 'Outputs HIGH when ANY input is HIGH. Represents choices or alternative conditions.',
    examples: [
      {
        icon: '🚨',
        title: 'Emergency Systems',
        description: 'Fire alarm triggers from smoke detector OR heat sensor OR manual pull',
        details: 'Multiple detection methods ensure rapid emergency response'
      },
      {
        icon: '🚪',
        title: 'Automatic Doors',
        description: 'Door opens when motion sensor OR push button is activated',
        details: 'Provides multiple ways for people to trigger door opening'
      },
      {
        icon: '💡',
        title: 'Lighting Control',
        description: 'Room light turns on from wall switch OR motion sensor',
        details: 'Offers both manual control and automatic convenience'
      },
      {
        icon: '🔔',
        title: 'Notification Systems',
        description: 'Alert sounds when email arrives OR phone rings OR timer expires',
        details: 'Combines multiple event sources into single notification'
      }
    ]
  },
  notGate: {
    title: 'NOT Gate (Inverter)',
    description: 'Inverts the input signal. When input is LOW, output is HIGH and vice versa.',
    examples: [
      {
        icon: '🌃',
        title: 'Street Lighting',
        description: 'Lights turn ON when daylight sensor reads LOW (dark)',
        details: 'Automatic street lighting that activates at sunset'
      },
      {
        icon: '❄️',
        title: 'Cooling Systems',
        description: 'Air conditioning turns ON when temperature sensor reads NOT hot',
        details: 'Inverter logic controls when cooling should activate'
      },
      {
        icon: '🔐',
        title: 'Security Access',
        description: 'Door unlocks when security system is NOT armed',
        details: 'Prevents access when security measures are active'
      },
      {
        icon: '⚡',
        title: 'Power Management',
        description: 'Backup power activates when main power is NOT available',
        details: 'Ensures continuous operation during power outages'
      }
    ]
  },
  xorGate: {
    title: 'XOR Gate (Exclusive OR)',
    description: 'Outputs HIGH when inputs are DIFFERENT. Used for comparison and exclusive choices.',
    examples: [
      {
        icon: '🔄',
        title: 'Motor Direction Control',
        description: 'Motor runs when forward OR reverse is selected, but not both',
        details: 'Prevents mechanical damage from conflicting commands'
      },
      {
        icon: '🔐',
        title: 'Data Encryption',
        description: 'XOR operations scramble data by comparing with encryption keys',
        details: 'Fundamental building block of modern cryptography'
      },
      {
        icon: '➕',
        title: 'Binary Addition',
        description: 'XOR performs addition without carry in binary arithmetic',
        details: 'Essential component in computer arithmetic logic units'
      },
      {
        icon: '🔍',
        title: 'Error Detection',
        description: 'Compares transmitted and received data to detect corruption',
        details: 'Used in network communication and data storage systems'
      }
    ]
  },
  nandGate: {
    title: 'NAND Gate (NOT AND)',
    description: 'Outputs LOW only when ALL inputs are HIGH. A universal gate that can build any logic function.',
    examples: [
      {
        icon: '💾',
        title: 'Computer Memory',
        description: 'NAND flash memory stores data in smartphones and SSDs',
        details: 'Billions of NAND gates store your photos, apps, and files'
      },
      {
        icon: '🖥️',
        title: 'Processor Logic',
        description: 'CPU cores are built primarily using NAND gate combinations',
        details: 'Intel and AMD processors contain billions of NAND gates'
      },
      {
        icon: '🔧',
        title: 'Control Systems',
        description: 'Industrial automation uses NAND gates for safety interlocks',
        details: 'Fail-safe designs that stop operation when conditions are met'
      },
      {
        icon: '📱',
        title: 'Digital Circuits',
        description: 'Smartphone chips use NAND gates for all digital processing',
        details: 'From touchscreen input to app execution, NAND gates enable it all'
      }
    ]
  },
  norGate: {
    title: 'NOR Gate (NOT OR)',
    description: 'Outputs HIGH only when ALL inputs are LOW. Another universal gate used in specialized applications.',
    examples: [
      {
        icon: '🛡️',
        title: 'Safety Shutdown',
        description: 'System runs only when NO emergency conditions are present',
        details: 'Multiple safety sensors connected to NOR gates for fail-safe operation'
      },
      {
        icon: '🔋',
        title: 'Power Control',
        description: 'Backup system activates when all primary power sources fail',
        details: 'Ensures power availability through redundant system monitoring'
      },
      {
        icon: '🎮',
        title: 'Game Controllers',
        description: 'Default state when no buttons are pressed on gaming devices',
        details: 'NOR gates detect the neutral state of controller inputs'
      },
      {
        icon: '🏥',
        title: 'Medical Devices',
        description: 'Life support continues when no alarm conditions are active',
        details: 'Critical systems that must operate unless problems are detected'
      }
    ]
  }
};

export default function RealWorldPopup({ gateType, isOpen, onClose }) {
  if (!isOpen || !gateType) return null;

  const gateData = gateExamples[gateType];
  if (!gateData) return null;

  return createPortal(
    <div className="real-world-overlay" onClick={onClose}>
      <div className="real-world-popup" onClick={e => e.stopPropagation()}>
        <div className="real-world-header">
          <h2>🌍 Real-World Applications: {gateData.title}</h2>
          <button className="real-world-close" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="real-world-content">
          <div className="gate-description">
            <h3>How it Works</h3>
            <p>{gateData.description}</p>
          </div>
          
          <h3>Real-World Examples</h3>
          <div className="examples-grid">
            {gateData.examples.map((example, index) => (
              <div key={index} className="example-card">
                <span className="example-icon">{example.icon}</span>
                <h4 className="example-title">{example.title}</h4>
                <p className="example-description">{example.description}</p>
                <p className="example-details">{example.details}</p>
              </div>
            ))}
          </div>
          
          <div className="educational-info" style={{ marginTop: '24px', padding: '16px', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd' }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#0369a1', display: 'flex', alignItems: 'center', gap: '8px' }}>
              💡 Did You Know?
            </h4>
            <p style={{ margin: '0', color: '#0c4a6e', fontSize: '14px', lineHeight: '1.5' }}>
              {gateType === 'andGate' && "AND gates are everywhere! Your computer's processor contains billions of them working together to perform calculations."}
              {gateType === 'orGate' && "OR gates enable choices in digital systems. Every time you press multiple keys on your keyboard, OR gates help determine which ones to register."}
              {gateType === 'notGate' && "NOT gates are the simplest but most important gates. They enable all other complex logic by providing signal inversion."}
              {gateType === 'xorGate' && "XOR gates power modern encryption! Every secure message sent over the internet uses XOR operations to protect your data."}
              {gateType === 'nandGate' && "NAND gates are called 'universal gates' because you can build any other logic gate using only NAND gates!"}
              {gateType === 'norGate' && "NOR gates are also universal gates! Interestingly, you can build an entire computer using only NOR gates."}
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
