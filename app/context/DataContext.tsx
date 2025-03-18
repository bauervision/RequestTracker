"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useSchema } from "@/app/context/SchemaContext";

interface RequestContextType {
  data: Record<string, any>[]; // Match rowData from SchemaContext
  selectedRow: Record<string, any> | null;
  setRowData: (data: Record<string, any>[]) => void;
  selectRow: (row: Record<string, any>) => void;
  addRow: (row: Record<string, any>) => void;
  updateRow: (index: number, row: Record<string, any>) => void;
  deleteRow: (index: number) => void;
}

const RequestContext = createContext<RequestContextType>({
  data: [],
  selectedRow: null,
  setRowData: () => {},
  selectRow: () => {},
  addRow: () => {},
  updateRow: () => {},
  deleteRow: () => {},
});

export const RequestProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { rowData, setRowData } = useSchema(); // Use rowData from SchemaContext
  const [data, setLocalRowData] = useState<Record<string, any>[]>(
    rowData || []
  );
  const [selectedRow, setSelectedRow] = useState<Record<string, any> | null>(
    null
  );

  useEffect(() => {
    // Keep local data in sync with SchemaContext's rowData
    if (rowData) {
      setLocalRowData(rowData);
    }
  }, [rowData]);

  const addRow = (row: Record<string, any>) => {
    const updatedData = [...data, row];
    setLocalRowData(updatedData);
    setRowData(updatedData); // Update in SchemaContext
  };

  const updateRow = (index: number, updatedRow: Record<string, any>) => {
    const updatedData = data.map((row, i) => (i === index ? updatedRow : row));
    setLocalRowData(updatedData);
    setRowData(updatedData); // Update in SchemaContext
  };

  const deleteRow = (index: number) => {
    const updatedData = data.filter((_, i) => i !== index);
    setLocalRowData(updatedData);
    setRowData(updatedData); // Update in SchemaContext
  };

  const selectRow = (row: Record<string, any>) => {
    setSelectedRow(row);
  };

  return (
    <RequestContext.Provider
      value={{
        data,
        selectedRow,
        setRowData: setLocalRowData,
        addRow,
        updateRow,
        deleteRow,
        selectRow,
      }}
    >
      {children}
    </RequestContext.Provider>
  );
};

export const useRequestContext = () => useContext(RequestContext);

/// TOAST
import {
  Toast,
  ToastProvider,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastViewport,
  ShadcnToastProps,
} from "@/components/ui/toast";

interface ToastContextProps {
  addToast: (toast: ShadcnToastProps) => number;
  updateToast: (id: number, updatedToast: Partial<ShadcnToastProps>) => void;
}
interface ToastProviderProps {
  children: ReactNode;
}
const ToastContext = createContext<ToastContextProps | undefined>(undefined);
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastContextProvider");
  }
  return context;
};
export const ToastContextProvider: React.FC<ToastProviderProps> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ShadcnToastProps[]>([]);
  const addToast = (toast: ShadcnToastProps) => {
    console.log("Adding toast:", toast);
    setToasts((prevToasts) => [...prevToasts, toast]);
    return toasts.length; // Returning the index as the ID
  };
  const updateToast = (id: number, updatedToast: Partial<ShadcnToastProps>) => {
    console.log("Updating toast:", id, updatedToast);
    setToasts((prevToasts) =>
      prevToasts.map((toast, index) =>
        index === id ? { ...toast, ...updatedToast } : toast
      )
    );
  };
  return (
    <ToastContext.Provider value={{ addToast, updateToast }}>
      {children}
      <ToastProvider>
        {toasts.map((toast, index) => (
          <Toast
            key={index}
            variant={toast.variant}
            title={toast.title} //missing
            description={toast.description} //missing
          >
            <ToastTitle>{toast.title}</ToastTitle>
            {toast.description && (
              <ToastDescription>{toast.description}</ToastDescription>
            )}
            <ToastClose />
          </Toast>
        ))}
        <ToastViewport />
      </ToastProvider>
    </ToastContext.Provider>
  );
};
