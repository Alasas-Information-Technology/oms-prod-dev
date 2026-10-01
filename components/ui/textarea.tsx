import * as React from "react";

import { cn } from "./utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "resize-none border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/20 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-card/30 flex field-sizing-content min-h-[80px] w-full rounded-sm border bg-background px-3 py-2 text-sm transition-[color,box-shadow,border-color] duration-200 ease-out outline-none focus-visible:ring-[3px] hover:border-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
