import React from 'react'
import { Link } from 'react-router-dom'
import Profile from '../assets/img/image.png'
import '../style/Header.css'
import Logo from '../assets/img/websiteLogo.png'

function Header() {
  return (
    <>
     <div className='right-header'>
          <h1 className='text-white'><img className='logo' src={Logo}/>  Expense Tracker</h1>
        </div>
        <div
          className='left-header d-flex align-items-end '>
          <p>Welcome <span>Mr. <Link className='a'>Leo</Link></span></p>
          <div className='dropdown'>
            <img
              src={Profile}
              className="rounded-circle img-fluid"
              alt="User Profile"
              width="100"
              height="100"
              data-bs-toggle="dropdown"
              style={{ cursor: 'pointer' }}
            />

            <ul className="dropdown-menu dropdown-menu-end">
              <li><Link className="dropdown-item " to="#">Profile</Link></li>
              <li><hr className="dropdown-divider" /></li>
              <li><Link className="dropdown-item" to="#">Logout</Link></li>
            </ul>

          </div>
        </div> 
    </>
  )
}

export default Header
