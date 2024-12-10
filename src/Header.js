import React from "react";
import { Button, Container, Navbar } from "react-bootstrap";
import { Robot } from "react-bootstrap-icons";

const Header = ({toggleMenu}) => {
  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
      <Container fluid>
        <Button variant="outline-light" onClick={toggleMenu}>
          <span>&#9776;</span> {/* Unicode for hamburger icon */}
        </Button>
        <Navbar.Brand className="ms-3 fst-italic" ><Robot/> TRACKYBOT</Navbar.Brand>
      </Container>
    </Navbar>
  );
};

export default Header;
