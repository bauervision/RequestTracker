import React from "react";
import RequestsLayout from "../../RequestsLayout";

function AdminSettingsPage() {
  return (
    <RequestsLayout title="Catēna Administration">
      <div className="flex h-screen items-start justify-center">
        <div className="text-center text-lg font-semibold">
          Request Tracker Settings Data
        </div>
      </div>
    </RequestsLayout>
  );
}

export default AdminSettingsPage;
