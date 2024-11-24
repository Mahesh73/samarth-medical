import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Button,
  Col,
  Container,
  Dropdown,
  Form,
  FormControl,
  Modal,
  Row,
} from "react-bootstrap";
import _ from "lodash";
import { toast } from "react-toastify";
import Select from "react-select";

const ModelForm = ({ show, closeModal, editData, editFlag }) => {
  const [formData, setFormData] = useState({
    customerCode: "",
    invoice: "",
    partyName: "",
    billValue: "",
    description: "",
  });
  const dropdownRef = useRef(null);
  const [error, setError] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [partyNameFilterList, setPartyNameFilterList] = useState([]);
  const [showPartyNameDropdown, setShowPartyNameDropdown] = useState(false);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [city, setCity] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [transportOptions, setTransportOptions] = useState([]);
  const [selectedTransports, setSelectedTransports] = useState([]);

  useEffect(() => {
    if (editFlag && editData?.invoice) {
      console.log(editData);
      setTimeout(() => {
        editData.invoice = JSON.parse(editData.invoice)
          .toString()
          .replace(/,/g, ", ");
        setFormData(editData);
        setCustomerName(editData?.customerName);
        setCity(editData?.city);
        setSelectedTransports(editData?.transportName);
      }, 500);
    } else {
      setFormData({
        customerCode: "",
        invoice: "",
        partyName: "",
        billValue: "",
        description: "",
      });
      setCustomerName("");
      setCity("");
    }
  }, [editData]);

  useEffect(() => {
    setFormData({
      customerCode: "",
      invoice: "",
      partyName: "",
      billValue: "",
      description: "",
    });
    setCustomerName("");
    setCity("");
    window.electronAPI.getCustomerData().then((res) => setCustomers(res));
    window.electronAPI.getTransportData().then((data) => {
      const options = data.map((item) => ({
        value: `${item.transport_name_english} / ${item.transport_name_hindi}`,
        label: `${item.transport_name_english} / ${item.transport_name_hindi}`,
      }));
      setTransportOptions(options);
    });
  }, [!editFlag]);

  const partyNameChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (value) {
      const search = customers
        .filter(
          (item) =>
            item.code.toLowerCase().includes(value.toLowerCase()) ||
            item?.customer_name_english
              ?.toLowerCase()
              .includes(value.toLowerCase())
        )
        .slice(0, 20);
      setPartyNameFilterList(search);
      setShowPartyNameDropdown(true);
    }
  };

  const onCustomerNameInputChange = (e) => {
    if (e.target.value) {
      setCustomerName(e.target.value);
      const filtered = customers
        .filter((customer) =>
          customer?.customer_name_english
            ?.toLowerCase()
            .includes(e.target.value.toLowerCase())
        )
        .slice(0, 20);
      setFilteredCustomers(filtered);
      setShowCustomerDropdown(true);
    } else {
      setCustomerName("");
      setFilteredCustomers([]);
      setShowCustomerDropdown(false);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const checkCode = customers.find(
      (item) =>
        item.code.toLowerCase() === formData.customerCode.toLocaleLowerCase()
    );
    if (checkCode) {
      const newData = formData;
      newData.customerCode = checkCode.code;
      newData.city = city;
      newData.customerName = customerName;
      newData.transportName = selectedTransports;
      let invoice =
        typeof formData.invoice === "string" &&
        formData?.invoice.split(",").map((item) => item.trim());
      newData.invoice = invoice;
      let result;
      if (editData) {
        result = await window.electronAPI.updateMedicalData({
          ...newData,
          id: editData.id,
        });
      } else {
        result = await window.electronAPI.saveMedicalData(newData);
      }
      if (result.error) {
        setError(result.error);
        toast.error("Duplicate invoice found");
      } else {
        toast.success("Data submited Successfully");
        setFormData({
          customerCode: "",
          invoice: "",
          partyName: "",
          billValue: "",
          description: "",
        });
        setCustomerName("");
        setCity("");
        setError("");
        closeModal();
      }
    } else {
      setError("Code not matched");
      return;
    }
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (name === "customerCode") {
      const search = customers.find(
        (item) => item.code.toLowerCase() === value.toLowerCase()
      );
      if (search) {
        setCustomerName(
          `${search.customer_name_english} ${
            search.customer_name_hindi && "/ " + search.customer_name_hindi
          }`
        );
        setCity(search.city);
      }
    }
  };
  const getSelectedCustomerName = (val) => {
    const search = customers.find((item) => item.code === val.code);
    setCity(search.city);
    setCustomerName(
      `${search.customer_name_english} ${
        search.customer_name_hindi && "/ " + search.customer_name_hindi
      }`
    );
    setFormData({
      ...formData,
      customerCode: search.code,
      transportName: `${search?.transport_name_english} ${
        search?.transport_name_english && search.transport_name_hindi
          ? "/ " + search.transport_name_hindi
          : search.transport_name_hindi
      }`,
    });
    setShowPartyNameDropdown(true);
  };
  const getSelectedPartyName = (val) => {
    setFormData({
      ...formData,
      partyName: val,
    });
    setShowPartyNameDropdown(false);
  };

  const closeBtn = () => {
    setError("");
    closeModal();
  };
  return (
    <Container>
      <Modal show={show} onHide={closeBtn} size="lg" backdrop="static">
        {error && <Alert variant="danger">{error}</Alert>}
        <Modal.Header closeButton>
          <Modal.Title>{editData ? "Update" : "Add"} Form</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col>
                <Form.Group controlId="formCustomerCode">
                  <Form.Label>Customer Code</Form.Label>
                  <Form.Control
                    type="text"
                    name="customerCode"
                    placeholder="Enter customer Code"
                    value={formData?.customerCode}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group controlId="formCustomerName">
                  <Form.Label>Customer Name</Form.Label>
                  <div ref={dropdownRef} style={{ position: "relative" }}>
                    <FormControl
                      type="text"
                      placeholder="Enter customer name"
                      value={customerName}
                      title={customerName}
                      onChange={onCustomerNameInputChange}
                      onFocus={() =>
                        filteredCustomers?.length > 0 &&
                        setShowCustomerDropdown(true)
                      }
                    />
                    {showCustomerDropdown && filteredCustomers?.length > 0 && (
                      <Dropdown.Menu
                        show
                        style={{
                          position: "absolute",
                          width: "100%",
                          maxHeight: "300px",
                          overflowY: "auto",
                        }}
                      >
                        {filteredCustomers.map((item, index) => (
                          <Dropdown.Item
                            key={index}
                            eventKey={item.customer_name_english}
                            onClick={() => getSelectedCustomerName(item)}
                          >
                            {`${item.customer_name_english} ${
                              item.customer_name_hindi &&
                              "/ " + item.customer_name_hindi
                            }`}
                          </Dropdown.Item>
                        ))}
                      </Dropdown.Menu>
                    )}
                  </div>
                </Form.Group>
              </Col>
              <Col>
                <Form.Group controlId="formCity">
                  <Form.Label>City</Form.Label>
                  <Form.Control
                    type="text"
                    name="city"
                    placeholder="Enter city"
                    value={city}
                    onChange={handleChange}
                    disabled
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col>
                <Form.Group controlId="formInvoice">
                  <Form.Label>Invoice No</Form.Label>
                  <Form.Control
                    type="text"
                    name="invoice"
                    placeholder="Enter Invoice No"
                    value={formData?.invoice}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group controlId="formTransportName">
                  <Form.Label>Transport Name</Form.Label>
                  <Select
                    options={transportOptions}
                    name="transportName"
                    placeholder="Select Transport Names"
                    onChange={(option) => setSelectedTransports(option.value)}
                    value={{label: selectedTransports, value: selectedTransports }}
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group controlId="formotherParty">
                  <Form.Label>Other Party Name</Form.Label>
                  <div ref={dropdownRef} style={{ position: "relative" }}>
                    <Form.Control
                      type="text"
                      name="partyName"
                      placeholder="Enter other party Name"
                      value={formData?.partyName}
                      onChange={partyNameChange}
                    />
                    {showPartyNameDropdown &&
                      partyNameFilterList?.length > 0 && (
                        <Dropdown.Menu
                          show
                          style={{
                            position: "absolute",
                            width: "100%",
                            maxHeight: "300px",
                            overflowY: "auto",
                          }}
                        >
                          {partyNameFilterList.map((item, index) => {
                            const name = `${item.customer_name_english} ${
                              item.customer_name_hindi &&
                              "/ " + item.customer_name_hindi
                            }`;
                            return (
                              <Dropdown.Item
                                key={index}
                                eventKey={item.customer_name_english}
                                onClick={() => getSelectedPartyName(name)}
                              >
                                {name}
                              </Dropdown.Item>
                            );
                          })}
                        </Dropdown.Menu>
                      )}
                  </div>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={3}>
                <Form.Group controlId="formBillValue">
                  <Form.Label>Bill Value</Form.Label>
                  <Form.Control
                    type="text"
                    name="billValue"
                    placeholder="Enter Bill Value"
                    value={formData?.billValue}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Form.Group className="mb-3" controlId="formDescription">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  type="textarea"
                  rows={3}
                  name="description"
                  placeholder="Enter any additional information"
                  value={formData?.description}
                  onChange={handleChange}
                />
              </Form.Group>
            </Row>
            <Button variant="primary" type="submit">
              {editData ? "Update" : "Submit"} Form
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ModelForm;
