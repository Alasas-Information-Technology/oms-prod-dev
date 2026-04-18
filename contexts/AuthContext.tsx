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
    department_id?: string;  // UUID — links profile to departments table
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
    const currentUserRef = React.useRef<User | null>(null);

    // Sync ref with state
    useEffect(() => {
        currentUserRef.current = currentUser;
    }, [currentUser]);

    const fetchProfile = React.useCallback(async (uid: string, email: string) => {
        // Only set loading true if we don't already have a valid user (Silent Refresh)
        if (!currentUserRef.current) {
            setIsLoading(true);
        }
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
                    department_id: data.department_id ?? undefined,
                    full_name: data.full_name
                });
            } else {
                console.warn("AuthContext: Single query returned no data but no error.");
                setCurrentUser(null);
            }
        } catch (err: unknown) {
            console.error('AuthContext: Fatal catch error in fetchProfile:', err);
            setCurrentUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        let isMounted = true;

        // Use onAuthStateChange as the single source of truth for session
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log(`AuthContext: Auth State Change Event: ${event}`);
            
            if (session) {
                // Only fetch profile if we don't have a user or if the UID changed
                // This prevents redundant reloads when tab switches trigger session verification
                setCurrentUser(prevUser => {
                    if (!prevUser || prevUser.id !== session.user.id) {
                        fetchProfile(session.user.id, session.user.email!);
                    }
                    return prevUser;
                });
            } else {
                if (isMounted) {
                    setCurrentUser(null);
                    setIsLoading(false);
                }
            }
        });

        // Initial check if we are already loaded (to catch state before listener)
        const checkInitialSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session && isMounted) {
                await fetchProfile(session.user.id, session.user.email!);
            } else if (!session && isMounted) {
                setIsLoading(false);
            }
        };
        checkInitialSession();

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, [fetchProfile]);



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
