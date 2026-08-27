"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
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
                <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-foreground truncate max-w-[130px]">
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
            <div className="flex items-center gap-2.5">
                <div
                    className={cn(
                        "flex items-center justify-center size-7 rounded-lg transition-colors duration-150",
                        ICON_THEMES[iconTheme]
                    )}
                >
                    <Icon className="size-3.5" />
                </div>
                <div className="flex flex-col text-left">
                    <span className="text-foreground group-hover:text-foreground font-medium">
                        {title}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{subtitle}</span>
                </div>
            </div>
            {badge ? (
                badge
            ) : showChevron ? (
                <ChevronRight className="size-3.5 text-muted-foreground/50 group-hover:text-foreground group-hover:translate-x-0.5 transition-all duration-150" />
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
            <div className="flex items-center justify-center size-7 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:bg-rose-600 group-hover:text-white transition-colors duration-150">
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

    // Derived display values
    const displayName = user?.username
        ? user.username.charAt(0).toUpperCase() + user.username.slice(1)
        : "User Account";
    const displayEmail = user?.email || "user@diez.ae";
    const userRole = user?.roles?.[0] || user?.userType || "Internal";
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
                    "w-76 p-1.5 rounded-lg bg-popover! border border-border/70 shadow-2xl shadow-black/50 dark:shadow-black/40",
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


