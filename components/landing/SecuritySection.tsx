"use client";

import { motion } from "motion/react";
import { ShieldCheck, FileText, GitBranch, Lock, Key, Eye, Database, Shield } from "lucide-react";
import { SectionWrapper, SectionHeader } from "./SectionWrapper";

const securityFeatures = [
  {
    icon: ShieldCheck,
    title: "Role-Based Access",
    description: "Granular RBAC with delegation",
  },
  {
    icon: FileText,
    title: "Audit Trails",
    description: "Complete immutable action logging",
  },
  {
    icon: GitBranch,
    title: "Approval Chains",
    description: "Multi-level delegation authorization",
  },
  {
    icon: Lock,
    title: "Encryption",
    description: "End-to-end data encryption in transit & rest",
  },
  {
    icon: Key,
    title: "SSO Integration",
    description: "Azure AD & SAML 2.0 enterprise support",
  },
  {
    icon: Eye,
    title: "Monitoring",
    description: "Real-time threat analytics & audit hooks",
  },
  {
    icon: Database,
    title: "Data Protection",
    description: "Enterprise backup & disaster recovery",
  },
  {
    icon: Shield,
    title: "Compliance",
    description: "UAE federal regulatory alignment",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as any } 
  },
};

export function SecuritySection() {
  return (
    <SectionWrapper id="security" dark>
      <SectionHeader
        light
        badge="ENTERPRISE SECURITY"
        title="Government-Grade Protection"
        description="Built with the security standards expected by UAE government entities and multinational corporations."
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-12"
      >
        {securityFeatures.map((feat, i) => {
          const Icon = feat.icon;
          return (
            <motion.div
              key={i}
              variants={itemVariants}
              className="bg-white/5 border border-white/10 rounded-xl p-6 text-center backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all duration-300 ease-out flex flex-col items-center"
            >
              <div className="size-14 mx-auto mb-4 rounded-xl bg-white/10 flex items-center justify-center text-[#A6DCE6]">
                <Icon className="size-7" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white mb-1.5 leading-snug tracking-tight">
                {feat.title}
              </h3>
              <p className="text-xs text-white/60 leading-relaxed font-normal">
                {feat.description}
              </p>
            </motion.div>
          );
        })}
      </motion.div>
    </SectionWrapper>
  );
}
