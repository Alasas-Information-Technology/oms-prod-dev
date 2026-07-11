"use client";

import { motion } from "motion/react";
import { SectionWrapper, SectionHeader } from "./SectionWrapper";
import { cn } from "@/components/ui/utils";

const letters = [
  { char: "F", label: "Full Time" },
  { char: "L", label: "Limited Term" },
  { char: "E", label: "Expert" },
  { char: "X", label: "Seasonal" },
  { char: "I", label: "Interim" },
  { char: "S", label: "Specific" },
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
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" as any } 
  },
};

export function FlexisIntro() {
  return (
    <SectionWrapper id="flexis">
      <SectionHeader
        badge="WORKFORCE FRAMEWORK"
        title="The FLEXIS Engagement Model"
        description="Six specialized workforce engagement models designed to give enterprises complete flexibility in how they structure, scale, and manage their outsourced operations."
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="flex flex-wrap justify-center items-start gap-4 md:gap-8 mt-12"
      >
        {letters.map((item, index) => (
          <motion.div 
            key={item.char} 
            variants={itemVariants}
            className="flex flex-col items-center"
          >
            <div 
              className={cn(
                "w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center shadow-sm border border-border/40",
                index % 2 === 0 ? "bg-primary/10" : "bg-secondary"
              )}
            >
              <span className="text-3xl md:text-4xl font-bold text-heading">
                {item.char}
              </span>
            </div>
            <span className="text-[10px] md:text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-4">
              {item.label}
            </span>
          </motion.div>
        ))}
      </motion.div>
    </SectionWrapper>
  );
}
