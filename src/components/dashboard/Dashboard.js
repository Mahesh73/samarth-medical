import React, { useEffect, useRef, useState } from "react";
import { Breadcrumb, Button } from "react-bootstrap";
import ModelForm from "./ModelForm";
import { PencilSquare, PrinterFill, TrashFill } from "react-bootstrap-icons";
import { confirmationDialog } from "../../common/ConfirmationDialog";
import { AgGridReact } from "ag-grid-react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const Dashboard = () => {
  const [role, setRole] = useState(localStorage.getItem("userRole"));
  const [show, setShow] = useState(false);
  const [editFlag, setEditFlag] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [selectedRow, setSelectedRow] = useState();
  const handleShow = () => {
    setEditFlag(false);
    setShow(true);
  };
  const [data, setData] = useState([]);
  const gridRef = useRef();

  const closeModal = () => {
    setShow(false);
    setShowGrid(false);
    setTimeout(() => {
      fetchInvoices();
      setShowGrid(true);
    }, 100);
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    window.electronAPI.getMedicalData().then((res) => {
      console.log(res);
      setData(res);
    });
  };

  const ActionButtonRenderer = (props) => {
    const handlePrint = (row) => {
      Swal.fire({
        title: `Do you want to Print for ${row.customerName}`,
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "With Sticker",
        denyButtonText: "Without Sticker",
      }).then((result) => {
        if (result.isDenied) {
          row.invoice = JSON.parse(row.invoice);
          const { customerName, invoice, city, transportName } = row;
          const printWindow = window.open("", "_blank", "width=600,height=400");
          printWindow.document.write(`
            <html>
              <head>
                <title>Print Medical Data</title>
                <style>
                  body {
                    font-family: Arial, sans-serif;
                  }
                  .print-section {
                    margin-bottom: 20px;
                  }
                </style>
              </head>
              <body>
                <h2>Medical Data Details</h2>
                <div class="print-section"><strong>Customer Name:</strong> ${customerName}</div>
                <div class="print-section"><strong>Invoice:</strong> ${invoice}</div>
                <div class="print-section"><strong>City:</strong> ${city}</div>
                <div class="print-section"><strong>Transport:</strong> ${transportName}</div>
                <div class="print-section"><strong>Case No:</strong> </div>
                <script>
                  window.print();
                  window.onafterprint = function() {
                    window.close();
                  };
                </script>
              </body>
            </html>
          `);
          printWindow.document.close();
        } else if (result.isConfirmed) {
          row.invoice = JSON.parse(row.invoice);
          const { customerName, invoice, city, transportName } = row;
          const printWindow = window.open("", "_blank", "width=600,height=400");
          const printCustomerName = customerName.split("/");
          printWindow.document.write(`
            <html>
              <head>
                <title>Print Medical Data</title>
                <style>
                  body {
                    font-family: Arial, sans-serif;
                    padding: 20px;
                  }
                  .invoice-details{
                    margin-right: 50px;
                    font-size: 30px;
                  }
                </style>
              </head>
              <body>
                <div className="invoice-details">
                  <p>
                    <strong>${printCustomerName[0]}</strong>
                    <strong>${printCustomerName[1]}</strong>
                  </p>
                  <p style={{ marginTop: "52px" }}>
                    <strong>${city}</strong>
                  </p>
                  <p style={{ marginLeft: "50px" }}>
                    <strong>${invoice}</strong>
                  </p>
                    <p style={{ marginLeft: "50px" }}>
                      <strong>${transportName}</strong>
                    </p>
                </div>
                <script>
                  window.print();
                  window.onafterprint = function() {
                    window.close();
                  };
                </script>
              </body>
            </html>
          `);
          printWindow.document.close();
        }
      });
    };
    const editRow = (val) => {
      setSelectedRow(val);
      setShow(true);
      setEditFlag(true);
    };
    const deleteCell = async (id) => {
      const isConfirmed = await confirmationDialog({
        title: "Delete Order",
        text: "Are you sure you want to delete this order?",
        confirmButtonText: "Yes",
        cancelButtonText: "Cancel",
      });
      if (isConfirmed) {
        try {
          window.electronAPI.deleteMedicalData(id).then((res) => {
            toast.success("Data Deleted Successfully");
            setTimeout(() => {
              fetchInvoices();
            }, 1000);
          });
        } catch (error) {
          toast.error("An error occurred!");
        }
      }
    };
    return (
      <div style={{ cursor: "pointer" }}>
        <PrinterFill onClick={() => handlePrint(props.data)} />
        <PencilSquare onClick={() => editRow(props.data)} className="mx-2" />
        {role === "admin" && (
          <TrashFill onClick={() => deleteCell(props.data.id)} />
        )}
      </div>
    );
  };

  function isValidJSON(value) {
    try {
      JSON.parse(value);
      return true;
    } catch (e) {
      return false;
    }
  }

  const colDefs = [
    {
      headerName: "Sr. No.",
      field: "id",
      minWidth: 100,
      filter: true,
      valueGetter: (val) => Number(val.node.id) + 1,
    },
    { headerName: "Code", field: "customerCode", minWidth: 85, filter: true },
    {
      headerName: "Customer Name in English",
      valueGetter: (val) => {
        const splitData = val.data.customerName.split("/");
        return splitData[0];
      },
      field: "customerName",
      filter: true,
      tooltipField: "customerName",
      minWidth: 175,
    },
    {
      headerName: "Customer Name in Marathi",
      valueGetter: (val) => {
        const splitData = val.data.customerName.split("/");
        return splitData[1];
      },
      field: "customerName",
      filter: true,
      tooltipField: "customerName",
      minWidth: 175,
    },
    {
      headerName: "Invoice No",
      field: "invoice",
      tooltipField: "invoice",
      filter: true,
      minWidth: 125,
      valueGetter: (val) => {
        if (isValidJSON(val.data.invoice)) {
          return JSON.parse(val.data.invoice).toString().replace(/,/g, ", ");
        } else {
          console.error("Invalid JSON:", val.data.invoice);
          return "Invalid Data";
        }
      },
      // JSON.parse(val.data.invoice).toString().replace(/,/g, ", "),
    },
    {
      headerName: "City",
      field: "city",
      tooltipField: "city",
      filter: true,
      minWidth: 100,
    },
    {
      headerName: "Transport Name in English",
      field: "transportName",
      tooltipField: "transportName",
      valueGetter: (val) => {
        const splitData = val.data.transportName.split("/");
        return splitData[0];
      },
      filter: true,
      minWidth: 170,
    },
    {
      headerName: "Transport Name in Marathi",
      field: "transportName",
      tooltipField: "transportName",
      valueGetter: (val) => {
        const splitData = val.data.transportName.split("/");
        return splitData[1];
      },
      filter: true,
      minWidth: 170,
    },
    {
      headerName: "Other Party Name",
      field: "partyName",
      tooltipField: "partyName",
      minWidth: 170,
      filter: true,
    },

    {
      headerName: "Created Date",
      field: "createdDate",
      filter: "agDateColumnFilter",
      minWidth: 135,
      valueGetter: (val) =>
        val.data.createdDate
          ? new Date(val.data.createdDate).toLocaleDateString()
          : "",
    },
    {
      headerName: "Updated Date",
      field: "updatedDate",
      filter: "agDateColumnFilter",
      minWidth: 137,
      valueGetter: (val) =>
        val.data.updatedDate
          ? new Date(val.data.updatedDate).toLocaleDateString()
          : "",
    },
    {
      headerName: "Bill Value",
      field: "billValue",
      tooltipField: "billValue",
      filter: true,
      minWidth: 110,
    },
    {
      headerName: "Description",
      field: "description",
      tooltipField: "description",
      filter: true,
      minWidth: 125,
    },
    {
      headerName: "Action",
      cellRenderer: ActionButtonRenderer,
      minWidth: 100,
      maxWidth: 100,
      pinned: "right",
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
      fileName: `CustomerDailyList_${new Date().toLocaleString()}`,
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
    <div className="mx-3">
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
          <Breadcrumb.Item active>Dashboard</Breadcrumb.Item>
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
        <ModelForm
          show={show}
          setShow={setShow}
          closeModal={closeModal}
          editData={selectedRow}
          editFlag={editFlag}
        />
      )}

      {showGrid && (
        <div className="ag-theme-alpine" style={{ height: 500, width: "100%" }}>
          <AgGridReact
            rowData={data}
            columnDefs={colDefs}
            ref={gridRef}
            pagination={true}
            onFirstDataRendered={onFirstDataRendered}
            enableCellTextSelection={true}
            onGridReady={onGridReady}
            suppressExcelExport={true}
            tooltipShowDelay={0}
            tooltipHideDelay={2000}
          />
        </div>
      )}

      {/* <div className="invoice-details">
        <Row>
          <p>
            <strong>{selectedRow.customerName}</strong>{" "}
          </p>
          <p style={{ marginTop: "52px" }}>
            <strong>{selectedRow.city}</strong>{" "}
          </p>
          <p style={{ marginLeft: "50px" }}>
            <strong>{selectedRow.invoice}</strong>
          </p>
          <Col>
            <p style={{ marginLeft: "50px" }}>
              <strong>{selectedRow.transportName}</strong>{" "}
            </p>
            <p>
              <strong>Customer Code:</strong> {selectedRow.customerCode}
            </p>
          </Col>
        </Row>
      </div> */}
    </div>
  );
};

export default Dashboard;
