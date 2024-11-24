import { AgGridReact } from "ag-grid-react";
import React, { useEffect, useRef, useState } from "react";
import { Breadcrumb, Button, Form, Modal } from "react-bootstrap";
import Select from "react-select";

const TransportSelection = ({ setShow, setData }) => {
  const [radioOption, setRadioOption] = useState("transport");
  const [transportOptions, setTransportOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [selectedTransports, setSelectedTransports] = useState([]);
  const [selectedCity, setSelectedCity] = useState([]);

  const applyTransportName = () => {
    window.electronAPI
      .getMedicalDataByTransportOrCity(selectedTransports, selectedCity)
      .then((res) => {
        setData(res);
        setShow(false);
      });
  };

  useEffect(() => {
    window.electronAPI.getTransportData().then((data) => {
      const options = data.map((item) => ({
        value: `${item.transport_name_english} / ${item.transport_name_hindi}`,
        label: `${item.transport_name_english} / ${item.transport_name_hindi}`,
      }));
      setTransportOptions(options);
    });
    window.electronAPI.getCityNames().then((res) => {
      console.log(res);
      const options = res.map((item) => ({
        value: item,
        label: item,
      }));
      setCityOptions(options);
    });
  }, []);
  const changeReport = (val) => {
    setRadioOption(val);
  };
  return (
    <div className="transportSelection-popup">
      <Modal.Dialog className="transportSelection-box">
        <Modal.Header>
          <Modal.Title>Report by Transport Name / City</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Check
              inline
              type="radio"
              id="transport"
              checked={radioOption === "transport"}
              label="Transport Name"
              name="reportOption"
              onChange={() => changeReport("transport")}
            />
            <Form.Check
              inline
              type="radio"
              id="city"
              label="City"
              checked={radioOption === "city"}
              name="reportOption"
              onChange={() => changeReport("city")}
            />
            {radioOption === "transport" ? (
              <Select
                isMulti
                className="mt-3"
                options={transportOptions}
                name="transportName"
                placeholder="Select Transport Names"
                styles={{
                  menu: (provided, state) => ({
                    ...provided,
                    maxHeight: "250px",
                    overflowY: "hidden",
                  }),
                }}
                onChange={(selectedOptions) =>
                  setSelectedTransports(selectedOptions.map((opt) => opt.value))
                }
              />
            ) : (
              <Select
                isMulti
                className="mt-3"
                options={cityOptions}
                styles={{
                  menu: (provided, state) => ({
                    ...provided,
                    maxHeight: "250px",
                    overflowY: "hidden",
                  }),
                }}
                name="cityName"
                placeholder="Select City Names"
                onChange={(selectedOptions) =>
                  setSelectedCity(selectedOptions.map((opt) => opt.value))
                }
              />
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={applyTransportName}>
            Apply
          </Button>
        </Modal.Footer>
      </Modal.Dialog>
    </div>
  );
};

const TransportReport = () => {
  const gridRef = useRef();
  const [show, setShow] = useState(true);
  const [data, setData] = useState([]);

  const colDefs = [
    {
      headerName: "Sr. No.",
      valueGetter: (val) => Number(val.node.id) + 1,
      filter: true,
      maxWidth: 100,
    },
    { headerName: "Code", field: "customerCode", filter: true, maxWidth: 100 },
    {
      headerName: "Customer Name",
      field: "customerName",
      tooltipField: "customerName",
      filter: true,
    },
    {
      headerName: "Invoice",
      valueGetter: (val) => JSON.parse(val.data.invoice),
      filter: true,
      tooltipField: "invoice",
    },
    {
      headerName: "City",
      field: "city",
      filter: true,
      tooltipField: "city",
    },
    {
      headerName: "Other Party Names",
      field: "partyName",
      tooltipField: "partyName",
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
      headerName: "Bill Value",
      field: "billValue",
      filter: true,
    },
    { headerName: "Description", field: "description", filter: true },
  ];

  const changeTransport = () => {
    setShow(true);
  };

  let gridApi;
  const onGridReady = (params) => {
    gridApi = params.api;
  };
  const exportToCSV = () => {
    const excelParam = {
      fileName: `Report_${new Date().toLocaleString()}`,
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
    <div className="mx-3 my-2">
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
          <Breadcrumb.Item active>Report</Breadcrumb.Item>
        </Breadcrumb>
        <div>
          <Button onClick={changeTransport}>Change Report</Button>
          <Button
            onClick={exportToCSV}
            variant="outline-dark"
            className="mx-2"
            title="Export To CSV"
          >
            Export
          </Button>
        </div>
      </div>
      <div
        className="modal show"
        style={{ display: "block", position: "initial" }}
      >
        {show && <TransportSelection setShow={setShow} setData={setData} />}
      </div>
      {!show && (
        <div className="ag-theme-alpine" style={{ height: 500, width: "100%" }}>
          <AgGridReact
            rowData={data}
            ref={gridRef}
            columnDefs={colDefs}
            pagination={true}
            enableCellTextSelection={true}
            suppressExcelExport={true}
            onGridReady={onGridReady}
            tooltipShowDelay={0}
            tooltipHideDelay={2000}
          />
        </div>
      )}
    </div>
  );
};

export default TransportReport;
