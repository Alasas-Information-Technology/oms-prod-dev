"use client";

import { motion } from "motion/react";
import { Monitor, Server, Database, Shield, Cloud, Code } from "lucide-react";
import { SectionWrapper, SectionHeader } from "./SectionWrapper";

const techPillars = [
  {
    icon: Monitor,
    title: "Modern Frontend",
    stack: "React 19, Next.js 16, TypeScript",
  },
  {
    icon: Server,
    title: "Secure Backend",
    stack: "Enterprise API Layer, Node.js",
  },
  {
    icon: Database,
    title: "Enterprise Database",
    stack: "Microsoft SQL Server, Redis",
  },
  {
    icon: Shield,
    title: "Authentication",
    stack: "Azure AD, JWT, SSO",
  },
  {
    icon: Cloud,
    title: "Cloud Ready",
    stack: "Azure, Scalable Infrastructure",
  },
  {
    icon: Code,
    title: "API Driven",
    stack: "RESTful, Webhooks, Integrations",
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
              className="bg-card border border-border/60 rounded-2xl p-8 text-center group hover:shadow-md hover:-translate-y-1 transition-all duration-300 ease-out"
            >
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-primary/8 flex items-center justify-center group-hover:bg-primary/15 transition-colors duration-300">
                <Icon className="size-7 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-heading mb-2">{pillar.title}</h3>
              <p className="text-sm font-medium text-muted-foreground">{pillar.stack}</p>
            </motion.div>
          );
        })}
      </motion.div>
    </SectionWrapper>
  );
}
