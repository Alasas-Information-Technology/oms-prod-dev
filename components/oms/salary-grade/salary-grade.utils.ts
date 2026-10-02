import { formatAmount } from "@/lib/money";
import {
  ARRANGEMENTS,
  CATEGORIES,
  FAMILIES,
  GROUPS,
  familiesFor,
} from "./salary-grade.data";
import type {
  ArrangementId,
  CreateGradeInput,
  FamilyStatus,
  GradeRow,
  GradeStore,
  JobGrade,
} from "./salary-grade.types";

export const normalise = (value: string) =>
  value.trim().replace(/\s+/g, " ").toLowerCase();

export const cellKey = (
  arrangement: ArrangementId,
  family: FamilyStatus,
) => `${arrangement}:${family}`;

export const fullCode = (
  grade: JobGrade,
  arrangement: ArrangementId,
  family: FamilyStatus,
) =>
  `${GROUPS[ARRANGEMENTS[arrangement].group].prefix}${grade.code}/${family}`;

export const salaryLabel = (grade: JobGrade) =>
  grade.salaryMaxFils === null
    ? `${formatAmount(grade.salaryMinFils)} and above`
    : `${formatAmount(grade.salaryMinFils)} – ${formatAmount(
        grade.salaryMaxFils,
      )}`;

export function parseAed(value: string): number | null {
  const input = value.trim();

  if (!/^\d+(?:\.\d{1,2})?$/.test(input)) return null;

  const [whole, fraction = ""] = input.split(".");
  const result =
    Number(whole) * 100 + Number(fraction.padEnd(2, "0"));

  return Number.isSafeInteger(result) ? result : null;
}

export function rowsFor(store: GradeStore): GradeRow[] {
  const grades = new Map(
    store.grades.map((grade) => [grade.id, grade]),
  );

  return store.benefits
    .flatMap((benefit) => {
      const grade = grades.get(benefit.gradeId);
      if (!grade) return [];

      return [
        {
          ...benefit,
          grade,
          group: ARRANGEMENTS[benefit.arrangementId].group,
          fullCode: fullCode(
            grade,
            benefit.arrangementId,
            benefit.familyStatus,
          ),
          designation: grade.designation,
          salaryMinFils: grade.salaryMinFils,
          familyLabel: FAMILIES[benefit.familyStatus],
        },
      ];
    })
    .sort(
      (a, b) =>
        a.grade.sortOrder - b.grade.sortOrder ||
        a.fullCode.localeCompare(b.fullCode) ||
        a.arrangementId.localeCompare(b.arrangementId),
    );
}

export function gradeError(
  grade: Omit<JobGrade, "id" | "sortOrder">,
): string | null {
  if (!CATEGORIES.includes(grade.category)) {
    return "Choose a staff category.";
  }

  if (
    !grade.designation.trim() ||
    grade.designation.trim().length > 100
  ) {
    return "Enter a designation of 1–100 characters.";
  }

  if (!/^[A-Z0-9]{1,4}$/.test(grade.code)) {
    return "Use 1–4 letters or numbers for the base code.";
  }

  if (
    !Number.isSafeInteger(grade.salaryMinFils) ||
    grade.salaryMinFils < 0
  ) {
    return "Enter a valid minimum salary with up to two decimal places.";
  }

  if (
    grade.salaryMaxFils !== null &&
    (!Number.isSafeInteger(grade.salaryMaxFils) ||
      grade.salaryMaxFils < grade.salaryMinFils)
  ) {
    return "Maximum salary must be at least the minimum salary.";
  }

  return null;
}

export function overlappingGrades(
  store: GradeStore,
  grade: Omit<JobGrade, "id" | "sortOrder">,
): JobGrade[] {
  return store.grades.filter(
    (existing) =>
      existing.salaryMinFils <=
        (grade.salaryMaxFils ?? Infinity) &&
      grade.salaryMinFils <=
        (existing.salaryMaxFils ?? Infinity),
  );
}

/**
 * Production APIs must repeat validation and enforce uniqueness
 * inside a database transaction.
 */
export function applyCreation(
  store: GradeStore,
  input: CreateGradeInput,
  makeId: () => string,
): { store: GradeStore; gradeId: string; added: number } {
  const existing = input.existingGradeId
    ? store.grades.find(
        (grade) => grade.id === input.existingGradeId,
      )
    : undefined;

  if (input.existingGradeId && !existing) {
    throw new Error(
      "The selected grade no longer exists. Select it again.",
    );
  }

  if (!existing && !input.grade) {
    throw new Error("Enter the new grade details.");
  }

  const grade: JobGrade = existing ?? {
    ...input.grade!,
    id: makeId(),
    sortOrder:
      Math.max(-1, ...store.grades.map((g) => g.sortOrder)) + 1,
  };

  const error = gradeError(grade);
  if (error) throw new Error(error);

  if (!existing) {
    const match = store.grades.find(
      (g) => normalise(g.code) === normalise(grade.code),
    );

    if (match) {
      throw new Error(
        `Grade ${match.code} already exists: ${match.designation}. Select the existing grade.`,
      );
    }

    const same = store.grades.find(
      (g) =>
        g.category === grade.category &&
        normalise(g.designation) ===
          normalise(grade.designation) &&
        g.salaryMinFils === grade.salaryMinFils &&
        g.salaryMaxFils === grade.salaryMaxFils,
    );

    if (same) {
      throw new Error(
        `These grade details already exist under base code ${same.code}. Select that grade to add a configuration.`,
      );
    }
  }

  if (
    input.group === "national" &&
    normalise(grade.designation) === "office support"
  ) {
    throw new Error(
      "Office Support is not available in the supplied UAE Nationals schedule.",
    );
  }

  if (!input.benefits.length) {
    throw new Error("Select at least one family configuration.");
  }

  const submitted = new Set<string>();

  const known = new Set(
    store.benefits
      .filter((b) => b.gradeId === grade.id)
      .map((b) => cellKey(b.arrangementId, b.familyStatus)),
  );

  const additions = input.benefits.flatMap((benefit) => {
    const model = ARRANGEMENTS[benefit.arrangementId];

    if (!model || model.group !== input.group) {
      throw new Error(
        "An arrangement does not belong to the chosen group.",
      );
    }

    if (
      !familiesFor(
        grade.selfOnly,
        benefit.arrangementId,
      ).includes(benefit.familyStatus)
    ) {
      throw new Error(
        "A selected family status is not allowed for this arrangement.",
      );
    }

    const key = cellKey(
      benefit.arrangementId,
      benefit.familyStatus,
    );

    if (submitted.has(key)) {
      throw new Error(
        "The same configuration was selected twice.",
      );
    }

    submitted.add(key);

    // Existing configurations are never overwritten.
    if (known.has(key)) return [];

    if (
      !benefit.mainBenefits.trim() ||
      benefit.mainBenefits.trim().length > 100
    ) {
      throw new Error(
        "Each new configuration needs benefits of 1–100 characters.",
      );
    }

    if (
      benefit.arrangementId === "abroad" &&
      benefit.mainBenefits.trim() !== "Salary Only"
    ) {
      throw new Error(
        "The abroad schedule uses Salary Only.",
      );
    }

    return [
      {
        ...benefit,
        mainBenefits: benefit.mainBenefits.trim(),
        gradeId: grade.id,
        id: makeId(),
      },
    ];
  });

  if (!additions.length) {
    throw new Error(
      "All selected configurations already exist. Nothing was created.",
    );
  }

  return {
    gradeId: grade.id,
    added: additions.length,
    store: {
      version: 1,
      revision: store.revision + 1,
      grades: existing
        ? store.grades
        : [
            ...store.grades,
            {
              ...grade,
              designation: grade.designation.trim(),
            },
          ],
      benefits: [...store.benefits, ...additions],
    },
  };
}

export function decodeStore(raw: string): GradeStore {
  const value: unknown = JSON.parse(raw);

  if (!value || typeof value !== "object") {
    throw new Error("Invalid saved grade data.");
  }

  const s = value as GradeStore;

  if (
    s.version !== 1 ||
    !Number.isSafeInteger(s.revision) ||
    s.revision < 0 ||
    !Array.isArray(s.grades) ||
    !Array.isArray(s.benefits)
  ) {
    throw new Error("Unsupported saved grade data.");
  }

  const ids = new Set<string>();
  const codes = new Set<string>();

  for (const g of s.grades) {
    if (
      !g ||
      typeof g.id !== "string" ||
      !g.id ||
      typeof g.code !== "string" ||
      typeof g.designation !== "string" ||
      typeof g.active !== "boolean" ||
      typeof g.selfOnly !== "boolean" ||
      !Number.isSafeInteger(g.sortOrder) ||
      gradeError(g) ||
      ids.has(g.id) ||
      codes.has(normalise(g.code))
    ) {
      throw new Error("Invalid saved grade record.");
    }

    ids.add(g.id);
    codes.add(normalise(g.code));
  }

  const keys = new Set<string>();
  const benefitIds = new Set<string>();

  for (const b of s.benefits) {
    const grade = s.grades.find(
      (g) => g.id === b?.gradeId,
    );

    if (
      !b ||
      !grade ||
      typeof b.id !== "string" ||
      !b.id ||
      !Object.hasOwn(ARRANGEMENTS, b.arrangementId) ||
      !Object.hasOwn(FAMILIES, b.familyStatus) ||
      typeof b.mainBenefits !== "string" ||
      !b.mainBenefits.trim() ||
      b.mainBenefits.length > 100 ||
      !familiesFor(
        grade.selfOnly,
        b.arrangementId,
      ).includes(b.familyStatus)
    ) {
      throw new Error("Invalid saved benefits.");
    }

    const key = `${b.gradeId}:${cellKey(
      b.arrangementId,
      b.familyStatus,
    )}`;

    if (keys.has(key) || benefitIds.has(b.id)) {
      throw new Error("Duplicate saved configurations.");
    }

    keys.add(key);
    benefitIds.add(b.id);
  }

  return s;
}