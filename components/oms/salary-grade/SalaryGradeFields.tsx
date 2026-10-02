"use client";

import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GROUPS } from "./salary-grade.data";
import type { DeploymentGroup } from "./salary-grade.types";
import styles from "./SalaryGrade.module.css";

export function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  disabled = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1.5 min-w-0">
      <Label htmlFor={id} className="text-xs font-medium">
        {label}
      </Label>

      <Select
        value={value}
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger id={id} className="w-full text-xs h-10">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>

        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function GroupChoices({
  value,
  onChange,
}: {
  value: DeploymentGroup | "";
  onChange: (group: DeploymentGroup) => void;
}) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold">
        Choose a deployment group
      </legend>

      <div className="grid gap-3 sm:grid-cols-3">
        {(Object.keys(GROUPS) as DeploymentGroup[]).map(
          (group) => (
            <button
              key={group}
              type="button"
              aria-pressed={value === group}
              onClick={() => onChange(group)}
              className={`${styles.choice} ${
                styles[GROUPS[group].colour]
              } text-sm font-semibold`}
            >
              <span
                className="mb-2 block size-2 rounded-full bg-current"
                aria-hidden="true"
              />
              {GROUPS[group].label}
            </button>
          ),
        )}
      </div>
    </fieldset>
  );
}

export function Notice({
  children,
  error = false,
}: {
  children: ReactNode;
  error?: boolean;
}) {
  return (
    <div
      role={error ? "alert" : "status"}
      className={`rounded-lg border p-3 text-xs leading-relaxed ${
        error
          ? "border-destructive/30 bg-destructive/5 text-destructive"
          : "border-primary/20 bg-primary/5 text-foreground"
      }`}
    >
      {children}
    </div>
  );
}