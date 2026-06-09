"use client";

import Link from "next/link";
import { motion, type Variants } from "motion/react";
import { 
  Building2, 
  ArrowRight, 
  ShieldCheck, 
  FileText, 
  GitBranch, 
  LineChart, 
  ChevronRight 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/components/ui/utils";

export default function LandingPage() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  };

  const features = [
    {
      title: "Contract Management",
      description: "End-to-end lifecycle tracking for all outsource contracts, amendments, and renewals.",
      icon: FileText,
      color: "text-indigo-600",
      bg: "bg-indigo-50 dark:bg-indigo-500/10",
    },
    {
      title: "Vendor Accreditation",
      description: "Automated screening, evaluation, and registry maintenance for service providers.",
      icon: ShieldCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
    },
    {
      title: "Approval Workflows",
      description: "Configurable multi-step approval chains matching internal procurement authority limits.",
      icon: GitBranch,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      title: "Compliance & Reporting",
      description: "Real-time analytics and generation of regulatory compliance reports (COA, DBM, GPPB).",
      icon: LineChart,
      color: "text-amber-600",
      bg: "bg-amber-50 dark:bg-amber-500/10",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-primary/20 mesh-bg">
      {/* ── Navbar ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-9 bg-primary rounded-xl flex items-center justify-center shadow-sm">
              <Building2 size={18} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-base leading-none tracking-tight text-foreground">DIEZ OMS</div>
              <div className="text-[10px] text-muted-foreground leading-none mt-1 uppercase tracking-widest font-semibold">Outsource Management</div>
            </div>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/design-system" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              Design System
            </Link>
            <Button asChild size="sm" className="rounded-full px-5 h-9">
              <Link href="/login">Portal Login</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* ── Hero Section ──────────────────────────────────────── */}
      <main className="flex-1 flex flex-col">
        <section className="w-full py-20 md:py-32 flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl -z-10 pointer-events-none" />
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="max-w-4xl mx-auto space-y-8"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-sm font-medium text-primary mb-2 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              System Version 1.0 Live
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              Modernizing <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-600">
                Outsource Management
              </span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              The centralized platform for the Dubai Integrated Economic Zones to manage service provider contracts, track procurement pipelines, and automate multi-level approvals securely.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button asChild size="lg" className="rounded-full h-12 px-8 text-base shadow-lg shadow-primary/20">
                <Link href="/login">
                  Access Portal <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full h-12 px-8 text-base bg-background/50 backdrop-blur-sm border-border/50 hover:bg-accent">
                <Link href="/design-system">
                  Explore Design System
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </section>

        {/* ── Features Section ──────────────────────────────────── */}
        <section className="w-full py-20 bg-slate-50 dark:bg-slate-900/20 border-t border-border/40">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight mb-4 text-foreground">Comprehensive Capabilities</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">Everything you need to orchestrate the complete lifecycle of third-party service provider engagements.</p>
            </div>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"
            >
              {features.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <motion.div key={i} variants={itemVariants}>
                    <Card className="h-full bg-background/50 backdrop-blur-sm border-border/50 hover:shadow-md transition-shadow group overflow-hidden">
                      <CardContent className="p-6 flex flex-col h-full">
                        <div className={cn("size-12 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110", feature.bg)}>
                          <Icon className={cn("size-6", feature.color)} />
                        </div>
                        <h3 className="text-lg font-semibold mb-2 text-foreground">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground flex-1 leading-relaxed">{feature.description}</p>
                        <div className="mt-6 flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0 duration-300">
                          Learn more <ChevronRight className="ml-1 size-4" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>
      </main>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="w-full py-8 border-t border-border/40 bg-background">
        <div className="container mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Building2 size={20} className="text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Dubai Integrated Economic Zones</span>
          </div>
          <p className="text-xs text-muted-foreground text-center md:text-right">
            &copy; {new Date().getFullYear()} DIEZ. All rights reserved. Outsource Management System.
          </p>
        </div>
      </footer>
    </div>
  );
}
