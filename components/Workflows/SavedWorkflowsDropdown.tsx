import React, { useEffect, useState } from "react";
import { useWorkflow } from "@/app/context/WorkflowContext";
import { DEFAULT_WORKFLOW } from "@/app/constants";

const SavedWorkflowsDropdown: React.FC = () => {
  const { savedWorkflows, dispatch, loadWorkflow, setCurrentWorkflowName } =
    useWorkflow();
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>(""); // Track the selected workflow

  const handleLoadWorkflow = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const workflowName = e.target.value;
    setSelectedWorkflow(workflowName);

    if (workflowName === "default") {
      // Load the default template explicitly.
      dispatch({ type: "loadWorkflow", workflowState: DEFAULT_WORKFLOW });
      setCurrentWorkflowName("Default Workflow");
    } else if (workflowName) {
      loadWorkflow(workflowName);
      setCurrentWorkflowName(workflowName);
    }
  };

  // Reset the dropdown selection if the workflow list changes
  useEffect(() => {
    if (!savedWorkflows.includes(selectedWorkflow)) {
      setSelectedWorkflow(""); // Reset to "Select a workflow" if the selected one is deleted
    }
  }, [savedWorkflows, selectedWorkflow]);

  return (
    <div className=" ">
      <select
        value={selectedWorkflow}
        onChange={handleLoadWorkflow}
        className="block w-full p-2 border border-gray-300 rounded-md"
      >
        <option value="">Select a workflow</option>
        <option value="default">Default Workflow</option>
        {savedWorkflows.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SavedWorkflowsDropdown;
