"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, Pencil, Plus } from "lucide-react";

import { DataTable } from "@/components/shared/DataTable";
import type {
  ColumnDef,
  RowAction,
} from "@/components/shared/DataTable";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { usePageBarDispatch } from "@/components/ui/layouts/page-bar-context";

import styles from "./GradeMaster.module.css";

interface GradeMasterWorkspaceProps {
  embedded?: boolean;
}

interface GradeMasterRecord {
  grade_id: string;
  grade_code: string;
  grade_details: string;
}

interface GradeMasterStore {
  version: 1;
  grades: GradeMasterRecord[];
}

const STORAGE_KEY = "oms.grade-master.demo.v1";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function normaliseCode(value: string): string {
  return value.trim().toLowerCase();
}

function isObject(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function readGrades(): GradeMasterRecord[] {
  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (raw === null) {
    return [];
  }

  const parsed: unknown = JSON.parse(raw);

  if (
    !isObject(parsed) ||
    parsed.version !== 1 ||
    !Array.isArray(parsed.grades)
  ) {
    throw new Error("The saved Grade Master data is invalid.");
  }

  const grades: GradeMasterRecord[] = [];
  const usedIds = new Set<string>();
  const usedCodes = new Set<string>();

  for (const item of parsed.grades) {
    if (
      !isObject(item) ||
      typeof item.grade_id !== "string" ||
      typeof item.grade_code !== "string" ||
      typeof item.grade_details !== "string"
    ) {
      throw new Error("A saved grade contains invalid fields.");
    }

    const gradeId = item.grade_id;
    const gradeCode = item.grade_code.trim();
    const gradeDetails = item.grade_details.trim();

    const normalisedId = gradeId.toLowerCase();
    const normalisedCode = normaliseCode(gradeCode);

    if (
      !UUID_PATTERN.test(gradeId) ||
      !gradeCode ||
      !gradeDetails ||
      usedIds.has(normalisedId) ||
      usedCodes.has(normalisedCode)
    ) {
      throw new Error(
        "The saved Grade Master data contains invalid or duplicate records.",
      );
    }

    usedIds.add(normalisedId);
    usedCodes.add(normalisedCode);

    grades.push({
      grade_id: gradeId,
      grade_code: gradeCode,
      grade_details: gradeDetails,
    });
  }

  return grades;
}

function saveGrades(grades: GradeMasterRecord[]): void {
  const store: GradeMasterStore = {
    version: 1,
    grades,
  };

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(store),
  );
}

const columns: ColumnDef<GradeMasterRecord>[] = [
  {
    key: "grade_code",
    header: "Grade Code",
    sortable: true,
    width: "20%",
    render: (_value, row) => (
      <span className={styles.code}>{row.grade_code}</span>
    ),
  },
  {
    key: "grade_details",
    header: "Grade Details",
    sortable: true,
    width: "80%",
    render: (_value, row) => (
      <p className={styles.details}>{row.grade_details}</p>
    ),
  },
];

export function GradeMasterWorkspace({
  embedded = false,
}: GradeMasterWorkspaceProps) {
  const { setCustomCrumbs } = usePageBarDispatch();

  const [grades, setGrades] = useState<GradeMasterRecord[]>([]);
  const [ready, setReady] = useState(false);

  const [storageError, setStorageError] = useState<string | null>(
    null,
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [gradeCode, setGradeCode] = useState("");
  const [gradeDetails, setGradeDetails] = useState("");

  const [formError, setFormError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  useEffect(() => {
    if (embedded) {
      return;
    }

    setCustomCrumbs([
      { label: "Administration" },
      { label: "Salary & Grade" },
      { label: "Grade Master", isCurrent: true },
    ]);

    return () => {
      setCustomCrumbs(null);
    };
  }, [embedded, setCustomCrumbs]);

  useEffect(() => {
    function loadGrades() {
      try {
        setGrades(readGrades());
        setStorageError(null);
      } catch {
        setStorageError(
          "Grade Master could not load its saved data. Existing data has not been changed.",
        );
      } finally {
        setReady(true);
      }
    }

    function handleStorage(event: StorageEvent) {
      if (event.key === STORAGE_KEY || event.key === null) {
        loadGrades();
      }
    }

    loadGrades();

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  function openAdd() {
    setEditingId(null);
    setGradeCode("");
    setGradeDetails("");
    setFormError(null);
    setMessage(null);
    setDirty(false);
    setConfirmDiscard(false);
    setDialogOpen(true);
  }

  function openEdit(grade: GradeMasterRecord) {
    setEditingId(grade.grade_id);
    setGradeCode(grade.grade_code);
    setGradeDetails(grade.grade_details);
    setFormError(null);
    setMessage(null);
    setDirty(false);
    setConfirmDiscard(false);
    setDialogOpen(true);
  }

  function markChanged() {
    setDirty(true);
    setFormError(null);
    setConfirmDiscard(false);
  }

  function requestClose() {
    if (saving) {
      return;
    }

    if (dirty) {
      setConfirmDiscard(true);
      return;
    }

    setDialogOpen(false);
  }

  function discardChanges() {
    setDirty(false);
    setConfirmDiscard(false);
    setFormError(null);
    setDialogOpen(false);
  }

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving) {
      return;
    }

    setFormError(null);
    setConfirmDiscard(false);

    const code = gradeCode.trim();
    const details = gradeDetails.trim();

    if (!code) {
      setFormError("Please enter a grade code.");
      return;
    }

    if (!details) {
      setFormError("Please enter the grade details.");
      return;
    }

    if (!ready || storageError) {
      setFormError(
        "Grade Master is unavailable. Please reload the page and try again.",
      );
      return;
    }

    setSaving(true);

    try {
      const latestGrades = readGrades();

      const duplicate = latestGrades.find(
        (grade) =>
          grade.grade_id !== editingId &&
          normaliseCode(grade.grade_code) === normaliseCode(code),
      );

      if (duplicate) {
        setFormError(
          `Grade code "${duplicate.grade_code}" already exists. Use another code or edit the existing grade.`,
        );
        return;
      }

      let nextGrades: GradeMasterRecord[];

      if (editingId !== null) {
        const existingGrade = latestGrades.find(
          (grade) => grade.grade_id === editingId,
        );

        if (!existingGrade) {
          setFormError(
            "This grade no longer exists. Close the form and reload the page.",
          );
          return;
        }

        nextGrades = latestGrades.map((grade) =>
          grade.grade_id === editingId
            ? {
                ...grade,
                grade_code: code,
                grade_details: details,
              }
            : grade,
        );
      } else {
        const newGrade: GradeMasterRecord = {
          grade_id: window.crypto.randomUUID(),
          grade_code: code,
          grade_details: details,
        };

        nextGrades = [...latestGrades, newGrade];
      }

      saveGrades(nextGrades);
      setGrades(nextGrades);

      setMessage(
        editingId === null
          ? "Grade created successfully."
          : "Grade updated successfully.",
      );

      setDirty(false);
      setConfirmDiscard(false);
      setDialogOpen(false);
    } catch {
      setFormError(
        "The grade could not be saved. Your browser storage may be unavailable or the saved data may be invalid.",
      );
    } finally {
      setSaving(false);
    }
  }

  const canSave = ready && storageError === null;

  const rowActions: RowAction<GradeMasterRecord>[] = canSave
    ? [
        {
          label: "Edit Grade",
          icon: <Pencil className="h-4 w-4" />,
          onClick: openEdit,
        },
      ]
    : [];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.heading}>
          {!embedded && (
            <Link
              href="/app/administration/master-data/salary-grade"
              className={styles.backButton}
              aria-label="Back to Salary & Grade"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
          )}

          <h1 className={styles.title}>GRADE MASTER</h1>
        </div>

        <Button
          type="button"
          className={styles.primaryButton}
          onClick={openAdd}
          disabled={!canSave}
        >
          <span className={styles.plusCircle}>
            <Plus className="h-3.5 w-3.5" />
          </span>
          Add Grade
        </Button>
      </div>

      {storageError && (
        <div className={styles.errorNotice} role="alert">
          {storageError}
        </div>
      )}

      {message && (
        <div className={styles.successNotice} role="status">
          {message}
        </div>
      )}

      <DataTable<GradeMasterRecord>
        className={styles.table}
        columns={columns}
        data={grades}
        keyField="grade_id"
        loading={!ready}
        rowActions={rowActions}
        enableSearch
        searchPlaceholder="Search..."
        globalFilterFields={["grade_code", "grade_details"]}
        enableExport={false}
        pageSize={10}
        pageSizeOptions={[10, 20, 50]}
        emptyMessage={
          storageError
            ? "Grade Master data is unavailable."
            : "No grades found. Click Add Grade to create one."
        }
      />

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            requestClose();
          }
        }}
      >
        <DialogContent className={styles.popup}>
          <DialogHeader className={styles.popupHeader}>
            <DialogTitle className={styles.popupTitle}>
              {editingId === null ? "ADD GRADE" : "EDIT GRADE"}
            </DialogTitle>

            <DialogDescription className="sr-only">
              Enter the grade code and grade details, then save
              your changes.
            </DialogDescription>
          </DialogHeader>

          <form className={styles.form} onSubmit={handleSave}>
            <div className={styles.field}>
              <Label
                htmlFor="grade-master-code"
                className={styles.label}
              >
                Grade Code
              </Label>

              <Input
                id="grade-master-code"
                name="grade_code"
                className={styles.input}
                value={gradeCode}
                onChange={(event) => {
                  setGradeCode(event.target.value);
                  markChanged();
                }}
                autoComplete="off"
                disabled={saving}
                required
              />
            </div>

            <div className={styles.field}>
              <Label
                htmlFor="grade-master-details"
                className={styles.label}
              >
                Grade Details
              </Label>

              <Textarea
                id="grade-master-details"
                name="grade_details"
                className={styles.textarea}
                value={gradeDetails}
                onChange={(event) => {
                  setGradeDetails(event.target.value);
                  markChanged();
                }}
                rows={2}
                disabled={saving}
                required
              />
            </div>

            {formError && (
              <div className={styles.formError} role="alert">
                {formError}
              </div>
            )}

            {confirmDiscard && (
              <div className={styles.discardNotice} role="alert">
                You have unsaved changes. Do you want to discard
                them?

                <div className={styles.discardActions}>
                  <Button
                    type="button"
                    variant="outline"
                    className={styles.secondaryButton}
                    onClick={() => setConfirmDiscard(false)}
                  >
                    Keep Editing
                  </Button>

                  <Button
                    type="button"
                    variant="destructive"
                    onClick={discardChanges}
                  >
                    Discard Changes
                  </Button>
                </div>
              </div>
            )}

            <div className={styles.formFooter}>
              <Button
                type="submit"
                className={`${styles.primaryButton} ${styles.saveButton}`}
                disabled={saving || !canSave}
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}