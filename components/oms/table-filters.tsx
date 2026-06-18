"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type StatusFilterProps = {
  value: string;
  onChange: (value: string) => void;
  options: string[];
};

export function StatusFilter({ value, onChange, options }: StatusFilterProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 w-[160px]">
        <SelectValue placeholder="Status" />
      </SelectTrigger>

      <SelectContent>
        <SelectItem value="all">All Status</SelectItem>

        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function DepartmentFilter({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 w-[160px]"><SelectValue placeholder="Department" /></SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Departments</SelectItem>
        <SelectItem value="IT">IT</SelectItem>
        <SelectItem value="HR">HR</SelectItem>
        <SelectItem value="Finance">Finance</SelectItem>
        <SelectItem value="Operations">Operations</SelectItem>
        <SelectItem value="Procurement">Procurement</SelectItem>
      </SelectContent>
    </Select>
  );
}

export function YearFilter({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 w-[140px]"><SelectValue placeholder="Year" /></SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Years</SelectItem>
        <SelectItem value="2026">2026</SelectItem>
        <SelectItem value="2025">2025</SelectItem>
        <SelectItem value="2024">2024</SelectItem>
      </SelectContent>
    </Select>
  );
}