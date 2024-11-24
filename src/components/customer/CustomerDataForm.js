import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Col,
  Form,
  FormControl,
  Modal,
  Row,
} from "react-bootstrap";

const customerDataForm = ({ show, closeModal, editData, editFlag }) => {
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    code: "",
    customer_name_english: "",
    customer_name_hindi: "",
    city: "",
  });
  useEffect(() => {
    if (editFlag) {
      setFormData(editData);
    }
  }, [editData]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    let result;
    try {
      if (editFlag) {
        result = await window.electronAPI.updateCustomerData(formData);
      } else {
        result = await window.electronAPI.addCustomerData(formData);
      }
      closeModal();
      // setMessage(result); // Shows either success or error message from main process
    } catch {
      setError("Error: Could not add customer.");
      console.error(error);
    }
    console.log(formData, result);
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  return (
    <Modal show={show} onHide={closeModal}>
      {error && <Alert variant="danger">{error}</Alert>}
      <Modal.Header closeButton>
        <Modal.Title>Customer Form</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col>
              <Form.Group controlId="formCode" className="mb-3">
                <Form.Label>Code</Form.Label>
                <Form.Control
                  type="text"
                  name="code"
                  placeholder="Enter Code"
                  value={formData.code}
                  onChange={handleChange}
                  disabled={editFlag}
                  required
                />
              </Form.Group>
              <Form.Group controlId="formCustomerNameEnglish" className="mb-3">
                <Form.Label>Customer Name in English</Form.Label>
                <FormControl
                  type="text"
                  name="customer_name_english"
                  placeholder="Enter customer name in English"
                  value={formData.customer_name_english}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Form.Group controlId="formCustomerNameHindi" className="mb-3">
                <Form.Label>Customer Name in Hindi</Form.Label>
                <FormControl
                  type="text"
                  name="customer_name_hindi"
                  placeholder="Enter customer name in Hindi"
                  value={formData.customer_name_hindi}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group controlId="formCity">
                <Form.Label>City</Form.Label>
                <Form.Control
                  type="text"
                  name="city"
                  placeholder="Enter city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          <Button variant="primary" type="submit">
            {editFlag ? "Update" : "Submit"} Form
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default customerDataForm;
