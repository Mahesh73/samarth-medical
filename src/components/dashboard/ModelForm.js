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
    caseNo: "",
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
      setTimeout(() => {
        editData.invoice = JSON.parse(editData.invoice)
          .toString()
          .replace(/,/g, ", ");
        setFormData(editData);
        const customerName = `${editData.customerNameEnglish} / ${editData.customerNameMarathi}`;
        setCustomerName(customerName);
        const city = `${editData.cityEnglish} / ${editData.cityMarathi}`
        setCity(city);
        const transportName = editData.transportNameMarathi !== null ? 
          `${editData.transportNameEnglish} / ${editData.transportNameMarathi}` : 
          editData.transportNameEnglish
        setSelectedTransports(transportName);
      }, 500);
    } else {
      setFormData({
        customerCode: "",
        invoice: "",
        partyName: "",
        billValue: "",
        caseNo: "",
        description: "",
      });
      setCustomerName("");
      setSelectedTransports('Other')
      setCity("");
    }
  }, [editData]);

  useEffect(() => {
    setFormData({
      customerCode: "",
      invoice: "",
      partyName: "",
      billValue: "",
      caseNo: "",
      description: "",
    });
    setCustomerName("");
    setCity("");
    window.electronAPI.getCustomerData().then((res) => setCustomers(res));
    window.electronAPI.getTransportData().then((data) => {
      const options = data.map((item) => ({
        value: `${item.transport_name_english} / ${item.transport_name_hindi}`,
        label: item.transport_name_hindi ? `${item.transport_name_english} / ${item.transport_name_hindi}` : item.transport_name_english,
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

if (!selectedTransports || selectedTransports.length === 0) {
    setError("Please select Transport Name");
    toast.warning("Please select Transport Name");
    return;
  }

    const checkCode = customers.find(
      (item) =>
        item.code.toLowerCase() === formData.customerCode.toLocaleLowerCase()
    );
    if (checkCode) {
      const transportName = selectedTransports.split('/');
      const newData = formData;
      newData.customerCode = checkCode.code;
      newData.cityEnglish = checkCode.city_english;
      newData.cityMarathi = checkCode.city_marathi;
      newData.customerNameEnglish = checkCode.customer_name_english;
      newData.customerNameMarathi = checkCode.customer_name_marathi;
      newData.transportNameEnglish = transportName[0];
      newData.transportNameMarathi = transportName[1];
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
          caseNo: "",
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
            search.customer_name_marathi && "/ " + search.customer_name_marathi
          }`
        );
        setCity(
          `${search.city_english} ${
            search.city_marathi && "/ " + search.city_marathi
          }`
        );
      }
    }
  };
  const getSelectedCustomerName = (val) => {
    const search = customers.find((item) => item.code === val.code);
    setCity(
      `${search.city_english} ${
        search.city_marathi && "/ " + search.city_marathi
      }`
    );
    setCustomerName(
      `${search.customer_name_english} ${
        search.customer_name_marathi && "/ " + search.customer_name_marathi
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
    setShowCustomerDropdown(false);
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
                    autoFocus
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
                              item.customer_name_marathi &&
                              "/ " + item.customer_name_marathi
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
                    value={{
                      label: selectedTransports,
                      value: selectedTransports,
                    }}
                    required
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
                              item.customer_name_marathi &&
                              "/ " + item.customer_name_marathi
                            } (${item.city_english} / ${item.city_marathi})`;
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
            <Row className="mb-3">
            <Col md={3}>
                <Form.Group controlId="formCaseNo">
                  <Form.Label>Case No.</Form.Label>
                  <Form.Control
                    type="text"
                    name="caseNo"
                    placeholder="Enter Case No."
                    value={formData?.caseNo}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
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
