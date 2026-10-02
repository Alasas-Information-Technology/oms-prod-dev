import type {
  ArrangementId,
  DeploymentGroup,
  FamilyStatus,
  GradeStore,
  JobGrade,
  StaffCategory,
} from "./salary-grade.types";

export const GROUPS: Record<
  DeploymentGroup,
  { label: string; prefix: string; colour: string }
> = {
  onsite: {
    label: "Onsite–Remote",
    prefix: "OS&R",
    colour: "green",
  },
  offsite: {
    label: "Offsite–Abroad",
    prefix: "OS&A",
    colour: "blue",
  },
  national: {
    label: "UAE Nationals",
    prefix: "UN",
    colour: "purple",
  },
};

export const CATEGORIES: StaffCategory[] = [
  "Office Staff",
  "Engineers & Specialist",
  "Senior Staff",
];

export const FAMILIES: Record<FamilyStatus, string> = {
  a: "Self",
  b: "Self + Spouse",
  c: "Self + Spouse + 1 Child",
  d: "Self + Spouse + 2 Children",
  e: "Self + Spouse + 3 Children",
};

export const ARRANGEMENTS: Record<
  ArrangementId,
  { label: string; group: DeploymentGroup }
> = {
  "onsite-permit": {
    label: "Work permit only · no residence visa",
    group: "onsite",
  },
  "onsite-residence": {
    label: "Residence visa + work permit",
    group: "onsite",
  },
  "vendor-office": {
    label: "Vendor office in UAE",
    group: "offsite",
  },
  abroad: {
    label: "Work from abroad",
    group: "offsite",
  },
  national: {
    label: "DIEZ premises / WFH",
    group: "national",
  },
};

export const PENSION_NOTE =
  "The employer’s statutory pension contribution is borne by the outsourcing company, as stated in the supplied UAE Nationals reference. No pension amount is calculated here.";

export function arrangementsFor(
  group: DeploymentGroup,
): ArrangementId[] {
  return (Object.keys(ARRANGEMENTS) as ArrangementId[]).filter(
    (id) => ARRANGEMENTS[id].group === group,
  );
}

export function familiesFor(
  selfOnly: boolean,
  arrangement: ArrangementId,
): FamilyStatus[] {
  return selfOnly || arrangement === "abroad"
    ? ["a"]
    : ["a", "b", "c", "d", "e"];
}

export function suggestedBenefits(
  arrangement: ArrangementId,
  family: FamilyStatus,
  officeSupport = false,
): string {
  if (arrangement === "abroad") return "Salary Only";

  if (arrangement === "vendor-office" && officeSupport) {
    return "Visa, Insurance & Ticket for self";
  }

  return family === "a"
    ? "Insurance & Travel Allowance"
    : "Insurance for all & Travel Allowance for self";
}

/**
 * Demo data transcribed from the three supplied screenshots.
 * Eight base grades and 151 arrangement/family configurations.
 * No hourly model was supplied.
 * Prefixes follow the screenshots.
 */
export function createSeedStore(): GradeStore {
  const source: Array<
    [string, StaffCategory, string, number, number | null]
  > = [
    ["8", "Office Staff", "Office Support", 0, 5000],
    ["7", "Office Staff", "Administrator / equivalent", 5001, 10000],
    [
      "6",
      "Office Staff",
      "Officer / Coordinator / equivalent",
      10001,
      15000,
    ],
    [
      "5",
      "Office Staff",
      "Executive / Accountant / equivalent",
      15001,
      20000,
    ],
    [
      "4",
      "Engineers & Specialist",
      "Junior Engineer / Specialist / equivalent",
      20001,
      25000,
    ],
    [
      "3",
      "Engineers & Specialist",
      "Engineer / Senior Specialist / equivalent",
      25001,
      30000,
    ],
    [
      "2",
      "Senior Staff",
      "Senior Engineer / Consultant / equivalent",
      30001,
      40000,
    ],
    [
      "1",
      "Senior Staff",
      "Senior Consultant / Senior Expert / equivalent",
      40001,
      null,
    ],
  ];

  const grades: JobGrade[] = source.map(
    ([code, category, designation, min, max], index) => ({
      id: `grade-${code}`,
      code,
      category,
      designation,
      salaryMinFils: min * 100,
      salaryMaxFils: max === null ? null : max * 100,
      active: true,
      sortOrder: index,
      selfOnly: code === "8",
    }),
  );

  const benefits = grades.flatMap((grade) =>
    (Object.keys(ARRANGEMENTS) as ArrangementId[])
      .filter(
        (arrangement) =>
          !(grade.code === "8" && arrangement === "national"),
      )
      .flatMap((arrangementId) =>
        familiesFor(grade.selfOnly, arrangementId).map(
          (familyStatus) => ({
            id: `${grade.id}:${arrangementId}:${familyStatus}`,
            gradeId: grade.id,
            arrangementId,
            familyStatus,
            mainBenefits: suggestedBenefits(
              arrangementId,
              familyStatus,
              grade.code === "8",
            ),
          }),
        ),
      ),
  );

  return {
    version: 1,
    revision: 0,
    grades,
    benefits,
  };
}