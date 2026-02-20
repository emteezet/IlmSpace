"use client";

import Link from "next/link";
import {
  X,
  LayoutDashboard,
  BookOpen,
  Mic2,
  Users,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: BookOpen, label: "My Classes", href: "/classes" },
  { icon: Mic2, label: "Live Spaces", href: "/live" },
  { icon: Users, label: "Community", href: "/community" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export default function MobileSidebar({ isOpen, onClose }) {
  const { logout, user, loading } = useAuth();

  if (loading || !user || !isOpen) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity lg:hidden ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      ></div>

      {/* Mobile Sidebar */}
      <aside
        className={`fixed left-0 top-16 bottom-0 w-64 bg-[#0a0a0a] border-r border-white/10 z-50 flex flex-col p-4 transition-transform lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-lg"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex-1 space-y-2 mt-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all group"
            >
              <item.icon className="w-5 h-5 group-hover:text-emerald-500" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </div>

        <button
          onClick={() => {
            logout();
            onClose();
          }}
          className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-400/5 rounded-lg transition-all w-full"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </aside>
    </>
  );
}
