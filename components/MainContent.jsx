'use client';

import { useAuth } from '@/context/AuthContext';

export default function MainContent({ children }) {
  const { user, loading } = useAuth();

  // Only apply sidebar margin when user is authenticated and on desktop
  const isAuthenticated = user && !loading;

  return (
    <main className={`flex-1 pt-16 p-6 min-h-[calc(100vh-64px)] ${isAuthenticated ? 'lg:ml-64' : ''}`}>
      {children}
    </main>
  );
}
