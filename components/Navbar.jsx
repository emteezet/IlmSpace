'use client';

import Link from 'next/link';
import { Menu, User, Bell, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
    const { user, logout, loading } = useAuth();

    return (
        <nav className="fixed top-0 left-0 right-0 h-16 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/10 z-50 flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
                <button className="p-2 hover:bg-white/5 rounded-lg lg:hidden">
                    <Menu className="w-6 h-6" />
                </button>
                <Link href="/" className="text-xl font-bold bg-gradient-to-r from-emerald-500 to-gold-500 bg-clip-text text-transparent">
                    IlmSpace
                </Link>
            </div>

            <div className="flex items-center gap-4">
                {user && !loading ? (
                    <>
                        <button className="p-2 hover:bg-white/5 rounded-full relative">
                            <Bell className="w-5 h-5 text-gray-400" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border-2 border-[#0a0a0a]"></span>
                        </button>
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                            <User className="w-5 h-5 text-emerald-500" />
                        </div>
                    </>
                ) : (
                    <div className="flex items-center gap-3">
                        <Link href="/login" className="px-4 py-2 text-emerald-500 hover:text-emerald-400 font-medium text-sm">
                            Log In
                        </Link>
                        <Link href="/register" className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-lg text-sm transition-all">
                            Sign Up
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
}

