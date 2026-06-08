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

  if (loading) {
    return (


      <div className="rounded-xl border bg-background p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>



        <div className="mt-8 flex items-end justify-between">
          <p className="text-3xl font-bold">
            AED{consumed.toFixed(1)}
          </p>

        <div className="mt-2 flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />



        </div>

  return (
    <div className="rounded-xl border bg-background p-4 shadow-sm">
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
    </div>
  );
}