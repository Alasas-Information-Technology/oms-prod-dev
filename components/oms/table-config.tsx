import { Badge } from "@/components/ui/badge";

export const departmentBudgetColumns = [
  { key: "department", header: "Department", sortable: true },
  { key: "year", header: "Budget Year", sortable: true },
  { key: "allocated", header: "Allocated Amount" },
  { key: "committed", header: "Committed Amount" },
  { key: "available", header: "Available Amount" },
  {
    key: "utilization", header: "Utilization %", render: (value: unknown) => {
    const percentage = parseInt(String(value).replace("%", ""));

    return (
      <Badge
        variant="outline"
        className={
          percentage >= 80
            ? "bg-red-100 text-red-700 border-red-200"
            : "bg-green-100 text-green-700 border-green-200"
        }
      >
        {String(value)}
      </Badge>
    );
  },
  },
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
    render: (value: unknown) => {

      console.log(value);
      return (
        <Badge
          variant="outline"
          className={
            value === "Open"
              ? "bg-green-100 text-green-700 border-green-200"
              : "bg-red-100 text-red-700 border-red-200"
          }
        >
          {String(value)}
        </Badge>
      )
    },
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
    render: (value: unknown) => {
    const percentage = parseInt(String(value).replace("%", ""));

    return (
      <Badge
        variant="outline"
        className={
          percentage >= 80
            ? "bg-red-100 text-red-700 border-red-200"
            : "bg-green-100 text-green-700 border-green-200"
        }
      >
        {String(value)}
      </Badge>
    );
  },
},
]

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
    render: (value: unknown) => (
      <Badge
        variant="outline"
        className={
          value === "Active"
            ? "bg-green-100 text-green-700 border-green-200"
            : value === "Partially Released"
              ? "bg-yellow-100 text-yellow-700 border-yellow-200"
              : "bg-red-100 text-red-700 border-red-200"
        }
      >
        {String(value)}
      </Badge>
    ),
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
    render: (value: unknown) => (
      <Badge
        variant="outline"
        className={
          value === "Approved"
            ? "bg-green-100 text-green-700 border-green-200"
            : value === "Pending Approval"
              ? "bg-yellow-100 text-yellow-700 border-yellow-200"
              : value === "Draft"
                ? "bg-slate-100 text-slate-700 border-slate-200"
                : "bg-red-100 text-red-700 border-red-200"
        }
      >
        {String(value)}
      </Badge>
    ),
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
    render: (value: unknown) => (
      <Badge
        variant="outline"
        className={
          value === "Approved"
            ? "bg-green-100 text-green-700 border-green-200"
            : value === "Pending Approval"
              ? "bg-yellow-100 text-yellow-700 border-yellow-200"
              : value === "Draft"
                ? "bg-slate-100 text-slate-700 border-slate-200"
                : "bg-red-100 text-red-700 border-red-200"
        }
      >
        {String(value)}
      </Badge>
    ),
  },
];

export const requisitionColumns = [
  { key: "requestNo", header: "Request #" },
  { key: "department", header: "Department" },
  { key: "vendor", header: "Vendor" },
  { key: "requestedAmount", header: "Requested Amount" },
  { key: "approvedAmount", header: "Approved Amount" },
  {
    key: "status", header: "Status", render: (value: unknown) => (
      <Badge
        variant="outline"
        className={
          value === "Approved"
            ? "bg-green-100 text-green-700 border-green-200"
            : value === "Pending" || value === "Pending Approval"
              ? "bg-yellow-100 text-yellow-700 border-yellow-200"
              : value === "Draft"
                ? "bg-slate-100 text-slate-700 border-slate-200"
                : value === "Clarification Required"
                  ? "bg-blue-100 text-blue-700 border-blue-200"
                  : value === "Resolved"
                    ? "bg-green-100 text-green-700 border-green-200"
                    : value === "Pending Response"
                      ? "bg-orange-100 text-orange-700 border-orange-200"
                      : "bg-red-100 text-red-700 border-red-200"
        }
      >
        {String(value)}
      </Badge>
    ),
  },
  { key: "requestDate", header: "Request Date" }

]


export const myRequisitionColumns = [
  { key: "requestNo", header: "Request #" },
  { key: "position", header: "Position" },
  { key: "department", header: "Department" },
  { key: "budget", header: "Budget" },
  {
    key: "status", header: "Status", render: (value: unknown) => (
      <Badge
        variant="outline"
        className={
          value === "Approved"
            ? "bg-green-100 text-green-700 border-green-200"
            : value === "Pending" || value === "Pending Approval"
              ? "bg-yellow-100 text-yellow-700 border-yellow-200"
              : value === "Draft"
                ? "bg-slate-100 text-slate-700 border-slate-200"
                : value === "Clarification Required"
                  ? "bg-blue-100 text-blue-700 border-blue-200"
                  : value === "Resolved"
                    ? "bg-green-100 text-green-700 border-green-200"
                    : value === "Pending Response"
                      ? "bg-orange-100 text-orange-700 border-orange-200"
                      : "bg-red-100 text-red-700 border-red-200"
        }
      >
        {String(value)}
      </Badge>
    ),
  },
  { key: "submittedDate", header: "Submitted Date" },
];

export const pendingApprovalColumns = [
  { key: "requestNo", header: "Request #" },
  { key: "requestor", header: "Requestor" },
  { key: "department", header: "Department" },
  { key: "position", header: "Position" },
  { key: "amount", header: "Amount" },
  { key: "submittedDate", header: "Submitted Date" },
  {
    key: "status", header: "Status", render: (value: unknown) => (
      <Badge
        variant="outline"
        className={
          value === "Approved"
            ? "bg-green-100 text-green-700 border-green-200"
            : value === "Pending" || value === "Pending Approval"
              ? "bg-yellow-100 text-yellow-700 border-yellow-200"
              : value === "Draft"
                ? "bg-slate-100 text-slate-700 border-slate-200"
                : value === "Clarification Required"
                  ? "bg-blue-100 text-blue-700 border-blue-200"
                  : value === "Resolved"
                    ? "bg-green-100 text-green-700 border-green-200"
                    : value === "Pending Response"
                      ? "bg-orange-100 text-orange-700 border-orange-200"
                      : "bg-red-100 text-red-700 border-red-200"
        }
      >
        {String(value)}
      </Badge>
    ),
  },
];

export const draftColumns = [
  { key: "draftNo", header: "Draft #" },
  { key: "position", header: "Position" },
  { key: "department", header: "Department" },
  { key: "budget", header: "Budget" },
  { key: "lastModified", header: "Last Modified" },
  {
    key: "status", header: "Status", render: (value: unknown) => (
      <Badge
        variant="outline"
        className={
          value === "Ready"
            ? "bg-green-100 text-green-700 border-green-200"
            : "bg-red-100 text-red-700 border-red-200"
        }
      >
        {String(value)}
      </Badge>
    ),
  },
];

export const clarificationColumns = [
  { key: "requestNo", header: "Request #" },
  { key: "returnedBy", header: "Returned By" },
  { key: "department", header: "Department" },
  { key: "reason", header: "Reason" },
  { key: "returnedDate", header: "Returned Date" },
  {
    key: "status", header: "Status", render: (value: unknown) => (
      <Badge
        variant="outline"
        className={
          value === "Approved"
            ? "bg-green-100 text-green-700 border-green-200"
            : value === "Pending" || value === "Pending Approval"
              ? "bg-yellow-100 text-yellow-700 border-yellow-200"
              : value === "Draft"
                ? "bg-slate-100 text-slate-700 border-slate-200"
                : value === "Clarification Required"
                  ? "bg-blue-100 text-blue-700 border-blue-200"
                  : value === "Resolved"
                    ? "bg-green-100 text-green-700 border-green-200"
                    : value === "Pending Response"
                      ? "bg-orange-100 text-orange-700 border-orange-200"
                      : "bg-red-100 text-red-700 border-red-200"
        }
      >
        {String(value)}
      </Badge>
    ),
  },
];

export const allRequisitionColumns = [
  { key: "requestNo", header: "Request #" },
  { key: "requestor", header: "Requestor" },
  { key: "position", header: "Position" },
  { key: "department", header: "Department" },
  { key: "budget", header: "Budget" },
  {
    key: "status", header: "Status", render: (value: unknown) => (
      <Badge
        variant="outline"
        className={
          value === "Approved"
            ? "bg-green-100 text-green-700 border-green-200"
            : value === "Pending" || value === "Pending Approval"
              ? "bg-yellow-100 text-yellow-700 border-yellow-200"
              : value === "Draft"
                ? "bg-slate-100 text-slate-700 border-slate-200"
                : value === "Clarification Required"
                  ? "bg-blue-100 text-blue-700 border-blue-200"
                  : value === "Resolved"
                    ? "bg-green-100 text-green-700 border-green-200"
                    : value === "Pending Response"
                      ? "bg-orange-100 text-orange-700 border-orange-200"
                      : "bg-red-100 text-red-700 border-red-200"
        }
      >
        {String(value)}
      </Badge>
    ),
  },
  { key: "submittedDate", header: "Submitted Date" },
];