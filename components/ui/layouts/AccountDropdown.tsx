"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { usePermission } from "@/hooks/usePermission";
import { cn } from "@/lib/utils";
import {
    ChevronRight,
    Loader2,
    LogOut,
    ShieldCheck,
    SlidersHorizontal,
    UserRound,
    Sparkles,
    Coins,
    Users,
    Building2,
    Layers,
    Palette,
    type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useState } from "react";

// ─── Theme Configurations ──────────────────────────────────────────────────

const ICON_THEMES = {
    primary: "bg-primary/10 text-primary group-hover:bg-primary/40! group-hover:text-white!",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600/40 group-hover:text-white!",
    indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600/40 group-hover:text-white!",
    rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:bg-rose-600/40 group-hover:text-white!",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:bg-amber-600/40 group-hover:text-white!",
    purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:bg-purple-600/40 group-hover:text-white!",
} as const;

// ─── Helper Functions ───────────────────────────────────────────────────────

/**
 * Extracts 1-2 uppercase characters for user initials.
 */
function getInitials(name?: string | null, email?: string | null): string {
    if (name && name.trim()) {
        const parts = name.trim().split(/\s+/);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return parts[0].substring(0, 2).toUpperCase();
    }
    if (email && email.trim()) {
        return email.trim().substring(0, 2).toUpperCase();
    }
    return "U";
}

// ─── Subcomponents ─────────────────────────────────────────────────────────

export interface AccountTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    displayName: string;
    initials: string;
}

export const AccountTrigger = React.forwardRef<HTMLButtonElement, AccountTriggerProps>(
    ({ displayName, initials, className, ...props }, ref) => {
        return (
            <button
                ref={ref}
                type="button"
                aria-label="User Account Menu"
                className={cn(
                    "group relative flex items-center justify-center p-0.5 rounded-full outline-hidden transition-all duration-200 hover:ring-2 hover:ring-primary/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 select-none cursor-pointer",
                    className
                )}
                {...props}
            >
                <div className="relative">
                    <Avatar className="size-8 transition-transform duration-200 group-hover:scale-105 group-active:scale-95 border border-border/70 shadow-xs">
                        <AvatarImage src="" alt={displayName} />
                        <AvatarFallback className="bg-linear-to-br from-primary/85 to-primary text-primary-foreground font-semibold text-xs tracking-wider">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    {/* Online Presence Indicator */}
                    <span className="absolute bottom-0 right-0 size-1.5 rounded-full bg-emerald-500 ring-1 ring-background" />
                </div>
            </button>
        );
    }
);

AccountTrigger.displayName = "AccountTrigger";

interface AccountHeaderProps {
    displayName: string;
    displayEmail: string;
    userRole: string;
    initials: string;
}

export function AccountHeader({
    displayName,
    displayEmail,
    userRole,
    initials,
}: AccountHeaderProps) {
    return (
        <div className="p-2.5 mb-1 rounded-md bg-muted/40 border border-border/40 flex items-center gap-3">
            <div className="relative shrink-0">
                <Avatar className="size-10 border border-border/60 shadow-xs">
                    <AvatarImage src="" alt={displayName} />
                    <AvatarFallback className="bg-linear-to-br from-primary to-primary/80 text-primary-foreground font-bold text-sm">
                        {initials}
                    </AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-muted" />
            </div>

            <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1.5">
                    <span className="text-xs font-semibold text-foreground truncate" title={displayName}>
                        {displayName}
                    </span>
                    <span className="shrink-0 px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-primary/10 text-primary border border-primary/20 uppercase tracking-wide">
                        {userRole}
                    </span>
                </div>
                <span className="text-[11px] text-muted-foreground truncate" title={displayEmail}>
                    {displayEmail}
                </span>
            </div>
        </div>
    );
}

interface AccountMenuItemProps {
    icon: LucideIcon;
    title: string;
    subtitle: string;
    onClick: () => void;
    iconTheme?: keyof typeof ICON_THEMES;
    badge?: React.ReactNode;
    showChevron?: boolean;
}

export function AccountMenuItem({
    icon: Icon,
    title,
    subtitle,
    onClick,
    iconTheme = "primary",
    badge,
    showChevron = true,
}: AccountMenuItemProps) {
    return (
        <DropdownMenuItem
            className="group flex items-center justify-between px-2.5 py-2 rounded-md text-xs font-medium cursor-pointer transition-all duration-150 hover:bg-primary/20! focus:bg-primary/10!"
            onClick={onClick}
        >
            <div className="flex items-center gap-2.5 min-w-0">
                <div
                    className={cn(
                        "flex items-center justify-center size-7 rounded-lg transition-colors duration-150 shrink-0",
                        ICON_THEMES[iconTheme] || ICON_THEMES.primary
                    )}
                >
                    <Icon className="size-3.5" />
                </div>
                <div className="flex flex-col text-left min-w-0">
                    <span className="text-foreground group-hover:text-foreground font-medium truncate">
                        {title}
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate">{subtitle}</span>
                </div>
            </div>
            {badge ? (
                badge
            ) : showChevron ? (
                <ChevronRight className="size-3.5 text-muted-foreground/50 group-hover:text-foreground group-hover:translate-x-0.5 transition-all duration-150 shrink-0 ml-2" />
            ) : null}
        </DropdownMenuItem>
    );
}

interface AccountLogoutItemProps {
    isLoggingOut: boolean;
    onLogout: () => void;
}

export function AccountLogoutItem({ isLoggingOut, onLogout }: AccountLogoutItemProps) {
    return (
        <DropdownMenuItem
            variant="destructive"
            disabled={isLoggingOut}
            className={cn(
                "group flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium cursor-pointer transition-all duration-150",
                "text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-700 dark:hover:text-rose-300",
                "focus:bg-rose-50 dark:focus:bg-rose-950/30 focus:text-rose-700 dark:focus:text-rose-300"
            )}
            onClick={onLogout}
        >
            <div className="flex items-center justify-center size-7 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:bg-rose-600 group-hover:text-white transition-colors duration-150 shrink-0">
                {isLoggingOut ? (
                    <Loader2 className="size-3.5 animate-spin" />
                ) : (
                    <LogOut className="size-3.5" />
                )}
            </div>
            <div className="flex flex-col text-left">
                <span className="font-semibold">
                    {isLoggingOut ? "Signing out..." : "Sign Out"}
                </span>
                <span className="text-[10px] text-rose-500/80 dark:text-rose-400/70">
                    End your current session
                </span>
            </div>
        </DropdownMenuItem>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────

type Props = {
    trigger?: React.ReactNode;
    defaultOpen?: boolean;
    align?: "start" | "center" | "end";
};

export function AccountDropdown({ trigger, defaultOpen, align = "end" }: Props) {
    const { user, logout } = useAuth();
    const { can } = usePermission();
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [open, setOpen] = useState(defaultOpen || false);

    // Helper to format a friendly name from email when username/fullName are absent
    const deriveNameFromEmail = (email?: string) => {
        if (!email) return "Administrator";
        const localPart = email.split("@")[0];
        return localPart
            .split(/[\._\-]+/)
            .filter(Boolean)
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
            .join(" ");
    };

    // Derived display values synced with User Profile
    const displayName =
        user?.fullName ||
        (user?.username && user.username.trim()
            ? user.username.charAt(0).toUpperCase() + user.username.slice(1)
            : deriveNameFromEmail(user?.email));
    const displayEmail = user?.email || "user@diez.ae";
    const rawRole = user?.roles?.[0] || user?.userType || "Internal";
    const userRole = rawRole
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
    const initials = getInitials(displayName, displayEmail);
    const isVendor = user?.userType === "VENDOR";

    // Permission check for Administration menu item
    const canAccessAdmin =
        can("ADMIN.VIEW") ||
        can("USER.CREATE") ||
        can("ORG.VIEW") ||
        user?.roles?.includes("SYSTEM_ADMIN") ||
        user?.roles?.includes("ADMIN");

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true);
            await logout();
            router.push("/login");
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            setIsLoggingOut(false);
            setOpen(false);
        }
    };

    const handleNavigate = (path: string) => {
        setOpen(false);
        router.push(path);
    };

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                {trigger || <AccountTrigger displayName={displayName} initials={initials} />}
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align={align}
                sideOffset={8}
                className={cn(
                    "w-80 p-1.5 rounded-lg bg-popover! border border-border/70 shadow-2xl shadow-black/50 dark:shadow-black/40",
                    "origin-top-right transition-all duration-200 ease-out"
                )}
            >
                {/* ── User Header Card ── */}
                <AccountHeader
                    displayName={displayName}
                    displayEmail={displayEmail}
                    userRole={userRole}
                    initials={initials}
                />

                {/* ── Main Navigation Group ── */}
                <DropdownMenuGroup className="space-y-0.5">
                    <AccountMenuItem
                        icon={UserRound}
                        title="My Profile"
                        subtitle="Personal details & settings"
                        iconTheme="primary"
                        onClick={() => handleNavigate(isVendor ? "/vendor/profile" : "/app/profile")}
                    />

                    <AccountMenuItem
                        icon={ShieldCheck}
                        title="Active Sessions"
                        subtitle="Manage login devices"
                        iconTheme="emerald"
                        onClick={() => handleNavigate("/app/profile?tab=sessions")}
                        badge={
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                Active
                            </span>
                        }
                    />

                    {canAccessAdmin && (
                        <AccountMenuItem
                            icon={SlidersHorizontal}
                            title="Administration"
                            subtitle="Users & system config"
                            iconTheme="indigo"
                            onClick={() => handleNavigate("/app/administration")}
                        />
                    )}
                </DropdownMenuGroup>

                <DropdownMenuSeparator className="my-1.5 bg-border/50" />

                {/* ── Primitives & Demos Submenu Section ── */}
                <DropdownMenuGroup className="space-y-0.5">
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="group flex items-center justify-between px-2.5 py-2 rounded-md text-xs font-medium cursor-pointer transition-all duration-150 hover:bg-amber-500/15! focus:bg-amber-500/10!">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="flex items-center justify-center size-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:bg-amber-600 group-hover:text-white transition-colors duration-150 shrink-0">
                                    <Sparkles className="size-3.5" />
                                </div>
                                <div className="flex flex-col text-left min-w-0">
                                    <span className="text-foreground group-hover:text-foreground font-medium truncate">
                                        Primitives & UI Demos
                                    </span>
                                    <span className="text-[10px] text-muted-foreground truncate">
                                        Component living showcases
                                    </span>
                                </div>
                            </div>
                            <span className="ml-auto mr-1.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                                Demo
                            </span>
                        </DropdownMenuSubTrigger>

                        <DropdownMenuSubContent
                            sideOffset={8}
                            className="w-76 p-1.5 rounded-lg bg-popover! border border-border/70 shadow-2xl shadow-black/50 dark:shadow-black/40 space-y-0.5"
                        >
                            <DropdownMenuLabel className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Living Primitives Showcases
                            </DropdownMenuLabel>

                            <AccountMenuItem
                                icon={Coins}
                                title="Budget Primitives"
                                subtitle="Money, KPIs & fund state bar"
                                iconTheme="amber"
                                onClick={() => handleNavigate("/app/budget/primitives-demo")}
                            />

                            <AccountMenuItem
                                icon={Users}
                                title="User Admin Primitives"
                                subtitle="Role options, badges & drawer"
                                iconTheme="indigo"
                                onClick={() => handleNavigate("/app/administration/users/primitives-demo")}
                            />

                            <AccountMenuItem
                                icon={Building2}
                                title="Org Tree Primitives"
                                subtitle="Hierarchy canvas & unit picker"
                                iconTheme="emerald"
                                onClick={() => handleNavigate("/app/administration/master-data/org-primitives-demo")}
                            />

                            <AccountMenuItem
                                icon={Layers}
                                title="Page Bar & Actions"
                                subtitle="Sticky bar & portal actions"
                                iconTheme="primary"
                                onClick={() => handleNavigate("/app/administration/master-data/breadcrumb-demo")}
                            />

                            <DropdownMenuSeparator className="my-1 bg-border/50" />

                            <AccountMenuItem
                                icon={Palette}
                                title="Design System Gallery"
                                subtitle="Tokens, typography & components"
                                iconTheme="purple"
                                onClick={() => handleNavigate("/design-system")}
                            />
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>
                </DropdownMenuGroup>

                <DropdownMenuSeparator className="my-1.5 bg-border/50" />

                {/* ── Sign Out Action ── */}
                <AccountLogoutItem
                    isLoggingOut={isLoggingOut}
                    onLogout={handleLogout}
                />
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default AccountDropdown;
