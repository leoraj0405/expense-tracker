import React from "react";
import { IoLogoBitcoin } from "react-icons/io";
import { Navbar, Container, NavDropdown } from "react-bootstrap";
import { Link, Outlet } from 'react-router-dom'
function Header() {
    return (
        <>
            <Navbar bg="primary" data-bs-theme="dark">
                <Container>
                    <Navbar.Brand href="/home">
                        <IoLogoBitcoin />
                        Expense Tracker
                    </Navbar.Brand>
                    <Navbar.Collapse className="justify-content-end">
                        <Navbar.Text style={{ display: 'flex', gap: '10px' }}>
                            <p>Signed in as:</p>
                            <NavDropdown title="Leo Raj" id="basic-nav-dropdown">
                                <NavDropdown.Item><Link to='/profile'>Profile</Link></NavDropdown.Item>
                                <NavDropdown.Item><Link to='/login'>Logout</Link></NavDropdown.Item>
                            </NavDropdown>
                        </Navbar.Text>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <Outlet />
        </>
    );
}

export default Header;