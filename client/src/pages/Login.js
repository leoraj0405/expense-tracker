import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaAngleDoubleDown, FaUser } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";
import Footer from '../layouts/Footer';

function Login() {
  // State management
  const [formData, setFormData] = useState({ 
    email: "leoraj04065@gmail.com", 
    password: "12313" 
  });
  const [uiState, setUiState] = useState({
    isLoading: false,
    error: { show: false, message: '' }
  });
  
  const navigate = useNavigate();

  // Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const showError = (message) => {
    setUiState(prev => ({
      ...prev,
      error: { show: true, message },
      isLoading: false
    }));
  };

  const handleSubmit = useCallback(async () => {
    try {
      setUiState(prev => ({ ...prev, isLoading: true }));
      
      const response = await fetch(`${process.env.REACT_APP_FETCH_URL}/user/login`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
        credentials: 'include'
      });

      if (response.ok) {
        navigate('/home');
      } else {
        const errorData = await response.json();
        showError(errorData.message || 'Invalid email or password');
      }
    } catch (error) {
      showError('Network error. Please try again.');
    }
  }, [formData, navigate]);

  return (
    <div className="login-container">
      <div className="d-flex w-100 h-100 justify-content-center mt">
        <div className="d-flex flex-column flex-md-row">
          {/* Loading Overlay */}
          {/* {uiState.isLoading && (
            <div className="spinner-overlay">
              <div 
                className="spinner-border text-warning" 
                role="status"
                style={{ width: '6rem', height: '6rem' }}>
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )} */}

          {/* Main Login Block */}
          <div className="loginBlock p-5 mt-3">
            <h1 className="text-center mb-4">Login</h1>
            <div className="d-flex flex-column">
              {/* Email Input */}
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <div className="input-group">
                  <span className="input-group-text">
                    <FaUser />
                  </span>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="mb-3">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <div className="input-group">
                  <span className="input-group-text">
                    <RiLockPasswordFill />
                  </span>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    className="form-control"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength="3"
                  />
                </div>
              </div>

              {/* Error Message */}
              {uiState.error.show && (
                <div className="alert alert-danger mb-3">
                  {uiState.error.message}
                </div>
              )}

              {/* Submit Button */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <button
                  className="btn btn-primary px-4"
                  onClick={handleSubmit}
                  disabled={uiState.isLoading}
                >
                  {uiState.isLoading ? 'Logging in...' : 'Login'}
                </button>
                <Link
                  to="/forgetpassword"
                  className="btn btn-link text-decoration-none"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Sign Up Link */}
              <div className="text-center mt-2">
                <Link
                  to="/registration"
                  className="btn btn-outline-secondary"
                >
                  Create a new account
                </Link>
              </div>
            </div>
          </div>

          {/* Parent Login Block */}
          <div className="parentLoginBlock p-5 rounded-right mt-md-3">
            <h1 className="text-center mb-3">Parent Login</h1>
            <p className="text-center">Are you a parent?</p>
            <p className="text-center mb-3">
              Click here <FaAngleDoubleDown />
            </p>
            <div className="text-center">
              <Link
                className="btn btn-warning px-4"
                to="/parentlogin"
              >
                Parent Login
              </Link>
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

export default Login;