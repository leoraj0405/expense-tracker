import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { FaAngleDoubleDown } from "react-icons/fa";
import { FaUser } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";
import Footer from '../layouts/Footer'

function Login() {

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [dangerAlert, setDangerAlter] = useState(true)
  const navigate = useNavigate()
  const [spinner, setSpinner] = useState(true)


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  function handleSubmit() {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      "email": formData.email,
      "password": formData.password
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      credentials: 'include'
    };

    fetch(`${process.env.REACT_APP_FETCH_URL}/user/login`, requestOptions)
      .then(async (response) => {
        if(response.status === 200) {
          navigate('/home')
        }else {
          console.log(await response.json())
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
            <h1>Login</h1>
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
                  value={formData.email}
                  onChange={handleChange} />
              </div>
              <label
                htmlFor="password"
                className='form-label'>
                Password
              </label>
              <div className="input-group mb-3">
                <span className='input-group-text'>
                  <RiLockPasswordFill />
                </span>
                <input
                  type="password"
                  name="password"
                  className='form-control'
                  value={formData.password}
                  onChange={handleChange} />
              </div>
              <div className="alert alert-danger h-10" hidden={dangerAlert} >
                Invalid Email or Password.
              </div>
              <div>
                <button
                  className='btn btn-primary'
                  onClick={handleSubmit}>
                  Submit
                </button>
                <Link
                  to={`/forgetpassword`}
                  className='btn btn-link text-dark'>
                  Forget password ?
                </Link>
              </div>
              <div>
                <Link
                  to='/registration'
                  className='btn btn-link m-2 text-dark signup-btn'>
                  Create a new account
                </Link>
              </div>
            </div>
          </div>
          <div
            className="parentLoginBlock  p-5 rounded-right mt-md-3">
            <h1>Parent Login</h1>
            <p>Are you parent ?</p>
            <p>Click here <FaAngleDoubleDown /></p>
            <Link
              className='btn btn-warning'
              to='/parentlogin'>
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

export default Login