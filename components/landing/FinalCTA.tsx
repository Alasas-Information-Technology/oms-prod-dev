"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FinalCTA() {
  return (
    <motion.section 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-gradient-to-br from-primary/5 via-background to-[#A6DCE6]/5 border-t border-border/40"
    >
      <div className="max-w-[1280px] mx-auto px-6 sm:px-8 lg:px-12 py-20 sm:py-24 md:py-32 text-center flex flex-col items-center">
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-heading leading-[1.15]"
        >
          Ready to Modernize Your Workforce Management?
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="text-base sm:text-lg lg:text-xl text-muted-foreground mt-4 sm:mt-6 max-w-xl mx-auto leading-relaxed font-normal"
        >
          Join DIEZ in building the future of enterprise outsource management.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center gap-4 mt-8 sm:mt-12 w-full sm:w-auto"
        >
          <Button asChild size="lg" className="rounded-full h-13 sm:h-14 px-8 text-base font-semibold shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 w-full sm:w-auto hover:-translate-y-0.5 group">
            <Link href="/login">
              Get Started
              <ArrowRight className="ml-2 size-5 group-hover:translate-x-1 transition-transform ease-out" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full h-13 sm:h-14 px-8 text-base font-semibold bg-white/50 dark:bg-card/50 backdrop-blur-sm border-border/80 hover:bg-white dark:hover:bg-card hover:shadow-md transition-all duration-300 w-full sm:w-auto">
            <Link href="#">
              Contact Us
            </Link>
          </Button>
        </motion.div>
        
      </div>
    </motion.section>
  );
}
