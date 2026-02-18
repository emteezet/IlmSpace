"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  BookOpen,
  Mic2,
  Users,
  Settings,
  LogOut,
  Home,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: BookOpen, label: "My Classes", href: "/classes" },
  { icon: Mic2, label: "Live Spaces", href: "/live" },
  { icon: Users, label: "Community", href: "/community" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export default function Sidebar() {
  const { logout, user, loading } = useAuth();

  // Don't render sidebar if not authenticated or still loading
  if (loading || !user) {
    return null;
  }

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-[#0a0a0a] border-r border-white/10 hidden lg:flex flex-col p-4 z-40">
      <div className="flex-1 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all group"
          >
            <item.icon className="w-5 h-5 group-hover:text-emerald-500" />
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </div>

      <button
        onClick={logout}
        className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-400/5 rounded-xl transition-all w-full"
      >
        <LogOut className="w-5 h-5" />
        <span className="font-medium">Logout</span>
      </button>
    </aside>
  );
}
