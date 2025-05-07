import React, { useEffect, useState } from 'react'
import Header from '../../layouts/Header'
import Footer from '../../layouts/Footer'
import AsideBar from '../../layouts/AsideBar'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { getUser } from '../../components/SessionAuth'


function useQuery() {
    return new URLSearchParams(useLocation().search)
}

function AddGroup() {

    const queryValue = useQuery()
    const navigate = useNavigate()
    const user = getUser()
    const [formData, setFormData] = useState({
        grpId: '',
        grpName: '',
        createdBy: user.data._id,
    })
    const [alertBlock, setAlertBlock] = useState({
        blockState: true,
        msg: ''
    })
    const pageName = queryValue.get('mode')
    const groupId = queryValue.get('group')

    function handleOnChange(e) {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    function handleSubmit() {
        const name = formData.grpName
        const createdBy = user.data._id
        const id = formData.grpId

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const raw = JSON.stringify({
            "name": name,
            "createdBy": createdBy
        });

        const requestOptions = {

            headers: myHeaders,
            body: raw,
        };

        let request
        if (!id) {
            request = fetch(`${process.env.REACT_APP_FETCH_URL}/group`,
                { ...requestOptions, method: "POST", })
        } else {
            request = fetch(`${process.env.REACT_APP_FETCH_URL}/group/${id}`,
                { ...requestOptions, method: "PUT", })
        }
        request.then(async (response) => {
            if (response.status === 200) {
                navigate('/group')
            } else {
                const errorInfo = await response.json()
                setAlertBlock({
                    blockState: false,
                    msg: errorInfo.message
                })
            }
        });
    }

    async function handleEdit(id){
        const response = await fetch(`${process.env.REACT_APP_FETCH_URL}/group/${id}`)
        if(response.ok) {
            const groupData = await response.json()
            setFormData({
                grpId: groupData.data._id,
                grpName: groupData.data.name,
                createdBy: groupData.data.createdBy
            })
        }else {
            const errorInfo = await response.json()
            setAlertBlock({
                blockState: false,
                msg: errorInfo.message
            })
        }
    }


    useEffect(() => {
        if(groupId) {
            handleEdit(groupId)
        }
    },[groupId])
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
                    <div>
                        <h2>{pageName === 'edit' ? 'Edit Group' : 'Create Group'}</h2>
                        <div>
                            <div className="row">
                                <div className="form-group col-md-6">
                                    <label htmlFor="grpName">Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name='grpName'
                                        value={formData.grpName}
                                        onChange={handleOnChange}
                                        placeholder="Group Name" />

                                    <input
                                        type="hidden"
                                        className="form-control mt-3"
                                        value={formData.grpId}
                                        onChange={handleOnChange}
                                        name='grpId' />
                                </div>
                                <div class="form-group col-md-6">
                                    <label htmlFor="createdBy">Created By</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        onChange={handleOnChange}
                                        value={user.data.name}
                                        disabled />

                                </div>
                            </div>
                            <div
                                className='m-3 d-flex justify-content-center'
                                style={{ gap: '30px' }}>
                                <Link
                                    to='/group'
                                    className='btn btn-warning'>Back</Link>
                                <button
                                    onClick={handleSubmit}
                                    className="btn btn-primary">Submit</button>
                            </div>
                        </div>
                        <div
                            className="alert alert-danger"
                            hidden={alertBlock.blockState}>
                            {alertBlock.msg}
                        </div>
                    </div>
                    {/* footer */}
                    <footer className='text-center mt-4'>
                        <Footer />
                    </footer>
                </section>

            </main>

        </>
    )
}

export default AddGroup
