import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Header from '../layouts/Header';
import SideBar from '../layouts/SideBar';
import Footer from '../layouts/Footer';
import { useUser } from '../components/Context';

// Constants
const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#a4de6c"];
const API_URLS = {
  USER_HOME: '/user/home',
  USER_EXPENSES: '/expense/userexpense/'
};

function Dashboard() {
  // Hooks and context
  const navigate = useNavigate();
  const { loginUser, setLoginUser } = useUser();

  // State management
  const [expenseData, setExpenseData] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Derived values
  const currentYearMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

  // Data fetching functions
  const checkLoginStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_FETCH_URL}${API_URLS.USER_HOME}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Session expired. Please log in again.');
      }

      const userData = await response.json();
      setLoginUser(userData);
    } catch (err) {
      setError(err.message);
      setLoginUser(null);
      navigate('/login');
    } finally {
      setIsLoading(false);
    }
  }, [navigate, setLoginUser]);

  const fetchThisMonthExpenses = useCallback(async () => {
    if (!loginUser?.data?._id) return;

    setIsLoading(true);
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD

    try {
      const response = await fetch(
        `${process.env.REACT_APP_FETCH_URL}${API_URLS.USER_EXPENSES}${loginUser.data._id}?date=${formattedDate}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch expense data');
      }

      const expenseData = await response.json();
      const chartData = expenseData.data.userExpenseData.map(({ description, amount }) => ({
        name: description || 'Uncategorized',
        value: Number(amount)
      }));

      setExpenseData(chartData);
      setError(null);
    } catch (err) {
      setError(err.message);
      setExpenseData([]);
    } finally {
      setIsLoading(false);
    }
  }, [loginUser]);

  // Effects
  useEffect(() => {
    checkLoginStatus();
  }, [checkLoginStatus]);

  useEffect(() => {
    if (loginUser) {
      fetchThisMonthExpenses();
    }
  }, [loginUser, fetchThisMonthExpenses]);

  useEffect(() => {
    const total = expenseData.reduce((sum, item) => sum + item.value, 0);
    setTotalAmount(total);
  }, [expenseData]);

  // Render functions
  const renderPieChart = () => {
    if (error) return <div className="alert alert-danger">{error}</div>;
    if (expenseData.length === 0) return <div className="alert alert-info">No expense data available</div>;

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={expenseData}
            cx="50%"
            cy="50%"
            outerRadius={90}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {expenseData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`₹${value}`, 'Amount']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  const renderTotalExpensesCard = () => (
    <div className="card boxshadow p-3 mb-5 bg-white rounded text-center h-100">
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">Month Total Expenses</h5>
        <p className="card-text display-6 my-3">₹ {totalAmount.toLocaleString()}</p>
        <div className="mt-auto">
          <Link 
            to={`/thismonthexpense?date=${currentYearMonth}`} 
            className="btn btn-primary"
          >
            See This Month's Expenses
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="d-flex">
      <aside>
        <SideBar />
      </aside>

      <div className="flex-grow-1">
        <header>
          <Header />
        </header>

        <main className="p-3 bg-light">
          <section className="main" style={{ minHeight: '80vh' }}>
            <div className="container mt-3">
              <div className="mb-4">
                <h1 className="ms-2">Welcome {loginUser?.data?.name || 'Buddy'}!</h1>
                <p className="ms-2 text-muted">Track your spending. Control your future.</p>
              </div>

              <div className="row g-4">
                <div className="col-md-6">
                  {renderTotalExpensesCard()}
                </div>

                <div className="col-md-6">
                  <div className="card boxshadow p-3 bg-white rounded h-100">
                    <div className="card-body">
                      <h5 className="card-title text-center mb-4">This Month Expenses Chart</h5>
                      {renderPieChart()}
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
    </div>
  );
}

export default Dashboard;