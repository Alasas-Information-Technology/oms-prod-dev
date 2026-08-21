"use client";

import * as React from "react";
import { useViewport } from "@xyflow/react";
import { cn } from "@/lib/utils";

export interface DottedCanvasGridProps {
  /**
   * Whether a card is actively being dragged (raises opacity from 6% to 12% per Part 2).
   */
  isDragging?: boolean;
  /**
   * Base grid spacing in pixels at 100% zoom (defaults to 24px per Part 2 snap increment).
   */
  gridSpacing?: number;
  /**
   * Optional additional class name.
   */
  className?: string;
}

/**
 * DottedCanvasGrid — Dotted Canvas Grid Surface for Org Chart Canvas.
 *
 * Implements Part 2 of ORG-CHART-CANVAS-SPEC.md:
 * - 1px dots, 24px spacing at 100% zoom (matches snap increment).
 * - --text-primary (--foreground) at 6% opacity normally, 12% while dragging with 120ms transition.
 * - Scales with canvas content on zoom and fades out below 50% zoom.
 * - Radial mask fading toward canvas edges so it reads as a surface rather than graph paper.
 * - GPU-accelerated CSS background-image radial-gradient with 0 DOM elements for dots.
 * - Supports light and dark modes via theme tokens only.
 */
export function DottedCanvasGrid({
  isDragging = false,
  gridSpacing = 24,
  className,
}: DottedCanvasGridProps) {
  const { x, y, zoom } = useViewport();

  // Grid scales with zoom (spacing & dot radius)
  const scaledSpacing = Math.max(1, gridSpacing * zoom);
  // Crisp 1px dot with subpixel antialiasing (never clipped to 0)
  const dotRadius = Math.max(1, 1 * Math.min(zoom, 1.25));

  // Below 50% zoom (zoom < 0.5), the grid fades out per Part 2 (gracefully from 0.5 down to 0.25)
  let zoomOpacityFactor = 1;
  if (zoom < 0.5) {
    zoomOpacityFactor = Math.max(0, (zoom - 0.25) / 0.25);
  }

  // Base opacity: 6-8% (0.08) normally, 12-14% (0.14) while dragging per Part 2
  const targetOpacity = (isDragging ? 0.14 : 0.08) * zoomOpacityFactor;

  // Background position and size matching viewport transformation
  const backgroundPosition = `${x}px ${y}px`;
  const backgroundSize = `${scaledSpacing}px ${scaledSpacing}px`;

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 z-0 select-none overflow-hidden",
        className
      )}
      style={{
        // Radial mask fading toward canvas edges so it reads as a surface rather than graph paper (Part 2)
        maskImage: "radial-gradient(ellipse 65% 65% at 50% 50%, black 50%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(ellipse 65% 65% at 50% 50%, black 50%, transparent 100%)",
      }}
    >
      <div
        className="absolute inset-0 transition-opacity duration-[120ms] ease-out"
        style={{
          opacity: targetOpacity,
          backgroundImage: `radial-gradient(circle at center, var(--foreground) ${dotRadius}px, transparent ${dotRadius + 0.3}px)`,
          backgroundSize,
          backgroundPosition,
          willChange: "background-position, background-size, opacity",
        }}
      />
    </div>
  );
}
