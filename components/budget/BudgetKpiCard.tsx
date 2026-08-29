"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { Progress } from "@/components/ui/progress";
import { AnimatePresence, motion } from "motion/react";
import { formatCompactNumber } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export type BudgetKpiCardProps = {
  reserved: number;
  consumed: number;
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

export function BudgetKpiCard({ reserved, consumed }: BudgetKpiCardProps) {
  const [loading, setLoading] = useState(true);

  const percentage = reserved > 0 ? (consumed / reserved) * 100 : 0;
  const remaining = reserved - consumed;

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Card className="relative rounded-md border bg-background p-5 shadow-sm overflow-hidden flex flex-col justify-between h-full">
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

            {/* Bottom progress */}
            <div className="space-y-1">
              <Shimmer className="h-2 w-full rounded-full" />
              <div className="flex justify-between">
                <Shimmer className="h-3 w-16" />
                <Shimmer className="h-3 w-16" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actual content */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          Budget Overview
        </span>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon icon="solar:wallet-money-linear" className="h-5 w-5" />
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight">
            AED {formatCompactNumber(consumed)}
          </span>
          <span className="text-xs text-muted-foreground">
            of AED {formatCompactNumber(reserved)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          AED {formatCompactNumber(remaining)} remaining
        </p>
      </div>

      <div className="space-y-1.5">
        <Progress value={percentage} className="h-2" />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{percentage.toFixed(1)}% consumed</span>
          <span>{(100 - percentage).toFixed(1)}% left</span>
        </div>
      </div>
    </Card>
  );
}
