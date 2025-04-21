import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from "./pages/Login";
import Dashboard from './pages/Dashboard';
// import ErrorPage from './pages/ErrorPage';
import ParentLogin from './pages/ParentLogin';
import SignupPage from './pages/SignupPage';
import AddMyExpense from './pages/myExpenses/AddMyExpense';
import ListMyExpense from './pages/myExpenses/ListMyExpense';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/parentlogin' element={<ParentLogin />} />
        <Route path='/home' element={<Dashboard />} />
        <Route path='/registration' element={<SignupPage />} />
        <Route path='/addmyexpense' element={<AddMyExpense/>} />
        <Route path='/myexpense' element={<ListMyExpense />} />
        <Route path='/editexpense' element={<AddMyExpense />} />
        {/* <Route path="/error" element={<ErrorPage />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
