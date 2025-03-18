import React from "react";
import RequestsLayout from "../RequestsLayout";

function ShipmentsPage() {
  return (
    <RequestsLayout title="Catēna Shipments">
      <div className="flex h-screen items-start justify-center">
        <div className="text-center text-lg font-semibold">Shipment Data</div>
      </div>
    </RequestsLayout>
  );
}

export default ShipmentsPage;
