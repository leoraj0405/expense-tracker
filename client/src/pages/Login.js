import React, { useState } from 'react'
import { Link } from 'react-router-dom';
import '../style/Login.css'
import { FaAngleDoubleDown } from "react-icons/fa";
import Footer from '../layouts/Footer';
import { FaUser } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";


function Login() {

  const [formData, setFormData] = useState({ email: "", password: "" });

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
      redirect: "follow"
    };

    fetch("http://localhost:1000/user/login", requestOptions)
      .then(async (response) => {
        if (response.status === 200) {
          alert('login success')
        } else {
          if (response.status === 404) {
            alert('Invalid email or password')
          }
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
                <span className='input-group-text'><FaUser/></span>
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
                <span className='input-group-text'><RiLockPasswordFill/></span>
                <input
                  type="password"
                  name="password"
                  className='form-control'
                  value={formData.password}
                  onChange={handleChange} />
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
      <Footer />
    </>
  );
}

export default Login