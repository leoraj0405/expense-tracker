import React from "react";
import Header from "./partials/Header";
import SideBar from "./partials/SideBar";
import Footer from "./partials/Footer";
import { Card, Container, Row, Col } from "react-bootstrap";

function Dashboard() {
    return (
        <>
            {/* header */}
            <Header />

            <div style={{ display: "flex", flex: 1 }}>
                {/* Sidebar */}
                <SideBar />
                <main style={{ flex: 1, padding: "20px", backgroundColor: "#f8f9fa" }}>
                    {/* main content */}
                    <h2>Main Content</h2>
                    <Container>
                        <Row>
                            <Col>    <Card>
                                <Card.Header>Quote</Card.Header>
                                <Card.Body>
                                    <blockquote className="blockquote mb-0">
                                        <p>
                                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer
                                            posuere erat a ante.
                                        </p>
                                        <footer className="blockquote-footer">
                                            Someone famous in <cite title="Source Title">Source Title</cite>
                                        </footer>
                                    </blockquote>
                                </Card.Body>
                            </Card>
                            </Col>
                            <Col>    <Card>
                                <Card.Header>Quote</Card.Header>
                                <Card.Body>
                                    <blockquote className="blockquote mb-0">
                                        <p>
                                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer
                                            posuere erat a ante.
                                        </p>
                                        <footer className="blockquote-footer">
                                            Someone famous in <cite title="Source Title">Source Title</cite>
                                        </footer>
                                    </blockquote>
                                </Card.Body>
                            </Card>
                            </Col>
                        </Row>
                    </Container>
                    {/* Footer */}
                    <Footer />
                </main>
            </div >


        </>
    )
}

export default Dashboard
