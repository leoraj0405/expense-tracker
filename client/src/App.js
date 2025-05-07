import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from "./pages/Login";
import Dashboard from './pages/Dashboard';
// import ErrorPage from './pages/ErrorPage';
import ParentLogin from './pages/ParentLogin';
import SignupPage from './pages/SignupPage';
import AddMyExpense from './pages/myExpenses/AddMyExpense';
import ListMyExpense from './pages/myExpenses/ListMyExpense';
import CategoryList from './pages/category/CategoryList';
import GroupList from './pages/group/GroupList';
import AddGroup from './pages/group/AddGroup';

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
        <Route path='/category' element={<CategoryList />} />
        <Route path='/editcategory' element={<CategoryList />} />
        <Route path='/group' element={<GroupList /> } />
        <Route path='/addgroup' element={<AddGroup /> } />
        <Route path='/editgroup' element={<AddGroup />} />
        {/* <Route path="/error" element={<ErrorPage />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
