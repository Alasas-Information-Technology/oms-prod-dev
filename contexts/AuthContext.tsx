'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export interface User {
    id: string;
    role_id: number;
    roles: {
        role_name: string;
    };
    email: string;
    department: string;
    full_name?: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    currentUser: User | null;
    isLoading: boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const router = useRouter();

    useEffect(() => {
        // Initial session check
        const initAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                await fetchProfile(session.user.id, session.user.email!);
            }
            setIsLoading(false);
        };

        initAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session) {
                await fetchProfile(session.user.id, session.user.email!);
            } else {
                setCurrentUser(null);
            }
            setIsLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const fetchProfile = async (uid: string, email: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*, roles(role_name)')
                .eq('id', uid)
                .single();

            if (data) {
                setCurrentUser({
                    id: uid,
                    email: email,
                    role_id: data.role_id,
                    roles: data.roles,
                    department: data.department || 'N/A',
                    full_name: data.full_name
                });
            }
        } catch (err) {
            console.error('Error fetching user profile:', err);
        }
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setCurrentUser(null);
        router.push('/sign-up-login-screen');
    };

    return (
        <AuthContext.Provider value={{ 
            isAuthenticated: !!currentUser, 
            currentUser, 
            isLoading,
            logout 
        }}>
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
