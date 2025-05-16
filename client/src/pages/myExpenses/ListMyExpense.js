import React, { useEffect, useState } from 'react'
import Header from '../../layouts/Header'
import Footer from '../../layouts/Footer'
import SideBar from '../../layouts/SideBar'
import { Link, useLocation } from 'react-router-dom'
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { useNavigate } from 'react-router-dom'
import { useUser } from '../../components/Context'

function ListMyExpense() {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const queryDate = queryParams.get('date');
    const { loginUser } = useUser()
    const navigate = useNavigate()
    const [expenses, setExpenses] = useState([])
    const [alert, setAlert] = useState({
        successBlockState: true,
        errorBlockState: true,
        msg: ''
    })
    const [date, setDate] = useState('')
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (!loginUser) {
            navigate('/login')
        }
    }, [loginUser])

    async function handleOnChange(e) {
        setDate(e.target.value)
    }


    async function fetchExpenses() {
        if (queryDate) {
            setDate(queryDate)
        }
        let response
        if (date) {
            response = await fetch(`${process.env.REACT_APP_FETCH_URL}/expense/userexpense/${loginUser.data._id}?date=${date}`)
        } else {
            response = await fetch(`${process.env.REACT_APP_FETCH_URL}/expense/userexpense/${loginUser.data._id}`)

        }
        if (response.ok) {
            const expenseData = await response.json()
            setExpenses(expenseData.data)
            const total = Math.ceil(expenseData.data.total / expenseData.data.limit);
            setTotalPages(total);

        } else {
            let errorData = await response.json()
            setAlert({
                successBlockState: true,
                errorBlockState: false,
                msg: errorData.message
            })
        }
    }

    function goToPage(page) {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    }

    useEffect(() => {
        fetchExpenses()
    }, [date, currentPage])

    setTimeout(() => {
        setAlert({
            successBlockState: true,
            errorBlockState: true,
            msg: ''
        })
    }, 5000)

    function handleDelete(id) {
        if (window.confirm('Are you sure to delete this record ? ')) {
            const requestOptions = {
                method: "DELETE",
                redirect: "follow"
            };

            fetch(`${process.env.REACT_APP_FETCH_URL}/expense/${id}`, requestOptions)
                .then(async (response) => {
                    if (response.status === 200) {
                        fetchExpenses()
                        setAlert({
                            successBlockState: false,
                            errorBlockState: true,
                            msg: 'Record deleted successfully.'
                        })

                    } else {
                        let errorData = await response.json()
                        setAlert({
                            successBlockState: true,
                            errorBlockState: false,
                            msg: errorData.message
                        })
                    }
                });
        }
    }
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
                        <h2 className='mt-3'>Expenses</h2>
                        <div className='d-flex flex-column mt-4'>
                            <div className='d-flex flex-row justify-content-between pb-4'>
                                <div>
                                    <p>Filter by month : </p>
                                    <input type="month" onChange={handleOnChange} name='date' value={date} className='form-control' />
                                </div>
                                <Link className='btn btn-primary h-25'>Add New Expense</Link>
                            </div>
                            <div className='table-responsive'>
                                <table className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th scope="col">S No</th>
                                            <th scope="col">Description</th>
                                            <th scope="col">Category</th>
                                            <th scope="col">date</th>
                                            <th scope='col'>Amount</th>
                                            <th scope='col'>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {expenses.userExpenseData?.length > 0 ? (
                                            expenses.userExpenseData.map((item, index) => (
                                                <tr key={item._id}>
                                                    <td>{index + 1}</td>
                                                    <td>{item.description}</td>
                                                    <td>{item.categoryId?.name}</td>
                                                    <td>{item.date.split('T')[0]}</td>
                                                    <td>{item.amount}</td>
                                                    <td>
                                                        <Link to={`/edit-expense/${item._id}`} className='btn btn-sm btn-warning me-2'><FaEdit /></Link>
                                                        <button className='btn btn-sm btn-danger' onClick={() => handleDelete(item._id)}><MdDelete /></button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className='text-center text-secondary'>No Expenses</td>
                                            </tr>
                                        )}

                                    </tbody>
                                </table>
                                {expenses.userExpenseData?.length > 0 ?
                                    <div className='card'>
                                        <div className='card-body d-flex justify-content-center'>
                                            <nav>
                                                <ul className="pagination">
                                                    <li className="page-item">
                                                        <button className="page-link" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
                                                    </li>
                                                    {Array.from({ length: totalPages }).map((_, i) => (
                                                        <li className="page-item" key={i}><button className={currentPage === i + 1 ? "page-link active" : "page-link"} onClick={() => goToPage(i + 1)}>{i + 1}</button></li>
                                                    ))}
                                                    <li class="page-item">
                                                        <button className='page-link' onClick={() => goToPage(currentPage + 1)} disabled={true}>Next</button>
                                                    </li>
                                                </ul>
                                            </nav>
                                        </div>
                                    </div> : <></>
                                }
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

export default ListMyExpense
