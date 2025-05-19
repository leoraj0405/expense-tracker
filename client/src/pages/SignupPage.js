import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaAngleDoubleDown } from "react-icons/fa";
import Footer from '../layouts/Footer';

function SignupPage() {

    const [userForm, setUserForm] = useState({
        name: '',
        email: '',
        password: '',
        parentEmail: '',
        profile: ''
    })
    const navigate = useNavigate()
    const [errorBlock, setErrorBlock] = useState({ state: true, msg: '' })

    function handleChange(e) {
        const { name, value, files } = e.target;

        if (name === 'profile') {
            setUserForm({ ...userForm, profile: files[0] });
        } else {
            setUserForm({ ...userForm, [name]: value });
        }
    }

    function handleSaveUser() {
        const name = userForm.name
        const email = userForm.email
        const parentEmail = userForm.parentEmail
        const password = userForm.password
        const profile = userForm.profile

        const formdata = new FormData();
        formdata.append("name", name);
        formdata.append("email", email);
        formdata.append("password", password);
        formdata.append("parentEmail", parentEmail);
        formdata.append("profileImage", profile);

        console.log(profile)

        const requestOptions = {
            method: "POST",
            body: formdata,
        };

        fetch(`${process.env.REACT_APP_FETCH_URL}/user`, requestOptions)
            .then(async (response) => {
                if (response.status === 200) {
                    navigate('/login')
                } else {
                    const errorData = await response.json();
                    setErrorBlock({ state: false, msg: errorData.message })
                }
            });
    }

    return (
        <>
            <div
                className="d-flex w-100 h-100 justify-content-center mt">
                <div
                    className='d-flex flex-column flex-md-row'>
                    <div className="loginBlock p-5 mt-3">
                        <h1>Registration</h1>
                        <div className='d-flex flex-column'>
                            <label
                                htmlFor="name"
                                className='form-label'>
                                Name
                            </label>
                            <div className="input-group mb-3">
                                <input
                                    type="text"
                                    name="name"
                                    className='form-control'
                                    value={userForm.name}
                                    onChange={handleChange} />
                            </div>
                            <label
                                htmlFor="email"
                                className='form-label'>
                                Email address
                            </label>
                            <div className="input-group mb-3">
                                <input
                                    type="email"
                                    name="email"
                                    className='form-control'
                                    value={userForm.email}
                                    onChange={handleChange} />
                            </div>
                            <label
                                htmlFor="parentEmail"
                                className='form-label'>
                                Parent email address
                            </label>
                            <div className="input-group mb-3">
                                <input
                                    type="email"
                                    name="parentEmail"
                                    className='form-control'
                                    value={userForm.parentEmail}
                                    onChange={handleChange} />
                            </div>
                            <label
                                htmlFor="password"
                                className='form-label'>
                                Password
                            </label>
                            <div className="input-group mb-3">
                                <input
                                    type="password"
                                    name="password"
                                    className='form-control'
                                    value={userForm.password}
                                    onChange={handleChange} />
                            </div>
                            <label
                                htmlFor="password"
                                className='form-label'>
                                Profile Image
                            </label>
                            <div className="input-group mb-3">
                                <input
                                    type="file"
                                    name="profile"
                                    className='form-control'
                                    onChange={handleChange} />
                            </div>

                            <div className='text-center'>
                                {userForm.profile && (
                                    <div className="mb-3">
                                        <img
                                            src={URL.createObjectURL(userForm.profile)}
                                            alt="Preview"
                                            style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                        />
                                    </div>
                                )}
                            </div>
                            <div className='text-center'>
                                <button
                                    className='btn btn-primary'
                                    onClick={handleSaveUser}>
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
                    <div
                        className="parentLoginBlock  p-5 rounded-right mt-md-3">
                        <h1>Login</h1>
                        <p>If you have an account ?</p>
                        <p>Click here <FaAngleDoubleDown /></p>
                        <Link
                            className='btn btn-warning'
                            to='/login'>
                            User login
                        </Link>
                    </div>
                </div>
            </div>
            <div className='text-center mt-3 p-3'>
                <div
                    className="alert alert-danger"
                    hidden={errorBlock.state}>
                    {errorBlock.msg}
                </div>
                <Footer />
            </div>
        </>
    )
}

export default SignupPage
