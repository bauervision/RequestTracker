import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollComments } from "../ScrollComments";

const commentData = [
  "Approved. MCB",
  " We need to figure out the workflow before we move on.",
  "Rejected, sending back",
];

export function RequestAccordion() {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>Previous Comments</AccordionTrigger>
        <AccordionContent>
          <ScrollComments data={commentData} />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
