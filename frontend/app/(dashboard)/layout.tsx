"use client";

import { ReactNode } from "react";
import Sidebar from "../components/Sidebar";
import { adminLinks, ownerLinks, customerLinks } from "../libs/sidebarLinks";
import { useAuth } from "@/context/AuthContext";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user } = useAuth();

  const userRole = user?.role as "ADMIN" | "OWNER" | "CUSTOMER" | undefined;

  const links =
    userRole === "ADMIN"
      ? adminLinks
      : userRole === "OWNER"
      ? ownerLinks
      : userRole === "CUSTOMER"
      ? customerLinks
      : [];

  return (
    <div className="flex min-h-screen">
      <Sidebar title={userRole || "Dashboard"} links={links} />
      
      <main className="flex-1 p-6 bg-gray-100">{children}</main>
    </div>
  );
}