"use client";

import Link from "next/link";
import { Menu, User, Bell, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Navbar({ onMenuClick, isMobileMenuOpen }) {
  const { user, logout, loading } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/10 z-50 flex items-center justify-between px-3 sm:px-6">
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={onMenuClick}
          className={`p-2 hover:bg-white/5 rounded-lg lg:hidden transition-colors ${isMobileMenuOpen ? "bg-white/10" : ""}`}
        >
          <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <Link
          href="/"
          className="text-lg sm:text-xl font-bold bg-gradient-to-r from-emerald-500 to-gold-500 bg-clip-text text-transparent truncate"
        >
          IlmSpace
        </Link>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {user && !loading ? (
          <>
            <button className="p-2 hover:bg-white/5 rounded-full relative hidden sm:block">
              <Bell className="w-5 h-5 text-gray-400" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border-2 border-[#0a0a0a]"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="px-2 sm:px-4 py-2 text-emerald-500 hover:text-emerald-400 font-medium text-xs sm:text-sm"
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="px-2 sm:px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-lg text-xs sm:text-sm transition-all"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
