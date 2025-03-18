"use client";

import React, { useState, useEffect } from "react";
import { Label } from "../ui/label";

interface CalendarData {
  label: string;
  date?: Date;
}
interface CalendarProps {
  data: CalendarData;
}

// Utility function to format the Date object to 'YYYY-MM-DD' string
function formatDate(date?: Date): string | undefined {
  if (!date) return undefined;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
export function RequestCalendar({ data }: CalendarProps) {
  const [date, setDate] = useState<string | undefined>(formatDate(data.date));
  useEffect(() => {
    setDate(formatDate(data.date));
  }, [data.date]);

  const handleChange = (event: any) => {
    setDate(event.target.value);
  };

  return (
    <div>
      <Label>{data.label}</Label>

      <div>
        <input type="date" value={date} onChange={handleChange} />
      </div>
    </div>
  );
}
