import React from "react";
import RequestsLayout from "../../RequestsLayout";
import DataSetup from "@/components/data-setup/DataSetup";

function AdminDataManagementPage() {
  return (
    <RequestsLayout title="Catēna Administration: Data Management">
      <DataSetup />
    </RequestsLayout>
  );
}

export default AdminDataManagementPage;
