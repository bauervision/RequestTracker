import React from "react";
import NewRequestItem from "../NewRequestItem";

interface NewRequestPageProps {
  onValueChange: (value: string) => void;
}

export function NewRequestPage5({ onValueChange }: NewRequestPageProps) {
  return (
    <>
      <div className="grid pb-4 justify-center items-center text-2xl">
        Last Page of Request
      </div>
      <div className="grid grid-cols-3 gap-3  items-center ">
        <NewRequestItem
          id="25"
          label="Field 25"
          onValueChange={onValueChange}
        />
        <NewRequestItem
          id="26"
          label="Field 26"
          onValueChange={onValueChange}
        />
        <NewRequestItem
          id="27"
          label="Field 27"
          onValueChange={onValueChange}
        />

        <NewRequestItem
          id="28"
          label="Field 28"
          onValueChange={onValueChange}
        />
        <NewRequestItem
          id="29"
          label="Field 29"
          onValueChange={onValueChange}
        />
        <NewRequestItem
          id="30"
          label="Field 30"
          onValueChange={onValueChange}
        />
      </div>
    </>
  );
}
