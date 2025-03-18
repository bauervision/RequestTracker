import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface RequestCommentProps {
  label: string;
  onTextChange: (text: string) => void;
}

export function RequestComment({ label, onTextChange }: RequestCommentProps) {
  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onTextChange(event.target.value);
  };

  return (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="message">{label}</Label>
      <Textarea
        placeholder="Type your message here."
        id="message"
        onChange={handleChange}
      />
    </div>
  );
}
