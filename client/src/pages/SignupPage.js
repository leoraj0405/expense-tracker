import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaAngleDoubleDown } from "react-icons/fa";
import Footer from '../layouts/Footer';

function SignupPage() {

    const [userForm, setUserForm] = useState({
        name: '',
        email: '',
        password: '',
        parentEmail: ''
    })
    const navigate = useNavigate()
    const [errorBlock, setErrorBlock] = useState({ state: true, msg: '' })

    function handleChange(e) {
        setUserForm({ ...userForm, [e.target.name]: e.target.value })
    }

    function handleSaveUser() {
        const name = userForm.name
        const email = userForm.email
        const parentEmail = userForm.parentEmail
        const password = userForm.password

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const raw = JSON.stringify({
            "name": name,
            "email": email,
            "password": password,
            "parentEmail": parentEmail
        });

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow"
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

    console.log(errorBlock.state)

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
                                <span className='input-group-text'>
                                </span>
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
                                <span className='input-group-text'>
                                </span>
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
                                <span className='input-group-text'>
                                </span>
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
                                <span className='input-group-text'>
                                </span>
                                <input
                                    type="password"
                                    name="password"
                                    className='form-control'
                                    value={userForm.password}
                                    onChange={handleChange} />
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
