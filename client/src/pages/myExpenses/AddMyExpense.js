import React, { useEffect, useState } from 'react'
import Header from '../../layouts/Header'
import Footer from '../../layouts/Footer'
import AsideBar from '../../layouts/AsideBar'
import { useLocation, useNavigate } from 'react-router-dom'
import { getToken } from '../../components/SessionAuth';


function useQuery() {
    return new URLSearchParams(useLocation().search)
}

function AddMyExpense() {
    const isLogged = getToken()
    const navigate = useNavigate()
    useEffect(() => {
        if (!isLogged) {
            navigate('/login')
        }
    }, [isLogged, navigate])
    const queryValue = useQuery()
    const [users, setUsers] = useState([])
    const [categories, setCategories] = useState([])
    const [formData, setFormData] = useState({
        id: '',
        user: '',
        category: '',
        date: '',
        amount: '',
        description: ''
    })
    const [dangerAlert, setDangetAlert] = useState({ blockState: true, msg: '' })
    const pageMode = queryValue.get('mode')
    const expenseId = queryValue.get('expense')

    async function fetchUser() {
        const response = await fetch(`${process.env.REACT_APP_FETCH_URL}/user`)
        const userData = await response.json()
        setUsers(userData.data)
    }

    async function fetchCategory(id) {
        const response = await fetch(`${process.env.REACT_APP_FETCH_URL}/category`)
        const categoryData = await response.json()
        setCategories(categoryData.data)
    }

    async function fetchExpense(id) {
        const response = await fetch(`${process.env.REACT_APP_FETCH_URL}/expense/${id}`)
        if (response.ok) {
            const expenseData = await response.json()
            const isoDate = expenseData.data.date
            const formattedDate = isoDate.split("T")[0];
            setFormData({
                id: expenseData.data._id,
                user: expenseData.data.userId._id,
                category: expenseData.data.categoryId._id,
                date: formattedDate,
                amount: expenseData.data.amount,
                description: expenseData.data.description
            })
        } else {
            const errorData = await response.json()
            setDangetAlert({ blockState: false, msg: errorData.message })
        }
    }

    function handleChange(e) {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }


    function handleSave() {
        const id = formData.id
        const userId = formData.user
        const categoryId = formData.category
        const amount = formData.amount
        const description = formData.description
        const date = formData.date

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const raw = JSON.stringify({
            "description": description,
            "amount": amount,
            "userId": userId,
            "categoryId": categoryId,
            "date": date
        });

        const requestOptions = {
            headers: myHeaders,
            body: raw,
        };


        let request
        if (id) {
            request = fetch(`${process.env.REACT_APP_FETCH_URL}/expense/${id}`,
                { ...requestOptions, method: "PUT" })
        } else {
            request = fetch(`${process.env.REACT_APP_FETCH_URL}/expense`,
                { ...requestOptions, method: "POST" })
        }

        request.then(async (response) => {
            if (response.status === 200) {
                navigate('/myexpense')
            } else {
                const errorData = await response.json()
                setDangetAlert({ blockState: false, msg: errorData.message })
            }
        });
    }

    useEffect(() => {
        fetchUser()
        fetchCategory()
    }, [])

    useEffect(() => {
        if (expenseId) {
            fetchExpense(expenseId);
        }
    }, [expenseId])


    setTimeout(() => {
        setDangetAlert({ blockState: true, msg: '' })
    }, 5000)


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
                    <h3 className='mb-4'>{pageMode === 'edit'
                        ? 'Edit My Expenses'
                        : 'Add My Expenses'}</h3>
                    <div className="alert alert-danger" hidden={dangerAlert.blockState}>
                        {dangerAlert.msg}
                    </div>
                    <div
                        className="needs-validation p-4 rounded"
                        style={{ backgroundColor: '#f1f1f1' }}>
                        <div className="row">
                            <div className="col-md-4 mb-3">
                                <label htmlFor='category'>Category</label>
                                <select
                                    name="category"
                                    className="form-control"
                                    value={formData.category}
                                    onChange={handleChange}>
                                    <option>Choose category</option>
                                    {categories.map(category => {
                                        return (
                                            <option
                                                key={category._id}
                                                value={category._id}>
                                                {category.name}
                                            </option>
                                        )
                                    })}
                                </select>
                            </div>
                            <div className="col-md-4 mb-3">
                                <label htmlFor='user'>User</label>
                                <select
                                    name="user"
                                    className="form-control"
                                    value={formData.user}
                                    onChange={handleChange}>
                                    <option>Choose User</option>
                                    {users.map(user => {
                                        return (
                                            <option
                                                key={user._id}
                                                value={user._id}>
                                                {user.name}
                                            </option>
                                        )
                                    })}
                                </select>
                            </div>
                            <div className="col-md-4 mb-3">
                                <label htmlFor='amount'>Amount</label>
                                <input
                                    type="number"
                                    name='amount'
                                    class="form-control"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    required />
                            </div>
                            <div className="col-md-4 mb-3">
                                <label htmlFor='date'>Date</label>
                                <input
                                    type="date"
                                    name='date'
                                    class="form-control"
                                    value={formData.date}
                                    onChange={handleChange}
                                    required />
                            </div>
                            <div className="col-md-4 mb-3">

                                <input
                                    type="hidden"
                                    name='id'
                                    class="form-control"
                                    value={formData.id}
                                    required />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="col-md-6 mb-3">
                                <label htmlFor='description'>Discription</label>
                                <textarea
                                    type="text"
                                    name='description'
                                    class="form-control"
                                    value={formData.description}
                                    onChange={handleChange}
                                    required />
                            </div>
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={() => handleSave(expenseId)}>
                            Submit form
                        </button>
                    </div>
                    {/* footer */}
                    <footer className='text-center mt-4'>
                        <Footer />
                    </footer>
                </section>

            </main>

        </>
    )
}

export default AddMyExpense
