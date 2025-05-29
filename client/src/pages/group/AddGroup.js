import React, { useEffect, useState } from 'react';
import Header from '../../layouts/Header';
import Footer from '../../layouts/Footer';
import SideBar from '../../layouts/SideBar';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../../components/Context';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function AddGroup() {
    const location = useLocation();
    const navigate = useNavigate();
    const pathnames = location.pathname.split('/').filter(Boolean);

    const { loginUser } = useUser();
    const query = useQuery();
    const mode = query.get('mode');
    const groupId = query.get('group');

    const [formData, setFormData] = useState({ grpId: '', grpName: '' });
    const [alert, setAlert] = useState({ show: false, message: '' });

    useEffect(() => {
        if (!loginUser) {
            navigate('/login');
        }
    }, [loginUser, navigate]);

    useEffect(() => {
        if (groupId) fetchGroupData(groupId);
    }, [groupId]);

    useEffect(() => {
        if (alert.show) {
            const timer = setTimeout(() => {
                setAlert({ show: false, message: '' });
            }, 10000);
            return () => clearTimeout(timer);
        }
    }, [alert]);

    const fetchGroupData = async (id) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_FETCH_URL}/group/${id}`);
            if (!response.ok) throw new Error('Failed to fetch group');
            const { data } = await response.json();
            const group = data[0];
            setFormData({ grpId: group._id, grpName: group.name });
        } catch (err) {
            showAlert(err.message);
        }
    };

    const showAlert = (message) => {
        setAlert({ show: true, message });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        const { grpId, grpName } = formData;
        const createdBy = loginUser?.data?._id;

        const headers = { 'Content-Type': 'application/json' };
        const body = JSON.stringify({ name: grpName, createdBy });

        try {
            const url = `${process.env.REACT_APP_FETCH_URL}/group${grpId ? `/${grpId}` : ''}`;
            const method = grpId ? 'PUT' : 'POST';
            const response = await fetch(url, { method, headers, body });

            if (!response.ok) throw new Error((await response.json()).message);

            const result = await response.json();
            const groupId = result?.data?._id;

            // Add current user as member
            const memberResponse = await fetch(`${process.env.REACT_APP_FETCH_URL}/groupmember`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    email: loginUser?.data?.email,
                    groupId,
                }),
            });

            if (!memberResponse.ok) {
                throw new Error((await memberResponse.json()).message);
            }

            navigate('/group');
        } catch (err) {
            showAlert(err.message);
        }
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
                        </div>

                        {alert.show && (
                            <div className="alert alert-danger m-4">{alert.message}</div>
                        )}

                        <div className="m-4 w-75">
                            <div className="d-flex flex-column align-content-center">
                                <div className="form-group col-md-6">
                                    <label htmlFor="grpName">Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="grpName"
                                        value={formData.grpName}
                                        onChange={handleChange}
                                        placeholder="Group Name"
                                    />
                                    <input
                                        type="hidden"
                                        name="grpId"
                                        value={formData.grpId}
                                    />
                                </div>
                                <div className="mt-4 d-flex justify-content-end gap-3">
                                    <Link className="btn btn-warning" to="/group">Cancel</Link>
                                    <button onClick={handleSubmit} className="btn btn-primary">
                                        Submit
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
