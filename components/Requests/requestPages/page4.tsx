import React from "react";
import NewRequestItem from "../NewRequestItem";

interface NewRequestPageProps {
  onValueChange: (value: string) => void;
}

export function NewRequestPage4({ onValueChange }: NewRequestPageProps) {
  return (
    <>
      <div className="grid pb-4 justify-center items-center text-2xl">
        Forth Page of Request
      </div>
      <div className="grid grid-cols-3 gap-3  items-center ">
        <NewRequestItem
          id="19"
          label="Field 19"
          onValueChange={onValueChange}
        />
        <NewRequestItem
          id="20"
          label="Field 20"
          onValueChange={onValueChange}
        />
        <NewRequestItem
          id="21"
          label="Field 21"
          onValueChange={onValueChange}
        />

        <NewRequestItem
          id="22"
          label="Field 22"
          onValueChange={onValueChange}
        />
        <NewRequestItem
          id="23"
          label="Field 23"
          onValueChange={onValueChange}
        />
        <NewRequestItem
          id="24"
          label="Field 24"
          onValueChange={onValueChange}
        />
      </div>
    </>
  );
}
