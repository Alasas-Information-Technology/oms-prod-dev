'use client';

import React from 'react';
import { Check, Circle } from 'lucide-react';

interface Step {
    id: number;
    title: string;
    description: string;
}

const steps: Step[] = [
    { id: 1, title: 'Initiation & Budget', description: 'Request submitted and funding verified' },
    { id: 2, title: 'Hierarchical & HR Approval', description: 'Awaiting HR Manager governance check' },
    { id: 3, title: 'ERP PR Generation', description: 'Post-approval doc generation in Oracle' },
    { id: 4, title: 'Procurement & Vendor', description: 'Vendor quotation and sourcing' },
];

interface WorkflowStepperProps {
    currentStep: number;
}

export default function WorkflowStepper({ currentStep }: WorkflowStepperProps) {
    return (
        <div className="w-full py-6">
            <div className="flex items-center justify-between relative">
                {/* Connection Lines */}
                <div className="absolute top-5 left-0 w-full h-0.5 bg-slate-200 -z-10" />
                <div 
                    className="absolute top-5 left-0 h-0.5 bg-[hsl(214,67%,32%)] transition-all duration-500 ease-in-out -z-10" 
                    style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                />

                {steps.map((step) => {
                    const isCompleted = step.id < currentStep;
                    const isActive = step.id === currentStep;

                    return (
                        <div key={step.id} className="flex flex-col items-center flex-1">
                            <div 
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 shadow-sm
                                    ${isCompleted ? 'bg-[hsl(214,67%,32%)] border-[hsl(214,67%,32%)] text-white' : 
                                      isActive ? 'bg-white border-[hsl(214,67%,32%)] text-[hsl(214,67%,32%)] scale-110 shadow-md ring-4 ring-blue-50' : 
                                      'bg-white border-slate-200 text-slate-400'}`}
                            >
                                {isCompleted ? (
                                    <Check size={18} strokeWidth={3} />
                                ) : (
                                    <span className="text-sm font-bold">{step.id}</span>
                                )}
                            </div>
                            <div className="mt-3 text-center px-2">
                                <p className={`text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${isActive ? 'text-[hsl(214,67%,32%)]' : 'text-slate-500'}`}>
                                    {step.title}
                                </p>
                                <p className="text-[10px] text-slate-400 mt-0.5 max-w-[120px] mx-auto leading-tight hidden md:block">
                                    {isActive ? 'Current Phase' : step.description}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
