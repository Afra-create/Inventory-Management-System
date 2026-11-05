import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

export default function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match. Please re-enter.');
            return;
        }

        if (formData.password.length < 5) {
            setError('Password must be at least 5 characters long.');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                })
            });

            const data = await res.json();

            if (res.status === 201 && data.token) {
                localStorage.setItem('token', data.token);
                if (data.user) {
                    localStorage.setItem('user', JSON.stringify(data.user));
                }
                // Notify navbar or other components
                window.dispatchEvent(new Event('authChange'));
                navigate('/products');
            } else {
                setError(data.error || 'Registration failed. Please try again.');
            }
        } catch (err) {
            console.error('Registration error:', err);
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
                            <h2 className="text-center mb-4 fw-bold">Create Account</h2>
                            <p className="text-muted text-center mb-4">
                                Sign up for a personal account to manage your private inventory.
                            </p>

                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="name" className="form-label fw-bold">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control fs-5"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={onChange}
                                        placeholder="e.g. John Doe"
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label fw-bold">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        className="form-control fs-5"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={onChange}
                                        placeholder="name@example.com"
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label fw-bold">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        className="form-control fs-5"
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={onChange}
                                        placeholder="At least 5 characters"
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="confirmPassword" className="form-label fw-bold">
                                        Confirm Password
                                    </label>
                                    <input
                                        type="password"
                                        className="form-control fs-5"
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={onChange}
                                        placeholder="Re-enter your password"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary w-100 fs-5 py-2"
                                    disabled={loading}
                                >
                                    {loading ? 'Creating Account...' : 'Register'}
                                </button>
                            </form>

                            <div className="text-center mt-4">
                                <span className="text-muted">Already have an account? </span>
                                <NavLink to="/login" className="fw-bold text-decoration-none">
                                    Sign In here
                                </NavLink>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

