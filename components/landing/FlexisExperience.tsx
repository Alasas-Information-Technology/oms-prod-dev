"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/components/ui/utils";
import { SectionWrapper, SectionHeader } from "./SectionWrapper";
import { X, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const flexisModels = [
  {
    id: "F",
    title: "Full Time",
    description: "Permanent workforce integration for core operational roles",
    useCases: ["Long-term operational roles", "Core business functions", "Strategic positions"],
    idealFor: "Departments requiring consistent, dedicated resources",
    benefits: ["Workforce stability", "Deep institutional knowledge", "Consistent service delivery"],
    type: "Permanent Employment",
  },
  {
    id: "L",
    title: "Limited Term",
    description: "Project-based workforce for defined timelines",
    useCases: ["System implementations", "Office relocations", "Special projects"],
    idealFor: "Time-bound initiatives with clear deliverables",
    benefits: ["Cost efficiency", "Specialized expertise", "Defined scope"],
    type: "Fixed-Term Contract",
  },
  {
    id: "E",
    title: "Expert",
    description: "Specialized consultants for technical and advisory roles",
    useCases: ["Technology consulting", "Legal advisory", "Financial auditing"],
    idealFor: "Complex projects requiring niche expertise",
    benefits: ["Deep specialization", "Knowledge transfer", "Risk mitigation"],
    type: "Consultancy Agreement",
  },
  {
    id: "X",
    title: "Seasonal",
    description: "Variable workforce for demand-driven operations",
    useCases: ["Peak season support", "Event management", "Holiday coverage"],
    idealFor: "Industries with predictable demand fluctuations",
    benefits: ["Flexible scaling", "Cost optimization", "Rapid deployment"],
    type: "Seasonal Contract",
  },
  {
    id: "I",
    title: "Interim",
    description: "Temporary workforce for transitional periods",
    useCases: ["Maternity cover", "Emergency staffing", "Gap filling"],
    idealFor: "Short-term needs during organizational transitions",
    benefits: ["Immediate availability", "No long-term commitment", "Business continuity"],
    type: "Temporary Assignment",
  },
  {
    id: "S",
    title: "Specific",
    description: "Complete function outsourcing for entire operations",
    useCases: ["IT operations", "Facilities management", "Customer service centers"],
    idealFor: "Organizations looking to outsource entire departments",
    benefits: ["Operational efficiency", "Expert management", "Reduced overhead"],
    type: "Managed Service Agreement",
  },
];

export function FlexisExperience() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (activeIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [activeIndex]);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeIndex !== null && activeIndex < flexisModels.length - 1) {
      setActiveIndex(activeIndex + 1);
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeIndex !== null && activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    }
  };

  return (
    <SectionWrapper noPadding className="pb-24 md:pb-[120px]">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
        {flexisModels.map((model, index) => (
          <FlexisCard 
            key={model.id} 
            model={model} 
            onClick={() => setActiveIndex(index)} 
          />
        ))}
      </div>

      <AnimatePresence>
        {activeIndex !== null && (
          <FlexisModal
            model={flexisModels[activeIndex]}
            onClose={() => setActiveIndex(null)}
            onNext={handleNext}
            onPrev={handlePrev}
            hasNext={activeIndex < flexisModels.length - 1}
            hasPrev={activeIndex > 0}
          />
        )}
      </AnimatePresence>
    </SectionWrapper>
  );
}

function FlexisCard({ model, onClick }: { model: any; onClick: () => void }) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: "easeOut" as any }}
      className="bg-card border border-border/60 rounded-2xl p-8 cursor-pointer overflow-hidden relative group hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 h-full flex flex-col"
    >
      {/* Background Gradient Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors duration-500" />
      
      <div className="flex items-start justify-between relative z-10 mb-6">
        <div className="w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300">
          <span className="text-3xl font-bold text-primary group-hover:text-white transition-colors">
            {model.id}
          </span>
        </div>
        <div className="w-8 h-8 rounded-full border border-border/50 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all">
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-white transition-colors" />
        </div>
      </div>
      
      <div className="relative z-10 flex-grow">
        <h3 className="text-2xl font-bold text-heading mb-2">{model.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{model.description}</p>
      </div>
    </motion.div>
  );
}

function FlexisModal({ 
  model, 
  onClose, 
  onNext, 
  onPrev, 
  hasNext, 
  hasPrev 
}: { 
  model: any; 
  onClose: () => void;
  onNext: (e: React.MouseEvent) => void;
  onPrev: (e: React.MouseEvent) => void;
  hasNext: boolean;
  hasPrev: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6 lg:p-12">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" as any }}
        onClick={onClose}
        className="absolute inset-0 bg-background/80 backdrop-blur-md"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25, ease: "easeOut" as any }}
        className="relative w-full h-full md:h-auto md:max-h-[90vh] md:max-w-4xl bg-card border-border md:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-border/40 bg-secondary/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white">
              <span className="text-2xl font-bold">{model.id}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-0.5">FLEXIS Model</span>
              <h2 className="text-xl md:text-2xl font-bold text-heading leading-none uppercase">{model.title}</h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6 text-muted-foreground" />
          </button>
        </div>

        {/* Content - Scrollable area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          <p className="text-lg md:text-xl text-heading font-medium leading-relaxed mb-10 max-w-2xl">
            {model.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            {/* Left Column */}
            <div className="space-y-10">
              <div>
                <h4 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-4 flex items-center gap-2">
                  <span className="w-4 h-px bg-border"></span>
                  Ideal For
                </h4>
                <p className="text-base text-foreground bg-secondary/30 p-4 rounded-xl border border-border/40">
                  {model.idealFor}
                </p>
              </div>

              <div>
                <h4 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-4 flex items-center gap-2">
                  <span className="w-4 h-px bg-border"></span>
                  Use Cases
                </h4>
                <ul className="space-y-3">
                  {model.useCases.map((uc: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <span className="leading-relaxed">{uc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-10">
              <div>
                <h4 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-4 flex items-center gap-2">
                  <span className="w-4 h-px bg-border"></span>
                  Benefits
                </h4>
                <ul className="space-y-3">
                  {model.benefits.map((ben: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <span className="leading-relaxed">{ben}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-4 flex items-center gap-2">
                  <span className="w-4 h-px bg-border"></span>
                  Agreement Type
                </h4>
                <div className="inline-flex items-center px-4 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary font-semibold text-sm">
                  {model.type}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-6 border-t border-border/40 bg-card flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
          {/* Navigation */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
            <Button
              variant="outline"
              size="icon"
              onClick={onPrev}
              disabled={!hasPrev}
              className="rounded-full h-10 w-10 disabled:opacity-30"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={onNext}
              disabled={!hasNext}
              className="rounded-full h-10 w-10 disabled:opacity-30"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          <Button className="w-full sm:w-auto rounded-full px-8 h-12 shadow-md shadow-primary/20">
            Request Consultation
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
