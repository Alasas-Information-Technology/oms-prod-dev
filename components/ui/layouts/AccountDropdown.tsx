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
    HelpCircle,
    ChevronDown,
    type LucideIcon,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
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
    isVendor?: boolean;
    companyName?: string;
    showLabel?: boolean;
}

export const AccountTrigger = React.forwardRef<HTMLButtonElement, AccountTriggerProps>(
    (
        {
            displayName,
            initials,
            isVendor = false,
            companyName,
            showLabel = false,
            className,
            ...props
        },
        ref
    ) => {
        return (
            <button
                ref={ref}
                type="button"
                aria-label="User Account Menu"
                className={cn(
                    "group relative flex items-center outline-hidden transition-all duration-200 select-none cursor-pointer",
                    showLabel
                        ? "gap-2 px-2 py-1 rounded-full border border-teal-500/30 hover:border-teal-500/50 hover:bg-white/10 dark:hover:bg-white/5 text-white/90 dark:text-foreground/90"
                        : "justify-center p-0.5 rounded-full hover:ring-2 hover:ring-primary/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    className
                )}
                {...props}
            >
                <div className="relative shrink-0">
                    <Avatar
                        className={cn(
                            "size-8 transition-transform duration-200 group-hover:scale-105 group-active:scale-95 border shadow-xs",
                            isVendor ? "border-teal-500/40" : "border-border/70"
                        )}
                    >
                        <AvatarImage src="" alt={displayName} />
                        <AvatarFallback
                            className={cn(
                                "font-semibold text-xs tracking-wider",
                                isVendor
                                    ? "bg-linear-to-br from-teal-600 to-emerald-600 text-white"
                                    : "bg-linear-to-br from-primary/85 to-primary text-primary-foreground"
                            )}
                        >
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    {/* Online Presence Indicator */}
                    <span className="absolute bottom-0 right-0 size-1.5 rounded-full bg-emerald-500 ring-1 ring-background" />
                </div>
                {showLabel && (
                    <div className="hidden sm:flex flex-col text-left pr-1 min-w-0">
                        <span className="text-xs font-semibold leading-tight truncate max-w-[130px]">
                            {companyName || displayName}
                        </span>
                        <span className="text-[10px] text-teal-300 dark:text-teal-400/80 leading-none truncate max-w-[130px]">
                            {displayName}
                        </span>
                    </div>
                )}
                {showLabel && (
                    <ChevronDown className="size-3 text-white/60 group-hover:text-white dark:text-muted-foreground transition-colors mr-0.5 shrink-0" />
                )}
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
    isVendor?: boolean;
    companyName?: string;
}

export function AccountHeader({
    displayName,
    displayEmail,
    userRole,
    initials,
    isVendor = false,
    companyName,
}: AccountHeaderProps) {
    return (
        <div
            className={cn(
                "p-2.5 mb-1 rounded-md border flex items-center gap-3 transition-colors",
                isVendor
                    ? "bg-teal-500/10 border-teal-500/25 dark:bg-teal-950/30 dark:border-teal-500/30"
                    : "bg-muted/40 border-border/40"
            )}
        >
            <div className="relative shrink-0">
                <Avatar
                    className={cn(
                        "size-10 border shadow-xs",
                        isVendor ? "border-teal-500/40" : "border-border/60"
                    )}
                >
                    <AvatarImage src="" alt={displayName} />
                    <AvatarFallback
                        className={cn(
                            "font-bold text-sm",
                            isVendor
                                ? "bg-linear-to-br from-teal-600 to-emerald-600 text-white"
                                : "bg-linear-to-br from-primary to-primary/80 text-primary-foreground"
                        )}
                    >
                        {initials}
                    </AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-muted" />
            </div>

            <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1.5">
                    <span
                        className="text-xs font-semibold text-foreground truncate"
                        title={displayName}
                    >
                        {displayName}
                    </span>
                    <span
                        className={cn(
                            "shrink-0 px-1.5 py-0.2 rounded-full text-[9px] font-semibold uppercase tracking-wide border",
                            isVendor
                                ? "bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30"
                                : "bg-primary/10 text-primary border-primary/20"
                        )}
                    >
                        {userRole}
                    </span>
                </div>
                {companyName && (
                    <span
                        className="text-[10px] font-medium text-teal-600 dark:text-teal-400 truncate"
                        title={companyName}
                    >
                        {companyName}
                    </span>
                )}
                <span
                    className="text-[11px] text-muted-foreground truncate"
                    title={displayEmail}
                >
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
    portal?: "internal" | "vendor";
    showLabel?: boolean;
};

export function AccountDropdown({
    trigger,
    defaultOpen,
    align = "end",
    portal,
    showLabel,
}: Props) {
    const { user, logout } = useAuth();
    const { can } = usePermission();
    
    let router: any = null;
    try {
        router = useRouter();
    } catch {}

    let pathname: string | null = null;
    try {
        pathname = usePathname();
    } catch {}

    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [open, setOpen] = useState(defaultOpen || false);

    const isVendorPortal =
        portal === "vendor" ||
        (portal === undefined && (pathname?.startsWith("/vendor") || user?.userType === "VENDOR"));

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
            : isVendorPortal
            ? "Layla Hassan"
            : deriveNameFromEmail(user?.email));

    const displayEmail =
        user?.email || (isVendorPortal ? "layla.hassan@falcontech.ae" : "user@diez.ae");

    const rawRole =
        user?.roles?.[0] || user?.userType || (isVendorPortal ? "Vendor Coordinator" : "Internal");

    const userRole =
        rawRole === "VENDOR"
            ? "Vendor Coordinator"
            : rawRole
                  .split("_")
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                  .join(" ");

    const companyName = isVendorPortal
        ? user?.department || "Falcon Tech Resourcing LLC"
        : undefined;

    const initials =
        isVendorPortal && !user?.fullName && !user?.username
            ? "LH"
            : getInitials(displayName, displayEmail);

    // Permission check for Administration menu item
    const canAccessAdmin =
        !isVendorPortal &&
        (can("ADMIN.VIEW") ||
            can("USER.CREATE") ||
            can("ORG.VIEW") ||
            user?.roles?.includes("SYSTEM_ADMIN") ||
            user?.roles?.includes("ADMIN"));

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true);
            await logout();
            if (router) {
                router.push("/login");
            } else if (typeof window !== "undefined") {
                window.location.href = "/login";
            }
        } catch (error) {
            console.error("Logout failed, enforcing local cleanup:", error);
            if (typeof window !== "undefined") {
                document.cookie =
                    "oms_access_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                document.cookie =
                    "oms_refresh_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                try {
                    localStorage.removeItem("oms_demo_persona");
                    localStorage.removeItem("oms_user_profile");
                } catch {}
                window.location.href = "/login";
            }
        } finally {
            setIsLoggingOut(false);
            setOpen(false);
        }
    };

    const handleNavigate = (path: string) => {
        setOpen(false);
        if (router) {
            router.push(path);
        } else if (typeof window !== "undefined") {
            window.location.href = path;
        }
    };

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                {trigger || (
                    <AccountTrigger
                        displayName={displayName}
                        initials={initials}
                        isVendor={isVendorPortal}
                        companyName={companyName}
                        showLabel={showLabel}
                    />
                )}
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
                    isVendor={isVendorPortal}
                    companyName={companyName}
                />

                {isVendorPortal ? (
                    /* ── Main Navigation Group for Vendor Portal ── */
                    <DropdownMenuGroup className="space-y-0.5">
                        <AccountMenuItem
                            icon={Building2}
                            title="Organization Profile"
                            subtitle="Company registration & contacts"
                            iconTheme="primary"
                            onClick={() => handleNavigate("/vendor/profile")}
                        />

                        <AccountMenuItem
                            icon={ShieldCheck}
                            title="Compliance Documents"
                            subtitle="Trade licence, insurance & certs"
                            iconTheme="emerald"
                            onClick={() => handleNavigate("/vendor/documents")}
                            badge={
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                    Verified
                                </span>
                            }
                        />

                        <AccountMenuItem
                            icon={Coins}
                            title="Rate Cards"
                            subtitle="Location work matrices & rates"
                            iconTheme="amber"
                            onClick={() => handleNavigate("/vendor/rates")}
                        />

                        <AccountMenuItem
                            icon={Layers}
                            title="Master Agreements"
                            subtitle="Active MSAs & contracts"
                            iconTheme="indigo"
                            onClick={() => handleNavigate("/vendor/contracts")}
                        />

                        <AccountMenuItem
                            icon={HelpCircle}
                            title="Procurement Support"
                            subtitle="Helpdesk & operations inquiry"
                            iconTheme="purple"
                            onClick={() => handleNavigate("/vendor/support")}
                        />
                    </DropdownMenuGroup>
                ) : (
                    /* ── Main Navigation Group for Internal Portal ── */
                    <>
                        <DropdownMenuGroup className="space-y-0.5">
                            <AccountMenuItem
                                icon={UserRound}
                                title="My Profile"
                                subtitle="Personal details & settings"
                                iconTheme="primary"
                                onClick={() => handleNavigate("/app/profile")}
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
                    </>
                )}

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
