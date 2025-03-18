import React from "react";
import RequestsLayout from "../../RequestsLayout";

function AdminAccountInfoPage() {
  return (
    <RequestsLayout title="Catēna Administration">
      <div className="flex h-screen items-start justify-center">
        <div className="text-center text-lg font-semibold">
          Account Information Data
        </div>
      </div>
    </RequestsLayout>
  );
}

export default AdminAccountInfoPage;
