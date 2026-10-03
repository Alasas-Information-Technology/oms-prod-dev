"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ICreateBudgetCategoryDto } from "@/lib/types/budget-master.types";
import { Tags, Loader2 } from "lucide-react";

interface AddBudgetCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ICreateBudgetCategoryDto) => Promise<void> | void;
}

export function AddBudgetCategoryDialog({
  open,
  onOpenChange,
  onSubmit,
}: AddBudgetCategoryDialogProps) {
  const [code, setCode] = React.useState("");
  const [name, setName] = React.useState("");
  const [expenseType, setExpenseType] = React.useState("OPEX");
  const [oracleAccountCode, setOracleAccountCode] = React.useState("");
  const [isActive, setIsActive] = React.useState("true");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      setCode("");
      setName("");
      setExpenseType("OPEX");
      setOracleAccountCode("");
      setIsActive("true");
      setIsSubmitting(false);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedCode = code.trim();
    if (!trimmedCode) {
      toast.error("Category code is required.");
      return;
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Category name is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        code: trimmedCode,
        name: trimmedName,
        expense_type: expenseType,
        oracle_account_code: oracleAccountCode.trim(),
        is_active: isActive === "true",
      });
      toast.success(`Category ${trimmedCode} created successfully.`);
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to create category.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-6">
        <DialogHeader className="gap-1.5 pb-2">
          <div className="flex items-center gap-2.5 text-primary mb-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
              <Tags className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="text-lg font-semibold text-foreground">
              Add Budget Category
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Code */}
          <div className="space-y-1.5">
            <Label htmlFor="cat-code" className="text-xs font-semibold text-foreground">
              Code <span className="text-destructive">*</span>
            </Label>
            <Input
              id="cat-code"
              placeholder="Enter code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={isSubmitting}
              autoFocus
              className="h-9 text-sm"
            />
            <p className="text-[11.5px] text-muted-foreground">
              Unique fiscal identifier
            </p>
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="cat-name" className="text-xs font-semibold text-foreground">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="cat-name"
              placeholder="Enter category name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              className="h-9 text-sm"
            />
          </div>

          {/* Expense Type & Is Active */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="cat-expense-type" className="text-xs font-semibold text-foreground">
                Expense Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={expenseType}
                onValueChange={setExpenseType}
                disabled={isSubmitting}
              >
                <SelectTrigger id="cat-expense-type" className="h-9 text-sm cursor-pointer">
                  <SelectValue placeholder="Select expense type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CAPEX" className="cursor-pointer">
                    <span className="font-medium text-sky-600 dark:text-sky-400">CAPEX</span> — Capital Expenditure
                  </SelectItem>
                  <SelectItem value="OPEX" className="cursor-pointer">
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">OPEX</span> — Operating Expenditure
                  </SelectItem>
                  <SelectItem value="DIRECT" className="cursor-pointer">
                    <span className="font-medium text-purple-600 dark:text-purple-400">DIRECT</span> — Direct Project Expense
                  </SelectItem>
                  <SelectItem value="INDIRECT" className="cursor-pointer">
                    <span className="font-medium text-amber-600 dark:text-amber-400">INDIRECT</span> — Indirect Overhead
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cat-status" className="text-xs font-semibold text-foreground">
                Status <span className="text-destructive">*</span>
              </Label>
              <Select
                value={isActive}
                onValueChange={setIsActive}
                disabled={isSubmitting}
              >
                <SelectTrigger id="cat-status" className="h-9 text-sm cursor-pointer">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true" className="cursor-pointer">
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">Active</span>
                  </SelectItem>
                  <SelectItem value="false" className="cursor-pointer">
                    <span className="font-medium text-muted-foreground">Inactive</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Oracle Account Code */}
          <div className="space-y-1.5">
            <Label htmlFor="cat-oracle" className="text-xs font-semibold text-foreground">
              Oracle Account Code
            </Label>
            <Input
              id="cat-oracle"
              placeholder="Enter Oracle account code"
              value={oracleAccountCode}
              onChange={(e) => setOracleAccountCode(e.target.value)}
              disabled={isSubmitting}
              className="h-9 text-sm font-mono text-xs"
            />
          </div>

          <DialogFooter className="pt-3 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="h-9 text-sm cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="h-9 text-sm font-semibold cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  Saving...
                </>
              ) : (
                "Save Category"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
