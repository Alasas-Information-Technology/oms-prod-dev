"use client";

import { useMemo, useState } from "react";
import { Eye, Plus, Search } from "lucide-react";
import {
  DataTable,
  type ColumnDef,
  type RowAction,
} from "@/components/shared/DataTable";
import { TabsButton } from "@/components/shared/TabsButton";
import { Button } from "@/components/ui/button";
import {
  ARRANGEMENTS,
  CATEGORIES,
  GROUPS,
} from "./salary-grade.data";
import {
  rowsFor,
  salaryLabel,
} from "./salary-grade.utils";
import { SelectField } from "./SalaryGradeFields";
import type {
  GradeRow,
  GradeStore,
  GroupFilter,
} from "./salary-grade.types";
import styles from "./SalaryGrade.module.css";

export type GradeStatusFilter =
  | "all"
  | "active"
  | "inactive";

interface Props {
  store: GradeStore;
  ready: boolean;
  canCreate: boolean;
  statusFilter: GradeStatusFilter;
  onFind: () => void;
  onView: (row: GradeRow) => void;
  onAdd: (row: GradeRow) => void;
}

export function GradeDirectory({
  store,
  ready,
  canCreate,
  statusFilter,
  onFind,
  onView,
  onAdd,
}: Props) {
  const [group, setGroup] =
    useState<GroupFilter>("all");
  const [category, setCategory] = useState("all");

  const allRows = useMemo(
    () => rowsFor(store),
    [store],
  );

  // Card status and category filters apply to every group tab.
  const filteredRows = useMemo(
    () =>
      allRows.filter((row) => {
        const categoryMatches =
          category === "all" ||
          row.grade.category === category;

        const statusMatches =
          statusFilter === "all" ||
          (statusFilter === "active"
            ? row.grade.active
            : !row.grade.active);

        return categoryMatches && statusMatches;
      }),
    [allRows, category, statusFilter],
  );

  const rows = useMemo(
    () =>
      filteredRows.filter(
        (row) => group === "all" || row.group === group,
      ),
    [filteredRows, group],
  );

  const columns = useMemo<ColumnDef<GradeRow>[]>(
    () => [
      {
        key: "fullCode",
        header: "Grade code",
        sortable: true,
        width: "15%",
        render: (_, row) => (
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-semibold text-foreground">
              {row.fullCode}
            </p>

            <span
              className={`flex items-center gap-1.5 text-xs ${
                styles[GROUPS[row.group].colour]
              }`}
            >
              <span
                className="size-1.5 shrink-0 rounded-full bg-current"
                aria-hidden="true"
              />
              {GROUPS[row.group].label}
            </span>
          </div>
        ),
      },
      {
        key: "designation",
        header: "Designation / category",
        sortable: true,
        width: "23%",
        render: (_, row) => (
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-medium text-foreground">
              {row.designation}
            </p>

            <p className="text-xs text-muted-foreground">
              {row.grade.category}
            </p>
          </div>
        ),
      },
      {
        key: "salaryMinFils",
        header: "Salary range (AED)",
        sortable: true,
        align: "right",
        width: "17%",
        render: (_, row) => (
          <span className="text-sm font-semibold tabular-nums">
            {salaryLabel(row.grade)}
          </span>
        ),
      },
      {
        key: "familyLabel",
        header: "Family status",
        sortable: true,
        width: "15%",
        render: (_, row) => (
          <span className="text-sm">
            {row.familyLabel}
          </span>
        ),
      },
      {
        key: "mainBenefits",
        header: "Benefits / arrangement",
        width: "22%",
        render: (_, row) => (
          <div className="space-y-1">
            <p className="text-sm">
              {row.mainBenefits}
            </p>

            <p className="text-xs text-muted-foreground">
              {ARRANGEMENTS[row.arrangementId].label}
            </p>
          </div>
        ),
      },
      {
        key: "status",
        header: "Status",
        width: "8%",
        render: (_, row) => (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${
              row.grade.active
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <span
              className="size-1.5 shrink-0 rounded-full bg-current"
              aria-hidden="true"
            />
            {row.grade.active ? "Active" : "Inactive"}
          </span>
        ),
      },
    ],
    [],
  );

  const actions: RowAction<GradeRow>[] = [
    {
      label: "View Full Details",
      icon: <Eye className="size-3.5" />,
      onClick: onView,
    },
    ...(canCreate
      ? [
          {
            label: "Add Configuration",
            icon: <Plus className="size-3.5" />,
            onClick: onAdd,
          },
        ]
      : []),
  ];

  const tabs: Array<{
    value: GroupFilter;
    label: string;
    badge: number;
  }> = [
    {
      value: "all",
      label: "All",
      badge: filteredRows.length,
    },
    {
      value: "onsite",
      label: GROUPS.onsite.label,
      badge: filteredRows.filter(
        (row) => row.group === "onsite",
      ).length,
    },
    {
      value: "offsite",
      label: GROUPS.offsite.label,
      badge: filteredRows.filter(
        (row) => row.group === "offsite",
      ).length,
    },
    {
      value: "national",
      label: GROUPS.national.label,
      badge: filteredRows.filter(
        (row) => row.group === "national",
      ).length,
    },
  ];

  return (
    <section
      aria-label="Grade directory"
      className="min-w-0 space-y-3"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 space-y-3">
          <h2 className="text-sm font-bold text-foreground">
            Grade Directory
          </h2>

          <div className={styles.groupTabs}>
            <TabsButton<GroupFilter>
              tabs={tabs}
              value={group}
              onValueChange={setGroup}
              size="sm"
            />
          </div>
        </div>

        <div className="flex w-full flex-wrap items-end gap-3 lg:w-auto">
          <Button
            variant="outline"
            className="h-10 w-full gap-2 border-primary/35 text-primary sm:w-80"
            onClick={onFind}
            disabled={!ready}
          >
            <Search className="size-4" />
            Find a Grade
          </Button>

          <div className="w-full sm:w-48">
            <SelectField
              id="directory-category"
              label="Staff category"
              value={category}
              onChange={setCategory}
              options={[
                {
                  value: "all",
                  label: "All categories",
                },
                ...CATEGORIES.map((value) => ({
                  value,
                  label: value,
                })),
              ]}
            />
          </div>
        </div>
      </div>

      <div className={styles.directory}>
        <DataTable<GradeRow>
          key={`${group}:${category}:${statusFilter}`}
          columns={columns}
          data={rows}
          keyField="id"
          loading={!ready}
          pageSize={10}
          pageSizeOptions={[10, 20, 50]}
          enableSearch={false}
          enableExport={false}
          rowActions={actions}
          onRowClick={onView}
          emptyMessage={
            statusFilter === "inactive"
              ? "No inactive grade configurations match these filters."
              : statusFilter === "active"
                ? "No active grade configurations match these filters."
                : "No grade configurations match these filters."
          }
        />
      </div>
    </section>
  );
}