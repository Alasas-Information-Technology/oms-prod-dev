"use client";

import Image from "next/image";
import Link from "next/link";
import { Building2 } from "lucide-react";

export function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-heading dark:bg-card border-t border-border/10 relative overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-6 sm:px-8 lg:px-12">
        {/* Top Section */}
        <div className="py-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">

          {/* Brand Column */}
          <div className="flex flex-col gap-6 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/c-white-logo.png"
                alt="DIEZ OMS Logo"
                width={140}
                height={48}
                className="h-10 w-auto object-contain brightness-0 invert"
                priority
              />
            </Link>
            <p className="text-white/70 text-sm leading-relaxed">
              The centralized enterprise platform designed to transform how government entities and multinational corporations manage their outsourced workforce operations.
            </p>
            <div className="flex items-center gap-2 text-white/50 text-xs mt-4">
              <Building2 size={16} />
              <span>Dubai Integrated Economic Zones</span>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-6">Platform</h4>
            <ul className="flex flex-col gap-4">
              {['Dashboard', 'Requisitions', 'Approvals', 'Procurement', 'Vendors', 'Analytics'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-white/60 hover:text-white transition-colors duration-200 text-sm">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-6">Resources</h4>
            <ul className="flex flex-col gap-4">
              {['FLEXIS Framework', 'Implementation Guide', 'API Documentation', 'Security Whitepaper', 'Case Studies'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-white/60 hover:text-white transition-colors duration-200 text-sm">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-6">Contact</h4>
            <ul className="flex flex-col gap-4">
              {['Support Center', 'Sales Inquiry', 'Partner Network', 'Global Offices'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-white/60 hover:text-white transition-colors duration-200 text-sm">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-6">Legal</h4>
            <ul className="flex flex-col gap-4">
              {['Privacy Policy', 'Terms of Service', 'Security & Compliance', 'Cookie Policy'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-white/60 hover:text-white transition-colors duration-200 text-sm">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <p>&copy; {currentYear} DIEZ Outsource Management System. All rights reserved.</p>
          <p>Powered by Al Asas Information Technology</p>
        </div>
      </div>
    </footer>
  );
}
