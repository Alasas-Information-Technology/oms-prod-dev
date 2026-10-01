"use client";

import { motion } from "motion/react";
import { SectionWrapper, SectionHeader } from "./SectionWrapper";

const steps = [
  {
    title: "Identify Business Need",
    description: "Define workforce requirements, budget allocation, and timeline",
  },
  {
    title: "Select FLEXIS Model",
    description: "Choose the optimal engagement model matching the operational scope",
  },
  {
    title: "Create Requisition",
    description: "Submit a structured outsource requisition with automated validation",
  },
  {
    title: "Approval Workflow",
    description: "Automated multi-level routing according to delegation authority",
  },
  {
    title: "Vendor Engagement",
    description: "Match with accredited service providers across registered categories",
  },
  {
    title: "Contract Execution",
    description: "Digital contract creation, digital signature, and legal compliance",
  },
  {
    title: "Workforce Deployment",
    description: "Secure onboarding and deployment of the outsourced workforce",
  },
  {
    title: "Monitor & Analyze",
    description: "Track SLA performance, compliance metrics, and financial variance",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as any } 
  },
};

export function ProcessJourney() {
  return (
    <SectionWrapper id="process">
      <SectionHeader
        badge="HOW IT WORKS"
        title="From Need to Delivery"
        description="A streamlined 8-step journey that transforms business requirements into managed workforce deployments."
      />

      <div className="max-w-4xl mx-auto mt-12 sm:mt-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="relative"
        >
          {/* Center Line (Desktop) */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-border/80 -translate-x-1/2" />
          
          {/* Left Line (Mobile) */}
          <div className="md:hidden absolute left-5 top-0 bottom-0 w-px bg-border/80" />

          <div className="flex flex-col gap-6 md:gap-0">
            {steps.map((step, i) => {
              const isEven = i % 2 !== 0;
              
              return (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="relative flex items-center md:h-32"
                >
                  {/* Step Layout */}
                  <div className={`
                    w-full flex items-center
                    ${isEven ? 'md:flex-row-reverse' : 'md:flex-row'}
                  `}>
                    
                    {/* Empty Space for Desktop Alternate Layout */}
                    <div className="hidden md:block w-[calc(50%-2rem)]" />

                    {/* Step Number Node */}
                    <div className="relative z-10 size-10 sm:size-12 rounded-xl bg-card border-2 border-primary text-primary flex items-center justify-center font-extrabold text-sm sm:text-base shadow-md shrink-0 md:mx-auto">
                      {i + 1}
                    </div>

                    {/* Content Card */}
                    <div className={`
                      w-[calc(100%-3.5rem)] md:w-[calc(50%-2rem)] pl-4 md:pl-0
                      ${isEven ? 'md:pr-8 md:text-right' : 'md:pl-8 md:text-left'}
                    `}>
                      <div className="bg-card border border-border/70 rounded-xl p-5 sm:p-6 shadow-2xs hover:shadow-md transition-shadow">
                        <h3 className="text-base sm:text-lg font-bold text-heading mb-1.5 leading-snug tracking-tight">
                          {step.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-normal">
                          {step.description}
                        </p>
                      </div>
                    </div>

                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
