
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student'); // Default role
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, signup } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await signup(email, password, role);
            }
            navigate('/');
        } catch (err) {
            setError('Failed to ' + (isLogin ? 'log in' : 'create an account') + ': ' + err.message);
        }

        setLoading(false);
    }

    return (
        <div className="auth-container" style={{
            maxWidth: '400px',
            margin: '100px auto',
            padding: '2rem',
            backgroundColor: '#1e293b',
            borderRadius: '8px',
            color: 'white',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
            <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>
                {isLogin ? 'Log In' : 'Sign Up'}
            </h2>

            {error && <div style={{
                backgroundColor: '#ef4444',
                padding: '10px',
                borderRadius: '4px',
                marginBottom: '1rem',
                textAlign: 'center'
            }}>{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label>Email</label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{
                            padding: '0.5rem',
                            borderRadius: '4px',
                            border: '1px solid #475569',
                            backgroundColor: '#334155',
                            color: 'white'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label>Password</label>
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                            padding: '0.5rem',
                            borderRadius: '4px',
                            border: '1px solid #475569',
                            backgroundColor: '#334155',
                            color: 'white'
                        }}
                    />
                </div>

                {!isLogin && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label>I am a:</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            style={{
                                padding: '0.5rem',
                                borderRadius: '4px',
                                border: '1px solid #475569',
                                backgroundColor: '#334155',
                                color: 'white'
                            }}
                        >
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                        </select>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        marginTop: '1rem',
                        padding: '0.75rem',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    {isLogin ? 'Log In' : 'Sign Up'}
                </button>
            </form>

            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                {isLogin ? 'Need an account? ' : 'Already have an account? '}
                <span
                    onClick={() => setIsLogin(!isLogin)}
                    style={{ color: '#60a5fa', cursor: 'pointer', textDecoration: 'underline' }}
                >
                    {isLogin ? 'Sign Up' : 'Log In'}
                </span>
            </div>
        </div>
    );
}
