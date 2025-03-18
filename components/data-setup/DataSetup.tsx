"use client";

import React, { useEffect, useState } from "react";
import { ColDef, SchemaItem } from "@/app/context/SchemaContext";
import { SchemaContent } from "./SchemaContent";
import { CSVParser } from "./CSVParser";
import { AGGrid } from "./AGGrid";
import { useSchema } from "@/app/context/SchemaContext";
import {
  DATE_FORMAT_OPTIONS,
  FIELD_TYPES,
  FIELD_TYPES_OPTIONS,
  PRESET_FIELDS,
  SHIPPING_FIELDS,
} from "@/app/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import RequestToast, { showToast } from "../Requests/RequestToast";
import GridTable from "../ag-grid-table/GridTable";

const DataSetup: React.FC = () => {
  const {
    schema,
    setSchema,
    rowData,
    setRowData,
    colDefs,
    setColDefs,
    clearLocalData,
  } = useSchema();

  const [mode, setMode] = useState<"csv" | "manual">("csv");

  // Prepopulate manual schema with built‑in fields and additional fields.
  // When adding a new field, we now set isHidden to false by default.
  const [manualSchema, setManualSchema] = useState<SchemaItem[]>([
    ...PRESET_FIELDS,
    ...SHIPPING_FIELDS,
  ]);

  // Helper function to generate column definitions from a schema array
  const generateColDefs = (schemaArray: SchemaItem[]): ColDef[] => {
    return schemaArray
      .filter((field) => !field.isHidden)
      .map((field): ColDef => {
        const baseColDef = {
          headerName: field.parameter,
          field: field.parameter,
        };

        switch (field.type) {
          case FIELD_TYPES.NUMBER:
            return {
              ...baseColDef,
              // Compare as numbers
              comparator: (valueA: any, valueB: any) =>
                Number(valueA) - Number(valueB),
              // Parse new values as numbers
              valueParser: (params: any) => Number(params.newValue),
            };
          case FIELD_TYPES.CURRENCY:
            console.log("Generating currency colDef for:", field.parameter);
            return {
              ...baseColDef,
              comparator: (valueA: any, valueB: any) =>
                Number(valueA) - Number(valueB),
              valueParser: (params: any) => {
                console.log("Currency valueParser:", params);
                return Number(params.newValue);
              },
              valueFormatter: (params: any) => {
                console.log("Currency formatter called with:", params.value);
                const numericValue = Number(params.value);
                if (!isNaN(numericValue)) {
                  return new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(numericValue);
                }
                return params.value;
              },
            };

          case FIELD_TYPES.DATE:
            return {
              ...baseColDef,
              // Compare dates by converting to timestamps
              comparator: (valueA: any, valueB: any) =>
                new Date(valueA).getTime() - new Date(valueB).getTime(),
              // Parse new values as ISO date strings (adjust parsing if you have a custom format)
              valueParser: (params: any) => {
                const parsedDate = new Date(params.newValue);
                return isNaN(parsedDate.getTime())
                  ? params.oldValue
                  : parsedDate.toISOString();
              },
            };
          // For text and documents, default sorting works fine.
          case FIELD_TYPES.TEXT:
          case FIELD_TYPES.DOCUMENTS:
          default:
            return baseColDef;
        }
      });
  };

  // Update handler for CSV schema.
  const handleUpdateCSVField = (
    id: string,
    key: keyof SchemaItem,
    value: string | boolean | string[]
  ) => {
    if (schema) {
      const updatedSchema = schema.map((field) =>
        field.id.toString() === id ? { ...field, [key]: value } : field
      );
      setSchema(updatedSchema);

      // Recalculate column definitions based on the updated schema.
      const newColDefs = generateColDefs(updatedSchema);

      console.log("Updating CSV field...");
      setColDefs(newColDefs);
    }
  };

  // When saving in manual mode, simply use the manual schema.
  const handleSaveManualSchema = () => {
    setSchema(manualSchema);

    // Update AGGrid column definitions using only fields that are not hidden.
    const completeColDefs: ColDef[] = manualSchema
      .filter((field) => !field.isHidden)
      .map((field): ColDef => {
        const parameter: string = field.parameter || "";
        return {
          headerName: parameter,
          field: parameter,
        };
      });
    setColDefs(completeColDefs);
    console.log(completeColDefs);

    setTimeout(() => null, 1000);
    showToast("Schema Saved successfully", "success");
  };

  const handleAddField = () => {
    const newField: SchemaItem = {
      id: Date.now(),
      type: FIELD_TYPES.TEXT, // Default type for new fields
      parameter: "", // Default empty parameter
      defaultField: false,
      isRequired: false,
      readOnly: false,
      isHidden: false, // New: default to visible
    };
    setManualSchema((prev) => [...prev, newField]);
  };

  const handleRemoveField = (id: string) => {
    setManualSchema((prev) =>
      prev.filter((field) => field.id.toString() !== id)
    );
  };

  // Allow value to be a string or boolean.
  const handleUpdateField = (
    id: string,
    key: keyof SchemaItem,
    value: string | boolean | string[]
  ) => {
    setManualSchema((prev) =>
      prev.map((field) =>
        field.id.toString() === id ? { ...field, [key]: value } : field
      )
    );
  };

  // When switching modes, we preserve manual schema so built‑in fields remain.
  const handleModeChange = (newMode: "csv" | "manual") => {
    setMode(newMode);

    if (newMode === "csv") {
      // Clear out CSV mode data
      setSchema([]);
      setColDefs([]);
      setRowData([]);
    }
  };

  useEffect(() => {
    console.log("Current Schema:", schema);
  }, [schema]);

  // Separate built‑in fields from additional (user-added) fields.
  const builtInFields = manualSchema.filter((field) => field.defaultField);
  const additionalFields = manualSchema.filter((field) => !field.defaultField);

  return (
    <div className="bg-gray-100 w-full flex flex-col h-full">
      <RequestToast />
      <header className="bg-white shadow p-6">
        <h2 className="text-2xl font-semibold text-center">
          Catēna Data Configuration
        </h2>

        {/* Toggle Mode */}
        <div className="flex justify-center mt-4 gap-4">
          <Button
            className={
              mode === "csv" ? "bg-blue-600 text-white" : "bg-gray-200"
            }
            onClick={() => handleModeChange("csv")}
          >
            Upload CSV
          </Button>
          <Button
            className={
              mode === "manual" ? "bg-blue-600 text-white" : "bg-gray-200"
            }
            onClick={() => handleModeChange("manual")}
          >
            Create Schema from Scratch
          </Button>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto p-6 flex flex-col w-full">
        {mode === "manual" ? (
          <>
            <section className="bg-white p-6 shadow rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Define Schema</h3>
              <h4 className="text-sm mb-4">
                These are default Catena Request fields and cannot be altered.
                They are presented here for your awareness. Feel free to add any
                custom fields in the Additional Details section.
              </h4>

              {/* Fieldset for built‑in (read-only) fields */}
              <fieldset className="mb-4 border p-4">
                <legend className="px-2 font-semibold">Built-in Fields</legend>
                {builtInFields.map((field) => (
                  <div
                    key={field.id}
                    className="flex items-center gap-4 w-full mb-2"
                  >
                    <Input
                      className="flex-grow"
                      placeholder="Field Name"
                      value={field.parameter}
                      readOnly
                      disabled
                    />
                    {/* Checkbox for Hidden Field */}
                    <div className="flex items-center">
                      <label className="mr-2 text-sm">Hidden</label>
                      <input
                        type="checkbox"
                        title="When checked, this field will be hidden from the table view, but it will still exist in the data."
                        checked={field.isHidden || false}
                        onChange={(e) =>
                          handleUpdateField(
                            field.id.toString(),
                            "isHidden",
                            e.target.checked
                          )
                        }
                      />
                    </div>
                    <Select disabled value={field.type}>
                      <SelectTrigger className="w-1/4">
                        <SelectValue placeholder="Select Type">
                          {FIELD_TYPES_OPTIONS.find(
                            (option) => option.value === field.type
                          )?.label || "Select Type"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {FIELD_TYPES_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {field.type === FIELD_TYPES.DATE && (
                      <div className="ml-3">
                        <select
                          className="form-select"
                          value={field.format || ""}
                          disabled
                        >
                          <option value="" disabled>
                            Select Date Format
                          </option>
                          {DATE_FORMAT_OPTIONS.map((format) => (
                            <option key={format} value={format}>
                              {format}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                ))}
              </fieldset>

              {/* Fieldset for additional fields */}
              <fieldset className="mb-4 border p-4">
                <legend className="px-2 font-semibold">
                  Additional Fields
                </legend>
                {additionalFields.map((field) => (
                  <div
                    key={field.id}
                    className="flex items-center gap-4 w-full mb-2"
                  >
                    <Input
                      className="flex-grow"
                      placeholder="Field Name"
                      value={field.parameter}
                      onChange={(e) =>
                        handleUpdateField(
                          field.id.toString(),
                          "parameter",
                          e.target.value
                        )
                      }
                    />
                    <Select
                      onValueChange={(value) =>
                        handleUpdateField(field.id.toString(), "type", value)
                      }
                      value={field.type}
                    >
                      <SelectTrigger className="w-1/4">
                        <SelectValue placeholder="Select Type">
                          {FIELD_TYPES_OPTIONS.find(
                            (option) => option.value === field.type
                          )?.label || "Select Type"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {FIELD_TYPES_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Document upload */}
                    {field.type === FIELD_TYPES.DOCUMENTS && (
                      <div className="ml-3">
                        <input
                          type="file"
                          multiple
                          onChange={(e) => {
                            const files = e.target.files;
                            if (files) {
                              const fileNames = Array.from(files).map(
                                (file) => file.name
                              );
                              // Update the field with the selected file names
                              handleUpdateField(
                                field.id.toString(),
                                "fileNames",
                                fileNames
                              );
                            }
                          }}
                        />
                        {field.fileNames && field.fileNames.length > 0 && (
                          <div>
                            <p>Selected files: {field.fileNames.join(", ")}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Date */}
                    {field.type === FIELD_TYPES.DATE && (
                      <div className="ml-3">
                        <select
                          className="form-select"
                          value={field.format || ""}
                          onChange={(e) =>
                            handleUpdateField(
                              field.id.toString(),
                              "format",
                              e.target.value
                            )
                          }
                        >
                          <option value="" disabled>
                            Select Date Format
                          </option>
                          {DATE_FORMAT_OPTIONS.map((format) => (
                            <option key={format} value={format}>
                              {format}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Checkbox for Hidden Field */}
                    <div className="flex items-center">
                      <label className="mr-2 text-sm">Hidden</label>
                      <input
                        type="checkbox"
                        checked={field.isHidden || false}
                        onChange={(e) =>
                          handleUpdateField(
                            field.id.toString(),
                            "isHidden",
                            e.target.checked
                          )
                        }
                      />
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => handleRemoveField(field.id.toString())}
                      type="button"
                    >
                      Delete
                    </Button>
                  </div>
                ))}
              </fieldset>

              <div className="flex gap-4 mt-4">
                <Button
                  onClick={handleAddField}
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  Add Field
                </Button>
                <Button
                  onClick={handleSaveManualSchema}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Save Schema
                </Button>
              </div>
            </section>
          </>
        ) : (
          <>
            <section className="bg-white p-6 shadow rounded-lg">
              <CSVParser
                saveParsedData={(rows, data) => setRowData(data)}
                setHeaders={(rows, schemaArray) => {
                  // In CSV mode, we use only the CSV-generated schema.
                  setSchema(schemaArray);
                  const newColDefs = generateColDefs(schemaArray);
                  setColDefs(newColDefs);
                }}
                handleDataCreation={setRowData}
                setSchema={setSchema}
              />
            </section>
            {/* CSV Schema Preview */}
            {schema && schema.length > 0 && (
              <>
                <section className="bg-white p-6 shadow rounded-lg mt-6">
                  <h3 className="text-lg font-semibold mb-4">
                    CSV Schema Preview
                  </h3>
                  <fieldset className="mb-4 border p-4">
                    <legend className="px-2 font-semibold">
                      CSV Generated Schema
                    </legend>
                    {schema.map((field) => (
                      <div
                        key={field.id}
                        className="flex items-center gap-4 w-full mb-2"
                      >
                        <Input
                          className="flex-grow"
                          placeholder="Field Name"
                          value={field.parameter}
                          onChange={(e) =>
                            handleUpdateCSVField(
                              field.id.toString(),
                              "parameter",
                              e.target.value
                            )
                          }
                        />
                        <Select
                          onValueChange={(value) =>
                            handleUpdateCSVField(
                              field.id.toString(),
                              "type",
                              value
                            )
                          }
                          value={field.type}
                        >
                          <SelectTrigger className="w-1/4">
                            <SelectValue placeholder="Select Type">
                              {FIELD_TYPES_OPTIONS.find(
                                (option) => option.value === field.type
                              )?.label || "Select Type"}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {FIELD_TYPES_OPTIONS.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {field.type === FIELD_TYPES.DATE && (
                          <select
                            className="form-select"
                            value={field.format || ""}
                            onChange={(e) =>
                              handleUpdateCSVField(
                                field.id.toString(),
                                "format",
                                e.target.value
                              )
                            }
                          >
                            <option value="" disabled>
                              Select Date Format
                            </option>
                            {DATE_FORMAT_OPTIONS.map((format) => (
                              <option key={format} value={format}>
                                {format}
                              </option>
                            ))}
                          </select>
                        )}
                        <div className="flex items-center">
                          <label className="mr-2 text-sm">Hidden</label>
                          <input
                            type="checkbox"
                            checked={field.isHidden || false}
                            onChange={(e) =>
                              handleUpdateCSVField(
                                field.id.toString(),
                                "isHidden",
                                e.target.checked
                              )
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </fieldset>
                </section>

                {/* AGGrid Table Preview */}
                <section className="mt-6">
                  <GridTable />
                </section>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default DataSetup;
