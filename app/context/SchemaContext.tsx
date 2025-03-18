"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useWorkflow } from "@/app/context/WorkflowContext";

export interface DocumentData {
  name: string;
  size: number;
  data?: string;
}

export interface RequestItem {
  product: string;
  price: number;
  amount: number;
}

// Define SchemaItem and other types
export interface SchemaItem {
  id: string | number;
  type: string;
  parameter: string;
  format?: string;
  readOnly: boolean;
  isRequired: boolean;
  defaultField: boolean;
  isHidden: boolean;
  fileNames?: string[];
}

export type Schema = SchemaItem[];

export interface ColDef {
  field: string;
  filter?: string;
  comparator?: (valueA: any, valueB: any) => number;
  valueFormatter?: (params: any) => string;
  [key: string]: any;
}

export interface SchemaContextType {
  schema: Schema | null;
  setSchema: (schema: Schema | null) => void;
  rowData: any[] | null;
  setRowData: (data: any[] | null) => void;
  colDefs: ColDef[] | null;
  setColDefs: (defs: ColDef[] | null) => void;
  clearLocalData: () => void;
  getRequestStatus: (workflowName: string) => number | null;
}

const SCHEMA_STORAGE_KEY = "schema_data";
const ROW_DATA_STORAGE_KEY = "row_data";
const COL_DEFS_STORAGE_KEY = "col_defs";

const SchemaContext = createContext<SchemaContextType | undefined>(undefined);

export const SchemaProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [schema, setSchemaState] = useState<Schema | null>(null);
  const [rowData, setRowDataState] = useState<any[] | null>(null);
  const [colDefs, setColDefsState] = useState<ColDef[] | null>(null);

  const { state: workflowState, currentWorkflowName } = useWorkflow();

  // Load saved data from localStorage on mount
  useEffect(() => {
    const savedSchema = localStorage.getItem(SCHEMA_STORAGE_KEY);
    const savedRowData = localStorage.getItem(ROW_DATA_STORAGE_KEY);
    const savedColDefs = localStorage.getItem(COL_DEFS_STORAGE_KEY);

    if (savedSchema) {
      const parsedSchema = JSON.parse(savedSchema);
      setSchemaState(parsedSchema);
      updateColDefs(parsedSchema);
    }

    if (savedRowData) {
      setRowDataState(JSON.parse(savedRowData));

      console.log(JSON.parse(savedRowData));
    }

    if (savedColDefs) {
      setColDefsState(JSON.parse(savedColDefs));
    }
  }, []);

  // Generate column definitions from the schema
  const updateColDefs = (newSchema: Schema | null) => {
    if (!newSchema) {
      setColDefsState(null);
      localStorage.removeItem(COL_DEFS_STORAGE_KEY);
      return;
    }

    const updatedColDefs: ColDef[] = newSchema
      .filter((item) => !item.isHidden) // Filter out hidden fields
      .map((item) => ({
        headerName: item.parameter || "",
        field: item.parameter || "",
        filter:
          item.type === "DATE"
            ? "agDateColumnFilter"
            : item.type === "NUMBER" ||
              item.type === "FLOAT" ||
              item.type === "CURRENCY"
            ? "agNumberColumnFilter"
            : "agTextColumnFilter",
        ...(item.type === "CURRENCY" && {
          valueFormatter: (params) =>
            params.value
              ? new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(params.value)
              : "",
        }),
      }));

    setColDefsState(updatedColDefs);
    localStorage.setItem(COL_DEFS_STORAGE_KEY, JSON.stringify(updatedColDefs));
  };

  // Save schema & update colDefs
  const setSchema = (newSchema: Schema | null) => {
    setSchemaState(newSchema);

    if (newSchema) {
      localStorage.setItem(SCHEMA_STORAGE_KEY, JSON.stringify(newSchema));
      updateColDefs(newSchema); // Ensure colDefs are updated
    } else {
      localStorage.removeItem(SCHEMA_STORAGE_KEY);
      setColDefsState(null);
    }
  };

  const setRowData = (data: any[] | null) => {
    setRowDataState(data);
    if (data) localStorage.setItem(ROW_DATA_STORAGE_KEY, JSON.stringify(data));
    else localStorage.removeItem(ROW_DATA_STORAGE_KEY);
  };

  const setColDefs = (defs: ColDef[] | null) => {
    setColDefsState(defs);
    if (defs) localStorage.setItem(COL_DEFS_STORAGE_KEY, JSON.stringify(defs));
    else localStorage.removeItem(COL_DEFS_STORAGE_KEY);
  };

  const clearLocalData = () => {
    localStorage.removeItem(SCHEMA_STORAGE_KEY);
    localStorage.removeItem(ROW_DATA_STORAGE_KEY);
    localStorage.removeItem(COL_DEFS_STORAGE_KEY);
    setSchemaState(null);
    setRowDataState(null);
    setColDefsState(null);
    console.log("Local data cleared.");
  };

  // Dynamically fetch the Request Status from the workflow
  const getRequestStatus = (workflowName: string): number | null => {
    if (!workflowState || !workflowState.items || !workflowState.rootItem) {
      return null;
    }

    const rootItem = workflowState.items[workflowState.rootItem];
    if (!rootItem) return null;

    // Find the index of the current workflow name
    const steps = extractWorkflowSteps(workflowState.rootItem);
    const statusIndex = steps.findIndex((step) => step === workflowName);
    return statusIndex !== -1 ? statusIndex : null;
  };

  // Recursive helper to extract workflow steps
  const extractWorkflowSteps = (
    itemId: string,
    steps: string[] = []
  ): string[] => {
    const item = workflowState.items[itemId];
    if (!item) return steps;

    steps.push(item.name); // Add the current item's name

    // Recursively process children
    item.children.forEach((childId) => extractWorkflowSteps(childId, steps));
    return steps;
  };

  // Automatically update colDefs when schema changes
  useEffect(() => {
    if (schema) {
      updateColDefs(schema);
    }
  }, [schema]);

  return (
    <SchemaContext.Provider
      value={{
        schema,
        setSchema,
        rowData,
        setRowData,
        colDefs,
        setColDefs,
        clearLocalData,
        getRequestStatus,
      }}
    >
      {children}
    </SchemaContext.Provider>
  );
};

export const useSchema = () => {
  const context = useContext(SchemaContext);
  if (!context) {
    throw new Error("useSchema must be used within a SchemaProvider");
  }
  return context;
};
