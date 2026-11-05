import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

export default function Login() {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const onChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: credentials.email,
                    password: credentials.password
                })
            });

            const data = await res.json();

            if (res.status === 200 && data.token) {
                localStorage.setItem('token', data.token);
                if (data.user) {
                    localStorage.setItem('user', JSON.stringify(data.user));
                }
                // Notify navbar or other components
                window.dispatchEvent(new Event('authChange'));
                navigate('/products');
            } else {
                setError(data.error || 'Invalid credentials. Please try again.');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(`Cannot connect to backend server at ${API_URL}. Please ensure the server is running.`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-12 col-md-8 col-lg-5">
                    <div className="card shadow-sm border-0 p-4">
                        <div className="card-body">
                            <h2 className="text-center mb-4 fw-bold">Sign In</h2>
                            <p className="text-muted text-center mb-4">
                                Log in to access and manage your private inventory.
                            </p>

                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label fw-bold">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        className="form-control fs-5"
                                        id="email"
                                        name="email"
                                        value={credentials.email}
                                        onChange={onChange}
                                        placeholder="name@example.com"
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="password" className="form-label fw-bold">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        className="form-control fs-5"
                                        id="password"
                                        name="password"
                                        value={credentials.password}
                                        onChange={onChange}
                                        placeholder="Enter your password"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary w-100 fs-5 py-2"
                                    disabled={loading}
                                >
                                    {loading ? 'Signing in...' : 'Sign In'}
                                </button>
                            </form>

                            <div className="text-center mt-4">
                                <span className="text-muted">Don't have an account? </span>
                                <NavLink to="/register" className="fw-bold text-decoration-none">
                                    Register here
                                </NavLink>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

