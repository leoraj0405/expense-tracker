import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from "./pages/Login";
import Dashboard from './pages/Dashboard';
import ParentLogin from './pages/ParentLogin';
import SignupPage from './pages/SignupPage';
import AddMyExpense from './pages/myExpenses/AddMyExpense';
import ListMyExpense from './pages/myExpenses/ListMyExpense';
import CategoryList from './pages/category/CategoryList';
import GroupList from './pages/group/GroupList';
import AddGroup from './pages/group/AddGroup';
import GrpMember from './pages/grpMember/GrpMember';
import AddGrpMember from './pages/grpMember/AddGrpMember';
import GrpExpense from './pages/grpExpense/GrpExpense';
import AddGrpExpense from './pages/grpExpense/AddGrpExpense';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/parentlogin' element={<ParentLogin />} />
        <Route path='/home' element={<Dashboard />} />
        <Route path='/registration' element={<SignupPage/>} />
        <Route path='/expense' element={<ListMyExpense />} />
        <Route path='/thismonthexpense' element={<ListMyExpense />} />
        <Route path='/addexpense' element={<AddMyExpense />} />
        <Route path='/editexpense' element={<AddMyExpense />} />
        <Route path='/category' element={<CategoryList />} />
        <Route path='/group' element={<GroupList />} />
        <Route path='/addgroup' element={<AddGroup />} />
        <Route path='/editgroup' element={<AddGroup />} />
        <Route path='/groupmember' element={<GrpMember />} />
        <Route path='/addgroupmember' element={<AddGrpMember />} />
        <Route path='/editgroupmember' element={<AddGrpMember />} />
        <Route path='/groupexpense' element={<GrpExpense />} />
        <Route path='/addgroupexpense' element={<AddGrpExpense />} />
        <Route path='/editgroupexpense' element={<AddGrpExpense />} />
        <Route path='/userprofile' element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;
