"use client"

import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useFormContext, Controller } from "react-hook-form"

interface FormSelectProps {
  name: string
  label: string
  placeholder?: string
  required?: boolean
  description?: string
  disabled?: boolean
  options: Array<{
    value: string
    label: string
  }>
  className?: string
}

/**
 * Reusable Form Select Component for React Hook Form
 *
 * Usage:
 * ```tsx
 * <FormSelect
 *   name="status"
 *   label="Status"
 *   placeholder="Select a status..."
 *   options={[
 *     { value: "active", label: "Active" },
 *     { value: "inactive", label: "Inactive" }
 *   ]}
 * />
 * ```
 */
export function FormSelect({
  name,
  label,
  placeholder = "Select an option...",
  required = false,
  description,
  disabled = false,
  options,
  className,
}: FormSelectProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext()

  const error = errors[name]
  const hasError = !!error

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-foreground">
          {label}
        </label>
        {required && <span className="text-destructive">*</span>}
      </div>

      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select
            value={field.value || ""}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <SelectTrigger
              className={cn(
                "transition-colors",
                hasError && "border-destructive focus:ring-destructive"
              )}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
