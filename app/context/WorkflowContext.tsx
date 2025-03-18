"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  Dispatch,
  useState,
  useEffect,
} from "react";
import workflow from "../workflow-engine/workflow";
import { DEFAULT_WORKFLOW } from "../constants";

export interface WorkflowItemState {
  id: string;
  name: string;
  children: string[];
  nextApprover?: string;
  nextApproverGroups?: string[];
  prevApprover?: string;
  prevApproverGroups?: string[];
  easyApproval: boolean;
  approverAction?: string;
  approverComment?: string;
  onApproval?: string;
  onRejection?: string;
}

export interface WorkflowState {
  rootItem?: string;
  name: string;
  items: Record<string, WorkflowItemState>; // Map of item IDs to their states
  workflowKey?: string;
  workflowDescription?: string;
}

interface InitializeAction {
  type: "initialize";
  itemId: string;
  name: string;
}

interface TransitionAction {
  type: "transition";
  itemId: string;
  action: string;
}

interface InsertAfterAction {
  type: "insertAfter";
  itemId: string;
  newItemId: string;
  name: string;
}

interface DeleteStepAction {
  type: "deleteStep";
  itemId: string;
}

interface RemoveAllBelowAction {
  type: "removeAllBelow";
  itemId: string;
}

interface UpdateName {
  type: "updateName";
  name: string;
  itemId: string;
}

interface LoadWorkflowAction {
  type: "loadWorkflow";
  workflowState: WorkflowState;
}

interface UpdateItemAction {
  type: "updateItem";
  itemId: string;
  data: Partial<WorkflowItemState>;
}

interface UpdateWorkflowMetadataAction {
  type: "updateWorkflowMetadata";
  key?: string;
  description?: string;
}

interface UpdateWorkflowNameAction {
  type: "updateWorkflowName";
  name: string;
}

type WorkflowAction =
  | InitializeAction
  | TransitionAction
  | InsertAfterAction
  | DeleteStepAction
  | RemoveAllBelowAction
  | UpdateName
  | LoadWorkflowAction
  | UpdateItemAction
  | UpdateWorkflowMetadataAction
  | UpdateWorkflowNameAction;

interface WorkflowContextType {
  state: WorkflowState;
  dispatch: Dispatch<WorkflowAction>;
  addItem: (name: string) => void;
  saveWorkflow: (name: string) => void;
  loadWorkflow: (workflowName: string) => void;
  deleteWorkflow: (workflowName: string) => void;
  unloadWorkflow: () => void;
  getSavedWorkflows: () => string[];
  setLoading: (isLoading: boolean) => void;
  loading: boolean;
  savedWorkflows: string[];
  currentWorkflowName: string;
  setCurrentWorkflowName: (name: string) => void;
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(
  undefined
);

// Use the default template as the initial state
const initialState: WorkflowState = {
  name: "",
  items: {},
  rootItem: undefined,
  workflowKey: "",
  workflowDescription: "",
};

const workflowReducer = (
  state: WorkflowState = initialState,
  action: WorkflowAction
): WorkflowState => {
  switch (action.type) {
    case "initialize": {
      const newItem: WorkflowItemState = {
        id: action.itemId,
        name: action.name,
        children: [],
        nextApprover: "",
        nextApproverGroups: [],
        easyApproval: true,
      };

      if (!state.rootItem) {
        return {
          ...state,
          rootItem: newItem.id,
          items: {
            [newItem.id]: newItem,
          },
          workflowKey: state.workflowKey,
          workflowDescription: state.workflowDescription,
        };
      } else {
        const findLastItem = (itemId: string): string => {
          const item = state.items[itemId];
          if (item.children.length === 0) return itemId;
          return findLastItem(item.children[item.children.length - 1]);
        };

        const lastItemId = findLastItem(state.rootItem);

        return {
          ...state,
          items: {
            ...state.items,
            [action.itemId]: newItem,
            [lastItemId]: {
              ...state.items[lastItemId],
              children: [...state.items[lastItemId].children, action.itemId],
            },
          },
          workflowKey: state.workflowKey,
          workflowDescription: state.workflowDescription,
        };
      }
    }

    case "insertAfter": {
      const parentItem = state.items[action.itemId];
      if (!parentItem) return state;
      const newItem: WorkflowItemState = {
        id: action.newItemId,
        name: action.name,
        children: [],
        nextApprover: "",
        nextApproverGroups: [],
        easyApproval: true,
      };
      return {
        ...state,
        items: {
          ...state.items,
          [parentItem.id]: {
            ...parentItem,
            children: [...parentItem.children, newItem.id],
          },
          [newItem.id]: newItem,
        },
      };
    }

    case "deleteStep": {
      const { [action.itemId]: _, ...remainingItems } = state.items;
      const removeChildFromParent = (
        items: Record<string, WorkflowItemState>
      ) =>
        Object.entries(items).reduce((acc, [id, item]) => {
          acc[id] = {
            ...item,
            children: item.children.filter(
              (childId) => childId !== action.itemId
            ),
          };
          return acc;
        }, {} as Record<string, WorkflowItemState>);
      return {
        ...state,
        items: removeChildFromParent(remainingItems),
      };
    }

    case "removeAllBelow": {
      const removeChildrenRecursively = (itemId: string) => {
        const item = state.items[itemId];
        if (!item) return;
        item.children.forEach(removeChildrenRecursively);
        delete state.items[itemId];
      };
      removeChildrenRecursively(action.itemId);
      return {
        ...state,
        items: {
          ...state.items,
          [action.itemId]: {
            ...state.items[action.itemId],
            children: [],
          },
        },
      };
    }

    case "loadWorkflow":
      return action.workflowState;

    case "updateName": {
      const currentItem = state.items[action.itemId];
      if (!currentItem) return state;
      return {
        ...state,
        items: {
          ...state.items,
          [action.itemId]: { ...currentItem, name: action.name },
        },
      };
    }

    case "updateItem": {
      const currentItem = state.items[action.itemId];
      if (!currentItem) return state;
      return {
        ...state,
        items: {
          ...state.items,
          [action.itemId]: {
            ...currentItem,
            ...action.data,
          },
        },
      };
    }

    case "updateWorkflowMetadata": {
      return {
        ...state,
        workflowKey: action.key ?? state.workflowKey,
        workflowDescription: action.description ?? state.workflowDescription,
      };
    }

    case "updateWorkflowName": {
      return { ...state, name: action.name };
    }

    default:
      return state;
  }
};

export const WorkflowProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(workflowReducer, initialState);
  const [loading, setLoading] = useState(true);
  const [savedWorkflows, setSavedWorkflows] = useState<string[]>([]);
  const [currentWorkflowName, setCurrentWorkflowName] = useState<string>("");

  const addItem = (name: string) => {
    const newId = `item-${Date.now()}`;
    dispatch({ type: "initialize", itemId: newId, name });
  };

  const saveWorkflow = (name: string) => {
    const workflowToSave = {
      ...state,
      name, // override state.name with the new name
      workflowKey: state.workflowKey,
      workflowDescription: state.workflowDescription,
    };
    localStorage.setItem(`workflow_${name}`, JSON.stringify(workflowToSave));
    setSavedWorkflows(getSavedWorkflows());
  };

  const unloadWorkflow = () => {
    dispatch({ type: "loadWorkflow", workflowState: initialState });
    setCurrentWorkflowName("");
  };

  const loadWorkflow = (workflowName: string) => {
    const key = `workflow_${workflowName}`;
    const savedWorkflow = localStorage.getItem(key);
    console.log(`Loading workflow from key: ${key}`, savedWorkflow);
    if (savedWorkflow) {
      const workflowState = JSON.parse(savedWorkflow);
      dispatch({
        type: "loadWorkflow",
        workflowState: {
          rootItem: workflowState.rootItem,
          name: workflowState.name,
          items: workflowState.items,
          workflowKey: workflowState.workflowKey || "",
          workflowDescription: workflowState.workflowDescription || "",
        },
      });
    } else {
      console.log("ERROR, missing workflow state!");
    }
    setLoading(false);
  };

  const deleteWorkflow = (workflowName: string) => {
    localStorage.removeItem(`workflow_${workflowName}`);
    setSavedWorkflows(getSavedWorkflows());
  };

  const getSavedWorkflows = () => {
    const keys = Object.keys(localStorage).filter((key) =>
      key.startsWith("workflow_")
    );
    return keys.map((key) => key.replace("workflow_", ""));
  };

  // be sure to grab and load up all saved workflows from mount
  useEffect(() => {
    setSavedWorkflows(getSavedWorkflows());
  }, []);

  return (
    <WorkflowContext.Provider
      value={{
        state,
        dispatch,
        addItem,
        saveWorkflow,
        loadWorkflow,
        deleteWorkflow,
        unloadWorkflow,
        getSavedWorkflows,
        setLoading,
        loading,
        savedWorkflows,
        currentWorkflowName,
        setCurrentWorkflowName,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
};

export const useWorkflow = () => {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error("useWorkflow must be used within a WorkflowProvider");
  }
  return context;
};
