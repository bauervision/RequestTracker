import * as React from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface ScrollCommentsProps {
  data: string[];
}

export function ScrollComments({ data }: ScrollCommentsProps) {
  return (
    <ScrollArea className="h-72 w-48 rounded-md border">
      <div className="p-4">
        <h4 className="mb-4 text-sm font-medium leading-none">Comments</h4>
        {data.map((comment) => (
          <>
            <div key={comment} className="text-sm">
              {comment}
            </div>
            <Separator className="my-2" />
          </>
        ))}
      </div>
    </ScrollArea>
  );
}
