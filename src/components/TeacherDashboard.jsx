import React, { useState, useEffect } from 'react';
import { generateTruthTable } from '../utils/circuitValidator';
import { db } from '../firebase';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

export default function TeacherDashboard({ isOpen, onClose, currentCircuit, onImportCircuit }) {

  const [activeTab, setActiveTab] = useState('challenges'); // challenges, create, examples, leaderboard
  const [challenges, setChallenges] = useState([]);
  const [completions, setCompletions] = useState([]);
  const [challengeForm, setChallengeForm] = useState({
    name: '',
    description: '',
    difficulty: 'intermediate',
    timeLimit: 15,
    successCriteria: '',
    hints: ['']
  });
  const [capturedBehavior, setCapturedBehavior] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: 'info', show: false });

  const { currentUser } = useAuth();

  // Load saved challenges from Firestore
  useEffect(() => {
    async function fetchChallenges() {
      if (!currentUser) return;

      try {
        const q = query(
          collection(db, "challenges"),
          where("createdBy", "==", currentUser.uid)
        );

        const querySnapshot = await getDocs(q);
        const fetchedChallenges = [];
        querySnapshot.forEach((doc) => {
          fetchedChallenges.push({ id: doc.id, ...doc.data() });
        });
        setChallenges(fetchedChallenges);
      } catch (error) {
        console.error("Error fetching challenges: ", error);
        if (error.code === 'permission-denied') {
          showNotification('Permission Error: Check Firestore rules.', 'error');
        } else {
          showNotification(`Error: ${error.message}`, 'error');
        }
      }
    }

    fetchChallenges();
  }, [currentUser]);

  // Load leaderboard data
  useEffect(() => {
    if (!currentUser) return;
    // Real-time listener for completions collection
    const unsub = onSnapshot(collection(db, "completions"), (snapshot) => {
      const fetched = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        fetched.push({ id: doc.id, ...data });
      });
      // Filter by teacherId if present
      const filtered = fetched.filter(c => !c.teacherId || c.teacherId === currentUser.uid);
      filtered.sort((a, b) => b.score - a.score);
      setCompletions(filtered);
    }, (error) => {
      console.error("Error loading leaderboard", error);
      showNotification('Error loading leaderboard', 'error');
    });
    return () => unsub();
  }, [currentUser]);

  // Show notification
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type, show: true });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  // Capture solution behavior (Truth Table)
  const captureBehavior = () => {
    if (!currentCircuit.nodes || currentCircuit.nodes.length === 0) {
      showNotification('Canvas is empty. Build the solution circuit first.', 'warning');
      return;
    }

    // Generate truth table from current circuit (Solution)
    const truthTable = generateTruthTable(currentCircuit.nodes, currentCircuit.edges);

    if (truthTable.rows.length === 0) {
      showNotification('Circuit must have switches and outputs to be captured.', 'warning');
      return;
    }

    setCapturedBehavior(truthTable);
    showNotification('Solution behavior captured! Now you can modify the circuit to create the student template.', 'success');
  };

  // Create challenge from current circuit
  const createChallengeFromCircuit = async () => {
    if (!currentCircuit.nodes || currentCircuit.nodes.length === 0) {
      showNotification('Please create a circuit first before saving as a challenge.', 'warning');
      return;
    }

    // Sanitize circuit data for Firestore
    const sanitizedCircuit = {
      nodes: currentCircuit.nodes.map(node => ({
        id: node.id,
        type: node.type || 'unknown',
        position: { x: Number(node.position.x) || 0, y: Number(node.position.y) || 0 },
        data: {
          label: node.data.label || '',
          state: !!node.data.state // Force boolean
        }
      })),
      edges: currentCircuit.edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle || 'out',
        targetHandle: edge.targetHandle || 'in'
      }))
    };

    const newChallenge = {
      ...challengeForm,
      circuit: sanitizedCircuit,
      // Fix: Firestore does not support nested arrays (rows is [][]string). 
      // We must wrap the inner array in an object.
      targetBehavior: capturedBehavior ? {
        headers: capturedBehavior.headers,
        rows: capturedBehavior.rows.map(row => ({ values: row }))
      } : null,
      createdAt: new Date().toISOString(),
      createdBy: currentUser.uid,
      authorName: currentUser.email || 'Teacher'
    };

    try {
      const docRef = await addDoc(collection(db, "challenges"), newChallenge);
      console.log("Challenge created with ID: ", docRef.id);

      // When adding to local state, we should probably keep it consistent or reload it?
      // Since our UI doesn't use the specific struct of targetBehavior for display list, this is fine.
      // But if we load it back, we need to unwrap it.

      const newItems = [...challenges, { id: docRef.id, ...newChallenge }];
      setChallenges(newItems);
      showNotification('Challenge saved to cloud successfully!', 'success');
      // alert(`Debug: Challenge saved! ID: ${docRef.id}`); // User confirmed error is gone, removing alert
      setCapturedBehavior(null);
    } catch (e) {
      console.error("Error adding document: ", e);
      // alert(`Debug Error Saving: ${e.message}`); // Removing debug alert
      showNotification('Error saving challenge to cloud: ' + e.message, 'error');
    }

    // Reset form
    setChallengeForm({
      name: '',
      description: '',
      difficulty: 'intermediate',
      timeLimit: 15,
      successCriteria: '',
      hints: ['']
    });

    showNotification('Challenge created successfully!', 'success');
  };

  // Generate shareable URL for challenge
  const generateChallengeUrl = (challenge) => {
    try {
      // Encode the entire challenge object, not just the circuit
      const encoded = encodeURIComponent(JSON.stringify(challenge));
      const url = `${window.location.origin}${window.location.pathname}?challenge=${encoded}`;
      navigator.clipboard.writeText(url);
      showNotification('Challenge URL copied to clipboard!', 'success');
    } catch (error) {
      showNotification('Error generating URL', 'error');
    }
  };

  // Export challenge as file
  const exportChallenge = (challenge) => {
    try {
      const dataStr = JSON.stringify(challenge, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${challenge.name.toLowerCase().replace(/\s+/g, '-')}.challenge.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showNotification('Challenge exported successfully!', 'success');
    } catch (error) {
      showNotification('Error exporting challenge', 'error');
    }
  };

  // Delete challenge
  const deleteChallenge = async (challengeId) => {
    if (!window.confirm("Are you sure you want to delete this challenge?")) return;

    try {
      await deleteDoc(doc(db, "challenges", challengeId));
      setChallenges(challenges.filter(c => c.id !== challengeId));
      showNotification('Challenge deleted', 'info');
    } catch (error) {
      console.error("Error deleting document: ", error);
      showNotification('Error deleting challenge', 'error');
    }
  };

  // Load challenge into workspace
  const loadChallenge = (challenge) => {
    // Pass the entire challenge object so App can detect it's a challenge
    onImportCircuit(challenge);
    showNotification('Challenge loaded into workspace', 'success');
  };

  // Add hint field
  const addHint = () => {
    setChallengeForm(prev => ({
      ...prev,
      hints: [...prev.hints, '']
    }));
  };

  // Update hint
  const updateHint = (index, value) => {
    setChallengeForm(prev => ({
      ...prev,
      hints: prev.hints.map((hint, i) => i === index ? value : hint)
    }));
  };

  // Remove hint
  const removeHint = (index) => {
    setChallengeForm(prev => ({
      ...prev,
      hints: prev.hints.filter((_, i) => i !== index)
    }));
  };

  // Example circuits
  const exampleCircuits = [
    {
      name: 'Basic AND Gate',
      description: 'Simple AND gate circuit with two inputs and one output',
      circuit: {
        nodes: [
          { id: 'switch-1', type: 'switch', position: { x: 100, y: 100 }, data: { label: 'Input A', state: false } },
          { id: 'switch-2', type: 'switch', position: { x: 100, y: 200 }, data: { label: 'Input B', state: false } },
          { id: 'and-1', type: 'andGate', position: { x: 300, y: 150 }, data: { label: 'AND' } },
          { id: 'led-1', type: 'led', position: { x: 500, y: 150 }, data: { label: 'Output', state: false } }
        ],
        edges: [
          { id: 'e1', source: 'switch-1', target: 'and-1', sourceHandle: 'out', targetHandle: 'in1' },
          { id: 'e2', source: 'switch-2', target: 'and-1', sourceHandle: 'out', targetHandle: 'in2' },
          { id: 'e3', source: 'and-1', target: 'led-1', sourceHandle: 'out', targetHandle: 'in' }
        ]
      }
    },
    {
      name: 'Half Adder',
      description: 'Binary half adder with sum and carry outputs',
      circuit: {
        nodes: [
          { id: 'switch-1', type: 'switch', position: { x: 100, y: 100 }, data: { label: 'A', state: false } },
          { id: 'switch-2', type: 'switch', position: { x: 100, y: 200 }, data: { label: 'B', state: false } },
          { id: 'half-adder-1', type: 'halfAdder', position: { x: 300, y: 150 }, data: { label: 'Half Adder' } },
          { id: 'led-sum', type: 'led', position: { x: 500, y: 100 }, data: { label: 'Sum', state: false } },
          { id: 'led-carry', type: 'led', position: { x: 500, y: 200 }, data: { label: 'Carry', state: false } }
        ],
        edges: [
          { id: 'e1', source: 'switch-1', target: 'half-adder-1', sourceHandle: 'out', targetHandle: 'a' },
          { id: 'e2', source: 'switch-2', target: 'half-adder-1', sourceHandle: 'out', targetHandle: 'b' },
          { id: 'e3', source: 'half-adder-1', target: 'led-sum', sourceHandle: 'sum', targetHandle: 'in' },
          { id: 'e4', source: 'half-adder-1', target: 'led-carry', sourceHandle: 'carry', targetHandle: 'in' }
        ]
      }
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="teacher-dashboard-overlay">
      <div className="teacher-dashboard">
        {/* Header */}
        <div className="teacher-dashboard-header">
          <h2>🎓 Teacher Dashboard</h2>
          <button className="close-button" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="teacher-dashboard-tabs">
          <button
            className={`tab-button ${activeTab === 'challenges' ? 'active' : ''}`}
            onClick={() => setActiveTab('challenges')}
          >
            📝 Challenges
          </button>
          <button
            className={`tab-button ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            ➕ Create Challenge
          </button>
          <button
            className={`tab-button ${activeTab === 'examples' ? 'active' : ''}`}
            onClick={() => setActiveTab('examples')}
          >
            📚 Examples
          </button>
          <button
            className={`tab-button ${activeTab === 'leaderboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('leaderboard')}
          >
            🏆 Leaderboard
          </button>
        </div>

        {/* Content Area */}
        <div className="teacher-dashboard-content">
          {/* Challenges Tab */}
          {activeTab === 'challenges' && (
            <div className="challenges-tab">
              <h3>Saved Challenges ({challenges.length})</h3>
              {challenges.length === 0 ? (
                <div className="empty-state">
                  <p>No challenges created yet. Switch to the "Create Challenge" tab to get started!</p>
                </div>
              ) : (
                <div className="challenges-list">
                  {challenges.map(challenge => (
                    <div key={challenge.id} className="challenge-card">
                      <div className="challenge-header">
                        <h4>{challenge.name}</h4>
                        <div className="challenge-difficulty">
                          <span className={`difficulty-badge ${challenge.difficulty}`}>
                            {challenge.difficulty}
                          </span>
                        </div>
                      </div>
                      <p className="challenge-description">{challenge.description}</p>
                      <div className="challenge-meta">
                        <span>⏱️ {challenge.timeLimit} min</span>
                        <span>📅 {new Date(challenge.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="challenge-actions">
                        <button onClick={() => loadChallenge(challenge)} className="action-btn load-btn">
                          📂 Load
                        </button>
                        <button onClick={() => generateChallengeUrl(challenge)} className="action-btn share-btn">
                          🔗 Share
                        </button>
                        <button onClick={() => exportChallenge(challenge)} className="action-btn export-btn">
                          💾 Export
                        </button>
                        <button onClick={() => deleteChallenge(challenge.id)} className="action-btn delete-btn">
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Create Challenge Tab */}
          {activeTab === 'create' && (
            <div className="create-challenge-tab">
              <h3>Create New Challenge</h3>
              <form className="challenge-form" onSubmit={(e) => { e.preventDefault(); createChallengeFromCircuit(); }}>
                <div className="form-group">
                  <label htmlFor="challenge-name">Challenge Name *</label>
                  <input
                    id="challenge-name"
                    type="text"
                    value={challengeForm.name}
                    onChange={(e) => setChallengeForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Build an XOR Gate"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="challenge-description">Description *</label>
                  <textarea
                    id="challenge-description"
                    value={challengeForm.description}
                    onChange={(e) => setChallengeForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what students need to accomplish..."
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="difficulty">Difficulty</label>
                    <select
                      id="difficulty"
                      value={challengeForm.difficulty}
                      onChange={(e) => setChallengeForm(prev => ({ ...prev, difficulty: e.target.value }))}
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="time-limit">Time Limit (minutes)</label>
                    <input
                      id="time-limit"
                      type="number"
                      min="5"
                      max="120"
                      value={challengeForm.timeLimit}
                      onChange={(e) => setChallengeForm(prev => ({ ...prev, timeLimit: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="success-criteria">Success Criteria</label>
                  <textarea
                    id="success-criteria"
                    value={challengeForm.successCriteria}
                    onChange={(e) => setChallengeForm(prev => ({ ...prev, successCriteria: e.target.value }))}
                    placeholder="How will students know they've completed the challenge?"
                  />
                </div>

                <div className="form-group behavior-capture-section">
                  <label>Evaluation Logic</label>
                  <p className="help-text">
                    1. Build the <strong>Solution Circuit</strong> first.<br />
                    2. Click "Capture Solution" below to save the expected behavior (Truth Table).<br />
                    3. Then, modify the circuit on the canvas (delete wires/gates) to create the <strong>Student Template</strong>.<br />
                    4. Finally, save the challenge.
                  </p>
                  {capturedBehavior ? (
                    <div className="capture-status success">
                      ✅ Solution behavior captured ({capturedBehavior.rows.length} test cases)
                      <button type="button" className="re-capture-btn" onClick={() => setCapturedBehavior(null)}>Reset</button>
                    </div>
                  ) : (
                    <button type="button" className="capture-btn" onClick={captureBehavior}>
                      🎯 Capture Solution from Current Workspace
                    </button>
                  )}
                </div>

                <div className="form-group">
                  <label>Hints</label>
                  {challengeForm.hints.map((hint, index) => (
                    <div key={index} className="hint-input">
                      <input
                        type="text"
                        value={hint}
                        onChange={(e) => updateHint(index, e.target.value)}
                        placeholder={`Hint ${index + 1}...`}
                      />
                      {challengeForm.hints.length > 1 && (
                        <button
                          type="button"
                          className="remove-hint-btn"
                          onClick={() => removeHint(index)}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" className="add-hint-btn" onClick={addHint}>
                    + Add Hint
                  </button>
                </div>

                <div className="form-actions">
                  <button type="submit" className="create-challenge-btn">
                    💾 Save Challenge from Current Circuit
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Examples Tab */}
          {activeTab === 'examples' && (
            <div className="examples-tab">
              <h3>Example Circuits</h3>
              <p>Load these pre-built circuits as starting points for your challenges:</p>
              <div className="examples-grid">
                {exampleCircuits.map((example, index) => (
                  <div key={index} className="example-card">
                    <h4>{example.name}</h4>
                    <p>{example.description}</p>
                    <button onClick={() => loadChallenge(example)} className="load-example-btn">
                      📂 Load Example
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === 'leaderboard' && (
            <div className="leaderboard-tab">
              <h3>🏆 Student Progress & Leaderboard</h3>
              {completions.length === 0 ? (
                <div className="empty-state"><p>No completions recorded yet.</p></div>
              ) : (
                <div className="table-container">
                  <table className="leaderboard-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Challenge</th>
                        <th>Score</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {completions.map(c => (
                        <tr key={c.id}>
                          <td>
                            <div className="student-info">
                              <strong>{c.studentName || 'Unknown'}</strong>
                              <small>{c.studentEmail || 'No email'}</small>
                            </div>
                          </td>
                          <td>{c.challengeName || c.challengeId}</td>
                          <td><span className="score-badge">{c.score}</span></td>
                          <td>{new Date(c.completedAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notification */}
        {notification.show && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
          </div>
        )}
      </div>
    </div>
  );
}