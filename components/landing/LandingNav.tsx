"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/utils";

const NAV_LINKS = [
  { name: "Platform", href: "#platform" },
  { name: "FLEXIS", href: "#flexis" },
  { name: "Capabilities", href: "#capabilities" },
  { name: "Security", href: "#security" },
  { name: "Technology", href: "#technology" },
];

export function LandingNav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 z-50 w-full transition-all duration-300 ease-out h-[88px] flex items-center",
          isScrolled
            ? "bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-sm dark:bg-background/30"
            : "bg-transparent border-transparent"
        )}
      >
        <div className="w-full max-w-[1280px] mx-auto px-6 lg:px-16 flex items-center justify-between">
          <Link href="/" className="flex-shrink-0 flex items-center gap-2">
            <Image
              src="/c-logo.png"
              alt="DIEZ OMS Logo"
              width={140}
              height={48}
              className="h-10 w-auto object-contain"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-heading transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-4">
            <Button asChild className="rounded-full h-11 px-8 shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
              <Link href="/login">Access Portal</Link>
            </Button>
          </div>

          {/* Mobile Toggle */}
          <button
            className="lg:hidden p-2 text-heading"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" as any }}
            className="fixed inset-x-0 top-[88px] z-40 bg-card border-b border-border/40 shadow-lg lg:hidden"
          >
            <div className="px-6 py-6 flex flex-col gap-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-medium text-heading py-2 border-b border-border/30"
                >
                  {link.name}
                </Link>
              ))}
              <Button asChild className="rounded-full w-full h-12 mt-4 shadow-md">
                <Link href="/login">Access Portal</Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
