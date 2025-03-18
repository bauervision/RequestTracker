"use client";

import Link from "next/link";
import "./Navbar.css";
import RoleDropdown from "../RoleDropdown"; // Ensure this path is correct
import { useUser } from "@/app/context/UserContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/compat/router"; // Import useRouter

// dynamic style: inactive route
const inactiveHeaderStyle = {
  color: "#000000",
};

function Navbar() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = () => {
      setIsLoading(true);
    };

    const handleRouteComplete = () => {
      setIsLoading(false);
    };

    router?.events.on("routeChangeStart", handleRouteChange);
    router?.events.on("routeChangeComplete", handleRouteComplete);
    router?.events.on("routeChangeError", handleRouteComplete);

    return () => {
      router?.events.off("routeChangeStart", handleRouteChange);
      router?.events.off("routeChangeComplete", handleRouteComplete);
      router?.events.off("routeChangeError", handleRouteComplete);
    };
  }, [router?.events]);

  return (
    <div className="Header border-b" data-testid="Header">
      <div className="flex justify-between items-center w-full">
        <div className="flex space-x-4">
          <div className="headerSection">
            <Link href="/">Leidos</Link>
          </div>

          {/* request tracker */}
          <div className="headerItem" data-testid={`Header name`}>
            <Link
              className="navLink"
              style={inactiveHeaderStyle}
              data-testid="NavLink"
              href="/request-tracker"
            >
              Request Tracker
            </Link>
          </div>

          {/* eCatalog */}
          <div className="headerItem" data-testid={`Header name`}>
            <Link
              className="navLink"
              style={inactiveHeaderStyle}
              data-testid="NavLink"
              href="#"
            >
              eCatalog
            </Link>
          </div>

          {/* Program management */}
          <div className="headerItem" data-testid={`Header name`}>
            <Link
              className="navLink"
              style={inactiveHeaderStyle}
              data-testid="NavLink"
              href="#"
            >
              Program Management
            </Link>
          </div>
        </div>
        {/* Role Display and Dropdown */}{" "}
        <div
          className="flex items-center space-x-4 headerItem"
          data-testid={`Header role-switch`}
        >
          {isLoading ? <div>Loading...</div> : <RoleDropdown />}
        </div>
      </div>
    </div>
  );
}

export default Navbar;
