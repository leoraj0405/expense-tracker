import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../components/Context';
import Header from '../../layouts/Header';
import SideBar from '../../layouts/SideBar';
import Footer from '../../layouts/Footer';
import '../../style/style.css';

// Constants
const API_URLS = {
  GROUP_MEMBERS: '/groupmember/onegroup/',
  GROUP_EXPENSE: '/groupexpense/',
  CATEGORIES: '/category'
};

// Custom hook for URL query parameters
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function AddGrpExpense() {
  // Hooks and state initialization
  const { loginUser } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const query = useQuery();

  // Extract query parameters
  const grpExpenseId = query.get('grpexpid');
  const grpId = query.get('grpid');
  const grpName = query.get('grpname');
  const groupLeader = query.get('leader');

  // State management
  const [form, setForm] = useState({
    id: '',
    groupId: grpId,
    userId: '',
    description: '',
    amount: '',
    categoryId: ''
  });

  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [members, setMembers] = useState({});
  const [splitMethod, setSplitMethod] = useState('');
  const [unequalShares, setUnequalShares] = useState([]);
  const [isSplitFormOpen, setIsSplitFormOpen] = useState(false);
  const [alert, setAlert] = useState({
    show: true,
    message: ''
  });

  const splitFormRef = useRef(null);
  const pathnames = location.pathname.split('/').filter(Boolean);
  const showSplitOptions = form.amount !== '';
  const [isOpen, setIsOpen] = useState(false);

  const toggleForm = () => {
    setIsOpen(true);
  };

  // Effects
  useEffect(() => {
    if (!loginUser) {
      navigate('/login');
    }
  }, [loginUser, navigate]);

  useEffect(() => {
    fetchGroupMembers();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (grpExpenseId) {
      fetchExpenseDetails(grpExpenseId);
    }
  }, [grpExpenseId]);

  useEffect(() => {
    if (alert.show === false) {
      const timer = setTimeout(() => {
        setAlert(prev => ({ ...prev, show: true }));
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [alert.show]);

  useEffect(() => {
    if (splitFormRef.current) {
      splitFormRef.current.style.maxHeight = isSplitFormOpen
        ? `${splitFormRef.current.scrollHeight}px`
        : '0px';
    }
  }, [isSplitFormOpen]);

  // Data fetching functions
  async function fetchGroupMembers() {
    try {
      const response = await fetch(`${process.env.REACT_APP_FETCH_URL}${API_URLS.GROUP_MEMBERS}${grpId}`);

      if (!response.ok) {
        throw new Error(await response.json().then(data => data.message));
      }

      const responseData = await response.json();
      setUsers(responseData.data);

      const membersMap = responseData.data.reduce((acc, member) => {
        acc[member.user._id] = member.user.name;
        return acc;
      }, {});

      setMembers(membersMap);
    } catch (error) {
      setAlert({ show: false, message: error.message });
    }
  }

  async function fetchCategories() {
    try {
      const response = await fetch(`${process.env.REACT_APP_FETCH_URL}${API_URLS.CATEGORIES}`);

      if (!response.ok) {
        throw new Error(await response.json().then(data => data.message));
      }

      const responseData = await response.json();
      setCategories(responseData.data.categoryData);
    } catch (error) {
      setAlert({ show: false, message: error.message });
    }
  }

  async function fetchExpenseDetails(id) {
    try {
      const response = await fetch(`${process.env.REACT_APP_FETCH_URL}${API_URLS.GROUP_EXPENSE}${id}`);

      if (!response.ok) {
        throw new Error(await response.json().then(data => data.message));
      }

      const expenseData = await response.json();
      const expense = expenseData.data[0];

      setForm({
        id: expense._id,
        groupId: expense.group._id,
        userId: expense.user._id,
        categoryId: expense.category._id,
        description: expense.description,
        amount: expense.amount
      });

      if (expense.splitUnequal?.length) {
        setSplitMethod('unequal');
        setIsSplitFormOpen(true);
      } else {
        setSplitMethod('equal');
      }

      setUnequalShares(expense.splitUnequal || []);
    } catch (error) {
      setAlert({ show: false, message: error.message });
    }
  }

  // Event handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSplitMethodChange = (e) => {
    const method = e.target.value;
    setSplitMethod(method);
    setIsSplitFormOpen(method === 'unequal');
    setIsOpen(false)
  };

  const handleShareChange = (e, index) => {
    const updatedShares = [...unequalShares];
    updatedShares[index] = {
      memberId: users[index]?.user?._id || '',
      share: Math.max(0, Number(e.target.value))
    };
    setUnequalShares(updatedShares);
  };

  const handleSubmit = async () => {
    try {
      if (Number(form.amount) <= 0) {
        setAlert({ show: false, message: 'Enter valid amount' });
      }
      if (splitMethod === 'unequal') {
        const totalShares = unequalShares.reduce((sum, item) => sum + Number(item.share || 0), 0);

        if (Number(form.amount) !== totalShares) {
          setAlert({ show: false, message: 'Users share amount must equal the expense amount' });
        }
      }

      const payload = {
        groupId: form.groupId,
        userId: form.userId,
        categoryId: form.categoryId,
        description: form.description,
        amount: Math.max(0, Number(form.amount)),
        usersAndShares: splitMethod === 'equal' ? null : unequalShares,
        splitMethod
      };

      const method = form.id ? 'PUT' : 'POST';
      const url = form.id
        ? `${process.env.REACT_APP_FETCH_URL}${API_URLS.GROUP_EXPENSE}${form.id}`
        : `${process.env.REACT_APP_FETCH_URL}${API_URLS.GROUP_EXPENSE}`;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(await response.json().then(data => data.message));
      }

      navigate(`/group/groupexpense?grpid=${grpId}&grpname=${grpName}&leader=${groupLeader}`);
    } catch (error) {
      setAlert({ show: false, message: error.message });
    }
  };

  // Helper functions
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
          to += `?grpid=${grpId}&grpname=${grpName}&leader=${groupLeader}`;
          break;
        case 'addgroupexpense':
          label = 'Add Group Expense';
          break;
        case 'editgroupexpense':
          label = 'Edit Group Expense';
          break;
        default:
          label = item;
      }

      return (
        <li key={index} className='breadcrumb-item'>
          {isLast ? (
            <p className='text-secondary' style={{ whiteSpace: 'nowrap' }}>{label}</p>
          ) : (
            <Link className='text-secondary' to={to}>{label}</Link>
          )}
        </li>
      );
    });
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
          <section className='main' style={{ minHeight: '400px' }}>
            <div className='d-flex  justify-content-end m-4'>
              <nav className='me-3'>
                <ol className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link className='text-secondary' to="/home">Home</Link>
                  </li>
                  {getBreadcrumbItems()}
                </ol>
              </nav>
            </div>

            <div className="alert alert-danger m-4" hidden={alert.show}>
              {alert.message}
            </div>

            <div className='d-flex justify-content-between  m-4'>
              <div className="w-50">
                <input type="hidden" name='id' value={form.id} />

                <div className="mb-3">
                  <h4 className='text-secondary'>Group {grpName} : </h4>
                </div>

                <div className="mb-3">
                  <label className="form-label">Paid By</label>
                  <select
                    value={form.userId}
                    className="form-select"
                    name="userId"
                    onChange={handleInputChange}
                  >
                    <option value="">Select member</option>
                    {users.map((item) => (
                      <option key={item.user._id} value={item.user._id}>
                        {item.user?.name || `New user ( ${item.user?.email} )`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Category</label>
                  <select
                    value={form.categoryId}
                    className="form-select"
                    name="categoryId"
                    onChange={handleInputChange}
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Amount</label>
                  <input
                    onChange={handleInputChange}
                    value={form.amount}
                    type="number"
                    min="0"
                    name='amount'
                    className='form-control'
                  />
                </div>

                {showSplitOptions && (
                  <>
                    <div className='d-flex justify-content-around mb-3'>
                      <span>Equal</span>
                      <input
                        type='radio'
                        value='equal'
                        checked={splitMethod === 'equal'}
                        onChange={(e) => {
                          handleSplitMethodChange(e)
                          toggleForm()
                        }}
                        className='ms-3 w-25'
                        name='splitMethod'
                      />
                      <span>Un Equal</span>
                      <input
                        type="radio"
                        value='unequal'
                        checked={splitMethod === 'unequal'}
                        onChange={handleSplitMethodChange}
                        className='ms-3 w-25'
                        name='splitMethod'
                      />
                    </div>

                    <div
                      ref={splitFormRef}
                      className={`split-form-collapse d-flex flex-column mb-3`}
                    >
                      {users.map((user, index) => (
                        <div key={user.user._id} className='d-flex justify-content-between mt-3 mb-2'>
                          <div className='w-50'>
                            <label>
                              {members[user.user._id] || `New user ( ${user.user?.email} )`}
                            </label>
                          </div>
                          <div className='w-50'>
                            <input
                              type="number"
                              min="0"
                              name='share'
                              value={unequalShares[index]?.share || 0}
                              onChange={(e) => handleShareChange(e, index)}
                              className='form-control w-75'
                              disabled={splitMethod !== 'unequal'}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    onChange={handleInputChange}
                    value={form.description}
                    className='form-control'
                    name="description"
                  />
                </div>

                <div className='d-flex justify-content-end'>
                  <Link
                    className='btn btn-warning me-3'
                    to={`/group/groupexpense?grpid=${grpId}&grpname=${grpName}&leader=${groupLeader}`}
                  >
                    Cancel
                  </Link>
                  <button onClick={handleSubmit} className="btn btn-primary">
                    Submit
                  </button>
                </div>
              </div>
              <div
                className={`w-50 shadow bg-white rounded ms-4 p-3 form-container ${isOpen ? 'open' : ''}`}
              >
                    <div className='d-flex flex-column gap-3'>
                      <h5 className='text-center fw-bold'>Equal Shares</h5>
                      {users.map((user, index) => (
                        <div key={index} className='row mb-2 ps-5 pe-5'>
                          <span className='col-6 text-start text-nowrap'>{members[user.user?._id]  || `New user ( ${user.user?.email} )`} : </span>
                          <strong className='col-6 text-end'>{Math.round(Number(form.amount)/users?.length)}</strong>
                        </div>
                      ))}
                      <hr />
                      <div className='row mb-2 ps-5 pe-5'>
                        <span className='col-6 text-start'>Total : </span>
                        <strong className='col-6 text-end'>{form.amount}</strong>
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

export default AddGrpExpense;