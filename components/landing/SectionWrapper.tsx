"use client";

import { motion } from "motion/react";
import { cn } from "@/components/ui/utils";

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  dark?: boolean;
  noPadding?: boolean;
}

const sectionVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as any },
  },
};

export function SectionWrapper({
  children,
  className,
  id,
  dark = false,
  noPadding = false,
}: SectionWrapperProps) {
  return (
    <motion.section
      id={id}
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className={cn(
        "w-full",
        !noPadding && "py-20 sm:py-24 md:py-28 lg:py-32",
        dark
          ? "bg-heading text-white dark:bg-card"
          : "bg-background",
        className
      )}
    >
      <div className="container mx-auto px-6 sm:px-8 md:px-12 max-w-[1280px]">
        {children}
      </div>
    </motion.section>
  );
}

export function SectionHeader({
  badge,
  title,
  description,
  className,
  light = false,
}: {
  badge?: string;
  title: string;
  description?: string;
  className?: string;
  light?: boolean;
}) {
  return (
    <div className={cn("text-center max-w-3xl mx-auto mb-12 sm:mb-16 lg:mb-20", className)}>
      {badge && (
        <span
          className={cn(
            "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 sm:mb-6",
            light
              ? "bg-white/10 text-white/90 border border-white/15"
              : "bg-primary/10 text-primary border border-primary/20"
          )}
        >
          {badge}
        </span>
      )}
      <h2
        className={cn(
          "text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15]",
          light ? "text-white" : "text-heading"
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-4 sm:mt-5 text-base sm:text-lg lg:text-xl leading-relaxed max-w-2xl mx-auto",
            light ? "text-white/70" : "text-muted-foreground"
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
