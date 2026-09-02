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
        className="flex flex-wrap justify-center items-start gap-4 sm:gap-6 md:gap-8 mt-10 sm:mt-12"
      >
        {letters.map((item, index) => (
          <motion.div 
            key={item.char} 
            variants={itemVariants}
            className="flex flex-col items-center group"
          >
            <div 
              className={cn(
                "w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center shadow-xs border transition-all duration-300 group-hover:scale-105 group-hover:shadow-md",
                index % 2 === 0
                  ? "bg-primary/10 border-primary/20 text-primary"
                  : "bg-secondary border-border/60 text-heading"
              )}
            >
              <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                {item.char}
              </span>
            </div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-3 sm:mt-4 text-center">
              {item.label}
            </span>
          </motion.div>
        ))}
      </motion.div>
    </SectionWrapper>
  );
}
