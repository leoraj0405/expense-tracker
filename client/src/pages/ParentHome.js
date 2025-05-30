import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Footer from '../layouts/Footer';
import Logo from '../assets/img/websiteLogo.png';
import defaultImage from '../assets/img/profile.png';
import '../style/style.css'

// Initialize bootstrap globally
window.bootstrap = bootstrap;

// Constants
const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#a4de6c"];
const TIME_OPTIONS = {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
};

function ParentHome() {
    const navigate = useNavigate();

    // State
    const [state, setState] = useState({
        user: '',
        children: [],
        childExpense: [],
        currentPage: 1,
        totalPages: 1,
        amount: 0,
        chartData: [],
        date: '',
        isLoading: false,
        error: null,
        hasSelectedChild: false
    });

    // Destructure state for easier access
    const {
        user,
        children,
        childExpense,
        currentPage,
        totalPages,
        amount,
        chartData,
        date,
        isLoading,
        error,
        hasSelectedChild
    } = state;

    // Check if parent is logged in
    const checkParentAuth = useCallback(async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_FETCH_URL}/user/parenthome`, {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                const usersData = await response.json();
                setState(prev => ({ 
                    ...prev, 
                    children: usersData.data
                }));
            } else {
                navigate('/parentlogin');
            }
        } catch (err) {
            setState(prev => ({ ...prev, error: 'Failed to fetch children data' }));
        }
    }, [navigate]);

    // Initialize auth check
    useEffect(() => {
        checkParentAuth();
    }, [checkParentAuth]);

    // Handle date change
    const handleDateChange = (e) => {
        setState(prev => ({ ...prev, date: e.target.value }));
    };

    // Handle user selection change
    const handleUserChange = (e) => {
        setState(prev => ({ 
            ...prev, 
            user: e.target.value,
            hasSelectedChild: true,
            currentPage: 1 // Reset to first page when changing child
        }));
    };

    // Pagination handler
    const goToPage = useCallback((page) => {
        if (page < 1 || page > totalPages) return;
        setState(prev => ({ ...prev, currentPage: page }));
    }, [totalPages]);

    // Fetch child expenses
    const fetchChildExpenses = useCallback(async () => {
        if (!user) return;

        try {
            setState(prev => ({ ...prev, isLoading: true, error: null }));

            let formattedDate = date;
            if (!formattedDate) {
                const today = new Date();
                formattedDate = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
            }

            const response = await fetch(
                `${process.env.REACT_APP_FETCH_URL}/expense/userexpense/${user}?page=${currentPage}&date=${formattedDate}`
            );

            if (response.ok) {
                const responseData = await response.json();
                const newTotalPages = Math.ceil(responseData.data.total / responseData.data.limit);

                const newChartData = responseData.data.userExpenseData.map(item => ({
                    name: item.description,
                    value: item.amount
                }));

                const totalAmount = newChartData.reduce((sum, item) => sum + Number(item.value), 0);

                setState(prev => ({
                    ...prev,
                    childExpense: responseData.data.userExpenseData,
                    totalPages: newTotalPages,
                    chartData: newChartData,
                    amount: totalAmount,
                    isLoading: false
                }));
            } else {
                throw new Error('Failed to fetch expenses');
            }
        } catch (err) {
            setState(prev => ({
                ...prev,
                error: err.message,
                isLoading: false
            }));
        }
    }, [user, currentPage, date]);

    // Fetch expenses when dependencies change
    useEffect(() => {
        fetchChildExpenses();
    }, [fetchChildExpenses]);

    const today = new Date();
    const maxMonth = today.toISOString().slice(0, 7); // 'YYYY-MM'

    return (
        <div className="d-flex flex-column min-vh-100">
            {/* Header */}
            <header className="sticky-top">
                <nav className="navbar navbar-expand-lg navbar-light bg-primary p-3">
                    <Link to="#" className="navbar-brand d-flex align-items-center">
                        <img src={Logo} alt="Logo" width="30" height="30" className="d-inline-block align-top me-2" />
                        <span className="text-white">Expense Tracker</span>
                    </Link>

                    <div className="ms-auto d-flex align-items-center">
                        <span className="me-3 text-white">Welcome Parent</span>
                        <div className="dropdown">
                            <Link
                                className="dropdown-toggle d-flex align-items-center"
                                role="button"
                                id="userDropdown"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                <img
                                    src={defaultImage}
                                    alt="User Profile"
                                    className="rounded-circle"
                                    style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                />
                            </Link>
                            <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                                <li><Link className="dropdown-item" to="/parentlogin">Logout</Link></li>
                            </ul>
                        </div>
                    </div>
                </nav>
            </header>

            {/* Main Content */}
            <main className="flex-grow-1 p-3 bg-light">
                {/* Error Alert */}
                {error && (
                    <div className="alert alert-danger alert-dismissible fade show" role="alert">
                        {error}
                        <button
                            type="button"
                            className="btn-close"
                            onClick={() => setState(prev => ({ ...prev, error: null }))}
                        />
                    </div>
                )}

                {/* Child Selector Section */}
                <section className="container mb-4">
                    <div className="row">
                        <div className="col-md-6">
                            <div className="card shadow-sm">
                                <div className="card-body">
                                    <h2 className="h5 card-title">Select Child</h2>
                                    <div className="mb-3">
                                        <select
                                            className="form-select"
                                            value={user}
                                            onChange={handleUserChange}
                                            disabled={isLoading}
                                        >
                                            <option value="">-- Select a child --</option>
                                            {children.map((child) => (
                                                <option key={child._id} value={child._id}>
                                                    {child.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Dashboard Content (only shown after child selection) */}
                {hasSelectedChild && user && (
                    <>
                        {/* Charts Section */}
                        <section className="container mt-4">
                            <div className="row g-4">
                                <div className="col-lg-6">
                                    <div className="card shadow-sm h-100">
                                        <div className="card-body text-center">
                                            <h2 className="h5 card-title">Expenses Breakdown</h2>
                                            <div className="d-flex justify-content-center">
                                                <PieChart width={300} height={300}>
                                                    <Pie
                                                        data={chartData}
                                                        cx="50%"
                                                        cy="50%"
                                                        outerRadius={90}
                                                        fill="#8884d8"
                                                        dataKey="value"
                                                        label
                                                    >
                                                        {chartData.map((_, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip formatter={(value) => [`₹${value}`, 'Amount']} />
                                                    <Legend />
                                                </PieChart>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-lg-6">
                                    <div className="card shadow-sm h-100">
                                        <div className="card-body text-center">
                                            <h2 className="h5 card-title">Total Expenses</h2>
                                            <p className="display-6">₹{amount.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Date Filter */}
                        <section className="container mt-4">
                            <div className="row">
                                <div className="col-md-4">
                                    <label htmlFor="monthFilter" className="form-label">Filter by month:</label>
                                    <input
                                        type="month"
                                        id="monthFilter"
                                        onChange={handleDateChange}
                                        name="date"
                                        value={date}
                                        className="form-control"
                                        disabled={isLoading}
                                        max={maxMonth}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Expenses Table */}
                        <section className="container mt-4">
                            <div className="card shadow-sm">
                                <div className="card-body">
                                    <h2 className="h4 card-title">Expenses</h2>
                                    <div className="table-responsive">
                                        <table className="table table-bordered table-hover mt-3">
                                            <thead className="table-light">
                                                <tr>
                                                    <th scope="col">#</th>
                                                    <th scope="col">Description</th>
                                                    <th scope="col">Category</th>
                                                    <th scope="col">Amount</th>
                                                    <th scope="col">Date & Time</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {childExpense.length > 0 ? (
                                                    childExpense.map((item, index) => (
                                                        <tr key={item._id}>
                                                            <td>{(currentPage - 1) * 10 + index + 1}</td>
                                                            <td>{item.description}</td>
                                                            <td>{item.category[0]?.name}</td>
                                                            <td>₹ {item.amount}</td>
                                                            <td>{new Date(item.createdAt).toLocaleString('en-IN', TIME_OPTIONS)}</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={5} className="text-center text-muted py-4">
                                                            {isLoading ? 'Loading expenses...' : 'No expenses found'}
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination */}
                                    {childExpense.length > 0 && (
                                        <nav aria-label="Expenses pagination">
                                            <ul className="pagination justify-content-center">
                                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                    <button
                                                        className="page-link"
                                                        onClick={() => goToPage(currentPage - 1)}
                                                        disabled={currentPage === 1 || isLoading}
                                                    >
                                                        Previous
                                                    </button>
                                                </li>

                                                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                                                    let pageNum;
                                                    if (totalPages <= 5) {
                                                        pageNum = i + 1;
                                                    } else if (currentPage <= 3) {
                                                        pageNum = i + 1;
                                                    } else if (currentPage >= totalPages - 2) {
                                                        pageNum = totalPages - 4 + i;
                                                    } else {
                                                        pageNum = currentPage - 2 + i;
                                                    }

                                                    return (
                                                        <li key={pageNum} className="page-item">
                                                            <button
                                                                className={`page-link ${currentPage === pageNum ? 'active' : ''}`}
                                                                onClick={() => goToPage(pageNum)}
                                                                disabled={isLoading}
                                                            >
                                                                {pageNum}
                                                            </button>
                                                        </li>
                                                    );
                                                })}

                                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                                    <button
                                                        className="page-link"
                                                        onClick={() => goToPage(currentPage + 1)}
                                                        disabled={currentPage === totalPages || isLoading}
                                                    >
                                                        Next
                                                    </button>
                                                </li>
                                            </ul>
                                        </nav>
                                    )}
                                </div>
                            </div>
                        </section>
                    </>
                )}

                {/* Empty State (when no children available) */}
                {children.length === 0 && !isLoading && (
                    <div className="container mt-5">
                        <div className="row justify-content-center">
                            <div className="col-md-6 text-center">
                                <div className="card shadow-sm">
                                    <div className="card-body">
                                        <h3 className="card-title">No Children Found</h3>
                                        <p className="card-text">You don't have any children registered yet.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer>
                <Footer />
            </footer>
        </div>
    );
}

export default ParentHome;