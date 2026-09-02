"use client";

import { motion } from "motion/react";
import { FileText, ShieldCheck, GitBranch, LineChart, Users, Wallet } from "lucide-react";
import { SectionWrapper, SectionHeader } from "./SectionWrapper";

const capabilities = [
  {
    title: "Contract Lifecycle",
    description: "End-to-end lifecycle tracking for all outsource contracts, amendments, renewals, and terminations.",
    metric: "100% Digital",
    icon: FileText,
  },
  {
    title: "Vendor Accreditation",
    description: "Automated screening, evaluation, and registry maintenance for service providers across all zones.",
    metric: "360° Evaluation",
    icon: ShieldCheck,
  },
  {
    title: "Approval Workflows",
    description: "Configurable multi-step approval chains matching internal procurement authority limits and delegation rules.",
    metric: "Multi-Level",
    icon: GitBranch,
  },
  {
    title: "Compliance Reporting",
    description: "Real-time analytics and generation of regulatory compliance reports aligned with government standards.",
    metric: "Real-Time",
    icon: LineChart,
  },
  {
    title: "Workforce Analytics",
    description: "Deep insights into outsource workforce composition, utilization rates, and engagement patterns.",
    metric: "AI-Ready",
    icon: Users,
  },
  {
    title: "Budget Management",
    description: "Comprehensive financial oversight with department-level budget allocation, tracking, and variance analysis.",
    metric: "Granular",
    icon: Wallet,
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
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as any } 
  },
};

export function Capabilities() {
  return (
    <SectionWrapper id="capabilities" className="bg-secondary/30">
      <SectionHeader
        badge="CORE CAPABILITIES"
        title="Enterprise-Grade Features"
        description="Purpose-built for government entities and multinational corporations managing complex outsource operations."
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
      >
        {capabilities.map((cap, i) => {
          const Icon = cap.icon;
          return (
            <motion.div
              key={i}
              variants={itemVariants}
              className="bg-card border border-border/70 rounded-xl p-6 sm:p-8 group flex flex-col h-full hover:shadow-lg hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 ease-out"
            >
              <div className="size-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300 text-primary">
                <Icon className="size-6 transition-colors" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-heading mb-2.5 leading-snug tracking-tight">
                {cap.title}
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed flex-grow mb-6 font-normal">
                {cap.description}
              </p>
              <div className="mt-auto pt-2 border-t border-border/40">
                <span className="inline-flex px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                  {cap.metric}
                </span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </SectionWrapper>
  );
}
