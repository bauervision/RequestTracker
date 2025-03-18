import React from "react";
import NewRequestItem from "../NewRequestItem";

interface NewRequestPageProps {
  onValueChange: (value: string) => void;
}

export function NewRequestPage3({ onValueChange }: NewRequestPageProps) {
  return (
    <>
      <div className="grid pb-4 justify-center items-center text-2xl">
        Third Page of Request
      </div>
      <div className="grid grid-cols-3 gap-3  items-center ">
        <NewRequestItem
          id="13"
          label="Field 13"
          onValueChange={onValueChange}
        />
        <NewRequestItem
          id="14"
          label="Field 14"
          onValueChange={onValueChange}
        />
        <NewRequestItem
          id="15"
          label="Field 15"
          onValueChange={onValueChange}
        />

        <NewRequestItem
          id="16"
          label="Field 16"
          onValueChange={onValueChange}
        />
        <NewRequestItem
          id="17"
          label="Field 17"
          onValueChange={onValueChange}
        />
        <NewRequestItem
          id="18"
          label="Field 18"
          onValueChange={onValueChange}
        />
      </div>
    </>
  );
}
