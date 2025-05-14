import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { IoMdArrowDropdown } from "react-icons/io";
import '../style/AsideBar.css'

function AsideBar() {
    const [showList, setShowList] = useState(false)

    function handleShowList() {
        if (showList) {
            setShowList(false)
        } else {
            setShowList(true)
        }
    }

    return (
        <>
            <nav>
                <ul className='ul p-2 vh-100'>
                    <li><Link
                        to='/home'
                        className='li-a text-dark'>DashBoard </Link></li>
                    <li><Link
                        className='li-a text-dark'
                        to='/myexpense'>My Expense </Link></li>
                    <li><Link
                        className='li-a text-dark'
                        to='/category'>Category </Link></li>
                    <li>
                        <span 
                        className='li-a text-dark'>
                            Group
                            <button
                                className='btn'
                                onClick={handleShowList}>
                                <IoMdArrowDropdown />
                            </button>
                        </span>
                    </li>
                    <li
                        className={showList ? '' : 'd-none'}>
                        <Link
                            to='/group'
                            className='li-a text-dark' >Group List</Link>
                    </li>
                    <li
                        to='/groupmember'
                        className={showList ? '' : 'd-none'}>
                        <Link className='li-a text-dark'>Group Members</Link>
                    </li>
                    <li
                        className={showList ? '' : 'd-none'}>
                        <Link className='li-a text-dark'>Group Expense</Link>
                    </li>
                    <li><Link className='li-a text-dark'>About us</Link></li>
                </ul>
            </nav>
        </>
    )
}

export default AsideBar
