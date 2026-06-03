import { cn } from "@/lib/utils"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useFormContext, Controller } from "react-hook-form"

type RHFInputProps = {
  name: string
  label: string
  type: string
  placeholder: string
  className?: string
}

export default function RHFInput({
  name,
  label,
  type,
  placeholder,
  className,
}: RHFInputProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext()

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Field className={className}>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>

          <Input
            id={name}
            type={type}
            placeholder={placeholder}
            {...field}
          />

          {errors[name] && (
            <p className="text-red-500 text-sm">
              {errors[name]?.message as string}
            </p>
          )}
        </Field>
      )}
    />
  )
}