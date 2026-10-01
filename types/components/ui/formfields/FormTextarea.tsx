"use client"

import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"
import { useFormContext, Controller } from "react-hook-form"

interface FormTextareaProps {
  name: string
  label: string
  placeholder?: string
  required?: boolean
  description?: string
  disabled?: boolean
  rows?: number
  className?: string
}

/**
 * Reusable Form Textarea Component for React Hook Form
 *
 * Usage:
 * ```tsx
 * <FormTextarea
 *   name="description"
 *   label="Description"
 *   placeholder="Enter description..."
 *   rows={4}
 * />
 * ```
 */
export function FormTextarea({
  name,
  label,
  placeholder,
  required = false,
  description,
  disabled = false,
  rows = 3,
  className,
}: FormTextareaProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext()

  const error = errors[name]
  const hasError = !!error

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        <label
          htmlFor={name}
          className="text-sm font-medium text-foreground"
        >
          {label}
        </label>
        {required && <span className="text-destructive">*</span>}
      </div>

      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Textarea
            id={name}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            className={cn(
              "transition-colors resize-none",
              hasError && "border-destructive focus-visible:ring-destructive"
            )}
            {...field}
            value={field.value || ""}
          />
        )}
      />

      {description && (
        <p className="text-xs text-foreground-tertiary">
          {description}
        </p>
      )}

      {hasError && (
        <p className="text-sm font-medium text-destructive">
          {error.message as string}
        </p>
      )}
    </div>
  )
}
