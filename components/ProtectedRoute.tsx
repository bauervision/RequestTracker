"use client";

import React, { ReactNode, useEffect } from "react";
import { useUser } from "@/app/context/UserContext"; // Ensure this path is correct
import { AccessRole } from "@/app/constants";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles,
}) => {
  const { user } = useUser();

  useEffect(() => {
    console.log("User", user);
  }, []);

  if (!requiredRoles.includes(user.role) || user.role === AccessRole.GUEST) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>You are explicitly denied access to this page.</div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
