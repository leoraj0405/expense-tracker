import React from "react";
import { Link } from "react-router-dom";
import { GiExpense } from "react-icons/gi";
import { MdOutlineCategory } from "react-icons/md";
import { MdGroups2 } from "react-icons/md";



const SideBar = () => {
  return (
    <div className="d-flex flex-column h-100 p-2 bg-warning" style={{ width: "250px" }}>
      <ul className="nav nav-pills flex-column">
        <li className="nav-item mb-2">
          <Link to="/home" className="nav-link text-dark">
            <i className="bi bi-house me-2"></i> Home
          </Link>
        </li>
        <li className="nav-item mb-2">
          <Link to="/expense" className="nav-link text-dark">
            <GiExpense className="me-2" />Expenses
          </Link>
        </li>
        <li className="nav-item mb-2">
          <Link to="/category" className="nav-link text-dark">
            <MdOutlineCategory className="me-2" />Category
          </Link>
        </li>

        <li className="nav-item dropdown">
          <Link className="nav-link dropdown-toggle text-dark" to="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            <MdGroups2 className="me-2"/> Group
          </Link>
          <ul className="dropdown-menu">
          <li><Link className="dropdown-item" to="/group">My groups list</Link></li>
            <li><Link className="dropdown-item" to="/groupexpenses">Group Expenses</Link></li>
            <li><Link className="dropdown-item" to="/groupmember">Group Members</Link></li>
          </ul>
        </li>
      </ul>
    </div>
  );
};

export default SideBar;
