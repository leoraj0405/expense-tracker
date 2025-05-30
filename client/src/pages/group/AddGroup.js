import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Header from '../../layouts/Header';
import Footer from '../../layouts/Footer';
import SideBar from '../../layouts/SideBar';
import { useUser } from '../../components/Context';
// import './AddGroup.css'; // Consider creating a separate CSS file

// Custom hook for URL query parameters
function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function AddGroup() {
    // Navigation and routing
    const navigate = useNavigate();
    const location = useLocation();
    const query = useQuery();
    
    // State
    const [formData, setFormData] = useState({ grpId: '', grpName: '' });
    const [alert, setAlert] = useState({ show: false, message: '', type: 'danger' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Context and query params
    const { loginUser } = useUser();
    const groupId = query.get('group');
    const pathnames = location.pathname.split('/').filter(Boolean);

    // Authentication check
    useEffect(() => {
        if (!loginUser) {
            navigate('/login');
        }
    }, [loginUser, navigate]);

    // Fetch group data when in edit mode
    useEffect(() => {
        if (groupId) {
            fetchGroupData(groupId);
        }
    }, [groupId]);

    // Auto-hide alert after timeout
    useEffect(() => {
        if (alert.show) {
            const timer = setTimeout(() => {
                setAlert(prev => ({ ...prev, show: false }));
            }, 10000);
            return () => clearTimeout(timer);
        }
    }, [alert.show]);

    const fetchGroupData = useCallback(async (id) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_FETCH_URL}/group/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch group data');
            }
            const { data } = await response.json();
            const group = data[0];
            setFormData({ grpId: group._id, grpName: group.name });
        } catch (err) {
            showAlert(err.message, 'danger');
        }
    }, []);

    const showAlert = (message, type = 'danger') => {
        setAlert({ show: true, message, type });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        if (!formData.grpName.trim()) {
            showAlert('Group name is required', 'danger');
            return false;
        }
        return true;
    };

    const addCurrentUserAsMember = useCallback(async (groupId, email) => {
        const response = await fetch(`${process.env.REACT_APP_FETCH_URL}/groupmember`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, groupId }),
        });

        if (!response.ok) {
            throw new Error('Failed to add user as group member');
        }
    }, []);

    const handleSubmit = async () => {
        if (!validateForm()) return;
        if (isSubmitting) return;

        setIsSubmitting(true);
        const { grpId, grpName } = formData;
        const createdBy = loginUser?.data?._id;
        const email = loginUser?.data?.email;

        try {
            // Prepare request data
            const headers = { 'Content-Type': 'application/json' };
            const body = JSON.stringify({ name: grpName, createdBy });

            // Determine API endpoint and method
            const url = `${process.env.REACT_APP_FETCH_URL}/group${grpId ? `/${grpId}` : ''}`;
            const method = grpId ? 'PUT' : 'POST';

            // Create/update group
            const response = await fetch(url, { method, headers, body });
            if (!response.ok) {
                throw new Error((await response.json()).message || 'Failed to save group');
            }

            const result = await response.json();
            const newGroupId = result?.data?._id;

            // Add current user as member (only for new groups)
            if (!grpId) {
                await addCurrentUserAsMember(newGroupId, email);
            }

            showAlert(
                `Group ${grpId ? 'updated' : 'created'} successfully!`, 
                'success'
            );
            setTimeout(() => navigate('/group'), 1500);
        } catch (err) {
            showAlert(err.message, 'danger');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Breadcrumb component
    const Breadcrumbs = () => (
        <nav>
            <ol className="breadcrumb">
                <li className="breadcrumb-item">
                    <Link className="text-secondary" to="/home">Home</Link>
                </li>
                {pathnames.map((item, index) => {
                    const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                    const labelMap = {
                        addgroup: 'Add Group',
                        editgroup: 'Edit Group',
                        group: 'Group',
                    };
                    const label = labelMap[item] || item;
                    return (
                        <li key={index} className="breadcrumb-item">
                            <Link className="text-secondary" to={to}>{label}</Link>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );

    return (
        <div className="d-flex add-group-container">
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

                        {alert.show && (
                            <div className={`alert alert-${alert.type} m-4`}>
                                {alert.message}
                            </div>
                        )}

                        <div className="m-4 w-75">
                            <div className="d-flex flex-column align-content-center">
                                <div className="form-group col-md-6">
                                    <label htmlFor="grpName">Group Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="grpName"
                                        value={formData.grpName}
                                        onChange={handleChange}
                                        placeholder="Enter group name"
                                        disabled={isSubmitting}
                                    />
                                    <input
                                        type="hidden"
                                        name="grpId"
                                        value={formData.grpId}
                                    />
                                </div>

                                <div className="mt-4 d-flex justify-content-center gap-3">
                                    <Link 
                                        className="btn btn-warning" 
                                        to="/group"
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </Link>
                                    <button 
                                        onClick={handleSubmit} 
                                        className="btn btn-primary"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span 
                                                className="spinner-border spinner-border-sm me-2" 
                                                role="status" 
                                                aria-hidden="true"></span>
                                                {groupId ? 'Updating...' : 'Creating...'}
                                            </>
                                        ) : (
                                            groupId ? 'Update' : 'Create'
                                        )}
                                    </button>
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

export default AddGroup;