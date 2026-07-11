"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, BarChart3, Store, GitBranch, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

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

// Data for the visualization
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
    <section className="relative min-h-[100vh] lg:min-h-[90vh] flex items-center pt-24 pb-16 overflow-hidden bg-background">
      
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center">
          
          {/* Left Column: Typography & CTAs */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex flex-col items-start text-left lg:pr-8"
          >
            <motion.div variants={itemVariants} className="mb-8">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/60 bg-card shadow-sm text-xs font-semibold uppercase tracking-widest text-primary">
                <span className="flex h-2 w-2 rounded-full bg-primary" />
                Enterprise Outsource Management
              </span>
            </motion.div>

            <motion.h1 
              variants={itemVariants} 
              className="text-[44px] sm:text-5xl lg:text-[64px] xl:text-[72px] font-bold tracking-tight leading-[1.1] text-heading mb-6"
            >
              Strategic Workforce <br className="hidden lg:block" />
              Orchestration. <br />
              <span className="text-primary">Engineered for DIEZ.</span>
            </motion.h1>

            <motion.p 
              variants={itemVariants} 
              className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl"
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

          {/* Right Column: Abstract Visualization */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" as any, delay: 0.2 }}
            className="relative w-full h-[600px] hidden lg:block"
          >
            {/* The visualization container */}
            <div className="absolute inset-0 flex items-center justify-center">
              
              {/* Center Core */}
              <motion.div 
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-30 w-[280px]"
              >
                <div className="bg-card/80 backdrop-blur-xl border border-border/60 shadow-2xl p-8 rounded-[32px] flex flex-col items-center justify-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Subtle rings inside core */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                    <div className="w-48 h-48 rounded-full border border-primary/20 absolute" />
                    <div className="w-32 h-32 rounded-full border border-primary/30 absolute" />
                  </div>

                  <div className="w-20 h-20 mb-6 bg-primary/10 rounded-2xl flex items-center justify-center relative z-10 border border-primary/20 shadow-inner">
                    <span className="text-3xl font-bold text-primary tracking-tight">OMS</span>
                  </div>
                  <h3 className="font-bold text-heading text-xl text-center relative z-10 mb-1">Core Platform</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest relative z-10">System Active</span>
                  </div>
                </div>
              </motion.div>

              {/* Orbiting Ring (Visual) */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[480px] h-[480px] rounded-full border border-primary/10 border-dashed animate-[spin_60s_linear_infinite]" />
              </div>

              {/* Floating Modules */}
              
              {/* Top Left: Vendors */}
              <motion.div 
                animate={{ y: [-8, 8, -8] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                className="absolute top-[8%] left-[5%] z-20"
              >
                <div className="bg-card/90 backdrop-blur-md border border-border/50 shadow-lg px-5 py-3 rounded-2xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                    <Store className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-semibold text-heading">Vendors</span>
                </div>
              </motion.div>

              {/* Top Right: Security */}
              <motion.div 
                animate={{ y: [-6, 6, -6] }}
                transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
                className="absolute top-[15%] right-[0%] z-20"
              >
                <div className="bg-card/90 backdrop-blur-md border border-border/50 shadow-lg px-5 py-3 rounded-2xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-sm font-semibold text-heading">Security</span>
                </div>
              </motion.div>

              {/* Bottom Right: Analytics */}
              <motion.div 
                animate={{ y: [-7, 7, -7] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute bottom-[20%] right-[5%] z-20"
              >
                <div className="bg-card/90 backdrop-blur-md border border-border/50 shadow-lg px-5 py-3 rounded-2xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
                    <BarChart3 className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-sm font-semibold text-heading">Analytics</span>
                </div>
              </motion.div>

              {/* Middle Left: Workflows */}
              <motion.div 
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.9 }}
                className="absolute top-[45%] left-[-2%] z-20"
              >
                <div className="bg-card/90 backdrop-blur-md border border-border/50 shadow-lg px-5 py-3 rounded-2xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
                    <GitBranch className="w-4 h-4 text-orange-600" />
                  </div>
                  <span className="text-sm font-semibold text-heading">Workflows</span>
                </div>
              </motion.div>

              {/* FLEXIS Arc at the bottom */}
              <div className="absolute bottom-[2%] left-1/2 -translate-x-1/2 w-full max-w-[500px] z-10 flex flex-col items-center">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Integrated Workforce Models</span>
                <div className="flex items-center justify-center gap-3 w-full">
                  {flexisNodes.map((node, i) => (
                    <motion.div
                      key={node.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 1 + (i * 0.1), ease: "easeOut" as any }}
                      className="group relative"
                    >
                      <div className="w-12 h-12 bg-card/80 backdrop-blur-md border border-border/50 shadow-sm rounded-xl flex items-center justify-center hover:bg-primary hover:border-primary transition-all duration-300 cursor-default">
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
              </div>

            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
