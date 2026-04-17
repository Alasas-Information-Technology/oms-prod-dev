import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-8 w-full min-w-0 rounded-sm border border-gray-300 bg-[#FAFBFC] px-3 py-1.5 text-sm transition-all outline-none placeholder:text-muted-foreground focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:bg-gray-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
