import React, { useState } from 'react'
import '../style/style.css'
import Footer from '../layouts/Footer'
import { Link, useNavigate } from 'react-router-dom'


function ForgetPassword() {
    const [form, setForm] = useState({ email: '', otp: '', password: '', confirmPassword: '' })
    const [inputState, setInputState] = useState(true)
    const [emailBlock, setEmailBlock] = useState(false)
    const [spinner, setSpinner] = useState(true)
    const [dangerAlert, setDangerAlter] = useState({ errorState: true, msg: '' })

    const navigate = useNavigate()

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value })
    }
    function handleSubmit() {

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        if (form.confirmPassword !== form.password) {
            return setDangerAlter({
                errorState: false,
                msg: 'Password not match'
            })
        }
        const raw = JSON.stringify({
            "email": form.email,
            "otp": form.otp,
            "password": form.password
        });

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow"
        };

        fetch(`${process.env.REACT_APP_FETCH_URL}/user/processotp`, requestOptions)
            .then(async (response) => {
                console.log(response)
                if (response.status === 200) {
                    navigate('/login')
                } else {
                    if (response.status === 401) {
                        setDangerAlter({
                            errorState: true,
                            msg: 'Wrong User email | OTP'
                        })
                    }
                }
            });
    }
    function hanldeGenerateOTP() {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const raw = JSON.stringify({
            "email": form.email
        });

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow"
        };
        setSpinner(false)
        fetch(`${process.env.REACT_APP_FETCH_URL}/user/generateotp`, requestOptions)
            .then(async (response) => {
                if (response.status === 200) {
                    setSpinner(true)
                    setInputState(false)
                    setEmailBlock(true)
                } else {
                    setSpinner(true)
                    response.status === 401 ? setDangerAlter({
                        errorState: true,
                        msg: 'Wrong User email | OTP'
                    }) : setDangerAlter({
                        errorState: true,
                        msg: await response.text()
                    })

                }
            });
    }
    return (
        <>
            <div
                className="d-flex w-100 h-100 justify-content-center mt">
                <div
                    className='d-flex flex-column flex-md-row'>
                    <div
                        className="spinner-overlay"
                        hidden={spinner}>
                        <div
                            className="spinner-border text-warning"
                            role="status"
                            style={{ width: '6rem', height: '6rem' }}>
                            <span
                                className="visually-hidden">
                                Loading...
                            </span>
                        </div>
                    </div>
                    <div className="loginBlock p-5 mt-3">
                        <h2 className='text-center mb-5'>Rest Password</h2>
                        <div className="input-group">
                            <div className="input-group-prepend">
                                <input
                                    type="email"
                                    name='email'
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder='Email Address'
                                    className="form-control"
                                    disabled={emailBlock} />
                            </div>
                            <button onClick={hanldeGenerateOTP} disabled={emailBlock} className="btn btn-primary"> Get OTP </button>
                        </div>
                        <div className='d-flex justify-content-end mt-3'>
                            <button disabled={inputState} onClick={hanldeGenerateOTP} className='btn btn-link'>Resend OTP</button>
                        </div>
                        <div className="alert alert-danger h-10" hidden={dangerAlert.errorState} >
                            {dangerAlert.msg}
                        </div>
                        <div class="form-group mb-3">
                            <input
                                type="text"
                                name='otp'
                                value={form.otp}
                                className="form-control"
                                onChange={handleChange}
                                placeholder="OTP"
                                disabled={inputState}
                            />
                        </div>
                        <div class="form-group mb-3">
                            <input
                                type="password"
                                name='password'
                                value={form.password}
                                className="form-control"
                                onChange={handleChange}
                                disabled={inputState}
                                placeholder="Password" />
                        </div>
                        <div class="form-group mb-3">
                            <input
                                type="password"
                                className="form-control"
                                name='confirmPassword'
                                value={form.confirmPassword}
                                onChange={handleChange}
                                disabled={inputState}
                                placeholder="Confirm Password" />
                        </div>
                        <div className='d-flex justify-content-center'>
                            <Link to='/login' className='btn btn-danger me-3'>Cancel</Link>
                            <button
                                disabled={inputState}
                                onClick={handleSubmit}
                                className='btn btn-primary'>Submit</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className='text-center mt-3'>
                <Footer />
            </div>
        </>
    )
}

export default ForgetPassword
