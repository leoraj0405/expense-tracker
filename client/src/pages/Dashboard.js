import React from 'react'
import { Link } from 'react-router-dom';
import profile from '../assets/img/image.png'
import '../style/Dashboard.css'

function Dashboard() {
  return (
    <>
      <header className='header d-flex justify-content-between text-white'>
        <div className='right-header'>
          <h1 className='text-dark'>Expense Tracker</h1>
        </div>
        <div
          className='left-header d-flex align-items-end '>
          <p>Welcome <span>Mr. <Link className='a'>Leo</Link></span></p>
          <div className='dropdown'>
            <img
              src={profile}
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
      </header>

      <aside>
        <nav>
          <ul className='ul'>
            <li><Link className='li-a text-dark'>DashBoard</Link></li>
            <li><Link className='li-a text-dark'>My Expense</Link></li>
            <li><Link className='li-a text-dark'>Group</Link></li>
            <li><Link className='li-a text-dark'>Others</Link></li>
          </ul>
        </nav>
      </aside>
    </>
  )
}

export default Dashboard
