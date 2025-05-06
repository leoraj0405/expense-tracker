import React, { useEffect, useState } from 'react'
import Header from '../../layouts/Header'
import Footer from '../../layouts/Footer'
import AsideBar from '../../layouts/AsideBar'
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { Link } from 'react-router-dom';
import { getUser } from '../../components/SessionAuth';


function GroupList() {
    const [groups, setGroups] = useState([])
    const [grpMembers, setGrpMembers] = useState([])
    const [alertBlock, setAlertBlock] = useState({
        blockState: true,
        msg: ''
    })
    const [currentUserGrp, setCurrentUserGrp] = useState([])
    const currentUser = getUser()

    async function fetchGroupes() {
        const response = await fetch(`${process.env.REACT_APP_FETCH_URL}/group`)
        if (response.ok) {
            const groupData = await response.json()
            setGroups(groupData.data)
        } else {
            const error = await response.json()
            setAlertBlock({
                blockState: false,
                msg: error.message
            })
        }
    }

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
        fetchGroupes()
        fetchGrpMembers()
    }, [])

    // useEffect(() => {
    //     for (let i = 0; i < groups.length; i++) {
    //         for (let j = 0; j < grpMembers.length; j++) {
    //           const group = groups[i];
    //           const member = grpMembers[j];
          
    //           if (
    //             group.members.includes(member._id) && 
    //             group.members.includes(currentUser._id)
    //           ) {
    //             setCurrentUserGrp(group);
    //           }
    //         }
    //       }
          
    // }, [groups, grpMembers])

    setTimeout(() => {
        setAlertBlock({
            blockState: true,
            msg: ''
        })
    }, 5000)

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
                                <th scope="col">CreatedBy</th>
                                <th scope="col">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <th scope="row">1</th>
                                <td>Mark</td>
                                <td>Otto</td>
                                <td>
                                    <Link
                                        style={{ color: 'black' }}>

                                        <FaEdit />
                                    </Link> ||
                                    <Link
                                        style={{ color: 'red' }}>
                                        <MdDelete />
                                    </Link>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">2</th>
                                <td>Jacob</td>
                                <td>Thornton</td>
                                <td>@fat</td>
                            </tr>
                            <tr>
                                <th scope="row">3</th>
                                <td>Larry</td>
                                <td>the Bird</td>
                                <td>@twitter</td>
                            </tr>
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
