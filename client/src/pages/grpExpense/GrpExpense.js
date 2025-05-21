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
    const groupId = queryValue.get('grpid')
    const grpName = queryValue.get('grpname')
    const navigate = useNavigate();
    const [alertBlock, setAlertBlock] = useState({
        blockState: true,
        msg: ''
    })
    const [groupExpenses, setGroupExpenses] = useState([])

    useEffect(() => {
        if (!loginUser) {
            navigate('/login')
        }
    }, [])

    async function fetchGroupExpenses() {
        const response = await fetch(`${process.env.REACT_APP_FETCH_URL}/groupexpense/onegroup/${groupId}`)
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
        fetchGroupExpenses()
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
                            <h3>Group Expenses</h3>

                            <nav className='me-3'>
                                <ol className="breadcrumb">
                                    <li className="breadcrumb-item"><Link className='text-secondary' to="/home">Home</Link></li>                                    {pathnames.map((item, index) => {
                                        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                                        const label = item === 'groupexpense' ? 'Group Expense' : item === 'group' ? 'Group' : item
                                        const isLast = index === pathnames.length - 1;

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

                        <div className='d-flex justify-content-between m-4'>
                            <h4 className='text-secondary'>{grpName} Expenses : </h4>
                            <Link className='btn btn-primary' to={`/group/groupexpense/addgroupexpense?grpid=${groupId}&grpname=${grpName}`}>Add Expenses</Link>
                        </div>

                        <div className='table-responsive m-4'>
                            <table className="table table-bordered">
                                <thead>
                                    <tr>
                                        <th scope="col">S No</th>
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
                                                    <td>{item.userId.name}</td>
                                                    <td>{item.description}</td>
                                                    <td>{item.amount}</td>
                                                    <td>{item.categoryId?.name}</td>
                                                    <td>
                                                        <Link
                                                            to={`/group/groupexpense/editgroupexpense?grpexpid=${item._id}&grpid=${groupId}&grpname=${grpName}`}
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
