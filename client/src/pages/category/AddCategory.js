import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams, useLocation } from 'react-router-dom';
import Header from '../../layouts/Header';
import Footer from '../../layouts/Footer';
import SideBar from '../../layouts/SideBar';
import { useUser } from '../../components/Context';

function AddCategory() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { loginUser } = useUser();

    const [formData, setFormData] = useState({ categoryName: '' });
    const [alertBlock, setAlertBlock] = useState({ blockState: true, msg: '' });

    // Redirect if not logged in
    useEffect(() => {
        if (!loginUser) navigate('/login');
    }, [loginUser, navigate]);

    // Fetch category data if editing
    useEffect(() => {
        if (id) fetchCategory(id);
    }, [id]);

    const fetchCategory = async (categoryId) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_FETCH_URL}/category/${categoryId}`);
            const data = await response.json();
            if (response.ok) {
                setFormData({ categoryName: data.data.name });
            } else {
                setAlertBlock({ blockState: false, msg: data.message });
            }
        } catch (error) {
            setAlertBlock({ blockState: false, msg: "Error fetching category." });
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        const url = `${process.env.REACT_APP_FETCH_URL}/category${id ? `/${id}` : ''}`;
        const method = id ? 'PUT' : 'POST';
        const body = JSON.stringify({ name: formData.categoryName });

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body
            });

            if (response.ok) {
                navigate('/category');
            } else {
                const errorInfo = await response.json();
                setAlertBlock({ blockState: false, msg: errorInfo.message });
            }
        } catch (error) {
            setAlertBlock({ blockState: false, msg: "Something went wrong." });
        }
    };

    const renderBreadcrumb = () => {
        const pathnames = location.pathname.split('/').filter(Boolean);

        const labelMap = {
            category: 'Category',
            addcategory: 'Add Category',
            editcategory: 'Edit Category'
        };

        return (
            <ol className="breadcrumb">
                <li className="breadcrumb-item"><Link to="/home" className="text-secondary">Home</Link></li>
                {pathnames.map((segment, index) => {
                    const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                    const label = labelMap[segment] || '';

                    return (
                        <li key={index} className="breadcrumb-item">
                            {index === pathnames.length - 1 ? (
                                <span className="text-secondary">{label}</span>
                            ) : (
                                <Link to={to} className="text-secondary">{label}</Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        );
    };

    return (
        <div className="d-flex">
            <aside><SideBar /></aside>
            <div className="flex-grow-1">
                <Header />
                <main className="p-3 bg-light">
                    <section className="main" style={{ minHeight: '400px' }}>
                        <div className="d-flex justify-content-end m-4">
                            <nav className="me-3">{renderBreadcrumb()}</nav>
                        </div>

                        {!alertBlock.blockState && (
                            <div className="alert alert-danger w-75 mx-auto">
                                {alertBlock.msg}
                            </div>
                        )}

                        <div className="d-flex justify-content-center">
                            <div className="w-75 d-flex flex-column p-1" style={{ gap: '20px' }}>
                                <label htmlFor="categoryName">Category Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="categoryName"
                                    value={formData.categoryName}
                                    onChange={handleChange}
                                    placeholder="Enter category name"
                                />

                                <div className="d-flex justify-content-end">
                                    <Link to="/category" className="btn btn-warning m-2">Cancel</Link>
                                    <button className="btn btn-primary m-2" onClick={handleSave}>Submit</button>
                                </div>
                            </div>
                        </div>
                    </section>
                    <Footer />
                </main>
            </div>
        </div>
    );
}

export default AddCategory;
