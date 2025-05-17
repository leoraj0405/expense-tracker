import React, { useEffect, useState } from 'react'
import Header from '../../layouts/Header'
import Footer from '../../layouts/Footer'
import SideBar from '../../layouts/SideBar'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useUser } from '../../components/Context'

function useQuery() {
    return new URLSearchParams(useLocation().search)
}

function AddGroup() {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    const { loginUser } = useUser()
    const queryValue = useQuery()
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        grpId: '',
        grpName: '',
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
        const createdBy = loginUser?.data?._id
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
                if (pageName === 'edit') {
                    navigate('/group')
                }
                const postGrpData = await response.json()
                const groupId = postGrpData?.data?._id;

                const raw = JSON.stringify({
                    groupId,
                    userId: loginUser?.data?._id
                });

                const requestOptions = {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json"
                    },
                    body: raw,
                  };
                  

                console.log(requestOptions)
                fetch(`${process.env.REACT_APP_FETCH_URL}/groupmember`, requestOptions)
                    .then(async (response2) => {
                        if (response2.status === 200) {
                            navigate('/group')
                        } else {
                            const errorInfo = await response2.json()
                            console.log(errorInfo)

                            setAlertBlock({
                                blockState: false,
                                msg: errorInfo.message
                            })
                        }
                    });
            } else {
                const errorInfo = await response.json()
                setAlertBlock({
                    blockState: false,
                    msg: errorInfo.message
                })
            }
        });
    }

    async function handleEdit(id) {
        const response = await fetch(`${process.env.REACT_APP_FETCH_URL}/group/${id}`)
        if (response.ok) {
            const groupData = await response.json()
            setFormData({
                grpId: groupData.data._id,
                grpName: groupData.data.name,
                createdBy: groupData.data.createdBy
            })
        } else {
            const errorInfo = await response.json()
            setAlertBlock({
                blockState: false,
                msg: errorInfo.message
            })
        }
    }

    useEffect(() => {
        if (groupId) {
            handleEdit(groupId)
        }
    }, [groupId])
    setTimeout(() => {
        setAlertBlock({
            blockState: true,
            msg: ''
        })
    }, 10000)
    return (
        <>
            <header>
                <Header />
            </header>
            <div className='d-flex'>
                <aside>
                    <SideBar />
                </aside>
                <main className='p-3 w-100 bg-light'>
                    <section className='main' style={{ minHeight: '400px' }}>

                        <nav className='m-4'>
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item"><Link className='text-secondary' to="/home">Home</Link></li>
                                {pathnames.map((item, index) => {
                                    const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                                    const label = item === 'addgroup' ? 'Add group' : item === 'editgroup' ? 'Edit group' : item
                                    return (
                                        <li className="breadcrumb-item"><Link className='text-secondary' to={to}>{label}</Link></li>
                                    )
                                })}
                            </ol>
                        </nav>

                        <div
                            className="alert alert-danger m-4"
                            hidden={alertBlock.blockState}>
                            {alertBlock.msg}
                        </div>

                        <div className='m-4'>
                            <h2>{pageName === 'edit' ? 'Edit Group' : 'Create Group'}</h2>
                            <div className='w-50'>
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
                                <div
                                    className='m-3 d-flex justify-content-start'
                                    style={{ gap: '30px' }}>
                                    <button
                                        onClick={handleSubmit}
                                        className="btn btn-primary">Submit</button>
                                </div>
                            </div>
                        </div>
                    </section>
                    <footer>
                        <Footer />
                    </footer>
                </main>
            </div>
        </>)
}

export default AddGroup
