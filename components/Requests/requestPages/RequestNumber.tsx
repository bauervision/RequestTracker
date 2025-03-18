"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { DrawerDescription } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState } from "react";

function RequestNumber() {
  const [manual, setManual] = useState(false);
  const [number, setNumber] = useState<string>("");

  const handleRequestNumber = () => {
    //TODO get actual number from data
    return "00000023";
  };

  return (
    <DrawerDescription>
      <div className="">
        <div className="flex flex-row items-center justify-start">
          <p className="pr-3">New Request #:</p>
          <Input
            className="max-w-64"
            type="text"
            disabled={!manual}
            placeholder={`${manual && " Enter your Request Number"} `}
            value={`${manual ? number : handleRequestNumber()}`}
          />
          <Label
            htmlFor="terms"
            className="px-3 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Manual Request #
          </Label>
          <Checkbox
            id="manualNumber"
            onCheckedChange={() => {
              setManual(!manual);
            }}
          />
        </div>
      </div>
    </DrawerDescription>
  );
}

export default RequestNumber;
