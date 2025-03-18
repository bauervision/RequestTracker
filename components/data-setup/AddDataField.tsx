import { useRef } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { InputGroup, Stack } from "react-bootstrap";

// Define types for props
interface AddDataFieldProps {
  newValue: string; // Add this to the props definition
  newParameter: string;
  setNewParameter: (value: string) => void;
  setNewValue: (value: string) => void;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

const AddDataField: React.FC<AddDataFieldProps> = ({
  newParameter,
  setNewParameter,
  setNewValue,
  handleSubmit,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="p-3">
      <Form onSubmit={handleSubmit}>
        <Stack direction="horizontal" gap={3} className="mb-3">
          <InputGroup>
            <Form.Control
              value={newParameter}
              autoFocus
              ref={inputRef}
              placeholder="Add Parameter Name"
              aria-label="add Parameter"
              onChange={(e) => setNewParameter(e.target.value)}
            />
          </InputGroup>

          <Form.Select
            aria-label="Default select example"
            onChange={(e) => setNewValue(e.target.value)}
          >
            <option>Set Data Type</option>
            <option value="int">Integer</option>
            <option value="string">String</option>
            <option value="date">Date</option>
            <option value="float">Float</option>
          </Form.Select>

          <Button type="submit" onClick={() => inputRef.current?.focus()}>
            <i className="bi bi-plus-circle"></i>
          </Button>
        </Stack>
      </Form>
    </div>
  );
};

export default AddDataField;
