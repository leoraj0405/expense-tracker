import React, { useEffect, useState } from 'react'
import Header from '../../layouts/Header'
import Footer from '../../layouts/Footer'
import SideBar from '../../layouts/SideBar'
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../../components/Context';
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

function useQuery() {
    return new URLSearchParams(useLocation().search)
}

function GrpMember() {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);
    const { loginUser } = useUser();
    const queryValue = useQuery()
    const groupId = queryValue.get('grpid')
    const grpName = queryValue.get('grpname')

    const navigate = useNavigate();
    const [alertBlock, setAlertBlock] = useState({
        blockState: true,
        msg: ''
    })
    const [groupMembers, setGroupMembers] = useState([])

    useEffect(() => {
        if (!loginUser) {
            navigate('/login')
        }
    }, [])

    async function fetchGroupMembers() {
        const response = await fetch(`${process.env.REACT_APP_FETCH_URL}/groupmember/onegroup/${groupId}`)
        if (response.status === 200) {
            const grpMembersData = await response.json()
            setGroupMembers(grpMembersData.data)
        } else {
            const errorInfo = await response.json()
            setAlertBlock({
                blockState: true,
                msg: errorInfo.message
            })
        }
    }

    function hanldeDelete(id) {
        if (window.confirm('Are you sure to delete this record ?')) {
            let request = fetch(`${process.env.REACT_APP_FETCH_URL}/groupmember/${id}`, { method: "DELETE" })
            request.then(async (response) => {
                if (response.status === 200) {
                    fetchGroupMembers()
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
        fetchGroupMembers(groupId)
    }, [groupId])

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
                            <h2>Group Members</h2>
                            <nav className='me-3'>
                                <ol className="breadcrumb">
                                    <li className="breadcrumb-item"><Link className='text-secondary' to="/home">Home</Link></li>
                                    {pathnames.map((item, index) => {
                                        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                                        const label = item === 'groupmember' ? 'Group Member' : item === 'group' ? 'Group' : item
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
                        <div
                            className="alert alert-danger m-4"
                            hidden={alertBlock.blockState}>
                            {alertBlock.msg}
                        </div>

                        <div className='d-flex justify-content-between ms-4 me-4'>
                            <h4 className='text-secondary'>{grpName} Members : </h4>
                            <Link className='btn btn-primary' to={`addgroupmember?grpid=${groupId}&grpname=${grpName}`}>Add Members</Link>
                        </div>

                        <div className='table-responsive m-4'>
                            <table className="table table-bordered">
                                <thead>
                                    <tr>
                                        <th scope="col">S No</th>
                                        <th scope="col">Member</th>
                                        <th scope="col">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {groupMembers.length > 0 ?
                                        groupMembers.map((item, index) => {
                                            return (
                                                <tr key={index}>
                                                    <td>{index + 1}</td>
                                                    <td>{item.userId.name}</td>
                                                    <td>
                                                        <Link
                                                            to={`editgroupmember?grpid=${groupId}&grpname=${grpName}&grpmemid=${item._id}`}
                                                            className='btn btn-sm btn-warning me-2'>
                                                            <FaEdit />
                                                        </Link>
                                                        <Link
                                                            onClick={() => hanldeDelete(item._id)}
                                                            className='btn btn-sm btn-danger'>
                                                            <MdDelete />
                                                        </Link>
                                                    </td>
                                                </tr>
                                            )
                                        }) :
                                        <tr>
                                            <td colSpan={4} className='text-center text-secondary'>No Members</td>
                                        </tr>}
                                </tbody>
                            </table>
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

export default GrpMember
