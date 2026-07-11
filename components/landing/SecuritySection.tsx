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
    description: "Complete action logging",
  },
  {
    icon: GitBranch,
    title: "Approval Chains",
    description: "Multi-level authorization",
  },
  {
    icon: Lock,
    title: "Encryption",
    description: "End-to-end data protection",
  },
  {
    icon: Key,
    title: "SSO Integration",
    description: "Azure AD & SAML support",
  },
  {
    icon: Eye,
    title: "Monitoring",
    description: "Real-time security analytics",
  },
  {
    icon: Database,
    title: "Data Protection",
    description: "Enterprise backup & recovery",
  },
  {
    icon: Shield,
    title: "Compliance",
    description: "UAE regulatory alignment",
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
        className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-12"
      >
        {securityFeatures.map((feat, i) => {
          const Icon = feat.icon;
          return (
            <motion.div
              key={i}
              variants={itemVariants}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all duration-300 ease-out"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                <Icon className="size-7 text-[#A6DCE6]" />
              </div>
              <h3 className="text-sm md:text-base font-semibold text-white mb-2">{feat.title}</h3>
              <p className="text-xs text-white/50">{feat.description}</p>
            </motion.div>
          );
        })}
      </motion.div>
    </SectionWrapper>
  );
}
