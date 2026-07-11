"use client";

import { motion } from "motion/react";
import { SectionWrapper, SectionHeader } from "./SectionWrapper";

const differentiators = [
  {
    metric: "100%",
    title: "Audit Trail",
    description: "Every action, approval, and modification is permanently recorded with full traceability.",
  },
  {
    metric: "6",
    title: "FLEXIS Models",
    description: "Six specialized engagement frameworks covering every workforce arrangement type.",
  },
  {
    metric: "24/7",
    title: "Real-Time",
    description: "Live dashboards, instant notifications, and real-time workflow status updates.",
  },
  {
    metric: "∞",
    title: "Scalable",
    description: "Cloud-ready architecture designed to grow with your organization's needs.",
  },
  {
    metric: "360°",
    title: "Compliance",
    description: "Built-in regulatory compliance aligned with UAE government procurement standards.",
  },
  {
    metric: "Multi",
    title: "Level Approvals",
    description: "Configurable approval hierarchies matching your organization's authority structure.",
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
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as any } 
  },
};

export function WhyDiez() {
  return (
    <SectionWrapper id="why" className="bg-background">
      <SectionHeader
        badge="WHY DIEZ OMS"
        title="Built for Enterprise Excellence"
        description="Designed from the ground up for the scale, security, and sophistication required by government entities and multinational organizations."
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mt-12"
      >
        {differentiators.map((diff, i) => (
          <motion.div
            key={i}
            variants={itemVariants}
            className="bg-card border border-border/60 rounded-2xl p-8 hover:shadow-lg hover:border-primary/20 transition-all duration-300 ease-out flex flex-col"
          >
            <span className="text-4xl md:text-5xl font-bold text-primary mb-4 block">
              {diff.metric}
            </span>
            <h3 className="text-xl font-bold text-heading mb-3">{diff.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {diff.description}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </SectionWrapper>
  );
}
