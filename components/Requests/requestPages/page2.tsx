import React from "react";
import NewRequestItem from "../NewRequestItem";

interface NewRequestPageProps {
  onValueChange: (value: string) => void;
}

export function NewRequestPage2({ onValueChange }: NewRequestPageProps) {
  return (
    <>
      <div className="grid pb-4 justify-center items-center text-2xl">
        Second Page of Request
      </div>
      <div className="grid grid-cols-3 gap-3  items-center ">
        <NewRequestItem id="07" label="Field 7" onValueChange={onValueChange} />
        <NewRequestItem id="08" label="Field 8" onValueChange={onValueChange} />
        <NewRequestItem id="09" label="Field 9" onValueChange={onValueChange} />

        <NewRequestItem
          id="10"
          label="Field 10"
          onValueChange={onValueChange}
        />
        <NewRequestItem
          id="11"
          label="Field 11"
          onValueChange={onValueChange}
        />
        <NewRequestItem
          id="12"
          label="Field 12"
          onValueChange={onValueChange}
        />
      </div>
    </>
  );
}
