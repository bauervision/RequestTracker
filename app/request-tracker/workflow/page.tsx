"use client";

import RequestsLayout from "@/app/request-tracker/RequestsLayout";
import React from "react";
import { WorkflowProvider } from "../../context/WorkflowContext";
import WorkflowComponent from "@/components/Workflows/WorkflowComponent";

import { ListItem } from "./WorkflowItem";
import WorkflowDropdown from "@/components/Workflows/SavedWorkflowsDropdown";

function Workflows() {
  return (
    <RequestsLayout
      title="Catēna Workflow Management"
      pageComponents={[<WorkflowDropdown />]}
    >
      <WorkflowComponent />
    </RequestsLayout>
  );
}

export default Workflows;
