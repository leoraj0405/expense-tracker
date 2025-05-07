import React, { useEffect, useState } from 'react'
import Header from '../../layouts/Header'
import Footer from '../../layouts/Footer'
import AsideBar from '../../layouts/AsideBar'
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { Link } from 'react-router-dom';
import { getUser } from '../../components/SessionAuth';


function GroupList() {
    const [grpMembers, setGrpMembers] = useState([])
    const [alertBlock, setAlertBlock] = useState({
        blockState: true,
        msg: ''
    })
    const [userGrps, setUserGrps] = useState([])
    const currentUser = getUser()
    var sno = 1


    async function fetchGrpMembers() {
        const response = await fetch(`${process.env.REACT_APP_FETCH_URL}/groupmember`)
        if (response.ok) {
            const grpMemberData = await response.json()
            setGrpMembers(grpMemberData.data)
        } else {
            const error = await response.json()
            setAlertBlock({
                blockState: false,
                msg: error.message
            })
        }
    }

    useEffect(() => {
        fetchGrpMembers()
    }, [])

    useEffect(() => {
        if (!currentUser?.data?._id || grpMembers.length === 0) return;

        const matches = grpMembers.filter(
            (grpMember) => grpMember.userId._id === currentUser.data._id
        );

        setUserGrps(matches);
    }, [grpMembers, currentUser]);

    useEffect(() => {
        setTimeout(() => {
            setAlertBlock({
                blockState: true,
                msg: ''
            })
        }, 5000)
    }, [alertBlock])

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

                    <div className='d-flex justify-content-end'>
                        <Link
                        to='/addgroup'
                        className='btn btn-primary'>Create new group</Link>
                    </div>

                    <div
                        className="alert alert-danger"
                        hidden={alertBlock.blockState}>
                        {alertBlock.msg}
                    </div>

                    <h2>Your group list</h2>

                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th scope="col">Sno</th>
                                <th scope="col">Group Name</th>
                                <th scope="col" className='text-center'>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {userGrps.length > 0 ? userGrps.map(userGrp => {
                                return (
                                    <tr>
                                        <th scope="row">{sno++}</th>
                                        <td>{userGrp.groupId.name}</td>
                                        <td 
                                        className='d-flex'
                                        style={{gap: '30px'}}>
                                            <Link
                                                to={`${userGrp.groupId._id}/groupmembers`}
                                                className='btn btn-warning'>
                                                View this group members
                                            </Link>
                                            <Link
                                                to={`${userGrp.groupId._id}/groupexpenses`}
                                                className='btn btn-warning'>
                                                View this group expenses
                                            </Link>
                                            <Link
                                                style={{ color: 'black', fontSize: '20px' }}>
                                                <FaEdit />
                                            </Link> 
                                            <Link
                                                style={{ color: 'red', fontSize: '20px' }}>
                                                <MdDelete />
                                            </Link>
                                        </td>
                                    </tr>
                                )
                            }) :
                                <tr>
                                    <td
                                        colSpan={3}
                                        className='text-center text-secondary'>
                                        No Groups founded
                                    </td>
                                </tr>}
                        </tbody>
                    </table>

                    {/* footer */}
                    <footer className='text-center mt-4'>
                        <Footer />
                    </footer>
                </section>

            </main>

        </>
    )
}

export default GroupList
