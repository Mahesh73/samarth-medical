import { AgGridReact } from "ag-grid-react";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Breadcrumb,
  Button,
  Col,
  Container,
  Form,
  Modal,
  Row,
} from "react-bootstrap";
import { PencilSquare, TrashFill } from "react-bootstrap-icons";
import { toast } from "react-toastify";
import { confirmationDialog } from "../../common/ConfirmationDialog";

const TransportDataForm = ({ show, closeModal, editData, editFlag }) => {
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    transport_name_english: "",
    transport_name_hindi: "",
    number: "",
    city: "",
    city_hindi: "",
    address: "",
  });
  useEffect(() => {
    if (editFlag) {
      setFormData(editData);
    }
  }, [editData]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    let result;
    try {
      if (editFlag) {
        result = await window.electronAPI.updateTransportData(formData);
      } else {
        result = await window.electronAPI.addTransportData(formData);
      }
      closeModal();
    } catch {
      setError("Transport Name already exist");
      console.error(error);
    }
  };
  return (
    <Modal show={show} onHide={closeModal} size="lg">
      {error && <Alert variant="danger">{error}</Alert>}
      <Modal.Header closeButton>
        <Modal.Title>Transport Data Form</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col>
              <Form.Group controlId="formTransportNameEnglish">
                <Form.Label>Transport Name in English</Form.Label>
                <Form.Control
                  type="text"
                  name="transport_name_english"
                  placeholder="Enter Transport Name in English"
                  value={formData.transport_name_english}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId="formTransportNameHindi">
                <Form.Label>Transport Name in Hindi</Form.Label>
                <Form.Control
                  type="text"
                  name="transport_name_hindi"
                  placeholder="Enter Transport Name in Hindi"
                  value={formData.transport_name_hindi}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col>
              <Form.Group controlId="formCity">
                <Form.Label>City in English</Form.Label>
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
            <Col>
              <Form.Group controlId="formCityHindi">
                <Form.Label>City in Hindi</Form.Label>
                <Form.Control
                  type="text"
                  name="city_hindi"
                  placeholder="Enter city"
                  value={formData.city_hindi}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col>
              <Form.Group controlId="formNumber">
                <Form.Label>Mobile No.</Form.Label>
                <Form.Control
                  type="text"
                  name="number"
                  placeholder="Enter Mobile No."
                  value={formData.number}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId="formAddress">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  type="text"
                  name="address"
                  placeholder="Enter Address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
          <Button variant="primary" type="submit">
            {editFlag ? "Update" : "Submit"} Details
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

const TransportData = () => {
  const gridRef = useRef();
  const [show, setShow] = useState(false);
  const [transportList, setTransportList] = useState([]);
  const [selectedRow, setSelectedRow] = useState({});
  const [editFlag, setEditFlag] = useState(false);

  const handleShow = () => {
    setEditFlag(false);
    setShow(true);
  };
  const closeModal = () => {
    setShow(false);
    fetchDetails();
  };
  useEffect(() => {
    fetchDetails();
  }, []);

  const fetchDetails = () => {
    window.electronAPI.getTransportData().then((res) => {
      setTransportList(res);
    });
  };

  const ActionButtonRenderer = (props) => {
    const editRow = (val) => {
      setSelectedRow(val);
      setEditFlag(true);
      setShow(true);
    };
    const deleteCell = async (id) => {
      const isConfirmed = await confirmationDialog({
        title: "Delete Order",
        text: `Are you sure you want to delete this Customer ${id} Data?`,
        confirmButtonText: "Yes",
        cancelButtonText: "Cancel",
      });
      if (isConfirmed) {
        try {
          window.electronAPI.deleteTransportData(id).then((res) => {
            toast.success("Data Deleted Successfully");
            setTimeout(() => {
              fetchDetails();
            }, 1000);
          });
        } catch (error) {
          toast.error("An error occurred!");
        }
      }
    };
    return (
      <div style={{ cursor: "pointer" }}>
        <PencilSquare onClick={() => editRow(props.data)} className="mx-2" />
        <TrashFill onClick={() => deleteCell(props.data.id)} />
      </div>
    );
  };
  const colDefs = [
    {
      headerName: "Transport Name in English",
      field: "transport_name_english",
      filter: true,
      minWidth: 215,
    },
    {
      headerName: "Transport Name in Hindi",
      field: "transport_name_hindi",
      filter: true,
      minWidth: 205,
    },
    { headerName: "Mobile Number", field: "number", filter: true },
    { headerName: "City Name in English", field: "city", filter: true },
    { headerName: "City Name in Hindi", field: "city_hindi", filter: true },
    { headerName: "Address", field: "address", filter: true },
    {
      headerName: "Action",
      cellRenderer: ActionButtonRenderer,
      maxWidth: 100,
      minWidth: 100,
      sortable: false,
      resizable: false,
      pinned: "right",
    },
  ];
  return (
    <Container>
      <div
        className="m-2"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Breadcrumb>
          <Breadcrumb.Item>Home</Breadcrumb.Item>
          <Breadcrumb.Item active>Transport Data</Breadcrumb.Item>
        </Breadcrumb>
        <div>
          <Button className="mx-2" onClick={handleShow}>
            Add
          </Button>
          <Button variant="outline-dark" title="Export To CSV">
            Export
          </Button>
        </div>
      </div>
      {show && (
        <TransportDataForm
          show={show}
          setShow={setShow}
          closeModal={closeModal}
          editData={selectedRow}
          editFlag={editFlag}
        />
      )}
      <div className="ag-theme-alpine" style={{ height: 500, width: "100%" }}>
        <AgGridReact
          rowData={transportList}
          columnDefs={colDefs}
          ref={gridRef}
          pagination={true}
        />
      </div>
    </Container>
  );
};

export default TransportData;
