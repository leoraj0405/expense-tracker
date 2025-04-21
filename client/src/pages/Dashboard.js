import React, { useEffect } from 'react'
import '../style/Dashboard.css'
import AsideBar from '../layouts/AsideBar';
import Header from '../layouts/Header';
import Footer from '../layouts/Footer';
import { Link, useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { getUser, getToken } from '../components/SessionAuth';


function Dashboard() {
  const isLogged = getToken()
  const user = getUser()
  const navigate = useNavigate()
  console.log(user)
  useEffect(() => {
    if (!isLogged) {
      navigate('/login')
    }
  }, [isLogged, navigate])
  const data = [
    { name: "Rent", value: 1200 },
    { name: "Food", value: 500 },
    { name: "Transport", value: 200 },
    { name: "Entertainment", value: 300 },
    { name: "Other", value: 150 },
  ];
  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#a4de6c"];

  return (
    <>
      <header className='header d-flex justify-content-between text-white'>
        <Header />
      </header>

      <main className='d-flex justify-content-start'>
        <aside className='w-25'>
          <AsideBar />
        </aside>

        <section className='p-5 w-100'>
          {/* Body content */}
          <div className='container'>
            <div className='row' style={{ gap: '50px' }}>
              <div className='col-lg'>
                <div className="container">
                  <div className="rowcolumn">
                    <div className="col-lg ">
                      <div class="card  shadow-sm p-3 mb-5 bg-white rounded text-center" >
                        <div class="card-body">
                          <h5 class="card-title">Today Total Expenses</h5>
                          <p class="card-text">₹ 1000</p>
                          <Link to="/login" class="btn btn-primary">See Today Expenses</Link>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg ">
                      <div className="col-lg ">
                        <div class="card shadow-sm p-3 mb-5 bg-white rounded text-center" >
                          <div class="card-body">
                            <h5 class="card-title">This month balance Amount</h5>
                            <p class="card-text">₹ 10000</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className='chart col-lg'>
                <div className="w-full max-w-md mx-auto p-4 bg-white shadow-md rounded-2xl">
                  <h2 className="text-xl font-semibold text-center mb-4">Monthly Expenses</h2>
                  <PieChart width={300} height={300}>
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
          {/* footer */}
          <footer className='text-center mt-4'>
            <Footer />
          </footer>
        </section>

      </main>

    </>
  )
}

export default Dashboard
