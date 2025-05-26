import React, { useState, useEffect, useRef, use } from 'react'
import Header from '../../layouts/Header'
import SideBar from '../../layouts/SideBar'
import Footer from '../../layouts/Footer'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import { useUser } from '../../components/Context'
import '../../style/style.css'

function useQuery() {
    return new URLSearchParams(useLocation().search)
}

function AddGrpExpense() {
    const { loginUser } = useUser()
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);
    const navigate = useNavigate()
    const queryValue = useQuery()
    const grpExpenseId = queryValue.get('grpexpid')
    const grpId = queryValue.get('grpid')
    const grpName = queryValue.get('grpname')
    const groupLeader = queryValue.get('leader')
    const [splitBox, setSplitBox] = useState(true)


    const [form, setForm] = useState({
        id: '',
        groupId: grpId,
        userId: '',
        description: '',
        amount: '',
        categoryId: ''
    });

    const [users, setUsers] = useState([])
    const [categories, setCategories] = useState([])
    const [alertBlock, setAlertBlock] = useState({
        blockState: true,
        msg: ''
    })
    const [isOpen, setIsOpen] = useState(false);
    const contentRef = useRef(null);
    const [splitMethod, setSplitMethod] = useState('')
    const [unequalArr, setUnequalArr] = useState([]);
    const [members, setMembers] = useState([])

    useEffect(() => {
        if (!loginUser) {
            navigate('/login')
        }
    }, [])

    const handleRadioChange = (e) => {
        setSplitMethod(e.target.value);
    };
    const toggleSplitFormUnequal = () => setIsOpen(true);
    const toggleSplitFormEqual = () => setIsOpen(false)

    useEffect(() => {
        const element = contentRef.current;
        if (element) {
            element.style.maxHeight = isOpen ? `${element.scrollHeight}px` : '0px';
        }
    }, [isOpen]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    async function fetchUsers() {
        const response = await fetch(`${process.env.REACT_APP_FETCH_URL}/groupmember/onegroup/${grpId}`)
        if (response.status === 200) {
            const responseData = await response.json()
            setUsers(responseData.data)
            const members = responseData?.data.reduce((acc, member) => {
                acc[member.user._id] = member.user.name;
                return acc;
            }, {});
            setMembers(members)
        } else {
            const errorInfo = await response.json()
            setAlertBlock({
                blockState: false,
                msg: errorInfo.message
            })
        }
    }

    function handleOpen() {
        setSplitBox(false)
    }

    function handleChange2(e, index) {
        const usersAndShares = [...(unequalArr || [])];
        usersAndShares[index] = {
            memberId: users[index].user?._id || '',
            share: Number(e.target.value) < 0 ? 0 : e.target.value
        };
        setUnequalArr(usersAndShares);
    }
    const handleSubmit = () => {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const id = form.id
        const groupId = form.groupId
        const userId = form.userId
        const description = form.description
        const amount = form.amount
        const categoryId = form.categoryId

        if (splitMethod === 'equal') {
            var usersShares = null
        } else {
            let total = 0
            unequalArr?.forEach((item) => {
                total += Number(item.share)
            })
            if (Number(amount) !== total) {
                return setAlertBlock({
                    blockState: false,
                    msg: 'Users share amount higher or lower than expense amount'
                });
            }
            var usersShares = unequalArr
        }
        const raw = JSON.stringify({
            "groupId": groupId,
            "userId": userId,
            "categoryId": categoryId,
            "description": description,
            "amount": Number(amount) < 0 ? 0 : amount,
            "usersAndShares": usersShares,
            "splitMethod": splitMethod
        });
        const requestOptions = {
            headers: myHeaders,
            body: raw,
        };
        let request
        if (id) {
            request = fetch(`${process.env.REACT_APP_FETCH_URL}/groupexpense/${id}`, { ...requestOptions, method: "PUT", })
        } else {
            request = fetch(`${process.env.REACT_APP_FETCH_URL}/groupexpense/`, { ...requestOptions, method: "POST", })
        }
        request.then(async (response) => {
            if (response.status === 200) {
                navigate(`/group/groupexpense?grpid=${grpId}&grpname=${grpName}&leader=${groupLeader}`)
            } else {
                const errorInfo = await response.json();
                console.log(errorInfo)
                setAlertBlock({ blockState: false, msg: errorInfo.message });
            }
        });
    };

    async function editExpense(id) {
        const response = await fetch(`${process.env.REACT_APP_FETCH_URL}/groupexpense/${id}`);
        if (response.status === 200) {
            const expenseData = await response.json();
            const edited = {
                id: expenseData.data[0]._id,
                groupId: expenseData.data[0].group._id,
                userId: expenseData.data[0].user._id,
                categoryId: expenseData.data[0].category._id,
                description: expenseData.data[0].description,
                amount: expenseData.data[0].amount
            };
            if (expenseData.data[0].splitUnequal && expenseData.data[0].splitUnequal.length) {
                setSplitMethod('unequal')
                toggleSplitFormUnequal()
            } else {
                setSplitMethod('equal')
            }
            setUnequalArr(expenseData.data[0].splitUnequal)
            setForm(edited);
            setSplitBox(false)
        } else {
            const errorInfo = await response.json();
            setAlertBlock({ blockState: false, msg: errorInfo.message });
        }
    }

    async function fetchCategory() {
        const response = await fetch(`${process.env.REACT_APP_FETCH_URL}/category`)
        if (response.status === 200) {
            const responseData = await response.json()
            setCategories(responseData.data.categoryData)
        } else {
            const errorInfo = await response.json()
            setAlertBlock({
                blockState: false,
                msg: errorInfo.message
            })
        }
    }

    useEffect(() => {
        fetchUsers()
        fetchCategory()
    }, [])

    useEffect(() => {
        if (grpExpenseId) {
            editExpense(grpExpenseId);
        }
    }, [grpExpenseId]);

    useEffect(() => {
        setTimeout(() => {
            setAlertBlock({
                blockState: true,
                msg: ''
            })
        }, 10000)
    }, [alertBlock])

    console.log(members)

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
                    <section className='main' style={{ minHeight: '400px' }}>
                        <div className='d-flex justify-content-between m-4'>
                            <h2>{grpExpenseId ? 'Edit' : 'Add'} Group Expense</h2>
                            <nav className='me-3'>
                                <ol className="breadcrumb">
                                    <li className="breadcrumb-item"><Link className='text-secondary' to="/home">Home</Link></li>
                                    {pathnames.map((item, index) => {
                                        let to = `/${pathnames.slice(0, index + 1).join('/')}`;
                                        let label
                                        const isLast = index === pathnames.length - 1;

                                        if (item === 'group') {
                                            label = 'Group'
                                        }
                                        if (item === 'groupexpense') {
                                            label = 'Group Expense'
                                            to += `?grpid=${grpId}&grpname=${grpName}&leader=${groupLeader}`
                                        }
                                        if (item === 'addgroupexpense') {
                                            label = 'Add Group Expense'
                                        }
                                        if (item === 'editgroupexpense') {
                                            label = 'Edit Group Expense'
                                        }

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
                        <div
                            className="alert alert-danger m-4"
                            hidden={alertBlock.blockState}>
                            {alertBlock.msg}
                        </div>
                        <div className="p-3 m-4 w-50">
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
                                    onChange={handleChange}
                                >
                                    <option>Select member</option>
                                    {users.map((item, index) => {
                                        return (
                                            <option key={index} value={item?.user?._id}>{item?.user?.name || 'New user he/she not update their profile'}</option>
                                        )
                                    })}
                                </select>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Category</label>
                                <select
                                    value={form.categoryId}
                                    className="form-select"
                                    name="categoryId"
                                    onChange={handleChange}
                                >
                                    <option>Select category</option>
                                    {categories.map((item, index) => {
                                        return (
                                            <option key={index} value={item._id}>{item.name}</option>
                                        )
                                    })}
                                </select>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Amount</label>
                                <input onChange={(e) => {
                                    handleChange(e)
                                    handleOpen()
                                }}
                                    value={form.amount}
                                    type="number"
                                    name='amount'
                                    className='form-control' />
                            </div>
                            <div
                                className='d-flex justify-content-around mb-3' >
                                <span hidden={splitBox}>Equal</span>
                                <input
                                    hidden={splitBox}
                                    type='radio'
                                    value='equal'
                                    checked={splitMethod === 'equal'}
                                    onChange={handleRadioChange}
                                    onClick={toggleSplitFormEqual}
                                    className='ms-3 w-25'
                                    name='splitMethod' />
                                <span hidden={splitBox}>Un Equal</span>
                                <input
                                    hidden={splitBox}
                                    type="radio"
                                    value='unequal'
                                    checked={splitMethod === 'unequal'}
                                    onChange={handleRadioChange}
                                    onClick={toggleSplitFormUnequal}
                                    className='ms-3 w-25' name='splitMethod' />
                            </div>
                            <div ref={contentRef} className={`split-form-collapse d-flex flex-column mb-3`}>
                                {users.map((item, index) => (
                                    <div key={index} className='d-flex justify-content-between mt-3 mb-2'>
                                        <div className='w-50'>
                                            <label value={item?.user?._id}>
                                                {members[item?.user?._id] || 'New user he/she not update their profile'}
                                            </label>
                                        </div>
                                        <div className='w-50'>
                                            <input
                                                type="number"
                                                name='share'
                                                value={unequalArr?.[index]?.share}
                                                onChange={(e) => handleChange2(e, index)}
                                                className='form-control w-75' />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Description</label>
                                <textarea onChange={handleChange} value={form.description} className='form-control' name="description"></textarea>
                            </div>
                            <div className='d-flex justify-content-end'>
                                <Link
                                    className='btn btn-warning me-3'
                                    to={`/group/groupexpense?grpid=${grpId}&grpname=${grpName}&leader=${groupLeader}`}>Cancel</Link>
                                <button onClick={handleSubmit} className="btn btn-primary">
                                    Submit
                                </button>
                            </div>
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

export default AddGrpExpense
