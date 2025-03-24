import React from 'react'
import { Link } from 'react-router-dom'
import { IoMdArrowDropdown } from "react-icons/io";
import '../style/AsideBar.css'


function AsideBar() {
    return (
        <>
            <nav>
                <ul className='ul'>
                    <li><Link className='li-a text-dark'>DashBoard </Link></li>
                    <li><Link className='li-a text-dark'>My Expense </Link></li>
                    <li><Link className='li-a text-dark'>Category </Link></li>
                    <li><Link className='li-a text-dark'>Group <button className='btn'><IoMdArrowDropdown /></button></Link></li>
                    <li><Link className='li-a text-dark'>Group List</Link></li>
                    <li><Link className='li-a text-dark'>Group Members</Link></li>
                    <li><Link className='li-a text-dark'>Group Expense</Link></li>
                    <li><Link className='li-a text-dark'>About us</Link></li>
                </ul>
            </nav>
        </>
    )
}

export default AsideBar
