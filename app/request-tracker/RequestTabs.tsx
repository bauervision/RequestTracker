import { Button } from "@/components/ui/button";
import { useWorkflow } from "@/app/context/WorkflowContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRequestContext } from "../context/DataContext";

import RequestToast, { showToast } from "@/components/Requests/RequestToast";
import { useFetchWithToast } from "@/hooks/fetchWithToast";
import OrderForm from "./OrderForm";
import { useEffect, useMemo, useRef, useState } from "react";
import { DocumentData, RequestItem, useSchema } from "../context/SchemaContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PRODUCTS } from "../constants";
import { useUser } from "@/app/context/UserContext";
import { useRouter } from "next/navigation";
import { AccessRole } from "../constants";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

export function RequestTabs() {
  const { state: workflowState } = useWorkflow();
  const { selectedRow } = useRequestContext();
  const { rowData, setRowData } = useSchema();
  const { fetchWithToast } = useFetchWithToast();
  const { user } = useUser();
  const router = useRouter();

  // Local state for the order to allow modifications
  const [order, setOrder] = useState<Record<string, any>>(selectedRow ?? {});

  // Initialize items from order.requestedItems (or an empty array if not defined).
  const [items, setItems] = useState<RequestItem[]>(order.requestedItems || []);

  // State to control the delete confirmation dialog.
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // At the top of RequestTabs, along with your other useState hooks:
  const [pendingAction, setPendingAction] = useState<
    "approve" | "reject" | null
  >(null);
  const [comment, setComment] = useState("");

  // New state variables for additional UI elements:
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [certified, setCertified] = useState(false);

  const [isDocDialogOpen, setIsDocDialogOpen] = useState(false);
  // ----- NEW: Documents state -----
  // We'll assume the request stores documents as an array of objects.
  const [docs, setDocs] = useState<DocumentData[]>(
    selectedRow?.["Documents"] || []
  );
  const [selectedDocument, setSelectedDocument] = useState<
    DocumentData | string | null
  >(null);

  // State for the currently selected document (for download/viewing)

  // Download flow states:
  const [isDownloadConfirmDialogOpen, setIsDownloadConfirmDialogOpen] =
    useState(false);
  const [isDownloadProgressDialogOpen, setIsDownloadProgressDialogOpen] =
    useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isFileViewerOpen, setIsFileViewerOpen] = useState(false);

  // Upload new documents states (for adding new docs)
  const [isUploadInProgress, setIsUploadInProgress] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync items back into the order whenever items change.
  useEffect(() => {
    setOrder((prev) => ({ ...prev, requestedItems: items }));
  }, [items]);

  useEffect(() => {
    if (selectedRow) {
      setItems(selectedRow["Requested Items"] || []);
      setDocs(selectedRow?.["Documents"] || []);
    }
  }, [selectedRow]);

  // Get the documents array from the request (or an empty array if none).
  const documents: string[] = selectedRow?.["Documents"] || [];

  // File upload handler (same as in TaskSheet)
  const handleReportUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setReportFile(files[0]);
    }
  };

  // Handlers for Requested Items.
  const handleRequestItemChange = (
    index: number,
    key: keyof RequestItem,
    value: any
  ) => {
    setItems((prev) => {
      const newItems = [...prev];
      newItems[index] = { ...newItems[index], [key]: value };
      return newItems;
    });
  };

  const handleRemoveRequestItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddRequestItem = () => {
    setItems((prev) => [...prev, { product: "", price: 0, amount: 1 }]);
  };

  const totalCost = items.reduce(
    (sum, item) => sum + (item.price || 0) * (item.amount || 0),
    0
  );

  if (!selectedRow) {
    return <div>NoData</div>;
  }

  // ----- Document Download Handlers -----
  // Called when a document button is clicked.
  const handleDocumentClick = (doc: any) => {
    setSelectedDocument(doc);
    setIsDownloadConfirmDialogOpen(true);
  };

  // Called when the user confirms download.
  const startDownloadSimulation = () => {
    setIsDownloadConfirmDialogOpen(false);
    setIsDownloadProgressDialogOpen(true);
    setDownloadProgress(0);
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsDownloadProgressDialogOpen(false);
          setIsFileViewerOpen(true);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  // ----- Document Upload Handlers -----
  // Read a file into an object with name, size, and data URL.
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

  // When user selects new files via the hidden file input.
  const handleNewFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const fileArray = Array.from(files);
    setIsUploadInProgress(true);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          Promise.all(fileArray.map(readFile))
            .then((results) => {
              // Append new documents to the existing docs array.
              setDocs((prevDocs) => [...prevDocs, ...results]);
              showToast("Documents uploaded successfully", "success");
              setIsUploadInProgress(false);
            })
            .catch((err) => {
              showToast("Error uploading documents", "error");
              setIsUploadInProgress(false);
            });
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  const handleRequestSave = async (newStatus?: string) => {
    const result = await fetchWithToast("test");
  };

  const handleCommentChange = (text: string) => {
    console.log(text);
  };

  // New handler to save only the items back to context.
  const handleSaveItems = () => {
    if (rowData) {
      // Update the current order's "Requested Items" in the rowData array.
      const updatedRowData = rowData.map((orderItem) =>
        orderItem.id === order.id
          ? { ...orderItem, "Requested Items": items }
          : orderItem
      );
      setRowData(updatedRowData);
      showToast("Items saved successfully", "success");
    }
  };

  // This handler updates the order state when a field changes.
  const handleFieldChange = (fieldName: string, value: any) => {
    setOrder((prev: any) => ({ ...prev, [fieldName]: value }));
  };

  const { workflowName, progress } = useMemo(() => {
    const workflow = selectedRow.workflow;
    // Use the workflow's name if available, otherwise fall back to the "Request Workflow" field.
    const name = workflow?.name || selectedRow["Request Workflow"] || "";
    const currentStep =
      workflow?.currentStep || selectedRow["Request Status"] || "";
    // Get the ordered steps from the workflow.
    const steps: string[] = workflow?.orderedSteps || [];

    if (steps.length > 0) {
      const totalSteps = steps.length;
      const currentIndex = steps.findIndex((step) => step === currentStep);
      if (currentIndex === -1) return { workflowName: name, progress: 0 };
      // Force 100% if at the last step.
      if (currentIndex === totalSteps - 1)
        return { workflowName: name, progress: 100 };
      const progressPercent = Math.round((currentIndex / totalSteps) * 100);
      return { workflowName: name, progress: progressPercent };
    }
    return { workflowName: name, progress: 0 };
  }, [selectedRow]);

  // Determine if there are any comments to display.
  const hasComments = selectedRow.comments && selectedRow.comments.length > 0;

  // Delete request handler – only available for ADMIN and SUPER_ADMIN
  const handleDeleteRequest = () => {
    // Remove the current order from rowData.
    if (rowData) {
      const updatedRowData = rowData.filter(
        (orderItem) => orderItem.id !== order.id
      );
      setRowData(updatedRowData);
      showToast("Request deleted successfully", "success");
      // Close the dialog and redirect back to "/request-tracker"
      setIsDeleteDialogOpen(false);
      router.push("/request-tracker");
    }
  };

  // Evaluate if the user has access to delete a request.
  const canDelete =
    user &&
    (user.role === AccessRole.SUPER_ADMIN || user.role === AccessRole.ADMIN);

  const handleSubmitAction = () => {
    if (!comment.trim()) {
      showToast("Comment is required.", "error");
      return;
    }

    const timestamp = new Date().toLocaleString();
    const formattedComment = `[${selectedRow.workflow.currentStep}] "${comment}" - ${user.name} ${timestamp}`;

    // Copy current request
    let updatedRequest = { ...selectedRow };

    // Get current workflow item from workflowState
    const currentWorkflowItem = Object.values(workflowState.items).find(
      (item: any) => item.name === selectedRow.workflow.currentStep
    );

    if (!currentWorkflowItem) {
      showToast("Current workflow step not found.", "error");
      setPendingAction(null);
      return;
    }

    if (pendingAction === "approve") {
      if (currentWorkflowItem.children.length > 0) {
        const nextItemId = currentWorkflowItem.children[0];
        const nextItem = workflowState.items[nextItemId];

        if (nextItem) {
          updatedRequest = {
            ...updatedRequest,
            workflow: {
              ...updatedRequest.workflow,
              currentStep: nextItem.name,
            },
            "Next Step Approver": nextItem.nextApprover || "",
            "Next Step Approver Groups": nextItem.nextApproverGroups || [],
            "Previous Approver": user.name,
            "Request Status": nextItem.name,
          };
          showToast(
            `Request approved. Moved to step: ${nextItem.name}. Prev Approver: ${nextItem.prevApprover}, Next Approver: ${nextItem.nextApprover}.`,
            "success"
          );
          console.log("APPROVAL event triggered:", nextItem.onApproval);
        } else {
          showToast("Next workflow step not found.", "error");
          setPendingAction(null);
          return;
        }
      } else {
        showToast("This request is already at the final step.", "info");
        setPendingAction(null);
        return;
      }
    } else if (pendingAction === "reject") {
      // Find the parent workflow item.
      const parentWorkflowItem = Object.values(workflowState.items).find(
        (item: any) =>
          item.children && item.children.includes(currentWorkflowItem.id)
      );
      if (!parentWorkflowItem) {
        showToast(
          "Cannot reject request. Already at the initial step.",
          "info"
        );
        setPendingAction(null);
        return;
      }
      updatedRequest = {
        ...updatedRequest,
        workflow: {
          ...updatedRequest.workflow,
          currentStep: parentWorkflowItem.name,
        },
        "Next Step Approver": selectedRow["Previous Approver"],
        "Next Step Approver Groups":
          selectedRow["Previous Approver Groups"] || [],
        "Previous Approver": user.name,
        "Request Status": parentWorkflowItem.name,
      };
      showToast(
        `Request rejected. Moved back to step: ${parentWorkflowItem.name}. Next Approver: ${selectedRow["Previous Approver"]}`,
        "error"
      );
      console.log("REJECTION event triggered:", parentWorkflowItem.onRejection);
    }

    // Append the comment
    if (Array.isArray(updatedRequest.comments)) {
      updatedRequest.comments.push(formattedComment);
    } else {
      updatedRequest.comments = [formattedComment];
    }

    // Update the request in rowData
    if (rowData) {
      const updatedRowData = rowData.map((r: any) =>
        r.id === updatedRequest.id ? updatedRequest : r
      );
      setRowData(updatedRowData);
      // Reset state
      setPendingAction(null);
      setComment("");
      setReportFile(null);
      setCertified(false);
    }
  };

  // Combine access level with the designated step.
  const canEditRequestStep = useMemo(() => {
    // Super Admins can edit regardless of the current step.
    if (user.role === AccessRole.SUPER_ADMIN) {
      return true;
    }
    // For other users, only allow editing if they are the designated nextApprover.
    // Optionally, you could also check that the request is currently at the step where approval is expected.
    const currentStep =
      selectedRow.workflow?.currentStep || selectedRow["Request Status"];
    return selectedRow["Next Step Approver"] === user.name;
  }, [user, selectedRow]);

  return (
    <>
      {canDelete && (
        <div className="mb-4">
          {/* Delete Request COnfirmation dialog */}
          <Dialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                Delete Request
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this request? This action
                  cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteRequest}>
                  Delete Request
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
      <Tabs defaultValue="info" className="mx-6">
        <RequestToast />
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="info">Request Information</TabsTrigger>
          {/* Disable the Documents tab trigger if there are no documents */}
          <TabsTrigger value="docs">Documents</TabsTrigger>
          <TabsTrigger value="items">Request Line Items</TabsTrigger>
          <TabsTrigger value="orders" disabled>
            Orders
          </TabsTrigger>
          <TabsTrigger value="ship" disabled>
            Shipments
          </TabsTrigger>
          <TabsTrigger value="forms" disabled>
            Forms
          </TabsTrigger>
          <TabsTrigger value="comments" disabled={!hasComments}>
            Status Comments
          </TabsTrigger>
        </TabsList>

        {/* Request Information Tab */}
        <TabsContent value="info">
          <Card>
            <CardHeader>
              {/* Progress Bar with Text Inside */}
              <div className="relative w-full bg-gray-200 rounded h-8">
                <div
                  className="bg-blue-600 h-8 rounded"
                  style={{ width: `${progress}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
                  {workflowName}: {progress}%
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* Render dynamic order fields */}
              <OrderForm order={order} onFieldChange={handleFieldChange} />
              {canEditRequestStep && (
                <Button
                  type="button"
                  variant="default"
                  className="bg-blue-800 text-white mt-4"
                  onClick={() => handleRequestSave()}
                >
                  Save Changes
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="docs">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>
                All documents associated with the request.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label className="block">Current Documents</Label>
                {docs.length > 0 ? (
                  docs.map((doc, index) => (
                    <Button
                      key={index}
                      variant="link"
                      className="block text-left"
                      onClick={() => handleDocumentClick(doc)}
                    >
                      {doc.name} ({(doc.size / 1024).toFixed(2)} KB)
                    </Button>
                  ))
                ) : (
                  <p>No documents available.</p>
                )}
              </div>
              {/* Add New Documents Button only if canEditRequestStep */}
              {canEditRequestStep && (
                <div className="mt-4">
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Add New Documents
                  </Button>
                  <input
                    type="file"
                    multiple
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleNewFileUpload}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Requested Items Tab */}
        <TabsContent value="items">
          <Card>
            <CardHeader>
              <CardTitle>Requested Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <fieldset className="md:col-span-2 border p-4 rounded-md">
                <legend className="px-2 font-semibold text-lg">
                  Requested Items
                </legend>
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col md:flex-row gap-2 mb-2 items-center"
                  >
                    {/* Product Dropdown */}
                    <div className="flex-1">
                      <Label className="text-sm">Product</Label>
                      {canEditRequestStep ? (
                        <Select
                          value={item.product || ""}
                          onValueChange={(value) => {
                            const selectedProduct = PRODUCTS.find(
                              (prod) => prod.product === value
                            );
                            handleRequestItemChange(index, "product", value);
                            if (selectedProduct) {
                              // Auto-populate the price when a product is selected.
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
                      ) : (
                        // Read-only view styled to match the select
                        <div className="w-full border rounded px-3 py-2 bg-gray-100">
                          {item.product || "Select Product"}
                        </div>
                      )}
                    </div>
                    {/* Price Display */}
                    <div className="flex-1">
                      <Label className="text-sm">Price</Label>
                      <div className="border rounded-md px-2 py-2 text-sm bg-gray-100">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                        }).format(item.price || 0)}
                      </div>
                    </div>
                    {/* Amount Input */}
                    <div className="flex-1">
                      <Label className="text-sm">Amount</Label>
                      <Input
                        type="number"
                        placeholder="Amount"
                        value={item.amount}
                        disabled={!canEditRequestStep}
                        onChange={(e) =>
                          handleRequestItemChange(
                            index,
                            "amount",
                            parseInt(e.target.value, 10)
                          )
                        }
                      />
                    </div>
                    {/* Line Total Display */}
                    <div className="flex-1">
                      <Label className="text-sm">Line Total</Label>
                      <div className="border rounded-md px-2 py-2 text-sm bg-gray-100">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                        }).format((item.price || 0) * (item.amount || 0))}
                      </div>
                    </div>
                    {canEditRequestStep && (
                      <Button
                        variant="destructive"
                        type="button"
                        onClick={() => handleRemoveRequestItem(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                {canEditRequestStep && (
                  <Button
                    type="button"
                    onClick={handleAddRequestItem}
                    className="mt-2"
                  >
                    Add Request Item
                  </Button>
                )}
                {/* Total Amount Field */}
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
              {/* Save Items Button */}
              {canEditRequestStep && (
                <Button
                  type="button"
                  onClick={handleSaveItems}
                  className="bg-green-600 text-white mt-4"
                >
                  Save Items
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Orders</CardTitle>
              <CardDescription>Orders for requests.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <div className="gap-4 py-8 requestBG pb-20">
                  <Label htmlFor="current">Current Status</Label>
                  <div>Status Data Here</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shipments Tab */}
        <TabsContent value="ship">
          <Card>
            <CardHeader>
              <CardTitle>Shipments</CardTitle>
              <CardDescription>Shipments requests.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <div className="gap-4 py-8 requestBG pb-20">
                  <Label htmlFor="current">Current Status</Label>
                  <div>Status Data Here</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Forms Tab */}
        <TabsContent value="forms">
          <Card>
            <CardHeader>
              <CardTitle>Forms</CardTitle>
              <CardDescription>Forms for requests.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <div className="gap-4 py-8 requestBG pb-20">
                  <Label htmlFor="current">Current Status</Label>
                  <div>Status Data Here</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comments Tab */}
        <TabsContent value="comments">
          <Card>
            <CardHeader>
              <CardTitle>Comments</CardTitle>
              <CardDescription>All comments for requests.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {hasComments ? (
                <ol className="list-decimal list-inside">
                  {selectedRow.comments.map(
                    (comment: string, index: number) => (
                      <li key={index}>{comment}</li>
                    )
                  )}
                </ol>
              ) : (
                <p>No comments available.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Download Confirmation Dialog */}
      <Dialog
        open={isDownloadConfirmDialogOpen}
        onOpenChange={setIsDownloadConfirmDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Download</DialogTitle>
            <DialogDescription>
              Download{" "}
              {typeof selectedDocument === "object" && selectedDocument !== null
                ? selectedDocument.name
                : selectedDocument}
              ?<br />
              Size:{" "}
              {typeof selectedDocument === "object" && selectedDocument !== null
                ? (selectedDocument.size / 1024).toFixed(2)
                : "N/A"}{" "}
              KB
              <br />
              Estimated download time: 1 second.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDownloadConfirmDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="default" onClick={startDownloadSimulation}>
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Download Progress Dialog */}
      <Dialog open={isDownloadProgressDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Downloading...</DialogTitle>
            <DialogDescription>{downloadProgress}% completed</DialogDescription>
          </DialogHeader>
          <div className="w-full bg-gray-200 rounded h-4">
            <div
              className="bg-blue-600 h-4 rounded"
              style={{ width: `${downloadProgress}%` }}
            ></div>
          </div>
        </DialogContent>
      </Dialog>

      {/* File Viewer Dialog */}
      <Dialog open={isFileViewerOpen} onOpenChange={setIsFileViewerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {typeof selectedDocument === "object" && selectedDocument !== null
                ? selectedDocument.name
                : selectedDocument}
            </DialogTitle>

            <DialogDescription>File Viewer</DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {typeof selectedDocument === "object" &&
            selectedDocument !== null &&
            selectedDocument.data ? (
              selectedDocument.data.startsWith("data:image") ? (
                <img
                  src={selectedDocument.data}
                  alt={selectedDocument.name}
                  className="max-w-full h-auto"
                />
              ) : (
                <iframe
                  src={selectedDocument.data}
                  className="w-full h-80"
                  title={selectedDocument.name}
                />
              )
            ) : (
              <p>No file data available.</p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsFileViewerOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Progress Dialog */}
      <Dialog open={isUploadInProgress}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Uploading Documents</DialogTitle>
            <DialogDescription>{uploadProgress}% completed</DialogDescription>
          </DialogHeader>
          <div className="w-full bg-gray-200 rounded h-4">
            <div
              className="bg-green-600 h-4 rounded"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Approval/Reject Section */}
      {canEditRequestStep && (
        <div className="p-4 border-t mt-4">
          {!pendingAction ? (
            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={() => setPendingAction("approve")}
              >
                Approve
              </Button>
              <Button
                variant="destructive"
                onClick={() => setPendingAction("reject")}
              >
                Reject
              </Button>
            </div>
          ) : (
            <div className="mt-4">
              {(() => {
                const currentWorkflowItem = Object.values(
                  workflowState.items
                ).find(
                  (item: any) => item.name === selectedRow.workflow.currentStep
                );
                return (
                  <>
                    {/* Display instructions if available */}
                    {currentWorkflowItem &&
                      !currentWorkflowItem.easyApproval &&
                      currentWorkflowItem.approverComment && (
                        <div className="mb-2">
                          <h4 className="text-md font-semibold">
                            Instruction:
                          </h4>
                          <p className="text-sm text-gray-600">
                            {currentWorkflowItem.approverComment}
                          </p>
                        </div>
                      )}
                    {/* File upload for Generate Report action */}
                    {currentWorkflowItem &&
                      currentWorkflowItem.approverAction ===
                        "Generate Report" && (
                        <>
                          <h4 className="text-md font-semibold mb-2">
                            Upload Report:
                          </h4>
                          {reportFile ? (
                            <p className="text-green-600">
                              Report uploaded: {reportFile.name}
                            </p>
                          ) : (
                            <input
                              type="file"
                              accept="application/pdf,image/*"
                              onChange={handleReportUpload}
                            />
                          )}
                        </>
                      )}
                    {/* Certification checkbox for Initiate Communication or Other actions */}
                    {currentWorkflowItem &&
                      (currentWorkflowItem.approverAction ===
                        "Initiate Communication" ||
                        currentWorkflowItem.approverAction === "Other") && (
                        <div className="flex items-center mt-2">
                          <input
                            type="checkbox"
                            checked={certified}
                            onChange={(e) => setCertified(e.target.checked)}
                          />
                          <span className="ml-2 text-xs text-gray-600">
                            I certify that the above requirement(s) have been
                            settled correctly and this request can be advanced.
                          </span>
                        </div>
                      )}
                  </>
                );
              })()}
              <div className="mt-4">
                <h4 className="text-md font-semibold mb-2">
                  Comment is required:
                </h4>
                <textarea
                  className="w-full p-2 border rounded"
                  placeholder="Enter your comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="mt-2 flex space-x-2">
                {/* Submit Button */}
                <Button
                  variant="outline"
                  onClick={handleSubmitAction}
                  disabled={
                    !comment.trim() ||
                    (workflowState &&
                      (() => {
                        const currentWorkflowItem = Object.values(
                          workflowState.items
                        ).find(
                          (item: any) =>
                            item.name === selectedRow.workflow.currentStep
                        );
                        if (!currentWorkflowItem) return false;
                        if (
                          currentWorkflowItem.approverAction ===
                            "Generate Report" &&
                          !reportFile
                        )
                          return true;
                        if (
                          (currentWorkflowItem.approverAction ===
                            "Initiate Communication" ||
                            currentWorkflowItem.approverAction === "Other") &&
                          !certified
                        )
                          return true;
                        return false;
                      })())
                  }
                >
                  Submit
                </Button>
                {/* Cancel Button */}
                <Button
                  variant="destructive"
                  onClick={() => {
                    setPendingAction(null);
                    setComment("");
                    setReportFile(null);
                    setCertified(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
