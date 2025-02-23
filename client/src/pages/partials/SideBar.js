import React from "react";
import { FaHome } from "react-icons/fa";
import { FaPeopleGroup } from "react-icons/fa6";
import { Navbar, Container } from "react-bootstrap";

function SideBar() {
  return (
    <>
      <Navbar
        bg="primary"
        data-bs-theme="dark"
        className="flex-column"
        style={{ width: "250px", padding: "15px", height: "100vh" }}>
        <Container className="flex-column">
          <Navbar.Brand href="#home">
            <FaHome /> Home
          </Navbar.Brand>
          <Navbar.Brand href="#home">
            <FaPeopleGroup /> Group
          </Navbar.Brand>
        </Container>
      </Navbar>
    </>
  )
}

export default SideBar
