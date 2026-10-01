"use client"

import { createContext, useCallback, useContext, useRef, useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/components/ui/utils"

type ConfirmVariant = "default" | "destructive"

type ConfirmOptions = {
  title?: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: ConfirmVariant
}

const DEFAULTS: Required<ConfirmOptions> = {
  title: "Are you sure?",
  description: "This action cannot be undone.",
  confirmLabel: "Confirm",
  cancelLabel: "Cancel",
  variant: "default",
}

type ConfirmFn = (
  opts: ConfirmOptions,
  onConfirm: () => void | Promise<void>,
) => () => void

const ConfirmContext = createContext<ConfirmFn | null>(null)

/**
 * Hook that provides an imperative confirmation dialog.
 * Must be used inside a `<ConfirmProvider>`.
 *
 * @example
 * ```tsx
 * const confirm = useConfirm()
 *
 * const handleDelete = confirm(
 *   {
 *     title: "Delete record?",
 *     description: "This will permanently remove the record.",
 *     confirmLabel: "Delete",
 *     variant: "destructive",
 *   },
 *   async () => {
 *     await deleteRecord(id)
 *   },
 * )
 *
 * return <Button onClick={handleDelete}>Delete</Button>
 * ```
 */
export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext)
  if (!ctx) {
    throw new Error("useConfirm must be used within a <ConfirmProvider>")
  }
  return ctx
}

/**
 * Provider that renders a single global ConfirmDialog.
 * Place this once near the root of your app (e.g. in Providers).
 */
export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<Required<ConfirmOptions>>(DEFAULTS)
  const onConfirmRef = useRef<(() => void | Promise<void>) | null>(null)

  const confirm: ConfirmFn = useCallback(
    (opts, onConfirm) => {
      return () => {
        setOptions({ ...DEFAULTS, ...opts })
        onConfirmRef.current = onConfirm
        setOpen(true)
      }
    },
    [],
  )

  const handleConfirm = useCallback(() => {
    onConfirmRef.current?.()
    setOpen(false)
  }, [])

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="sm:max-w-[420px]">
          <AlertDialogHeader>
            <AlertDialogTitle>{options.title}</AlertDialogTitle>
            <AlertDialogDescription>{options.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{options.cancelLabel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={cn(
                options.variant === "destructive" &&
                  buttonVariants({ variant: "destructive" }),
              )}
            >
              {options.confirmLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext.Provider>
  )
}
