"use client";

import React from "react";
import withProtectedRoute from "@/components/withProtectedRoute";

const ProtectedPage: React.FC = () => {
  return <div>Protected Content</div>;
};

export default withProtectedRoute(ProtectedPage, ["admin", "user"]);
