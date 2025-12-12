
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, onSnapshot, getDocs } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

export default function StudentDashboard({ isOpen, onClose, onImportCircuit }) {
    const [challenges, setChallenges] = useState([]);
    const { currentUser } = useAuth();
    const [notification, setNotification] = useState({ message: '', type: 'info', show: false });

    useEffect(() => {
        if (!isOpen) return;

        const q = query(collection(db, "challenges"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedChallenges = [];
            snapshot.forEach((doc) => {
                fetchedChallenges.push({ id: doc.id, ...doc.data() });
            });
            setChallenges(fetchedChallenges);
        }, (error) => {
            console.error("Error fetching challenges: ", error);
            setNotification({ show: true, message: 'Error loading challenges: ' + error.message, type: 'error' });
        });

        return () => unsubscribe();
    }, [isOpen]);

    const loadChallenge = (challenge) => {
        onImportCircuit(challenge);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="teacher-dashboard-overlay">
            <div className="teacher-dashboard">
                <div className="teacher-dashboard-header">
                    <h2>🎒 Student Dashboard</h2>
                    <button className="close-button" onClick={onClose}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <div className="teacher-dashboard-content">
                    <div className="challenges-grid">
                        {challenges.length === 0 ? (
                            <div className="empty-state">
                                <p>No challenges available right now.</p>
                                <p style={{ fontSize: '0.9em', color: '#94a3b8' }}>
                                    (If you are a student, ask your teacher to create one.)
                                </p>
                            </div>
                        ) : (
                            challenges.map(challenge => (
                                <div key={challenge.id} className="challenge-card">
                                    <div className="challenge-header">
                                        <h4>{challenge.name}</h4>
                                        <span className={`difficulty-badge ${challenge.difficulty}`}>
                                            {challenge.difficulty}
                                        </span>
                                    </div>
                                    <p className="challenge-description">{challenge.description}</p>
                                    <div className="challenge-meta">
                                        <span>⏱️ {challenge.timeLimit} min</span>
                                        <span>👤 {challenge.authorName || 'Teacher'}</span>
                                    </div>
                                    <button
                                        onClick={() => loadChallenge(challenge)}
                                        className="action-btn load-btn"
                                        style={{ marginTop: '10px', width: '100%' }}
                                    >
                                        🚀 Start Challenge
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Debug Info Section */}
                <div style={{ padding: '10px', fontSize: '0.8em', color: '#666', borderTop: '1px solid #eee' }}>
                    <p>Debug Status: {challenges.length} challenges found.</p>
                    <button
                        onClick={async () => {
                            try {
                                alert("Starting diagnostic...");
                                const q = query(collection(db, "challenges"));
                                const snap = await getDocs(q);
                                alert(`Diagnostic Result: Found ${snap.size} documents in 'challenges' collection.`);
                            } catch (e) {
                                alert(`Diagnostic Error: ${e.message}`);
                            }
                        }}
                        style={{ padding: '5px', background: '#e2e8f0', border: '1px solid #cbd5e1', cursor: 'pointer', marginTop: '10px' }}
                    >
                        🔍 Run Diagnostics (Manual)
                    </button>
                    {notification.show && notification.type === 'error' && (
                        <p style={{ color: 'red' }}>Error: {notification.message}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
