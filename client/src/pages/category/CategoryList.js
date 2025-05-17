import React, { useEffect, useState } from 'react'
import Header from '../../layouts/Header'
import Footer from '../../layouts/Footer'
import SideBar from '../../layouts/SideBar'
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../../components/Context';

function CategoryList() {
    const { loginUser } = useUser()
    const navigate = useNavigate()
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);
    const [categories, setCategories] = useState([])
    const [block, setBlock] = useState(true)
    const [formData, setFormData] = useState({ id: '', categoryName: '' })
    const [alertBlock, setAlertBlock] = useState({
        blockState: true,
        msg: ''
    })
    const [formName, setFormName] = useState('Add')
    let serialNo = 1
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (!loginUser) {
            navigate('/login')
        }
    }, [loginUser])

    function goToPage(page) {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    }


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
        const response = await fetch(`${process.env.REACT_APP_FETCH_URL}/category?page=${currentPage}`)
        if (response.status === 200) {
            const categoryData = await response.json()
            setCategories(categoryData.data)
            const total = Math.ceil(categoryData.data.total / categoryData.data.limit);
            setTotalPages(total);
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
    }, [currentPage])

    setTimeout(() => {
        setAlertBlock({
            blockState: true,
            msg: ''
        })
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
                                    const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                                    return (
                                        <li className="breadcrumb-item"><Link className='text-secondary' to={to}>{item}</Link></li>
                                    )
                                })}
                            </ol>
                        </nav>
                        <div className='m-4'>
                            <div className='d-flex justify-content-between p-2'>
                                <h3>Category List</h3>
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
                            <div className="table-responsive">
                                <table className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th scope="col">S.No</th>
                                            <th scope="col">name of the category</th>
                                            <th scope="col">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {categories.categoryData?.length > 0 ?
                                            categories.categoryData?.map(category => {
                                                return (
                                                    <tr>
                                                        <td key={category._id}>{serialNo++}</td>
                                                        <td>{category.name}</td>
                                                        <td>
                                                            <button
                                                                className='btn btn-sm btn-warning me-2'
                                                                onClick={() => editCategory(category._id)}>
                                                                <FaEdit />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(category._id)}
                                                                className='btn btn-sm btn-danger'>
                                                                <MdDelete />
                                                            </button>
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
                                {categories.categoryData?.length > 0 ?
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
                    </section>
                    <footer>
                        <Footer />
                    </footer>
                </main>
            </div>
        </>
    )
}

export default CategoryList
