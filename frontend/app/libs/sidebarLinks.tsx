import { SidebarLink } from "../components/Sidebar";
import { LayoutDashboard, Users, Car, Calendar, User, MessageSquare } from "lucide-react";

export const adminLinks: SidebarLink[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Cars", href: "/admin/cars", icon: Car },
  { label: "Bookings", href: "/admin/bookings", icon: Calendar },
];

export const ownerLinks: SidebarLink[] = [
  { label: "Dashboard", href: "/owner", icon: LayoutDashboard },
  { label: "My Cars", href: "/owner/my-cars", icon: Car },
  { label: "Bookings", href: "/owner/bookings", icon: Calendar },
  { label: "Messages", href: "/chat", icon: MessageSquare },
];

export const customerLinks: SidebarLink[] = [
  { label: "Dashboard", href: "/customer", icon: LayoutDashboard },
  { label: "My Bookings", href: "/customer/bookings", icon: Calendar },
  { label: "Browse Cars", href: "/customer/browse-cars", icon: Car },
  { label: "Messages", href: "/chat", icon: MessageSquare },
];
