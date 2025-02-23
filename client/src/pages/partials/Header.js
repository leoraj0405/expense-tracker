import React from "react";
import { IoLogoBitcoin } from "react-icons/io";
import { Navbar, Container, NavDropdown } from "react-bootstrap";
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
                                <NavDropdown.Item href="/profile">Profile</NavDropdown.Item>
                                <NavDropdown.Item href="/login">Logout</NavDropdown.Item>
                            </NavDropdown>
                        </Navbar.Text>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </>
    );
}

export default Header;