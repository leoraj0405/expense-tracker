import React, { useEffect, useState } from 'react'
import Header from '../../layouts/Header'
import Footer from '../../layouts/Footer'
import SideBar from '../../layouts/SideBar'
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../../components/Context';


function GrpMember() {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);
    const { loginUser } = useUser();
    const navigate = useNavigate();
    const [alertBlock, setAlertBlock] = useState({
        blockState: true,
        msg: ''
    })
    const [groups, setGroups] = useState([])
    const [groupMembers, setGroupMembers] = useState([])
    const [grpId, setGrpId] = useState('')

    useEffect(() => {
        if (!loginUser) {
            navigate('/login')
        }
    }, [])

    async function fetchGroupMembers() {
        console.log(grpId)
        const response = await fetch(`${process.env.REACT_APP_FETCH_URL}/groupmember/onegroup/${grpId}`)
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

    console.log(groupMembers)

    async function fetchGrps() {
        const response = await fetch(`${process.env.REACT_APP_FETCH_URL}/group`)
        if (response.status === 200) {
            const grpData = await response.json()
            setGroups(grpData.data)
        } else {
            const errorInfo = await response.json()
            setAlertBlock({
                blockState: true,
                msg: errorInfo.message
            })
        }
    }

    useEffect(() => {
        fetchGrps()
    }, [])

    useEffect(() => {
        fetchGroupMembers()
    }, [grpId])

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
                                <li className="breadcrumb-item"><Link className='text-secondary' to="/group">Group</Link></li>
                                {pathnames.map((item, index) => {
                                    const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                                    const label = item === 'groupmember' ? 'Group Member' : item
                                    return (
                                        <li className="breadcrumb-item"><Link className='text-secondary' to={to}>{label}</Link></li>
                                    )
                                })}
                            </ol>
                        </nav>

                        <div
                            className="alert alert-danger m-4"
                            hidden={alertBlock.blockState}>
                            {alertBlock.msg}
                        </div>

                        <div className='m-4 d-flex justify-content-center'>
                            <div className='w-25'>
                                <div className="mb-3">
                                    <label for="exampleInput" className="form-label">Select the Group</label>
                                    <select className="form-select"
                                        onChange={(e) => {
                                            setGrpId(e.target.value)
                                        }}>
                                        <option></option>
                                        {groups.map((item, index) => {
                                            return (
                                                <option key={index} value={item._id}>{item.name}</option>
                                            )
                                        })}
                                    </select>
                                    <div className='text-center pt-4'>
                                        <button onClick={fetchGroupMembers} className="btn btn-primary">Submit</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='table-responsive m-4'>
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th scope="col">S No</th>
                                        <th scope="col">Group Name</th>
                                        <th scope="col">Member</th>
                                        <th scope="col">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array(groupMembers.length) > 0 ?
                                        Array(groupMembers).map((item, index) => {
                                            return (
                                                <tr key={index}>
                                                    <td>{index++}</td>
                                                    <td>{item.groupId.name}</td>
                                                    <td>{item.userId.name}</td>
                                                    <td></td>
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
