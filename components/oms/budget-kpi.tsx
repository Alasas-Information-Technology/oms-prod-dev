"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { Progress } from "@/components/ui/progress";
import { AnimatePresence, motion } from "motion/react";

type BudgetKpiCardProps = {
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
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative rounded-xl border bg-background p-4 shadow-sm">
      {/* Skeleton layer */}
      <AnimatePresence>
        {loading && (
          <motion.div
            key="skeleton"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="absolute inset-0 z-10 bg-background p-4 rounded-xl"
          >
            <div className="flex items-center justify-between">
              <Shimmer className="h-6 w-40" />
              <Shimmer className="h-12 w-12 rounded-full!" />
            </div>

            <div className="mt-8 flex items-end justify-between">
              <Shimmer className="h-10 w-28" />
              <Shimmer className="h-5 w-10" />
            </div>

            <Shimmer className="mt-8 h-2 w-full" />

            <div className="mt-2 flex justify-between">
              <Shimmer className="h-4 w-20" />
              <Shimmer className="h-4 w-20" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content layer — always mounted, fades in */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: loading ? 0 : 1 }}
        transition={{ duration: 0.4, ease: "easeInOut", delay: loading ? 0 : 0.1 }}
      >
        <div className="flex items-center gap-3 justify-between">
          <h6 className="text-lg font-medium text-muted-foreground ml-0.5">
            Budget Overview
          </h6>

          <div className="rounded-full bg-primary/10 p-3 inline-flex">
            <Icon
              icon="material-symbols:wallet"
              className="h-7 w-7 text-primary"
            />
          </div>
        </div>

        <div className="mt-8 flex items-end justify-between">
          <p className="text-3xl font-bold">
            AED{consumed.toFixed(1)}
          </p>

          <p className="text-sm font-medium">
            {percentage.toFixed(0)}%
          </p>
        </div>

        <Progress value={percentage} className="mt-8" />

        <div className="mt-2 flex justify-between text-sm text-muted-foreground">
          <span>Remaining</span>
          <span>AED{remaining.toFixed(1)}</span>
        </div>
      </motion.div>
    </div>
  );
}