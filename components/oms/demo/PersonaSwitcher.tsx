"use client";

import * as React from "react";
import {
  Check,
  ChevronDown,
  Search,
  Sparkles,
  User,
  Shield,
  Briefcase,
  Building2,
  DollarSign,
  UserCheck,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CAST_LIST, CAST } from "@/src/lib/demo-data/cast";
import { Person } from "@/src/lib/demo-data/entities";
import {
  getActivePersonaId,
  switchPersona,
} from "@/src/lib/demo-data/persona-auth";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Grouping taxonomy for the 16 canonical cast members
type PersonaGroup =
  | "ALL"
  | "REQUESTOR"
  | "APPROVER"
  | "HR_INTERVIEW"
  | "FINANCE_PROCUREMENT"
  | "VENDOR_ADMIN";

const GROUP_CONFIG: Record<
  PersonaGroup,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  ALL: { label: "All Cast (16)", icon: Sparkles },
  REQUESTOR: { label: "Requesters", icon: User },
  APPROVER: { label: "Approvers & LM", icon: Check },
  HR_INTERVIEW: { label: "HR & Interviewers", icon: Briefcase },
  FINANCE_PROCUREMENT: { label: "Finance & Procurement", icon: DollarSign },
  VENDOR_ADMIN: { label: "Vendor & Admin", icon: Shield },
};

function getPersonaGroup(person: Person): PersonaGroup {
  if (person.id === "usr-layla" || person.id === "usr-admin") {
    return "VENDOR_ADMIN";
  }
  if (person.id === "usr-rashid-m" || person.id === "usr-salma") {
    return "FINANCE_PROCUREMENT";
  }
  if (
    person.id === "usr-aisha" ||
    person.id === "usr-noura" ||
    person.id === "usr-yousef-f"
  ) {
    return "HR_INTERVIEW";
  }
  if (
    person.id === "usr-omar" ||
    person.id === "usr-fatima" ||
    person.id === "usr-khalid" ||
    person.id === "usr-youssef-b" ||
    person.id === "usr-mona"
  ) {
    return "APPROVER";
  }
  return "REQUESTOR";
}

const ROLE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "Department Requestor": {
    bg: "bg-blue-500/10 dark:bg-blue-500/20",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-500/30",
  },
  "Line Manager": {
    bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-500/30",
  },
  "Section Head": {
    bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-500/30",
  },
  "Head of Department": {
    bg: "bg-purple-500/10 dark:bg-purple-500/20",
    text: "text-purple-700 dark:text-purple-300",
    border: "border-purple-500/30",
  },
  "HR Specialist": {
    bg: "bg-pink-500/10 dark:bg-pink-500/20",
    text: "text-pink-700 dark:text-pink-300",
    border: "border-pink-500/30",
  },
  "Main Interviewer": {
    bg: "bg-indigo-500/10 dark:bg-indigo-500/20",
    text: "text-indigo-700 dark:text-indigo-300",
    border: "border-indigo-500/30",
  },
  "Panel Interviewer": {
    bg: "bg-indigo-500/10 dark:bg-indigo-500/20",
    text: "text-indigo-700 dark:text-indigo-300",
    border: "border-indigo-500/30",
  },
  "Finance Manager": {
    bg: "bg-amber-500/10 dark:bg-amber-500/20",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-500/30",
  },
  "Procurement Officer": {
    bg: "bg-amber-500/10 dark:bg-amber-500/20",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-500/30",
  },
  "Vendor Coordinator": {
    bg: "bg-teal-500/15 dark:bg-teal-500/25",
    text: "text-teal-800 dark:text-teal-200",
    border: "border-teal-500/40",
  },
  "System Administrator": {
    bg: "bg-rose-500/10 dark:bg-rose-500/20",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-500/30",
  },
};

export function PersonaSwitcher() {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedGroup, setSelectedGroup] = React.useState<PersonaGroup>("ALL");
  const [activePersonaId, setActivePersonaId] = React.useState<string>("usr-mariam");
  const [isSwitching, setIsSwitching] = React.useState(false);

  // Sync active persona ID on mount
  React.useEffect(() => {
    setActivePersonaId(getActivePersonaId());
  }, []);

  // Demo mode gate: visible only when NEXT_PUBLIC_DEMO_MODE is true or dev mode
  const isDemoMode =
    process.env.NEXT_PUBLIC_DEMO_MODE === "true" ||
    process.env.NODE_ENV === "development";

  if (!isDemoMode) {
    return null;
  }

  const activePerson = CAST[activePersonaId] || CAST["usr-mariam"];

  // Filter cast members by category and search
  const filteredCast = CAST_LIST.filter((person) => {
    // Category filter
    if (selectedGroup !== "ALL" && getPersonaGroup(person) !== selectedGroup) {
      return false;
    }
    // Search query
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      person.name.toLowerCase().includes(q) ||
      person.role.toLowerCase().includes(q) ||
      (person.departmentName || "").toLowerCase().includes(q) ||
      person.id.toLowerCase().includes(q) ||
      person.email.toLowerCase().includes(q)
    );
  });

  const handleSelectPersona = async (person: Person) => {
    if (isSwitching) return;
    try {
      setIsSwitching(true);
      setActivePersonaId(person.id);
      setOpen(false);
      toast.info(`Switching session to ${person.name} (${person.role})...`);
      await switchPersona(person.id);
    } catch (err) {
      console.error("Failed to switch persona:", err);
      toast.error("Failed to switch persona. Please check logs.");
      setIsSwitching(false);
    }
  };

  const activeColors = ROLE_COLORS[activePerson.role] || {
    bg: "bg-primary/10",
    text: "text-primary",
    border: "border-primary/20",
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Current Persona: ${activePerson.name}. Click to switch.`}
          className={cn(
            "group relative inline-flex items-center gap-2 h-8 px-2.5 rounded-full border transition-all duration-150 cursor-pointer select-none",
            "bg-background/80 hover:bg-muted/80 backdrop-blur-xs",
            "border-border/70 hover:border-primary/50 shadow-2xs hover:shadow-xs",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
            open && "ring-2 ring-primary/40 border-primary"
          )}
        >
          {/* Persona Avatar/Initial Tag */}
          <div
            className={cn(
              "size-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 border",
              activeColors.bg,
              activeColors.text,
              activeColors.border
            )}
          >
            {activePerson.initials}
          </div>

          {/* Persona Name & Role */}
          <div className="flex items-center gap-1.5 text-xs text-left max-w-[190px] sm:max-w-[220px] truncate">
            <span className="font-semibold text-foreground truncate">
              {activePerson.name}
            </span>
            <span className="text-[10px] text-muted-foreground hidden sm:inline truncate">
              · {activePerson.role}
            </span>
          </div>

          {/* Indicator Badge */}
          <Badge
            variant="outline"
            className={cn(
              "text-[9px] px-1 py-0 font-mono tracking-tight hidden md:inline-flex",
              activePerson.userType === "VENDOR"
                ? "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/30"
                : "bg-primary/10 text-primary border-primary/20"
            )}
          >
            {activePerson.userType === "VENDOR" ? "VENDOR" : "INTERNAL"}
          </Badge>

          <ChevronDown
            className={cn(
              "size-3 text-muted-foreground transition-transform duration-150 shrink-0",
              open && "rotate-180 text-foreground"
            )}
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={6}
        className="w-[380px] sm:w-[440px] p-0 shadow-xl border-border bg-popover text-popover-foreground rounded-xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150"
      >
        {/* Top Header */}
        <div className="p-3.5 bg-muted/40 border-b border-border/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/20">
              <Sparkles className="size-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-foreground tracking-tight">
                  Global Persona Switcher
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-primary/15 text-primary border border-primary/30 font-semibold">
                  16 Cast
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-tight">
                Authentic session hydration per DEMO-DATA-INTEGRATION Part 6
              </p>
            </div>
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="p-3 space-y-2 border-b border-border/50 bg-background/50">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cast by name, role, department..."
              className="h-8 pl-8 text-xs bg-muted/30"
              autoFocus
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none text-[11px]">
            {(Object.keys(GROUP_CONFIG) as PersonaGroup[]).map((groupKey) => {
              const config = GROUP_CONFIG[groupKey];
              const isSelected = selectedGroup === groupKey;
              return (
                <button
                  key={groupKey}
                  type="button"
                  onClick={() => setSelectedGroup(groupKey)}
                  className={cn(
                    "px-2 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer",
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-2xs font-semibold"
                      : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <span>{config.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Cast Member List */}
        <div className="max-h-[340px] overflow-y-auto p-1.5 divide-y divide-border/30">
          {filteredCast.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              No cast members matching &quot;{searchQuery}&quot;
            </div>
          ) : (
            filteredCast.map((person) => {
              const isCurrent = person.id === activePersonaId;
              const roleColor = ROLE_COLORS[person.role] || {
                bg: "bg-muted",
                text: "text-foreground",
                border: "border-border",
              };

              return (
                <button
                  key={person.id}
                  type="button"
                  onClick={() => handleSelectPersona(person)}
                  disabled={isSwitching}
                  className={cn(
                    "w-full p-2.5 rounded-lg flex items-center justify-between text-left transition-all duration-150 group cursor-pointer",
                    isCurrent
                      ? "bg-primary/10 dark:bg-primary/15 border border-primary/30"
                      : "hover:bg-muted/60 hover:border-transparent border border-transparent"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Persona Initial Avatar */}
                    <div
                      className={cn(
                        "size-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border transition-transform group-hover:scale-105",
                        roleColor.bg,
                        roleColor.text,
                        roleColor.border
                      )}
                    >
                      {person.initials}
                    </div>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            "text-xs font-semibold truncate",
                            isCurrent
                              ? "text-primary dark:text-primary-foreground font-bold"
                              : "text-foreground"
                          )}
                        >
                          {person.name}
                        </span>
                        {person.userType === "VENDOR" && (
                          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-teal-500/15 text-teal-800 dark:text-teal-200 border border-teal-500/30 font-semibold">
                            VENDOR
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground truncate">
                        <span className="font-medium text-foreground/80 truncate">
                          {person.role}
                        </span>
                        <span>•</span>
                        <span className="truncate">{person.departmentName || "General"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Active Indicator or Switch Arrow */}
                  <div className="ml-2 shrink-0 flex items-center">
                    {isCurrent ? (
                      <span className="size-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                        <Check className="size-3 stroke-[3]" />
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                        Switch →
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer info bar */}
        <div className="p-2.5 bg-muted/40 border-t border-border/70 flex items-center justify-between text-[11px] text-muted-foreground px-3">
          <span>Active: {activePerson.name}</span>
          <span className="font-mono text-[10px]">{activePerson.id}</span>
        </div>
      </PopoverContent>
    </Popover>
  );
}
