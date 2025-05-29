import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaEdit } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import Header from '../../layouts/Header';
import Footer from '../../layouts/Footer';
import SideBar from '../../layouts/SideBar';
import { useUser } from '../../components/Context';

function GroupList() {
  const location = useLocation();
  const navigate = useNavigate();
  const { loginUser } = useUser();

  const [userGroups, setUserGroups] = useState([]);
  const [expensesTotal, setExpensesTotal] = useState([]);
  const [alert, setAlert] = useState({ visible: false, msg: '' });

  const pathnames = location.pathname.split('/').filter(Boolean);

  useEffect(() => {
    if (!loginUser) navigate('/login');
  }, [loginUser, navigate]);

  useEffect(() => {
    if (loginUser?.data?._id) {
      fetchUserGroups(loginUser.data._id);
    }
  }, [loginUser]);

  const fetchUserGroups = async (userId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_FETCH_URL}/group/usergroups/${userId}`);
      const result = await response.json();
      if (response.ok) {
        setUserGroups(result.data);
      } else {
        showAlert(result.message);
      }
    } catch (error) {
      showAlert('Failed to fetch groups');
    }
  };

  const deleteGroup = async (id) => {
    if (!window.confirm('Are you sure to delete this record?')) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_FETCH_URL}/group/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchUserGroups(loginUser.data._id);
      } else {
        const result = await response.json();
        showAlert(result.message);
      }
    } catch (error) {
      showAlert('Delete request failed');
    }
  };

  const showAlert = (msg) => {
    setAlert({ visible: true, msg });
    setTimeout(() => setAlert({ visible: false, msg: '' }), 5000);
  };

  useEffect(() => {
    const fetchAllGroupExpenses = async () => {
      const totals = await Promise.all(
        userGroups.map(async (group) => {
          try {
            const res = await fetch(`${process.env.REACT_APP_FETCH_URL}/groupexpense/onegroup/${group._id}`);
            const data = await res.json();
            return data?.data?.reduce((sum, item) => sum + item.amount, 0) || 0;
          } catch {
            return 0;
          }
        })
      );
      setExpensesTotal(totals);
    };

    if (userGroups.length) fetchAllGroupExpenses();
  }, [userGroups]);

  const renderBreadcrumbs = () => (
    <ol className="breadcrumb">
      <li className="breadcrumb-item">
        <Link className="text-secondary" to="/home">Home</Link>
      </li>
      {pathnames.map((item, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        return (
          <li key={to} className="breadcrumb-item">
            {isLast ? (
              <span className="text-secondary text-nowrap">{item}</span>
            ) : (
              <Link className="text-secondary" to={to}>{item}</Link>
            )}
          </li>
        );
      })}
    </ol>
  );

  const renderActions = (group, index) => {
    const isOwner = group.createdBy._id === loginUser?.data?._id;

    return (
      <>
        <Link
          to={`/group/groupmember?grpid=${group._id}&grpname=${group.name}&leader=${group.createdBy._id}`}
          className="btn btn-link text-nowrap"
        >
          {isOwner ? 'Manage Members' : 'Group Members'}
        </Link>
        <Link
          to={`/group/groupexpense?grpid=${group._id}&grpname=${group.name}&leader=${group.createdBy._id}`}
          className="btn btn-link text-nowrap"
        >
          {isOwner ? 'Manage Expenses' : 'Group Expenses'}
        </Link>
        {isOwner && (
          <>
            <Link
              to={`/group/settlement?grpid=${group._id}&grpname=${group.name}`}
              className="btn btn-link"
            >
              Settlements
            </Link>
            <Link
              to={`/group/editgroup?mode=edit&group=${group._id}`}
              className="btn btn-sm btn-warning me-2"
            >
              <FaEdit />
            </Link>
            <button
              onClick={() => deleteGroup(group._id)}
              className="btn btn-sm btn-danger"
            >
              <MdDelete />
            </button>
          </>
        )}
      </>
    );
  };

  return (
    <div className="d-flex">
      <aside><SideBar /></aside>
      <div className="flex-grow-1">
        <header><Header /></header>
        <main className="p-3 bg-light">
          <section className="main" style={{ minHeight: '400px' }}>
            <div className="d-flex justify-content-between m-4">
              <h2>Your group list</h2>
              <nav className="me-3">{renderBreadcrumbs()}</nav>
            </div>

            <div className="m-4">
              <div className="d-flex justify-content-end mb-2">
                <Link to="addgroup" className="btn btn-primary">Create new group</Link>
              </div>

              {alert.visible && (
                <div className="alert alert-danger m-2">{alert.msg}</div>
              )}

              <div className="table-responsive mt-4">
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Sno</th>
                      <th className="text-nowrap">Group Name</th>
                      <th className="text-nowrap">Created By</th>
                      <th className="text-nowrap">Total Expense</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userGroups.length ? (
                      userGroups.map((group, index) => (
                        <tr key={group._id}>
                          <td>{index + 1}</td>
                          <td className="text-nowrap">{group.name}</td>
                          <td className="text-nowrap">{group.createdBy.name}</td>
                          <td>₹ {expensesTotal[index] || 0}</td>
                          <td className="d-flex" style={{ gap: '30px' }}>
                            {renderActions(group, index)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center text-secondary">
                          No Groups Found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
          <footer><Footer /></footer>
        </main>
      </div>
    </div>
  );
}

export default GroupList;
