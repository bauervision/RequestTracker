import React from "react";
import RequestsLayout from "../RequestsLayout";

function InventoryPage() {
  return (
    <RequestsLayout title="Catēna Inventory">
      <div className="flex h-screen items-start justify-center">
        <div className="text-center text-lg font-semibold">Inventory Data</div>
      </div>
    </RequestsLayout>
  );
}

export default InventoryPage;
