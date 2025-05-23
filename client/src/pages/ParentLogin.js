import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import '../style/Login.css'
import { FaUser } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";
import { FaAngleDoubleDown } from "react-icons/fa";
import Footer from '../layouts/Footer'

function ParentLogin() {
    const [parentForm, setParentForm] = useState({ email: 'iamnotraj02@gmail.com', otp: 'tNvDlT' })
    const [disbledInput, setDisbledInput] = useState(false)
    const [dangerAlert, setDangerAlter] = useState(true)
    const [spinner, setSpinner] = useState(true)
    const [btnDisabled, setBtnDisabled] = useState(true)
    const navigate = useNavigate()

    function handleChange2(e) {
        setParentForm({ ...parentForm, [e.target.name]: e.target.value })
    }
    function handleGenerateOtp() {
        try {
            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            const raw = JSON.stringify({
                "parentEmail": parentForm.email
            });

            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: raw,
                Credential: true
            };

            setSpinner(false)

            fetch(`${process.env.REACT_APP_FETCH_URL}/user/parentgenerateotp`, requestOptions)
                .then(async (response) => {
                    if (response.status === 200) {
                        setBtnDisabled(false)
                        setDisbledInput(true)
                        setSpinner(true)
                        setDangerAlter(true)
                    } else {
                        setSpinner(true)
                        setDangerAlter(false)
                    }
                })
        }

        catch (error) {
            setSpinner(true)
        }
    }

    function handleProcessOtp() {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const raw = JSON.stringify({
            "parentEmail": parentForm.email,
            "parentOtp": parentForm.otp
        });

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            credentials: 'include'
        };

        fetch(`${process.env.REACT_APP_FETCH_URL}/user/parentproccessotp`, requestOptions)
            .then((response) => {
                if(response.status === 200) {
                    navigate('/parenthome')
                }else {
                    setDangerAlter(false)
                }
            });
    }

    function refreshPage() {
        setParentForm({ email: '', otp: '' });
        setDisbledInput(false);
        setDangerAlter(true);
        setBtnDisabled(true)
    }
    return (
        <>
            <div
                className="d-flex w-100 h-100 justify-content-center mt">
                <div
                    className='d-flex flex-column flex-md-row'>
                    <div className="loginBlock p-5 mt-3">
                        <h1>Parent Login</h1>
                        <div className='d-flex flex-column'>
                            <label
                                htmlFor="email"
                                className='form-label'>
                                Email Address</label>
                            <div className="input-group mb-3">
                                <span className='input-group-text'>
                                    <FaUser />
                                </span>
                                <input
                                    type="email"
                                    name="email"
                                    className='form-control'
                                    value={parentForm.email}
                                    onChange={handleChange2}
                                    disabled={disbledInput} />
                            </div>
                            <div>
                                <button
                                    className='btn btn-primary m-2'
                                    onClick={handleGenerateOtp}>
                                    Generate OTP
                                </button>
                                <Link
                                    className='btn btn-link text-dark'
                                    onClick={handleGenerateOtp}>
                                    Resend OTP
                                </Link>
                            </div>
                            <div className="alert alert-danger h-10" hidden={dangerAlert}>
                                Error Try again.
                            </div>

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
                            <label
                                htmlFor="password"
                                className='form-label'>
                                Enter OTP
                            </label>
                            <div className="input-group mb-3">
                                <span className='input-group-text'>
                                    <RiLockPasswordFill />
                                </span>
                                <input
                                    type="text"
                                    name="otp"
                                    maxLength={6}
                                    className='form-control'
                                    value={parentForm.otp}
                                    id='otp'
                                    onChange={handleChange2}
                                    disabled={btnDisabled} />
                            </div>
                            <div className='text-center'>
                                <button
                                    className='btn btn-warning m-2'
                                    onClick={refreshPage}>
                                    Clear
                                </button>
                                <button
                                    className={
                                        btnDisabled ? 'btn btn-primary m-2 disabled'
                                            : 'btn btn-primary m-2'
                                    }
                                    onClick={handleProcessOtp}>
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
                    <div
                        className="parentLoginBlock  p-5 rounded-right mt-md-3">
                        <h1>User Login</h1>
                        <p>If you have user account ?</p>
                        <p>Click here <FaAngleDoubleDown /></p>
                        <Link
                            className='btn btn-warning'
                            to='/login'>
                            User login
                        </Link>
                    </div>
                </div>
            </div>

            <div className='text-center mt-3'>
                <Footer />
            </div>

        </>
    )
}

export default ParentLogin
