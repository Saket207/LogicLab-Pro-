import React, { useState } from 'react';
import { validateChallenge } from '../utils/circuitValidator';
import { db } from '../firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

export default function StudentChallengePanel({ challenge, nodes, edges, onComplete }) {
    const [result, setResult] = useState(null);
    const [score, setScore] = useState(0);
    const { currentUser } = useAuth();

    const handleCheckSolution = async () => {
        if (!challenge.targetBehavior) {
            setResult({ success: false, message: "This challenge has no automated validation criteria." });
            return;
        }

        // Unwrap targetBehavior for validation (converting {values: []} back to [])
        let validationConfig = challenge.targetBehavior;
        if (validationConfig && validationConfig.rows && validationConfig.rows.length > 0 && !Array.isArray(validationConfig.rows[0])) {
            validationConfig = {
                ...validationConfig,
                rows: validationConfig.rows.map(r => r.values)
            };
        }

        const validation = validateChallenge(nodes, edges, validationConfig);
        setResult(validation);

        if (validation.success) {
            // Calculate score based on difficulty and time (mock logic)
            const baseScore = challenge.difficulty === 'hard' ? 500 : challenge.difficulty === 'intermediate' ? 300 : 100;
            setScore(baseScore);

            if (currentUser) {
                try {
                    // Check if already completed? For now just add a record.
                    await addDoc(collection(db, "completions"), {
                        userId: currentUser.uid,
                        studentEmail: currentUser.email,
                        studentName: currentUser.displayName || currentUser.email.split('@')[0],
                        challengeId: challenge.id,
                        challengeName: challenge.name,
                        teacherId: challenge.createdBy || null,
                        score: baseScore,
                        completedAt: new Date().toISOString()
                    });
                } catch (e) {
                    console.error("Error saving completion", e);
                }
            }

            if (onComplete) onComplete(baseScore);
        }
    };

    if (!challenge) return null;

    return (
        <div className="student-challenge-panel sidebar-section">
            <div className="challenge-header-panel">
                <h3>🎯 Current Challenge</h3>
                <div className="challenge-badge">{challenge.difficulty}</div>
            </div>

            <h4>{challenge.name}</h4>
            <p className="challenge-desc">{challenge.description}</p>

            <div className="challenge-meta-info">
                <div className="meta-item">
                    <span className="label">Time Limit:</span>
                    <span className="value">{challenge.timeLimit} mins</span>
                </div>
                {/* Timer implementation could go here */}
            </div>

            <div className="challenge-criteria">
                <h5>Success Criteria:</h5>
                <p>{challenge.successCriteria || "Match the expected truth table."}</p>
            </div>

            <div className="challenge-hints">
                <h5>Hints:</h5>
                <ul>
                    {challenge.hints && challenge.hints.map((hint, i) => (
                        hint && <li key={i}>{hint}</li>
                    ))}
                </ul>
            </div>

            <div className="challenge-actions">
                <button
                    className="check-solution-btn"
                    onClick={handleCheckSolution}
                >
                    ✅ Verify Solution
                </button>
            </div>

            {result && (
                <div className={`validation-result ${result.success ? 'success' : 'error'}`}>
                    <strong>{result.success ? '🎉 Success!' : '❌ Incorrect'}</strong>
                    <p>{result.message}</p>
                    {result.success && <div className="score-display">Points Earned: {score}</div>}
                </div>
            )}
        </div>
    );
}
