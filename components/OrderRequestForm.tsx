"use client";

import React, { useState, useEffect } from "react";
import {
  DocumentData,
  SchemaItem,
  useSchema,
} from "@/app/context/SchemaContext";
import { useWorkflow } from "@/app/context/WorkflowContext";
import { useRequestContext } from "@/app/context/DataContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, parse } from "date-fns";
import RequestToast, { showToast } from "./Requests/RequestToast";

import { useUser } from "@/app/context/UserContext";
import {
  FIELD_TYPES,
  SHIPPING_FIELDS,
  PRODUCTS,
  US_STATES,
} from "@/app/constants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useUserManagement } from "@/app/context/UserManagementContext";

// Date formats mapping.
const DATE_FORMATS: { [key: string]: string } = {
  "MM/DD/YYYY": "MM/dd/yyyy",
  "DD/MM/YYYY": "dd/MM/yyyy",
  "YYYY-MM-DD": "yyyy-MM-dd",
  "MMM DD, YYYY": "MMM dd, yyyy",
  "MM-DD-YYYY": "MM-dd-yyyy",
};

// The RequestItem interface.
export interface RequestItem {
  product: string;
  price: number;
  amount: number;
}

const OrderRequestForm = () => {
  const { users, addUser } = useUserManagement();
  const { schema, rowData } = useSchema();
  const {
    state: workflowState,
    dispatch,
    savedWorkflows,
    currentWorkflowName,
    setCurrentWorkflowName,
    loadWorkflow,
  } = useWorkflow();
  const { addRow, data } = useRequestContext();
  const { user } = useUser();

  const [formValues, setFormValues] = useState<{ [key: string]: any }>({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [workflowSteps, setWorkflowSteps] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

  // New states for upload progress (used at submission time)
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // New states for document removal confirmation.
  const [docToRemove, setDocToRemove] = useState<number | null>(null);
  const [isDocRemoveDialogOpen, setIsDocRemoveDialogOpen] = useState(false);

  // Calculate the total cost of all request items.
  const totalCost = (formValues["Requested Items"] || []).reduce(
    (acc: number, item: RequestItem) =>
      acc + (item.price || 0) * (item.amount || 0),
    0
  );

  // ----------------------------
  // Logged in User field update: probably not needed in prod
  // ----------------------------
  useEffect(() => {
    handleInputChange("Request Creator", user.name);
    handleInputChange("Previous Approver", user.name);
  }, [user]);

  // ----------------------------
  // Workflow Handling
  // ----------------------------
  const handleWorkflowChange = (workflowName: string) => {
    setCurrentWorkflowName(workflowName);
    loadWorkflow(workflowName);

    console.log("Setting workflow name to ", workflowName);
  };

  const extractWorkflowSteps = (
    itemId: string,
    steps: string[] = []
  ): string[] => {
    const item = workflowState.items[itemId];
    if (!item) return steps;
    steps.push(item.name);
    item.children.forEach((childId) => extractWorkflowSteps(childId, steps));
    return steps;
  };

  // ----------------------------
  // Input Handlers
  // ----------------------------
  const handleInputChange = (field: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: !value }));
  };

  const handleDateChange = (
    field: string,
    date: Date | null,
    formatStr: string
  ) => {
    if (!date) return;
    const formattedDate = format(date, formatStr);
    setFormValues((prev) => ({ ...prev, [field]: formattedDate }));
    setErrors((prev) => ({ ...prev, [field]: !formattedDate }));
  };

  const getFormattedTodayDate = (formatStr: string) => {
    return format(new Date(), DATE_FORMATS[formatStr] || "yyyy-MM-dd");
  };

  // ----------------------------
  // Request Items Handlers
  // ----------------------------
  const handleRequestItemChange = (
    index: number,
    key: keyof RequestItem,
    value: any
  ) => {
    const currentItems: RequestItem[] = formValues["Requested Items"] || [];
    const updatedItems = [...currentItems];
    updatedItems[index] = { ...updatedItems[index], [key]: value };
    setFormValues((prev) => ({ ...prev, "Requested Items": updatedItems }));
  };

  const handleAddRequestItem = () => {
    const currentItems: RequestItem[] = formValues["Requested Items"] || [];
    const updatedItems = [
      ...currentItems,
      { product: "", price: 0, amount: 0 },
    ];
    setFormValues((prev) => ({ ...prev, "Requested Items": updatedItems }));
  };

  const handleRemoveRequestItem = (index: number) => {
    const currentItems: RequestItem[] = formValues["Requested Items"] || [];
    const updatedItems = currentItems.filter((_, i) => i !== index);
    setFormValues((prev) => ({ ...prev, "Requested Items": updatedItems }));
  };

  // ----------------------------
  // Document Upload Handlers
  // ----------------------------
  // When files are selected, append them (as File objects) to the current Documents list.
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const fileArray = Array.from(files);
    setFormValues((prev) => ({
      ...prev,
      Documents: prev.Documents ? [...prev.Documents, ...fileArray] : fileArray,
    }));
  };

  // Helper: read a File object and resolve with an object containing its name, size and data URL.
  const readFile = (
    file: File
  ): Promise<{ name: string; size: number; data: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          name: file.name,
          size: file.size,
          data: reader.result as string,
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Simulate upload progress and then read all files.
  const simulateUpload = (files: File[]): Promise<DocumentData[]> => {
    return new Promise((resolve, reject) => {
      setIsUploading(true);
      setUploadProgress(0);
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          Promise.all(files.map(readFile))
            .then((results) => {
              setIsUploading(false);
              resolve(results);
            })
            .catch((err) => {
              setIsUploading(false);
              reject(err);
            });
        }
      }, 100);
    });
  };

  // Handle document removal: open the confirmation dialog.
  const confirmRemoveDocument = (index: number) => {
    setDocToRemove(index);
    setIsDocRemoveDialogOpen(true);
  };

  // Remove the document once confirmed.
  const removeDocument = () => {
    if (docToRemove === null) return;
    const currentDocs: any[] = formValues.Documents || [];
    const updatedDocs = currentDocs.filter((_, i) => i !== docToRemove);
    setFormValues((prev) => ({ ...prev, Documents: updatedDocs }));
    setIsDocRemoveDialogOpen(false);
    setDocToRemove(null);
  };

  // ----------------------------
  // Existing Documents handler (if needed)
  // ----------------------------
  const handleDocuments = (
    id: string,
    key: keyof SchemaItem,
    value: string | boolean | string[]
  ) => {
    setFormValues((prev) => ({ ...prev, Documents: value }));
  };

  useEffect(() => {
    if (workflowState.rootItem) {
      console.log("Running useEffect workflowState.rootItem present...");
      const firstStep = workflowState.items[workflowState.rootItem];
      const currentStatus = firstStep?.name || "Draft";
      const nextApprover = firstStep?.nextApprover || "";

      setFormValues((prev) => ({
        ...prev,
        "Request Creator": user.name,
        "Request Workflow": workflowState.name,
        "Request Status": currentStatus,
        "Next Step Approver": nextApprover,
        "Next Step Approver Groups": firstStep.nextApproverGroups || [],
        "Previous Approver": user.name,
        "Request Created": getFormattedTodayDate("MM-DD-YYYY"),
      }));

      const steps = extractWorkflowSteps(workflowState.rootItem);
      setWorkflowSteps(steps);

      console.log("workflowState", workflowState);
    }
  }, [workflowState]);

  useEffect(() => {
    const newRequestNumber =
      data && data.length > 0
        ? (parseInt(data[data.length - 1]["Request Number"], 10) + 1)
            .toString()
            .padStart(7, "0")
        : "0000001";
    setFormValues((prev) => ({
      ...prev,
      "Request Number": newRequestNumber,
    }));
  }, [data]);

  // ----------------------------
  // Validation
  // ----------------------------
  const validateForm = () => {
    const newErrors: { [key: string]: boolean } = {};
    if (!formValues["Request Workflow"]) {
      newErrors["Request Workflow"] = true;
    }

    console.log(
      "VALIDATION FORM: formValues[Request Workflow]",
      formValues["Request Workflow"]
    );

    [...(schema || [])].forEach((field) => {
      if (field.isRequired && field.parameter !== "Request Status") {
        if (
          field.type.toUpperCase() === FIELD_TYPES.ITEMS.toUpperCase() &&
          (!Array.isArray(formValues[field.parameter]) ||
            formValues[field.parameter].length === 0)
        ) {
          newErrors[field.parameter] = true;
        } else if (
          field.type.toUpperCase() !== FIELD_TYPES.ITEMS.toUpperCase() &&
          (!formValues[field.parameter] ||
            formValues[field.parameter].toString().trim() === "")
        ) {
          newErrors[field.parameter] = true;
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ----------------------------
  // Submission
  // ----------------------------
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) {
      console.log("Failed Validation!");
      return;
    }
    let firstStep = "";
    if (workflowSteps.length > 0) {
      firstStep = workflowSteps[0];
    } else if (
      workflowState.rootItem &&
      workflowState.items[workflowState.rootItem]
    ) {
      firstStep = workflowState.items[workflowState.rootItem].name;
    }
    // Prepare the new row.
    const newRow: any = {
      ...formValues,
      id: rowData ? rowData.length + 1 : 1,
      workflow: {
        name: currentWorkflowName,
        currentStep: firstStep,
        orderedSteps: workflowSteps,
      },
    };

    // If there are documents to upload, simulate the upload now.
    if (newRow.Documents && newRow.Documents.length > 0) {
      try {
        const files: File[] = newRow.Documents;
        const results = await simulateUpload(files);
        newRow.Documents = results; // Each result has name, size, data.
        showToast("Documents uploaded successfully", "success");
      } catch (error) {
        showToast("Error uploading documents", "error");
        return;
      }
    }

    addRow(newRow);
    setFormValues({});
    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 3000);
    showToast("New Request Submitted successfully", "success");
    console.log(newRow);
  };

  // ----------------------------
  // Rendering
  // ----------------------------
  return (
    <div className="p-6 bg-white shadow-md rounded-md">
      <RequestToast />
      <h2 className="text-lg font-bold mb-4">Create New Order Request</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Specific Details Section */}
        <div>
          <h3 className="text-lg font-semibold mb-3">
            Customer Specific Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md">
            {schema
              ?.filter(
                (field) =>
                  field.parameter !== "Request Status" &&
                  ![
                    "Customer POC Name",
                    "Customer POC Email",
                    "Attention To ( If different )",
                  ].includes(field.parameter) &&
                  !field.parameter.startsWith("Shipping Address:")
              )
              .map((field) => {
                if (field.parameter === "Request Workflow") {
                  return (
                    <div key={field.id} className="space-y-2">
                      <Label
                        htmlFor={field.parameter}
                        className="font-medium text-sm"
                      >
                        {field.parameter}
                        {field.isRequired && (
                          <span className="text-blue-500 ml-1">*</span>
                        )}
                        {errors[field.parameter] && (
                          <span className="text-red-500 text-xs ml-2">
                            Required
                          </span>
                        )}
                      </Label>
                      <Select
                        value={currentWorkflowName || ""}
                        onValueChange={(value) => handleWorkflowChange(value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Workflow">
                            {currentWorkflowName}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {savedWorkflows.map((workflowName) => (
                            <SelectItem key={workflowName} value={workflowName}>
                              {workflowName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  );
                }
                if (field.parameter === "Next Step Approver") {
                  // Retrieve the single next approver from formValues or workflowState
                  const nextApprover =
                    formValues["Next Step Approver"] ||
                    (workflowState.rootItem &&
                      workflowState.items[workflowState.rootItem]
                        ?.nextApprover) ||
                    "Unassigned! Please Check Workflow Assignments";

                  // Check if the approver is unassigned
                  const isUnassigned =
                    nextApprover ===
                    "Unassigned! Please Check Workflow Assignments";

                  // Retrieve the next approver groups as an array of group names
                  const nextApproverGroups =
                    (workflowState.rootItem &&
                      workflowState.items[workflowState.rootItem]
                        ?.nextApproverGroups) ||
                    [];

                  return (
                    <div key={field.id} className="space-y-2">
                      <Label
                        htmlFor={field.parameter}
                        className="font-medium text-sm"
                      >
                        {field.parameter}
                        {field.isRequired && (
                          <span
                            className={
                              isUnassigned
                                ? "text-red-500 ml-1"
                                : "text-blue-500 ml-1"
                            }
                          >
                            *
                          </span>
                        )}
                        {errors[field.parameter] && (
                          <span className="text-red-500 text-xs ml-2">
                            Required
                          </span>
                        )}
                      </Label>
                      <div className="border p-2 rounded-md">
                        {/* Display the next approver with conditional styling */}
                        <span className={isUnassigned ? "text-red-500" : ""}>
                          {nextApprover}
                        </span>
                        {/* If groups exist, display them */}
                        {nextApproverGroups.length > 0 && (
                          <span className="ml-2">
                            {`+Groups( ${nextApproverGroups.join(", ")} )`}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                }

                /* Document upload field update */
                if (
                  field.type.toUpperCase() ===
                  FIELD_TYPES.DOCUMENTS.toUpperCase()
                ) {
                  return (
                    <fieldset
                      key={field.id}
                      className="md:col-span-2 border p-4 rounded-md"
                    >
                      <div className="space-y-2">
                        <Label
                          htmlFor={field.parameter}
                          className="font-medium text-sm pr-3"
                        >
                          {field.parameter}
                          {field.isRequired && (
                            <span className="text-blue-500 ml-1">*</span>
                          )}
                          {errors[field.parameter] && (
                            <span className="text-red-500 text-xs ml-2">
                              Required
                            </span>
                          )}
                        </Label>
                        <input
                          type="file"
                          multiple
                          onChange={handleFileChange}
                        />
                        {formValues.Documents &&
                          formValues.Documents.length > 0 && (
                            <div className="mt-2">
                              <p className="font-medium">Selected files:</p>
                              <ul>
                                {formValues.Documents.map(
                                  (doc: any, index: number) => (
                                    <li
                                      key={index}
                                      className="flex items-center justify-between border-b py-1"
                                    >
                                      <span>
                                        {doc.name} (
                                        {(doc.size / 1024).toFixed(2)} KB)
                                      </span>
                                      <Button
                                        variant="destructive"
                                        size="icon"
                                        onClick={() =>
                                          confirmRemoveDocument(index)
                                        }
                                      >
                                        🗑️
                                      </Button>
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>
                          )}
                      </div>
                    </fieldset>
                  );
                }
                // Handle the ITEMS field
                if (
                  field.type.toUpperCase() === FIELD_TYPES.ITEMS.toUpperCase()
                ) {
                  const items: RequestItem[] =
                    formValues[field.parameter] || [];
                  return (
                    <fieldset
                      key={field.id}
                      className="md:col-span-2 border p-4 rounded-md"
                    >
                      <legend className="px-2 font-semibold text-lg">
                        {field.parameter}
                        {field.isRequired && (
                          <span className="text-blue-500 ml-1">*</span>
                        )}
                        {errors[field.parameter] && (
                          <span className="text-red-500 text-xs ml-2">
                            * Required
                          </span>
                        )}
                      </legend>
                      {items.map((item, index) => (
                        <div
                          key={index}
                          className="flex flex-col md:flex-row gap-2 mb-2 items-center"
                        >
                          <div className="flex-1">
                            <Label className="text-sm">Product</Label>
                            <Select
                              value={item.product ? item.product : undefined}
                              onValueChange={(value) => {
                                const selectedProduct = PRODUCTS.find(
                                  (prod) => prod.product === value
                                );
                                handleRequestItemChange(
                                  index,
                                  "product",
                                  value
                                );
                                if (selectedProduct) {
                                  handleRequestItemChange(
                                    index,
                                    "price",
                                    selectedProduct.price
                                  );
                                }
                              }}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Product" />
                              </SelectTrigger>
                              <SelectContent>
                                {PRODUCTS.map((prod) => (
                                  <SelectItem
                                    key={prod.product}
                                    value={prod.product}
                                  >
                                    {prod.product}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex-1">
                            <Label className="text-sm">Price</Label>
                            <div className="border rounded-md px-2 py-2 text-sm bg-gray-100">
                              {new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: "USD",
                              }).format(item.price || 0)}
                            </div>
                          </div>
                          <div className="flex-1">
                            <Label className="text-sm">Amount</Label>
                            <Input
                              type="number"
                              placeholder="Amount"
                              value={item.amount}
                              onChange={(e) =>
                                handleRequestItemChange(
                                  index,
                                  "amount",
                                  parseInt(e.target.value, 10)
                                )
                              }
                            />
                          </div>
                          <div className="flex-1">
                            <Label className="text-sm">Line Total</Label>
                            <div className="border rounded-md px-2 py-2 text-sm bg-gray-100">
                              {new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: "USD",
                              }).format((item.price || 0) * (item.amount || 0))}
                            </div>
                          </div>
                          <Button
                            variant="destructive"
                            type="button"
                            onClick={() => handleRemoveRequestItem(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        onClick={handleAddRequestItem}
                        className="mt-2"
                      >
                        Add Request Item
                      </Button>
                      <div className="mt-4">
                        <Label className="text-sm">Total Amount</Label>
                        <div className="border rounded-md px-2 py-2 text-sm bg-gray-100">
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                          }).format(totalCost)}
                        </div>
                      </div>
                    </fieldset>
                  );
                }
                if (
                  field.type.toUpperCase() === FIELD_TYPES.DATE.toUpperCase()
                ) {
                  return (
                    <div key={field.id} className="space-y-2">
                      <Label
                        htmlFor={field.parameter}
                        className="font-medium text-sm"
                      >
                        {field.parameter}
                        {field.isRequired && (
                          <span className="text-blue-500 ml-1">*</span>
                        )}
                        {errors[field.parameter] && (
                          <span className="text-red-500 text-xs ml-2">
                            * Required
                          </span>
                        )}
                      </Label>
                      <div className="relative">
                        <DatePicker
                          selected={
                            formValues[field.parameter]
                              ? parse(
                                  formValues[field.parameter],
                                  DATE_FORMATS[field.format ?? "YYYY-MM-DD"],
                                  new Date()
                                )
                              : null
                          }
                          onChange={(date) =>
                            handleDateChange(
                              field.parameter,
                              date,
                              DATE_FORMATS[field.format ?? "YYYY-MM-DD"]
                            )
                          }
                          dateFormat={
                            DATE_FORMATS[field.format ?? "YYYY-MM-DD"]
                          }
                          className="w-full border rounded-md px-2 py-2 text-sm"
                          readOnly={field.readOnly}
                        />
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={field.id} className="space-y-2">
                    <Label
                      htmlFor={field.parameter}
                      className="font-medium text-sm"
                    >
                      {field.parameter}
                      {field.isRequired && (
                        <span className="text-blue-500 ml-1">*</span>
                      )}
                      {errors[field.parameter] && (
                        <span className="text-red-500 text-xs ml-2">
                          * Required
                        </span>
                      )}
                    </Label>
                    <Input
                      type="text"
                      readOnly={field.readOnly}
                      value={formValues[field.parameter] ?? ""}
                      onChange={(e) =>
                        handleInputChange(field.parameter, e.target.value)
                      }
                    />
                  </div>
                );
              })}
          </div>
        </div>

        {/* Shipping Details Section */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-semibold mb-3">Shipping Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SHIPPING_FIELDS.filter((field) =>
              [
                "Customer POC Name",
                "Customer POC Email",
                "Attention To ( If different )",
              ].includes(field.parameter)
            ).map((field) => (
              <div key={field.id} className="space-y-2">
                <Label
                  htmlFor={field.parameter}
                  className="font-medium text-sm"
                >
                  {field.parameter}
                  {field.isRequired && (
                    <span className="text-blue-500 ml-1">*</span>
                  )}
                  {errors[field.parameter] && (
                    <span className="text-red-500 text-xs ml-2">
                      * Required
                    </span>
                  )}
                </Label>
                <Input
                  type="text"
                  value={formValues[field.parameter] ?? ""}
                  onChange={(e) =>
                    handleInputChange(field.parameter, e.target.value)
                  }
                />
              </div>
            ))}
          </div>
          <fieldset className="mt-4 border p-4 rounded-md">
            <legend className="px-2 font-semibold">Shipping Address</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SHIPPING_FIELDS.filter((field) =>
                field.parameter.startsWith("Shipping Address:")
              ).map((field) => {
                if (field.parameter === "Shipping Address: State") {
                  return (
                    <div key={field.id} className="space-y-2">
                      <Label
                        htmlFor={field.parameter}
                        className="font-medium text-sm"
                      >
                        {field.parameter.replace("Shipping Address: ", "")}
                        {field.isRequired && (
                          <span className="text-blue-500 ml-1">*</span>
                        )}
                        {errors[field.parameter] && (
                          <span className="text-red-500 text-xs ml-2">
                            * Required
                          </span>
                        )}
                      </Label>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="w-full border rounded-md px-2 py-2 text-sm text-left">
                          {formValues[field.parameter] || "Select a State"}
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {US_STATES.map((state) => (
                            <DropdownMenuItem
                              key={state}
                              onSelect={() =>
                                handleInputChange(field.parameter, state)
                              }
                            >
                              {state}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  );
                }
                return (
                  <div key={field.id} className="space-y-2">
                    <Label
                      htmlFor={field.parameter}
                      className="font-medium text-sm"
                    >
                      {field.parameter.replace("Shipping Address: ", "")}
                      {field.isRequired && (
                        <span className="text-blue-500 ml-1">*</span>
                      )}
                      {errors[field.parameter] && (
                        <span className="text-red-500 text-xs ml-2">
                          * Required
                        </span>
                      )}
                    </Label>
                    <Input
                      type="text"
                      value={formValues[field.parameter] ?? ""}
                      onChange={(e) =>
                        handleInputChange(field.parameter, e.target.value)
                      }
                    />
                  </div>
                );
              })}
            </div>
          </fieldset>
        </div>

        <div className="flex justify-center space-x-4">
          <Button type="submit" variant={"outline"}>
            Save Draft
          </Button>
          <Button
            type="submit"
            className="bg-blue-800 text-white"
            variant={"outline"}
          >
            Submit
          </Button>
        </div>
      </form>

      {/* Document Removal Confirmation Dialog */}
      <Dialog
        open={isDocRemoveDialogOpen}
        onOpenChange={setIsDocRemoveDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this document?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDocRemoveDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={removeDocument}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Progress Dialog (displayed during submission) */}
      <Dialog open={isUploading}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Uploading Documents</DialogTitle>
            <DialogDescription>{uploadProgress}% completed</DialogDescription>
          </DialogHeader>
          <div className="w-full bg-gray-200 rounded h-4">
            <div
              className="bg-blue-600 h-4 rounded"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderRequestForm;
