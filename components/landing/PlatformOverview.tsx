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
    description: "Streamlined request creation and tracking",
    icon: ClipboardList,
  },
  {
    title: "Vendor Management",
    description: "Centralized vendor registry and evaluation",
    icon: Store,
  },
  {
    title: "Procurement",
    description: "End-to-end procurement lifecycle",
    icon: ShoppingCart,
  },
  {
    title: "Workflow Engine",
    description: "Configurable multi-level approvals",
    icon: GitBranch,
  },
  {
    title: "Contract Management",
    description: "Digital contract lifecycle management",
    icon: FileText,
  },
  {
    title: "Security & Access",
    description: "Role-based enterprise security",
    icon: ShieldCheck,
  },
  {
    title: "Analytics",
    description: "Real-time insights and reporting",
    icon: BarChart3,
  },
  {
    title: "Budget Control",
    description: "Financial oversight and allocation",
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
        className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
      >
        {modules.map((mod, i) => {
          const Icon = mod.icon;
          return (
            <motion.div
              key={i}
              variants={itemVariants}
              className="bg-card border border-border/60 rounded-2xl p-6 text-center group hover:shadow-md hover:-translate-y-1 transition-all duration-300 ease-out"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/8 flex items-center justify-center mx-auto mb-5 group-hover:bg-primary/15 transition-colors duration-300">
                <Icon className="size-6 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-heading mb-2 leading-tight">{mod.title}</h3>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{mod.description}</p>
            </motion.div>
          );
        })}
      </motion.div>
    </SectionWrapper>
  );
}
