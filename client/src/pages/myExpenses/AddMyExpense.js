import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Header from '../../layouts/Header';
import Footer from '../../layouts/Footer';
import SideBar from '../../layouts/SideBar';
import { useUser } from '../../components/Context';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function AddMyExpense() {
    const { loginUser } = useUser();
    const navigate = useNavigate();
    const query = useQuery();
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter(Boolean);

    const expenseId = query.get('expense');

    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        id: '',
        category: '',
        date: '',
        amount: 0,
        description: '',
    });
    const [alert, setAlert] = useState({ visible: false, msg: '' });

    const today = new Date().toISOString().split('T')[0];

    // Redirect if user is not logged in
    useEffect(() => {
        if (!loginUser) navigate('/login');
    }, [loginUser]);

    // Fetch categories on mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch(`${process.env.REACT_APP_FETCH_URL}/category`);
                const data = await res.json();
                if (res.ok) {
                    setCategories(data.data?.categoryData || []);
                } else {
                    throw new Error(data.message);
                }
            } catch (err) {
                showAlert(err.message);
            }
        };
        fetchCategories();
    }, []);

    // Fetch expense if editing
    useEffect(() => {
        if (!expenseId) return;

        const fetchExpense = async () => {
            try {
                const res = await fetch(`${process.env.REACT_APP_FETCH_URL}/expense/${expenseId}`);
                const data = await res.json();
                if (!res.ok) throw new Error(data.message);

                const expense = data.data[0];
                setFormData({
                    id: expense._id,
                    category: expense.category._id,
                    date: expense.date.split("T")[0],
                    amount: expense.amount,
                    description: expense.description,
                });
            } catch (err) {
                showAlert(err.message);
            }
        };

        fetchExpense();
    }, [expenseId]);

    // Auto-dismiss alert
    useEffect(() => {
        if (!alert.visible) return;
        const timer = setTimeout(() => setAlert({ visible: false, msg: '' }), 5000);
        return () => clearTimeout(timer);
    }, [alert]);

    const showAlert = (msg) => setAlert({ visible: true, msg });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        const { id, category, amount, date, description } = formData;

        if(Number(amount) <= 0){
            return showAlert('Enter valid amount')
        }
        const payload = {
            description,
            amount: Number(amount),
            userId: loginUser?.data?._id,
            categoryId: category,
            date,
        };

        try {
            const res = await fetch(
                `${process.env.REACT_APP_FETCH_URL}/expense${id ? `/${id}` : ''}`,
                {
                    method: id ? 'PUT' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                }
            );
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            navigate('/expense');
        } catch (err) {
            showAlert(err.message);
        }
    };

    return (
        <div className="d-flex">
            <aside ><SideBar /></aside>
            <div className="flex-grow-1">
                <header><Header /></header>
                <main className="p-3 bg-light">
                    <section className="main" style={{ minHeight: '400px' }}>
                        <div className="d-flex justify-content-end m-3 w-100">
                            <nav className="me-4">
                                <ol className="breadcrumb">
                                    <li className="breadcrumb-item">
                                        <Link className="text-secondary" to="/home">Home</Link>
                                    </li>
                                    {pathnames.map((item, idx) => {
                                        const labelMap = {
                                            addexpense: 'Add Expense',
                                            editexpense: 'Edit Expense',
                                            expense: 'Expense',
                                        };
                                        const label = labelMap[item] || item;
                                        const path = `/${pathnames.slice(0, idx + 1).join('/')}`;
                                        const isLast = idx === pathnames.length - 1;
                                        return (
                                            <li key={idx} className="breadcrumb-item">
                                                {isLast
                                                    ? <span className="text-secondary" style={{ whiteSpace: 'nowrap' }}>{label}</span>
                                                    : <Link className="text-secondary" to={path}>{label}</Link>}
                                            </li>
                                        );
                                    })}
                                </ol>
                            </nav>
                        </div>

                        {alert.visible && (
                            <div className="m-4 alert alert-danger">{alert.msg}</div>
                        )}

                        <div className="m-4 p-4 rounded" style={{ backgroundColor: '#f1f1f1' }}>
                            <div className="column">
                                <div className="col-md-4 mb-3">
                                    <label htmlFor="category">Category</label>
                                    <select
                                        name="category"
                                        className="form-select"
                                        value={formData.category}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Choose category</option>
                                        {categories.map((cat) => (
                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-4 mb-3">
                                    <label htmlFor="amount">Amount</label>
                                    <input
                                        type="number"
                                        name="amount"
                                        className="form-control"
                                        min="0"
                                        value={formData.amount}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="col-md-4 mb-3">
                                    <label htmlFor="date">Date</label>
                                    <input
                                        type="date"
                                        name="date"
                                        className="form-control"
                                        max={today}
                                        value={formData.date}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <input type="hidden" name="id" value={formData.id} />
                            </div>

                            <div className="form-row">
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="description">Description</label>
                                    <textarea
                                        name="description"
                                        className="form-control"
                                        value={formData.description}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="d-flex justify-content-end">
                                <Link className="btn btn-warning me-4" to="/expense">Cancel</Link>
                                <button className="btn btn-primary" onClick={handleSave}>
                                    Submit
                                </button>
                            </div>
                        </div>
                    </section>
                    <footer><Footer /></footer>
                </main>
            </div>
        </div>
    );
}

export default AddMyExpense;
