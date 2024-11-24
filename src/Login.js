import React, { useState } from "react";
import { Alert, Button, Card, Form } from "react-bootstrap";

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState(null);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(false);
    try {
      const result = await window.electronAPI.loginUser(username, password);
      if (result.success) {
        setShowSuccess(true);
        setTimeout(() => {
          onLogin(result.role);
        }, 1000);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("An error occurred during login");
    }
  };
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#21D4FD",
        backgroundImage: "linear-gradient(19deg, #21D4FD 0%, #B721FF 100%)",
      }}
    >
      <Card
        style={{
          backgroundColor: "#f0f0f0",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Card.Title>Login Form</Card.Title>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formUserName">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter Username"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Submit
            </Button>
            {error && <Alert variant="danger" className="m-2">{error}</Alert>}
            {showSuccess && <Alert variant="success" className="m-2">Login Successfully</Alert>}
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Login;
