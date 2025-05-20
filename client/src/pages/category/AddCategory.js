import React, { useState, useEffect } from 'react'
import Header from '../../layouts/Header'
import Footer from '../../layouts/Footer'
import SideBar from '../../layouts/SideBar'
import { useUser } from '../../components/Context';
import { useNavigate, Link, useParams, useLocation } from 'react-router-dom';


function AddCategory() {
    const { id } = useParams()
    const navigate = useNavigate()
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    const { loginUser } = useUser()
    const [formData, setFormData] = useState({ id: '', categoryName: '' })
    const [alertBlock, setAlertBlock] = useState({
        blockState: true,
        msg: ''
    })

    useEffect(() => {
        if (!loginUser) {
            navigate('/login')
        }
    }, [loginUser])

    function handleChange(e) {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSave = () => {
        const name = formData.categoryName
        const id = formData.id
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const raw = JSON.stringify({
            "name": name
        });

        const requestOptions = {
            headers: myHeaders,
            body: raw,
            redirect: "follow"
        };
        let request
        if (id) {
            request = fetch(`${process.env.REACT_APP_FETCH_URL}/category/${id}`,
                { ...requestOptions, method: "PUT" })

        } else {
            request = fetch(`${process.env.REACT_APP_FETCH_URL}/category`,
                { ...requestOptions, method: "POST" })
        }

        request.then(async (response) => {
            if (response.status === 200) {
                navigate('/category')
            } else {
                const errorInfo = await response.json()
                setAlertBlock({
                    blockState: false,
                    msg: errorInfo.message
                })
            }
        })
    }

    async function editCategory(id) {
        const singleCategory = await fetch(`${process.env.REACT_APP_FETCH_URL}/category/${id}`)
        if (singleCategory.ok) {
            const categoryData = await singleCategory.json()
            setFormData({
                id: categoryData.data._id,
                categoryName: categoryData.data.name
            })
        } else {
            const errorInfo = await singleCategory.json()
            setAlertBlock({
                blockState: false,
                msg: errorInfo.message
            })
        }

    }

    useEffect(() => {
        if (id) {
            editCategory(id)
        }
    }, [id])
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
                            <h4> {id ? 'Edit' : 'Add'} Category</h4>
                            <nav>
                                <ol className="breadcrumb">
                                    <li className="breadcrumb-item"><Link className='text-secondary' to="/home">Home</Link></li>
                                    {pathnames.map((item, index) => {
                                        var to = `/${pathnames.slice(0, index + 1).join('/')}`;
                                        var label
                                        if (item === 'addcategory') {
                                            label = 'Add Category'
                                            to = ''
                                        } else if (item === 'editcategory') {
                                            label = 'Edit Category'
                                            to = ''
                                        }else if (item === 'category') {
                                            label = 'Category'
                                        }else if (item === id) {
                                            label = ''
                                            to =+ `/${id}`
                                        }
                                        return (
                                            <li className="breadcrumb-item"><Link className='text-secondary' to={to}>{label}</Link></li>
                                        )
                                    })}
                                </ol>
                            </nav>
                        </div>
                        <div>
                            <div>
                                <div className='d-flex justify-content-center'>
                                    <div className='w-50 d-flex flex-column p-1'
                                        style={{ gap: '20px ' }}>
                                        <label htmlFor="categoryName">Category Name</label>
                                        <input
                                            type="hidden"
                                            className='form-control'
                                            onChange={handleChange}
                                            value={formData.id} />
                                        <input
                                            type="text"
                                            className='form-control'
                                            name='categoryName'
                                            onChange={handleChange}
                                            value={formData.categoryName} />

                                        <div className='d-flex justify-content-end'>
                                            <Link to='/category' className='btn btn-warning m-2'>Back</Link>
                                            <button
                                                className='btn btn-primary m-2'
                                                onClick={handleSave}>Submit</button>
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

export default AddCategory
