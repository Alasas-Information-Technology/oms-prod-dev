"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ARRANGEMENTS,
  FAMILIES,
  GROUPS,
  PENSION_NOTE,
} from "./salary-grade.data";
import { salaryLabel } from "./salary-grade.utils";
import type { GradeRow } from "./salary-grade.types";
import styles from "./SalaryGrade.module.css";

export function GradeDetailDialog({
  row,
  onClose,
  onAdd,
}: {
  row: GradeRow | null;
  onClose: () => void;
  onAdd: (row: GradeRow) => void;
}) {
  return (
    <Dialog
      open={row !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      {row && (
        <DialogContent className={styles.dialog}>
          <DialogHeader>
            <DialogTitle>{row.fullCode}</DialogTitle>
            <DialogDescription>
              {row.grade.designation}
            </DialogDescription>
          </DialogHeader>

          <dl
            className={`${styles.dialogBody} grid gap-4 sm:grid-cols-2 text-sm`}
          >
            {[
              ["Deployment group", GROUPS[row.group].label],
              ["Staff category", row.grade.category],
              ["Base grade", row.grade.code],
              ["Salary range (AED)", salaryLabel(row.grade)],
              [
                "Arrangement",
                ARRANGEMENTS[row.arrangementId].label,
              ],
              ["Family status", FAMILIES[row.familyStatus]],
              ["Main benefits", row.mainBenefits],
              [
                "Grade status",
                row.grade.active ? "Active" : "Inactive",
              ],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs text-muted-foreground mb-1">
                  {label}
                </dt>
                <dd className="font-medium">{value}</dd>
              </div>
            ))}

            {row.group === "national" && (
              <div className="sm:col-span-2 text-xs text-muted-foreground">
                {PENSION_NOTE}
              </div>
            )}
          </dl>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={() => onAdd(row)}>
              Add Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
}