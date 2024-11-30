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
    customer_name_marathi: "",
    city_english: "",
    city_marathi: "",
    address_english: "",
    address_marathi: "",
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
        console.log('call')
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
    <Modal show={show} onHide={closeModal} size="lg">
      {error && <Alert variant="danger">{error}</Alert>}
      <Modal.Header closeButton>
        <Modal.Title>Customer Form</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={4}>
              <Form.Group controlId="formCode">
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
            </Col>
          </Row>
          <Row className="mb-3">
            <Col>
              <Form.Group controlId="formCustomerNameEnglish">
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
            </Col>
            <Col>
              <Form.Group controlId="formCustomerNameMarathi">
                <Form.Label>Customer Name in Hindi</Form.Label>
                <FormControl
                  type="text"
                  name="customer_name_marathi"
                  placeholder="Enter customer name in Hindi"
                  value={formData.customer_name_marathi}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col>
              <Form.Group controlId="formCityInEnglish">
                <Form.Label>City in English</Form.Label>
                <Form.Control
                  type="text"
                  name="city_english"
                  placeholder="Enter city in English"
                  value={formData.city_english}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId="formCityInMarathi">
                <Form.Label>City in Marathi</Form.Label>
                <Form.Control
                  type="text"
                  name="city_marathi"
                  placeholder="Enter city in Marathi"
                  value={formData.city_marathi}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col>
              <Form.Group controlId="formAddressEnglish">
                <Form.Label>Address in English</Form.Label>
                <FormControl
                  type="text"
                  name="address_english"
                  placeholder="Enter Address in English"
                  value={formData.address_english}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId="formAddressMarathi">
                <Form.Label>Address in Hindi</Form.Label>
                <FormControl
                  type="text"
                  name="address_marathi"
                  placeholder="Enter Address in Marathi"
                  value={formData.address_marathi}
                  onChange={handleChange}
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
