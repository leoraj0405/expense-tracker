import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaEdit } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import { useUser } from '../../components/Context';
import Header from '../../layouts/Header';
import Footer from '../../layouts/Footer';
import SideBar from '../../layouts/SideBar';

// Constants
const API_URLS = {
  GROUP_EXPENSES: '/groupexpense/onegroup/',
  DELETE_EXPENSE: '/groupexpense/'
};

// Custom hook for URL query parameters
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function GrpExpense() {
  // Hooks and routing
  const navigate = useNavigate();
  const location = useLocation();
  const query = useQuery();
  const { loginUser } = useUser();

  // Extract query parameters
  const groupId = query.get('grpid');
  const grpName = query.get('grpname');
  const groupLeader = query.get('leader');
  const pathnames = location.pathname.split('/').filter(Boolean);

  // State management
  const [alert, setAlert] = useState({ visible: false, message: '' });
  const [groupExpenses, setGroupExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Effects
  useEffect(() => {
    if (!loginUser) {
      navigate('/login');
    }
  }, [loginUser, navigate]);

  useEffect(() => {
    fetchGroupExpenses();
  }, []);

  // Data fetching functions
  const fetchGroupExpenses = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_FETCH_URL}${API_URLS.GROUP_EXPENSES}${groupId}`);
      
      if (!response.ok) {
        throw new Error(await response.json().then(data => data.message));
      }

      const responseData = await response.json();
      setGroupExpenses(responseData.data || []);
    } catch (error) {
      showAlert(error.message || 'Failed to fetch expenses');
    } finally {
      setIsLoading(false);
    }
  }, [groupId]);

  // Action handlers
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_FETCH_URL}${API_URLS.DELETE_EXPENSE}${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(await response.json().then(data => data.message));
      }

      showAlert('Expense deleted successfully');
      fetchGroupExpenses();
    } catch (error) {
      showAlert(error.message || 'Deletion failed');
    }
  };

  // Helper functions
  const showAlert = (message) => {
    setAlert({ visible: true, message });
    setTimeout(() => setAlert({ visible: false, message: '' }), 5000);
  };

  const getBreadcrumbItems = () => {
    return pathnames.map((item, index) => {
      const isLast = index === pathnames.length - 1;
      let to = `/${pathnames.slice(0, index + 1).join('/')}`;
      let label = '';

      switch (item) {
        case 'group':
          label = 'Group';
          break;
        case 'groupexpense':
          label = 'Group Expense';
          to += `?grpid=${groupId}&grpname=${grpName}&leader=${groupLeader}`;
          break;
        default:
          label = item;
      }

      return (
        <li className="breadcrumb-item" key={to}>
          {isLast ? (
            <span className="text-secondary" style={{ whiteSpace: 'nowrap' }}>{label}</span>
          ) : (
            <Link className="text-secondary" to={to}>{label}</Link>
          )}
        </li>
      );
    });
  };

  // Render functions
  const renderExpenseTable = () => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan="6" className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </td>
        </tr>
      );
    }

    if (groupExpenses.length === 0) {
      return (
        <tr>
          <td colSpan="6" className="text-center text-secondary">
            No Expenses Found
          </td>
        </tr>
      );
    }

    return groupExpenses.map((expense, index) => (
      <tr key={expense._id}>
        <td>{index + 1}</td>
        <td>{expense.user?.name || 'New user (profile not updated)'}</td>
        <td>{expense.description || '-'}</td>
        <td>₹ {expense.amount.toLocaleString()}</td>
        <td>{expense.category?.name || '-'}</td>
        <td>
          {groupLeader === loginUser?.data?._id && (
            <div className="d-flex">
              <Link
                to={`/group/groupexpense/editgroupexpense?grpexpid=${expense._id}&grpid=${groupId}&grpname=${grpName}&leader=${groupLeader}`}
                className="btn btn-sm btn-warning me-2"
                aria-label="Edit expense"
              >
                <FaEdit />
              </Link>
              <button
                onClick={() => handleDelete(expense._id)}
                className="btn btn-sm btn-danger"
                aria-label="Delete expense"
              >
                <MdDelete />
              </button>
            </div>
          )}
        </td>
      </tr>
    ));
  };

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
          <section className="main" style={{ minHeight: '400px' }}>
            <div className="d-flex justify-content-end m-4">
              <nav className="me-3">
                <ol className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link className="text-secondary" to="/home">Home</Link>
                  </li>
                  {getBreadcrumbItems()}
                </ol>
              </nav>
            </div>

            {alert.visible && (
              <div className={`alert alert-${alert.type || 'danger'} m-4`}>
                {alert.message}
              </div>
            )}

            <div className="d-flex justify-content-between align-items-center m-4">
              <h4 className="text-secondary mb-0">{grpName} Expenses</h4>
              <Link
                className="btn btn-primary"
                to={`/group/groupexpense/addgroupexpense?grpid=${groupId}&grpname=${grpName}&leader=${groupLeader}`}
              >
                Add Expense
              </Link>
            </div>

            <div className="table-responsive m-4">
              <table className="table table-bordered table-hover">
                <thead className="table-light">
                  <tr>
                    <th>S No</th>
                    <th>Paid By</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Category</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {renderExpenseTable()}
                </tbody>
              </table>
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

export default GrpExpense;