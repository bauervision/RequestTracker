"use client";

import { RequestBreadcrumb } from "@/components/Requests/RequestBreadcrumb";
import React from "react";

import { RequestTabs } from "../RequestTabs";
import RequestsLayout from "../RequestsLayout";

function SingleRequest({ params }: { params: { id: string } }) {
  return (
    <RequestsLayout
      title={`Request ID: ${params.id}`}
      pageComponents={[<RequestBreadcrumb />]}
    >
      <RequestTabs />
    </RequestsLayout>
  );
}

export default SingleRequest;
