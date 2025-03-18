"use client";

import React from "react";
import { GalleryVerticalEnd } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  adminData,
  catalogData,
  inventoryData,
  maintenanceData,
  programManagementData,
  tutorialData,
} from "@/app/request-tracker/requestTrackerData";
import { handleLinkClick } from "@/app/utils/trackLinkClicks";
import { useUser } from "@/app/context/UserContext";
import { AccessRole } from "@/app/constants";

const data = {
  navMain: [
    {
      title: "How To",
      url: "#",
      items: tutorialData,
    },
    {
      title: "Administration",
      url: "#",
      items: adminData,
    },
    {
      title: "Program Management",
      url: "#",
      items: programManagementData,
    },
    {
      title: "Catalog",
      url: "#",
      items: catalogData,
    },
    {
      title: "Inventory",
      url: "#",
      items: inventoryData,
    },
  ],
};

export function SideBar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Filter out specific elements in adminData if the user role is not 'admin'
  const filteredAdminData =
    user.role === AccessRole.ADMIN || user.role === AccessRole.SUPER_ADMIN
      ? adminData
      : adminData.filter((item) => item.title === "Account Information");

  const filteredNavMain = data.navMain
    .filter(
      (item) => item.title !== "Administration" || filteredAdminData.length > 0
    )
    .map((item) =>
      item.title === "Administration"
        ? { ...item, items: filteredAdminData }
        : item
    );

  if (!isMounted) return null;

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#" onClick={() => handleLinkClick("/request-tracker")}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <GalleryVerticalEnd className="size-8" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Catena Request Tracker</span>
                  <span className="">v1.0.0</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {filteredNavMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <a href={item.url} className="font-medium">
                    {item.title}
                  </a>
                </SidebarMenuButton>
                {item.items?.length ? (
                  <SidebarMenuSub>
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild>
                          <a
                            href={subItem.url}
                            onClick={() => handleLinkClick(`${subItem.url}`)}
                          >
                            {subItem.title}
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                ) : null}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
