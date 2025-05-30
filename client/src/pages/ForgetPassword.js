import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../layouts/Footer';
import '../style/style.css';

function ForgetPassword() {
    // State management
    const [form, setForm] = useState({ 
        email: '', 
        otp: '', 
        password: '', 
        confirmPassword: '' 
    });
    const [uiState, setUiState] = useState({
        isInputDisabled: true,
        isEmailBlocked: false,
        isLoading: false,
        error: { show: false, message: '' }
    });
    
    const navigate = useNavigate();

    // Handlers
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const showError = (message) => {
        setUiState(prev => ({
            ...prev,
            error: { show: true, message },
            isLoading: false
        }));
    };

    const hideError = () => {
        setUiState(prev => ({
            ...prev,
            error: { show: false, message: '' }
        }));
    };

    const handleSubmit = useCallback(async () => {
        if (form.confirmPassword !== form.password) {
            return showError('Passwords do not match');
        }

        try {
            setUiState(prev => ({ ...prev, isLoading: true }));
            
            const response = await fetch(`${process.env.REACT_APP_FETCH_URL}/user/processotp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: form.email,
                    otp: form.otp,
                    password: form.password
                })
            });

            if (response.ok) {
                navigate('/login');
            } else {
                const errorMsg = response.status === 401 
                    ? 'Invalid email or OTP' 
                    : await response.text();
                showError(errorMsg);
            }
        } catch (error) {
            showError('An error occurred. Please try again.');
        } finally {
            setUiState(prev => ({ ...prev, isLoading: false }));
        }
    }, [form, navigate]);

    const handleGenerateOTP = useCallback(async () => {
        try {
            setUiState(prev => ({ ...prev, isLoading: true }));
            hideError();

            const response = await fetch(`${process.env.REACT_APP_FETCH_URL}/user/generateotp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: form.email })
            });

            if (response.ok) {
                setUiState({
                    isInputDisabled: false,
                    isEmailBlocked: true,
                    isLoading: false,
                    error: { show: false, message: '' }
                });
            } else {
                const errorMsg = response.status === 401 
                    ? 'Invalid email address' 
                    : await response.text();
                showError(errorMsg);
            }
        } catch (error) {
            showError('Failed to generate OTP. Please try again.');
        }
    }, [form.email]);

    return (
        <div className="forget-password-container">
            <div className="d-flex w-100 h-100 justify-content-center mt">
                <div className="d-flex flex-column flex-md-row">
                    {/* Loading Overlay */}
                    {uiState.isLoading && (
                        <div className="spinner-overlay">
                            <div 
                                className="spinner-border text-warning" 
                                role="status"
                                style={{ width: '6rem', height: '6rem' }}>
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    )}

                    <div className="loginBlock p-5 mt-3">
                        <h2 className="text-center mb-5">Reset Password</h2>
                        
                        {/* Email Input with OTP Button */}
                        <div className="input-group mb-3">
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="Email Address"
                                className="form-control"
                                disabled={uiState.isEmailBlocked}
                                required
                            />
                            <button 
                                onClick={handleGenerateOTP} 
                                disabled={uiState.isEmailBlocked || !form.email}
                                className="btn btn-primary"
                            >
                                Get OTP
                            </button>
                        </div>

                        {/* Resend OTP Link */}
                        <div className="d-flex justify-content-end mb-3">
                            <button 
                                disabled={uiState.isInputDisabled} 
                                onClick={handleGenerateOTP} 
                                className="btn btn-link text-decoration-none"
                            >
                                Resend OTP
                            </button>
                        </div>

                        {/* Error Alert */}
                        {uiState.error.show && (
                            <div className="alert alert-danger mb-3">
                                {uiState.error.message}
                            </div>
                        )}

                        {/* OTP Input */}
                        <div className="form-group mb-3">
                            <input
                                type="text"
                                name="otp"
                                value={form.otp}
                                className="form-control"
                                onChange={handleChange}
                                placeholder="OTP"
                                disabled={uiState.isInputDisabled}
                                required
                            />
                        </div>

                        {/* Password Inputs */}
                        <div className="form-group mb-3">
                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                className="form-control"
                                onChange={handleChange}
                                disabled={uiState.isInputDisabled}
                                placeholder="New Password"
                                minLength="6"
                                required
                            />
                        </div>
                        <div className="form-group mb-4">
                            <input
                                type="password"
                                className="form-control"
                                name="confirmPassword"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                disabled={uiState.isInputDisabled}
                                placeholder="Confirm New Password"
                                minLength="6"
                                required
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="d-flex justify-content-center">
                            <Link to="/login" className="btn btn-danger me-3">
                                Cancel
                            </Link>
                            <button
                                disabled={uiState.isInputDisabled || uiState.isLoading}
                                onClick={handleSubmit}
                                className="btn btn-primary"
                            >
                                {uiState.isLoading ? 'Processing...' : 'Submit'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-center mt-3">
                <Footer />
            </div>
        </div>
    );
}

export default ForgetPassword;