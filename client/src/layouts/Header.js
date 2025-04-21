import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Profile from '../assets/img/image.png'
import '../style/Header.css'
import Logo from '../assets/img/websiteLogo.png'
import { clearSession, getUser } from '../components/SessionAuth'


function Header() {
  const navigate = useNavigate()
  const user = getUser()
  function handleLogout() {
    clearSession()
    navigate('/login')
  }

  return (
    <>
      <div className='right-header'>
        <h1 className='text-white'><img className='logo' alt='logo' src={Logo} />  Expense Tracker</h1>
      </div>
      <div
        className='left-header d-flex align-items-end '>
        <p>Welcome <span>Mr. {user.data.name || 'user'} </span></p>
        <div className='dropdown'>
          <img
            src={Profile}
            className="rounded-circle img-fluid"
            alt='profile'
            width="100"
            height="100"
            data-bs-toggle="dropdown"
            style={{ cursor: 'pointer' }}
          />

          <ul className="dropdown-menu dropdown-menu-end">
            <li><Link className="dropdown-item " to="#">Profile</Link></li>
            <li><hr className="dropdown-divider" /></li>
            <li><button className="dropdown-item" onClick={handleLogout}>Logout</button></li>
          </ul>

        </div>
      </div>
    </>
  )
}

export default Header
