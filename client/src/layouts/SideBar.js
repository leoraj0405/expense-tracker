import React from "react";
import { Link } from "react-router-dom";
import { GiExpense } from "react-icons/gi";
import { MdOutlineCategory } from "react-icons/md";
import { MdGroups2 } from "react-icons/md";
import Logo from '../assets/img/websiteLogo.png'

const SideBar = () => {
  return (
    <div className="d-flex flex-column h-100 p-2 bg-warning" style={{ width: "220px" }}>
      <ul className="nav nav-pills flex-column">
        <li className="nav-item mb-2 d-flex justify-content-around align-items-center">
          <img src={Logo} alt="Logo" width="60" height="60" className="d-inline-block align-top me-2" />
          <strong><h3>ET</h3></strong>
        </li>
        <hr />
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
        <li className="nav-item mb-2">
          <Link to="/group" className="nav-link text-dark">
            <MdGroups2 className="me-2" /> Group
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default SideBar;
