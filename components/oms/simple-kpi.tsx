"use client"

import { Icon } from "@iconify/react"
import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "motion/react"

import { formatCompactNumber } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import { cn } from "../ui/utils"

type GenericKpiCardProps = {
  icon: string
  value: number
  title: string
  description?: string,
  color?: string
  bg?: string
  className?: string
}

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
  )
}

export function SimpleKpiCard({ icon, value, title, description, color, bg, className }: GenericKpiCardProps) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className={cn("relative rounded-xl border bg-background p-5 shadow-sm overflow-hidden flex flex-col justify-between",className)}>
      {/* Skeleton layer */}
      <AnimatePresence>
        {loading && (
          <motion.div
            key="skeleton"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="absolute inset-0 z-10 bg-background p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <Shimmer className="h-4 w-28 mb-2" />
                <Shimmer className="h-8 w-20" />
              </div>
              <Shimmer className="h-10 w-10 rounded-md!" />
            </div>
            {description && <Shimmer className="mt-4 h-3 w-36" />}
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: loading ? 0 : 1 }}
        transition={{ duration: 0.4, ease: "easeInOut", delay: loading ? 0 : 0.1 }}
        className="flex flex-col h-full"
      >
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <h6 className="text-sm font-medium text-muted-foreground">{title}</h6>

            <Tooltip >
              <TooltipTrigger asChild>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
                  {formatCompactNumber(value)}
                </p>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{value}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className={cn("rounded-md bg-primary/10 p-2 text-primary", "border-2", `${bg?.replace('bg-', 'border-')}! ${bg} dark:${bg}-900`)}>
            <Icon icon={icon} className={cn("h-5 w-5", color)} />
          </div>
        </div>

        {description && (
          <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </motion.div>
    </div>
  )
}
