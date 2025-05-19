import React, { useEffect, useState } from 'react'
import '../style/Dashboard.css'
import { useNavigate } from 'react-router-dom';
import Header from '../layouts/Header';
import SideBar from '../layouts/SideBar';
import Footer from '../layouts/Footer';
import { Link, } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'
import { useUser } from '../components/Context';



function Dashboard() {
  const navigate = useNavigate()
  const [data, setData] = useState([])
  const [amount, setAmount] = useState(0)
  const { loginUser, setLoginUser } = useUser();
  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#a4de6c"];

  async function handleIsLogged() {
    const response = await fetch(`${process.env.REACT_APP_FETCH_URL}/user/home`, {
      method: 'GET',
      credentials: 'include',
    });
    if (response.status === 200) {
      const userData = await response.json()
      setLoginUser(userData)
    } else {
      setLoginUser([])
      navigate('/login')
    }
  }
  
  async function fetchThisMonthExpense() {
    const todayDate = new Date()
    const year = todayDate.getFullYear();
    const month = todayDate.getMonth() + 1;
    const day = todayDate.getDate();
    const formattedDate = `${year}-${month}-${day}`;
    let response

    if (loginUser?.data?._id) {
      response = await fetch(`${process.env.REACT_APP_FETCH_URL}/expense/userexpense/${loginUser.data._id}?date=${formattedDate}`)
    }
    if (response && response.status === 200) {
      const expenseData = await response.json()
      const result = expenseData.data.userExpenseData.map((item) => ({
        name: item.description,
        value: item.amount
      }))
      setData(result)
    } else {
      setData([])
    }
  }

  useEffect(() => {
    handleIsLogged();
  }, []);

  useEffect(() => {
    if (loginUser) {
      fetchThisMonthExpense();
    }
  }, [loginUser]);

  useEffect(() => {
    if (data.length > 0) {
      let total = 0;
      data.forEach(item => {
        total += Number(item.value);
      });
      setAmount(total);
    } else {
      setAmount(0)
    }
  }, [data])
  const date = new Date();
  const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

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
            <nav className='m-4'>
              <ol className="breadcrumb">
                <li className="breadcrumb-item"><Link className='text-secondary' to="/home">Home</Link></li>
              </ol>
            </nav>
            <div className='container mt-3'>
              <h1 className='ms-2'>Welcome Buddy !</h1>
              <p className='ms-2'>Track your spending. Control your future.</p>
              <div className='row mt-3' style={{ gap: '50px' }}>
                <div className='col-lg'>
                  <div className="container">
                    <div className="rowcolumn">
                      <div className="col-lg ">
                        <div class="card  boxshadow p-3 mb-5 bg-white rounded text-center" >
                          <div class="card-body">
                            <h5 class="card-title">Month Total Expenses</h5>
                            <p class="card-text">₹ {amount}</p>
                            <Link to={`/thismonthexpense?date=${yearMonth}`} class="btn btn-primary">See This month Expenses</Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='chart col-lg boxshadow'>
                  <div className="w-full max-w-md mx-auto p-4 bg-white shadow-md rounded-2xl text-center">
                    <h2 className="text-xl font-semibold text-center mb-4">This month Expenses Chart</h2>
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
                          {data.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </div>
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
    </>
  )
}

export default Dashboard
