import { Dropdown } from "@/components/DropDown";
import React from "react";

import {
  adminData,
  programManagementData,
  catalogData,
  inventoryData,
  maintenanceData,
} from "./requestTrackerData";

import FrequentLinks from "@/components/Requests/FrequentLinks";
function RequestTrackerNavBar() {
  return (
    <>
      <div className="w-full gradientBG py-4 ">
        <h1 className="boldText text-white mb-3">Catēna Request Tracker</h1>
        <div className="grid grid-cols-5 space-x-3 px-4 items-center justify-center">
          <Dropdown title="Administration" items={adminData} />
          <Dropdown title="Program Management" items={programManagementData} />
          <Dropdown title="Catalog Tools" items={catalogData} />
          <Dropdown title="Inventory" items={inventoryData} />
          <Dropdown title="Maintenance" items={maintenanceData} />
        </div>
      </div>

      <FrequentLinks />
    </>
  );
}

export default RequestTrackerNavBar;
