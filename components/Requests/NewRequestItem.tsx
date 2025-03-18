import React, { useState, ReactElement, useRef } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

interface NewRequestItemProps {
  label: string;
  id: string;
  onValueChange: (value: string) => void;
  children?: ReactElement<{ onValueChange: (value: string) => void }>; // More specific typing for children
}

function NewRequestItem({
  label,
  id,
  onValueChange,
  children,
}: NewRequestItemProps) {
  const [inputValue, setInputValue] = useState("");
  const enterPressed = useRef(false);

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    if (enterPressed.current) {
      enterPressed.current = false;
      return;
    }
    onValueChange(event.target.value);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      enterPressed.current = true;
      onValueChange(event.currentTarget.value);
    }
  };

  const childrenWithProps = children
    ? React.cloneElement(children, { onValueChange })
    : null;

  return (
    <div className="flex items-center justify-center">
      <div className="grid items-center gap-4">
        <Label htmlFor="product" className="text-left">
          {label}
        </Label>
        {!children ? (
          <Input
            type="text"
            id={id}
            className="w-auto"
            placeholder={`Enter ${label.toLowerCase()}`}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)} // Update local state
            onBlur={handleBlur} // Call onValueChange only on blur if Enter wasn't pressed
            onKeyUp={handleKeyPress} // Call onValueChange on Enter key press
          />
        ) : (
          <div className="mt-4">{childrenWithProps}</div>
        )}
      </div>
    </div>
  );
}

export default NewRequestItem;
