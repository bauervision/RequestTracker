import React, { useEffect, useState } from "react";
import NewRequestItem from "../NewRequestItem";
import { Combobox } from "../ComboBox";
import { useWorkflow } from "@/app/context/WorkflowContext";

interface NewRequestPageProps {
  onValueChange: (value: string) => void;
}

export function NewRequestPage1({ onValueChange }: NewRequestPageProps) {
  const { savedWorkflows } = useWorkflow(); // Pull saved workflows from context
  const [workflowOptions, setWorkflowOptions] = useState<
    { value: string; label: string }[]
  >([]);

  useEffect(() => {
    // Map saved workflows to ComboItem format
    const options = savedWorkflows.map((workflow) => ({
      value: workflow,
      label: workflow, // Use the workflow name as both value and label
    }));
    setWorkflowOptions(options);
  }, [savedWorkflows]);

  return (
    <div>
      <div className="grid pb-4 justify-center items-center text-2xl">
        Main Request
      </div>
      <div className="grid grid-cols-3 gap-3 items-center">
        {/* Populate Combobox with saved workflows */}
        <NewRequestItem id="01" label="Workflow" onValueChange={onValueChange}>
          <Combobox
            placeholder="Select a workflow..."
            label="Workflows"
            data={workflowOptions} // Use transformed workflowOptions
            onStatusChange={onValueChange}
          />
        </NewRequestItem>
        <NewRequestItem id="02" label="Field 2" onValueChange={onValueChange} />
        <NewRequestItem id="03" label="Field 3" onValueChange={onValueChange} />
        <NewRequestItem id="04" label="Field 4" onValueChange={onValueChange} />
        <NewRequestItem id="05" label="Field 5" onValueChange={onValueChange} />
        <NewRequestItem id="06" label="Field 6" onValueChange={onValueChange} />
      </div>
    </div>
  );
}
