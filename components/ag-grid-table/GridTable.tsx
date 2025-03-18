"use client";

import React, { useMemo, useRef, useCallback, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { useSchema } from "@/app/context/SchemaContext";
import { useRequestContext } from "@/app/context/DataContext";
import Link from "next/link";
import { Button } from "../ui/button";

// Mapping for workflows and their steps.
const workflowMapping: Record<string, string[]> = {
  "New Order: Default": [
    "Order Received",
    "Sourcing",
    "Purchasing",
    "Order Complete",
  ],
  // Add additional workflows here if needed.
};

const getWorkflowProgress = (row: any): string => {
  // Prefer a workflow object if available; otherwise use the fields directly.
  const workflowName = row.workflow?.name || row["Request Workflow"];
  const currentStep = row.workflow?.currentStep || row["Request Status"];

  // Try to get the ordered steps from the row.
  const steps: string[] =
    (row.workflow && row.workflow.orderedSteps) ||
    // fallback to a default mapping if needed
    workflowMapping[workflowName] ||
    [];

  if (steps.length > 0) {
    const totalSteps = steps.length;
    const currentIndex = steps.findIndex((step) => step === currentStep);
    if (currentIndex === -1) return workflowName;
    // Force 100% if at the last step.
    if (currentIndex === totalSteps - 1) return `${workflowName}: 100%`;
    const progressPercent = Math.round((currentIndex / totalSteps) * 100);
    return `${workflowName}: ${progressPercent}%`;
  }
  return workflowName || "";
};

const requestWorkflowCellRenderer = (params: any) => {
  return <span>{getWorkflowProgress(params.data)}</span>;
};

// Define rowClassRules to apply a CSS class when the request is complete.
const rowClassRules = {
  "completed-row": (params: any) => {
    const workflowName =
      params.data.workflow?.name || params.data["Request Workflow"];
    const currentStep =
      params.data.workflow?.currentStep || params.data["Request Status"];
    if (workflowName && workflowMapping[workflowName]) {
      const steps = workflowMapping[workflowName];
      // Mark as complete if the current step is the last one.
      return currentStep === steps[steps.length - 1];
    }
    return false;
  },
};

const GridTable = () => {
  const { colDefs, rowData } = useSchema(); // Get colDefs and rowData from context
  const { selectRow } = useRequestContext(); // Access selectRow from RequestContext
  const gridApiRef = useRef<any>(null);

  const onGridReady = useCallback((params: any) => {
    gridApiRef.current = params.api;
  }, []);

  const defaultColDef = useMemo(() => {
    return {
      filter: "agTextColumnFilter",
      floatingFilter: true,
    };
  }, []);

  const onSelectionChanged = () => {
    if (gridApiRef.current) {
      const selectedNodes = gridApiRef.current.getSelectedNodes();
      if (selectedNodes.length > 0) {
        const selectedData = selectedNodes[0].data;
        selectRow(selectedData); // Set the selected row in the RequestContext
      }
    }
  };

  // Override the "Request Workflow" column to include progress percent on the fly.
  const updatedColDefs = useMemo(() => {
    if (!colDefs) return [];
    return colDefs.map((def) => {
      if (def.field === "Request Workflow") {
        return {
          ...def,
          cellRenderer: requestWorkflowCellRenderer,
        };
      }
      return def;
    });
  }, [colDefs]);

  useEffect(() => {
    console.log(rowData);
  }, []);

  return (
    <div
      className="ag-theme-quartz mx-auto"
      style={{ width: "90%", height: "500px" }}
    >
      {!colDefs ? (
        <div className="flex flex-col justify-center items-center h-full">
          <Link href="request-tracker/admin/data-management">
            <Button className="bg-blue-800 text-white">
              Set your data in Data Management first!
            </Button>
          </Link>
        </div>
      ) : (
        <AgGridReact
          rowData={rowData}
          columnDefs={updatedColDefs}
          defaultColDef={defaultColDef}
          rowSelection="single"
          onSelectionChanged={onSelectionChanged}
          pagination={true}
          paginationPageSize={10}
          onGridReady={onGridReady}
          ref={gridApiRef}
          rowClassRules={rowClassRules}
        />
      )}
    </div>
  );
};

export default GridTable;
