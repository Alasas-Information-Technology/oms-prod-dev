"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "./utils";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 select-none w-[280px]", className)}
      classNames={{
        months: "flex flex-col gap-3 relative",
        month: "flex flex-col gap-2",
        month_caption: "flex justify-center items-center h-8 relative font-semibold text-sm text-foreground",
        caption_label: "text-sm font-semibold text-foreground",
        nav: "flex items-center justify-between w-full absolute top-0 left-0 px-1 z-10 pointer-events-none",
        button_previous: "size-7 pointer-events-auto inline-flex items-center justify-center rounded-md border border-border bg-background hover:bg-accent text-foreground transition-colors cursor-pointer shadow-xs",
        button_next: "size-7 pointer-events-auto inline-flex items-center justify-center rounded-md border border-border bg-background hover:bg-accent text-foreground transition-colors cursor-pointer shadow-xs",
        nav_button: "size-7 pointer-events-auto inline-flex items-center justify-center rounded-md border border-border bg-background hover:bg-accent text-foreground transition-colors cursor-pointer shadow-xs",
        nav_button_previous: "absolute left-0",
        nav_button_next: "absolute right-0",
        month_grid: "w-full border-collapse mt-2",
        table: "w-full border-collapse mt-2",
        weekdays: "grid grid-cols-7 w-full text-center text-xs font-semibold text-muted-foreground pb-2 border-b border-border/40",
        head_row: "grid grid-cols-7 w-full text-center text-xs font-semibold text-muted-foreground pb-2 border-b border-border/40",
        weekday: "flex items-center justify-center h-6 text-[11px] font-semibold text-muted-foreground",
        head_cell: "flex items-center justify-center h-6 text-[11px] font-semibold text-muted-foreground",
        weeks: "flex flex-col gap-1 pt-1",
        week: "grid grid-cols-7 w-full",
        row: "grid grid-cols-7 w-full",
        cell: "flex items-center justify-center p-0 relative focus-within:relative focus-within:z-20",
        day: "size-8 flex items-center justify-center text-xs rounded-md text-foreground hover:bg-accent hover:text-accent-foreground transition-all font-medium cursor-pointer mx-auto",
        day_selected: "bg-primary text-primary-foreground font-bold hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-md shadow-xs",
        selected: "bg-primary text-primary-foreground font-bold hover:bg-primary hover:text-primary-foreground rounded-md shadow-xs",
        day_today: "bg-muted text-primary font-bold border border-primary/40",
        today: "bg-muted text-primary font-bold border border-primary/40",
        day_outside: "text-muted-foreground/30 opacity-30",
        outside: "text-muted-foreground/30 opacity-30",
        day_disabled: "text-muted-foreground/20 opacity-20 cursor-not-allowed",
        disabled: "text-muted-foreground/20 opacity-20 cursor-not-allowed",
        day_hidden: "invisible",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }: { orientation?: string }) =>
          orientation === "left" ? (
            <ChevronLeft className="size-4 text-foreground" />
          ) : (
            <ChevronRight className="size-4 text-foreground" />
          ),
      }}
      {...props}
    />
  );
}

export { Calendar };
