"use client";

import { cn } from "@/lib/utils";

interface GlassBackgroundProps {
  className?: string;
}

/**
 * GlassBackground — Page-level background layer for glass-card screens.
 *
 * Renders 2–3 large, softly blurred color fields using the brand palette
 * (bedrock indigo, root bronze, teal) at 15–25% opacity with an 80px blur.
 * Without this layer, glass cards just look like flat grey boxes.
 *
 * Usage: Place as the first child of a page layout that uses `surface="glass"` cards.
 * Only for dashboard/overview surfaces — never on tables, forms, or approval queues.
 */
export function GlassBackground({ className }: GlassBackgroundProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "fixed inset-0 -z-10 overflow-hidden pointer-events-none",
        className
      )}
    >
      {/* Bedrock Indigo — top-left anchor */}
      <div
        className="absolute -top-[20%] -left-[10%] w-[60vw] h-[60vh] rounded-full"
        style={{
          background: "var(--primary)",
          opacity: 0.18,
          filter: "blur(80px)",
        }}
      />
      {/* Root Bronze / warm accent — center-right */}
      <div
        className="absolute top-[30%] -right-[5%] w-[50vw] h-[50vh] rounded-full"
        style={{
          background: "#B87333",
          opacity: 0.15,
          filter: "blur(80px)",
        }}
      />
      {/* Teal — bottom-left */}
      <div
        className="absolute -bottom-[10%] left-[15%] w-[45vw] h-[45vh] rounded-full"
        style={{
          background: "var(--brand-teal)",
          opacity: 0.2,
          filter: "blur(80px)",
        }}
      />
    </div>
  );
}
