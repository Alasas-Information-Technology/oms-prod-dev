"use client";

import { motion } from "motion/react";
import { Building2, Landmark, Heart, Truck, HardHat, Zap, Cpu, GraduationCap } from "lucide-react";
import { SectionWrapper, SectionHeader } from "./SectionWrapper";

const industries = [
  { icon: Building2, label: "Government" },
  { icon: Landmark, label: "Finance & Banking" },
  { icon: Heart, label: "Healthcare" },
  { icon: Truck, label: "Logistics" },
  { icon: HardHat, label: "Construction" },
  { icon: Zap, label: "Energy" },
  { icon: Cpu, label: "Technology" },
  { icon: GraduationCap, label: "Education" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" as any } 
  },
};

export function IndustriesSection() {
  return (
    <SectionWrapper>
      <SectionHeader
        badge="INDUSTRIES"
        title="Built for Diverse Sectors"
        description="DIEZ OMS serves organizations across multiple industries within the economic zones ecosystem."
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto mt-12"
      >
        {industries.map((ind, i) => {
          const Icon = ind.icon;
          return (
            <motion.div
              key={i}
              variants={itemVariants}
              className="inline-flex items-center gap-3 px-6 py-4 bg-card border border-border/60 rounded-full hover:shadow-sm hover:border-primary/30 transition-all duration-300 ease-out cursor-default"
            >
              <Icon className="size-5 text-primary" />
              <span className="text-sm font-bold text-heading">{ind.label}</span>
            </motion.div>
          );
        })}
      </motion.div>
    </SectionWrapper>
  );
}
