'use client';

import React from 'react';
import { Check, Circle } from 'lucide-react';

interface Step {
    stage_id: number;
    stage_name: string;
}

interface WorkflowStepperProps {
    currentStep: number;
    stages?: Step[];
    workflowFinished?: boolean;
}

export default function WorkflowStepper({ currentStep, stages = [], workflowFinished = false }: WorkflowStepperProps) {
    // If no stages provided, show nothing or skeleton
    if (stages.length === 0) return null;

    const totalStages = stages.length;

    return (
        <div className="w-full py-6">
            <div className="flex items-center justify-between relative">
                {/* Connection Lines */}
                <div className="absolute top-5 left-0 w-full h-0.5 bg-slate-200 -z-10" />
                <div 
                    className="absolute top-5 left-0 h-0.5 bg-[#0C66E4] transition-all duration-500 ease-in-out -z-10" 
                    style={{ width: `${Math.min(100, ((currentStep - 1) / (totalStages - 1)) * 100)}%` }}
                />

                {stages.map((stage, idx) => {
                    const isCompleted = workflowFinished || stage.stage_id < currentStep;
                    const isActive = !workflowFinished && stage.stage_id === currentStep;

                    return (
                        <div key={stage.stage_id} className="flex flex-col items-center flex-1">
                            <div 
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 shadow-sm
                                    ${isCompleted ? 'bg-[#0C66E4] border-[#0C66E4] text-white' : 
                                      isActive ? 'bg-white border-[#0C66E4] text-[#0C66E4] scale-105 shadow-md ring-4 ring-[#DEEBFF]' : 
                                      'bg-[#F4F5F7] border-[#DFE1E6] text-[#5E6C84]'}`}
                            >
                                {isCompleted ? (
                                    <Check size={18} strokeWidth={3} />
                                ) : (
                                    <span className="text-sm font-bold">{idx + 1}</span>
                                )}
                            </div>
                            <div className="mt-3 text-center px-2">
                                <p className={`text-[10px] md:text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${isActive ? 'text-[#0C66E4]' : 'text-[#5E6C84]'}`}>
                                    {stage.stage_name}
                                </p>
                                <p className="text-[10px] text-[#42526E] mt-0.5 max-w-[120px] mx-auto font-bold uppercase tracking-tighter hidden md:block">
                                    {isActive ? 'In Progress' : isCompleted ? 'Completed' : 'Upcoming'}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
