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
        !noPadding && "py-24 md:py-[120px]",
        dark
          ? "bg-heading text-white dark:bg-card"
          : "bg-background",
        className
      )}
    >
      <div className="container mx-auto px-6 md:px-12 max-w-[1280px]">
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
    <div className={cn("text-center max-w-3xl mx-auto mb-16 lg:mb-20", className)}>
      {badge && (
        <span
          className={cn(
            "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-6",
            light
              ? "bg-white/10 text-white/80 border border-white/10"
              : "bg-primary/8 text-primary border border-primary/15"
          )}
        >
          {badge}
        </span>
      )}
      <h2
        className={cn(
          "text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.15]",
          light ? "text-white" : "text-heading"
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-5 text-lg md:text-xl leading-relaxed",
            light ? "text-white/60" : "text-muted-foreground"
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
