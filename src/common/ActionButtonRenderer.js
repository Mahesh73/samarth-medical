import React from "react";
import { PencilSquare, PrinterFill, TrashFill } from "react-bootstrap-icons";

const ActionButtonRenderer = (props) => {
  const editRow = (val) => {
    setSelectedRow(row);
    setShow(true);
    console.log(val);
  };
  return (
    <div style={{ cursor: "pointer" }}>
      <PrinterFill />
      <PencilSquare onClick={() => editRow(props.data)} className="mx-2" />
      <TrashFill />
    </div>
  );
};

export default ActionButtonRenderer;
