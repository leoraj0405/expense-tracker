import React, { useEffect, useState } from 'react'
import Header from '../../layouts/Header'
import Footer from '../../layouts/Footer'
import AsideBar from '../../layouts/AsideBar'
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { Link } from 'react-router-dom';

function CategoryList() {

    const [categories, setCategories] = useState([])
    const [block, setBlock] = useState(true)
    const [formData, setFormData] = useState({ id: '', categoryName: '' })
    const [alertBlock, setAlertBlock] = useState({
        blockState: true,
        msg: ''
    })
    const [formName, setFormName] = useState('Add')
    let serialNo = 1


    async function editCategory(id) {
        const singleCategory = await fetch(`${process.env.REACT_APP_FETCH_URL}/category/${id}`)
        if (singleCategory.ok) {
            const categoryData = await singleCategory.json()
            setFormData({
                id: categoryData.data._id,
                categoryName: categoryData.data.name
            })
            setFormName('Edit')
            setBlock(false)
        } else {
            const errorInfo = await singleCategory.json()
            setAlertBlock({
                blockState: false,
                msg: errorInfo.message
            })
        }

    }

    async function fetchCategories() {
        const response = await fetch(`${process.env.REACT_APP_FETCH_URL}/category`)
        if (response.ok) {
            const categoryData = await response.json()
            setCategories(categoryData.data)
        } else {
            const errorInfo = await response.json()
            setAlertBlock({
                blockState: false,
                msg: errorInfo.message
            })
        }
    }

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
                fetchCategories()
                setBlock(true)
            } else {
                const errorInfo = await response.json()
                setAlertBlock({
                    blockState: false,
                    msg: errorInfo.message
                })
            }
        })
    }

    function handleDelete(id) {
        if (window.confirm('Are you sure to delete this record ? ')) {
            const requestOptions = {
                method: "DELETE",
                redirect: "follow"
            };

            fetch(`${process.env.REACT_APP_FETCH_URL}/category/${id}`, requestOptions)
                .then(async (response) => {
                    if (response.status === 200) {
                        fetchCategories()
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

    function handleOpenBlock() {
        if (block) {
            setBlock(false)
        } else {
            setBlock(true)
        }
    }

    useEffect(() => {
        fetchCategories()
    }, [])

    setTimeout(() => {
        setAlertBlock({
            blockState: true,
            msg: ''
        })
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
                    {/* Body content */}

                    <div>

                        <div className='d-flex justify-content-end p-2'>
                            <button
                                className='btn btn-primary'
                                onClick={handleOpenBlock}>Add Category</button>
                        </div>
                        <div hidden={block}>
                            <div className='d-flex justify-content-center'>
                                <div className='w-50 d-flex flex-column p-1'
                                    style={{ gap: '20px ' }}>
                                    <h4>{formName} Category</h4>
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
                                    <button
                                        className='btn btn-primary'
                                        onClick={handleSave}>Submit</button>
                                </div>
                            </div>
                        </div>
                        <div
                            className="alert alert-danger w-50"
                            hidden={alertBlock.blockState}>
                            ERROR : {alertBlock.msg}
                        </div>
                        <h3>Category List</h3>
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th scope="col">S.No</th>
                                    <th scope="col">name of the category</th>
                                    <th scope="col">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.length > 0 ?
                                    categories.map(category => {
                                        return (
                                            <tr>
                                                <th key={category._id}>{serialNo++}</th>
                                                <td>{category.name}</td>
                                                <td>
                                                    <Link
                                                        style={{ color: 'black' }}
                                                        onClick={() => editCategory(category._id)}>

                                                        <FaEdit />
                                                    </Link> ||
                                                    <Link
                                                        onClick={() => handleDelete(category._id)}
                                                        style={{ color: 'red' }}>
                                                        <MdDelete />
                                                    </Link>
                                                </td>
                                            </tr>
                                        )
                                    }) : <tr>
                                        <td
                                            colSpan={3}
                                            className='text-center text-secondary'>
                                            No Categories founded
                                        </td>
                                    </tr>}

                            </tbody>
                        </table>
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

export default CategoryList
