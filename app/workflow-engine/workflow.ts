// workflow.ts

export interface State {
  on: { [action: string]: string };
}

export interface WorkflowDefinition {
  initialState: string;
  states: { [state: string]: State };
}

const workflow: WorkflowDefinition = {
  initialState: "draft",
  states: {
    draft: {
      on: { submit: "submitted" },
    },
    submitted: {
      on: { approve: "approved", reject: "rejected" },
    },
    approved: {
      on: { archive: "archived" },
    },
    rejected: {
      on: { revise: "draft" },
    },
    archived: {
      on: {},
    },
  },
};

export default workflow;
