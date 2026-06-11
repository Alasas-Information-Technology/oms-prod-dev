export const departmentBudgets = [
  { id: "DB-001", department: "IT", year: "2026", allocated: "AED 1,000,000", committed: "AED 650,000", available: "AED 350,000", utilization: "65%" },
  { id: "DB-002", department: "Operations", year: "2026", allocated: "AED 2,000,000", committed: "AED 1,200,000", available: "AED 800,000", utilization: "60%" },
  { id: "DB-003", department: "HR", year: "2026", allocated: "AED 500,000", committed: "AED 300,000", available: "AED 200,000", utilization: "60%" },
  { id: "DB-004", department: "Finance", year: "2025", allocated: "AED 700,000", committed: "AED 420,000", available: "AED 280,000", utilization: "60%" },
  { id: "DB-005", department: "Procurement", year: "2025", allocated: "AED 800,000", committed: "AED 510,000", available: "AED 290,000", utilization: "64%" },
];

export const annualBudgets = [
  { id: "AB-001", year: "2027", original: "AED 3,200,000", supplement: "AED 150,000", total: "AED 3,350,000", committed: "AED 2,450,000", available: "AED 900,000", status: "Open" },
  { id: "AB-002", year: "2028", original: "AED 2,900,000", supplement: "AED 100,000", total: "AED 3,000,000", committed: "AED 2,100,000", available: "AED 900,000", status: "Open" },
  { id: "AB-003", year: "2029", original: "AED 2,600,000", supplement: "AED 80,000", total: "AED 2,680,000", committed: "AED 1,900,000", available: "AED 780,000", status: "Open" },
  { id: "AB-004", year: "2026", original: "AED 5,000,000", supplement: "AED 500,000", total: "AED 5,500,000", committed: "AED 4,300,000", available: "AED 1,200,000", status: "Open" },
  { id: "AB-005", year: "2025", original: "AED 4,800,000", supplement: "AED 300,000", total: "AED 5,100,000", committed: "AED 3,900,000", available: "AED 1,200,000", status: "Closed" },
];

export const vendorAllocations = [
  { id: "VA-001", department: "IT", vendor: "ABC Technologies", allocated: "AED 600,000", committed: "AED 540,000", available: "AED 60,000", utilization: "96%" },
  { id: "VA-002", department: "IT", vendor: "XYZ Solutions", allocated: "AED 400,000", committed: "AED 360,000", available: "AED 40,000", utilization: "90%" },
  { id: "VA-003", department: "IT", vendor: "Cloud Services UAE", allocated: "AED 250,000", committed: "AED 100,000", available: "AED 150,000", utilization: "40%" },
  { id: "VA-004", department: "Operations", vendor: "Global Systems", allocated: "AED 500,000", committed: "AED 250,000", available: "AED 250,000", utilization: "50%" },
  { id: "VA-005", department: "Operations", vendor: "Logistics Hub", allocated: "AED 450,000", committed: "AED 405,000", available: "AED 45,000", utilization: "90%" },
  { id: "VA-006", department: "HR", vendor: "People First LLC", allocated: "AED 200,000", committed: "AED 180,000", available: "AED 20,000", utilization: "90%" },
  { id: "VA-007", department: "HR", vendor: "Workforce Partners", allocated: "AED 180,000", committed: "AED 72,000", available: "AED 108,000", utilization: "40%" },
  { id: "VA-008", department: "Finance", vendor: "FinTech Partners", allocated: "AED 300,000", committed: "AED 255,000", available: "AED 45,000", utilization: "85%" },
  { id: "VA-009", department: "Finance", vendor: "AuditPro Services", allocated: "AED 220,000", committed: "AED 88,000", available: "AED 132,000", utilization: "40%" },
  { id: "VA-010", department: "Procurement", vendor: "Prime Supplies", allocated: "AED 420,000", committed: "AED 378,000", available: "AED 42,000", utilization: "90%" },
];

export const commitments = [
  { id: "COM-001", request: "REQ-2026-001", department: "IT", vendor: "ABC Technologies", original: "AED 250,000", released: "AED 50,000", active: "AED 200,000", status: "Active" },
  { id: "COM-002", request: "REQ-2026-002", department: "IT", vendor: "XYZ Solutions", original: "AED 180,000", released: "AED 0", active: "AED 180,000", status: "Active" },
  { id: "COM-003", request: "REQ-2026-003", department: "Operations", vendor: "Global Systems", original: "AED 320,000", released: "AED 120,000", active: "AED 200,000", status: "Partially Released" },
  { id: "COM-004", request: "REQ-2026-004", department: "Finance", vendor: "FinTech Partners", original: "AED 150,000", released: "AED 150,000", active: "AED 0", status: "Released" },
  { id: "COM-005", request: "REQ-2026-005", department: "HR", vendor: "People First LLC", original: "AED 100,000", released: "AED 0", active: "AED 100,000", status: "Active" },
  { id: "COM-006", request: "REQ-2026-006", department: "Procurement", vendor: "Prime Supplies", original: "AED 275,000", released: "AED 75,000", active: "AED 200,000", status: "Partially Released" },
  { id: "COM-007", request: "REQ-2026-007", department: "Operations", vendor: "Logistics Hub", original: "AED 220,000", released: "AED 220,000", active: "AED 0", status: "Released" },
  { id: "COM-008", request: "REQ-2026-008", department: "IT", vendor: "Cloud Services UAE", original: "AED 350,000", released: "AED 0", active: "AED 350,000", status: "Active" },
];

export const supplements = [
  { id: "SUP-001", department: "IT", vendor: "ABC Technologies", requested: "AED 150,000", approved: "AED 150,000", status: "Approved" },
  { id: "SUP-002", department: "Operations", vendor: "Global Systems", requested: "AED 100,000", approved: "AED 75,000", status: "Approved" },
  { id: "SUP-003", department: "Finance", vendor: "FinTech Partners", requested: "AED 200,000", approved: "AED 0", status: "Pending Approval" },
  { id: "SUP-004", department: "HR", vendor: "People First LLC", requested: "AED 80,000", approved: "AED 0", status: "Draft" },
  { id: "SUP-005", department: "Procurement", vendor: "Prime Supplies", requested: "AED 120,000", approved: "AED 0", status: "Rejected" },
  { id: "SUP-006", department: "IT", vendor: "Cloud Services UAE", requested: "AED 250,000", approved: "AED 200,000", status: "Approved" },
  { id: "SUP-007", department: "Operations", vendor: "Logistics Hub", requested: "AED 90,000", approved: "AED 0", status: "Pending Approval" },
  { id: "SUP-008", department: "Finance", vendor: "AuditPro Services", requested: "AED 60,000", approved: "AED 60,000", status: "Approved" },
];

export const transfers = [
  { id: "TRF-001", source: "IT", target: "Operations", amount: "AED 100,000", status: "Approved" },
  { id: "TRF-002", source: "Finance", target: "HR", amount: "AED 75,000", status: "Pending Approval" },
  { id: "TRF-003", source: "Procurement", target: "IT", amount: "AED 120,000", status: "Approved" },
  { id: "TRF-004", source: "Operations", target: "Finance", amount: "AED 50,000", status: "Rejected" },
  { id: "TRF-005", source: "HR", target: "Operations", amount: "AED 90,000", status: "Draft" },
  { id: "TRF-006", source: "IT", target: "Finance", amount: "AED 60,000", status: "Approved" },
  { id: "TRF-007", source: "Operations", target: "Procurement", amount: "AED 130,000", status: "Pending Approval" },
  { id: "TRF-008", source: "Finance", target: "IT", amount: "AED 40,000", status: "Rejected" },
];