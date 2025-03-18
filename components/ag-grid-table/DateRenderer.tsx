import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Define the props interface for the custom date renderer
interface DateRendererProps {
  value: Date | null;
  setValue: (date: Date | null) => void;
  api: any; // Adjust the type according to your AG Grid setup
}

const DateRenderer: React.FC<DateRendererProps> = (props) => {
  const { value, setValue, api } = props;

  const handleChange = (date: Date | null) => {
    setValue(date);
    api.stopEditing(); // Ensure editing stops when date is selected
  };

  return (
    <DatePicker
      selected={value}
      onChange={handleChange}
      dateFormat="MM/dd/yyyy"
      className="ag-input"
    />
  );
};

export default DateRenderer;
