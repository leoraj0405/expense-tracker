import React, { useState, useEffect } from 'react'
import Header from '../../layouts/Header'
import SideBar from '../../layouts/SideBar'
import Footer from '../../layouts/Footer'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import { useUser } from '../../components/Context'

function useQuery() {
    return new URLSearchParams(useLocation().search)
}


function AddGrpMember() {
    const { loginUser } = useUser()
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);
    const navigate = useNavigate()
    const queryValue = useQuery()
    const grpMemberId = queryValue.get('grpmemid')
    const grpId = queryValue.get('grpid')
    const grpName = queryValue.get('grpname')
    const groupLeader = queryValue.get('leader')
    
    const [form, setForm] = useState({ groupId: grpId, email: '' });
    const [alertBlock, setAlertBlock] = useState({
        blockState: true,
        msg: ''
    })

    useEffect(() => {
        if (!loginUser) {
            navigate('/login')
        }
    }, [])

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = () => {
        const groupId = form.groupId
        const userEmail = form.email

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const raw = JSON.stringify({
            "groupId": groupId,
            "email": userEmail,
        });
        const requestOptions = {
            headers: myHeaders,
            body: raw,
        };

        console.log(requestOptions)
        let request
        request = fetch(`${process.env.REACT_APP_FETCH_URL}/groupmember`, { ...requestOptions, method: "POST" })
        request.then(async (response) => {
            if (response.status === 200) {
                navigate(`/group/groupmember?grpid=${grpId}&grpName=${grpName}&leader=${groupLeader}`)
            } else {
                const errorInfo = await response.json()
                console.log(errorInfo)
                setAlertBlock({
                    blockState: false,
                    msg: errorInfo.message
                })
            }
        });
    };
    useEffect(() => {
        setTimeout(() => {
            setAlertBlock({
                blockState: true,
                msg: ''
            })
        }, 5000)
    }, [alertBlock])
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

                        <div className='d-flex justify-content-between m-4'>
                            <h2>{grpMemberId ? 'Edit' : 'Add'} Group Member</h2>
                            <nav className='me-3'>
                                <ol className="breadcrumb">
                                    <li className="breadcrumb-item"><Link className='text-secondary' to="/home">Home</Link></li>
                                    {pathnames.map((item, index) => {
                                        let to = `/${pathnames.slice(0, index + 1).join('/')}`;
                                        let label
                                        const isLast = index === pathnames.length - 1;

                                        if (item === 'group') {
                                            label = 'Group'
                                        }
                                        if (item === 'groupmember') {
                                            label = 'Group Member'
                                            to += `?grpid=${grpId}&grpname=${grpName}&leader=${groupLeader}`
                                        }
                                        if (item === 'addgroupmember') {
                                            label = 'Add Group Member'
                                        }
                                        if (item === 'editgroupmember') {
                                            label = 'Edit Group Member'
                                        }

                                        return (
                                            <li className='breadcrumb-item'>
                                                {isLast ? (
                                                    <p className='text-secondary' style={{ whiteSpace: 'nowrap' }} >{label}</p>
                                                ) : (
                                                    <Link className='text-secondary' to={to}>{label}</Link>
                                                )}
                                            </li>
                                        )
                                    })}
                                </ol>
                            </nav>
                        </div>
                        <div
                            className="alert alert-danger m-4"
                            hidden={alertBlock.blockState}>
                            {alertBlock.msg}
                        </div>

                        <div className="p-3 w-50">
                            <div className='mb-3'>
                                <h4 className='text-secondary'>Group Name : {grpName}</h4>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Member</label>
                                <input
                                    value={form.email}
                                    className="form-control"
                                    name="email"
                                    onChange={handleChange}
                                />
                            </div>

                            <div className='d-flex justify-content-end'>
                                <Link className='btn btn-warning me-3' to={`/group/groupmember?grpid=${grpId}&grpname=${grpName}&leader=${groupLeader}`}>cancel </Link>
                                <button onClick={handleSubmit} className="btn btn-primary">
                                    Submit
                                </button>
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

export default AddGrpMember
