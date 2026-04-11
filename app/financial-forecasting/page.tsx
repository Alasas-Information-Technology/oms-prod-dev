import React from 'react';
import AppLayout from '@/components/AppLayout';

export default function FinancialForecastingPage() {
    return (
        <AppLayout>
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="w-16 h-16 rounded-full bg-[hsl(214,67%,32%)]/10 flex items-center justify-center mb-6">
                    <span className="text-[hsl(214,67%,32%)] text-2xl font-bold">✨</span>
                </div>
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Financial Forecasting Module Coming Soon</h1>
                <p className="text-slate-500 max-w-md">
                    This module is currently under development. Check back in a future update.
                </p>
            </div>
        </AppLayout>
    );
}
