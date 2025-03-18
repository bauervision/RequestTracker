import React, { useEffect } from "react";
import { AgCharts } from "ag-charts-react";

interface AGPieChartProps {
  data: any; // Adjust the type if the structure of `data` is known
}

export const AGPieChart: React.FC<AGPieChartProps> = ({ data }) => {
  useEffect(() => {
    console.log(data);
  }, [data]);

  return <AgCharts options={data} />;
};
