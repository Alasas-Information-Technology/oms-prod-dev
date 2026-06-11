import { Badge } from "@/components/ui/badge";

export const departmentBudgetColumns = [
  { key: "department", header: "Department", sortable: true },
  { key: "year", header: "Budget Year", sortable: true },
  { key: "allocated", header: "Allocated Amount" },
  { key: "committed", header: "Committed Amount" },
  { key: "available", header: "Available Amount" },
  { key: "utilization", header: "Utilization %" },
];

export const annualBudgetColumns = [
  { key: "year", header: "Financial Year", sortable: true },
  { key: "original", header: "Original Budget" },
  { key: "supplement", header: "Supplement Amount" },
  { key: "total", header: "Total Budget" },
  { key: "committed", header: "Committed Amount" },
  { key: "available", header: "Available Amount" },
  {
    key: "status",
    header: "Status",
    // render: (value: string) => (
    //   <Badge
    //     variant="outline"
    //     className={
    //       value === "Open"
    //         ? "bg-green-100 text-green-700 border-green-200"
    //         : "bg-red-100 text-red-700 border-red-200"
    //     }
    //   >
    //     {value}
    //   </Badge>
    // ),
  },
];
export const vendorAllocationColumns = [
  { key: "vendor", header: "Vendor Name", sortable: true },
  { key: "department", header: "Department", sortable: true },
  { key: "allocated", header: "Allocated Amount" },
  { key: "committed", header: "Committed Amount" },
  { key: "available", header: "Available Amount" },
  {
    key: "utilization",
    header: "Utilization %",
    // render: (value: unknown) => (
    //   <Badge
    //     variant="outline"
    //     className={
    //       parseInt(String(value)) >= 80
    //         ? "bg-red-100 text-red-700 border-red-200"
    //         : "bg-green-100 text-green-700 border-green-200"
    //     }
    //   >
    //     {String(value)}
    //   </Badge>
    // ),
  },
];

export const commitmentColumns = [
  { key: "id", header: "Commitment #" },
  { key: "request", header: "Request #" },
  { key: "department", header: "Department" },
  { key: "vendor", header: "Vendor" },
  { key: "original", header: "Original Amount" },
  { key: "released", header: "Released Amount" },
  { key: "active", header: "Active Amount" },
  {
    key: "status",
    header: "Status",
    // render: (value: unknown) => (
    //   <Badge
    //     variant="outline"
    //     className={
    //       value === "Active"
    //         ? "bg-green-100 text-green-700 border-green-200"
    //         : value === "Partially Released"
    //         ? "bg-yellow-100 text-yellow-700 border-yellow-200"
    //         : "bg-red-100 text-red-700 border-red-200"
    //     }
    //   >
    //     {String(value)}
    //   </Badge>
    // ),
  },
];


export const supplementColumns = [
  { key: "id", header: "Supplement #" },
  { key: "department", header: "Department" },
  { key: "vendor", header: "Vendor" },
  { key: "requested", header: "Requested Amount" },
  { key: "approved", header: "Approved Amount" },
  {
    key: "status",
    header: "Status",
    // render: (value: unknown) => (
    //   <Badge
    //     variant="outline"
    //     className={
    //       value === "Approved"
    //         ? "bg-green-100 text-green-700 border-green-200"
    //         : value === "Pending Approval"
    //         ? "bg-yellow-100 text-yellow-700 border-yellow-200"
    //         : value === "Draft"
    //         ? "bg-slate-100 text-slate-700 border-slate-200"
    //         : "bg-red-100 text-red-700 border-red-200"
    //     }
    //   >
    //     {String(value)}
    //   </Badge>
    // ),
  },
];

export const transferColumns = [
  { key: "id", header: "Transfer #" },
  { key: "source", header: "Source Department" },
  { key: "target", header: "Target Department" },
  { key: "amount", header: "Amount" },
  {
    key: "status",
    header: "Status",
    // render: (value: unknown) => (
    //   <Badge
    //     variant="outline"
    //     className={
    //       value === "Approved"
    //         ? "bg-green-100 text-green-700 border-green-200"
    //         : value === "Pending Approval"
    //         ? "bg-yellow-100 text-yellow-700 border-yellow-200"
    //         : value === "Draft"
    //         ? "bg-slate-100 text-slate-700 border-slate-200"
    //         : "bg-red-100 text-red-700 border-red-200"
    //     }
    //   >
    //     {String(value)}
    //   </Badge>
    // ),
  },
];