"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ARRANGEMENTS,
  CATEGORIES,
  FAMILIES,
  GROUPS,
  PENSION_NOTE,
  arrangementsFor,
  familiesFor,
  suggestedBenefits,
} from "./salary-grade.data";
import {
  cellKey,
  fullCode,
  gradeError,
  normalise,
  overlappingGrades,
  parseAed,
  salaryLabel,
} from "./salary-grade.utils";
import {
  GroupChoices,
  Notice,
  SelectField,
} from "./SalaryGradeFields";
import type {
  ArrangementId,
  CreateGradeInput,
  DeploymentGroup,
  FamilyStatus,
  GradeStore,
  JobGrade,
  StaffCategory,
} from "./salary-grade.types";
import styles from "./SalaryGrade.module.css";

interface Props {
  store: GradeStore;
  initialGradeId?: string;
  initialGroup?: DeploymentGroup;
  onClose: () => void;
  onSave: (
    input: CreateGradeInput,
  ) => { added: number; gradeId: string };
  onSaved: (result: { added: number; gradeId: string }) => void;
}

const STEPS = [
  "Group",
  "Grade details",
  "Arrangements & benefits",
  "Review",
];

const amountLabel = (fils: number) =>
  (fils / 100).toLocaleString("en-AE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export function CreateGradeDialog({
  store,
  initialGradeId,
  initialGroup,
  onClose,
  onSave,
  onSaved,
}: Props) {
  const initial = store.grades.find(
    (grade) => grade.id === initialGradeId,
  );

  const [step, setStep] = useState(0);

  const [group, setGroup] = useState<DeploymentGroup | "">(
    initialGroup ?? "",
  );

  const [category, setCategory] = useState<StaffCategory | "">(
    initial?.category ?? "",
  );

  const [designationChoice, setDesignationChoice] = useState(
    initial?.id ?? "",
  );

  const [designation, setDesignation] = useState(
    initial?.designation ?? "",
  );

  // Set only when explicitly reusing an existing base grade.
  const [existingId, setExistingId] = useState(
    initial?.id ?? "",
  );

  const [codeChoice, setCodeChoice] = useState("");
  const [code, setCode] = useState("");

  const [minimumChoice, setMinimumChoice] = useState("");
  const [minimum, setMinimum] = useState("");

  const [maximumChoice, setMaximumChoice] = useState("");
  const [maximum, setMaximum] = useState("");

  const [unbounded, setUnbounded] = useState(false);
  const [active, setActive] = useState(true);
  const [selfOnly, setSelfOnly] = useState(false);

  const [overlapAccepted, setOverlapAccepted] = useState(false);

  const [models, setModels] = useState<ArrangementId[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [benefits, setBenefits] = useState<Record<string, string>>(
    {},
  );

  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [discard, setDiscard] = useState(false);
  const [saving, setSaving] = useState(false);

  const existing = store.grades.find(
    (grade) => grade.id === existingId,
  );

  const draft: JobGrade = existing ?? {
    id: "new-grade",
    code: code.trim().toUpperCase(),
    category: category as StaffCategory,
    designation: designation.trim(),
    salaryMinFils: parseAed(minimum) ?? NaN,
    salaryMaxFils: unbounded ? null : parseAed(maximum) ?? NaN,
    active,
    sortOrder: 0,
    selfOnly:
      selfOnly || normalise(designation) === "office support",
  };

  const eligibleGrades = store.grades.filter(
    (grade) =>
      !(
        group === "national" &&
        normalise(grade.designation) === "office support"
      ),
  );

  const designationOptions = eligibleGrades
    .filter((grade) => grade.category === category)
    .map((grade) => ({
      value: grade.id,
      label: `${grade.designation} — Grade ${grade.code}`,
    }));

  const suggestedCodes = Array.from(
    { length: 99 },
    (_, index) => String(index + 1),
  )
    .filter(
      (value) =>
        !store.grades.some(
          (grade) => normalise(grade.code) === normalise(value),
        ),
    )
    .slice(0, 10)
    .map((value) => ({
      value,
      label: value,
    }));

  const minimumOptions = [
    ...new Set(store.grades.map((grade) => grade.salaryMinFils)),
  ]
    .sort((a, b) => a - b)
    .map((fils) => ({
      value: (fils / 100).toFixed(2),
      label: `AED ${amountLabel(fils)}`,
    }));

  const maximumOptions = [
    ...new Set(
      store.grades.flatMap((grade) =>
        grade.salaryMaxFils === null
          ? []
          : [grade.salaryMaxFils],
      ),
    ),
  ]
    .sort((a, b) => a - b)
    .map((fils) => ({
      value: (fils / 100).toFixed(2),
      label: `AED ${amountLabel(fils)}`,
    }));

  const matches = eligibleGrades.filter(
    (grade) =>
      grade.category === category &&
      normalise(designation).length > 0 &&
      normalise(grade.designation).includes(
        normalise(designation),
      ),
  );

  const codeMatch =
    !existing && draft.code
      ? store.grades.find(
          (grade) =>
            normalise(grade.code) === normalise(draft.code),
        )
      : undefined;

  const detailMatch = !existing
    ? store.grades.find(
        (grade) =>
          grade.category === category &&
          normalise(grade.designation) ===
            normalise(designation) &&
          grade.salaryMinFils === draft.salaryMinFils &&
          grade.salaryMaxFils === draft.salaryMaxFils,
      )
    : undefined;

  const overlaps =
    !existing && !gradeError(draft)
      ? overlappingGrades(store, draft)
      : [];

  const known = new Map(
    store.benefits
      .filter((benefit) => benefit.gradeId === existingId)
      .map((benefit) => [
        cellKey(benefit.arrangementId, benefit.familyStatus),
        benefit,
      ]),
  );

  const cells = models.flatMap((arrangementId) =>
    familiesFor(draft.selfOnly, arrangementId)
      .filter((family) =>
        selected.includes(cellKey(arrangementId, family)),
      )
      .map((familyStatus) => ({
        arrangementId,
        familyStatus,
        mainBenefits:
          known.get(cellKey(arrangementId, familyStatus))
            ?.mainBenefits ??
          benefits[cellKey(arrangementId, familyStatus)] ??
          suggestedBenefits(
            arrangementId,
            familyStatus,
            normalise(draft.designation) === "office support",
          ),
      })),
  );

  const newCells = cells.filter(
    (cell) =>
      !known.has(
        cellKey(cell.arrangementId, cell.familyStatus),
      ),
  );

  function changed() {
    setDirty(true);
    setError(null);
    setDiscard(false);
  }

  function clearConfigurations() {
    setModels([]);
    setSelected([]);
    setBenefits({});
  }

  function resetNewDetails() {
    setExistingId("");
    setDesignation("");

    setCode("");
    setCodeChoice("");

    setMinimum("");
    setMinimumChoice("");

    setMaximum("");
    setMaximumChoice("");

    setUnbounded(false);
    setActive(true);
    setSelfOnly(false);
    setOverlapAccepted(false);

    clearConfigurations();
  }

  function startNewDesignation() {
    changed();
    resetNewDetails();
    setDesignationChoice("new");
  }

  // Explicitly reuse an existing grade.
  // Its shared base details remain read-only.
  function chooseExisting(grade: JobGrade) {
    changed();

    setExistingId(grade.id);
    setDesignationChoice(grade.id);
    setCategory(grade.category);
    setDesignation(grade.designation);
    setOverlapAccepted(false);

    clearConfigurations();
  }

  // Use an existing post to create a separate, editable grade.
  function useDesignationForNewGrade(grade: JobGrade) {
    changed();
    resetNewDetails();

    setExistingId("");
    setDesignationChoice(grade.id);
    setDesignation(grade.designation);
    setCategory(grade.category);

    const min = (grade.salaryMinFils / 100).toFixed(2);
    setMinimum(min);
    setMinimumChoice(min);

    if (grade.salaryMaxFils === null) {
      setMaximum("");
      setMaximumChoice("above");
      setUnbounded(true);
    } else {
      const max = (grade.salaryMaxFils / 100).toFixed(2);
      setMaximum(max);
      setMaximumChoice(max);
      setUnbounded(false);
    }

    setActive(true);
    setSelfOnly(grade.selfOnly);

    // A separate new grade needs its own unused code.
    setCode("");
    setCodeChoice("");
  }

  function chooseGroup(value: DeploymentGroup) {
    changed();
    setGroup(value);
    clearConfigurations();

    if (
      value === "national" &&
      normalise(designation) === "office support"
    ) {
      resetNewDetails();
      setDesignationChoice("");
    }
  }

  function toggleModel(
    model: ArrangementId,
    checked: boolean,
  ) {
    changed();

    if (checked) {
      setModels((previous) =>
        previous.includes(model)
          ? previous
          : [...previous, model],
      );

      const key = cellKey(model, "a");

      setSelected((previous) =>
        previous.includes(key)
          ? previous
          : [...previous, key],
      );
    } else {
      setModels((previous) =>
        previous.filter((value) => value !== model),
      );

      setSelected((previous) =>
        previous.filter(
          (key) => !key.startsWith(`${model}:`),
        ),
      );
    }
  }

  function toggleFamily(
    model: ArrangementId,
    family: FamilyStatus,
    checked: boolean,
  ) {
    changed();

    const key = cellKey(model, family);

    setSelected((previous) =>
      checked
        ? previous.includes(key)
          ? previous
          : [...previous, key]
        : previous.filter((item) => item !== key),
    );
  }

  function validate(targetStep: number): string | null {
    if (!group) {
      return "Choose a deployment group.";
    }

    if (targetStep >= 1) {
      if (!category) {
        return "Choose a staff category.";
      }

      if (!designationChoice) {
        return "Choose a designation or select New designation.";
      }

      if (existingId && !existing) {
        return "The existing grade is no longer available. Choose it again.";
      }

      const problem = gradeError(draft);
      if (problem) return problem;

      if (codeMatch) {
        return `Base grade ${codeMatch.code} already exists. Choose another code or use the existing grade.`;
      }

      if (detailMatch) {
        return `These designation and salary details already exist under grade ${detailMatch.code}. Use that grade to add missing arrangements or family options.`;
      }

      if (
        group === "national" &&
        normalise(draft.designation) === "office support"
      ) {
        return "Office Support is not listed in the UAE Nationals reference. Choose another grade.";
      }

      if (overlaps.length && !overlapAccepted) {
        return "Review and confirm the overlapping salary bands before continuing.";
      }
    }

    if (targetStep >= 2) {
      if (!models.length) {
        return "Choose at least one work arrangement.";
      }

      if (
        models.some(
          (model) =>
            !cells.some(
              (cell) => cell.arrangementId === model,
            ),
        )
      ) {
        return "Choose at least one family option for each arrangement.";
      }

      if (
        newCells.some(
          (cell) =>
            !cell.mainBenefits.trim() ||
            cell.mainBenefits.trim().length > 100,
        )
      ) {
        return "Enter benefits of 1–100 characters for every new option.";
      }
    }

    return null;
  }

  function next() {
    const problem = validate(step);

    if (problem) {
      setError(problem);
      return;
    }

    setError(null);
    setStep((value) => value + 1);
  }

  function close() {
    if (saving) return;

    if (dirty) {
      setDiscard(true);
    } else {
      onClose();
    }
  }

  function save() {
    const problem = validate(2);

    if (problem) {
      setError(problem);
      return;
    }

    if (!group || !newCells.length) {
      setError(
        "All selected configurations already exist. Nothing was created.",
      );
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const input: CreateGradeInput = {
        group,
        benefits: cells,
      };

      if (existing) {
        input.existingGradeId = existing.id;
      } else {
        input.grade = {
          code: draft.code,
          category: draft.category,
          designation: draft.designation,
          salaryMinFils: draft.salaryMinFils,
          salaryMaxFils: draft.salaryMaxFils,
          active: draft.active,
          selfOnly: draft.selfOnly,
        };
      }

      onSaved(onSave(input));
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "The grade could not be saved. Please retry.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <DialogContent
        className={`${styles.dialog} sm:max-w-4xl`}
      >
        <DialogHeader>
          <DialogTitle>
            {existing
              ? "Add Grade Configuration"
              : "Create New Grade"}
          </DialogTitle>

          <DialogDescription>
            {existing
              ? "Use a saved grade and add missing arrangements or family options."
              : "Create a grade for an existing post or a new designation."}
          </DialogDescription>
        </DialogHeader>

        <ol
          className="grid grid-cols-2 gap-2 sm:grid-cols-4"
          aria-label="Form progress"
        >
          {STEPS.map((label, index) => (
            <li
              key={label}
              aria-current={
                step === index ? "step" : undefined
              }
              className={`rounded-md px-3 py-2 text-xs ${
                step === index
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {index + 1}. {label}
            </li>
          ))}
        </ol>

        <div className={`${styles.dialogBody} space-y-5`}>
          {error && <Notice error>{error}</Notice>}

          {step === 0 && (
            <GroupChoices
              value={group}
              onChange={chooseGroup}
            />
          )}

          {step === 1 && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField
                  id="create-category"
                  label="Staff category *"
                  value={category}
                  options={CATEGORIES.map((value) => ({
                    value,
                    label: value,
                  }))}
                  onChange={(value) => {
                    changed();
                    resetNewDetails();
                    setCategory(value as StaffCategory);
                    setDesignationChoice("");
                  }}
                />

                <SelectField
                  id="create-designation"
                  label="Designation / post *"
                  value={designationChoice}
                  disabled={!category}
                  placeholder="Select a designation"
                  options={[
                    ...designationOptions,
                    {
                      value: "new",
                      label: "+ New designation",
                    },
                  ]}
                  onChange={(value) => {
                    if (value === "new") {
                      startNewDesignation();
                      return;
                    }

                    const grade = store.grades.find(
                      (item) => item.id === value,
                    );

                    if (grade) {
                      useDesignationForNewGrade(grade);
                    }
                  }}
                />
              </div>

              {designationChoice === "new" && (
                <div className="space-y-1.5">
                  <Label
                    htmlFor="create-new-designation"
                    className="text-xs"
                  >
                    New designation / post name *
                  </Label>

                  <Input
                    id="create-new-designation"
                    value={designation}
                    maxLength={100}
                    placeholder="Enter the new post name"
                    onChange={(event) => {
                      changed();
                      setDesignation(event.target.value);
                      setOverlapAccepted(false);
                      clearConfigurations();
                    }}
                  />

                  <p className="text-[11px] text-muted-foreground">
                    Existing grades are checked as you enter
                    the name.
                  </p>
                </div>
              )}

              {!existing &&
                designationChoice !== "" &&
                designationChoice !== "new" && (
                  <Notice>
                    <strong>
                      Creating a new grade for: {designation}
                    </strong>
                    <p className="mt-1">
                      The selected post’s salary values have
                      been loaded as a starting point. You can
                      change them and choose new arrangements
                      or benefits. The original grade will not
                      be changed.
                    </p>
                  </Notice>
                )}

              {!existing && matches.length > 0 && (
                <div className="rounded-lg border p-3 space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Prefer to use a saved grade instead?
                    Select one below to add only its missing
                    arrangements or family options.
                  </p>

                  <SelectField
                    id="create-matching-grade"
                    label="Use an existing grade instead"
                    value=""
                    placeholder="Keep creating a new grade"
                    options={matches.map((grade) => ({
                      value: grade.id,
                      label: `${grade.designation} — Grade ${
                        grade.code
                      } — AED ${salaryLabel(grade)}`,
                    }))}
                    onChange={(value) => {
                      const grade = store.grades.find(
                        (item) => item.id === value,
                      );

                      if (grade) chooseExisting(grade);
                    }}
                  />
                </div>
              )}

              {(existing || designationChoice !== "") && (
                <>
                  {existing && (
                    <Notice>
                      <strong>
                        Using existing grade {existing.code}
                      </strong>

                      <p className="mt-1">
                        Its saved base details are read-only.
                        Continue to add missing arrangements or
                        family options.
                      </p>

                      {!existing.active && (
                        <p className="mt-2">
                          This grade is inactive. Its options
                          remain unavailable in Find a Grade.
                        </p>
                      )}

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() =>
                          useDesignationForNewGrade(existing)
                        }
                      >
                        Create a new grade for this post
                      </Button>
                    </Notice>
                  )}

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-3">
                      <SelectField
                        id="create-code"
                        label="Base grade code *"
                        value={
                          existing
                            ? existing.code
                            : codeChoice
                        }
                        disabled={Boolean(existing)}
                        placeholder="Select a code"
                        options={
                          existing
                            ? [
                                {
                                  value: existing.code,
                                  label: existing.code,
                                },
                              ]
                            : [
                                ...suggestedCodes,
                                {
                                  value: "custom",
                                  label: "+ Custom code",
                                },
                              ]
                        }
                        onChange={(value) => {
                          changed();
                          setCodeChoice(value);
                          setCode(
                            value === "custom" ? "" : value,
                          );
                        }}
                      />

                      {!existing &&
                        codeChoice === "custom" && (
                          <div className="space-y-1.5">
                            <Label
                              htmlFor="create-custom-code"
                              className="text-xs"
                            >
                              Enter custom code *
                            </Label>

                            <Input
                              id="create-custom-code"
                              maxLength={4}
                              value={code}
                              placeholder="e.g. A1"
                              aria-invalid={Boolean(codeMatch)}
                              onChange={(event) => {
                                changed();
                                setCode(
                                  event.target.value.toUpperCase(),
                                );
                              }}
                            />
                          </div>
                        )}

                      <p className="text-[11px] text-muted-foreground">
                        The group prefix is added automatically.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <SelectField
                        id="create-min"
                        label="Minimum salary (AED) *"
                        value={
                          existing
                            ? (
                                existing.salaryMinFils / 100
                              ).toFixed(2)
                            : minimumChoice
                        }
                        disabled={Boolean(existing)}
                        placeholder="Select minimum salary"
                        options={
                          existing
                            ? [
                                {
                                  value: (
                                    existing.salaryMinFils /
                                    100
                                  ).toFixed(2),
                                  label: `AED ${amountLabel(
                                    existing.salaryMinFils,
                                  )}`,
                                },
                              ]
                            : [
                                ...minimumOptions,
                                {
                                  value: "custom",
                                  label: "+ Custom amount",
                                },
                              ]
                        }
                        onChange={(value) => {
                          changed();
                          setMinimumChoice(value);
                          setMinimum(
                            value === "custom" ? "" : value,
                          );
                          setOverlapAccepted(false);
                        }}
                      />

                      {!existing &&
                        minimumChoice === "custom" && (
                          <div className="space-y-1.5">
                            <Label
                              htmlFor="create-custom-min"
                              className="text-xs"
                            >
                              Enter minimum salary *
                            </Label>

                            <Input
                              id="create-custom-min"
                              inputMode="decimal"
                              value={minimum}
                              placeholder="0.00"
                              onChange={(event) => {
                                changed();
                                setMinimum(event.target.value);
                                setOverlapAccepted(false);
                              }}
                            />
                          </div>
                        )}
                    </div>

                    <div className="space-y-3">
                      <SelectField
                        id="create-max"
                        label="Maximum salary (AED) *"
                        value={
                          existing
                            ? existing.salaryMaxFils === null
                              ? "above"
                              : (
                                  existing.salaryMaxFils / 100
                                ).toFixed(2)
                            : maximumChoice
                        }
                        disabled={Boolean(existing)}
                        placeholder="Select maximum salary"
                        options={
                          existing
                            ? [
                                {
                                  value:
                                    existing.salaryMaxFils ===
                                    null
                                      ? "above"
                                      : (
                                          existing.salaryMaxFils /
                                          100
                                        ).toFixed(2),
                                  label:
                                    existing.salaryMaxFils ===
                                    null
                                      ? "And above / no upper limit"
                                      : `AED ${amountLabel(
                                          existing.salaryMaxFils,
                                        )}`,
                                },
                              ]
                            : [
                                ...maximumOptions,
                                {
                                  value: "above",
                                  label:
                                    "And above / no upper limit",
                                },
                                {
                                  value: "custom",
                                  label: "+ Custom amount",
                                },
                              ]
                        }
                        onChange={(value) => {
                          changed();
                          setMaximumChoice(value);
                          setUnbounded(value === "above");
                          setMaximum(
                            value === "custom" ||
                              value === "above"
                              ? ""
                              : value,
                          );
                          setOverlapAccepted(false);
                        }}
                      />

                      {!existing &&
                        maximumChoice === "custom" && (
                          <div className="space-y-1.5">
                            <Label
                              htmlFor="create-custom-max"
                              className="text-xs"
                            >
                              Enter maximum salary *
                            </Label>

                            <Input
                              id="create-custom-max"
                              inputMode="decimal"
                              value={maximum}
                              placeholder="0.00"
                              onChange={(event) => {
                                changed();
                                setMaximum(event.target.value);
                                setOverlapAccepted(false);
                              }}
                            />
                          </div>
                        )}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <SelectField
                      id="create-status"
                      label="Grade status *"
                      value={
                        draft.active ? "active" : "inactive"
                      }
                      disabled={Boolean(existing)}
                      options={[
                        { value: "active", label: "Active" },
                        {
                          value: "inactive",
                          label: "Inactive",
                        },
                      ]}
                      onChange={(value) => {
                        changed();
                        setActive(value === "active");
                      }}
                    />

                    <SelectField
                      id="create-family-eligibility"
                      label="Family eligibility *"
                      value={draft.selfOnly ? "self" : "all"}
                      disabled={
                        Boolean(existing) ||
                        normalise(designation) ===
                          "office support"
                      }
                      options={[
                        {
                          value: "all",
                          label: "All family options",
                        },
                        {
                          value: "self",
                          label: "Self only",
                        },
                      ]}
                      onChange={(value) => {
                        changed();
                        setSelfOnly(value === "self");
                        clearConfigurations();
                      }}
                    />
                  </div>

                  {!existing && (codeMatch || detailMatch) && (
                    <Notice error>
                      This grade already exists:{" "}
                      <strong>
                        {(codeMatch ?? detailMatch)!.code}
                      </strong>{" "}
                      —{" "}
                      {(codeMatch ?? detailMatch)!.designation}.

                      <p className="mt-1">
                        Use the saved grade to add missing
                        configurations, or change the new grade
                        details.
                      </p>

                      <div className="mt-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            chooseExisting(
                              (codeMatch ?? detailMatch)!,
                            )
                          }
                        >
                          Use Existing Grade
                        </Button>
                      </div>
                    </Notice>
                  )}

                  {!existing &&
                    overlaps.length > 0 &&
                    !codeMatch &&
                    !detailMatch && (
                      <Notice>
                        Salary range overlaps with:{" "}
                        {overlaps
                          .map(
                            (grade) =>
                              `${grade.code} (${salaryLabel(
                                grade,
                              )})`,
                          )
                          .join("; ")}
                        .

                        <div className="mt-3">
                          <SelectField
                            id="create-overlap-review"
                            label="Confirm salary range"
                            value={
                              overlapAccepted
                                ? "confirmed"
                                : ""
                            }
                            placeholder="Select confirmation"
                            options={[
                              {
                                value: "confirmed",
                                label:
                                  "Reviewed — this is a different grade",
                              },
                              {
                                value: "review",
                                label:
                                  "I need to review the range",
                              },
                            ]}
                            onChange={(value) => {
                              changed();
                              setOverlapAccepted(
                                value === "confirmed",
                              );
                            }}
                          />
                        </div>
                      </Notice>
                    )}
                </>
              )}
            </>
          )}

          {step === 2 && group && (
            <>
              <div className="rounded-lg border bg-muted/20 p-3 text-sm">
                <strong>{draft.designation}</strong>
                <p className="mt-1 text-xs text-muted-foreground">
                  Grade {draft.code} · AED {salaryLabel(draft)}
                </p>
              </div>

              <fieldset className="space-y-3">
                <legend className="mb-2 text-sm font-semibold">
                  Choose one or more arrangements
                </legend>

                {arrangementsFor(group).map((model) => (
                  <label
                    key={model}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Checkbox
                      checked={models.includes(model)}
                      onCheckedChange={(checked) =>
                        toggleModel(model, checked === true)
                      }
                    />
                    {ARRANGEMENTS[model].label}
                  </label>
                ))}
              </fieldset>

              {models.map((model) => (
                <fieldset
                  key={model}
                  className="rounded-lg border p-4 space-y-3"
                >
                  <legend className="px-2 text-sm font-semibold">
                    {ARRANGEMENTS[model].label}
                  </legend>

                  {familiesFor(draft.selfOnly, model).map(
                    (family) => {
                      const key = cellKey(model, family);
                      const saved = known.get(key);
                      const checked = selected.includes(key);

                      return (
                        <div
                          key={key}
                          className="rounded-md border border-border/60 p-3"
                        >
                          <label className="flex flex-wrap items-center gap-2 text-xs">
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(value) =>
                                toggleFamily(
                                  model,
                                  family,
                                  value === true,
                                )
                              }
                            />

                            <span className="font-medium">
                              {FAMILIES[family]}
                            </span>

                            <span className="font-mono text-primary">
                              {fullCode(draft, model, family)}
                            </span>

                            {saved && (
                              <span className="rounded bg-muted px-2 py-0.5 text-muted-foreground">
                                Already exists
                              </span>
                            )}
                          </label>

                          {checked &&
                            (saved ? (
                              <p className="mt-2 text-xs text-muted-foreground">
                                Saved benefits:{" "}
                                {saved.mainBenefits}. This
                                configuration will not be
                                changed or duplicated.
                              </p>
                            ) : (
                              <div className="mt-3 space-y-1">
                                <Label
                                  htmlFor={`benefit-${model}-${family}`}
                                  className="text-xs"
                                >
                                  Main benefits *
                                </Label>

                                <Textarea
                                  id={`benefit-${model}-${family}`}
                                  className="min-h-16 text-xs"
                                  maxLength={100}
                                  readOnly={model === "abroad"}
                                  value={
                                    benefits[key] ??
                                    suggestedBenefits(
                                      model,
                                      family,
                                      normalise(
                                        draft.designation,
                                      ) === "office support",
                                    )
                                  }
                                  onChange={(event) => {
                                    changed();
                                    setBenefits((previous) => ({
                                      ...previous,
                                      [key]: event.target.value,
                                    }));
                                  }}
                                />
                              </div>
                            ))}
                        </div>
                      );
                    },
                  )}

                  {(model === "abroad" || draft.selfOnly) && (
                    <p className="text-xs text-muted-foreground">
                      Only Self is available for this
                      arrangement / grade.
                    </p>
                  )}
                </fieldset>
              ))}

              {group === "national" && (
                <Notice>{PENSION_NOTE}</Notice>
              )}
            </>
          )}

          {step === 3 && group && (
            <>
              <dl className="grid gap-4 rounded-lg border bg-muted/20 p-4 sm:grid-cols-2 text-sm">
                {[
                  ["Group", GROUPS[group].label],
                  ["Category", draft.category],
                  ["Designation", draft.designation],
                  ["Base grade", draft.code],
                  ["Salary range (AED)", salaryLabel(draft)],
                  [
                    "Status",
                    draft.active ? "Active" : "Inactive",
                  ],
                  [
                    "Family eligibility",
                    draft.selfOnly
                      ? "Self only"
                      : "All family options",
                  ],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs text-muted-foreground">
                      {label}
                    </dt>
                    <dd className="mt-1 font-medium">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>

              <Notice>
                {newCells.length} new configuration
                {newCells.length === 1 ? "" : "s"} will be
                added. {cells.length - newCells.length} already
                exist and will be kept unchanged.

                {!newCells.length && (
                  <p className="mt-1 font-semibold">
                    Everything selected already exists. Go
                    back to change selections or close this
                    form.
                  </p>
                )}
              </Notice>

              <div className="space-y-2">
                {cells.map((cell) => (
                  <div
                    key={cellKey(
                      cell.arrangementId,
                      cell.familyStatus,
                    )}
                    className="rounded-lg border p-3 text-xs space-y-1"
                  >
                    <p className="flex flex-wrap justify-between gap-2">
                      <strong className="font-mono text-primary">
                        {fullCode(
                          draft,
                          cell.arrangementId,
                          cell.familyStatus,
                        )}
                      </strong>

                      <span>
                        {known.has(
                          cellKey(
                            cell.arrangementId,
                            cell.familyStatus,
                          ),
                        )
                          ? "Already exists"
                          : "New"}
                      </span>
                    </p>

                    <p>
                      {ARRANGEMENTS[cell.arrangementId].label}{" "}
                      · {FAMILIES[cell.familyStatus]}
                    </p>

                    <p className="text-muted-foreground">
                      {cell.mainBenefits}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {discard && (
          <Notice>
            Discard your unsaved changes?

            <div className="mt-2 flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDiscard(false)}
              >
                Keep Editing
              </Button>

              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={onClose}
              >
                Discard Changes
              </Button>
            </div>
          </Notice>
        )}

        <DialogFooter className="mt-0 border-t pt-4 sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={close}
            disabled={saving}
          >
            Cancel
          </Button>

          <div className="flex gap-2">
            {step > 0 && (
              <Button
                type="button"
                variant="outline"
                disabled={saving}
                onClick={() => {
                  setError(null);
                  setStep((value) => value - 1);
                }}
              >
                Back
              </Button>
            )}

            {step < 3 ? (
              <Button type="button" onClick={next}>
                Next
              </Button>
            ) : (
              <Button
                type="button"
                disabled={saving || !newCells.length}
                onClick={save}
              >
                {saving
                  ? "Saving…"
                  : existing
                    ? "Add Configuration"
                    : "Create Grade"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}