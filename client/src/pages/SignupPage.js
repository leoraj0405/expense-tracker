import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaAngleDoubleDown } from 'react-icons/fa';
import Footer from '../layouts/Footer';

const SignupPage = () => {
    const initialFormState = {
        name: '',
        email: '',
        password: '',
        parentEmail: '',
        profileImage: null
    };

    const [userForm, setUserForm] = useState(initialFormState);
    const [error, setError] = useState({ isVisible: false, message: '' });
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, files } = e.target;

        setUserForm(prev => ({
            ...prev,
            [name]: name === 'profileImage' ? files[0] : value
        }));
    };

    const validateForm = () => {
        if (!userForm.name.trim()) {
            return 'Name is required';
        }
        if (!userForm.email.trim()) {
            return 'Email is required';
        }
        if (!userForm.password) {
            return 'Password is required';
        }
        if (userForm.password.length < 6) {
            return 'Password should be at least 6 characters';
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationError = validateForm();
        if (validationError) {
            setError({ isVisible: true, message: validationError });
            return;
        }

        const formData = new FormData();
        Object.entries(userForm).forEach(([key, value]) => {
            if (value) formData.append(key, value);
        });

        try {
            const response = await fetch(`${process.env.REACT_APP_FETCH_URL}/user`, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                navigate('/login');
            } else {
                const errorData = await response.json();
                setError({ isVisible: true, message: errorData.message || 'Registration failed' });
            }
        } catch (err) {
            setError({ isVisible: true, message: 'Network error. Please try again.' });
        }
    };

    return (
        <div className="container">
            <div className="row justify-content-center min-vh-100 align-items-center">
                <div className="col-lg-8">
                    <div className="card shadow">
                        <div className="row g-0">
                            {/* Signup Form */}
                            <div className="col-md-7 p-4 bg-warning">
                                <div className="card-body">
                                    <h1 className="card-title text-center mb-4">Registration</h1>

                                    {error.isVisible && (
                                        <div className="alert alert-danger" role="alert">
                                            {error.message}
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit} encType="multipart/form-data">
                                        <div className="mb-3">
                                            <label htmlFor="name" className="form-label">Name</label>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                className="form-control"
                                                value={userForm.name}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label htmlFor="email" className="form-label">Email address</label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                className="form-control"
                                                value={userForm.email}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label htmlFor="parentEmail" className="form-label">Parent email address</label>
                                            <input
                                                type="email"
                                                id="parentEmail"
                                                name="parentEmail"
                                                className="form-control"
                                                value={userForm.parentEmail}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label htmlFor="password" className="form-label">Password</label>
                                            <input
                                                type="password"
                                                id="password"
                                                name="password"
                                                className="form-control"
                                                value={userForm.password}
                                                onChange={handleChange}
                                                minLength="6"
                                                required
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label htmlFor="profileImage" className="form-label">Profile Image</label>
                                            <input
                                                type="file"
                                                id="profileImage"
                                                name="profileImage"
                                                className="form-control"
                                                accept="image/*"
                                                onChange={handleChange}
                                            />
                                        </div>

                                        {userForm.profile && (
                                            <div className="mb-3 text-center">
                                                <img
                                                    src={URL.createObjectURL(userForm.profile)}
                                                    alt="Profile preview"
                                                    className="img-thumbnail"
                                                    style={{ maxWidth: '150px', maxHeight: '150px' }}
                                                />
                                            </div>
                                        )}

                                        <div className="d-grid">
                                            <button type="submit" className="btn btn-primary">
                                                Register
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>

                            {/* Login Side Panel */}
                            <div className="col-md-5 bg-primary text-white p-4 d-flex flex-column justify-content-center">
                                <div className="card-body text-center">
                                    <h2 className="card-title mb-3">Already have an account?</h2>
                                    <p className="mb-4">Sign in to access your dashboard</p>
                                    <FaAngleDoubleDown className="mb-3" size={24} />
                                    <Link to="/login" className="btn btn-warning w-100">
                                        User Login
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer className="mt-4" />
        </div>
    );
};

export default SignupPage;