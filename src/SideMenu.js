import React, { useState } from "react";
import { Button, ListGroup, Offcanvas } from "react-bootstrap";
import { BoxArrowRight, CloudArrowUpFill } from "react-bootstrap-icons";

const SideMenu = ({ menuOpen, toggleMenu, showMenu, logout }) => {
  const [role, setRole] = useState(localStorage.getItem("userRole"));
  const backupDB = () => {
    window.electronAPI.backupDatabase();
  };
  return (
    <Offcanvas show={menuOpen} onHide={toggleMenu} placement="start">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Menu</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <ListGroup variant="flush">
          <ListGroup.Item action onClick={() => showMenu("dashboard")}>
            Dashboard
          </ListGroup.Item>
          <ListGroup.Item action onClick={() => showMenu("transportReport")}>
            Reports
          </ListGroup.Item>
          {role === "admin" && (
            <>
              <ListGroup.Item action onClick={() => showMenu("customerData")}>
                Customer Data
              </ListGroup.Item>
              <ListGroup.Item action onClick={() => showMenu("transportData")}>
                Transport Data
              </ListGroup.Item>
              <ListGroup.Item
                style={{ marginTop: "10rem" }}
                className="d-grid gap-2"
              >
                <Button variant="outline-dark" onClick={backupDB}>
                  <CloudArrowUpFill /> Backup Database
                </Button>
              </ListGroup.Item>
            </>
          )}
          <ListGroup.Item onClick={() => logout()} className="d-grid gap-2">
            <Button variant="outline-dark">
              <BoxArrowRight /> Logout
            </Button>
          </ListGroup.Item>
        </ListGroup>
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default SideMenu;
