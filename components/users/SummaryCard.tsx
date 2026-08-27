"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/components/ui/utils";
import { ChevronRight } from "lucide-react";

export interface SummaryCardProps {
  label?: string;
  value?: string | React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  href?: string;
  badge?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function SummaryCardRow(props: SummaryCardProps) {
  return <SummaryCard {...props} />;
}

export function SummaryCard({
  label,
  value,
  icon: Icon,
  onClick,
  href,
  className,
}: SummaryCardProps) {
  const content = (
    <div
      className={cn(
        "group relative flex items-center justify-between p-3.5 rounded-xl border border-border/80 bg-card/60 hover:bg-muted/40 transition-all text-left w-full shadow-2xs",
        (onClick || href) && "cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        {Icon && (
          <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Icon className="size-4" />
          </div>
        )}
        <div className="space-y-0.5 min-w-0">
          <p className="text-xs text-muted-foreground font-medium">{label}</p>
          <div className="text-sm font-semibold text-foreground truncate">{value}</div>
        </div>
      </div>

      <ChevronRight className="size-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block w-full no-underline">
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="w-full text-left bg-transparent border-0 p-0 m-0"
      >
        {content}
      </button>
    );
  }

  return content;
}
