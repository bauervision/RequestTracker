import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollComments } from "../ScrollComments";

const commentData = [
  "Approved. MCB",
  " We need to figure out the workflow before we move on.",
  "Rejected, sending back",
  "Approved. MCB",
  " We need to figure out the workflow before we move on.",
  "Rejected, sending back",
  "Approved. MCB",
  " We need to figure out the workflow before we move on.",
  "Rejected, sending back",
];

export function RequestCommentPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">View Comments</Button>
      </PopoverTrigger>
      <PopoverContent className="w-full">
        <ScrollComments data={commentData} />
      </PopoverContent>
    </Popover>
  );
}
