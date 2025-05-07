import React, { useEffect, useState } from 'react'
import Header from '../../layouts/Header'
import Footer from '../../layouts/Footer'
import AsideBar from '../../layouts/AsideBar'
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { Link } from 'react-router-dom';
import { getUser } from '../../components/SessionAuth';


function GroupList() {
    const [alertBlock, setAlertBlock] = useState({
        blockState: true,
        msg: ''
    })
    const [userGrps, setUserGrps] = useState([])
    const user = getUser()
    var sno = 1

    function fetchUserGrp(id) {

        fetch(`${process.env.REACT_APP_FETCH_URL}/group/usergroups/${id}`, { method: "GET" })
            .then(async (response) => {
                if (response.ok) {
                    const userGrpData = await response.json()
                    setUserGrps(userGrpData.data)
                } else {
                    const errorInfo = await response.json()
                    setAlertBlock({
                        blockState: true,
                        msg: errorInfo.message
                    })
                }
            });
    }


    function hanldeDelete(id) {
        if (window.confirm('Are you sure to delete this record ?')) {
            let request = fetch(`${process.env.REACT_APP_FETCH_URL}/group/${id}`, { method: "DELETE" })
            request.then(async (response) => {
                if (response.status === 200) {
                    fetchUserGrp()
                } else {
                    const errorInfo = await response.json()
                    setAlertBlock({
                        blockState: false,
                        msg: errorInfo.message
                    })
                }
            });
        }
    }

    useEffect(() => {
        fetchUserGrp(user.data._id)
    }, [])

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
                            to={'/addgroup'}
                            className='btn btn-primary' x>
                            Create new group
                        </Link>
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
                                <th scope='col'>Created By</th>
                                <th scope="col" className='text-center'>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {userGrps.length > 0 ? userGrps.map(userGrp => {
                                return (
                                    <tr>
                                        <th scope="row">{sno++}</th>
                                        <td>{userGrp.name}</td>
                                        <td>{userGrp.createdBy.name}</td>
                                        <td
                                            className='d-flex'
                                            style={{ gap: '30px' }}>
                                            <Link
                                                to={`/groupmembers?grpId=${userGrp._id}`}
                                                className='btn btn-warning'>
                                                View this group members
                                            </Link>
                                            <Link
                                                to={`/groupexpenses?grpId=${userGrp._id}`}
                                                className='btn btn-warning'>
                                                View this group expenses
                                            </Link>
                                            <Link
                                                to={`/editgroup?mode=edit&group=${userGrp._id}`}
                                                style={{ color: 'black', fontSize: '20px' }}>
                                                <FaEdit />
                                            </Link>
                                            <Link
                                                onClick={() => hanldeDelete(userGrp._id)}
                                                style={{ color: 'red', fontSize: '20px' }}>
                                                <MdDelete />
                                            </Link>
                                        </td>
                                    </tr>
                                )
                            }) :
                                <tr>
                                    <td
                                        colSpan={4}
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
