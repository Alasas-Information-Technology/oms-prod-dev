"use client"

import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { useFormContext, Controller } from "react-hook-form"

interface FormCheckboxProps {
  name: string
  label: string
  description?: string
  disabled?: boolean
  className?: string
}

/**
 * Reusable Form Checkbox Component for React Hook Form
 *
 * Usage:
 * ```tsx
 * <FormCheckbox
 *   name="acceptTerms"
 *   label="I accept the terms and conditions"
 *   description="You must accept to proceed"
 * />
 * ```
 */
export function FormCheckbox({
  name,
  label,
  description,
  disabled = false,
  className,
}: FormCheckboxProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext()

  const error = errors[name]
  const hasError = !!error

  return (
    <div className={cn("space-y-2", className)}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className="flex items-start gap-3">
            <Checkbox
              id={name}
              checked={field.value || false}
              onCheckedChange={field.onChange}
              disabled={disabled}
              className={cn(
                "mt-1 transition-colors",
                hasError && "border-destructive"
              )}
            />
            <div className="flex flex-col gap-1">
              <label
                htmlFor={name}
                className="text-sm font-medium text-foreground cursor-pointer"
              >
                {label}
              </label>
              {description && (
                <p className="text-xs text-foreground-tertiary">
                  {description}
                </p>
              )}
            </div>
          </div>
        )}
      />

      {hasError && (
        <p className="text-sm font-medium text-destructive">
          {error.message as string}
        </p>
      )}
    </div>
  )
}
