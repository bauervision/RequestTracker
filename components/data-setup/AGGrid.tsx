import React from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

// Define types for props
interface AGGridProps {
  rows: any[];
  columns: any[];
  paginate?: boolean;
  setHeight: string;
}

export const AGGrid: React.FC<AGGridProps> = ({
  rows,
  columns,
  paginate,
  setHeight,
}) => {
  const defaultColDef = {
    initialWidth: 200,
    wrapHeaderText: true,
    autoHeaderHeight: true,
  };

  return (
    <div
      className={"ag-theme-quartz"}
      style={{ width: "100%", height: setHeight }}
    >
      <AgGridReact
        rowData={rows} // Use props directly
        columnDefs={columns} // Use props directly
        defaultColDef={defaultColDef}
        pagination={paginate}
      />
    </div>
  );
};
