import React, { useEffect, useState } from 'react'
import Header from '../../layouts/Header'
import Footer from '../../layouts/Footer'
import SideBar from '../../layouts/SideBar'
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
            <header>
                <Header />
            </header>
            <div className='d-flex'>
                <aside>
                    <SideBar />
                </aside>
                <main className='p-3 w-100 bg-light'>
                    <section className='main' style={{ minHeight: '400px' }}>

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
