// components/WorkflowItem.tsx

import React, { useState } from "react";
import "./workflow.css"; // Import the CSS file
import WorkflowDialog from "@/components/Workflows/WorkflowDialog";
import {
  Dialog,
  DialogTrigger,
  DialogOverlay,
  DialogContent,
} from "../../../components/ui/dialog";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../../../components/ui/accordion";
import { Button } from "@/components/ui/button";

export interface ListItem {
  id: number;
  step: string;
  name: string;
  email: string;
  children?: ListItem[];
}

interface WorkflowItemProps {
  item: ListItem;
  addItem: (
    parentId: number,
    data: { step: string; name: string; email: string }
  ) => void;
  updateItem: (
    id: number,
    data: { step: string; name: string; email: string; children: ListItem[] }
  ) => void;
  removeItem: (id: number) => void;
}

const WorkflowItem: React.FC<WorkflowItemProps> = ({
  item,
  addItem,
  updateItem,
  removeItem,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | undefined>(
    undefined
  );
  const [dialogData, setDialogData] = useState({
    step: "",
    name: "",
    email: "",
  });
  const [isEditMode, setIsEditMode] = useState(false);

  const handleAddChild = (data: {
    step: string;
    name: string;
    email: string;
  }) => {
    addItem(item.id, data);
    setIsDialogOpen(false);
    setOpenAccordion(`item-${item.id}`); // Ensure accordion opens when a child is added
  };

  const handleEdit = (data: { step: string; name: string; email: string }) => {
    updateItem(item.id, { ...data, children: item.children || [] });
    setIsDialogOpen(false);
  };

  const handleRemoveAllBelow = () => {
    updateItem(item.id, {
      step: item.step,
      name: item.name,
      email: item.email,
      children: [],
    });
  };

  const openEditDialog = () => {
    setDialogData({ step: item.step, name: item.name, email: item.email });
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  return (
    <div className="workflow-item ">
      <div className="workflow-item-header">
        <Accordion
          type="single"
          collapsible
          value={openAccordion}
          onValueChange={(value) =>
            setOpenAccordion(value === undefined ? undefined : value)
          }
        >
          <AccordionItem value={`item-${item.id}`}>
            <AccordionTrigger>
              <span className="item-info">
                <strong>Step:</strong> {item.step}
              </span>
            </AccordionTrigger>
            <AccordionContent>
              {item.children && item.children.length > 0 && (
                <ul>
                  {item.children.map((child) => (
                    <WorkflowItem
                      key={child.id}
                      item={child}
                      addItem={addItem}
                      updateItem={updateItem}
                      removeItem={removeItem}
                    />
                  ))}
                </ul>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <div className="button-container">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
                Add Child
              </Button>
            </DialogTrigger>
            <DialogOverlay />
            <DialogContent>
              <WorkflowDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onSubmit={isEditMode ? handleEdit : handleAddChild}
                initialData={dialogData}
              />
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={openEditDialog}>
            Edit
          </Button>
          <Button variant="outline" onClick={() => removeItem(item.id)}>
            Remove
          </Button>
          <Button variant="outline" onClick={handleRemoveAllBelow}>
            Remove All Below
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorkflowItem;
