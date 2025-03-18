import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollComments } from "../ScrollComments";

const workflowSteps = [
  "New",
  "Awaiting",
  "Review",
  "Bid",
  "No Bid",
  "Pricing",
  "PCA Review",
  "Pricing Approved",
  "Proposal Submitted",
  "Awarded",
  "Invoicing",
  "Complete",
];

export function AdvanceWorkflowPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Advance Worflow</Button>
      </PopoverTrigger>
      <PopoverContent className="w-full">
        <ScrollComments data={workflowSteps} />
      </PopoverContent>
    </Popover>
  );
}
