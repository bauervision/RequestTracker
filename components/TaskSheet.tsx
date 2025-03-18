"use client";

import React, { useState, useEffect } from "react";
import ReactJson from "react-json-view";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useSchema } from "@/app/context/SchemaContext";
import { useUser } from "@/app/context/UserContext";
import { useWorkflow } from "@/app/context/WorkflowContext";
import RequestToast, { showToast } from "./Requests/RequestToast";
import Link from "next/link";
import { useRequestContext } from "@/app/context/DataContext";
import { useUserGroup } from "@/app/context/UserGroupContext";

const TaskSheet: React.FC = () => {
  const { rowData, setRowData } = useSchema();
  const { selectRow } = useRequestContext();
  const { user } = useUser();
  const { state: workflowState } = useWorkflow();
  const { groups: availableGroups } = useUserGroup();
  const [tasks, setTasks] = useState<any[]>([]);
  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // New state for handling the comment input flow.
  const [pendingAction, setPendingAction] = useState<
    "approve" | "reject" | null
  >(null);
  const [pendingTask, setPendingTask] = useState<any>(null);
  const [comment, setComment] = useState("");

  const [reportFile, setReportFile] = useState<File | null>(null);
  const [certified, setCertified] = useState(false);

  const handleReportUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setReportFile(files[0]);
    }
  };

  // Filter tasks assigned to the current user.
  useEffect(() => {
    if (rowData && user) {
      const filteredTasks = rowData.filter((task: any) => {
        // Check if the task's single next approver matches the logged in user.
        const singleApproverMatch = task["Next Step Approver"] === user.name;

        // Check if the task's next approver groups include a group that the user is a member of.
        const groupApproverMatch =
          Array.isArray(task["Next Step Approver Groups"]) &&
          task["Next Step Approver Groups"].some((groupName: string) => {
            const group = availableGroups.find((g) => g.name === groupName);
            console.log(group);
            return group && group.userNames.includes(user.name);
          });

        return singleApproverMatch || groupApproverMatch;
      });
      setTasks(filteredTasks);
    }
  }, [rowData, user, availableGroups]);

  const handleTaskClick = (taskId: number) => {
    setExpandedTaskId((prev) => (prev === taskId ? null : taskId));
  };

  // When Approve is clicked, simply set the pending action.
  const initiateApprove = (task: any) => {
    setPendingTask(task);
    setPendingAction("approve");
  };

  // When Reject is clicked, simply set the pending action.
  const initiateReject = (task: any) => {
    setPendingTask(task);
    setPendingAction("reject");
  };

  // After the user enters a comment and clicks Submit, this function processes the workflow update.
  const handleSubmitAction = () => {
    if (!comment.trim()) {
      showToast("Comment is required.", "error");
      return;
    }

    // Capture the current workflow step before updating.
    const step = pendingTask.workflow.currentStep;
    const timestamp = new Date().toLocaleString(); // Formats date and time.

    // Build the comment string with the step, the quoted comment, the user's name, and the timestamp.
    const commentWithUser = `[${step}] "${comment}" - ${user.name} ${timestamp}`;

    let updatedTask = { ...pendingTask };

    // Add the comment to the task’s comments array.
    if (Array.isArray(updatedTask.comments)) {
      updatedTask.comments.push(commentWithUser);
    } else {
      updatedTask.comments = [commentWithUser];
    }

    if (pendingAction === "approve") {
      // Approval logic: find the current workflow item.
      const currentWorkflowItem = Object.values(workflowState.items).find(
        (item: any) => item.name === pendingTask.workflow.currentStep
      );

      if (!currentWorkflowItem) {
        showToast("Next workflow step not found.", "error");
        resetPendingAction();
        return;
      }

      if (currentWorkflowItem.children.length > 0) {
        const nextItemId = currentWorkflowItem.children[0];
        const nextItem = workflowState.items[nextItemId];

        if (nextItem) {
          updatedTask = {
            ...updatedTask,
            workflow: {
              ...updatedTask.workflow,
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
          resetPendingAction();
          return;
        }
      } else {
        showToast("This request is already at the final step.", "info");
        resetPendingAction();
        return;
      }
    } else if (pendingAction === "reject") {
      // Rejection logic: find the current and then parent workflow item.
      const currentWorkflowItem = Object.values(workflowState.items).find(
        (item: any) => item.name === pendingTask.workflow.currentStep
      );
      if (!currentWorkflowItem) {
        showToast("Current workflow step not found.", "error");
        resetPendingAction();
        return;
      }
      const parentWorkflowItem = Object.values(workflowState.items).find(
        (item: any) =>
          item.children && item.children.includes(currentWorkflowItem.id)
      );
      if (!parentWorkflowItem) {
        showToast(
          "Cannot reject request. Already at the initial step.",
          "info"
        );
        resetPendingAction();
        return;
      }
      updatedTask = {
        ...updatedTask,
        workflow: {
          ...updatedTask.workflow,
          currentStep: parentWorkflowItem.name,
        },
        "Next Step Approver": pendingTask["Previous Approver"],
        "Next Step Approver Groups":
          pendingTask["Previous Approver Groups"] || [],
        "Previous Approver": user.name,
        "Request Status": parentWorkflowItem.name,
      };
      showToast(
        `Request rejected. Moved back to step: ${parentWorkflowItem.name}. Next Approver: ${pendingTask["Previous Approver"]}`,
        "error"
      );

      console.log("REJECTION event triggered:", parentWorkflowItem.onRejection);
    }

    // Update the task in rowData.
    if (rowData) {
      const updatedRowData = rowData.map((r: any) =>
        r.id === updatedTask.id ? updatedTask : r
      );
      setRowData(updatedRowData);
    }

    resetPendingAction();
  };

  // Helper to reset the pending action and comment.
  const resetPendingAction = () => {
    setPendingTask(null);
    setPendingAction(null);
    setComment("");
  };

  const handleOpeningFullRequest = (task: any) => {
    console.log("Opening full request", task, rowData);
    selectRow(task);
  };

  return (
    <div className="pb-2">
      <RequestToast />
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="bg-blue-950 text-white">
            You have {tasks.length} Pending Actions
          </Button>
        </SheetTrigger>

        <SheetContent>
          <div className="p-4">
            <h2 className="text-xl font-bold">Your Actions</h2>
            <div
              className="mt-4"
              style={{ maxHeight: "60vh", overflowY: "auto" }}
            >
              <ul className="space-y-2">
                {tasks.map((task) => (
                  <li key={task.id} className="border p-2 rounded">
                    <Button
                      variant="outline"
                      onClick={() => handleTaskClick(task.id)}
                    >
                      {task["Request Number"]
                        ? `Request ${task["Request Number"]}`
                        : task["Request Workflow"] || "Task"}
                    </Button>
                    {expandedTaskId === task.id && (
                      <div className="mt-2 p-2 border rounded">
                        <h3 className="text-lg font-bold">
                          {task["Request Workflow"] || "Task Details"}
                        </h3>
                        <ReactJson
                          src={task}
                          name={false}
                          collapsed={true}
                          enableClipboard={false}
                          displayDataTypes={false}
                        />
                        <div className="mt-2 flex space-x-2">
                          <Button
                            variant="outline"
                            onClick={() => initiateApprove(task)}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => initiateReject(task)}
                          >
                            Reject
                          </Button>
                          <Link href={`/request-tracker/${task["id"]}`}>
                            <Button
                              variant="outline"
                              className="bg-blue-800 text-white"
                              onClick={() => handleOpeningFullRequest(task)}
                            >
                              View Request
                            </Button>
                          </Link>
                        </div>
                        {pendingTask && pendingTask.id === task.id && (
                          <div className="mt-4 border p-2 rounded">
                            {(() => {
                              // Retrieve the current workflow item for this task.
                              const currentWorkflowItem = Object.values(
                                workflowState.items
                              ).find(
                                (item: any) =>
                                  item.name === pendingTask.workflow.currentStep
                              );
                              return (
                                <>
                                  {/* If the step is not easyApproval and has an approverComment, show instructions */}
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
                                  {currentWorkflowItem &&
                                    (currentWorkflowItem.approverAction ===
                                      "Initiate Communication" ||
                                      currentWorkflowItem.approverAction ===
                                        "Other") && (
                                      <div className="flex items-center mt-2">
                                        <input
                                          type="checkbox"
                                          checked={certified}
                                          onChange={(e) =>
                                            setCertified(e.target.checked)
                                          }
                                        />
                                        <span className="ml-2 text-xs text-gray-600">
                                          I certify that the above
                                          requirement(s) have been settled
                                          correctly and this request can be
                                          advanced.
                                        </span>
                                      </div>
                                    )}
                                  <div className="mt-4">
                                    <h4 className="text-md font-semibold mb-2">
                                      Comment is required:
                                    </h4>
                                    <textarea
                                      className="w-full p-2 border rounded"
                                      placeholder="Enter your comment..."
                                      value={comment}
                                      onChange={(e) =>
                                        setComment(e.target.value)
                                      }
                                      rows={4}
                                    />
                                  </div>
                                  <div className="mt-2 flex space-x-2">
                                    <Button
                                      variant="outline"
                                      onClick={handleSubmitAction}
                                      disabled={
                                        !comment.trim() ||
                                        (currentWorkflowItem &&
                                        currentWorkflowItem.approverAction ===
                                          "Generate Report"
                                          ? !reportFile
                                          : currentWorkflowItem &&
                                            (currentWorkflowItem.approverAction ===
                                              "Initiate Communication" ||
                                              currentWorkflowItem.approverAction ===
                                                "Other")
                                          ? !certified
                                          : false)
                                      }
                                    >
                                      Submit
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      onClick={resetPendingAction}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <SheetClose asChild>
              <Button className="mt-4">Close</Button>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default TaskSheet;
