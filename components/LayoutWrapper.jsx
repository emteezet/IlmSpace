"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import MobileSidebar from "@/components/MobileSidebar";
import MainContent from "@/components/MainContent";
import { AuthProvider } from "@/context/AuthContext";

export default function LayoutWrapper({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar
          onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          isMobileMenuOpen={mobileMenuOpen}
        />
        <MobileSidebar
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />
        <div className="flex flex-1">
          <Sidebar />
          <MainContent>{children}</MainContent>
        </div>
      </div>
    </AuthProvider>
  );
}
