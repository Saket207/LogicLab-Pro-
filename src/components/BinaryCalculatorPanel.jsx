import React, { useState, useCallback } from 'react';

export default function BinaryCalculatorPanel({ nodes, edges, onAddPrebuiltCircuit }) {
  const [selectedOperation, setSelectedOperation] = useState('add');
  const [bitWidth, setBitWidth] = useState(4);
  const [inputA, setInputA] = useState('');
  const [inputB, setInputB] = useState('');
  
  // Convert binary string to decimal
  const binaryToDecimal = (binary) => {
    return parseInt(binary.replace(/[^01]/g, '') || '0', 2);
  };
  
  // Convert decimal to binary with specified width
  const decimalToBinary = (decimal, width) => {
    return (decimal >>> 0).toString(2).padStart(width, '0');
  };
  
  // Calculate result based on operation
  const calculateResult = useCallback(() => {
    const a = binaryToDecimal(inputA);
    const b = binaryToDecimal(inputB);
    let result = 0;
    let carry = false;
    
    switch (selectedOperation) {
      case 'add':
        result = a + b;
        carry = result >= Math.pow(2, bitWidth);
        break;
      case 'subtract':
        result = Math.max(0, a - b);
        break;
      case 'multiply':
        result = a * b;
        carry = result >= Math.pow(2, bitWidth);
        break;
      case 'and':
        result = a & b;
        break;
      case 'or':
        result = a | b;
        break;
      case 'xor':
        result = a ^ b;
        break;
      default:
        result = 0;
    }
    
    // Mask result to fit bit width
    result = result & ((1 << bitWidth) - 1);
    
    return {
      binary: decimalToBinary(result, bitWidth),
      decimal: result,
      carry,
      overflow: carry && ['add', 'multiply'].includes(selectedOperation)
    };
  }, [inputA, inputB, selectedOperation, bitWidth]);
  
  const result = calculateResult();
    // Prebuilt circuit generators (non-duplicate circuits only)
  const addMultiLED = useCallback(() => {
    onAddPrebuiltCircuit('multiLED', { ledCount: bitWidth });
  }, [onAddPrebuiltCircuit, bitWidth]);
  
  return (
    <div className="binary-calculator-panel">
      <h3>🧮 Binary Calculator & Circuits</h3>
      
      {/* Calculator Section */}
      <div className="calculator-section">
        <h4>Binary Calculator</h4>
        
        {/* Bit width selector */}
        <div className="control-group">
          <label>Bit Width:</label>
          <select 
            value={bitWidth} 
            onChange={(e) => setBitWidth(parseInt(e.target.value))}
            className="bit-width-select"
          >
            <option value={4}>4-bit</option>
            <option value={8}>8-bit</option>
            <option value={16}>16-bit</option>
          </select>
        </div>
        
        {/* Operation selector */}
        <div className="control-group">
          <label>Operation:</label>
          <select 
            value={selectedOperation} 
            onChange={(e) => setSelectedOperation(e.target.value)}
            className="operation-select"
          >
            <option value="add">Addition (+)</option>
            <option value="subtract">Subtraction (-)</option>
            <option value="multiply">Multiplication (×)</option>
            <option value="and">Bitwise AND (&)</option>
            <option value="or">Bitwise OR (|)</option>
            <option value="xor">Bitwise XOR (^)</option>
          </select>
        </div>
        
        {/* Input fields */}
        <div className="binary-inputs">
          <div className="input-group">
            <label>Input A (binary):</label>
            <input
              type="text"
              value={inputA}
              onChange={(e) => setInputA(e.target.value)}
              placeholder={`Enter ${bitWidth}-bit binary`}
              className="binary-input"
              pattern="[01]*"
            />
            <span className="decimal-display">
              Dec: {binaryToDecimal(inputA)}
            </span>
          </div>
          
          <div className="input-group">
            <label>Input B (binary):</label>
            <input
              type="text"
              value={inputB}
              onChange={(e) => setInputB(e.target.value)}
              placeholder={`Enter ${bitWidth}-bit binary`}
              className="binary-input"
              pattern="[01]*"
            />
            <span className="decimal-display">
              Dec: {binaryToDecimal(inputB)}
            </span>
          </div>
        </div>
        
        {/* Result display */}
        <div className="result-display">
          <h5>Result:</h5>
          <div className="result-binary">
            Binary: <span className="binary-value">{result.binary}</span>
          </div>
          <div className="result-decimal">
            Decimal: <span className="decimal-value">{result.decimal}</span>
          </div>
          {result.overflow && (
            <div className="overflow-warning">
              ⚠️ Overflow detected!
            </div>
          )}
          {result.carry && (
            <div className="carry-indicator">
              Carry: 1
            </div>
          )}
        </div>
      </div>
        {/* Prebuilt Circuits Section */}
      <div className="prebuilt-circuits-section">
        <h4>⚡ Add Circuit Components</h4>
        <p className="section-note">Note: Basic adder circuits are available in the Examples sidebar.</p>
        
        <div className="circuit-buttons">
          <button onClick={addMultiLED} className="circuit-btn multi-led-btn">
            <div className="btn-icon">💡</div>
            <div className="btn-text">
              <strong>Multi-LED Display</strong>
              <small>{bitWidth}-bit output display</small>
            </div>
          </button>
        </div>
      </div>
        {/* Educational Info */}
      <div className="educational-info">
        <h4>📚 Binary Operations Guide</h4>
        <div className="info-cards">
          <div className="info-card">
            <strong>Addition (+)</strong>
            <p>Binary addition with carry propagation</p>
            <code>1 + 1 = 10 (binary)</code>
          </div>
          
          <div className="info-card">
            <strong>Bitwise AND (&)</strong>
            <p>Logical AND on each bit position</p>
            <code>1010 & 1100 = 1000</code>
          </div>
          
          <div className="info-card">
            <strong>Bitwise XOR (^)</strong>
            <p>Exclusive OR on each bit position</p>
            <code>1010 ^ 1100 = 0110</code>
          </div>
          
          <div className="info-card">
            <strong>Multi-LED Display</strong>
            <p>Visual display for multi-bit outputs</p>
            <small>Connect circuit outputs to see binary values</small>
          </div>
        </div>
      </div>
    </div>
  );
}
