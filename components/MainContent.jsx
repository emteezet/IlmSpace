"use client";

import { useAuth } from "@/context/AuthContext";

export default function MainContent({ children }) {
  const { user, loading } = useAuth();

  // Only apply sidebar margin when user is authenticated and on desktop
  const isAuthenticated = user && !loading;

  return (
    <main
      className={`flex-1 pt-16 min-h-[calc(100vh-64px)] px-3 sm:px-4 md:px-6 py-4 sm:py-6 ${isAuthenticated ? "lg:ml-64" : ""}`}
    >
      <div className="max-w-8xl mx-auto">{children}</div>
    </main>
  );
}
