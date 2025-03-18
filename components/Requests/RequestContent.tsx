import React, { ReactNode } from "react";
import { Card, CardContent } from "../ui/card";

interface RequestContentProps {
  children: ReactNode;
}

function RequestContent({ children }: RequestContentProps) {
  return (
    <section className="mx-20 gap-4 py-2 ">
      <Card>
        <CardContent>
          <div className=" grid grid-cols-4 gap-3 py-4 items-center ">
            {children}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

export default RequestContent;
