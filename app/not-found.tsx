'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/button';

export default function NotFound() {
    const router = useRouter();

    const handleGoHome = () => {
        router?.push('/');
    };

    const handleGoBack = () => {
        if (typeof window !== 'undefined') {
            window.history?.back();
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
            <div className="text-center max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <h1 className="text-9xl font-bold text-primary opacity-20">404</h1>
                    </div>
                </div>

                <h2 className="text-2xl font-medium text-onBackground mb-2">Page Not Found</h2>
                <p className="text-onBackground/70 mb-8">
                    The page you're looking for doesn't exist. Let's get you back!
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                        onClick={handleGoBack}
                        className="inline-flex h-auto items-center justify-center gap-2 px-6 py-3"
                    >
                        <Icon name="ArrowLeftIcon" size={16} />
                        Go Back
                    </Button>

                    <Button
                        variant="outline"
                        onClick={handleGoHome}
                        className="inline-flex h-auto items-center justify-center gap-2 px-6 py-3 bg-background"
                    >
                        <Icon name="HomeIcon" size={16} />
                        Back to Home
                    </Button>
                </div>
            </div>
        </div>
    );
}