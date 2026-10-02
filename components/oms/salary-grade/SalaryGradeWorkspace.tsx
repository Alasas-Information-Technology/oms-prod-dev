"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  CircleCheck,
  CircleMinus,
  Layers,
  Plus,
  X,
} from "lucide-react";
import { usePageBarDispatch } from "@/components/ui/layouts/page-bar-context";
import { GradeDirectory } from "./GradeDirectory";
import { CreateGradeDialog } from "./CreateGradeDialog";
import { FindGradeDialog } from "./FindGradeDialog";
import { GradeDetailDialog } from "./GradeDetailDialog";
import { Notice } from "./SalaryGradeFields";
import { useSalaryGrades } from "./useSalaryGrades";
import type {
  DeploymentGroup,
  GradeRow,
} from "./salary-grade.types";
import styles from "./SalaryGrade.module.css";

export function SalaryGradeWorkspace() {
  const { setCustomCrumbs } = usePageBarDispatch();
  const { store, ready, storageError, create } =
    useSalaryGrades();

  const [findOpen, setFindOpen] = useState(false);
  const [createOptions, setCreateOptions] = useState<{
    gradeId?: string;
    group?: DeploymentGroup;
  } | null>(null);
  const [detail, setDetail] = useState<GradeRow | null>(null);
  const [message, setMessage] =
    useState<string | null>(null);

  useEffect(() => {
    setCustomCrumbs([
      { label: "Administration" },
      { label: "Salary & Grade", isCurrent: true },
    ]);

    return () => setCustomCrumbs(null);
  }, [setCustomCrumbs]);

  const active = store.grades.filter(
    (grade) => grade.active,
  ).length;

  const canCreate = ready && !storageError;

  function addConfiguration(row: GradeRow) {
    setDetail(null);
    setFindOpen(false);
    setCreateOptions({
      gradeId: row.grade.id,
      group: row.group,
    });
  }

  return (
    <div
      className={`${styles.workspace} min-h-full bg-background p-4 md:p-6`}
    >
      <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Salary & Grade
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Manage salary bands, work arrangements and family
              benefits.
            </p>
          </div>

          <span className="rounded-full border bg-card px-3 py-1 text-[11px] text-muted-foreground">
            Demo · saved in this browser
          </span>
        </div>

        {storageError && (
          <Notice error>{storageError}</Notice>
        )}

        {message && (
          <div
            role="status"
            className="flex items-center justify-between gap-3 rounded-lg border border-emerald-500/25 bg-emerald-500/5 px-4 py-3 text-xs"
          >
            <span>{message}</span>
            <button
              type="button"
              onClick={() => setMessage(null)}
              aria-label="Dismiss message"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        <div className={styles.cards}>
          <div className={styles.raised}>
            <div className="flex items-start gap-3">
              <Layers className="mt-1 size-7 shrink-0 text-primary" />
              <div>
                <p className="text-xs font-medium">
                  Total Grades
                </p>
                <p className="mt-2 text-3xl font-bold tabular-nums">
                  {ready ? store.grades.length : "—"}
                </p>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Across all staff categories
                </p>
              </div>
            </div>
          </div>

          <div
            className={`${styles.raised} ${styles.activeCard}`}
          >
            <div className="flex items-start gap-3">
              <CircleCheck className="mt-1 size-7 shrink-0 text-emerald-600" />
              <div>
                <p className="text-xs font-medium">
                  Active Grades
                </p>
                <p className="mt-2 text-3xl font-bold tabular-nums">
                  {ready ? active : "—"}
                </p>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Available for use
                </p>
              </div>
            </div>
          </div>

          <div
            className={`${styles.raised} ${styles.inactiveCard}`}
          >
            <div className="flex items-start gap-3">
              <CircleMinus className="mt-1 size-7 shrink-0 text-amber-600" />
              <div>
                <p className="text-xs font-medium">
                  Inactive Grades
                </p>
                <p className="mt-2 text-3xl font-bold tabular-nums">
                  {ready
                    ? store.grades.length - active
                    : "—"}
                </p>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Currently disabled
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            className={`${styles.raised} ${styles.addCard}`}
            disabled={!canCreate}
            onClick={() => {
              setMessage(null);
              setCreateOptions({});
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="flex size-9 items-center justify-center rounded-full border-2 border-white/90">
                <Plus className="size-6" />
              </span>
              <ArrowRight className="size-5" />
            </div>
            <p className="mt-3 text-sm font-semibold">
              Add New Grade
            </p>
            <p className="mt-1 text-[11px] text-white/80">
              Define a grade and its benefits
            </p>
          </button>
        </div>

        <GradeDirectory
          store={store}
          ready={ready}
          canCreate={Boolean(canCreate)}
          onFind={() => setFindOpen(true)}
          onView={setDetail}
          onAdd={addConfiguration}
        />

        {findOpen && (
          <FindGradeDialog
            store={store}
            onClose={() => setFindOpen(false)}
            onView={(row) => {
              setFindOpen(false);
              setDetail(row);
            }}
          />
        )}

        {createOptions && (
          <CreateGradeDialog
            store={store}
            initialGradeId={createOptions.gradeId}
            initialGroup={createOptions.group}
            onClose={() => setCreateOptions(null)}
            onSave={create}
            onSaved={(result) => {
              setCreateOptions(null);
              setMessage(
                `Saved ${result.added} new configuration${
                  result.added === 1 ? "" : "s"
                }. The directory and counts have been updated.`,
              );
            }}
          />
        )}

        <GradeDetailDialog
          row={detail}
          onClose={() => setDetail(null)}
          onAdd={addConfiguration}
        />
      </div>
    </div>
  );
}