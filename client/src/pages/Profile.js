import React, { useEffect, useState, useRef } from 'react'
import Header from '../layouts/Header'
import Footer from '../layouts/Footer'
import SideBar from '../layouts/SideBar'
import { useUser } from '../components/Context'
import defaultImage from '../assets/img/profile.png'
import { useLocation, Link, useNavigate } from 'react-router-dom'

function Profile() {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);
    const { loginUser } = useUser()
    const navigate = useNavigate()
    const [user, setUser] = useState([])
    const [dangerAlert, setDangetAlert] = useState({ blockState: true, msg: '', suceessState: true })
    const [form, setFormData] = useState({ userName: '', email: '', parentEmail: '', profile: '' })

    const [showDiv, setShowDiv] = useState(false);
    const divRef = useRef(null);

    useEffect(() => {
        if (showDiv && divRef.current) {
            divRef.current.focus();
        }
    }, [showDiv]);

    useEffect(() => {
        if (!loginUser) {
            navigate('/login')
        }
    }, [loginUser])

    function handleChange(e) {
        const { name, value, files } = e.target;
        if (name === 'profile') {
            setFormData({ ...form, [name]: files[0] });
        } else {
            setFormData({ ...form, [name]: value });
        }
    }


    async function fetchUser() {
        const response = await fetch(`http://localhost:1000/user/${loginUser?.data?._id}`)
        if (response.status === 200) {
            const userData = await response.json()
            setUser(userData)
            setFormData({
                userName: userData?.data?.name,
                email: userData?.data?.email,
                parentEmail: userData?.data?.parentEmail,
                profile: userData?.profileUrl.split('/')[2],
            })
        } else {
            const errorData = await response.json()
            setShowDiv(true)    
            setDangetAlert({ blockState: true, suceessState: false, msg: errorData.message })
        }
    }


    async function handleSubmit(id) {


        const formdata = new FormData();
        formdata.append("name", form.userName);
        formdata.append("email", form.email);
        formdata.append("parentEmail", form.parentEmail);
        formdata.append("profileImage", form.profile);

        console.log(form)
        const requestOptions = {
            method: "PUT",
            body: formdata,
        };

        fetch(`${process.env.REACT_APP_FETCH_URL}/user/${id}`, requestOptions)
            .then(async (response) => {
                if (response.status === 200) {
                    setDangetAlert({ blockState: true, msg: '', suceessState: false })
                    fetchUser()
                } else {
                    const errorData = await response.json()
                    setDangetAlert({ blockState: false, msg: errorData.message, suceessState: true })

                }
            });
    }


    useEffect(() => {
        fetchUser()
    }, [])

    return (
        <>
            <header>
                <Header />
            </header>
            <div className='d-flex'>
                <aside>
                    <SideBar />
                </aside>
                <main className='p-3 w-100 bg-light'>
                    <section className='main' style={{ minHeight: '400px' }}>
                        <nav className='m-4'>
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item"><Link className='text-secondary' to="/home">Home</Link></li>
                                {pathnames.map((item, index) => {
                                    const label = item === 'userprofile' ? 'User Profile' : item
                                    const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                                    return (
                                        <li key={index} className="breadcrumb-item"><Link className='text-secondary' to={to}>{label}</Link></li>
                                    )
                                })}
                            </ol>
                        </nav>
                        <div
                            className="m-4 alert alert-danger"
                            ref={divRef}
                            tabIndex={-1} 
                            hidden={dangerAlert.blockState}>
                            {dangerAlert.msg}
                        </div>
                        <div>
                            <div className="container mt-5">
                                <div className="row justify-content-center">
                                    <div className="col-md-8">
                                        <div className="card shadow border-0">
                                            <div className="card-body">
                                                <div className='d-flex'>
                                                    <p className='p-2 
                                                        text-primary fw-bold'
                                                    >
                                                        Over View</p>
                                                    <p
                                                        className='p-2 
                                                        text-primary fw-bold'
                                                        role='button'
                                                        data-bs-toggle="collapse"
                                                        data-bs-target="#editInfo"
                                                    >
                                                        Edit Info</p>
                                                </div>
                                                <hr />
                                                <div className='mt-4'>
                                                    <div className="text-center mb-4 ">
                                                        <img
                                                            src={user?.profileUrl && user.profileUrl !== '/uploads/null'
                                                                ? `${process.env.REACT_APP_FETCH_URL}${user.profileUrl}`
                                                                : defaultImage}
                                                            alt="Profile"
                                                            style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                                                            className="rounded-circle"
                                                        />
                                                    </div>
                                                    <h4 className="text-center mb-3">{user?.data?.name.toUpperCase()}</h4>
                                                    <div className="row mb-3">
                                                        <div className="col-sm-4 font-weight-bold text-muted">Email Address:</div>
                                                        <div className="col-sm-8">{user?.data?.email}</div>
                                                    </div>
                                                    <div className="row mb-3">
                                                        <div className="col-sm-4 font-weight-bold text-muted">Parent Email address:</div>
                                                        <div className="col-sm-8">{user?.data?.parentEmail}</div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="col-sm-4 font-weight-bold text-muted">Joined:</div>
                                                        <div className="col-sm-8">{user?.data?.createdAt.split('T')[0]}</div>
                                                    </div>
                                                </div>
                                                <hr />
                                                <div className='collapse mt-4' id='editInfo'>
                                                    <div>
                                                        <div className="mb-3">
                                                            <label for="userName" className="form-label">Name</label>
                                                            <input type="text" className="form-control" onChange={handleChange} value={form.userName} name="userName" placeholder="Enter name" />
                                                        </div>

                                                        <div class="mb-3">
                                                            <label for="email" className="form-label">Email</label>
                                                            <input type="email" className="form-control" onChange={handleChange} value={form.email} name="email" placeholder="Enter email" />
                                                        </div>

                                                        <div class="mb-3">
                                                            <label for="parentEmail" className="form-label">Parent Email</label>
                                                            <input type="email" className="form-control" onChange={handleChange} value={form.parentEmail} name="parentEmail" placeholder="Enter parent's email" />
                                                        </div>

                                                        <div class="mb-3">
                                                            <label for="profileImage" className="form-label">Profile Image</label>
                                                            <input className="form-control" onChange={handleChange} type="file" name="profile" />
                                                        </div>
                                                        <div className='mb-3'>
                                                            {form.profile instanceof File && (
                                                                <div className="mb-3">
                                                                    <img
                                                                        src={URL.createObjectURL(form.profile)}
                                                                        alt="Preview"
                                                                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>

                                                        <button className="btn btn-primary" onClick={() => { handleSubmit(loginUser?.data?._id) }}>Submit</button>
                                                        <div className="alert alert-success mt-4" hidden={dangerAlert.suceessState} role="alert">
                                                            Data updated after some times
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    <footer>
                        <Footer />
                    </footer>
                </main>
            </div>
        </>

    )
}

export default Profile
