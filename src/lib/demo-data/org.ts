/**
 * Canonical Organizational Structure, Budget Lines, and Vendors
 * Specification: docs/DEMO-DATA-INTEGRATION.md Part 3
 *
 * All monetary amounts are integers in minor units (fils: 1 AED = 100 fils).
 */

import { OrgUnit, BudgetLine, Vendor } from "./entities";

// ============================================================================
// 1. Organizational Hierarchy
// ============================================================================

export const ORG_UNITS: Record<string, OrgUnit> = {
  // Root Organization
  "org-diez": {
    id: "org-diez",
    code: "DIEZ",
    name: "Dubai Integrated Economic Zones Authority",
    type: "ORGANIZATION",
    parentId: null,
    managerId: null,
    requisitionCount: 14,
  },

  // Business Units
  "bu-corp-services": {
    id: "bu-corp-services",
    code: "CORP_SERVICES",
    name: "Corporate Services",
    type: "BUSINESS_UNIT",
    parentId: "org-diez",
    managerId: "usr-khalid",
    requisitionCount: 14,
  },
  "bu-free-zones": {
    id: "bu-free-zones",
    code: "FREE_ZONES",
    name: "Free Zones",
    type: "BUSINESS_UNIT",
    parentId: "org-diez",
    managerId: null,
    requisitionCount: 0, // Empty-state test per Part 3
  },

  // Departments under Corporate Services
  "dept-digital-security": {
    id: "dept-digital-security",
    code: "DIG_SEC",
    name: "Digital Security",
    type: "DEPARTMENT",
    parentId: "bu-corp-services",
    managerId: "usr-khalid",
    requisitionCount: 5,
  },
  "dept-data-mgmt": {
    id: "dept-data-mgmt",
    code: "DATA_MGMT",
    name: "Data Management",
    type: "DEPARTMENT",
    parentId: "bu-corp-services",
    managerId: "usr-khalid",
    requisitionCount: 2,
  },
  "dept-it-infra": {
    id: "dept-it-infra",
    code: "IT_INFRA",
    name: "IT Infrastructure",
    type: "DEPARTMENT",
    parentId: "bu-corp-services",
    managerId: "usr-mona",
    requisitionCount: 4,
  },
  "dept-finance": {
    id: "dept-finance",
    code: "FINANCE",
    name: "Finance",
    type: "DEPARTMENT",
    parentId: "bu-corp-services",
    managerId: "usr-rashid-m",
    requisitionCount: 1,
  },
  "dept-hr": {
    id: "dept-hr",
    code: "HR",
    name: "Human Resources",
    type: "DEPARTMENT",
    parentId: "bu-corp-services",
    managerId: "usr-aisha",
    requisitionCount: 1,
  },
  "dept-procurement": {
    id: "dept-procurement",
    code: "PROCUREMENT",
    name: "Procurement",
    type: "DEPARTMENT",
    parentId: "bu-corp-services",
    managerId: "usr-salma",
    requisitionCount: 0,
  },
  "dept-pmo": {
    id: "dept-pmo",
    code: "PMO",
    name: "Project Management Office",
    type: "DEPARTMENT",
    parentId: "bu-corp-services",
    managerId: "usr-youssef-b",
    requisitionCount: 2,
  },
};

export const ORG_UNITS_LIST: OrgUnit[] = Object.values(ORG_UNITS);

// ============================================================================
// 2. Budget Lines (All amounts in fils)
// ============================================================================

export const BUDGET_LINES: Record<string, BudgetLine> = {
  // Digital Security (reused from Budget Control Center reference)
  "line-cs-dig-001": {
    id: "line-cs-dig-001",
    code: "CS-DIG-001",
    name: "Cybersecurity Services FY2026",
    departmentId: "dept-digital-security",
    fiscalYear: 2026,
    allocated: 320000000, // AED 3,200,000.00
    committed: 160000000, // AED 1,600,000.00
    spent: 115000000,     // AED 1,150,000.00
    available: 45000000,  // AED 450,000.00 (matching amendment workspace)
    currency: "AED",
    periodOpen: true,
  },
  "line-cs-dig-002": {
    id: "line-cs-dig-002",
    code: "CS-DIG-002",
    name: "Digital Transformation FY2026",
    departmentId: "dept-digital-security",
    fiscalYear: 2026,
    allocated: 240000000, // AED 2,400,000.00
    committed: 140000000, // AED 1,400,000.00
    spent: 83000000,      // AED 830,000.00
    available: 17000000,  // AED 170,000.00 (matching amendment workspace)
    currency: "AED",
    periodOpen: true,
  },
  "line-cs-dig-003": {
    id: "line-cs-dig-003",
    code: "CS-DIG-003",
    name: "Technology Operations FY2026",
    departmentId: "dept-digital-security",
    fiscalYear: 2026,
    allocated: 180000000, // AED 1,800,000.00
    committed: 90000000,  // AED 900,000.00
    spent: 60000000,      // AED 600,000.00
    available: 30000000,  // AED 300,000.00
    currency: "AED",
    periodOpen: true,
  },
  "line-unalloc-dig-2026": {
    id: "line-unalloc-dig-2026",
    code: "UNALLOC-DIG-2026",
    name: "Department Unallocated Pool FY2026",
    departmentId: "dept-digital-security",
    fiscalYear: 2026,
    allocated: 50000000,  // AED 500,000.00
    committed: 0,
    spent: 25000000,
    available: 25000000,  // AED 250,000.00 (matching amendment workspace)
    currency: "AED",
    periodOpen: true,
  },

  // Data Management
  "line-dm-dat-001": {
    id: "line-dm-dat-001",
    code: "DM-DAT-001",
    name: "Data Governance & Analytics FY2026",
    departmentId: "dept-data-mgmt",
    fiscalYear: 2026,
    allocated: 150000000, // AED 1,500,000.00
    committed: 60000000,
    spent: 40000000,
    available: 50000000,  // AED 500,000.00
    currency: "AED",
    periodOpen: true,
  },

  // IT Infrastructure
  "line-it-inf-001": {
    id: "line-it-inf-001",
    code: "IT-INF-001",
    name: "Cloud Infrastructure & Architecture FY2026",
    departmentId: "dept-it-infra",
    fiscalYear: 2026,
    allocated: 400000000, // AED 4,000,000.00
    committed: 220000000,
    spent: 110000000,
    available: 70000000,  // AED 700,000.00
    currency: "AED",
    periodOpen: true,
  },
  "line-it-inf-002": {
    id: "line-it-inf-002",
    code: "IT-INF-002",
    name: "Network Operations & Connectivity FY2026",
    departmentId: "dept-it-infra",
    fiscalYear: 2026,
    allocated: 200000000, // AED 2,000,000.00
    committed: 110000000,
    spent: 55000000,
    available: 35000000,  // AED 350,000.00
    currency: "AED",
    periodOpen: true,
  },

  // PMO
  "line-pmo-prj-001": {
    id: "line-pmo-prj-001",
    code: "PMO-PRJ-001",
    name: "Strategic PMO & Delivery FY2026",
    departmentId: "dept-pmo",
    fiscalYear: 2026,
    allocated: 120000000, // AED 1,200,000.00
    committed: 60000000,
    spent: 35000000,
    available: 25000000,  // AED 250,000.00
    currency: "AED",
    periodOpen: true,
  },

  // Finance
  "line-fin-ops-001": {
    id: "line-fin-ops-001",
    code: "FIN-OPS-001",
    name: "Financial Compliance & Operations FY2026",
    departmentId: "dept-finance",
    fiscalYear: 2026,
    allocated: 100000000, // AED 1,000,000.00
    committed: 40000000,
    spent: 30000000,
    available: 30000000,  // AED 300,000.00
    currency: "AED",
    periodOpen: true,
  },

  // HR
  "line-hr-tal-001": {
    id: "line-hr-tal-001",
    code: "HR-TAL-001",
    name: "People & Talent Management FY2026",
    departmentId: "dept-hr",
    fiscalYear: 2026,
    allocated: 150000000, // AED 1,500,000.00
    committed: 70000000,
    spent: 50000000,
    available: 30000000,  // AED 300,000.00
    currency: "AED",
    periodOpen: true,
  },

  // Procurement
  "line-proc-sup-001": {
    id: "line-proc-sup-001",
    code: "PROC-SUP-001",
    name: "Strategic Sourcing & Vendor Operations FY2026",
    departmentId: "dept-procurement",
    fiscalYear: 2026,
    allocated: 100000000, // AED 1,000,000.00
    committed: 45000000,
    spent: 35000000,
    available: 20000000,  // AED 200,000.00
    currency: "AED",
    periodOpen: true,
  },
};

export const BUDGET_LINES_LIST: BudgetLine[] = Object.values(BUDGET_LINES);

// ============================================================================
// 3. Vendors
// ============================================================================

export const VENDORS: Record<string, Vendor> = {
  "ven-falcon": {
    id: "ven-falcon",
    code: "FALCON_TECH",
    name: "Falcon Tech Resourcing",
    status: "ACTIVE",
    coordinatorId: "usr-layla",
    email: "onboarding@falcontech.ae",
    phone: "+971 4 398 1122",
    tier: "TIER_1",
  },
  "ven-meridian": {
    id: "ven-meridian",
    code: "MERIDIAN",
    name: "Meridian Workforce Solutions",
    status: "ACTIVE",
    coordinatorId: null, // Unstaffed by a named coordinator per Part 3
    email: "contact@meridianws.ae",
    phone: "+971 4 412 8899",
    tier: "TIER_2",
  },
};

export const VENDORS_LIST: Vendor[] = Object.values(VENDORS);
