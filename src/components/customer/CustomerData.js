import React, { useEffect, useRef, useState } from "react";
import { Breadcrumb, Button, Container } from "react-bootstrap";
import CustomerDataForm from "./CustomerDataForm";
import { AgGridReact } from "ag-grid-react";
import { PencilSquare, TrashFill } from "react-bootstrap-icons";
import { confirmationDialog } from "../../common/ConfirmationDialog";
import { toast } from "react-toastify";

const CustomerData = () => {
  const [show, setShow] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [selectedRow, setSelectedRow] = useState({});
  const [editFlag, setEditFlag] = useState(false);
  const gridRef = useRef();
  const handleShow = () => {
    setEditFlag(false);
    setShow(true);
  };
  const closeModal = () => {
    setShow(false);
    fetchData();
  };
  const fetchData = async () => {
    try {
      const customerData = await window.electronAPI.getCustomerData();
      setCustomers(customerData);
    } catch (error) {
      console.error("Error fetching customer data:", error);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  const ActionButtonRenderer = (props) => {
    const editRow = (val) => {
      setSelectedRow(val);
      setEditFlag(true);
      setShow(true);
    };
    const deleteCell = async (code) => {
      const isConfirmed = await confirmationDialog({
        title: "Delete Order",
        text: `Are you sure you want to delete this Customer ${code} Data?`,
        confirmButtonText: "Yes",
        cancelButtonText: "Cancel",
      });
      if (isConfirmed) {
        try {
          window.electronAPI.deleteCustomerData(code).then((res) => {
            console.log(res);
            toast.success("Data Deleted Successfully");
            setTimeout(() => {
              fetchData();
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
        <TrashFill onClick={() => deleteCell(props.data.code)} />
      </div>
    );
  };

  const colDefs = [
    { headerName: "Code", field: "code", filter: true, minWidth: 100 },
    {
      headerName: "Customer Name in English",
      field: "customer_name_english",
      filter: true,
    },
    {
      headerName: "Customer Name in Marathi",
      field: "customer_name_marathi",
      filter: true,
    },
    { headerName: "City in English", field: "city_english", filter: true },
    { headerName: "City in Marathi", field: "city_marathi", filter: true },
    {
      headerName: "Address in English",
      field: "address_english",
      filter: true,
    },
    {
      headerName: "Address in Marathi",
      field: "address_marathi",
      filter: true,
    },
    {
      headerName: "Action",
      cellRenderer: ActionButtonRenderer,
      maxWidth: 100,
      minWidth: 100,
      sortable: false,
      resizable: false,
    },
  ];
  const onFirstDataRendered = (params) => {
    params.api.sizeColumnsToFit();
  };
  let gridApi;
  const onGridReady = (params) => {
    gridApi = params.api;
  };
  const exportToCSV = () => {
    const excelParam = {
      fileName: `CustomerData_${new Date().toLocaleString()}`,
      headerStyles: {
        font: {
          size: 14,
          color: "#00698f",
        },
      },
    };
    gridRef.current.api.exportDataAsCsv(excelParam);
  };
  return (
    <div className="m-2">
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
          <Breadcrumb.Item active>Customer Data</Breadcrumb.Item>
        </Breadcrumb>
        <div>
          <Button onClick={handleShow} className="mx-2">
            Add
          </Button>
          <Button
            onClick={exportToCSV}
            variant="outline-dark"
            title="Export To CSV"
          >
            Export
          </Button>
        </div>
      </div>
      {show && (
        <CustomerDataForm
          show={show}
          setShow={setShow}
          closeModal={closeModal}
          editData={selectedRow}
          editFlag={editFlag}
        />
      )}
      <div className="ag-theme-alpine" style={{ height: '80vh', width: "100%" }}>
        <AgGridReact
          rowData={customers}
          columnDefs={colDefs}
          ref={gridRef}
          pagination={true}
          onFirstDataRendered={onFirstDataRendered}
          enableCellTextSelection={true}
          onGridReady={onGridReady}
          suppressExcelExport={true}
        />
      </div>
    </div>
  );
};

export default CustomerData;
