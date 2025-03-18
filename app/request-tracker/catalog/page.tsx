import React from "react";
import RequestsLayout from "../RequestsLayout";

function CatalogPage() {
  return (
    <RequestsLayout title="Catēna Catalog">
      <div className="flex h-screen items-start justify-center">
        <div className="text-center text-lg font-semibold">Catalog Data</div>
      </div>
    </RequestsLayout>
  );
}

export default CatalogPage;
