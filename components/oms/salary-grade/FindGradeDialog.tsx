"use client";

import { useState } from "react";
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
  CATEGORIES,
  FAMILIES,
  PENSION_NOTE,
} from "./salary-grade.data";
import { rowsFor, salaryLabel } from "./salary-grade.utils";
import {
  GroupChoices,
  Notice,
  SelectField,
} from "./SalaryGradeFields";
import type {
  DeploymentGroup,
  GradeRow,
  GradeStore,
} from "./salary-grade.types";
import styles from "./SalaryGrade.module.css";

export function FindGradeDialog({
  store,
  onClose,
  onView,
}: {
  store: GradeStore;
  onClose: () => void;
  onView: (row: GradeRow) => void;
}) {
  const [group, setGroup] =
    useState<DeploymentGroup | "">("");
  const [category, setCategory] = useState("");
  const [gradeId, setGradeId] = useState("");
  const [arrangement, setArrangement] = useState("");
  const [family, setFamily] = useState("");

  const rows = rowsFor(store).filter(
    (row) => row.grade.active && row.group === group,
  );

  const grades = store.grades.filter(
    (grade) =>
      grade.category === category &&
      rows.some((row) => row.grade.id === grade.id),
  );

  const gradeRows = rows.filter(
    (row) => row.grade.id === gradeId,
  );

  const arrangements = [
    ...new Set(gradeRows.map((row) => row.arrangementId)),
  ];

  const chosenArrangement =
    arrangement ||
    (arrangements.length === 1 ? arrangements[0] : "");

  const families = [
    ...new Set(
      gradeRows
        .filter(
          (row) => row.arrangementId === chosenArrangement,
        )
        .map((row) => row.familyStatus),
    ),
  ].sort();

  const chosenFamily =
    family || (families.length === 1 ? families[0] : "");

  const result = gradeRows.find(
    (row) =>
      row.arrangementId === chosenArrangement &&
      row.familyStatus === chosenFamily,
  );

  const grade = grades.find((item) => item.id === gradeId);

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        className={`${styles.dialog} sm:max-w-3xl`}
      >
        <DialogHeader>
          <DialogTitle>Find a Grade</DialogTitle>
          <DialogDescription>
            Choose the job and arrangement to find an existing
            active grade. Nothing is created.
          </DialogDescription>
        </DialogHeader>

        <div className={`${styles.dialogBody} space-y-5`}>
          <GroupChoices
            value={group}
            onChange={(value) => {
              setGroup(value);
              setCategory("");
              setGradeId("");
              setArrangement("");
              setFamily("");
            }}
          />

          {group && (
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField
                id="find-category"
                label="Staff category"
                value={category}
                onChange={(value) => {
                  setCategory(value);
                  setGradeId("");
                  setArrangement("");
                  setFamily("");
                }}
                options={CATEGORIES.filter((c) =>
                  rows.some((row) => row.grade.category === c),
                ).map((c) => ({ value: c, label: c }))}
              />

              <SelectField
                id="find-grade"
                label="Designation / base grade"
                value={gradeId}
                disabled={!category}
                onChange={(value) => {
                  setGradeId(value);
                  setArrangement("");
                  setFamily("");
                }}
                options={grades.map((g) => ({
                  value: g.id,
                  label: `${g.designation} — ${g.code}`,
                }))}
              />
            </div>
          )}

          {group && rows.length === 0 && (
            <Notice>
              No active grades are configured for this group.
            </Notice>
          )}

          {grade && (
            <>
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground">
                  Salary range · AED
                </p>
                <p className="mt-1 text-lg font-semibold tabular-nums">
                  {salaryLabel(grade)}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField
                  id="find-arrangement"
                  label="Work / visa arrangement"
                  value={chosenArrangement}
                  onChange={(value) => {
                    setArrangement(value);
                    setFamily("");
                  }}
                  options={arrangements.map((value) => ({
                    value,
                    label: ARRANGEMENTS[value].label,
                  }))}
                />

                <SelectField
                  id="find-family"
                  label="Family status"
                  value={chosenFamily}
                  disabled={!chosenArrangement}
                  onChange={setFamily}
                  options={families.map((value) => ({
                    value,
                    label: FAMILIES[value],
                  }))}
                />
              </div>
            </>
          )}

          {result && (
            <section
              className="rounded-lg border border-primary/25 bg-primary/5 p-5 space-y-2"
              aria-live="polite"
            >
              <p className="text-xs text-muted-foreground">
                Matching grade code
              </p>
              <p className="font-mono text-2xl font-bold text-primary">
                {result.fullCode}
              </p>
              <p className="text-sm">{result.mainBenefits}</p>

              {group === "national" && (
                <p className="text-xs text-muted-foreground">
                  {PENSION_NOTE}
                </p>
              )}
            </section>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            disabled={!result}
            onClick={() => {
              if (result) onView(result);
            }}
          >
            View Full Details
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}