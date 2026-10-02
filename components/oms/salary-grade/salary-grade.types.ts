export type DeploymentGroup = "onsite" | "offsite" | "national";
export type GroupFilter = "all" | DeploymentGroup;
export type StaffCategory =
  | "Office Staff"
  | "Engineers & Specialist"
  | "Senior Staff";
export type FamilyStatus = "a" | "b" | "c" | "d" | "e";
export type ArrangementId =
  | "onsite-permit"
  | "onsite-residence"
  | "vendor-office"
  | "abroad"
  | "national";

// Monetary values are integer fils.
export interface JobGrade {
  id: string;
  code: string;
  category: StaffCategory;
  designation: string;
  salaryMinFils: number;
  salaryMaxFils: number | null;
  active: boolean;
  sortOrder: number;
  selfOnly: boolean;
}

export interface GradeBenefit {
  id: string;
  gradeId: string;
  arrangementId: ArrangementId;
  familyStatus: FamilyStatus;
  mainBenefits: string;
}

export interface GradeStore {
  version: 1;
  revision: number;
  grades: JobGrade[];
  benefits: GradeBenefit[];
}

export interface GradeRow extends GradeBenefit {
  grade: JobGrade;
  group: DeploymentGroup;
  fullCode: string;
  designation: string;
  salaryMinFils: number;
  familyLabel: string;
}

export interface BenefitInput {
  arrangementId: ArrangementId;
  familyStatus: FamilyStatus;
  mainBenefits: string;
}

export interface CreateGradeInput {
  group: DeploymentGroup;
  existingGradeId?: string;
  grade?: Omit<JobGrade, "id" | "sortOrder">;
  benefits: BenefitInput[];
}