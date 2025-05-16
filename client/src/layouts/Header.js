import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Profile from '../assets/img/image.png'
import '../style/Header.css'
import Logo from '../assets/img/websiteLogo.png'
import { useUser } from '../components/Context'


function Header() {
  const navigate = useNavigate()
  const { loginUser, setLoginUser } = useUser();

  useEffect(() => {
    if (!loginUser) {
      navigate('/login')
    }
  }, [loginUser])

  async function handleLogout() {

    const response = await fetch(`${process.env.REACT_APP_FETCH_URL}/user/logout`, {
      method: 'GET',
      credentials: 'include',
    })
    if (response.status === 200) {
      setLoginUser({
        isLogged: false,
        data: null
      })
      navigate('/login')
    }
  }

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-primary p-4">
        <a className="navbar-brand d-flex align-items-center" href="#">
          <img src={Logo} alt="Logo" width="30" height="30" className="d-inline-block align-top me-2" />
          <span className='text-white'>Expense Tracker</span>
        </a>

        <div className="ms-auto d-flex align-items-center">
          <span className=" me-3 text-white">
            Welcome Mr. {loginUser?.data?.name}
          </span>
          <div className="dropdown">
            <Link className="dropdown-toggle d-flex align-items-center" href="#" role="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
              <img src={Profile} alt="User Profile" className="rounded-circle" width="50" height="50" />
            </Link>
            <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
              <li><Link className="dropdown-item" onClick={handleLogout}>Logout</Link></li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  )
}

export default Header
