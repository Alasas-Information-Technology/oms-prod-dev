export interface ActiveResourceDocument {
  name: string;
  status: string;
  expiryDate?: string;
  warningText?: string;
}

export interface ActiveResourceTimelineItem {
  id: string;
  label: string;
  date: string;
  status: "completed" | "current" | "warning" | "upcoming";
  subtext?: string;
}

export interface ActiveResource {
  id: string; // e.g. "RES-2026-0042"
  fullName: string;
  positionTitle: string;
  status: "Active" | "Ending Soon" | "On Leave" | "Terminated";
  restricted: boolean;
  department: string;
  manager: string;
  workLocation: string;
  joinedDate: string;
  contractEndDate: string;
  vendorName: string;
  
  // Engagement Overview
  engagement: {
    requestRef: string;
    lpoRef: string;
    duration: string;
    grade: string;
    candidateCost: string;
    wcrAssignees: string;
    attendanceMonitoring: string;
    biometricRef: string;
  };

  // Document Health
  documentHealth: {
    passport: { text: string; isExpiring?: boolean; daysLeft?: string };
    emiratesId: { text: string; isExpiring?: boolean; daysLeft?: string };
    policeClearance: { text: string; isExpiring?: boolean; daysLeft?: string };
    nda: { text: string; isExpiring?: boolean; daysLeft?: string };
    validCount: number;
    expiringCount: number;
  };

  // Contract & Cost
  contractCost: {
    lockedAllocation: string;
    consumed: string;
    consumedPercent: number;
    remaining: string;
    remainingPercent: number;
    nextWcrDue: string;
    forecast: "On plan" | "Attention Needed" | "Over Budget";
  };

  // Operational Readiness
  operationalReadiness: {
    saned: "Complete" | "Pending" | "Not applicable";
    laptop: "Issued" | "Pending" | "Returned";
    token: "Active" | "Pending" | "Revoked";
    buildingAccess: "Active" | "Pending" | "Disabled";
    remoteAccess: "Active" | "Not applicable" | "Pending";
  };

  // Leave Snapshot
  leaveSnapshot: {
    entitlementDays: number;
    usedDays: number;
    pendingDays: number;
    remainingDays: number;
  };

  // Lifecycle Timeline
  timeline: ActiveResourceTimelineItem[];

  // Documents tab list
  documentsList: Array<{
    id: string;
    title: string;
    type: string;
    issueDate: string;
    expiryDate: string;
    status: "VALID" | "EXPIRING_SOON" | "EXPIRED";
    verifiedBy: string;
  }>;

  // Leave records list
  leaveHistory: Array<{
    id: string;
    type: string;
    startDate: string;
    endDate: string;
    days: number;
    status: "APPROVED" | "PENDING" | "REJECTED";
    approvedBy: string;
  }>;

  // Audit history
  auditLogs: Array<{
    id: string;
    action: string;
    performedBy: string;
    timestamp: string;
    details: string;
  }>;
}

export const ACTIVE_RESOURCES: ActiveResource[] = [
  {
    id: "RES-2026-0042",
    fullName: "Zayd Mansoor",
    positionTitle: "Senior Cybersecurity Analyst",
    status: "Active",
    restricted: true,
    department: "Digital Security",
    manager: "Khalid Al-Mansoori",
    workLocation: "DIEZ Premises",
    joinedDate: "01 Sep 2026",
    contractEndDate: "31 Aug 2027",
    vendorName: "Falcon Tech Services",
    engagement: {
      requestRef: "OMS-2026-0148",
      lpoRef: "LPO-260771",
      duration: "12 months",
      grade: "G8",
      candidateCost: "AED 298,000",
      wcrAssignees: "Mariam Al Mansoori, Khalid Al-Mansoori",
      attendanceMonitoring: "Disabled",
      biometricRef: "Captured on joining without displaying biometric data",
    },
    documentHealth: {
      passport: { text: "Valid to 14 Mar 2031" },
      emiratesId: { text: "Valid to 21 Nov 2027" },
      policeClearance: { text: "Expires 30 Oct 2026", isExpiring: true, daysLeft: "45 days" },
      nda: { text: "Signed via DocuSign" },
      validCount: 3,
      expiringCount: 1,
    },
    contractCost: {
      lockedAllocation: "AED 298,000",
      consumed: "AED 49,667",
      consumedPercent: 17,
      remaining: "AED 248,333",
      remainingPercent: 83,
      nextWcrDue: "30 Sep 2026",
      forecast: "On plan",
    },
    operationalReadiness: {
      saned: "Complete",
      laptop: "Issued",
      token: "Active",
      buildingAccess: "Active",
      remoteAccess: "Not applicable",
    },
    leaveSnapshot: {
      entitlementDays: 30,
      usedDays: 2,
      pendingDays: 0,
      remainingDays: 28,
    },
    timeline: [
      { id: "tl-1", label: "Onboarded", date: "25 Aug 2026", status: "completed" },
      { id: "tl-2", label: "Joined", date: "01 Sep 2026", status: "completed" },
      { id: "tl-3", label: "WCR due", date: "30 Sep 2026", status: "current" },
      { id: "tl-4", label: "Document expiry", date: "30 Oct 2026", status: "warning", subtext: "45 days" },
      { id: "tl-5", label: "Contract renewal window opens", date: "02 Jun 2027", status: "upcoming", subtext: "90 days before end" },
    ],
    documentsList: [
      { id: "doc-1", title: "Passport Copy (High Res)", type: "Passport", issueDate: "15 Mar 2021", expiryDate: "14 Mar 2031", status: "VALID", verifiedBy: "DIEZ HR Compliance" },
      { id: "doc-2", title: "Emirates ID (Front & Back)", type: "National ID", issueDate: "22 Nov 2022", expiryDate: "21 Nov 2027", status: "VALID", verifiedBy: "DIEZ Security" },
      { id: "doc-3", title: "Dubai Police Clearance Certificate", type: "Clearance", issueDate: "31 Oct 2025", expiryDate: "30 Oct 2026", status: "EXPIRING_SOON", verifiedBy: "DIEZ Security" },
      { id: "doc-4", title: "DIEZ Non-Disclosure Agreement", type: "Legal Agreement", issueDate: "25 Aug 2026", expiryDate: "N/A", status: "VALID", verifiedBy: "DocuSign System" },
    ],
    leaveHistory: [
      { id: "lv-1", type: "Annual Leave", startDate: "12 Sep 2026", endDate: "13 Sep 2026", days: 2, status: "APPROVED", approvedBy: "Khalid Al-Mansoori" },
    ],
    auditLogs: [
      { id: "aud-1", action: "Record Viewed", performedBy: "Sara Al-Maktoum (HR Specialist)", timestamp: "18 Sep 2026, 10:45 AM", details: "Viewed overview profile & document status" },
      { id: "aud-2", action: "WCR Verified", performedBy: "Mariam Al Mansoori", timestamp: "01 Sep 2026, 09:00 AM", details: "Initial onboarding work completion report verified" },
    ],
  },
  {
    id: "RES-2026-0043",
    fullName: "Amina El-Sayed",
    positionTitle: "Cloud Infrastructure Architect",
    status: "Active",
    restricted: true,
    department: "IT Infrastructure",
    manager: "Mona Al Qassimi",
    workLocation: "DIEZ Premises",
    joinedDate: "15 Jun 2026",
    contractEndDate: "14 Jun 2027",
    vendorName: "Emirates Tech Solutions",
    engagement: {
      requestRef: "OMS-2026-0112",
      lpoRef: "LPO-259810",
      duration: "12 months",
      grade: "G9",
      candidateCost: "AED 340,000",
      wcrAssignees: "Mona Al Qassimi",
      attendanceMonitoring: "Enabled",
      biometricRef: "Captured and registered",
    },
    documentHealth: {
      passport: { text: "Valid to 10 Jan 2030" },
      emiratesId: { text: "Valid to 05 Jun 2028" },
      policeClearance: { text: "Valid to 15 Jun 2027" },
      nda: { text: "Signed via DocuSign" },
      validCount: 4,
      expiringCount: 0,
    },
    contractCost: {
      lockedAllocation: "AED 340,000",
      consumed: "AED 85,000",
      consumedPercent: 25,
      remaining: "AED 255,000",
      remainingPercent: 75,
      nextWcrDue: "30 Sep 2026",
      forecast: "On plan",
    },
    operationalReadiness: {
      saned: "Complete",
      laptop: "Issued",
      token: "Active",
      buildingAccess: "Active",
      remoteAccess: "Active",
    },
    leaveSnapshot: {
      entitlementDays: 30,
      usedDays: 5,
      pendingDays: 1,
      remainingDays: 24,
    },
    timeline: [
      { id: "tl-1", label: "Onboarded", date: "10 Jun 2026", status: "completed" },
      { id: "tl-2", label: "Joined", date: "15 Jun 2026", status: "completed" },
      { id: "tl-3", label: "WCR due", date: "30 Sep 2026", status: "current" },
      { id: "tl-4", label: "Document expiry", date: "15 Jun 2027", status: "upcoming" },
      { id: "tl-5", label: "Contract renewal window opens", date: "15 Mar 2027", status: "upcoming", subtext: "90 days before end" },
    ],
    documentsList: [
      { id: "doc-1", title: "Passport Copy", type: "Passport", issueDate: "11 Jan 2020", expiryDate: "10 Jan 2030", status: "VALID", verifiedBy: "DIEZ HR Compliance" },
      { id: "doc-2", title: "Emirates ID", type: "National ID", issueDate: "06 Jun 2023", expiryDate: "05 Jun 2028", status: "VALID", verifiedBy: "DIEZ Security" },
    ],
    leaveHistory: [
      { id: "lv-1", type: "Annual Leave", startDate: "01 Aug 2026", endDate: "05 Aug 2026", days: 5, status: "APPROVED", approvedBy: "Mona Al Qassimi" },
    ],
    auditLogs: [
      { id: "aud-1", action: "Record Viewed", performedBy: "Sara Al-Maktoum", timestamp: "17 Sep 2026, 02:15 PM", details: "Viewed resource status" },
    ],
  },
  {
    id: "RES-2026-0044",
    fullName: "Tariq Mansour",
    positionTitle: "Full-Stack Software Engineer",
    status: "Ending Soon",
    restricted: false,
    department: "PMO & Digital Transformation",
    manager: "Rashid Al Falasi",
    workLocation: "Remote (UAE WFH)",
    joinedDate: "01 Nov 2025",
    contractEndDate: "31 Oct 2026",
    vendorName: "Apex Global Consulting",
    engagement: {
      requestRef: "OMS-2025-0088",
      lpoRef: "LPO-245019",
      duration: "12 months",
      grade: "G7",
      candidateCost: "AED 220,000",
      wcrAssignees: "Rashid Al Falasi",
      attendanceMonitoring: "Disabled",
      biometricRef: "Remote contractor",
    },
    documentHealth: {
      passport: { text: "Valid to 20 Aug 2029" },
      emiratesId: { text: "Expires 15 Oct 2026", isExpiring: true, daysLeft: "30 days" },
      policeClearance: { text: "Valid to 01 Nov 2026" },
      nda: { text: "Signed via DocuSign" },
      validCount: 3,
      expiringCount: 1,
    },
    contractCost: {
      lockedAllocation: "AED 220,000",
      consumed: "AED 201,667",
      consumedPercent: 91,
      remaining: "AED 18,333",
      remainingPercent: 9,
      nextWcrDue: "30 Sep 2026",
      forecast: "Attention Needed",
    },
    operationalReadiness: {
      saned: "Complete",
      laptop: "Issued",
      token: "Active",
      buildingAccess: "Pending",
      remoteAccess: "Active",
    },
    leaveSnapshot: {
      entitlementDays: 30,
      usedDays: 14,
      pendingDays: 0,
      remainingDays: 16,
    },
    timeline: [
      { id: "tl-1", label: "Onboarded", date: "25 Oct 2025", status: "completed" },
      { id: "tl-2", label: "Joined", date: "01 Nov 2025", status: "completed" },
      { id: "tl-3", label: "WCR due", date: "30 Sep 2026", status: "current" },
      { id: "tl-4", label: "Contract renewal window open", date: "01 Aug 2026", status: "warning", subtext: "Requires immediate decision" },
    ],
    documentsList: [
      { id: "doc-1", title: "Passport Copy", type: "Passport", issueDate: "21 Aug 2019", expiryDate: "20 Aug 2029", status: "VALID", verifiedBy: "DIEZ HR Compliance" },
      { id: "doc-2", title: "Emirates ID", type: "National ID", issueDate: "16 Oct 2023", expiryDate: "15 Oct 2026", status: "EXPIRING_SOON", verifiedBy: "DIEZ Security" },
    ],
    leaveHistory: [
      { id: "lv-1", type: "Annual Leave", startDate: "10 Jul 2026", endDate: "24 Jul 2026", days: 14, status: "APPROVED", approvedBy: "Rashid Al Falasi" },
    ],
    auditLogs: [
      { id: "aud-1", action: "Renewal Prompt Sent", performedBy: "System Automation", timestamp: "01 Aug 2026, 08:00 AM", details: "Sent 90-day renewal notification to Line Manager" },
    ],
  },
  {
    id: "RES-2026-0045",
    fullName: "Nadia Al-Khouri",
    positionTitle: "Financial Systems Analyst",
    status: "Active",
    restricted: true,
    department: "Finance",
    manager: "Hessa Al Blooshi",
    workLocation: "DIEZ Premises",
    joinedDate: "01 Feb 2026",
    contractEndDate: "31 Jan 2027",
    vendorName: "Falcon Tech Services",
    engagement: {
      requestRef: "OMS-2026-0034",
      lpoRef: "LPO-251102",
      duration: "12 months",
      grade: "G8",
      candidateCost: "AED 280,000",
      wcrAssignees: "Hessa Al Blooshi",
      attendanceMonitoring: "Enabled",
      biometricRef: "Captured on joining",
    },
    documentHealth: {
      passport: { text: "Valid to 05 May 2032" },
      emiratesId: { text: "Valid to 31 Jan 2028" },
      policeClearance: { text: "Valid to 25 Jan 2027" },
      nda: { text: "Signed via DocuSign" },
      validCount: 4,
      expiringCount: 0,
    },
    contractCost: {
      lockedAllocation: "AED 280,000",
      consumed: "AED 163,333",
      consumedPercent: 58,
      remaining: "AED 116,667",
      remainingPercent: 42,
      nextWcrDue: "30 Sep 2026",
      forecast: "On plan",
    },
    operationalReadiness: {
      saned: "Complete",
      laptop: "Issued",
      token: "Active",
      buildingAccess: "Active",
      remoteAccess: "Active",
    },
    leaveSnapshot: {
      entitlementDays: 30,
      usedDays: 8,
      pendingDays: 0,
      remainingDays: 22,
    },
    timeline: [
      { id: "tl-1", label: "Onboarded", date: "20 Jan 2026", status: "completed" },
      { id: "tl-2", label: "Joined", date: "01 Feb 2026", status: "completed" },
      { id: "tl-3", label: "WCR due", date: "30 Sep 2026", status: "current" },
    ],
    documentsList: [],
    leaveHistory: [],
    auditLogs: [],
  },
];

export function getActiveResourceById(id: string): ActiveResource | undefined {
  return ACTIVE_RESOURCES.find((r) => r.id === id);
}
