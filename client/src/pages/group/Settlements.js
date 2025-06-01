import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import Header from '../../layouts/Header';
import Footer from '../../layouts/Footer';
import SideBar from '../../layouts/SideBar';
import { useUser } from '../../components/Context';

// Constants
const COLORS = ["#ff6384", "#36a2eb", "#4bc0c0", "#9966ff", "#ff9f40"];
const CHART_DIMENSIONS = { width: 300, height: 300, outerRadius: 90 };

// Custom hook for URL query parameters
function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function Settlements() {
    // Navigation and routing
    const navigate = useNavigate();
    const location = useLocation();
    const query = useQuery();

    // State
    const [expenses, setExpenses] = useState([]);
    const [members, setMembers] = useState({});
    const [chartData, setChartData] = useState([]);
    const [groupExpenses, setGroupedExpenses] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    // Context and query params
    const { loginUser } = useUser();
    const groupId = query.get('grpid');
    const groupName = query.get('grpname');
    const pathnames = location.pathname.split('/').filter(Boolean);

    // Authentication check
    useEffect(() => {
        if (!loginUser) {
            navigate('/login');
        }
    }, [loginUser, navigate]);

    // Data fetching
    const fetchExpenses = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.REACT_APP_FETCH_URL}/groupexpense/onegroup/${groupId}`);
            const { data } = await response.json();
            setExpenses(data);

            const formattedData = data?.map((item) => ({
                name: item.description,
                value: item.amount
            }));
            setChartData(formattedData);
        } catch (error) {
            console.error('Error fetching expenses:', error);
        } finally {
            setIsLoading(false);
        }
    }, [groupId]);

    const fetchMembers = useCallback(async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_FETCH_URL}/groupmember/onegroup/${groupId}`);
            const { data } = await response.json();

            const membersMap = data?.reduce((acc, member) => {
                acc[member.user._id] = member.user.name;
                return acc;
            }, {});
            setMembers(membersMap);
        } catch (error) {
            console.error('Error fetching members:', error);
        }
    }, [groupId]);

    // Expense grouping logic
    const groupExpensesSummary = useCallback((data) => {
        const expenseGroup = {};

        data.forEach((expense) => {
            const paidUserId = expense.user._id;
            const splits = [];

            // Combine both split types
            if (expense.splitUnequal) splits.push(...expense.splitUnequal.filter(s => s.memberId !== paidUserId));
            if (expense.splitAmong) splits.push(...expense.splitAmong.filter(s => s.memberId !== paidUserId));

            if (splits.length > 0) {
                if (!expenseGroup[paidUserId]) expenseGroup[paidUserId] = {};

                splits.forEach(({ memberId, share }) => {
                    expenseGroup[paidUserId][memberId] =
                        (expenseGroup[paidUserId][memberId] || 0) + share;
                });
            }
        });

        // Net out balances
        Object.entries(expenseGroup).forEach(([payerId, owes]) => {
            Object.entries(owes).forEach(([owedId, amount]) => {
                if (expenseGroup[owedId]?.[payerId] !== undefined) {
                    const oweAmount = expenseGroup[owedId][payerId];

                    if (amount > oweAmount) {
                        expenseGroup[payerId][owedId] = amount - oweAmount;
                        delete expenseGroup[owedId][payerId];
                    } else if (amount < oweAmount) {
                        expenseGroup[owedId][payerId] = oweAmount - amount;
                        delete expenseGroup[payerId][owedId];
                    } else {
                        delete expenseGroup[payerId][owedId];
                        delete expenseGroup[owedId][payerId];
                    }
                }
            });
        });

        // Clean up empty entries
        Object.keys(expenseGroup).forEach(key => {
            if (Object.keys(expenseGroup[key]).length === 0) {
                delete expenseGroup[key];
            }
        });

        return expenseGroup;
    }, []);

    // Initial data load
    useEffect(() => {
        fetchExpenses();
        fetchMembers();
    }, [fetchExpenses, fetchMembers]);

    // Process expenses when they change
    useEffect(() => {
        if (expenses.length > 0) {
            const grouped = groupExpensesSummary(expenses);
            setGroupedExpenses(grouped);
        }
    }, [expenses, groupExpensesSummary]);

    // Breadcrumb component
    const Breadcrumbs = () => (
        <nav className='me-3'>
            <ol className="breadcrumb">
                <li className="breadcrumb-item">
                    <Link className='text-secondary' to="/home">Home</Link>
                </li>
                {pathnames.map((item, index) => {
                    const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                    const labelMap = {
                        'settlement': 'Settlement',
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

        if (expenses.length === 0) {
            return (
                <tr>
                    <td colSpan={6} className='text-center text-secondary'>No Records</td>
                </tr>
            );
        }

        return expenses?.map((item, index) => (
            <ExpenseRow key={index} item={item} index={index} members={members} />
        ))
    }

    // Expense table row component
    const ExpenseRow = ({ item, index, members }) => {
        const splitMethod = item.splitAmong ? 'Equal' : 'Unequal';
        const equalShare = item.splitAmong ? `Each member ₹${item.splitAmong[0].share}` : null;

        return (
            <tr key={index}>
                <td>{index + 1}</td>
                <td>{item.description}</td>
                <td>{item.user.name}</td>
                <td>₹{item.amount}</td>
                <td>{splitMethod}</td>
                <td>
                    {equalShare}
                    {item.splitUnequal?.map((shareItem, shareIndex) => (
                        <div key={`unequal-${shareIndex}`} className='d-flex flex-wrap gap-3'>
                            {members[shareItem.memberId] || 'User'}: ₹{shareItem.share}
                        </div>
                    ))}
                </td>
            </tr>
        );
    };

    // Settlement item component
    const SettlementItem = ({ payerId, owes, members }) => (
        <div key={payerId} className="mb-3">
            <strong>To Pay {members[payerId] || 'User'}</strong>
            <div className="ms-3">
                {Object.entries(owes).map(([owedId, amount]) => (
                    <div key={owedId}>
                        {members[owedId] || 'User'}: ₹{amount}
                    </div>
                ))}
            </div>
        </div>
    );

    //user settlement item component

const SettlementItemToUser = ({ payerId, owes, members, loginUser }) => {
    const loginUserId = loginUser?.data?._id;

    // Check if login user is involved in this settlement
    const isLoginUserInvolved = payerId === loginUserId || owes.hasOwnProperty(loginUserId);

    if (!isLoginUserInvolved) return null;

    return (
        <div key={payerId} className="mb-3">
            <strong>
                {payerId === loginUserId
                    ? `Others needs to pay to you`
                    : `You needs to give ${members[payerId] || 'User'}`}
            </strong>
            <div className="ms-3">
                {Object.entries(owes).map(([owedId, amount]) => {
                    // Show only rows involving the logged-in user
                    if (payerId === loginUserId && owedId !== loginUserId) {
                        return (
                            <div key={owedId}>
                                {members[owedId] || 'User'}: ₹{amount}
                            </div>
                        );
                    }

                    if (owedId === loginUserId) {
                        return (
                            <div key={owedId}>
                                {members[payerId] || 'User'}: ₹{amount}
                            </div>
                        );
                    }

                    return null;
                })}
            </div>
        </div>
    );
};



    return (
        <div className="d-flex settlements-container">
            <aside>
                <SideBar />
            </aside>

            <div className="flex-grow-1">
                <header>
                    <Header />
                </header>

                <main className="p-3 bg-light">
                    <div className='d-flex justify-content-end m-4'>
                        <Breadcrumbs />
                    </div>

                    <section className="settlements-content">
                        {/* Chart Section */}
                        <div className='chart col-lg card m-4'>
                            <div className="w-full card-body max-w-md mx-auto p-4 bg-white shadow-md rounded-2xl text-center">
                                <h4 className="text-xl font-semibold text-center mb-4">
                                    {groupName} Expense Summary
                                </h4>
                                <div className='d-flex justify-content-center'>
                                    <PieChart width={CHART_DIMENSIONS.width} height={CHART_DIMENSIONS.height}>
                                        <Pie
                                            data={chartData}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={CHART_DIMENSIONS.outerRadius}
                                            fill="#8884d8"
                                            dataKey="value"
                                            label
                                        >
                                            {chartData?.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </div>
                            </div>
                        </div>

                        {/* Expenses Table */}
                        <div className='table-responsive m-4'>
                            <h4 className='font-semibold'>{groupName} Settlements</h4>
                            <table className="table table-bordered table-hover">
                                <thead className="table-light">
                                    <tr>
                                        <th scope="col">S No</th>
                                        <th scope="col">Description</th>
                                        <th scope="col">Paid By</th>
                                        <th scope="col">Total Amount</th>
                                        <th scope='col'>Split Method</th>
                                        <th scope='col'>Shares</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {renderExpenseTable()}
                                </tbody>
                            </table>
                        </div>

                        <div className='card m-4'>
                            <div className='card-body'>
                                <h4 className='text-center'>Your's Settlements</h4>
                                {Object.entries(groupExpenses).map(([payerId, owes]) => (
                                    <SettlementItemToUser key={payerId} loginUser={loginUser} payerId={payerId} owes={owes} members={members} />
                                ))}
                            </div>
                        </div>

                        {/* Settlements Summary */}
                        <div className='card m-4'>
                            <div className='card-body'>
                                <h4 className='text-center'>Overall Members Settlements</h4>
                                {Object.entries(groupExpenses).map(([payerId, owes]) => (
                                    <SettlementItem key={payerId} payerId={payerId} owes={owes} members={members} />
                                ))}
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

export default Settlements;