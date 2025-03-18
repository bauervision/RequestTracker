import { useRouter } from "next/router";
import { useEffect } from "react";
import { useUser } from "@/app/context/UserContext";
import { NextPage } from "next";

type ProtectedRouteProps = {
  requiredRoles: string[];
  Component: NextPage;
};

const withProtectedRoute = (Component: NextPage, requiredRoles: string[]) => {
  return function WrappedComponent(props: any) {
    const { user } = useUser();
    const router = useRouter();

    useEffect(() => {
      if (router.isReady) {
        if (user.role === "guest" || !requiredRoles.includes(user.role)) {
          router.replace("/?message=You do not have access to this page");
        }
      }
    }, [router, user.role, requiredRoles]);

    return <Component {...props} />;
  };
};

export default withProtectedRoute;
