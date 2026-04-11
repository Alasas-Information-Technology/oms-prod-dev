import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

interface AppLayoutProps {
    children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
    return (
        <div className="min-h-screen bg-[hsl(210,20%,97%)]">
            <Sidebar />
            <Topbar />
            <main
                className="transition-all duration-300 ease-in-out pt-16"
                style={{ paddingLeft: 'var(--sidebar-width)' }}
            >
                <div className="min-h-[calc(100vh-64px)] p-6 xl:p-8 2xl:p-10">
                    {children}
                </div>
            </main>
        </div>
    );
}