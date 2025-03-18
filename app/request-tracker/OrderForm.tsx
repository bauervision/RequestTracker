import React, { useEffect, useMemo } from "react";
import { useSchema, SchemaItem } from "@/app/context/SchemaContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "../context/UserContext";
import { AccessRole } from "../constants";

interface OrderFormProps {
  order: { [key: string]: any };
  onFieldChange: (fieldName: string, value: any) => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ order, onFieldChange }) => {
  const { user } = useUser();
  const { schema } = useSchema();

  // Log the order data on mount
  useEffect(() => {
    console.log("Order data on mount:", order);
  }, []);

  if (!schema) {
    return <div>No schema loaded.</div>;
  }

  // Helper functions for date conversion.
  // Convert MM-DD-YYYY to YYYY-MM-DD for the date input.
  const toISO = (dateStr: string) => {
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    const [month, day, year] = parts;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  };

  // Convert YYYY-MM-DD back to MM-DD-YYYY.
  const toMDY = (isoStr: string) => {
    const parts = isoStr.split("-");
    if (parts.length !== 3) return isoStr;
    const [year, month, day] = parts;
    return `${month}-${day}-${year}`;
  };

  // Filter out shipping fields based on the parameter name.
  const shippingFields = schema.filter((field: SchemaItem) =>
    field.parameter.toLowerCase().includes("shipping")
  );

  // Exclude documents, items, and shipping fields from the main fields.
  const mainFields = schema.filter(
    (field: SchemaItem) =>
      field.type !== "documents" &&
      field.type !== "items" &&
      !field.parameter.toLowerCase().includes("shipping")
  );

  // Helper to render each field.
  const renderField = (field: SchemaItem) => {
    const fieldName = field.parameter;
    const fieldValue = order[fieldName] ?? "";
    let inputElement = null;

    switch (field.type) {
      case "date":
        if (field.readOnly) {
          // Display the read-only date as text.
          inputElement = (
            <Input type="text" value={fieldValue} disabled readOnly />
          );
        } else {
          // Convert to ISO format for the date input.
          const isoValue = fieldValue ? toISO(fieldValue) : "";
          inputElement = (
            <Input
              type="date"
              value={isoValue}
              disabled={field.readOnly || !canEditRequestStep}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                // Convert back to MM-DD-YYYY when updating.
                onFieldChange(fieldName, toMDY(e.target.value))
              }
            />
          );
        }
        break;

      default:
        inputElement = (
          <Input
            id={fieldName}
            value={fieldValue}
            disabled={field.readOnly || !canEditRequestStep}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onFieldChange(fieldName, e.target.value)
            }
          />
        );
    }

    return (
      <div key={field.id} className="flex flex-col space-y-1">
        <Label htmlFor={fieldName}>{fieldName}</Label>
        {inputElement}
      </div>
    );
  };

  // Combine access level with the designated step.
  const canEditRequestStep = useMemo(() => {
    // Super Admins can edit regardless of the current step.
    if (user.role === AccessRole.SUPER_ADMIN) {
      return true;
    }
    // For other users, only allow editing if they are the designated nextApprover.
    // Optionally, you could also check that the request is currently at the step where approval is expected.
    const currentStep = order.workflow?.currentStep || order["Request Status"];
    return order["Next Step Approver"] === user.name;
  }, [user, order]);

  return (
    <div className="space-y-6">
      {/* Main fields in a grid */}
      <div className="grid grid-cols-2 gap-4">
        {mainFields.map(renderField)}
      </div>

      {/* Shipping Details Fieldset */}
      {shippingFields.length > 0 && (
        <fieldset className="p-4 border rounded">
          <legend className="px-2 font-semibold">Shipping Details</legend>
          <div className="grid grid-cols-2 gap-4">
            {shippingFields.map(renderField)}
          </div>
        </fieldset>
      )}
    </div>
  );
};

export default OrderForm;
