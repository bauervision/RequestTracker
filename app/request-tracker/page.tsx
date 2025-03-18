"use client";

import GridTable from "@/components/ag-grid-table/GridTable";

import React from "react";

import { useRequestContext } from "../context/DataContext";

import RequestsLayout from "./RequestsLayout";
import TaskSheet from "@/components/TaskSheet";
import { Button } from "@/components/ui/button";
import { handleLinkClick } from "../utils/trackLinkClicks";
import Link from "next/link";
import { useSchema } from "../context/SchemaContext";

function RequestPage() {
  const { selectedRow } = useRequestContext();
  const { colDefs } = useSchema();

  return (
    <RequestsLayout
      title="Requests"
      pageComponents={[
        colDefs && (
          <Link
            href="/request-tracker/new-request"
            passHref
            onClick={() => handleLinkClick("/request-tracker/new-request")}
          >
            <Button
              asChild
              className="bg-blue-800 text-white"
              variant={"outline"}
            >
              <p>New Request</p>
            </Button>
          </Link>
        ),
        selectedRow && (
          <Link href={`/request-tracker/${selectedRow?.id}`}>
            <Button
              variant="outline"
              className="bg-blue-800 text-white"
              onClick={() => console.log(selectedRow)}
            >
              View Request
            </Button>
          </Link>
        ),
        <TaskSheet />,
      ]}
    >
      <GridTable />
    </RequestsLayout>
  );
}

export default RequestPage;
