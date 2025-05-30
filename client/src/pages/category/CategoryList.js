import React, { useEffect, useState, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaEdit } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import Header from '../../layouts/Header';
import Footer from '../../layouts/Footer';
import SideBar from '../../layouts/SideBar';
import { useUser } from '../../components/Context';

function CategoryList() {
    // Navigation and state
    const navigate = useNavigate();
    const location = useLocation();
    const { loginUser } = useUser();
    const pathnames = location.pathname.split('/').filter(Boolean);

    // Data state
    const [categories, setCategories] = useState({
        categoryData: [],
        total: 0,
        limit: 10
    });
    const [alert, setAlert] = useState({
        show: false,
        message: '',
        type: 'danger'
    });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1
    });
    const [isLoading, setIsLoading] = useState(true);

    // Authentication check
    useEffect(() => {
        if (!loginUser) {
            navigate('/login');
        }
    }, [loginUser, navigate]);

    // Auto-hide alert after timeout
    useEffect(() => {
        if (alert.show) {
            const timer = setTimeout(() => {
                setAlert(prev => ({ ...prev, show: false }));
            }, 10000);
            return () => clearTimeout(timer);
        }
    }, [alert.show]);

    // Fetch categories with error handling
    const fetchCategories = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(
                `${process.env.REACT_APP_FETCH_URL}/category?page=${pagination.currentPage}`
            );

            if (!response.ok) {
                throw new Error(await response.text());
            }

            const { data } = await response.json();
            setCategories(data);

            const totalPages = Math.ceil(data.total / data.limit);
            setPagination(prev => ({ ...prev, totalPages }));
        } catch (error) {
            setAlert({
                show: true,
                message: error.message || 'Failed to fetch categories',
                type: 'danger'
            });
        } finally {
            setIsLoading(false);
        }
    }, [pagination.currentPage]);

    // Render functions
    const renderCategoryTable = () => {
        if (isLoading) {
            return (
                <tr>
                    <td colSpan="3" className="text-center">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </td>
                </tr>
            );
        }

        if (categories.length === 0) {
            return (
                <tr>
                    <td colSpan={3} className="text-center text-secondary">
                        No categories found
                    </td>
                </tr>
            );
        }

        return categories.categoryData.map((category, index) => (
            <tr key={category._id}>
                <td>{index + 1}</td>
                <td>{category.name}</td>
                <td>
                    <div className="d-flex gap-2">
                        <Link
                            to={`editcategory/${category._id}`}
                            className="btn btn-sm btn-warning"
                            title="Edit"
                        >
                            <FaEdit />
                        </Link>
                        <button
                            onClick={() => handleDelete(category._id)}
                            className="btn btn-sm btn-danger"
                            title="Delete"
                        >
                            <MdDelete />
                        </button>
                    </div>
                </td>
            </tr>
        ))
    };

    // Handle category deletion
    const handleDelete = useCallback(async (id) => {
        if (!window.confirm('Are you sure you want to delete this category?')) {
            return;
        }

        try {
            const response = await fetch(
                `${process.env.REACT_APP_FETCH_URL}/category/${id}`,
                { method: 'DELETE' }
            );

            if (!response.ok) {
                throw new Error(await response.text());
            }

            setAlert({
                show: true,
                message: 'Category deleted successfully',
                type: 'success'
            });
            fetchCategories();
        } catch (error) {
            setAlert({
                show: true,
                message: error.message || 'Failed to delete category',
                type: 'danger'
            });
        }
    }, [fetchCategories]);

    // Pagination control
    const goToPage = useCallback((page) => {
        if (page < 1 || page > pagination.totalPages) return;
        setPagination(prev => ({ ...prev, currentPage: page }));
    }, [pagination.totalPages]);

    // Fetch categories when page changes
    useEffect(() => {
        fetchCategories();
    }, [fetchCategories, pagination.currentPage]);

    // Breadcrumb component
    const Breadcrumbs = () => (
        <nav className="me-3">
            <ol className="breadcrumb">
                <li className="breadcrumb-item">
                    <Link className="text-secondary" to="/home">Home</Link>
                </li>
                {pathnames.map((item, index) => {
                    const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                    const label = item === 'category' ? 'Category' : item;
                    const isLast = index === pathnames.length - 1;

                    return (
                        <li key={to} className="breadcrumb-item">
                            {isLast ? (
                                <span className="text-secondary" style={{ whiteSpace: 'nowrap' }}>
                                    {label}
                                </span>
                            ) : (
                                <Link className="text-secondary" to={to}>
                                    {label}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );

    // Pagination component
    const PaginationControls = () => (
        <div className="card">
            <div className="card-body d-flex justify-content-center">
                <nav>
                    <ul className="pagination">
                        <li className={`page-item ${pagination.currentPage === 1 ? 'disabled' : ''}`}>
                            <button
                                className="page-link"
                                onClick={() => goToPage(pagination.currentPage - 1)}
                                disabled={pagination.currentPage === 1}
                            >
                                Previous
                            </button>
                        </li>
                        {Array.from({ length: pagination.totalPages }).map((_, i) => (
                            <li className="page-item" key={i}>
                                <button
                                    className={`page-link ${pagination.currentPage === i + 1 ? 'active' : ''}`}
                                    onClick={() => goToPage(i + 1)}
                                >
                                    {i + 1}
                                </button>
                            </li>
                        ))}
                        <li className={`page-item ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}`}>
                            <button
                                className="page-link"
                                onClick={() => goToPage(pagination.currentPage + 1)}
                                disabled={pagination.currentPage === pagination.totalPages}
                            >
                                Next
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    );

    return (
        <div className="d-flex category-list-container">
            <aside className='vh-100'>
                <SideBar />
            </aside>

            <div className="flex-grow-1">
                <header>
                    <Header />
                </header>

                <main className="p-3 bg-light">
                    <section className="main" style={{ minHeight: '400px' }}>
                        <div className="d-flex justify-content-end m-4">
                            <Breadcrumbs />
                        </div>

                        <div className="me-4 ms-4">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h2>Categories</h2>
                                <Link
                                    className="btn btn-primary"
                                    to="addcategory"
                                >
                                    Add Category
                                </Link>
                            </div>

                            {alert.show && (
                                <div className={`alert alert-${alert.type} w-50`}>
                                    {alert.message}
                                </div>
                            )}

                            <div className="table-responsive mt-4">
                                <table className="table table-bordered table-hover">
                                    <thead className="table-light">
                                        <tr>
                                            <th scope="col">#</th>
                                            <th scope="col">Category Name</th>
                                            <th scope="col">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {renderCategoryTable()}
                                    </tbody>
                                </table>

                                {categories.categoryData?.length > 0 && <PaginationControls />}
                            </div>
                        </div>
                    </section>

                    <footer>
                        <Footer />
                    </footer>
                </main>
            </div>
        </div>
    );
}

export default CategoryList;