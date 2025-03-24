import React from 'react'
import '../style/Dashboard.css'
import AsideBar from '../layouts/AsideBar';
import Header from '../layouts/Header';
import Footer from '../layouts/Footer';
import { Link } from 'react-router-dom';


function Dashboard() {
  return (
    <>
      <header className='header d-flex justify-content-between text-white'>
        <Header />
      </header>

      <main className='d-flex justify-content-start'>

        <aside className='w-25'>
          <AsideBar />
        </aside>

        <section className='p-5'>
          {/* Body content */}

          <div className="container">
            <div className="row">
              <div className="col-lg ">
                <div class="card text-center" style={{ width: "18rem;" }}>
                  <div class="card-body">
                    <h5 class="card-title">Special title treatment</h5>
                    <p class="card-text">With supporting text below as a natural lead-in to additional content.</p>
                    <Link to="/login" class="btn btn-primary">Go somewhere</Link>
                  </div>
                </div>
              </div>
              <div className="col-lg ">
                <div className="col-lg ">
                  <div class="card text-center" style={{ width: "18rem;" }}>
                    <div class="card-body">
                      <h5 class="card-title">Special title treatment</h5>
                      <p class="card-text">With supporting text below as a natural lead-in to additional content.</p>
                      <Link to="/login" class="btn btn-primary">Go somewhere</Link>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg ">
                <div className="col-lg ">
                  <div class="card text-center" style={{ width: "18rem;" }}>
                    <div class="card-body">
                      <h5 class="card-title">Special title treatment</h5>
                      <p class="card-text">With supporting text below as a natural lead-in to additional content.</p>
                      <Link to="/login" class="btn btn-primary">Go somewhere</Link>
                    </div>
                  </div>
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
