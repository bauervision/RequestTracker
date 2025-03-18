import React from "react";
import RequestsLayout from "../RequestsLayout";
import DataSetup from "@/components/data-setup/DataSetup";
import OrderRequestForm from "@/components/OrderRequestForm";

function NewRequestPage() {
  return (
    <RequestsLayout title="Catēna Administration: New Order Request">
      <OrderRequestForm />
    </RequestsLayout>
  );
}

export default NewRequestPage;
