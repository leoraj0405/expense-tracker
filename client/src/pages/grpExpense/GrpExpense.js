import React, { useEffect, useState } from 'react'
import Header from '../../layouts/Header'
import Footer from '../../layouts/Footer'
import SideBar from '../../layouts/SideBar'
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useUser } from '../../components/Context';
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

function useQuery() {
    return new URLSearchParams(useLocation().search)
}
function GrpExpense() {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);
    const { loginUser } = useUser();
    const queryValue = useQuery()
    const groupId = queryValue.get('grpId')
    const navigate = useNavigate();
    const [alertBlock, setAlertBlock] = useState({
        blockState: true,
        msg: ''
    })
    const [groups, setGroups] = useState([])
    const [groupExpenses, setGroupExpenses] = useState([])
    const [grpId, setGrpId] = useState('')
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        if (!loginUser) {
            navigate('/login')
        }
    }, [])

    async function fetchGroupExpenses() {
        if (groupId) {
            setGrpId(groupId)
            searchParams.delete('grpId');
            setSearchParams(searchParams);
        }
        const response = await fetch(`${process.env.REACT_APP_FETCH_URL}/groupexpense/onegroup/${grpId}`)
        if (response.status === 200) {
            const responseData = await response.json()
            setGroupExpenses(responseData.data)
        } else {
            const errorInfo = await response.json()
            setAlertBlock({
                blockState: true,
                msg: errorInfo.message
            })
        }
    }

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

    function hanldeDelete(id) {
        if (window.confirm('Are you sure to delete this record ?')) {
            let request = fetch(`${process.env.REACT_APP_FETCH_URL}/groupexpense/${id}`, { method: "DELETE" })
            request.then(async (response) => {
                if (response.status === 200) {
                    fetchGroupExpenses()
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
        fetchGrps()
    }, [])

    useEffect(() => {
        fetchGroupExpenses()
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
                                    const label = item === 'groupexpense' ? 'Group Expense' : item
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
                                    <label htmlFor="exampleInput" className="form-label">Select the Group</label>
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
                                        <button onClick={fetchGroupExpenses} className="btn btn-primary">Submit</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='d-flex justify-content-between m-4'>
                            <h3>Group Expenses</h3>
                            <Link className='btn btn-primary' to={`/addgroupexpense`}>Add Expenses</Link>
                        </div>

                        <div className='table-responsive m-4'>
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th scope="col">S No</th>
                                        <th scope="col">Group Name</th>
                                        <th scope='col'>User</th>
                                        <th scope="col">Description</th>
                                        <th scope="col">Amount</th>
                                        <th scope='col'>Category</th>
                                        <th scope='col'>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {groupExpenses.length > 0 ?
                                        groupExpenses.map((item, index) => {
                                            return (
                                                <tr key={index}>
                                                    <td>{index + 1}</td>
                                                    <td>{item.groupId.name}</td>
                                                    <td>{item.userId.name}</td>
                                                    <td>{item.description}</td>
                                                    <td>{item.amount}</td>
                                                    <td>{item.categoryId.name}</td>
                                                    <td>
                                                        <Link
                                                            to={`/editgroupexpense?grpexpid=${item._id}`}
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
                                            <td colSpan={7} className='text-center text-secondary'>No Expenses</td>
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

export default GrpExpense
