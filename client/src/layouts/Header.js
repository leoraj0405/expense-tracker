import { Link, useNavigate } from 'react-router-dom'
import { useUser } from '../components/Context'
import defaultImage from '../assets/img/profile.png'

function Header() {
  const navigate = useNavigate()
  const { loginUser, setLoginUser } = useUser();

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
      <nav className="navbar bg-primary px-4 py-3">
  <div className="container-fluid d-flex justify-content-between align-items-center flex-nowrap">

    {/* Left: App Name */}
    <span className="navbar-brand text-white m-0 text-nowrap">Expense Tracker</span>

    {/* Right: Welcome text and Profile */}
    <div className="d-flex align-items-center flex-nowrap">

      {/* Hide welcome on small screens */}
      <span className="me-3 text-white text-nowrap d-none d-md-inline text-truncate">
        Welcome Mr. {loginUser?.data?.name || 'User'}
      </span>

      {/* Dropdown Profile */}
      <div className="dropdown">
        <a
          className="dropdown-toggle d-flex align-items-center"
          href="#"
          role="button"
          id="userDropdown"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <img
            src={
              loginUser?.profileUrl && loginUser.profileUrl !== '/uploads/null'
                ? `${process.env.REACT_APP_FETCH_URL}${loginUser.profileUrl}`
                : defaultImage
            }
            alt="User Profile"
            className="rounded-circle"
            style={{ width: '45px', height: '45px', objectFit: 'cover' }}
          />
        </a>
        <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
          <li><Link className="dropdown-item" to="/userprofile">Profile</Link></li>
          <li><button className="dropdown-item" onClick={handleLogout}>Logout</button></li>
        </ul>
      </div>
    </div>
  </div>
</nav>


    </>
  )
}

export default Header
