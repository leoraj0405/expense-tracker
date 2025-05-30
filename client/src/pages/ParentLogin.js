import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaAngleDoubleDown } from 'react-icons/fa';
import { RiLockPasswordFill } from 'react-icons/ri';
import '../style/style.css';
import Footer from '../layouts/Footer';

function ParentLogin() {
    const [formData, setFormData] = useState({ 
        email: 'iamnotraj02@gmail.com', 
        otp: '' 
    });
    const [uiState, setUiState] = useState({
        isInputDisabled: false,
        showErrorAlert: false,
        isLoading: false,
        isSubmitDisabled: true
    });
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleGenerateOtp = async () => {
        try {
            setUiState(prev => ({ ...prev, isLoading: true }));
            
            const response = await fetch(`${process.env.REACT_APP_FETCH_URL}/user/parentgenerateotp`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    parentEmail: formData.email
                })
            });

            if (response.ok) {
                setUiState(prev => ({
                    ...prev,
                    isInputDisabled: true,
                    isSubmitDisabled: false,
                    showErrorAlert: false
                }));
            } else {
                const errorData = await response.json();
                setErrorMessage(errorData.message || 'Failed to generate OTP');
                setUiState(prev => ({
                    ...prev,
                    showErrorAlert: true
                }));
            }
        } catch (error) {
            setErrorMessage('Network error. Please try again.');
            setUiState(prev => ({
                ...prev,
                showErrorAlert: true
            }));
        } finally {
            setUiState(prev => ({ ...prev, isLoading: false }));
        }
    };

    const handleProcessOtp = async () => {
        try {
            setUiState(prev => ({ ...prev, isLoading: true }));
            
            const response = await fetch(`${process.env.REACT_APP_FETCH_URL}/user/parentproccessotp`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: 'include',
                body: JSON.stringify({
                    parentEmail: formData.email,
                    parentOtp: formData.otp
                })
            });

            if (response.ok) {
                navigate('/parenthome');
            } else {
                const errorData = await response.json();
                setErrorMessage(errorData.message || 'Invalid OTP. Please try again.');
                setUiState(prev => ({
                    ...prev,
                    showErrorAlert: true
                }));
            }
        } catch (error) {
            setErrorMessage('Network error. Please try again.');
            setUiState(prev => ({
                ...prev,
                showErrorAlert: true
            }));
        } finally {
            setUiState(prev => ({ ...prev, isLoading: false }));
        }
    };

    const resetForm = () => {
        setFormData({ email: '', otp: '' });
        setUiState({
            isInputDisabled: false,
            showErrorAlert: false,
            isLoading: false,
            isSubmitDisabled: true
        });
    };

    return (
        <>
            <div className="d-flex w-100 h-100 justify-content-center mt">
                <div className="d-flex flex-column flex-md-row">
                    {/* Login Form */}
                    <div className="loginBlock p-5 mt-3">
                        <h1>Parent Login</h1>
                        
                        {/* Error Alert */}
                        {uiState.showErrorAlert && (
                            <div className="alert alert-danger">
                                {errorMessage || 'Error occurred. Please try again.'}
                            </div>
                        )}
                        
                        {/* Email Input */}
                        <div className="d-flex flex-column">
                            <label htmlFor="email" className="form-label">
                                Email Address
                            </label>
                            <div className="input-group mb-3">
                                <span className="input-group-text">
                                    <FaUser />
                                </span>
                                <input
                                    type="email"
                                    name="email"
                                    className="form-control"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    disabled={uiState.isInputDisabled}
                                    required
                                />
                            </div>
                            
                            {/* OTP Actions */}
                            <div>
                                <button
                                    className="btn btn-primary m-2"
                                    onClick={handleGenerateOtp}
                                    disabled={uiState.isLoading || uiState.isInputDisabled}
                                >
                                    {uiState.isLoading ? 'Generating...' : 'Generate OTP'}
                                </button>
                                <Link
                                    className="btn btn-link text-dark"
                                    onClick={handleGenerateOtp}
                                >
                                    Resend OTP
                                </Link>
                            </div>
                            
                            {/* OTP Input */}
                            <label htmlFor="otp" className="form-label mt-3">
                                Enter OTP
                            </label>
                            <div className="input-group mb-3">
                                <span className="input-group-text">
                                    <RiLockPasswordFill />
                                </span>
                                <input
                                    type="text"
                                    name="otp"
                                    maxLength={6}
                                    className="form-control"
                                    value={formData.otp}
                                    onChange={handleInputChange}
                                    disabled={uiState.isSubmitDisabled}
                                    required
                                />
                            </div>
                            
                            {/* Form Actions */}
                            <div className="text-center">
                                <button
                                    className="btn btn-warning m-2"
                                    onClick={resetForm}
                                >
                                    Clear
                                </button>
                                <button
                                    className={`btn btn-primary m-2 ${uiState.isSubmitDisabled ? 'disabled' : ''}`}
                                    onClick={handleProcessOtp}
                                    disabled={uiState.isSubmitDisabled || uiState.isLoading}
                                >
                                    {uiState.isLoading ? 'Processing...' : 'Submit'}
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {/* Alternate Login Option */}
                    <div className="parentLoginBlock p-5 rounded-right mt-md-3">
                        <h1>User Login</h1>
                        <p>If you have a user account?</p>
                        <p>Click here <FaAngleDoubleDown /></p>
                        <Link className="btn btn-warning" to="/login">
                            User login
                        </Link>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-3">
                <Footer />
            </div>
        </>
    );
}

export default ParentLogin;