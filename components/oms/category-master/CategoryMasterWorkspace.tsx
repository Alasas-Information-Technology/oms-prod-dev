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

import styles from "./CategoryMaster.module.css";

interface CategoryMasterWorkspaceProps {
  embedded?: boolean;
}

interface CategoryMasterRecord {
  category_id: string;
  cat_code: string;
  cat_details: string;
}

interface CategoryMasterStore {
  version: 1;
  categories: CategoryMasterRecord[];
}

const STORAGE_KEY = "oms.category-master.demo.v1";

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

function readCategories(): CategoryMasterRecord[] {
  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (raw === null) {
    return [];
  }

  const parsed: unknown = JSON.parse(raw);

  if (
    !isObject(parsed) ||
    parsed.version !== 1 ||
    !Array.isArray(parsed.categories)
  ) {
    throw new Error("The saved Category Master data is invalid.");
  }

  const categories: CategoryMasterRecord[] = [];
  const usedIds = new Set<string>();
  const usedCodes = new Set<string>();

  for (const item of parsed.categories) {
    if (
      !isObject(item) ||
      typeof item.category_id !== "string" ||
      typeof item.cat_code !== "string" ||
      typeof item.cat_details !== "string"
    ) {
      throw new Error("A saved category contains invalid fields.");
    }

    const categoryId = item.category_id;
    const categoryCode = item.cat_code.trim();
    const categoryDetails = item.cat_details.trim();

    const normalisedId = categoryId.toLowerCase();
    const normalisedCode = normaliseCode(categoryCode);

    if (
      !UUID_PATTERN.test(categoryId) ||
      !categoryCode ||
      !categoryDetails ||
      usedIds.has(normalisedId) ||
      usedCodes.has(normalisedCode)
    ) {
      throw new Error(
        "The saved Category Master data contains invalid or duplicate records.",
      );
    }

    usedIds.add(normalisedId);
    usedCodes.add(normalisedCode);

    categories.push({
      category_id: categoryId,
      cat_code: categoryCode,
      cat_details: categoryDetails,
    });
  }

  return categories;
}

function saveCategories(
  categories: CategoryMasterRecord[],
): void {
  const store: CategoryMasterStore = {
    version: 1,
    categories,
  };

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(store),
  );
}

const columns: ColumnDef<CategoryMasterRecord>[] = [
  {
    key: "cat_code",
    header: "Category Code",
    sortable: true,
    width: "25%",
    render: (_value, row) => (
      <span className={styles.code}>{row.cat_code}</span>
    ),
  },
  {
    key: "cat_details",
    header: "Category Details",
    sortable: true,
    width: "75%",
    render: (_value, row) => (
      <p className={styles.details}>{row.cat_details}</p>
    ),
  },
];

export function CategoryMasterWorkspace({
  embedded = false,
}: CategoryMasterWorkspaceProps) {
  const { setCustomCrumbs } = usePageBarDispatch();

  const [categories, setCategories] = useState<
    CategoryMasterRecord[]
  >([]);

  const [ready, setReady] = useState(false);

  const [storageError, setStorageError] = useState<string | null>(
    null,
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [categoryCode, setCategoryCode] = useState("");
  const [categoryDetails, setCategoryDetails] = useState("");

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
      { label: "Category Master", isCurrent: true },
    ]);

    return () => {
      setCustomCrumbs(null);
    };
  }, [embedded, setCustomCrumbs]);

  useEffect(() => {
    function loadCategories() {
      try {
        setCategories(readCategories());
        setStorageError(null);
      } catch {
        setStorageError(
          "Category Master could not load its saved data. Existing data has not been changed.",
        );
      } finally {
        setReady(true);
      }
    }

    function handleStorage(event: StorageEvent) {
      if (event.key === STORAGE_KEY || event.key === null) {
        loadCategories();
      }
    }

    loadCategories();

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  function openAdd() {
    setEditingId(null);
    setCategoryCode("");
    setCategoryDetails("");
    setFormError(null);
    setMessage(null);
    setDirty(false);
    setConfirmDiscard(false);
    setDialogOpen(true);
  }

  function openEdit(category: CategoryMasterRecord) {
    setEditingId(category.category_id);
    setCategoryCode(category.cat_code);
    setCategoryDetails(category.cat_details);
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

    const code = categoryCode.trim();
    const details = categoryDetails.trim();

    if (!code) {
      setFormError("Please enter a category code.");
      return;
    }

    if (!details) {
      setFormError("Please enter the category details.");
      return;
    }

    if (!ready || storageError) {
      setFormError(
        "Category Master is unavailable. Please reload the page and try again.",
      );
      return;
    }

    setSaving(true);

    try {
      const latestCategories = readCategories();

      const duplicate = latestCategories.find(
        (category) =>
          category.category_id !== editingId &&
          normaliseCode(category.cat_code) === normaliseCode(code),
      );

      if (duplicate) {
        setFormError(
          `Category code "${duplicate.cat_code}" already exists. Use another code or edit the existing category.`,
        );
        return;
      }

      let nextCategories: CategoryMasterRecord[];

      if (editingId !== null) {
        const existingCategory = latestCategories.find(
          (category) => category.category_id === editingId,
        );

        if (!existingCategory) {
          setFormError(
            "This category no longer exists. Close the form and reload the page.",
          );
          return;
        }

        nextCategories = latestCategories.map((category) =>
          category.category_id === editingId
            ? {
                ...category,
                cat_code: code,
                cat_details: details,
              }
            : category,
        );
      } else {
        const newCategory: CategoryMasterRecord = {
          category_id: window.crypto.randomUUID(),
          cat_code: code,
          cat_details: details,
        };

        nextCategories = [...latestCategories, newCategory];
      }

      saveCategories(nextCategories);
      setCategories(nextCategories);

      setMessage(
        editingId === null
          ? "Category created successfully."
          : "Category updated successfully.",
      );

      setDirty(false);
      setConfirmDiscard(false);
      setDialogOpen(false);
    } catch {
      setFormError(
        "The category could not be saved. Your browser storage may be unavailable or the saved data may be invalid.",
      );
    } finally {
      setSaving(false);
    }
  }

  const canSave = ready && storageError === null;

  const rowActions: RowAction<CategoryMasterRecord>[] = canSave
    ? [
        {
          label: "Edit Category",
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

          <h1 className={styles.title}>CATEGORY MASTER</h1>
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
          Add Category
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

      <DataTable<CategoryMasterRecord>
        className={styles.table}
        columns={columns}
        data={categories}
        keyField="category_id"
        loading={!ready}
        rowActions={rowActions}
        enableSearch
        searchPlaceholder="Search..."
        globalFilterFields={["cat_code", "cat_details"]}
        enableExport={false}
        pageSize={10}
        pageSizeOptions={[10, 20, 50]}
        emptyMessage={
          storageError
            ? "Category Master data is unavailable."
            : "No categories found. Click Add Category to create one."
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
              {editingId === null ? "ADD CATEGORY" : "EDIT CATEGORY"}
            </DialogTitle>

            <DialogDescription className="sr-only">
              Enter the category code and category details, then
              save your changes.
            </DialogDescription>
          </DialogHeader>

          <form className={styles.form} onSubmit={handleSave}>
            <div className={styles.field}>
              <Label
                htmlFor="category-master-code"
                className={styles.label}
              >
                Category Code
              </Label>

              <Input
                id="category-master-code"
                name="cat_code"
                className={styles.input}
                value={categoryCode}
                onChange={(event) => {
                  setCategoryCode(event.target.value);
                  markChanged();
                }}
                autoComplete="off"
                disabled={saving}
                required
              />
            </div>

            <div className={styles.field}>
              <Label
                htmlFor="category-master-details"
                className={styles.label}
              >
                Category Details
              </Label>

              <Textarea
                id="category-master-details"
                name="cat_details"
                className={styles.textarea}
                value={categoryDetails}
                onChange={(event) => {
                  setCategoryDetails(event.target.value);
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