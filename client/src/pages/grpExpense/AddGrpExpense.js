import React, { useState, useEffect } from 'react'
import Header from '../../layouts/Header'
import SideBar from '../../layouts/SideBar'
import Footer from '../../layouts/Footer'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import { useUser } from '../../components/Context'

function useQuery() {
    return new URLSearchParams(useLocation().search)
}

function AddGrpExpense() {
    const { loginUser } = useUser()
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);
    const navigate = useNavigate()
    const queryValue = useQuery()
    const grpExpenseId = queryValue.get('grpexpid')

    const [form, setForm] = useState({
        id: '',
        groupId: '',
        userId: '',
        description: '',
        amount: '',
        categoryId: ''
    });

    const [users, setUsers] = useState([])
    const [groups, setGroups] = useState([])
    const [categories, setCategories] = useState([])
    const [alertBlock, setAlertBlock] = useState({
        blockState: true,
        msg: ''
    })

    useEffect(() => {
        if (!loginUser) {
            navigate('/login')
        }
    }, [])
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = () => {
        const id = form.id
        const groupId = form.groupId
        const userId = form.userId
        const description = form.description
        const amount = form.amount
        const categoryId = form.categoryId

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const raw = JSON.stringify({
            "groupId": groupId,
            "description": description,
            "amount": Number(amount) < 0 ? 0 : amount,
            "userId": userId,
            "categoryId": categoryId
        });

        const requestOptions = {
            headers: myHeaders,
            body: raw,
        };

        let request
        if (id) {
            request = fetch(`${process.env.REACT_APP_FETCH_URL}/groupexpense/${id}`, { ...requestOptions, method: "PUT" })
        } else {
            request = fetch(`${process.env.REACT_APP_FETCH_URL}/groupexpense`, { ...requestOptions, method: "POST" })
        }
        request.then(async (response) => {
            if (response.status === 200) {
                navigate('/groupexpense')
            } else {
                const errorInfo = await response.json()
                setAlertBlock({
                    blockState: false,
                    msg: errorInfo.message
                })
            }
        });
    };

    async function editExpense(id) {
        const response = await fetch(`${process.env.REACT_APP_FETCH_URL}/groupexpense/${id}`);
        if (response.status === 200) {
            const data = await response.json();
            const edited = {
                id: data.data._id,
                groupId: data.data.groupId,
                userId: data.data.userId,
                categoryId: data.data.categoryId,
                description: data.data.description,
                amount: data.data.amount
            };
            setForm(edited);
        } else {
            const errorInfo = await response.json();
            setAlertBlock({ blockState: false, msg: errorInfo.message });
        }
    }

    async function fetchUsers(){
        const response = await fetch(`${process.env.REACT_APP_FETCH_URL}/user`)
        if (response.status === 200) {
            const responseData = await response.json()
            setUsers(responseData.data)
        } else {
            const errorInfo = await response.json()
            setAlertBlock({
                blockState: false,
                msg: errorInfo.message
            })
        }
    }

    async function fetchGroups() {
        const response = await fetch(`${process.env.REACT_APP_FETCH_URL}/group`)
        if (response.status === 200) {
            const responseData = await response.json()
            setGroups(responseData.data)
        } else {
            const errorInfo = await response.json()
            setAlertBlock({
                blockState: false,
                msg: errorInfo.message
            })
        }
    }

    async function fetchCategory() {
        const response = await fetch(`${process.env.REACT_APP_FETCH_URL}/category`)
        if (response.status === 200) {
            const responseData = await response.json()
            setCategories(responseData.data.categoryData)
        } else {
            const errorInfo = await response.json()
            setAlertBlock({
                blockState: false,
                msg: errorInfo.message
            })
        }
    }

    useEffect(() => {
        fetchGroups()
        fetchUsers()
        fetchCategory()
    }, [])

    useEffect(() => {
        if (grpExpenseId) {
            editExpense(grpExpenseId);
        }
    }, [grpExpenseId]);


    useEffect(() => {
        setTimeout(() => {
            setAlertBlock({
                blockState: true,
                msg: ''
            })
        }, 5000)
    }, [alertBlock])

    console.log(form)

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
                                    const label = item === 'addgroupexpense' ? 'Add Group Expense' : item === 'editgroupexpense' ? 'Edit Group Expense' : item
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

                        <div className="p-3 m-4 w-50">
                            <input type="hidden" name='id' value={form.id} />

                            <div className="mb-3">
                                <label className="form-label">Group</label>
                                <select
                                    value={form.groupId._id}
                                    className="form-select"
                                    name="groupId"
                                    onChange={handleChange}
                                >
                                    <option>Select group</option>
                                    {groups.map((item, index) => {
                                        return (
                                            <option key={index} value={item._id}>{item.name}</option>
                                        )
                                    })}
                                </select>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Member</label>
                                <select
                                    value={form.userId._id}
                                    className="form-select"
                                    name="userId"
                                    onChange={handleChange}
                                >
                                    <option>Select member</option>
                                    {users.map((item, index) => {
                                        return (
                                            <option key={index} value={item._id}>{item.name}</option>
                                        )
                                    })}
                                </select>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Category</label>
                                <select
                                    value={form.categoryId._id}
                                    className="form-select"
                                    name="categoryId"
                                    onChange={handleChange}
                                >
                                    <option>Select category</option>
                                    {categories.map((item, index) => {
                                        return (
                                            <option key={index} value={item._id}>{item.name}</option>
                                        )
                                    })}
                                </select>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Description</label>
                                <textarea onChange={handleChange} value={form.description} className='form-control' name="description"></textarea>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Amount</label>
                                <input onChange={handleChange} value={form.amount} type="number" name='amount' className='form-control' />
                            </div>

                            <div className='d-flex justify-content-end'>
                                <button onClick={handleSubmit} className="btn btn-primary">
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

export default AddGrpExpense
