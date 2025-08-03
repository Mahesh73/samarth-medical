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
      setData(res);
    });
  };

  const ActionButtonRenderer = (props) => {
    const handlePrint = (row) => {
      Swal.fire({
        title: `Do you want to Print for ${row.customerNameEnglish}`,
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "With Sticker",
        denyButtonText: "Without Sticker",
      }).then((result) => {
        if (result.isDenied) {
          if (typeof row.invoice === "string") {
            row.invoice = JSON.parse(row.invoice);
          }
          const {
            customerNameEnglish,
            customerNameMarathi,
            invoice,
            cityEnglish,
            cityMarathi,
            transportNameEnglish,
            transportNameMarathi,
            customerCode,
            id,
            caseNo
          } = row;
          const htmlContent = `<html>
              <head>
                <title>Print Medical Data</title>
                <style>
                  body {
                    font-family: Arial, sans-serif;
                    margin-left: 75px
                  }
                  .print-section {
                    margin-bottom: 20px;
                    color: #ad4844;
                    font-size: 17px
                  }
                </style>
              </head>
              <body>
                <h1 class="print-section" style="font-size: 26px">Samarth Medical Stores</h1>
                <div class="print-section"><strong>Customer Name:</strong> ${customerNameEnglish} <br/> 
                  <span style="margin-left: 135px">${customerNameMarathi}</span>
                </div>
                <div class="print-section"><strong>Invoice:</strong> ${invoice}</div>
                <div class="print-section"><strong>City:</strong> ${cityEnglish} ${cityMarathi}</div>
                <div class="print-section"><strong>Transport:</strong> ${transportNameEnglish} <br/> 
                  <span style="margin-left: 85px"> ${
                    transportNameMarathi !== null ? transportNameMarathi : ""
                  }</span>
                </div>
                <div class="print-section">
                  <strong>Sr. No:</strong> ${id} &emsp; 
                  <strong>Customer Code: </strong> ${customerCode} &emsp; 
                  <strong>Case No:</strong> ${caseNo}
                 </div>
              </body>
            </html>
          `;
          window.electronAPI.printData(htmlContent);
        } else if (result.isConfirmed) {
          if (typeof row.invoice === "string") {
            row.invoice = JSON.parse(row.invoice);
          }
          const {
            customerNameEnglish,
            customerNameMarathi,
            invoice,
            cityEnglish,
            cityMarathi,
            transportNameEnglish,
            transportNameMarathi,
            id,
            customerCode,
            caseNo
          } = row;
          const htmlContent = `<html>
              <head>
                <title>Print Medical Data</title>
                <style>
                  body {
                    font-family: Arial, sans-serif;
                    padding: 15px;
                  }
                  .invoice-details{
                    margin-top: 125px;
                    font-size: 22px;
                    white-space: nowrap;
                    margin-left: 20px;
                    color: #ad4844;
                  }
                  .serialNo{
                    position: absolute;
                    top: 170px;
                    left: 220px;
                    font-size: 15px;
                  }
                  .print-section {
                    margin-top: 10px;
                  }
                  @media print {
                    body {
                      margin: 0;
                      padding: 0;
                    }
                    footer {
                      display: none; /* Hide footer */
                    }
                  }
                </style>
              </head>
              <body>
                <div class="invoice-details">
                <div class="print-section"><strong>Customer Name:</strong> ${customerNameEnglish} <br/> 
                  <span style="margin-left: 150px">${customerNameMarathi}</span>
                </div>
                <div class="print-section"><strong>Invoice:</strong> ${invoice}</div>
                <div class="print-section"><strong>City:</strong> ${cityEnglish} ${cityMarathi}</div>
                <div class="print-section"><strong>Transport:
                  </strong> ${transportNameEnglish !== 'Other' ? transportNameEnglish : ''} <br/> 
                  <span style="margin-left: 85px"> ${
                    transportNameMarathi !== null ? transportNameMarathi : ""
                  }</span>
                </div>
                <div class="print-section">
                  <strong>Sr. No:</strong> ${id} &emsp; 
                  <strong>Customer Code: </strong> ${customerCode} &emsp; 
                  <strong>Case No:</strong> ${caseNo}
                 </div>
                </div>
              </body>
            </html>`;
          window.electronAPI.printData(htmlContent);
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
          window.electronAPI.deleteMedicalData(id).then(() => {
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

  const filterParams = {
    comparator: (filterLocalDateAtMidnight, cellValue) => {
      const dateAsString = cellValue;
      if (dateAsString == null) return -1;
      const dateParts = dateAsString.split("/");
      const cellDate = new Date(
        Number(dateParts[2]),
        Number(dateParts[1]) - 1,
        Number(dateParts[0])
      );
      if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
        return 0;
      }
      if (cellDate < filterLocalDateAtMidnight) {
        return -1;
      }
      if (cellDate > filterLocalDateAtMidnight) {
        return 1;
      }
      return 0;
    },
    inRangeFloatingFilterDateFormat: "Do MMM YYYY",
  };

  const colDefs = [
    {
      headerName: "Sr. No.",
      field: "id",
      minWidth: 100,
      filter: true,
    },
    { headerName: "Code", field: "customerCode", minWidth: 85, filter: true },
    {
      headerName: "Customer Name in English",
      field: "customerNameEnglish",
      filter: true,
      tooltipField: "customerNameEnglish",
      minWidth: 175,
      width: 200,
    },
    {
      headerName: "Customer Name in Marathi",
      field: "customerNameMarathi",
      filter: true,
      tooltipField: "customerNameMarathi",
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
          return "Invalid Data";
        }
      },
    },
    {
      headerName: "City in English",
      field: "cityEnglish",
      tooltipField: "cityEnglish",
      filter: true,
      minWidth: 100,
    },
    {
      headerName: "City in Marathi",
      field: "cityMarathi",
      tooltipField: "cityMarathi",
      filter: true,
      minWidth: 100,
    },
    {
      headerName: "Transport Name in English",
      field: "transportNameEnglish",
      tooltipField: "transportNameEnglish",
      filter: true,
      minWidth: 170,
    },
    {
      headerName: "Transport Name in Marathi",
      field: "transportNameMarathi",
      tooltipField: "transportNameMarathi",
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
      valueGetter: (params) => {
        if (params.data.createdDate) {
          const date = new Date(params.data.createdDate);
          return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
        }
        return "";
      },
      filterParams: filterParams,
    },
    {
      headerName: "Created Time",
      minWidth: 135,
      valueGetter: (params) => {
        if (params.data.createdDate) {
          const date = new Date(params.data.createdDate);
          return date.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }); // Format: HH:mm:ss
        }
        return "";
      },
      sortable: true,
      filter: "agTextColumnFilter",
    },
    {
      headerName: "Updated Date",
      field: "updatedDate",
      filter: "agDateColumnFilter",
      minWidth: 137,
      valueGetter: (params) => {
        if (params.data.createdDate) {
          const date = new Date(params.data.createdDate);
          return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
        }
        return "";
      },
      filterParams: filterParams,
    },
    {
      headerName: "Updated Time",
      minWidth: 139,
      valueGetter: (params) => {
        if (params.data.createdDate) {
          const date = new Date(params.data.createdDate);
          return date.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }); // Format: HH:mm:ss
        }
        return "";
      },
      sortable: true,
      filter: "agTextColumnFilter",
    },
    {
      headerName: "Cases",
      field: "caseNo",
      tooltipField: "caseNo",
      filter: true,
      minWidth: 110,
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
      field: "action",
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
      processHeaderCallback: (params) => {
        if (params.column.getColId() === "action") {
          return null;
        }
        const headerName = params.column.getColDef().headerName.toUpperCase();
        const fixedWidthHeader = headerName.padEnd(20, " ");
        return `${fixedWidthHeader}`;
      },
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
          {/* <Breadcrumb.Item >Home</Breadcrumb.Item> */}
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
        <div
          className="ag-theme-alpine"
          style={{ height: "80vh", width: "100%" }}
        >
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
    </div>
  );
};

export default Dashboard;
