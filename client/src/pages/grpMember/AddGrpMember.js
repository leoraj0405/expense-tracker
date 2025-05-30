import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import Header from '../../layouts/Header';
import SideBar from '../../layouts/SideBar';
import Footer from '../../layouts/Footer';
import { useUser } from '../../components/Context';

// Custom hook for URL query parameters
function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function AddGrpMember() {
    // Hooks and context
    const { loginUser } = useUser();
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = useQuery();
    
    // State management
    const [form, setForm] = useState({ 
        groupId: queryParams.get('grpid') || '',
        email: '' 
    });
    const [alert, setAlert] = useState({
        show: false,
        message: ''
    });
    
    // Derived values
    const pathnames = location.pathname.split('/').filter(Boolean);
    const groupId = queryParams.get('grpid');
    const groupName = queryParams.get('grpname');
    const groupLeader = queryParams.get('leader');

    // Authentication check effect
    useEffect(() => {
        if (!loginUser) {
            navigate('/login');
        }
    }, [loginUser, navigate]);

    // Auto-hide alert effect
    useEffect(() => {
        if (alert.show) {
            const timer = setTimeout(() => {
                setAlert(prev => ({ ...prev, show: false }));
            }, 10000);
            
            return () => clearTimeout(timer);
        }
    }, [alert.show]);

    // Form handlers
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = useCallback(async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_FETCH_URL}/groupmember`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    groupId: form.groupId,
                    email: form.email,
                }),
            });

            if (!response.ok) {
                const errorMessage = await response.text();
                throw new Error(errorMessage || 'Failed to add group member');
            }

            navigate(`/group/groupmember?grpid=${groupId}&grpname=${groupName}&leader=${groupLeader}`);
        } catch (error) {
            setAlert({
                show: true,
                message: error.message
            });
        }
    }, [form, groupId, groupName, groupLeader, navigate]);

    // Render helper for breadcrumbs
    const renderBreadcrumbs = () => {
        const breadcrumbMap = {
            'group': 'Group',
            'groupmember': 'Group Member',
            'addgroupmember': 'Add Group Member',
            'editgroupmember': 'Edit Group Member'
        };

        return (
            <nav className='me-3'>
                <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                        <Link className='text-secondary' to="/home">Home</Link>
                    </li>
                    {pathnames.map((item, index) => {
                        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                        const label = breadcrumbMap[item] || item;
                        const isLast = index === pathnames.length - 1;
                        const urlParams = `?grpid=${groupId}&grpname=${groupName}&leader=${groupLeader}`;
                        const fullPath = item === 'groupmember' ? `${to}${urlParams}` : to;

                        return (
                            <li key={to} className='breadcrumb-item'>
                                {isLast ? (
                                    <span className='text-secondary' style={{ whiteSpace: 'nowrap' }}>
                                        {label}
                                    </span>
                                ) : (
                                    <Link className='text-secondary' to={fullPath}>
                                        {label}
                                    </Link>
                                )}
                            </li>
                        );
                    })}
                </ol>
            </nav>
        );
    };

    return (
        <div className="d-flex flex-column min-vh-100">
            <header>
                <Header />
            </header>
            
            <div className='d-flex flex-grow-1'>
                <aside className='vh-100'>
                    <SideBar />
                </aside>
                
                <main className='p-3 w-100 bg-light'>
                    <section className='main' style={{ minHeight: '400px' }}>
                        <div className='d-flex justify-content-end m-4'>
                            {renderBreadcrumbs()}
                        </div>
                        
                        {alert.show && (
                            <div className="alert alert-danger m-4">
                                {alert.message}
                            </div>
                        )}

                        <div className="p-3 w-50">
                            <div className='mb-4'>
                                <h4 className='text-secondary'>Group Name: {groupName}</h4>
                            </div>
                            
                            <div className="mb-4">
                                <label htmlFor="memberEmail" className="form-label">
                                    Member Email
                                </label>
                                <input
                                    id="memberEmail"
                                    type="email"
                                    value={form.email}
                                    className="form-control"
                                    name="email"
                                    onChange={handleChange}
                                    placeholder="Enter member's email address"
                                    required
                                />
                            </div>

                            <div className='d-flex justify-content-end gap-3'>
                                <Link 
                                    className='btn btn-warning' 
                                    to={`/group/groupmember?grpid=${groupId}&grpname=${groupName}&leader=${groupLeader}`}
                                >
                                    Cancel
                                </Link>
                                <button 
                                    onClick={handleSubmit} 
                                    className="btn btn-primary"
                                    disabled={!form.email}
                                >
                                    Add Member
                                </button>
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

export default AddGrpMember;