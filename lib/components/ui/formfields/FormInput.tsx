"use client"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { useFormContext, Controller } from "react-hook-form"

interface FormInputProps {
  name: string
  label: string
  placeholder?: string
  type?: string
  required?: boolean
  description?: string
  disabled?: boolean
  className?: string
}

/**
 * Reusable Form Input Component for React Hook Form
 *
 * Usage:
 * ```tsx
 * <FormInput
 *   name="email"
 *   label="Email Address"
 *   type="email"
 *   placeholder="user@example.com"
 *   required
 * />
 * ```
 */
export function FormInput({
  name,
  label,
  placeholder,
  type = "text",
  required = false,
  description,
  disabled = false,
  className,
}: FormInputProps) {
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
          <Input
            id={name}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "transition-colors",
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
