import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import './style/Login.css'

function Login() {

  const [email, setEmail] = useState([])
  const [password, setPassword] = useState([])

  return (
    <>
      <div className='d-flex flex-column align-items-center mt-0'>
        <h1 className='p-2'>Login</h1>
        <form className='w-50 p-3 p-2'>
          <div className="form-group">
            <label for="exampleInputEmail1">Email address</label>
            <input type="email" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter email" />
            <small id="emailHelp" className="form-text text-muted">We'll never share your email with anyone else.</small>
          </div>
          <div className="form-group">
            <label for="exampleInputPassword1">Password</label>
            <input type="password" className="form-control" id="exampleInputPassword1" placeholder="Password" />
          </div>
          <div className="form-group">
            <Link>Forget password?</Link>
          </div>
          <div className='form-group'>
            <button type="button" class="btn btn-primary form-control">Submit</button>
          </div>
        </form>
      </div>
    </>
  );
}

export default Login