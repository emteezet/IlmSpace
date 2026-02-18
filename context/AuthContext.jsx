'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
        
        // Redirect to dashboard if already logged in and on auth pages
        if (storedUser && token) {
            const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
            if (pathname === '/login' || pathname === '/register') {
                router.push('/dashboard');
            }
        }
    }, [router]);

    const login = async (email, password) => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();
            if (data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                document.cookie = `token=${data.token}; path=/; max-age=2592000`;
                setUser(data.user);
                setTimeout(() => {
                    router.push('/dashboard');
                }, 100);
                return { success: true };
            }
            return { success: false, error: data.error || 'Login failed' };
        } catch (err) {
            return { success: false, error: 'Network error. Please try again.' };
        }
    };

    const register = async (name, email, password, role) => {
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role }),
            });

            const data = await res.json();
            if (data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                document.cookie = `token=${data.token}; path=/; max-age=2592000`;
                setUser(data.user);
                setTimeout(() => {
                    router.push('/dashboard');
                }, 100);
                return { success: true };
            }
            return { success: false, error: data.error || 'Registration failed' };
        } catch (err) {
            return { success: false, error: 'Network error. Please try again.' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        document.cookie = 'token=; path=/; max-age=0';
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
