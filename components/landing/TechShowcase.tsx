"use client";

import { motion } from "motion/react";
import { Monitor, Server, Database, Shield, Cloud, Code } from "lucide-react";
import { SectionWrapper, SectionHeader } from "./SectionWrapper";

const techPillars = [
  {
    icon: Monitor,
    title: "Modern Frontend",
    stack: "React 19, Next.js 16, TypeScript, Tailwind CSS",
  },
  {
    icon: Server,
    title: "Secure Backend",
    stack: "Enterprise API Layer, Node.js, Microservices",
  },
  {
    icon: Database,
    title: "Enterprise Database",
    stack: "Microsoft SQL Server, Redis Cache, ACID Integrity",
  },
  {
    icon: Shield,
    title: "Identity & Access",
    stack: "Azure AD, SAML 2.0, JWT, Multi-Factor Auth",
  },
  {
    icon: Cloud,
    title: "Cloud Native",
    stack: "Azure Cloud, Scalable Container Architecture",
  },
  {
    icon: Code,
    title: "API First",
    stack: "RESTful Endpoints, Webhooks, ERP Connectors",
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
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" as any } 
  },
};

export function TechShowcase() {
  return (
    <SectionWrapper id="technology" className="bg-secondary/30">
      <SectionHeader
        badge="TECHNOLOGY"
        title="Modern Enterprise Architecture"
        description="Built on a foundation of proven, scalable technologies trusted by enterprises worldwide."
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12"
      >
        {techPillars.map((pillar, i) => {
          const Icon = pillar.icon;
          return (
            <motion.div
              key={i}
              variants={itemVariants}
              className="bg-card border border-border/70 rounded-xl p-6 sm:p-7 flex items-start gap-4 hover:shadow-md hover:border-primary/30 transition-all duration-300 ease-out"
            >
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                <Icon className="size-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg font-bold text-heading mb-1 leading-snug tracking-tight">
                  {pillar.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-normal">
                  {pillar.stack}
                </p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </SectionWrapper>
  );
}
