import React, { useEffect, useState, useCallback } from 'react';
import Header from '../../layouts/Header';
import Footer from '../../layouts/Footer';
import SideBar from '../../layouts/SideBar';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { useUser } from '../../components/Context';

function ListMyExpense() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const pathnames = location.pathname.split('/').filter(Boolean);
  const queryDate = queryParams.get('date');

  const { loginUser } = useUser();

  const [expenses, setExpenses] = useState({ userExpenseData: [], total: 0, limit: 10 });
  const [alert, setAlert] = useState({ success: true, error: false, msg: '' });
  const [date, setDate] = useState(queryDate || '');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Redirect to login if not logged in
  useEffect(() => {
    if (!loginUser) navigate('/login');
  }, [loginUser, navigate]);

  // Update date if query param changes
  useEffect(() => {
    if (queryDate) setDate(queryDate);
  }, [queryDate]);

  const fetchExpenses = useCallback(async () => {
    if (!loginUser?.data?._id) return;

    const query = new URLSearchParams({ page: currentPage.toString() });
    if (date) query.append('date', date);

    try {
      const response = await fetch(`${process.env.REACT_APP_FETCH_URL}/expense/userexpense/${loginUser.data._id}?${query.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch expenses');
      }
      const expenseData = await response.json();
      setExpenses(expenseData.data);
      setTotalPages(Math.ceil(expenseData.data.total / expenseData.data.limit));
    } catch (error) {
      setAlert({ success: false, error: true, msg: error.message });
      setExpenses({ userExpenseData: [], total: 0, limit: 10 });
      setTotalPages(1);
    }
  }, [loginUser, date, currentPage]);

  // Fetch expenses on date or page change
  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // Clear alert after 5 seconds
  useEffect(() => {
    if (!alert.msg) return;
    const timer = setTimeout(() => setAlert({ success: true, error: false, msg: '' }), 5000);
    return () => clearTimeout(timer);
  }, [alert]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_FETCH_URL}/expense/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete expense');
      }
      fetchExpenses(); // Refresh list after delete
    } catch (error) {
      setAlert({ success: false, error: true, msg: error.message });
    }
  };

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <div className="d-flex">
      <aside><SideBar /></aside>

      <div className="flex-grow-1">
        <header><Header /></header>
        <main className="p-3 bg-light" style={{ minHeight: 400 }}>
          <section className="container">
            <div className="d-flex justify-content-end align-items-center mb-3">
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item"><Link className="text-secondary" to="/home">Home</Link></li>
                  {pathnames.map((item, i) => {
                    const label = ['thismonthexpense', 'expense'].includes(item) ? 'Expense' : item;
                    const to = `/${pathnames.slice(0, i + 1).join('/')}`;
                    const isLast = i === pathnames.length - 1;
                    return (
                      <li key={to} className="breadcrumb-item">
                        {isLast ? (
                          <span className="text-secondary" style={{ whiteSpace: 'nowrap' }}>{label}</span>
                        ) : (
                          <Link className="text-secondary" to={to}>{label}</Link>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </nav>
            </div>

            {alert.msg && (
              <div className={`alert ${alert.error ? 'alert-danger' : 'alert-success'}`} role="alert">
                {alert.msg}
              </div>
            )}

            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <label htmlFor="filter-month" className="form-label me-2">Filter by month:</label>
                <input
                  type="month"
                  id="filter-month"
                  name="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="form-control d-inline-block"
                  style={{ width: '200px' }}
                />
              </div>
              <Link className="btn btn-primary" to="/expense/addexpense">Add New Expense</Link>
            </div>

            <div className="table-responsive">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>S No</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.userExpenseData.length > 0 ? (
                    expenses.userExpenseData.map((item, idx) => (
                      <tr key={item._id}>
                        <td>{(currentPage - 1) * expenses.limit + idx + 1}</td>
                        <td>{item.description}</td>
                        <td>{item.category?.[0]?.name || '-'}</td>
                        <td>{item.date?.split('T')[0]}</td>
                        <td>{item.amount}</td>
                        <td>
                          <Link
                            to={`/editexpense?mode=edit&expense=${item._id}`}
                            className="btn btn-sm btn-warning me-2"
                            title="Edit"
                          >
                            <FaEdit />
                          </Link>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="btn btn-sm btn-danger"
                            title="Delete"
                          >
                            <MdDelete />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center text-secondary">No Expenses Found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {expenses.userExpenseData.length > 0 && (
              <nav className="d-flex justify-content-center mt-3" aria-label="Page navigation">
                <ul className="pagination mb-0">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => goToPage(currentPage - 1)}>Previous</button>
                  </li>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                      <button className="page-link" onClick={() => goToPage(i + 1)}>{i + 1}</button>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => goToPage(currentPage + 1)}>Next</button>
                  </li>
                </ul>
              </nav>
            )}
          </section>
        </main>

        <footer><Footer /></footer>
      </div>
    </div>
  );
}

export default ListMyExpense;
