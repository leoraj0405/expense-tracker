import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ParentLogin from './pages/ParentLogin';
import SignupPage from './pages/SignupPage';
import AddMyExpense from './pages/myExpenses/AddMyExpense';
import ListMyExpense from './pages/myExpenses/ListMyExpense';
import CategoryList from './pages/category/CategoryList';
import AddCategory from './pages/category/AddCategory';
import GroupList from './pages/group/GroupList';
import AddGroup from './pages/group/AddGroup';
import GrpMember from './pages/grpMember/GrpMember';
import AddGrpMember from './pages/grpMember/AddGrpMember';
import GrpExpense from './pages/grpExpense/GrpExpense';
import AddGrpExpense from './pages/grpExpense/AddGrpExpense';
import Profile from './pages/Profile';
import ParentHome from './pages/ParentHome';
import ForgetPassword from './pages/ForgetPassword';
import Settlements from './pages/group/Settlements';

function NavigateToLogin() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('login');
  });
  return null;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<NavigateToLogin />} />
        <Route path="/login" element={<Login />} />
        <Route path="/parentlogin" element={<ParentLogin />} />
        <Route path="/parenthome" element={<ParentHome />} />
        <Route path="/home" element={<Dashboard />} />
        <Route path="/registration" element={<SignupPage />} />
        <Route path="/expense" element={<ListMyExpense />} />
        <Route path="/expense/addexpense" element={<AddMyExpense />} />
        <Route path="/editexpense" element={<AddMyExpense />} />
        <Route path="/category" element={<CategoryList />} />
        <Route path="/category/addcategory" element={<AddCategory />} />
        <Route path="/category/editcategory/:id" element={<AddCategory />} />
        <Route path="/group" element={<GroupList />} />
        <Route path="/group/addgroup" element={<AddGroup />} />
        <Route path="/group/editgroup" element={<AddGroup />} />
        <Route path="/group/groupmember" element={<GrpMember />} />
        <Route path="/group/groupmember/addgroupmember" element={<AddGrpMember />} />
        <Route path="/group/groupmember/editgroupmember" element={<AddGrpMember />} />
        <Route path="/group/groupexpense" element={<GrpExpense />} />
        <Route path="/group/groupexpense/addgroupexpense" element={<AddGrpExpense />} />
        <Route path="/group/groupexpense/editgroupexpense" element={<AddGrpExpense />} />
        <Route path="/group/settlement" element={<Settlements />} />
        <Route path="/userprofile" element={<Profile />} />
        <Route path="/forgetpassword" element={<ForgetPassword />} />
      </Routes>
    </Router>
  );
}

export default App;
