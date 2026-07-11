"use client";

import { motion } from "motion/react";
import { SectionWrapper, SectionHeader } from "./SectionWrapper";

const steps = [
  {
    title: "Identify Business Need",
    description: "Define workforce requirements, budget, and timeline",
  },
  {
    title: "Select FLEXIS Model",
    description: "Choose the optimal engagement model for your need",
  },
  {
    title: "Create Requisition",
    description: "Submit a detailed outsource request through OMS",
  },
  {
    title: "Approval Workflow",
    description: "Automated multi-level approval routing",
  },
  {
    title: "Vendor Engagement",
    description: "Match with accredited service providers",
  },
  {
    title: "Contract Execution",
    description: "Digital contract creation and signing",
  },
  {
    title: "Workforce Deployment",
    description: "Onboard and deploy the outsourced team",
  },
  {
    title: "Monitor & Analyze",
    description: "Track performance, compliance, and spend",
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

      <div className="max-w-4xl mx-auto mt-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="relative"
        >
          {/* Center Line (Desktop) */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2" />
          
          {/* Left Line (Mobile) */}
          <div className="md:hidden absolute left-5 top-0 bottom-0 w-px bg-border" />

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

                    {/* Center Circle */}
                    <div className="absolute left-0 md:left-1/2 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shadow-md z-10 md:-translate-x-1/2 border-4 border-background">
                      {i + 1}
                    </div>

                    {/* Card */}
                    <div className={`
                      w-full md:w-[calc(50%-2rem)] pl-16 md:pl-0
                      ${isEven ? 'md:pr-10 md:text-right' : 'md:pl-10 text-left'}
                    `}>
                      <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                        <h3 className="text-lg font-bold text-heading mb-1">{step.title}</h3>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
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
