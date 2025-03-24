import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import '../style/Login.css'
import { FaAngleDoubleDown } from "react-icons/fa";
import { FaUser } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";


function Login() {

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [dangerAlert, setDangerAlter] = useState(true)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const navigate = useNavigate()

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
      redirect: "follow"
    };

    fetch("http://localhost:1000/user/login", requestOptions)
      .then(async (response) => {
        if (response.status === 200) {
          setDangerAlter(true)
          navigate('/home')
        } else {
          setDangerAlter(false)
        }
      });
  }

  return (
    <>
      <div className="d-flex h-100 justify-content-center mt">
        <div className='d-flex w-50 flex-column flex-md-row'>
          <div className="logiBlock p-5 mt-3">
            <h1>Login</h1>
            <div className='d-flex flex-column'>
              <label
                htmlFor="email"
                className='form-label'>
                Email Address</label>
              <div className="input-group mb-3">
                <span className='input-group-text'><FaUser /></span>
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
                <span className='input-group-text'><RiLockPasswordFill /></span>
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
                <button className='btn btn-primary' onClick={handleSubmit}>Submit</button>
                <Link className='btn btn-link'>Forget password ?</Link>
              </div>
            </div>
          </div>
          <div className="signupBlock p-5 rounded-right mt-md-3">
            <h1>Sign up</h1>
            <p>Dont have account ? </p>
            <p>Click here <FaAngleDoubleDown /></p>
            <Link className='btn btn-warning'>Resigter Now</Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login