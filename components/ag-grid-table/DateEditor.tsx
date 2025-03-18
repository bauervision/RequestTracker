import React, { forwardRef, useImperativeHandle, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Define the props interface for the custom date editor
interface CustomDateEditorProps {
  value: Date | null;
  stopEditing: () => void;
  onValueChange: (value: Date | null) => void;
}

const CustomDateEditor = forwardRef((props: CustomDateEditorProps, ref) => {
  const [value, setValue] = React.useState<Date | null>(props.value);
  const datePickerRef = useRef(null);

  useImperativeHandle(ref, () => ({
    getValue() {
      return value;
    },
    afterGuiAttached() {
      if (datePickerRef.current) {
        (datePickerRef.current as any).setFocus();
      }
    },
  }));

  const handleChange = (date: Date | null) => {
    setValue(date);
    props.onValueChange(date); // Pass the new value to the parent
    props.stopEditing(); // Ensure editing stops when date is selected
  };

  return (
    <DatePicker
      selected={value}
      onChange={handleChange}
      ref={datePickerRef}
      className="ag-input"
      dateFormat="MM/dd/yyyy"
      inline
    />
  );
});

export default CustomDateEditor;
