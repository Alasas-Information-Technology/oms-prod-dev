"use client"

import * as React from "react"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

import { useRouter } from "next/navigation"
import { Building2, Network, ShieldCheck, Wallet, FileText, Settings, LayoutDashboard } from "lucide-react"

export function GlobalSearch() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

  const navigateTo = (url: string) => {
    setOpen(false)
    router.push(url)
  }

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <>
      {/* Desktop Search: 420px max, centered, 11px ⌘K chip in subtle bordered pill */}
      <Button
        type="button"
        onClick={() => setOpen(true)}
        variant="outline"
        size="sm"
        className="hidden lg:flex w-full max-w-105 h-10 px-3 text-xs justify-between items-center bg-white/10 dark:bg-muted/40 hover:bg-white/15 dark:hover:bg-muted/60 text-white/90 dark:text-foreground border border-white/10 dark:border-border/60 rounded-sm transition-colors cursor-pointer shadow-none"
      >
        <div className="flex items-center gap-2 truncate">
          <Search className="h-3.5 w-3.5 text-white/60 dark:text-muted-foreground shrink-0" />
          <span className="truncate">Search master data, actions, pages...</span>
        </div>
        <kbd className="pointer-events-none inline-flex h-4.5 select-none items-center gap-0.5 rounded border border-white/20 dark:border-border/80 bg-white/10 dark:bg-background/80 px-1.5 font-mono text-[11px] font-medium text-white/80 dark:text-muted-foreground shrink-0 shadow-2xs">
          <span>⌘</span>K
        </kbd>
      </Button>

      {/* Mobile/Tablet trigger (< 1024px): 32px icon button */}
      <Button
        type="button"
        onClick={() => setOpen(true)}
        variant="ghost"
        size="icon"
        className="flex lg:hidden h-8 w-8 p-0 text-white/80 dark:text-foreground/80 hover:text-white dark:hover:text-foreground hover:bg-white/10 dark:hover:bg-white/5 cursor-pointer"
        aria-label="Search"
      >
        <Search className="h-[18px] w-[18px]" />
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command>
          <CommandInput placeholder="Type a command or search..." />

          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>

            <CommandGroup heading="Organization & Master Data">
              <CommandItem onSelect={() => navigateTo("/app/administration/master-data/organization")}>
                <Network className="mr-2 h-4 w-4 text-primary" />
                <span>Organization Structure (Tree Explorer)</span>
              </CommandItem>
              <CommandItem onSelect={() => navigateTo("/app/administration/master-data/business-units")}>
                <Building2 className="mr-2 h-4 w-4 text-primary" />
                <span>Business Units</span>
              </CommandItem>
              <CommandItem onSelect={() => navigateTo("/app/administration/master-data/departments")}>
                <Building2 className="mr-2 h-4 w-4 text-primary" />
                <span>Departments</span>
              </CommandItem>
              <CommandItem onSelect={() => navigateTo("/app/administration/master-data/sections")}>
                <Building2 className="mr-2 h-4 w-4 text-primary" />
                <span>Sections</span>
              </CommandItem>
            </CommandGroup>

            <CommandGroup heading="Security & Administration">
              <CommandItem onSelect={() => navigateTo("/app/administration/security-dashboard")}>
                <ShieldCheck className="mr-2 h-4 w-4 text-primary" />
                <span>Security Dashboard</span>
              </CommandItem>
              <CommandItem onSelect={() => navigateTo("/app/administration/security/settings")}>
                <Settings className="mr-2 h-4 w-4 text-primary" />
                <span>Security Settings Admin</span>
              </CommandItem>
            </CommandGroup>

            <CommandGroup heading="Budget & Financials">
              <CommandItem onSelect={() => navigateTo("/app/budget/dashboard")}>
                <Wallet className="mr-2 h-4 w-4 text-primary" />
                <span>Budget Dashboard</span>
              </CommandItem>
              <CommandItem onSelect={() => navigateTo("/app/budget/dept-budget")}>
                <Wallet className="mr-2 h-4 w-4 text-primary" />
                <span>Department Budgets</span>
              </CommandItem>
            </CommandGroup>

            <CommandGroup heading="General">
              <CommandItem onSelect={() => navigateTo("/app")}>
                <LayoutDashboard className="mr-2 h-4 w-4 text-primary" />
                <span>Main Dashboard</span>
              </CommandItem>
              <CommandItem onSelect={() => navigateTo("/app/requests")}>
                <FileText className="mr-2 h-4 w-4 text-primary" />
                <span>OMS Requests</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}