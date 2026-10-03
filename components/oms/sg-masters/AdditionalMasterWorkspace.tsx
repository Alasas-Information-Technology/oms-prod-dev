"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Pencil, Plus } from "lucide-react";

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

import styles from "@/components/oms/category-master/CategoryMaster.module.css";

type MasterKind = "deployment" | "designation";

interface MasterRecord {
  id: string;
  code: string;
  name: string;
  details: string;
}

interface MasterConfig {
  title: string;
  singular: string;
  codeLabel: string;
  detailsLabel: string;
  storageKey: string;
}

const CONFIG: Record<MasterKind, MasterConfig> = {
  deployment: {
    title: "DEPLOYMENT MODEL",
    singular: "Deployment Model",
    codeLabel: "Deployment Code",
    detailsLabel: "Work Settings",
    storageKey: "oms.deployment-model.demo.v1",
  },
  designation: {
    title: "DESIGNATION MASTER",
    singular: "Designation",
    codeLabel: "Designation Code",
    detailsLabel: "Summary",
    storageKey: "oms.designation-master.demo.v1",
  },
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function normalise(value: string) {
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

function readRecords(storageKey: string): MasterRecord[] {
  const raw = window.localStorage.getItem(storageKey);

  if (raw === null) return [];

  const parsed: unknown = JSON.parse(raw);

  if (
    !isObject(parsed) ||
    parsed.version !== 1 ||
    !Array.isArray(parsed.records)
  ) {
    throw new Error("Invalid saved data.");
  }

  const records: MasterRecord[] = [];
  const ids = new Set<string>();
  const codes = new Set<string>();

  for (const item of parsed.records) {
    if (
      !isObject(item) ||
      typeof item.id !== "string" ||
      typeof item.code !== "string" ||
      typeof item.name !== "string" ||
      typeof item.details !== "string"
    ) {
      throw new Error("Invalid record.");
    }

    const record: MasterRecord = {
      id: item.id,
      code: item.code.trim(),
      name: item.name.trim(),
      details: item.details.trim(),
    };

    const id = record.id.toLowerCase();
    const code = normalise(record.code);

    if (
      !UUID_PATTERN.test(record.id) ||
      !record.code ||
      !record.name ||
      !record.details ||
      ids.has(id) ||
      codes.has(code)
    ) {
      throw new Error("Invalid or duplicate record.");
    }

    ids.add(id);
    codes.add(code);
    records.push(record);
  }

  return records;
}

export function AdditionalMasterWorkspace({
  kind,
}: {
  kind: MasterKind;
}) {
  const config = CONFIG[kind];

  const [records, setRecords] = useState<MasterRecord[]>([]);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(
    null,
  );

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [details, setDetails] = useState("");

  const [dirty, setDirty] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    function load() {
      try {
        setRecords(readRecords(config.storageKey));
        setStorageError(null);
      } catch {
        setStorageError(
          "Saved data could not be loaded. Existing data has not been changed.",
        );
      } finally {
        setReady(true);
      }
    }

    function onStorage(event: StorageEvent) {
      if (
        event.key === config.storageKey ||
        event.key === null
      ) {
        load();
      }
    }

    load();
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("storage", onStorage);
    };
  }, [config.storageKey]);

  const columns: ColumnDef<MasterRecord>[] = [
    {
      key: "code",
      header: config.codeLabel,
      width: "25%",
      sortable: true,
      render: (_value, row) => (
        <span className={styles.code}>{row.code}</span>
      ),
    },
    {
      key: "name",
      header: "Name",
      width: "30%",
      sortable: true,
      render: (_value, row) => (
        <p className={styles.details}>{row.name}</p>
      ),
    },
    {
      key: "details",
      header: config.detailsLabel,
      width: "45%",
      sortable: true,
      render: (_value, row) => (
        <p className={styles.details}>{row.details}</p>
      ),
    },
  ];

  function openForm(record?: MasterRecord) {
    setEditingId(record?.id ?? null);
    setCode(record?.code ?? "");
    setName(record?.name ?? "");
    setDetails(record?.details ?? "");
    setError(null);
    setMessage(null);
    setDirty(false);
    setConfirmDiscard(false);
    setOpen(true);
  }

  function markChanged() {
    setDirty(true);
    setError(null);
    setConfirmDiscard(false);
  }

  function requestClose() {
    if (saving) return;

    if (dirty) {
      setConfirmDiscard(true);
      return;
    }

    setOpen(false);
  }

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    setError(null);
    setConfirmDiscard(false);

    const cleanCode = code.trim();
    const cleanName = name.trim();
    const cleanDetails = details.trim();

    if (!cleanCode || !cleanName || !cleanDetails) {
      setError("Please complete all three fields.");
      return;
    }

    if (!ready || storageError) {
      setError("Saved data is unavailable. Reload the page.");
      return;
    }

    setSaving(true);

    try {
      const latest = readRecords(config.storageKey);

      const duplicate = latest.find(
        (record) =>
          record.id !== editingId &&
          normalise(record.code) === normalise(cleanCode),
      );

      if (duplicate) {
        setError(
          `Code "${duplicate.code}" already exists for "${duplicate.name}". Use another code or edit that record.`,
        );
        return;
      }

      if (
        editingId !== null &&
        !latest.some((record) => record.id === editingId)
      ) {
        setError(
          "This record no longer exists. Close the form and reload the page.",
        );
        return;
      }

      const savedRecord: MasterRecord = {
        id: editingId ?? window.crypto.randomUUID(),
        code: cleanCode,
        name: cleanName,
        details: cleanDetails,
      };

      const nextRecords =
        editingId === null
          ? [...latest, savedRecord]
          : latest.map((record) =>
              record.id === editingId ? savedRecord : record,
            );

      window.localStorage.setItem(
        config.storageKey,
        JSON.stringify({
          version: 1,
          records: nextRecords,
        }),
      );

      setRecords(nextRecords);
      setMessage(
        `${config.singular} ${
          editingId === null ? "created" : "updated"
        } successfully.`,
      );

      setDirty(false);
      setOpen(false);
    } catch {
      setError(
        "Could not save the record. Browser storage may be unavailable or the saved data may be invalid.",
      );
    } finally {
      setSaving(false);
    }
  }

  const available = ready && storageError === null;

  const rowActions: RowAction<MasterRecord>[] = available
    ? [
        {
          label: `Edit ${config.singular}`,
          icon: <Pencil className="h-4 w-4" />,
          onClick: (record) => openForm(record),
        },
      ]
    : [];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.heading}>
          <h1 className={styles.title}>{config.title}</h1>
        </div>

        <Button
          type="button"
          className={styles.primaryButton}
          onClick={() => openForm()}
          disabled={!available}
        >
          <span className={styles.plusCircle}>
            <Plus className="h-3.5 w-3.5" />
          </span>
          Add {config.singular}
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

      <DataTable<MasterRecord>
        className={styles.table}
        columns={columns}
        data={records}
        keyField="id"
        loading={!ready}
        rowActions={rowActions}
        enableSearch
        searchPlaceholder="Search..."
        globalFilterFields={["code", "name", "details"]}
        enableExport={false}
        pageSize={10}
        pageSizeOptions={[10, 20, 50]}
        emptyMessage={
          storageError
            ? "Saved data is unavailable."
            : `No records found. Click Add ${config.singular} to create one.`
        }
      />

      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) requestClose();
        }}
      >
        <DialogContent className={styles.popup}>
          <DialogHeader className={styles.popupHeader}>
            <DialogTitle className={styles.popupTitle}>
              {editingId === null ? "ADD" : "EDIT"}{" "}
              {config.singular.toUpperCase()}
            </DialogTitle>

            <DialogDescription className="sr-only">
              Complete the three fields and save your changes.
            </DialogDescription>
          </DialogHeader>

          <form className={styles.form} onSubmit={handleSave}>
            <div className={styles.field}>
              <Label
                htmlFor={`${kind}-code`}
                className={styles.label}
              >
                {config.codeLabel}
              </Label>

              <Input
                id={`${kind}-code`}
                className={styles.input}
                value={code}
                onChange={(event) => {
                  setCode(event.target.value);
                  markChanged();
                }}
                autoComplete="off"
                disabled={saving}
                required
              />
            </div>

            <div className={styles.field}>
              <Label
                htmlFor={`${kind}-name`}
                className={styles.label}
              >
                Name
              </Label>

              <Input
                id={`${kind}-name`}
                className={styles.input}
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  markChanged();
                }}
                autoComplete="off"
                disabled={saving}
                required
              />
            </div>

            <div className={styles.field}>
              <Label
                htmlFor={`${kind}-details`}
                className={styles.label}
              >
                {config.detailsLabel}
              </Label>

              <Textarea
                id={`${kind}-details`}
                className={styles.textarea}
                value={details}
                onChange={(event) => {
                  setDetails(event.target.value);
                  markChanged();
                }}
                rows={3}
                disabled={saving}
                required
              />
            </div>

            {error && (
              <div className={styles.formError} role="alert">
                {error}
              </div>
            )}

            {confirmDiscard && (
              <div className={styles.discardNotice} role="alert">
                You have unsaved changes. Discard them?

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
                    onClick={() => {
                      setDirty(false);
                      setConfirmDiscard(false);
                      setOpen(false);
                    }}
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
                disabled={saving || !available}
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