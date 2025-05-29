import React, { useEffect, useState } from 'react'
import Header from '../../layouts/Header'
import Footer from '../../layouts/Footer'
import SideBar from '../../layouts/SideBar'
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../../components/Context';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'


function useQuery() {
    return new URLSearchParams(useLocation().search)
}

function Settlements() {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);
    const { loginUser } = useUser();
    const queryValue = useQuery()
    const navigate = useNavigate();
    const groupId = queryValue.get('grpid')
    const grpName = queryValue.get('grpname')

    useEffect(() => {
        if (!loginUser) {
            navigate('/login')
        }
    }, [])

    const [expenses, setExpenses] = useState([])
    const [members, setMembers] = useState([])
    const [data, setData] = useState([])
    const [groupExpenses, setGroupedExpenses] = useState([])
    const COLORS = ["#ff6384", "#36a2eb", "#4bc0c0", "#9966ff", "#ff9f40"];


    async function fetchExpenses() {
        const response = await fetch(`${process.env.REACT_APP_FETCH_URL}/groupexpense/onegroup/${groupId}`)
        const expenseData = await response.json()
        setExpenses(expenseData?.data)
        const result = expenseData?.data?.map((item) => ({
            name: item.description,
            value: item.amount
        }))
        setData(result)
    }

    async function fetchMembers() {
        const response = await fetch(`${process.env.REACT_APP_FETCH_URL}/groupmember/onegroup/${groupId}`)
        const membersData = await response.json()
        const members = membersData?.data.reduce((acc, member) => {
            acc[member.user._id] = member.user.name;
            return acc;
        }, {});
        setMembers(members)
    }

    async function groupExpensesSummary(data) {
        const expenseGroup = {}
        data.forEach((expense) => {
            const paiduser = expense.user._id
            const splits = [];

            if (expense.splitUnequal) {
                splits.push(...expense.splitUnequal.filter(s => s.memberId !== paiduser));
            }

            if (expense.splitAmong) {
                splits.push(...expense.splitAmong.filter(s => s.memberId !== paiduser));
            }

            if (splits.length > 0) {
                if (!expenseGroup[paiduser]) {
                    expenseGroup[paiduser] = {};
                }

                splits.forEach((item) => {
                    const { memberId, share } = item

                    if (expenseGroup[paiduser].hasOwnProperty(memberId)) {
                        expenseGroup[paiduser][memberId] += share
                    } else {
                        expenseGroup[paiduser][memberId] = share
                    }
                })
            }
        })
        Object.entries(expenseGroup).forEach(([payerId, owes]) => {
            Object.entries(owes).forEach(([owedId, amount]) => {
                if (
                    expenseGroup[owedId] &&
                    expenseGroup[owedId][payerId] !== undefined
                ) {
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

        Object.keys(expenseGroup).forEach((key) => {
            if (Object.keys(expenseGroup[key]).length === 0) {
                delete expenseGroup[key];
            }
        });

        return expenseGroup;


    }

    useEffect(() => {
        fetchExpenses()
        fetchMembers()
    }, [])

    useEffect(() => {
        if (expenses.length > 0) {
            async function fetchAndGroup() {
                const grouped = await groupExpensesSummary(expenses);
                setGroupedExpenses(grouped);
            }
            fetchAndGroup()
        }
    }, [expenses])

    return (
        <>
            <div className="d-flex">
                {/* Sidebar */}
                <aside>
                    <SideBar />
                </aside>

                {/* Right content: header, main, footer */}
                <div className="flex-grow-1">
                    <header>
                        <Header />
                    </header>
                    <main className="p-3 bg-light">
                        <div className='d-flex justify-content-between m-4'>
                            <h2>Group Summary</h2>
                            <nav className='me-3'>
                                <ol className="breadcrumb">
                                    <li className="breadcrumb-item"><Link className='text-secondary' to="/home">Home</Link></li>
                                    {pathnames.map((item, index) => {
                                        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                                        const label = item === 'settlement' ? 'Settlement' : item === 'group' ? 'Group' : item
                                        const isLast = index === pathnames.length - 1
                                        return (
                                            <li className='breadcrumb-item'>
                                                {isLast ? (
                                                    <p className='text-secondary' style={{ whiteSpace: 'nowrap' }} >{label}</p>
                                                ) : (
                                                    <Link className='text-secondary' to={to}>{label}</Link>
                                                )}
                                            </li>
                                        )
                                    })}
                                </ol>
                            </nav>
                        </div>
                        <section className="main" style={{ minHeight: '400px' }}>
                            {/* Content goes here */}
                            <section className='main ' style={{ minHeight: '400px' }}>
                                <div className='chart col-lg card m-4'>
                                    <div className="w-full card-body max-w-md mx-auto p-4 bg-white shadow-md rounded-2xl text-center">
                                        <h4 className="text-xl font-semibold text-center mb-4">{grpName} expense Summary</h4>
                                        <div className='d-flex justify-content-center'>
                                            <PieChart width={300} height={300} >
                                                <Pie
                                                    data={data}
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={90}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                    label
                                                >
                                                    {data?.map((_, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        </div>
                                    </div>
                                </div>
                                <div className='table-responsive m-4'>
                                    <h4 className='font-semibold'>{grpName} Settlements : </h4>
                                    <table className="table table-bordered">
                                        <thead>
                                            <tr>
                                                <th scope="col">S No</th>
                                                <th scope="col">Description</th>
                                                <th scope="col">Paid By</th>
                                                <th scope="col">Total Amount</th>
                                                <th scope='col'>Split Method</th>
                                                <th scope='col'>Shares</th>
                                                {/* <th scope='col'>To pay he/she</th> */}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {expenses?.length > 0 ? (
                                                expenses?.map((item, index) => (
                                                    <tr key={index}>
                                                        <td>{index + 1}</td>
                                                        <td>{item.description}</td>
                                                        <td>{item.user.name}</td>
                                                        <td>₹{item.amount}</td>
                                                        <td>{item.splitAmong ? 'Equal' : 'Unequal'}</td>
                                                        <td>{item.splitAmong ? `Each member ₹${item.splitAmong[0].share}` : ' '}
                                                            {item.splitUnequal?.map((shareItem, shareIndex) => (
                                                                <div key={`unequal-${shareIndex}`} className='d-flex flex-wrap gap-3'>
                                                                    {members[shareItem.memberId] ? members[shareItem.memberId] : 'User'} : ₹{shareItem.share}
                                                                </div>
                                                            ))}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={7} className='text-center text-secondary'>No Expenses</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <div className='card m-4'>
                                    <div className='card-body'>
                                        <h4 className='text-center'>Overall Members Settlements</h4>
                                        {Object.entries(groupExpenses).map(([payerId, owes]) => (
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
                                        ))}
                                    </div>

                                </div>
                            </section>
                        </section>
                        <footer>
                            <Footer />
                        </footer>
                    </main>
                </div>
            </div>
        </>

    )
}

export default Settlements
