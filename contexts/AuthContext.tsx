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
        setIsLoading(true); // Ensure loading state is active during fetch
        try {
            console.log("AuthContext: Fetching profile for UID:", uid);
            const { data, error } = await supabase
                .from('profiles')
                .select('*, roles(role_name)')
                .eq('id', uid)
                .single();

            if (error) {
                console.error("AuthContext: Supabase Error fetching profile:", error.message, error.details);
                throw error;
            }

            if (data) {
                console.log("AuthContext: Profile Data Raw:", data);
                
                // Inspecting the roles join specifically
                if (!data.roles) {
                    console.warn("AuthContext: 'roles' join returned null. Check RLS on 'roles' table or Foreign Key name.");
                    if (data.role_id) {
                        console.log("AuthContext: 'role_id' found but 'roles' join failed. ID:", data.role_id);
                    }
                }

                const roleData = Array.isArray(data.roles) ? data.roles[0] : data.roles;

                setCurrentUser({
                    id: uid,
                    email: email,
                    role_id: data.role_id,
                    roles: roleData || { role_name: 'Guest' },
                    department: data.department || 'N/A',
                    full_name: data.full_name
                });
            } else {
                console.warn("AuthContext: Single query returned no data but no error.");
                setCurrentUser(null);
            }
        } catch (err: any) {
            console.error('AuthContext: Fatal catch error in fetchProfile:', err);
            setCurrentUser(null);
        } finally {
            setIsLoading(false);
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
