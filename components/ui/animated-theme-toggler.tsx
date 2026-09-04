"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { flushSync } from "react-dom"
import { Icon, loadIcons } from "@iconify/react"

import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { Button } from "./button"

export type TransitionVariant =
  | "circle"
  | "square"
  | "triangle"
  | "diamond"
  | "hexagon"
  | "rectangle"
  | "star"

interface AnimatedThemeTogglerProps extends React.ComponentPropsWithoutRef<"button"> {
  duration?: number
  variant?: TransitionVariant
  /** When true, the transition expands from the viewport center instead of the button center. */
  fromCenter?: boolean
}

const THEME_ICONS = [
  "line-md:sunny-filled-loop-to-moon-filled-loop-transition",
  "line-md:moon-filled-to-sunny-filled-loop-transition",
  "line-md:sunny-filled-loop",
  "line-md:moon-filled-loop",
] as const

function polygonCollapsed(cx: number, cy: number, vertexCount: number): string {
  const pairs = Array.from(
    { length: vertexCount },
    () => `${cx}px ${cy}px`
  ).join(", ")
  return `polygon(${pairs})`
}

function getThemeTransitionClipPaths(
  variant: TransitionVariant,
  cx: number,
  cy: number,
  maxRadius: number,
  viewportWidth: number,
  viewportHeight: number
): [string, string] {
  switch (variant) {
    case "circle":
      return [
        `circle(0px at ${cx}px ${cy}px)`,
        `circle(${maxRadius}px at ${cx}px ${cy}px)`,
      ]
    case "square": {
      const halfW = Math.max(cx, viewportWidth - cx)
      const halfH = Math.max(cy, viewportHeight - cy)
      const halfSide = Math.max(halfW, halfH) * 1.05
      const end = [
        `${cx - halfSide}px ${cy - halfSide}px`,
        `${cx + halfSide}px ${cy - halfSide}px`,
        `${cx + halfSide}px ${cy + halfSide}px`,
        `${cx - halfSide}px ${cy + halfSide}px`,
      ].join(", ")
      return [polygonCollapsed(cx, cy, 4), `polygon(${end})`]
    }
    case "triangle": {
      const scale = maxRadius * 2.2
      const dx = (Math.sqrt(3) / 2) * scale
      const verts = [
        `${cx}px ${cy - scale}px`,
        `${cx + dx}px ${cy + 0.5 * scale}px`,
        `${cx - dx}px ${cy + 0.5 * scale}px`,
      ].join(", ")
      return [polygonCollapsed(cx, cy, 3), `polygon(${verts})`]
    }
    case "diamond": {
      const R = maxRadius * Math.SQRT2
      const end = [
        `${cx}px ${cy - R}px`,
        `${cx + R}px ${cy}px`,
        `${cx}px ${cy + R}px`,
        `${cx - R}px ${cy}px`,
      ].join(", ")
      return [polygonCollapsed(cx, cy, 4), `polygon(${end})`]
    }
    case "hexagon": {
      const R = maxRadius * Math.SQRT2
      const verts: string[] = []
      for (let i = 0; i < 6; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 3
        verts.push(`${cx + R * Math.cos(a)}px ${cy + R * Math.sin(a)}px`)
      }
      return [polygonCollapsed(cx, cy, 6), `polygon(${verts.join(", ")})`]
    }
    case "rectangle": {
      const halfW = Math.max(cx, viewportWidth - cx)
      const halfH = Math.max(cy, viewportHeight - cy)
      const end = [
        `${cx - halfW}px ${cy - halfH}px`,
        `${cx + halfW}px ${cy - halfH}px`,
        `${cx + halfW}px ${cy + halfH}px`,
        `${cx - halfW}px ${cy + halfH}px`,
      ].join(", ")
      return [polygonCollapsed(cx, cy, 4), `polygon(${end})`]
    }
    case "star": {
      const R = maxRadius * Math.SQRT2 * 1.03
      const innerRatio = 0.42
      const starPolygon = (radius: number) => {
        const verts: string[] = []
        for (let i = 0; i < 5; i++) {
          const outerA = -Math.PI / 2 + (i * 2 * Math.PI) / 5
          verts.push(
            `${cx + radius * Math.cos(outerA)}px ${cy + radius * Math.sin(outerA)}px`
          )
          const innerA = outerA + Math.PI / 5
          verts.push(
            `${cx + radius * innerRatio * Math.cos(innerA)}px ${cy + radius * innerRatio * Math.sin(innerA)}px`
          )
        }
        return `polygon(${verts.join(", ")})`
      }
      const startR = Math.max(2, R * 0.025)
      return [starPolygon(startR), starPolygon(R)]
    }
    default:
      return [
        `circle(0px at ${cx}px ${cy}px)`,
        `circle(${maxRadius}px at ${cx}px ${cy}px)`,
      ]
  }
}

export const AnimatedThemeToggler = ({
  className,
  duration = 500,
  variant,
  fromCenter = false,
  ...props
}: AnimatedThemeTogglerProps) => {
  const { setTheme, resolvedTheme } = useTheme()
  const shape = variant ?? "circle"
  const [isDark, setIsDark] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [mounted, setMounted] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Preload animated icons into memory immediately on mount to prevent any animation latency
  useEffect(() => {
    loadIcons(THEME_ICONS as unknown as string[])
  }, [])

  useEffect(() => {
    const updateTheme = () => {
      const isDarkMode = resolvedTheme === "dark" || document.documentElement.classList.contains("dark")
      setIsDark(isDarkMode)
      setMounted(true)
    }

    queueMicrotask(updateTheme)

    const observer = new MutationObserver(updateTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    return () => observer.disconnect()
  }, [resolvedTheme])

  const toggleTheme = useCallback((e?: React.MouseEvent<HTMLButtonElement>) => {
    const button = buttonRef.current
    if (!button) return

    setHasInteracted(true)

    // Strictly calculate the center coordinate of the button in the viewport
    const rect = button.getBoundingClientRect()
    const x = fromCenter || rect.width === 0 ? rect.left + rect.width / 2 : (e?.clientX ?? window.innerWidth - 60)
    const y = fromCenter || rect.height === 0 ? rect.top + rect.height / 2 : (e?.clientY ?? 26)

    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    // Calculate maximum radius to fully cover screen from button origin
    const maxRadius = Math.hypot(
      Math.max(x, viewportWidth - x),
      Math.max(y, viewportHeight - y)
    )

    const applyTheme = () => {
      const newTheme = !isDark
      setIsDark(newTheme)
      setTheme(newTheme ? "dark" : "light")
      document.documentElement.classList.toggle("dark", newTheme)
      localStorage.setItem("theme", newTheme ? "dark" : "light")
    }

    if (typeof document.startViewTransition !== "function") {
      applyTheme()
      return
    }

    const clipPath = getThemeTransitionClipPaths(
      shape,
      x,
      y,
      maxRadius,
      viewportWidth,
      viewportHeight
    )

    const transition = document.startViewTransition(() => {
      flushSync(applyTheme)
    })

    const ready = transition?.ready
    if (ready && typeof ready.then === "function") {
      ready.then(() => {
        document.documentElement.animate(
          {
            clipPath,
          },
          {
            duration,
            easing: "cubic-bezier(0.4, 0, 0.2, 1)",
            fill: "forwards",
            pseudoElement: "::view-transition-new(root)",
          }
        )
      })
    }
  }, [shape, duration, isDark, setTheme, fromCenter])


  // Select appropriate icon based on whether user just triggered a transition or initial mount
  const iconName = !hasInteracted
    ? isDark
      ? "line-md:moon-filled-loop"
      : "line-md:sunny-filled-loop"
    : isDark
      ? "line-md:sunny-filled-loop-to-moon-filled-loop-transition"
      : "line-md:moon-filled-to-sunny-filled-loop-transition"

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      ref={buttonRef}
      onClick={toggleTheme}
      className={cn(
        "h-8 w-8 p-0 text-white/40! hover:text-white! rounded-lg cursor-pointer hover:bg-accent/50 transition-colors",
        className
      )}
      {...props}
    >
      {mounted && (
        <Icon
          key={isDark ? "theme-dark" : "theme-light"}
          icon={iconName}
          className="h-[18px] w-[18px]"
        />
      )}
      <span className="sr-only z-30">Toggle theme</span>
    </Button>
  )
}

