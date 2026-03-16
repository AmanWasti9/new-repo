"use client";

import { useState } from "react";
import Link from "next/link";
import { LogOut, Menu, X } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export interface SidebarLink {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface SidebarProps {
  title?: string;
  links: SidebarLink[];
}

export default function Sidebar({ title = "Dashboard", links }: SidebarProps) {
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <>
      <div className="md:hidden flex bg-blue-700 text-white p-4 h-[50px]">
        <button onClick={() => setIsOpen(true)}>
          <Menu size={24} />
        </button>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 w-64 bg-blue-100 text-black 
        transform transition-transform duration-300 z-50
        flex flex-col
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:static`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold">{title}</h2>
          <button className="md:hidden" onClick={() => setIsOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center px-4 py-2 rounded hover:bg-blue-50 transition"
                onClick={() => setIsOpen(false)}
              >
                <Icon className="mr-2" size={18} /> {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <Link
            href="/login"
            className="block px-4 py-2 rounded hover:bg-blue-50 transition"
            onClick={logout}
          >
            <LogOut className="inline mr-2" /> Logout
          </Link>
        </div>
      </aside>
    </>
  );
}
