"use client";

import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { formatCompactNumber } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/components/ui/utils";
import { Card } from "@/components/ui/card";

export type GenericKpiCardProps = {
  icon: string;
  value: number;
  title: string;
  description?: string;
  color?: string;
  bg?: string;
  className?: string;
};

function Shimmer({ className }: { className?: string }) {
  return (
    <motion.div
      className={`rounded-md ${className ?? ""}`}
      style={{
        backgroundImage:
          "linear-gradient(90deg, var(--muted) 25%, color-mix(in oklch, var(--foreground) 8%, var(--muted)) 50%, var(--muted) 75%)",
        backgroundSize: "200% 100%",
      }}
      animate={{ backgroundPositionX: ["200%", "-200%"] }}
      transition={{
        duration: 1.5,
        ease: "linear",
        repeat: Number.POSITIVE_INFINITY,
      }}
    />
  );
}

export function SimpleKpiCard({
  icon,
  value,
  title,
  description,
  color,
  bg,
  className,
}: GenericKpiCardProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Card
      className={cn(
        "relative rounded-xl p-5 shadow-sm overflow-hidden flex flex-col justify-between border-none",
        className
      )}
    >
      {/* Skeleton layer */}
      <AnimatePresence>
        {loading && (
          <motion.div
            key="skeleton"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-10 bg-background p-5 flex flex-col justify-between"
          >
            {/* Top row */}
            <div className="flex items-center justify-between">
              <Shimmer className="h-4 w-28" />
              <Shimmer className="h-9 w-9 rounded-full" />
            </div>

            {/* Middle values */}
            <div className="space-y-2">
              <Shimmer className="h-7 w-36" />
              <Shimmer className="h-3 w-48" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actual content */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full",
            bg ? bg : "bg-primary/10",
            color ? color : "text-primary"
          )}
        >
          <Icon icon={icon} className="h-5 w-5" />
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight">
            AED {formatCompactNumber(value)}
          </span>
        </div>
        {description && (
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-xs text-muted-foreground truncate cursor-help">
                {description}
              </p>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{description}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </Card>
  );
}
