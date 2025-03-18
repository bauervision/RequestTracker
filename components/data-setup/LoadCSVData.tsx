import React, { useState } from "react";
import Papa from "papaparse";
import { Button } from "react-bootstrap";

interface LoadCSVDataProps {
  handleDataCreation: (data: any[]) => void;
  saveParsedData?: (data: any[]) => void;
}

const allowedExtensions = ["csv"];

export const LoadCSVData: React.FC<LoadCSVDataProps> = ({
  handleDataCreation,
  saveParsedData,
}) => {
  const [data, setData] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const inputFile = e.target.files[0];
      const fileExtension = inputFile?.type.split("/")[1];

      if (allowedExtensions.includes(fileExtension)) {
        setFile(inputFile);
      } else {
        alert("Please upload a valid CSV file");
      }
    }
  };

  const handleParse = () => {
    if (!file) {
      alert("Enter a valid file");
      return;
    }

    const reader = new FileReader();

    reader.onload = ({ target }: ProgressEvent<FileReader>) => {
      if (target?.result && typeof target.result === "string") {
        const csv = Papa.parse(target.result, { header: true });
        const parsedData = csv?.data as any[];

        handleDataCreation(parsedData);
        if (saveParsedData) saveParsedData(parsedData);
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="mt-3 p-3">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-4 mb-3">
          <input
            type="file"
            id="inputGroupFile02"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button
            onClick={handleParse}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Load Data
          </Button>
        </div>
      </div>
    </div>
  );
};
