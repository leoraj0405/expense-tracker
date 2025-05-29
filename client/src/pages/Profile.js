import React, { useEffect, useState, useRef } from 'react'
import Header from '../layouts/Header'
import Footer from '../layouts/Footer'
import SideBar from '../layouts/SideBar'
import { useUser } from '../components/Context'
import defaultImage from '../assets/img/profile.png'
import { useLocation, Link, useNavigate } from 'react-router-dom'

function Profile() {
  const location = useLocation()
  const pathnames = location.pathname.split('/').filter(Boolean)
  const { loginUser } = useUser()
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [form, setForm] = useState({
    userName: '',
    email: '',
    parentEmail: '',
    profile: null,
  })
  const [alert, setAlert] = useState({ visible: false, message: '', isError: false })

  const alertRef = useRef(null)

  // Redirect if no user
  useEffect(() => {
    if (!loginUser) navigate('/login')
  }, [loginUser, navigate])

  // Fetch user data
  useEffect(() => {
    if (!loginUser) return
    fetch(`http://localhost:1000/user/${loginUser.data._id}`)
      .then((res) => res.json())
      .then((userData) => {
        setUser(userData)
        setForm({
          userName: userData?.data?.name || '',
          email: userData?.data?.email || '',
          parentEmail: userData?.data?.parentEmail || '',
          profile: null,
        })
      })
      .catch(() => setAlert({ visible: true, message: 'Failed to fetch user', isError: true }))
  }, [loginUser])

  // Auto-focus alert when shown
  useEffect(() => {
    if (alert.visible && alertRef.current) {
      alertRef.current.focus()
    }
  }, [alert])

  // Auto-hide alert
  useEffect(() => {
    if (alert.visible) {
      const timer = setTimeout(() => setAlert({ visible: false, message: '', isError: false }), 5000)
      return () => clearTimeout(timer)
    }
  }, [alert.visible])

  const handleChange = (e) => {
    const { name, value, files } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: name === 'profile' ? files[0] : value,
    }))
  }

  const handleSubmit = async () => {
    if (!loginUser) return

    const formData = new FormData()
    formData.append('name', form.userName)
    formData.append('email', form.email)
    formData.append('parentEmail', form.parentEmail)
    if (form.profile) formData.append('profileImage', form.profile)

    try {
      const res = await fetch(`${process.env.REACT_APP_FETCH_URL}/user/${loginUser.data._id}`, {
        method: 'PUT',
        body: formData,
      })
      if (res.ok) {
        setAlert({ visible: true, message: 'Profile updated successfully!', isError: false })
        // Refresh user data
        const updatedUser = await res.json()
        setUser(updatedUser)
      } else {
        const errorData = await res.json()
        setAlert({ visible: true, message: errorData.message, isError: true })
      }
    } catch (error) {
      setAlert({ visible: true, message: 'Something went wrong!', isError: true })
    }
  }

  return (
    <div className="d-flex">
      <aside><SideBar /></aside>

      <div className="flex-grow-1">
        <Header />
        <main className="p-3 bg-light" style={{ minHeight: '400px' }}>
          <div className="container me-5">
            <Breadcrumb pathnames={pathnames} />
            {alert.visible && (
              <div
                tabIndex={-1}
                ref={alertRef}
                className={`alert ${alert.isError ? 'alert-danger' : 'alert-success'}`}
                role="alert"
              >
                {alert.message}
              </div>
            )}

            <ProfileOverview user={user} defaultImage={defaultImage} />
            <EditProfileForm form={form} handleChange={handleChange} handleSubmit={handleSubmit} />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  )
}

function Breadcrumb({ pathnames }) {
  return (
    <nav aria-label="breadcrumb" className="mb-3 d-flex justify-content-end">
      <ol className="breadcrumb">
        <li className="breadcrumb-item"><Link to="/home">Home</Link></li>
        {pathnames.map((item, idx) => {
          const label = item === 'userprofile' ? 'User Profile' : item
          const to = `/${pathnames.slice(0, idx + 1).join('/')}`
          const isLast = idx === pathnames.length - 1
          return (
            <li className="breadcrumb-item" key={to} aria-current={isLast ? 'page' : undefined}>
              {isLast ? label : <Link to={to}>{label}</Link>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

function ProfileOverview({ user, defaultImage }) {
  if (!user) return <p>Loading...</p>
  return (
    <div className="card shadow mb-4">
      <div className="card-body text-center">
        <img
          src={
            user.profileUrl && user.profileUrl !== '/uploads/null'
              ? `${process.env.REACT_APP_FETCH_URL}${user.profileUrl}`
              : defaultImage
          }
          alt="Profile"
          className="rounded-circle mb-3"
          style={{ width: 120, height: 120, objectFit: 'cover' }}
        />
        <h4>{user.data?.name?.toUpperCase() || 'User'}</h4>
        <p><strong>Email:</strong> {user.data?.email}</p>
        <p><strong>Parent Email:</strong> {user.data?.parentEmail}</p>
        <p><strong>Joined:</strong> {user.data?.createdAt?.split('T')[0]}</p>
      </div>
    </div>
  )
}

function EditProfileForm({ form, handleChange, handleSubmit }) {
  return (
    <div className="card shadow mb-4">
      <div className="card-body">
        <h5>Edit Profile</h5>
        <div className="mb-3">
          <label htmlFor="userName" className="form-label">Name</label>
          <input type="text" className="form-control" id="userName" name="userName" value={form.userName} onChange={handleChange} />
        </div>

        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email</label>
          <input type="email" className="form-control" id="email" name="email" value={form.email} onChange={handleChange} />
        </div>

        <div className="mb-3">
          <label htmlFor="parentEmail" className="form-label">Parent Email</label>
          <input type="email" className="form-control" id="parentEmail" name="parentEmail" value={form.parentEmail} onChange={handleChange} />
        </div>

        <div className="mb-3">
          <label htmlFor="profileImage" className="form-label">Profile Image</label>
          <input type="file" className="form-control" id="profileImage" name="profile" onChange={handleChange} />
          {form.profile && form.profile instanceof File && (
            <img
              src={URL.createObjectURL(form.profile)}
              alt="Preview"
              className="mt-2 rounded"
              style={{ width: 100, height: 100, objectFit: 'cover' }}
            />
          )}
        </div>

        <button className="btn btn-primary" onClick={handleSubmit}>Submit</button>
      </div>
    </div>
  )
}

export default Profile
