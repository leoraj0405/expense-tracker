import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaAngleDoubleDown, FaUser } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";
import Footer from '../layouts/Footer';

function Login() {
  const [formData, setFormData] = useState({ email: "leoraj04065@gmail.com", password: "123" });
  const [showError, setShowError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = () => {
    setLoading(true);
    setShowError(false);

    fetch(`${process.env.REACT_APP_FETCH_URL}/user/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
      credentials: 'include',
    })
      .then(async (res) => {
        setLoading(false);
        if (res.status === 200) {
          navigate('/home');
        } else {
          setShowError(true);
        }
      })
      .catch(() => {
        setLoading(false);
        setShowError(true);
      });
  };

  return (
    <>
      <div className="d-flex w-100 h-100 justify-content-center">
        <div className='d-flex flex-column flex-md-row'>
          {/* Spinner */}
          {loading && (
            <div className="spinner-overlay">
              <div className="spinner-border text-warning" role="status" style={{ width: '6rem', height: '6rem' }}>
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}

          {/* Login Block */}
          <div className="loginBlock p-5 mt-3">
            <h1>Login</h1>
            <div className='d-flex flex-column'>
              <label htmlFor="email" className='form-label'>Email Address</label>
              <div className="input-group mb-3">
                <span className='input-group-text'><FaUser /></span>
                <input
                  type="email"
                  name="email"
                  className='form-control'
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <label htmlFor="password" className='form-label'>Password</label>
              <div className="input-group mb-3">
                <span className='input-group-text'><RiLockPasswordFill /></span>
                <input
                  type="password"
                  name="password"
                  className='form-control'
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              {/* Error Message */}
              {showError && (
                <div className="alert alert-danger">Invalid Email or Password.</div>
              )}

              <div>
                <button className='btn btn-primary' onClick={handleSubmit} disabled={loading}>
                  Submit
                </button>
                <Link className='btn btn-link text-dark'>
                  Forget password?
                </Link>
              </div>

              <div>
                <Link to='/registration' className='btn btn-link m-2 text-dark signup-btn'>
                  Create a new account
                </Link>
              </div>
            </div>
          </div>

          {/* Parent Login Block */}
          <div className="parentLoginBlock p-5 rounded-right mt-md-3">
            <h1>Parent Login</h1>
            <p>Are you a parent?</p>
            <p>Click here <FaAngleDoubleDown /></p>
            <Link className='btn btn-warning' to='/parentlogin'>
              Parent login
            </Link>
          </div>
        </div>
      </div>

      <div className='text-center mt-3'>
        <Footer />
      </div>
    </>
  );
}

export default Login;
