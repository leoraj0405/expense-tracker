import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MdDelete } from "react-icons/md";
import Header from '../../layouts/Header';
import Footer from '../../layouts/Footer';
import SideBar from '../../layouts/SideBar';
import { useUser } from '../../components/Context';

// Custom hook for URL query parameters
function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function GrpMember() {
    // Hooks and context
    const location = useLocation();
    const navigate = useNavigate();
    const { loginUser } = useUser();
    const queryParams = useQuery();

    // State management
    const [alert, setAlert] = useState({
        show: false,
        message: ''
    });
    const [groupMembers, setGroupMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);


    // Derived values
    const pathnames = location.pathname.split('/').filter(Boolean);
    const groupId = queryParams.get('grpid');
    const groupName = queryParams.get('grpname');
    const groupLeader = queryParams.get('leader');
    const isGroupLeader = groupLeader === loginUser?.data?._id;

    // Memoized fetch function
    const fetchGroupMembers = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.REACT_APP_FETCH_URL}/groupmember/onegroup/${groupId}`);

            if (!response.ok) {
                const errorInfo = await response.json();
                throw new Error(errorInfo.message || 'Failed to fetch group members');
            }

            const { data } = await response.json();
            setGroupMembers(data);
        } catch (error) {
            setAlert({
                show: true,
                message: error.message
            });
        } finally {
            setIsLoading(false);
        }
    }, [groupId]);

    // Effect for authentication check
    useEffect(() => {
        if (!loginUser) {
            navigate('/login');
        }
    }, [loginUser, navigate]);

    // Effect for initial data loading
    useEffect(() => {
        if (groupId) {
            fetchGroupMembers();
        }
    }, [groupId, fetchGroupMembers]);

    // Effect for auto-hiding alerts
    useEffect(() => {
        if (alert.show) {
            const timer = setTimeout(() => {
                setAlert(prev => ({ ...prev, show: false }));
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [alert.show]);

    // Handler for deleting a member
    const handleDeleteMember = async (memberId) => {
        if (!window.confirm('Are you sure you want to delete this member?')) {
            return;
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_FETCH_URL}/groupmember/${memberId}`, {
                method: "DELETE"
            });

            if (!response.ok) {
                const errorInfo = await response.json();
                throw new Error(errorInfo.message || 'Failed to delete member');
            }

            fetchGroupMembers();
        } catch (error) {
            setAlert({
                show: true,
                message: error.message
            });
        }
    };

    // Render helper for breadcrumbs
    const renderBreadcrumbs = () => (
        <nav className='me-3'>
            <ol className="breadcrumb">
                <li className="breadcrumb-item">
                    <Link className='text-secondary' to="/home">Home</Link>
                </li>
                {pathnames.map((item, index) => {
                    const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                    const labelMap = {
                        'groupmember': 'Group Member',
                        'group': 'Group'
                    };
                    const label = labelMap[item] || item;
                    const isLast = index === pathnames.length - 1;

                    return (
                        <li key={to} className='breadcrumb-item'>
                            {isLast ? (
                                <span className='text-secondary' style={{ whiteSpace: 'nowrap' }}>{label}</span>
                            ) : (
                                <Link className='text-secondary' to={to}>{label}</Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );

    const renderMembersTable = () => {
        if (isLoading) {
            return (
                <tr>
                    <td colSpan={isGroupLeader ? 3 : 2} className="text-center">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </td>
                </tr>
            );
        }

        if (groupMembers.length === 0) {
            return (
                <tr>
                    <td colSpan={isGroupLeader ? 3 : 2} className='text-center text-secondary'>
                        No members found
                    </td>
                </tr>
            );
        }

        return groupMembers.map((member, index) => (
            <tr key={member._id}>
                <td>{index + 1}</td>
                <td>{member.user?.name || `New user ( ${member.user?.email} )`}</td>
                {isGroupLeader && (
                    <td>
                        <button
                            onClick={() => handleDeleteMember(member._id)}
                            className='btn btn-sm btn-danger'
                            aria-label={`Delete ${member.user?.name}`}
                        >
                            <MdDelete />
                        </button>
                    </td>
                )}
            </tr>
        ))
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
                        <div className='d-flex justify-content-end m-4'>
                            {renderBreadcrumbs()}
                        </div>

                        {alert.show && (
                            <div className="alert alert-danger m-4">
                                {alert.message}
                            </div>
                        )}

                        <div className='d-flex justify-content-between ms-4 me-4 mb-4'>
                            <h4 className='text-secondary'>{groupName} Members</h4>
                            <Link
                                className='btn btn-primary'
                                to={{
                                    pathname: 'addgroupmember',
                                    search: `?grpid=${groupId}&grpname=${groupName}&leader=${groupLeader}`
                                }}
                            >
                                Add Members
                            </Link>
                        </div>

                        <div className='table-responsive m-4'>
                            <table className="table table-bordered table-hover">
                                <thead className="table-light">
                                    <tr>
                                        <th scope="col">#</th>
                                        <th scope="col">Member</th>
                                        {isGroupLeader && <th scope="col">Actions</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {renderMembersTable()}
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

export default GrpMember;