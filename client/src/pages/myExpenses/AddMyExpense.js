import React, { useEffect, useState } from 'react'
import Header from '../../layouts/Header'
import Footer from '../../layouts/Footer'
import SideBar from '../../layouts/SideBar'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useUser } from '../../components/Context'

function useQuery() {
    return new URLSearchParams(useLocation().search)
}

function AddMyExpense() {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    const { loginUser } = useUser()
    const navigate = useNavigate()

    useEffect(() => {
        if (!loginUser) {
            navigate('/login')
        }
    }, [loginUser])

    const queryValue = useQuery()
    const [categories, setCategories] = useState([])
    const [formData, setFormData] = useState({
        id: '',
        category: '',
        date: '',
        amount: '',
        description: ''
    })
    const [dangerAlert, setDangetAlert] = useState({ blockState: true, msg: '' })
    const pageMode = queryValue.get('mode')
    const expenseId = queryValue.get('expense')


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
        const categoryId = formData.category
        const amount = formData.amount
        const description = formData.description
        const date = formData.date

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");


        const raw = JSON.stringify({
            "description": description,
            "amount": Number(amount) < 0 ? 0 : amount,
            "userId": loginUser?.data?._id,
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
                navigate('/expense')
            } else {
                const errorData = await response.json()
                setDangetAlert({ blockState: false, msg: errorData.message })
            }
        });
    }

    useEffect(() => {
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
                                    const label = item === 'addexpense' ? 'Add expense' : item === 'editexpense' ? 'Edit expense' : item
                                    const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                                    return (
                                        <li className="breadcrumb-item"><Link className='text-secondary' to={to}>{label}</Link></li>
                                    )
                                })}
                            </ol>
                        </nav>
                        <h3 className='m-4'>{pageMode === 'edit'
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
                                    <label htmlFor='amount'>Amount</label>
                                    <input
                                        type="number"
                                        name='amount'
                                        min="0"
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
                            <div className='d-flex justify-content-end'>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => handleSave(expenseId)}>
                                    Submit
                                </button>
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

export default AddMyExpense
