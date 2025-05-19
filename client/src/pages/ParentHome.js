import React, { useRef, useEffect, useState } from 'react'
import Footer from '../layouts/Footer'
import Logo from '../assets/img/websiteLogo.png'
import defaultImage from '../assets/img/profile.png'
import { Link, useNavigate } from 'react-router-dom'
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'

import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js';
window.bootstrap = bootstrap;



function ParentHome() {
    const modalRef = useRef(null);
    const modalInstance = useRef(null);
    const navigate = useNavigate()
    const [user, setUser] = useState('')
    const [children, setChildren] = useState([])
    const [childExpense, setChildExpense] = useState([])
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [amount, setAmount] = useState(0);
    const [data, setData] = useState([])

    const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#a4de6c"];
    const timeOptions = {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    }

    useEffect(() => {
        isParentLogged()

        if (modalRef.current) {
            modalInstance.current = new window.bootstrap.Modal(modalRef.current);
            modalInstance.current.show();
        }
    }, []);

    function handleChange(e) {
        setUser(e.target.value)
    }

    function goToPage(page) {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    }
    async function isParentLogged() {
        const response = await fetch(`${process.env.REACT_APP_FETCH_URL}/user/parenthome`, { method: 'GET', credentials: 'include' })
        const usersData = await response.json()
        if (response.status === 200) {
            setChildren(usersData.data)
        } else {
            navigate('/parentlogin')
        }
    }

    const handleSubmit = async () => {
        modalInstance.current.hide();

        const todayDate = new Date()
        const year = todayDate.getFullYear();
        const month = todayDate.getMonth() + 1;
        const day = todayDate.getDate();
        const formattedDate = `${year}-${month}-${day}`;


        const response = await fetch(`${process.env.REACT_APP_FETCH_URL}/expense/userexpense/${user}?page=${currentPage}&page=${formattedDate}`)
        const responseData = await response.json()
        if (response.status === 200) {
            const total = Math.ceil(responseData.data.total / responseData.data.limit);
            setTotalPages(total);
            setChildExpense(responseData?.data?.userExpenseData)
            const result = responseData.data.userExpenseData.map((item) => ({
                name: item.description,
                value: item.amount
            }))
            setData(result)
        } else {
            navigate('/parentlogin')
        }
    };

    useEffect(() => {
        if (data.length > 0) {
            let total = 0;
            data.forEach(item => {
                total += Number(item.value);
            });
            setAmount(total);
        } else {
            setAmount(0)
        }
    }, [data])
    return (
        <>
            <header>
                <nav className="navbar navbar-expand-lg navbar-light bg-primary p-4">
                    <Link className="navbar-brand d-flex align-items-center">
                        <img src={Logo} alt="Logo" width="30" height="30" className="d-inline-block align-top me-2" />
                        <span className='text-white'>Expense Tracker</span>
                    </Link>

                    <div className="ms-auto d-flex align-items-center">
                        <span className=" me-3 text-white">
                            Welcome Parent
                        </span>
                        <div className="dropdown">
                            <Link className="dropdown-toggle d-flex align-items-center" role="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                                <img
                                    src={defaultImage}
                                    alt="User Profile"
                                    className="rounded-circle"
                                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                />
                            </Link>
                            <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                                <li><Link className="dropdown-item" to={'/parentlogin'}>Logout</Link></li>
                            </ul>
                        </div>
                    </div>
                </nav>
            </header>
            <div className='d-flex'>
                <main className='p-3 w-100 bg-light'>
                    <section className='main' style={{ minHeight: '400px' }}>
                        <div
                            className="modal fade"
                            id="myModal"
                            tabIndex="-1"
                            aria-labelledby="exampleModalLabel"
                            aria-hidden="true"
                            ref={modalRef}
                        >
                            <div className="modal-dialog">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title" id="exampleModalLabel">Welcome Parent</h5>
                                    </div>
                                    <div className="modal-body">
                                        <div>
                                            <div className="mb-3">
                                                <label htmlFor="inputField" className="form-label">Example input</label>
                                                <select name="userId" className='form-select' value={user.userId} onChange={handleChange}>
                                                    <option value='leo'>select your child</option>
                                                    {children?.map((item) => {
                                                        return (
                                                            <option value={item._id}>{item.name}</option>
                                                        )
                                                    })}
                                                </select>
                                            </div>
                                            <button onClick={handleSubmit} className="btn btn-primary">Submit</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='table-responsive m-4'>
                            <div className='card'>
                                <div className='card-body'>
                                    <h2>Expenses</h2>
                                    <table class="table table-striped">
                                        <thead>
                                            <tr>
                                                <th scope="col">Sno</th>
                                                <th scope="col">Description</th>
                                                <th scope="col">Category</th>
                                                <th scope="col">Amount</th>
                                                <th scope='col'>Date & Time</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {childExpense?.length > 0 ? (
                                                childExpense.map((item, index) => (
                                                    <tr key={index}>
                                                        <td>{index + 1}</td>
                                                        <td>{item?.description}</td>
                                                        <td>{item?.categoryId?.name}</td>
                                                        <td>{item?.amount}</td>
                                                        <td>  {new Date(item?.createdAt).toLocaleString('en-IN', timeOptions)}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={5} className='text-center text-secondary'>
                                                        No expenses.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                    {childExpense?.length > 0 ?
                                        <div className='card'>
                                            <div className='card-body d-flex justify-content-center'>
                                                <nav>
                                                    <ul className="pagination">
                                                        <li className="page-item">
                                                            <button className="page-link" onClick={() => goToPage(Number(currentPage) - 1)} >Previous</button>
                                                        </li>
                                                        {Array.from({ length: totalPages }).map((_, i) => (
                                                            <li className="page-item" key={i}>
                                                                <button className={currentPage === i + 1 ? "page-link active" : "page-link"} onClick={() => goToPage(i + 1)}>{i + 1}</button>
                                                            </li>
                                                        ))}
                                                        <li class="page-item">
                                                            <button className='page-link' onClick={() => goToPage(Number(currentPage) + 1)}>Next</button>
                                                        </li>
                                                    </ul>
                                                </nav>
                                            </div>
                                        </div> : <></>
                                    }
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className='container mt-3'>
                                <div className='row mt-3' style={{ gap: '50px' }}>
                                    <div className='col-lg'>
                                        <div className="container">
                                            <div className="rowcolumn">
                                                <div className="col-lg ">
                                                    <div class="card  boxshadow p-3 mb-5 bg-white rounded text-center" >
                                                        <div class="card-body">
                                                            <h5 class="card-title">Month Total Expenses</h5>
                                                            <p class="card-text">₹ {amount}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='chart col-lg boxshadow'>
                                        <div className="w-full max-w-md mx-auto p-4 bg-white shadow-md rounded-2xl text-center">
                                            <h2 className="text-xl font-semibold text-center mb-4">This month Expenses Chart</h2>
                                            <div className='d-flex justify-content-center'>
                                                <PieChart width={300} height={300} >
                                                    <Pie
                                                        data={data}
                                                        cx="50%"
                                                        cy="50%"
                                                        outerRadius={90}
                                                        fill="#8884d8"
                                                        dataKey="value"
                                                        label
                                                    >
                                                        {data.map((_, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                    <Legend />
                                                </PieChart>
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

export default ParentHome
