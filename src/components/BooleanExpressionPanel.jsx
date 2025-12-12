import React, { useState, useEffect } from 'react';
import { generateExpression, simplifyExpression } from '../utils/expressionGenerator';

export default function BooleanExpressionPanel({ nodes, edges }) {
  const [expanded, setExpanded] = useState(false);
  const [localExpressions, setLocalExpressions] = useState({});

  // Use useEffect to perform the expression generation
  useEffect(() => {
    try {
      const expressions = generateExpression(nodes, edges);
      setLocalExpressions(expressions);
      
      console.log('BooleanExpressionPanel updated:', {
        nodesCount: nodes.length,
        edgesCount: edges.length,
        expressionsCount: Object.keys(expressions).length,
        expressions
      });
    } catch (err) {
      console.error('Error generating expressions:', err);
      setLocalExpressions({});
    }
  }, [nodes, edges]);
  
  const formatExpression = (expr) => {
    if (!expr) return '';
    
    // Add syntax highlighting and formatting
    return expr
      .replace(/•/g, '<span class="operator and">•</span>')
      .replace(/\+/g, '<span class="operator or">+</span>')
      .replace(/¬/g, '<span class="operator not">¬</span>')
      .replace(/⊕/g, '<span class="operator xor">⊕</span>')
      .replace(/\(/g, '<span class="bracket">(</span>')
      .replace(/\)/g, '<span class="bracket">)</span>')
      .replace(/Switch \d+/g, match => `<span class="variable">${match}</span>`);
  };
  
  const copyToClipboard = (text) => {
    // Strip HTML tags for clipboard
    const tempElement = document.createElement('div');
    tempElement.innerHTML = text;
    const plainText = tempElement.textContent || '';
    
    navigator.clipboard.writeText(plainText)
      .then(() => {
        alert('Expression copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };
  
  if (!localExpressions || Object.keys(localExpressions).length === 0) {
    return (
      <div className="boolean-expression-panel sidebar-section">
        <div className="panel-header">
          <h3>Boolean Expression</h3>
          <button 
            className="toggle-button disabled" 
            disabled
            title="No expressions available"
          >
            +
          </button>
        </div>
        <div className="expression-content">
          <p className="empty-message">Add LEDs to your circuit to see the Boolean expressions.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`boolean-expression-panel sidebar-section ${expanded ? 'expanded' : ''}`}>
      <div className="panel-header">
        <h3>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path>
            <path d="M22 4L12 14.01l-3-3"></path>
          </svg>
          Boolean Expression
        </h3>
        <div className="panel-controls">
          <button 
            className="toggle-button" 
            onClick={() => setExpanded(!expanded)}
            title={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? "−" : "+"}
          </button>
        </div>
      </div>
      
      <div className="expression-content">
        {Object.entries(localExpressions).map(([ledId, { label, expression }]) => (
          <div key={ledId} className="expression-item">
            <div className="expression-header">
              <div className="expression-label">{label} <span className="equals-sign">=</span></div>
              <button 
                className="copy-btn" 
                onClick={() => copyToClipboard(expression)}
                title="Copy expression"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
                </svg>
              </button>
            </div>
            <div 
              className="expression-formula"
              dangerouslySetInnerHTML={{ 
                __html: formatExpression(expression || '?') 
              }}
            />
            <div className="expression-simplified">
              <span className="simplified-label">Simplified:</span>
              <span 
                dangerouslySetInnerHTML={{ 
                  __html: formatExpression(
                    expression ? simplifyExpression(expression) : ''
                  ) 
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}