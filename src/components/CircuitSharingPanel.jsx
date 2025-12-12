import React, { useState, useRef, useEffect } from 'react';
import { 
  exportCircuitToFile, 
  createShareableUrl,
  importCircuitFromFile 
} from '../utils/circuitSharingService';
import SaveIcon from './icons/SaveIcon';
import TrashIcon from './icons/TrashIcon';

/**
 * CircuitSharingPanel component for exporting and importing circuits
 */
export default function CircuitSharingPanel({ circuit, onImport, onClose }) {
  const [shareableUrl, setShareableUrl] = useState('');
  const [filename, setFilename] = useState('my-circuit');
  const [message, setMessage] = useState({ text: '', type: 'info' });
  const [activeTab, setActiveTab] = useState('share');
  const [isGeneratingUrl, setIsGeneratingUrl] = useState(false);
  const [recentShares, setRecentShares] = useState([]);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const fileInputRef = useRef(null);

  // Load recent shares from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentCircuitShares');
    if (saved) {
      try {
        setRecentShares(JSON.parse(saved));
      } catch (e) {
        console.warn('Failed to load recent shares:', e);
      }
    }
  }, []);

  // Save recent shares to localStorage
  const saveRecentShare = (shareData) => {
    const updated = [shareData, ...recentShares.filter(s => s.url !== shareData.url)].slice(0, 5);
    setRecentShares(updated);
    localStorage.setItem('recentCircuitShares', JSON.stringify(updated));
  };

  const handleExport = () => {
    try {
      if (!circuit || !circuit.nodes || circuit.nodes.length === 0) {
        showMessage('Cannot export empty circuit', 'warning');
        return;
      }

      exportCircuitToFile(circuit, filename);
      showMessage('Circuit exported successfully!', 'success');
      
      // Track export in analytics (if available)
      if (window.gtag) {
        window.gtag('event', 'circuit_export', {
          event_category: 'sharing',
          event_label: filename
        });
      }
    } catch (error) {
      showMessage('Failed to export circuit: ' + error.message, 'error');
    }
  };

  const handleCreateShareableUrl = async () => {
    if (!circuit || !circuit.nodes || circuit.nodes.length === 0) {
      showMessage('Cannot share empty circuit', 'warning');
      return;
    }

    setIsGeneratingUrl(true);
    
    try {
      const result = createShareableUrl(circuit);
      
      if (result.success) {
        setShareableUrl(result.url);
        
        // Generate QR code for the URL
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(result.url)}`;
        setQrCodeUrl(qrUrl);
        
        // Save to recent shares
        const shareData = {
          url: result.url,
          name: filename || 'Untitled Circuit',
          timestamp: Date.now(),
          components: circuit.nodes.length,
          connections: circuit.edges.length
        };
        saveRecentShare(shareData);
        
        showMessage('Shareable URL generated successfully!', 'success');
      } else {
        showMessage('Failed to generate URL: ' + result.error, 'error');
      }
    } catch (error) {
      showMessage('Error generating shareable URL', 'error');
    } finally {
      setIsGeneratingUrl(false);
    }
  };

  const handleCopyUrl = async () => {
    if (!shareableUrl) return;
    
    try {
      await navigator.clipboard.writeText(shareableUrl);
      showMessage('URL copied to clipboard!', 'success');
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = shareableUrl;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        showMessage('URL copied to clipboard!', 'success');
      } catch (e) {
        showMessage('Failed to copy URL', 'error');
      }
      document.body.removeChild(textArea);
    }
  };

  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const circuit = await importCircuitFromFile(file);
      onImport(circuit);
      showMessage('Circuit imported successfully!', 'success');
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      showMessage('Failed to import circuit: ' + error.message, 'error');
    }
  };

  const handleRecentShareClick = (share) => {
    setShareableUrl(share.url);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(share.url)}`;
    setQrCodeUrl(qrUrl);
    setActiveTab('share');
  };

  const removeRecentShare = (urlToRemove) => {
    const updated = recentShares.filter(s => s.url !== urlToRemove);
    setRecentShares(updated);
    localStorage.setItem('recentCircuitShares', JSON.stringify(updated));
  };

  const showMessage = (text, type = 'info') => {
    setMessage({ text, type, show: true });
  };

  // Clear message after 4 seconds
  useEffect(() => {
    if (message.show) {
      const timer = setTimeout(() => {
        setMessage(prev => ({ ...prev, show: false }));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [message.show]);

  const getCircuitStats = () => {
    if (!circuit || !circuit.nodes) return null;
    
    const gates = circuit.nodes.filter(n => n.type.includes('Gate')).length;
    const switches = circuit.nodes.filter(n => n.type === 'switch').length;
    const leds = circuit.nodes.filter(n => n.type === 'led').length;
    const connections = circuit.edges?.length || 0;
    
    return { gates, switches, leds, connections, total: circuit.nodes.length };
  };

  const stats = getCircuitStats();

  return (
    <div className="sharing-overlay">
      <div className="sharing-panel">
        <div className="sharing-header">
          <h2>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
              <polyline points="16,6 12,2 8,6"/>
              <line x1="12" y1="2" x2="12" y2="15"/>
            </svg>
            Circuit Sharing
          </h2>
          <button onClick={onClose} className="close-button" title="Close">
            ×
          </button>
        </div>

        {/* Circuit Statistics */}
        {stats && (
          <div className="circuit-stats">
            <h3>Circuit Overview</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Components</span>
                <span className="stat-value">{stats.total}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Gates</span>
                <span className="stat-value">{stats.gates}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Switches</span>
                <span className="stat-value">{stats.switches}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">LEDs</span>
                <span className="stat-value">{stats.leds}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Connections</span>
                <span className="stat-value">{stats.connections}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button 
            className={`tab-button ${activeTab === 'share' ? 'active' : ''}`}
            onClick={() => setActiveTab('share')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
              <polyline points="16,6 12,2 8,6"/>
              <line x1="12" y1="2" x2="12" y2="15"/>
            </svg>
            Share Online
          </button>
          <button 
            className={`tab-button ${activeTab === 'export' ? 'active' : ''}`}
            onClick={() => setActiveTab('export')}
          >
            <SaveIcon />
            Export File
          </button>
          <button 
            className={`tab-button ${activeTab === 'import' ? 'active' : ''}`}
            onClick={() => setActiveTab('import')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
            Import
          </button>
          <button 
            className={`tab-button ${activeTab === 'recent' ? 'active' : ''}`}
            onClick={() => setActiveTab('recent')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
            Recent
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {/* Share Online Tab */}
          {activeTab === 'share' && (
            <div className="share-content">
              <div className="input-group">
                <label htmlFor="circuit-name">Circuit Name</label>
                <input
                  id="circuit-name"
                  type="text"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  placeholder="Enter circuit name..."
                  className="filename-input"
                />
              </div>

              <button 
                onClick={handleCreateShareableUrl} 
                className="action-button primary"
                disabled={isGeneratingUrl}
              >
                {isGeneratingUrl ? (
                  <>
                    <div className="spinner"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.71"/>
                    </svg>
                    Generate Shareable URL
                  </>
                )}
              </button>

              {shareableUrl && (
                <div className="url-result">
                  <h4>Shareable URL Generated</h4>
                  <div className="url-container">
                    <div className="url-display">
                      <input 
                        type="text" 
                        value={shareableUrl} 
                        readOnly 
                        className="url-input"
                      />
                      <button onClick={handleCopyUrl} className="copy-button" title="Copy URL">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {qrCodeUrl && (
                    <div className="qr-code-section">
                      <h4>QR Code</h4>
                      <div className="qr-code-container">
                        <img src={qrCodeUrl} alt="QR Code" className="qr-code" />
                        <p className="qr-help">Scan with your phone to open the circuit</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Export File Tab */}
          {activeTab === 'export' && (
            <div className="export-content">
              <div className="input-group">
                <label htmlFor="export-filename">File Name</label>
                <input
                  id="export-filename"
                  type="text"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  placeholder="Enter filename..."
                  className="filename-input"
                />
                <small className="input-help">File will be saved as {filename}.circuit</small>
              </div>

              <button onClick={handleExport} className="action-button primary">
                <SaveIcon />
                Download Circuit File
              </button>

              <div className="export-info">
                <h4>About Circuit Files</h4>
                <ul>
                  <li>Files are saved in JSON format with .circuit extension</li>
                  <li>Contains all components, connections, and settings</li>
                  <li>Can be shared with others or imported later</li>
                  <li>Compatible with all versions of Logic Gate Simulator</li>
                </ul>
              </div>
            </div>
          )}

          {/* Import Tab */}
          {activeTab === 'import' && (
            <div className="import-content">
              <div className="file-upload-area" onClick={handleFileUploadClick}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10,9 9,9 8,9"/>
                </svg>
                <h3>Import Circuit File</h3>
                <p>Click here or drag and drop a .circuit file</p>
                <button className="upload-button">Choose File</button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".circuit,.json"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />

              <div className="import-info">
                <h4>Supported Formats</h4>
                <ul>
                  <li>.circuit files (recommended)</li>
                  <li>.json files with valid circuit data</li>
                </ul>
              </div>
            </div>
          )}

          {/* Recent Shares Tab */}
          {activeTab === 'recent' && (
            <div className="recent-content">
              {recentShares.length === 0 ? (
                <div className="empty-state">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12,6 12,12 16,14"/>
                  </svg>
                  <h3>No Recent Shares</h3>
                  <p>Your recently shared circuits will appear here</p>
                </div>
              ) : (
                <div className="recent-list">
                  <h4>Recent Shares</h4>
                  {recentShares.map((share, index) => (
                    <div key={index} className="recent-item">
                      <div className="recent-info">
                        <h5>{share.name}</h5>
                        <p>{new Date(share.timestamp).toLocaleDateString()}</p>
                        <small>{share.components} components, {share.connections} connections</small>
                      </div>
                      <div className="recent-actions">
                        <button 
                          onClick={() => handleRecentShareClick(share)}
                          className="action-button small"
                          title="Use this URL"
                        >
                          Use
                        </button>
                        <button 
                          onClick={() => removeRecentShare(share.url)}
                          className="action-button small danger"
                          title="Remove from recent"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Message Display */}
        {message.show && (
          <div className={`message ${message.type}`}>
            <span>{message.text}</span>
            <button onClick={() => setMessage(prev => ({ ...prev, show: false }))}>×</button>
          </div>
        )}
      </div>
    </div>
  );
}
