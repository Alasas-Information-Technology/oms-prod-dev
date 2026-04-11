'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
    role: string;
    email: string;
    department: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    currentUser: User | null;
    login: (user: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const router = useRouter();

    useEffect(() => {
        const storedAuth = localStorage.getItem('oms_demo_auth');
        if (storedAuth) {
            const parsed = JSON.parse(storedAuth);
            setIsAuthenticated(parsed.isAuthenticated);
            setCurrentUser(parsed.currentUser);
        }
    }, []);

    const login = (user: User) => {
        setIsAuthenticated(true);
        setCurrentUser(user);
        localStorage.setItem('oms_demo_auth', JSON.stringify({ isAuthenticated: true, currentUser: user }));
    };

    const logout = () => {
        setIsAuthenticated(false);
        setCurrentUser(null);
        localStorage.removeItem('oms_demo_auth');
        router.push('/sign-up-login-screen');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, currentUser, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
