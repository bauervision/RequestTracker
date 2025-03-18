import React, { useState } from "react";
import Papa from "papaparse";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { SchemaItem } from "@/app/context/SchemaContext";

// Define types for props
interface CSVParserProps {
  setHeaders: (headers: string[], schemaArray: SchemaItem[]) => void;
  handleDataCreation: (data: any[]) => void;
  saveParsedData: (headers: string[], data: any[]) => void;
  setSchema: (schema: SchemaItem[]) => void;
}

const allowedExtensions = ["csv"];

export const CSVParser: React.FC<CSVParserProps> = ({
  setHeaders,
  handleDataCreation,
  saveParsedData,
  setSchema,
}) => {
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");

    if (e.target.files && e.target.files.length) {
      const inputFile = e.target.files[0];

      const fileExtension = inputFile?.type.split("/")[1];
      if (!allowedExtensions.includes(fileExtension)) {
        setError("Please input a CSV file");
        return;
      }

      setFile(inputFile);
    }
  };

  const handleParse = () => {
    if (!file) {
      alert("Enter a valid file");
      return;
    }

    const reader = new FileReader();

    reader.onload = async ({ target }: ProgressEvent<FileReader>) => {
      if (!target?.result || typeof target.result !== "string") {
        setError("Failed to read file");
        return;
      }

      const csv = Papa.parse(target.result, {
        header: true,
      });
      const parsedData = csv?.data as any[];
      if (parsedData.length === 0) {
        setError("No data found in the file");
        return;
      }

      const rows = Object.keys(parsedData[0]);

      const newSchemaArray: SchemaItem[] = rows.map((row, index) => ({
        id: index,
        type: "string",
        parameter: row,
        isRequired: false,
        defaultField: false,
        readOnly: false,
        isHidden: false,
      }));

      parsedData.pop(); // Remove any extra data

      setHeaders(rows, newSchemaArray);
      handleDataCreation(parsedData);
      saveParsedData(rows, parsedData);
    };
    reader.readAsText(file);
  };

  return (
    <div className="mt-3 p-3">
      <div className="max-w-xl mx-auto">
        <div className="flex flex-row items-center gap-4 mb-3">
          <Input
            type="file"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button
            onClick={handleParse}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Parse
          </Button>
        </div>
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      </div>
    </div>
  );
};
