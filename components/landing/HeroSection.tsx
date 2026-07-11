"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { motion } from "motion/react";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

// Dynamically import 3D scene — NO SSR, lazy loaded
const Hero3DScene = dynamic(
  () => import("@/components/landing/hero-3d/Hero3DScene"),
  { ssr: false }
);

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as any } },
};

// FLEXIS data for mobile fallback
const flexisNodes = [
  { id: "F", label: "Full Time" },
  { id: "L", label: "Limited Term" },
  { id: "E", label: "Expert" },
  { id: "X", label: "Seasonal" },
  { id: "I", label: "Interim" },
  { id: "S", label: "Specific" },
];

export function HeroSection() {
  return (
    <section className="relative min-h-[100vh] lg:min-h-[90vh] flex items-center pt-32 pb-16 overflow-x-hidden bg-background">

      {/* Enterprise Digital Grid Background */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.4] dark:opacity-[0.1]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, var(--color-primary) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Subtle depth gradients */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#A6DCE6]/5 rounded-full blur-[100px] pointer-events-none translate-y-1/3 -translate-x-1/3" />

      <div className="container relative z-10 mx-auto px-6 sm:px-8 lg:px-12 max-w-[1280px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">

          {/* Left Column: Typography & CTAs */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex flex-col items-start text-left lg:pr-8"
          >
            {/* <motion.div variants={itemVariants} className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/60 bg-card shadow-sm text-xs font-semibold uppercase tracking-widest text-primary">
                <span className="flex h-2 w-2 rounded-full bg-primary" />
                Enterprise Outsource Management
              </span>
            </motion.div> */}

            <motion.h1
              variants={itemVariants}
              className="text-5xl lg:text-[56px] xl:text-[64px] font-bold tracking-tight leading-[1.1] text-heading mb-6"
            >
              Strategic Workforce <br className="hidden lg:block" />
              Orchestration. <br />
              <span className="text-primary block mt-1">Engineered for DIEZ.</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-xl"
            >
              A unified enterprise platform to govern workforce engagement, accredit service providers, and automate the complete procurement lifecycle with government-grade security.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Button asChild size="lg" className="rounded-full h-14 px-8 text-base shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 w-full sm:w-auto hover:-translate-y-0.5 group">
                <Link href="#platform">
                  Explore OMS Platform
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform ease-out" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full h-14 px-8 text-base bg-card hover:bg-secondary/50 border-border/80 transition-all duration-300 w-full sm:w-auto hover:-translate-y-0.5">
                <Link href="#flexis">
                  Discover FLEXIS
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Right Column: 3D Scene (Desktop) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" as any, delay: 0.3 }}
            className="relative w-full h-[600px] xl:h-[650px] hidden lg:block"
          >
            {/* 3D Scene Loading Skeleton */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 rounded-full border border-primary/10 animate-pulse" />
            </div>

            {/* 3D Scene */}
            <Suspense fallback={null}>
              <Hero3DScene />
            </Suspense>
          </motion.div>

          {/* Mobile Fallback: Lightweight CSS Animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" as any, delay: 0.3 }}
            className="relative w-full lg:hidden flex flex-col items-center py-8"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">
              Integrated Workforce Models
            </span>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {flexisNodes.map((node, i) => (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + (i * 0.1), ease: "easeOut" as any }}
                  className="group relative"
                >
                  <div className="w-14 h-14 bg-card/80 backdrop-blur-md border border-border/50 shadow-sm rounded-xl flex items-center justify-center hover:bg-primary hover:border-primary transition-all duration-300 cursor-default">
                    <span className="font-bold text-lg text-primary group-hover:text-white">{node.id}</span>
                  </div>

                  {/* Tooltip */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <div className="bg-heading text-white text-[10px] font-semibold uppercase tracking-wider py-1.5 px-3 rounded-lg whitespace-nowrap shadow-xl">
                      {node.label}
                    </div>
                    <div className="w-2 h-2 bg-heading rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2" />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Animated Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
      >
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
          Scroll to explore
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-5 h-5 text-muted-foreground/40" />
        </motion.div>
      </motion.div>
    </section>
  );
}
