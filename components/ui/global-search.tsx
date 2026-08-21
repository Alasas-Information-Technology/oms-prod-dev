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
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        size="sm"
        className="flex w-[500px] justify-between text-muted-foreground"
      >
        <div className="flex items-center gap-3">
          <Search className="h-4 w-4" />
          <span>Search master data, actions, pages...</span>
        </div>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
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