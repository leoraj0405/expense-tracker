import React, { useEffect, useState } from 'react'
import Header from '../../layouts/Header'
import Footer from '../../layouts/Footer'
import AsideBar from '../../layouts/AsideBar'
import { Link } from 'react-router-dom'
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { getToken } from '../../components/SessionAuth';
import { useNavigate } from 'react-router-dom'



function ListMyExpense() {
    const isLogged = getToken()
    const navigate = useNavigate()
    useEffect(() => {
        if (!isLogged) {
            navigate('/login')
        }
    }, [isLogged, navigate])
    const [expenses, setExpenses] = useState([])
    const [alert, setAlert] = useState({
        successBlockState: true,
        errorBlockState: true,
        msg: ''
    })
    let serialNo = 1

    async function fetchExpenses() {
        const response = await fetch(`${process.env.REACT_APP_FETCH_URL}/expense`)
        if (response.ok) {
            const expenseData = await response.json()
            setExpenses(expenseData.data)
        } else {
            let errorData = await response.json()
            setAlert({
                successBlockState: true,
                errorBlockState: false,
                msg: errorData.message
            })
        }
    }
    useEffect(() => {
        fetchExpenses()
    }, [])

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
            <header className='header d-flex justify-content-between text-white'>
                <Header />
            </header>

            <main className='d-flex justify-content-start'>
                <aside className='w-25'>
                    <AsideBar />
                </aside>

                <section className='p-5 w-100'>
                    {/* Body content */}

                    <div>
                        <h3>List of all expenses</h3>
                        <div className='d-flex justify-content-end p-2'>
                            <Link
                                className='btn btn-primary'
                                to='/addmyexpense'
                            >Add Expenses</Link>
                        </div>
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th scope='col'>S.No</th>
                                    <th scope="col">Category</th>
                                    <th scope="col">User</th>
                                    <th scope="col">Amount</th>
                                    <th scope="col">Date</th>
                                    <th scope='col'>Description</th>
                                    <th scope='col'>Actions</th>
                                </tr>
                            </thead>
                            <tbody className='m-4'>
                                {expenses.length > 0 ?
                                    expenses.map(expense => {
                                        return (
                                            <tr>
                                                <th scope="row">{serialNo++}</th>
                                                <td>{expense.categoryId.name}</td>
                                                <td>{expense.userId.name}</td>
                                                <td>{expense.amount}</td>
                                                <td>{expense.date.split('T')[0]}</td>
                                                <td>{expense.description}</td>
                                                <td>
                                                    <Link
                                                        style={{ color: 'black' }}
                                                        to={`/editexpense?mode=edit&expense=${expense._id}`}>
                                                        <FaEdit />
                                                    </Link>
                                                    ||
                                                    <Link
                                                        onClick={() => handleDelete(expense._id)}
                                                        style={{ color: 'red' }}>
                                                        <MdDelete />
                                                    </Link>
                                                </td>
                                            </tr>
                                        )
                                    }) :
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className='text-center text-secondary'>
                                            No Expenses founded
                                        </td>
                                    </tr>
                                }
                            </tbody>
                        </table>
                        <div
                            className="alert alert-success"
                            hidden={alert.successBlockState}>
                            {alert.msg}
                        </div>
                        <div
                            className="alert alert-danger"
                            hidden={alert.errorBlockState}>
                            {alert.msg}
                        </div>
                    </div>

                    {/* footer */}
                    <footer className='text-center mt-4'>
                        <Footer />
                    </footer>
                </section>

            </main >

        </>
    )
}

export default ListMyExpense
