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
        fetchUserGrp(loginUser?.data?._id)
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

                        <nav className='m-4'>
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item"><Link className='text-secondary' to="/home">Home</Link></li>
                                {pathnames.map((item, index) => {
                                    const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                                    return (
                                        <li className="breadcrumb-item"><Link className='text-secondary' to={to}>{item}</Link></li>
                                    )
                                })}
                            </ol>
                        </nav>

                        <div className='m-4'>
                            <div className='d-flex justify-content-between mb-2'>
                            <h2>Your group list</h2>
                                <Link
                                    to={'/addgroup'}
                                    className='btn btn-primary'>
                                    Create new group
                                </Link>
                            </div>

                            <div
                                className="alert alert-danger m-2"
                                hidden={alertBlock.blockState}>
                                {alertBlock.msg}
                            </div>

                            <div className='table-responsive'>
                                <table className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th scope="col">Sno</th>
                                            <th scope="col">Group Name</th>
                                            <th scope='col'>Created By</th>
                                            <th scope="col" className='text-center'>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {userGrps.length > 0 ? userGrps.map(userGrp => {
                                            return (
                                                <tr>
                                                    <th scope="row">{sno++}</th>
                                                    <td>{userGrp.name}</td>
                                                    <td>{userGrp.createdBy.name}</td>
                                                    <td
                                                        className='d-flex'
                                                        style={{ gap: '30px' }}>
                                                        <Link
                                                            to={`/groupmember?grpId=${userGrp._id}`}
                                                            className='btn btn-link'>
                                                            View this group members
                                                        </Link>
                                                        <Link
                                                            to={`/groupexpense?grpId=${userGrp._id}`}
                                                            className='btn btn-link'>
                                                            View this group expenses
                                                        </Link>
                                                        <Link
                                                            to={`/editgroup?mode=edit&group=${userGrp._id}`}
                                                            className='btn btn-sm btn-warning me-2'>
                                                            <FaEdit />
                                                        </Link>
                                                        <Link
                                                            onClick={() => hanldeDelete(userGrp._id)}
                                                            className='btn btn-sm btn-danger'>
                                                            <MdDelete />
                                                        </Link>
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
