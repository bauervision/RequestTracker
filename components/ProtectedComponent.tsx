"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/compat/router"; // Use standard router
import { useUser } from "@/app/context/UserContext";

interface ProtectedComponentProps {
  requiredRoles: string[];
  children: ReactNode;
}

const ProtectedComponent: React.FC<ProtectedComponentProps> = ({
  requiredRoles,
  children,
}) => {
  const { user } = useUser();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    console.log("Component mounted");
  }, []);

  useEffect(() => {
    if (isMounted) {
      console.log("Checking router readiness and role", {
        router,
        userRole: user.role,
      });
      if (router && router.isReady) {
        console.log("Router is ready:", router.isReady);
        console.log("User role:", user.role);
        console.log("Required roles:", requiredRoles);

        if (user.role === "guest" || !requiredRoles.includes(user.role)) {
          console.log("Redirecting to home with access message");
          router.replace("/?message=You do not have access to this page");
        }
      } else {
        console.log("Router is not ready yet", {
          isMounted,
          router,
          routerReady: router?.isReady,
        });
      }
    }
  }, [isMounted, user.role, requiredRoles, router]);

  if (!isMounted) {
    return null; // Avoid rendering until mounted
  }

  return <>{children}</>;
};

export default ProtectedComponent;
