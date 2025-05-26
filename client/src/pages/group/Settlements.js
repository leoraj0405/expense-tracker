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

    useEffect(() => {
        fetchExpenses()
        fetchMembers()
    }, [])
    return (
        <>
            <header>
                <Header />
            </header>
            <div className='d-flex'>

                <aside>
                    <SideBar />
                </aside>
                <main className='p-3 w-100 bg-light'>
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
                    <section className='main ' style={{ minHeight: '400px' }}>
                        <div className='chart col-lg boxshadow'>
                            <div className="w-full max-w-md mx-auto p-4 bg-white shadow-md rounded-2xl text-center">
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
                        <h4 className='font-semibold ms-4 mt-4'>{grpName} Settlements : </h4>
                        <div className='table-responsive m-4'>
                            <table className="table table-bordered">
                                <thead>
                                    <tr>
                                        <th scope="col">S No</th>
                                        <th scope="col">Description</th>
                                        <th scope="col">Paid By</th>
                                        <th scope="col">Total Amount</th>
                                        <th scope='col'>Split Method</th>
                                        <th scope='col'>Shares</th>
                                        <th scope='col'>To pay</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {expenses?.length > 0 ? (
                                        expenses?.map((item, index) => (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{item.description}</td>
                                                <td>{item.user.name}</td>
                                                <td>₹ {item.amount}</td>
                                                <td>{item.splitAmong ? 'Equal' : 'Unequal'}</td>
                                                <td>
                                                    {item.splitAmong?.map((shareItem, shareIndex) => (
                                                        <div key={`equal-${shareIndex}`} className='d-flex flex-wrap gap-3'>
                                                            {members[shareItem.memberId] ? members[shareItem.memberId] : 'User'} : ₹ {shareItem.share}
                                                        </div>
                                                    ))}
                                                    {item.splitUnequal?.map((shareItem, shareIndex) => (
                                                        <div key={`unequal-${shareIndex}`}className='d-flex flex-wrap gap-3'>
                                                            {members[shareItem.memberId] ? members[shareItem.memberId] : 'User'} : ₹ {shareItem.share}
                                                        </div>
                                                    ))}
                                                </td>
                                                <td></td>
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
                    </section>
                    <footer>
                        <Footer />
                    </footer>
                </main>
            </div>
        </>

    )
}

export default Settlements
