import * as React from "react";
import { cn } from "@/components/ui/utils";

export interface UserPanelCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  headerAction?: React.ReactNode;
}

export function UserPanelCard({
  title,
  headerAction,
  className,
  children,
  ...props
}: UserPanelCardProps) {
  return (
    <div
      className={cn(
        "bg-card rounded-md border border-border/70 flex flex-col",
        className
      )}
      {...props}
    >
      <div className="flex h-14 items-center justify-between px-6 border-b border-border/50 shrink-0">
        <h3 className="text-[15px] font-semibold font-display text-foreground">
          {title}
        </h3>
        {headerAction && (
          <div className="flex items-center text-sm">
            {headerAction}
          </div>
        )}
      </div>
      <div className="flex flex-col [&>div:not(:last-child)]:border-b [&>div:not(:last-child)]:border-border/50">
        {children}
      </div>
    </div>
  );
}

export interface UserPanelRowProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function UserPanelRow({ className, children, ...props }: UserPanelRowProps) {
  return (
    <div
      className={cn(
        "min-h-14 py-3 px-6 flex items-center justify-between text-[13px]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
