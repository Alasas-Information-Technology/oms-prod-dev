"use client";

import { motion } from "motion/react";
import { SectionWrapper, SectionHeader } from "./SectionWrapper";

const phases = [
  {
    phase: "Phase 1",
    title: "Discovery",
    description: "Requirements analysis, stakeholder alignment, and system architecture planning.",
    duration: "2-3 Weeks",
  },
  {
    phase: "Phase 2",
    title: "Configuration",
    description: "Platform customization, workflow setup, role configuration, and data migration.",
    duration: "4-6 Weeks",
  },
  {
    phase: "Phase 3",
    title: "Deployment",
    description: "UAT testing, user training, go-live preparation, and production deployment.",
    duration: "2-3 Weeks",
  },
  {
    phase: "Phase 4",
    title: "Support",
    description: "Ongoing monitoring, optimization, feature enhancements, and dedicated support.",
    duration: "Continuous",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.5, ease: "easeOut" as any } 
  },
};

export function ImplementationJourney() {
  return (
    <SectionWrapper className="bg-secondary/30">
      <SectionHeader
        badge="IMPLEMENTATION"
        title="Your Journey to Digital Transformation"
        description="A structured, phased approach to deploying DIEZ OMS across your organization."
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 relative"
      >
        {/* Connecting Line (Desktop) */}
        <div className="hidden lg:block absolute top-[100px] left-0 right-0 h-px bg-border -z-10" />

        {phases.map((item, i) => (
          <motion.div
            key={i}
            variants={itemVariants}
            className="bg-card border border-border/60 rounded-2xl p-8 relative hover:shadow-lg hover:-translate-y-1 hover:border-primary/20 transition-all duration-300 ease-out"
          >
            <div className="text-xs font-bold uppercase tracking-widest text-primary mb-4 flex items-center justify-between">
              {item.phase}
              {/* Dot on line indicator */}
              <div className="hidden lg:block absolute -top-[5px] left-8 w-2 h-2 rounded-full bg-primary ring-4 ring-card" />
            </div>
            
            <h3 className="text-xl font-bold text-heading mb-3">{item.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6 h-[80px]">
              {item.description}
            </p>
            
            <span className="inline-flex px-3 py-1.5 rounded-full bg-primary/8 text-primary text-xs font-bold uppercase tracking-wider">
              {item.duration}
            </span>
          </motion.div>
        ))}
      </motion.div>
    </SectionWrapper>
  );
}
