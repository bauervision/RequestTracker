import React from "react";

interface DataHeaderProps {
  title: string;
}

const DataHeader: React.FC<DataHeaderProps> = ({ title }) => {
  return (
    <header className="header">
      <h1>{title}</h1>
    </header>
  );
};

export default DataHeader;
