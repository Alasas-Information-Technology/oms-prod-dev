"use client"

import React from "react"
import { usePathname } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Home } from "lucide-react"

export function AppBreadcrumb() {
  const pathname = usePathname()
  // remove 'app' from paths to simplify since it's the root of the app shell
  const rawPaths = pathname === "/" ? [] : pathname.split("/").filter((path) => path)
  const paths = rawPaths[0] === "app" ? rawPaths.slice(1) : rawPaths

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/app" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
            <Home className="h-4 w-4" />
            <span className="sr-only">Home</span>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {paths.map((path, index) => {
          // Prepend '/app' to the assembled href
          const href = `/app/${paths.slice(0, index + 1).join("/")}`
          const isLast = index === paths.length - 1
          const title = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " ")

          return (
            <React.Fragment key={path}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="font-semibold text-foreground">{title}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={href}>{title}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
