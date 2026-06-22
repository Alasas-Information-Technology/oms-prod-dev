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

export const requestionRequests = [
  { id: "PR-001", requestNo: "PR-2026-001", department: "IT", vendor: "ABC Technologies", requestedAmount: "AED 150,000", approvedAmount: "AED 150,000", status: "Approved", requestDate: "12-Jan-2026" },
  { id: "PR-002", requestNo: "PR-2026-002", department: "Finance", vendor: "FinTech Partners", requestedAmount: "AED 200,000", approvedAmount: "AED 0", status: "Pending", requestDate: "15-Jan-2026" },
  { id: "PR-003", requestNo: "PR-2026-003", department: "HR", vendor: "People First LLC", requestedAmount: "AED 80,000", approvedAmount: "AED 80,000", status: "Approved", requestDate: "18-Jan-2026" },
  { id: "PR-004", requestNo: "PR-2026-004", department: "Operations", vendor: "Logistics Hub", requestedAmount: "AED 320,000", approvedAmount: "AED 250,000", status: "Approved", requestDate: "20-Jan-2026" },
  { id: "PR-005", requestNo: "PR-2026-005", department: "IT", vendor: "Cloud Services UAE", requestedAmount: "AED 120,000", approvedAmount: "AED 0", status: "Pending", requestDate: "22-Jan-2026" },
  { id: "PR-006", requestNo: "PR-2026-006", department: "Procurement", vendor: "Prime Supplies", requestedAmount: "AED 450,000", approvedAmount: "AED 450,000", status: "Approved", requestDate: "24-Jan-2026" },
  { id: "PR-007", requestNo: "PR-2026-007", department: "Finance", vendor: "AuditPro Services", requestedAmount: "AED 60,000", approvedAmount: "AED 0", status: "Rejected", requestDate: "26-Jan-2026" },
  { id: "PR-008", requestNo: "PR-2026-008", department: "Operations", vendor: "Global Systems", requestedAmount: "AED 180,000", approvedAmount: "AED 180,000", status: "Approved", requestDate: "28-Jan-2026" },
  { id: "PR-009", requestNo: "PR-2026-009", department: "HR", vendor: "Training Academy", requestedAmount: "AED 95,000", approvedAmount: "AED 95,000", status: "Approved", requestDate: "30-Jan-2026" },
  { id: "PR-010", requestNo: "PR-2026-010", department: "IT", vendor: "CyberShield Security", requestedAmount: "AED 275,000", approvedAmount: "AED 0", status: "Pending", requestDate: "02-Feb-2026" },
];

export const myRequisitions = [
  { id: "REQ-001", requestNo: "REQ-2026-001", position: "Software Engineer", department: "IT", budget: "AED 25,000", status: "Approved", submittedDate: "12-Jan-2026" },
  { id: "REQ-002", requestNo: "REQ-2026-002", position: "Network Engineer", department: "IT", budget: "AED 22,000", status: "Pending", submittedDate: "15-Jan-2026" },
  { id: "REQ-003", requestNo: "REQ-2026-003", position: "HR Executive", department: "HR", budget: "AED 18,000", status: "Approved", submittedDate: "18-Jan-2026" },
  { id: "REQ-004", requestNo: "REQ-2026-004", position: "Finance Analyst", department: "Finance", budget: "AED 20,000", status: "Draft", submittedDate: "20-Jan-2026" },
  { id: "REQ-005", requestNo: "REQ-2026-005", position: "Procurement Officer", department: "Procurement", budget: "AED 19,000", status: "Pending", submittedDate: "22-Jan-2026" },
  { id: "REQ-006", requestNo: "REQ-2026-006", position: "Project Manager", department: "Operations", budget: "AED 35,000", status: "Approved", submittedDate: "25-Jan-2026" },
  { id: "REQ-007", requestNo: "REQ-2026-007", position: "Business Analyst", department: "IT", budget: "AED 24,000", status: "Rejected", submittedDate: "28-Jan-2026" },
  { id: "REQ-008", requestNo: "REQ-2026-008", position: "Recruitment Specialist", department: "HR", budget: "AED 17,000", status: "Approved", submittedDate: "30-Jan-2026" },
  { id: "REQ-009", requestNo: "REQ-2026-009", position: "Accountant", department: "Finance", budget: "AED 16,000", status: "Pending", submittedDate: "02-Feb-2026" },
  { id: "REQ-010", requestNo: "REQ-2026-010", position: "Systems Administrator", department: "IT", budget: "AED 23,000", status: "Approved", submittedDate: "05-Feb-2026" },
];


export const pendingApprovals = [
  { id: "APP-001", requestNo: "REQ-2026-011", requestor: "Ahmed Khan", department: "IT", position: "Software Engineer", amount: "AED 25,000", submittedDate: "08-Feb-2026", status: "Pending" },
  { id: "APP-002", requestNo: "REQ-2026-012", requestor: "Sarah Ali", department: "HR", position: "HR Executive", amount: "AED 18,000", submittedDate: "09-Feb-2026", status: "Pending" },
  { id: "APP-003", requestNo: "REQ-2026-013", requestor: "Mohammed Noor", department: "Finance", position: "Financial Analyst", amount: "AED 22,000", submittedDate: "10-Feb-2026", status: "Pending" },
  { id: "APP-004", requestNo: "REQ-2026-014", requestor: "Fatima Hassan", department: "Procurement", position: "Procurement Officer", amount: "AED 20,000", submittedDate: "11-Feb-2026", status: "Pending" },
  { id: "APP-005", requestNo: "REQ-2026-015", requestor: "Omar Saleh", department: "Operations", position: "Project Manager", amount: "AED 35,000", submittedDate: "12-Feb-2026", status: "Pending" },
  { id: "APP-006", requestNo: "REQ-2026-016", requestor: "Aisha Rahman", department: "IT", position: "Systems Administrator", amount: "AED 23,000", submittedDate: "13-Feb-2026", status: "Pending" },
  { id: "APP-007", requestNo: "REQ-2026-017", requestor: "Ali Hamad", department: "HR", position: "Recruitment Specialist", amount: "AED 17,000", submittedDate: "14-Feb-2026", status: "Clarification Required" },
  { id: "APP-008", requestNo: "REQ-2026-018", requestor: "Noura Ahmed", department: "Finance", position: "Accountant", amount: "AED 16,000", submittedDate: "15-Feb-2026", status: "Pending" },
  { id: "APP-009", requestNo: "REQ-2026-019", requestor: "Khalid Yusuf", department: "Operations", position: "Business Analyst", amount: "AED 24,000", submittedDate: "16-Feb-2026", status: "Pending" },
  { id: "APP-010", requestNo: "REQ-2026-020", requestor: "Mariam Saeed", department: "IT", position: "Network Engineer", amount: "AED 21,000", submittedDate: "17-Feb-2026", status: "Pending" },
];


export const draftRequisitions = [
  { id: "DR-001", draftNo: "DR-2026-001", position: "Software Engineer", department: "IT", budget: "AED 25,000", lastModified: "17-Jun-2026", status: "Ready" },
  { id: "DR-002", draftNo: "DR-2026-002", position: "HR Executive", department: "HR", budget: "AED 18,000", lastModified: "16-Jun-2026", status: "Incomplete" },
  { id: "DR-003", draftNo: "DR-2026-003", position: "Business Analyst", department: "Finance", budget: "AED 22,000", lastModified: "15-Jun-2026", status: "Ready" },
  { id: "DR-004", draftNo: "DR-2026-004", position: "Project Manager", department: "Operations", budget: "AED 35,000", lastModified: "14-Jun-2026", status: "Incomplete" },
  { id: "DR-005", draftNo: "DR-2026-005", position: "Procurement Officer", department: "Procurement", budget: "AED 20,000", lastModified: "13-Jun-2026", status: "Ready" },
  { id: "DR-006", draftNo: "DR-2026-006", position: "Network Engineer", department: "IT", budget: "AED 21,000", lastModified: "12-Jun-2026", status: "Incomplete" },
  { id: "DR-007", draftNo: "DR-2026-007", position: "Recruitment Specialist", department: "HR", budget: "AED 17,000", lastModified: "11-Jun-2026", status: "Ready" },
  { id: "DR-008", draftNo: "DR-2026-008", position: "Accountant", department: "Finance", budget: "AED 16,000", lastModified: "10-Jun-2026", status: "Ready" },
];

export const clarificationRequests = [
  { id: "CL-001", requestNo: "REQ-2026-021", returnedBy: "Finance Manager", department: "IT", reason: "Budget justification missing", returnedDate: "18-Jun-2026", status: "Pending Response" },
  { id: "CL-002", requestNo: "REQ-2026-022", returnedBy: "HR Director", department: "HR", reason: "Position description incomplete", returnedDate: "17-Jun-2026", status: "Pending Response" },
  { id: "CL-003", requestNo: "REQ-2026-023", returnedBy: "Procurement Head", department: "Procurement", reason: "Vendor details required", returnedDate: "16-Jun-2026", status: "Resolved" },
  { id: "CL-004", requestNo: "REQ-2026-024", returnedBy: "Finance Manager", department: "Finance", reason: "Budget exceeds allocation", returnedDate: "15-Jun-2026", status: "Pending Response" },
  { id: "CL-005", requestNo: "REQ-2026-025", returnedBy: "Operations Manager", department: "Operations", reason: "Resource count mismatch", returnedDate: "14-Jun-2026", status: "Resolved" },
  { id: "CL-006", requestNo: "REQ-2026-026", returnedBy: "HR Director", department: "HR", reason: "Reporting manager not specified", returnedDate: "13-Jun-2026", status: "Pending Response" },
  { id: "CL-007", requestNo: "REQ-2026-027", returnedBy: "Finance Manager", department: "IT", reason: "Cost breakdown required", returnedDate: "12-Jun-2026", status: "Resolved" },
  { id: "CL-008", requestNo: "REQ-2026-028", returnedBy: "Procurement Head", department: "Procurement", reason: "Supporting documents missing", returnedDate: "11-Jun-2026", status: "Pending Response" },
];

export const allRequisitions = [
  { id: "REQ-2026-001", requestDate: "01-Jan-2026", requestedBy: "Ahmed Khan", positionName: "Software Engineer", department: "IT", budgetAmount: "AED 25000", status: "Approved" },
  { id: "REQ-2026-002", requestDate: "03-Jan-2026", requestedBy: "Sarah Ali", positionName: "HR Executive", department: "HR", budgetAmount: "AED 18000", status: "Pending Approval" },
  { id: "REQ-2026-003", requestDate: "05-Jan-2026", requestedBy: "Mohammed Noor", positionName: "Financial Analyst", department: "Finance", budgetAmount: "AED 22000",  status: "Approved" },
  { id: "REQ-2026-004", requestDate: "08-Jan-2026", requestedBy: "Fatima Hassan", positionName: "Procurement Officer", department: "Procurement", budgetAmount: "AED 20000", status: "Clarification Required" },
  { id: "REQ-2026-005", requestDate: "10-Jan-2026", requestedBy: "Omar Saleh", positionName: "Project Manager", department: "Operations", budgetAmount: "AED 35000",  status: "Approved" },
  { id: "REQ-2026-006", requestDate: "12-Jan-2026", requestedBy: "Aisha Rahman", positionName: "Systems Administrator", department: "IT", budgetAmount: "AED 23000", status: "Pending Approval" },
  { id: "REQ-2026-007", requestDate: "15-Jan-2026", requestedBy: "Ali Hamad", positionName: "Recruitment Specialist", department: "HR", budgetAmount: "AED 17000", status: "Rejected" },
  { id: "REQ-2026-008", requestDate: "18-Jan-2026", requestedBy: "Noura Ahmed", positionName: "Accountant", department: "Finance", budgetAmount: "AED 16000", status: "Approved" },
  { id: "REQ-2026-009", requestDate: "20-Jan-2026", requestedBy: "Khalid Saeed", positionName: "Business Analyst", department: "IT", budgetAmount: "AED 24000",  status: "Draft" },
  { id: "REQ-2026-010", requestDate: "22-Jan-2026", requestedBy: "Mariam Yusuf", positionName: "Operations Coordinator", department: "Operations", budgetAmount: "AED 19000", status: "Pending Approval" },
];


export const userInformation = [
  { employeeId: "EMP-001", employeeName: "Ahmed Khan", email: "ahmed.khan@diez.ae", department: "IT", role: "System Administrator", userType: "Internal", status: "Active", lastLogin: "22-Jun-2026 08:15 AM" },
  { employeeId: "EMP-002", employeeName: "Sarah Ali", email: "sarah.ali@diez.ae", department: "HR", role: "HR Executive", userType: "Internal", status: "Active", lastLogin: "22-Jun-2026 09:02 AM" },
  { employeeId: "EMP-003", employeeName: "Mohammed Noor", email: "m.noor@diez.ae", department: "Finance", role: "Financial Analyst", userType: "Internal", status: "Issue", lastLogin: "21-Jun-2026 04:11 PM" },
  { employeeId: "EMP-004", employeeName: "Fatima Hassan", email: "fatima.hassan@diez.ae", department: "Procurement", role: "Procurement Officer", userType: "Internal", status: "Active", lastLogin: "22-Jun-2026 07:48 AM" },
  { employeeId: "EMP-005", employeeName: "Omar Saleh", email: "omar.saleh@vendor.com", department: "Operations", role: "Project Manager", userType: "External", status: "Active", lastLogin: "22-Jun-2026 10:30 AM" },
  { employeeId: "EMP-006", employeeName: "Aisha Rahman", email: "aisha.rahman@diez.ae", department: "IT", role: "Network Engineer", userType: "Internal", status: "Issue", lastLogin: "20-Jun-2026 03:20 PM" },
  { employeeId: "EMP-007", employeeName: "Ali Hamad", email: "ali.hamad@vendor.com", department: "HR", role: "Recruitment Consultant", userType: "External", status: "Active", lastLogin: "22-Jun-2026 08:55 AM" },
  { employeeId: "EMP-008", employeeName: "Noura Ahmed", email: "noura.ahmed@diez.ae", department: "Finance", role: "Accountant", userType: "Internal", status: "Active", lastLogin: "22-Jun-2026 09:45 AM" },
];