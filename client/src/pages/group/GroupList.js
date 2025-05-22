import React, { useEffect, useState } from 'react'
import Header from '../../layouts/Header'
import Footer from '../../layouts/Footer'
import SideBar from '../../layouts/SideBar'
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../../components/Context';


function GroupList() {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);
    const { loginUser } = useUser()
    const navigate = useNavigate()
    const [alertBlock, setAlertBlock] = useState({
        blockState: true,
        msg: ''
    })
    const [userGrps, setUserGrps] = useState([])
    var sno = 1

    useEffect(() => {
        if (!loginUser) {
            navigate('/login')
        }
    }, [loginUser])

    function fetchUserGrp(id) {
        fetch(`${process.env.REACT_APP_FETCH_URL}/group/usergroups/${id}`, { method: "GET" })
            .then(async (response) => {
                if (response.status === 200) {
                    const userGrpData = await response.json()
                    setUserGrps(userGrpData.data)
                } else {
                    const errorInfo = await response.json()
                    setAlertBlock({
                        blockState: true,
                        msg: errorInfo.message
                    })
                }
            });
    }

    function hanldeDelete(id) {
        if (window.confirm('Are you sure to delete this record ?')) {
            let request = fetch(`${process.env.REACT_APP_FETCH_URL}/group/${id}`, { method: "DELETE" })
            request.then(async (response) => {
                if (response.status === 200) {
                    fetchUserGrp()
                } else {
                    const errorInfo = await response.json()
                    setAlertBlock({
                        blockState: false,
                        msg: errorInfo.message
                    })
                }
            });
        }
    }

    useEffect(() => {
        if (loginUser?.data?._id) {
            fetchUserGrp(loginUser?.data?._id)
        }
    }, [])

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
                            <h2>Your group list</h2>
                            <nav className='me-3'>
                                <ol className="breadcrumb">
                                    <li className="breadcrumb-item"><Link className='text-secondary' to="/home">Home</Link></li>
                                    {pathnames.map((item, index) => {
                                        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                                        const label = item === 'group' ? 'Group' : item
                                        const isLast = index === pathnames.length - 1
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

                        <div className='m-4'>
                            <div className='d-flex justify-content-end mb-2'>
                                <Link
                                    to={'addgroup'}
                                    className='btn btn-primary'>
                                    Create new group
                                </Link>
                            </div>

                            <div
                                className="alert alert-danger m-2"
                                hidden={alertBlock.blockState}>
                                {alertBlock.msg}
                            </div>

                            <div className='table-responsive mt-4'>
                                <table className="table table-bordered">
                                    <thead>
                                        <tr>
                                            <th scope="col">Sno</th>
                                            <th scope="col">Group Name</th>
                                            <th scope='col'>Created By</th>
                                            <th scope="col">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {userGrps.length > 0 ? userGrps.map(userGrp => {
                                            return (
                                                <tr>
                                                    <td scope="row">{sno++}</td>
                                                    <td>{userGrp.name}</td>
                                                    <td>{userGrp.createdBy.name}</td>
                                                    <td
                                                        className='d-flex'
                                                        style={{ gap: '30px' }}>
                                                        {
                                                            userGrp.createdBy._id === loginUser?.data?._id ? (
                                                                <>
                                                                    <Link
                                                                        to={`/group/groupmember?grpid=${userGrp._id}&grpname=${userGrp.name}&leader=${userGrp.createdBy._id}`}
                                                                        className='btn btn-link'>
                                                                        Manage Members
                                                                    </Link>
                                                                    <Link
                                                                        to={`/group/groupexpense?grpid=${userGrp._id}&grpname=${userGrp.name}&leader=${userGrp.createdBy._id}`}
                                                                        className='btn btn-link'>
                                                                        Manage Expenses
                                                                    </Link>
                                                                    <Link
                                                                        to={`/group/editgroup?mode=edit&group=${userGrp._id}`}
                                                                        className='btn btn-sm btn-warning me-2'>
                                                                        <FaEdit />
                                                                    </Link>
                                                                    <Link
                                                                        onClick={() => hanldeDelete(userGrp._id)}
                                                                        className='btn btn-sm btn-danger'>
                                                                        <MdDelete />
                                                                    </Link>
                                                                </>
                                                            ) : (
                                                                <>
                                                                <Link
                                                                    to={`/group/groupexpense?grpid=${userGrp._id}&grpname=${userGrp.name}&leader=${userGrp.createdBy._id}`}
                                                                    className='btn btn-link'>
                                                                    Your Expenses
                                                                </Link>
                                                                <Link
                                                                    to={`/group/groupmember?grpid=${userGrp._id}&grpname=${userGrp.name}&leader=${userGrp.createdBy._id}`}
                                                                    className='btn btn-link'>
                                                                    Your Members
                                                                </Link>
                                                            </>
                                                            )
                                                        }

                                                    </td>
                                                </tr>
                                            )
                                        }) :
                                            <tr>
                                                <td
                                                    colSpan={4}
                                                    className='text-center text-secondary'>
                                                    No Groups founded
                                                </td>
                                            </tr>}
                                    </tbody>
                                </table>
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

export default GroupList
