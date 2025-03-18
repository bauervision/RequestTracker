import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/navbar/Navbar";
import { RequestProvider, ToastContextProvider } from "./context/DataContext";

import ProtectedRoute from "@/components/ProtectedRoute";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SideBar } from "@/components/SideBar";
import { UserProvider } from "./context/UserContext";
import { WorkflowProvider } from "./context/WorkflowContext";
import { SchemaProvider } from "./context/SchemaContext";
import { AccessRole } from "./constants";
import { UserManagementProvider } from "./context/UserManagementContext";
import { UserGroupProvider } from "./context/UserGroupContext";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Catena",
  description: "Next Generation Integrated Logistics Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <main>
          <UserManagementProvider>
            <UserProvider>
              <UserGroupProvider>
                <ProtectedRoute
                  requiredRoles={[
                    AccessRole.SUPER_ADMIN,
                    AccessRole.ADMIN,
                    AccessRole.USER,
                  ]}
                >
                  <Navbar />

                  <div>
                    <ToastContextProvider>
                      <SidebarProvider>
                        <SideBar />
                        <SidebarTrigger />
                        <WorkflowProvider>
                          <SchemaProvider>
                            <RequestProvider>{children}</RequestProvider>
                          </SchemaProvider>
                        </WorkflowProvider>
                      </SidebarProvider>
                    </ToastContextProvider>
                  </div>
                </ProtectedRoute>
              </UserGroupProvider>
            </UserProvider>
          </UserManagementProvider>
        </main>
      </body>
    </html>
  );
}
