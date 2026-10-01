"use client";

import { motion } from "motion/react";
import { 
  ClipboardList, 
  Store, 
  ShoppingCart, 
  GitBranch, 
  FileText, 
  ShieldCheck, 
  BarChart3, 
  Wallet 
} from "lucide-react";
import { SectionWrapper, SectionHeader } from "./SectionWrapper";

const modules = [
  {
    title: "Requisition Management",
    description: "Streamlined request creation, live tracking, and approval lifecycle",
    icon: ClipboardList,
  },
  {
    title: "Vendor Management",
    description: "Centralized vendor registry, compliance audits, and accreditation",
    icon: Store,
  },
  {
    title: "Procurement",
    description: "End-to-end procurement lifecycle from RFP to award",
    icon: ShoppingCart,
  },
  {
    title: "Workflow Engine",
    description: "Configurable multi-level authority limits and delegation rules",
    icon: GitBranch,
  },
  {
    title: "Contract Management",
    description: "Digital contract lifecycle, amendments, and renewals",
    icon: FileText,
  },
  {
    title: "Security & Access",
    description: "Role-based enterprise access control with SAML & SSO",
    icon: ShieldCheck,
  },
  {
    title: "Analytics & Intelligence",
    description: "Real-time insights, utilization metrics, and SLA reporting",
    icon: BarChart3,
  },
  {
    title: "Budget Control",
    description: "Financial oversight, department allocation, and ledger tracking",
    icon: Wallet,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
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

export function PlatformOverview() {
  return (
    <SectionWrapper id="platform">
      <SectionHeader
        badge="ENTERPRISE PLATFORM"
        title="The OMS Ecosystem"
        description="A unified platform connecting every dimension of outsource management — from initial requisition to contract completion."
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6"
      >
        {modules.map((mod, i) => {
          const Icon = mod.icon;
          return (
            <motion.div
              key={i}
              variants={itemVariants}
              className="bg-card border border-border/70 rounded-xl p-6 sm:p-7 text-center group hover:shadow-lg hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 ease-out flex flex-col items-center"
            >
              <div className="size-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300 text-primary">
                <Icon className="size-6 transition-colors" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-heading mb-2 leading-snug">
                {mod.title}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {mod.description}
              </p>
            </motion.div>
          );
        })}
      </motion.div>
    </SectionWrapper>
  );
}
