"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Loader2,
  Building2,
  Briefcase,
  Building,
  Layers,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Check,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { OrgUnitPicker } from "./OrgUnitPicker";
import {
  useOrgUnitTypes,
  useOrgUnit,
} from "@/hooks/useOrganization";
import {
  OrgUnitDetailDto,
  OrgUnitSummaryDto,
  OrgUnitEntity,
} from "@/lib/types/organization.types";
import { cn } from "@/components/ui/utils";

const orgUnitSchema = z.object({
  code: z
    .string()
    .min(1, "Please enter a short code (e.g. HR_DEPT)")
    .max(50, "Code cannot exceed 50 characters")
    .regex(
      /^[A-Z0-9][A-Z0-9_-]{0,49}$/,
      "Code must use letters, numbers, hyphens, or underscores"
    ),
  name: z.string().min(1, "Please enter a unit name").max(200, "Name is too long"),
  nameAr: z.string().max(200).optional().nullable(),
  shortName: z.string().max(50).optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  orgUnitTypeId: z.coerce.number().min(1, "Please select a unit type"),
  parentOrgUnitId: z.string().optional().nullable(),
  costCenterCode: z.string().max(50).optional().nullable(),
  oracleOrgCode: z.string().max(50).optional().nullable(),
  emailAddress: z.string().email("Please enter a valid email").max(200).optional().nullable().or(z.literal("")),
  phoneNumber: z.string().max(50).optional().nullable(),
  sortOrder: z.coerce.number().min(0).default(0),
  effectiveFrom: z.string().min(1, "Start date is required"),
  effectiveTo: z.string().optional().nullable().or(z.literal("")),
});

export type OrgUnitFormData = z.infer<typeof orgUnitSchema>;

export interface OrgUnitFormProps {
  initialData?: Partial<OrgUnitDetailDto> | null;
  defaultParent?: OrgUnitSummaryDto | OrgUnitEntity | null;
  parentUnit?: OrgUnitSummaryDto | OrgUnitEntity | null;
  targetTypeId?: number; // 1: Organization, 2: Business Unit, 3: Department, 4: Section
  onSubmit: (data: any) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  isLoading?: boolean;
  isEdit?: boolean;
}

export function OrgUnitForm({
  initialData,
  defaultParent,
  parentUnit,
  targetTypeId,
  onSubmit,
  onCancel,
  isSubmitting = false,
  isLoading = false,
  isEdit = false,
}: OrgUnitFormProps) {
  const effectiveParent = parentUnit || defaultParent;
  const effectiveSubmitting = isSubmitting || isLoading;

  const [selectedParentId, setSelectedParentId] = React.useState<string | null>(
    initialData?.parentOrgUnitId || effectiveParent?.orgUnitId || null
  );
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [codeManuallyEdited, setCodeManuallyEdited] = React.useState(!!initialData?.code);

  const { data: parentDetail } = useOrgUnit(selectedParentId || "");
  const { data: allTypesData } = useOrgUnitTypes();

  const today = new Date().toISOString().split("T")[0];

  // Determine initial type ID
  const initialTypeId =
    initialData?.orgUnitTypeId ||
    targetTypeId ||
    (defaultParent ? (defaultParent.orgUnitTypeId === 1 ? 2 : defaultParent.orgUnitTypeId === 2 ? 3 : 4) : 0);

  const form = useForm<OrgUnitFormData>({
    resolver: zodResolver(orgUnitSchema) as any,
    defaultValues: {
      code: initialData?.code || "",
      name: initialData?.name || "",
      nameAr: initialData?.nameAr || "",
      shortName: initialData?.shortName || "",
      description: initialData?.description || "",
      orgUnitTypeId: initialTypeId,
      parentOrgUnitId: initialData?.parentOrgUnitId || defaultParent?.orgUnitId || null,
      costCenterCode: initialData?.costCenterCode || "",
      oracleOrgCode: initialData?.oracleOrgCode || "",
      emailAddress: initialData?.emailAddress || "",
      phoneNumber: initialData?.phoneNumber || "",
      sortOrder: initialData?.sortOrder ?? 0,
      effectiveFrom: initialData?.effectiveFrom
        ? String(initialData.effectiveFrom).split("T")[0]
        : today,
      effectiveTo: initialData?.effectiveTo
        ? String(initialData.effectiveTo).split("T")[0]
        : "",
    },
  });

  const currentTypeId = form.watch("orgUnitTypeId");

  // Filter allowed unit types based on selected parent
  const availableTypes = React.useMemo(() => {
    if (!allTypesData) return [];
    if (targetTypeId) {
      return allTypesData.filter((t) => t.orgUnitTypeId === targetTypeId);
    }
    if (!selectedParentId) {
      return allTypesData.filter((t) => t.canonicalLevel === 1 || t.orgUnitTypeId === 1);
    }
    if (!parentDetail) {
      return allTypesData;
    }
    const parentTypeId = parentDetail.orgUnitTypeId;
    return allTypesData.filter((childType) => {
      if (parentTypeId === 1) return childType.orgUnitTypeId === 2 || childType.orgUnitTypeId === 3;
      if (parentTypeId === 2) return childType.orgUnitTypeId === 3;
      if (parentTypeId === 3) return childType.orgUnitTypeId === 4;
      return false;
    });
  }, [allTypesData, selectedParentId, parentDetail, targetTypeId]);

  // Set default type when availableTypes changes
  React.useEffect(() => {
    if (availableTypes.length > 0 && !form.getValues("orgUnitTypeId")) {
      form.setValue("orgUnitTypeId", availableTypes[0].orgUnitTypeId);
    }
  }, [availableTypes, form]);

  // Smart Code Generator from Name
  const handleNameChange = (nameVal: string) => {
    form.setValue("name", nameVal);
    if (!codeManuallyEdited && !isEdit) {
      const generatedCode = nameVal
        .toUpperCase()
        .replace(/[^A-Z0-9\s]/g, "")
        .trim()
        .replace(/\s+/g, "_")
        .slice(0, 30);
      form.setValue("code", generatedCode);
    }
  };

  const handleSubmit = async (values: OrgUnitFormData) => {
    const payload = {
      ...values,
      code: values.code.toUpperCase().trim(),
      name: values.name.trim(),
      nameAr: values.nameAr ? values.nameAr.trim() : null,
      shortName: values.shortName ? values.shortName.trim() : null,
      description: values.description ? values.description.trim() : null,
      costCenterCode: values.costCenterCode ? values.costCenterCode.trim() : null,
      oracleOrgCode: values.oracleOrgCode ? values.oracleOrgCode.trim() : null,
      emailAddress: values.emailAddress ? values.emailAddress.trim() : null,
      phoneNumber: values.phoneNumber ? values.phoneNumber.trim() : null,
      effectiveTo: values.effectiveTo ? values.effectiveTo : null,
      parentOrgUnitId: selectedParentId || undefined,
    };
    await onSubmit(payload);
  };

  const getTypeMeta = (typeId: number) => {
    switch (typeId) {
      case 1:
        return {
          icon: Building2,
          color: "text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20",
          tag: "Holding Company",
          hint: "Top-level holding organization (e.g. DIEZ)",
        };
      case 2:
        return {
          icon: Briefcase,
          color: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20",
          tag: "Business Unit",
          hint: "Major executive division",
        };
      case 3:
        return {
          icon: Building,
          color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
          tag: "Department",
          hint: "Functional department holding operational budgets",
        };
      default:
        return {
          icon: Layers,
          color: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
          tag: "Section",
          hint: "Operational team reporting to a department",
        };
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      {/* 1. Unit Type Selection (Visual Cards) */}
      {!isEdit && availableTypes.length > 1 && (
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            1. Select Type
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {availableTypes.map((t) => {
              const meta = getTypeMeta(t.orgUnitTypeId);
              const Icon = meta.icon;
              const isSelected = currentTypeId === t.orgUnitTypeId;
              return (
                <button
                  type="button"
                  key={t.orgUnitTypeId}
                  onClick={() => form.setValue("orgUnitTypeId", t.orgUnitTypeId)}
                  className={cn(
                    "relative flex items-start gap-3 p-4 rounded-md border text-left transition-all duration-150",
                    isSelected
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs"
                      : "border-border bg-card hover:bg-muted/40 hover:border-border/80"
                  )}
                >
                  <div className={cn("p-2.5 rounded-lg shrink-0 border", meta.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-foreground leading-tight">{t.name}</p>
                      {isSelected && (
                        <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                          <Check className="h-3 w-3" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-snug">{meta.hint}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Reports to Selection */}
      {!isEdit && (
        <div className="space-y-2 p-4 rounded-md bg-muted/30 border border-border">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              2. Reports to
            </Label>
            {selectedParentId && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-muted-foreground hover:text-foreground px-2"
                onClick={() => {
                  setSelectedParentId(null);
                  form.setValue("parentOrgUnitId", null);
                }}
              >
                Make top level
              </Button>
            )}
          </div>
          <OrgUnitPicker
            value={selectedParentId}
            onChange={(unit) => {
              setSelectedParentId(unit ? unit.orgUnitId : null);
              form.setValue("parentOrgUnitId", unit ? unit.orgUnitId : null);
            }}
            placeholder="Search and choose where this reports to..."
          />
        </div>
      )}

      {/* 3. Essential Details */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            3. Details
          </Label>
        </div>

        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-sm font-semibold text-foreground">
              Name (English) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g. Software Engineering"
              value={form.watch("name")}
              onChange={(e) => handleNameChange(e.target.value)}
              className="text-base h-11 shadow-2xs"
            />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="nameAr" className="text-sm font-semibold text-muted-foreground">
              Name (Arabic - Optional)
            </Label>
            <Input
              id="nameAr"
              placeholder="مثال: هندسة البرمجيات"
              dir="rtl"
              className="font-arabic text-right text-base h-11 shadow-2xs"
              {...form.register("nameAr")}
            />
          </div>
        </div>

        {/* Code & Cost Centre */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="code" className="text-sm font-semibold text-foreground">
                Code <span className="text-destructive">*</span>
              </Label>
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-500" />
                Auto-generated
              </span>
            </div>
            <Input
              id="code"
              placeholder="e.g. SOFTWARE_ENG"
              {...form.register("code")}
              onChange={(e) => {
                setCodeManuallyEdited(true);
                form.setValue("code", e.target.value.toUpperCase());
              }}
              className="font-mono uppercase text-sm h-11 tracking-wider shadow-2xs"
            />
            {form.formState.errors.code && (
              <p className="text-xs text-destructive">{form.formState.errors.code.message}</p>
            )}
          </div>

          {/* Cost Centre */}
          <div className="space-y-1.5">
            <Label htmlFor="costCenterCode" className="text-sm font-semibold text-foreground">
              Cost centre (Optional)
            </Label>
            <Input
              id="costCenterCode"
              placeholder="e.g. CC-1040"
              {...form.register("costCenterCode")}
              className="font-mono uppercase text-sm h-11 shadow-2xs"
            />
            <p className="text-[11px] text-muted-foreground">
              Used for financial budget tracking.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Optional Details Accordion */}
      <div className="rounded-md border border-border/80 bg-card overflow-hidden">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between px-4 py-3.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            <span>Optional details (Dates & contact)</span>
          </div>
          {showAdvanced ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {showAdvanced && (
          <div className="p-4 pt-2 border-t border-border/60 space-y-4 bg-muted/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="effectiveFrom" className="text-xs font-semibold">
                  Start date
                </Label>
                <Input id="effectiveFrom" type="date" {...form.register("effectiveFrom")} className="h-9 text-sm" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="effectiveTo" className="text-xs font-semibold">
                  End date
                </Label>
                <Input id="effectiveTo" type="date" {...form.register("effectiveTo")} className="h-9 text-sm" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="emailAddress" className="text-xs font-semibold">
                  Contact Email
                </Label>
                <Input
                  id="emailAddress"
                  type="email"
                  placeholder="department@diez.ae"
                  {...form.register("emailAddress")}
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phoneNumber" className="text-xs font-semibold">
                  Contact Phone
                </Label>
                <Input
                  id="phoneNumber"
                  placeholder="+971 4 123 4567"
                  {...form.register("phoneNumber")}
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="oracleOrgCode" className="text-xs font-semibold">
                  Oracle ERP Code
                </Label>
                <Input
                  id="oracleOrgCode"
                  placeholder="e.g. ORCL_801"
                  {...form.register("oracleOrgCode")}
                  className="font-mono h-9 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="shortName" className="text-xs font-semibold">
                  Short Acronym
                </Label>
                <Input
                  id="shortName"
                  placeholder="e.g. ENG"
                  {...form.register("shortName")}
                  className="h-9 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs font-semibold">
                Description / Purpose
              </Label>
              <Textarea
                id="description"
                rows={2}
                placeholder="Brief purpose or operational scope of this unit..."
                {...form.register("description")}
                className="text-sm resize-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* 5. Footer Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={effectiveSubmitting}
            className="h-11 px-6 text-sm font-medium"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={effectiveSubmitting}
          className="h-11 px-8 text-sm font-semibold gap-2 shadow-xs min-w-[150px]"
        >
          {effectiveSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : isEdit ? (
            "Save Changes"
          ) : (
            "Create Unit"
          )}
        </Button>
      </div>
    </form>
  );
}
