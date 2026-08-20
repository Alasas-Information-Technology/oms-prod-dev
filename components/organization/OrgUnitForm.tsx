"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { OrgUnitPicker } from "./OrgUnitPicker";
import {
  useOrgUnitTypes,
  useOrgUnit,
} from "@/hooks/useOrganization";
import {
  CreateOrgUnitDto,
  UpdateOrgUnitDto,
  OrgUnitDetailDto,
  OrgUnitSummaryDto,
} from "@/lib/types/organization.types";

const orgUnitSchema = z.object({
  code: z
    .string()
    .min(1, "Code is required")
    .max(50, "Code cannot exceed 50 characters")
    .regex(
      /^[A-Z0-9][A-Z0-9_-]{1,49}$/,
      "Code must be 2-50 alphanumeric characters (uppercase letters, numbers, hyphens, underscores)"
    ),
  name: z.string().min(1, "Name is required").max(200, "Name cannot exceed 200 characters"),
  nameAr: z.string().max(200, "Arabic name cannot exceed 200 characters").optional().nullable(),
  shortName: z.string().max(50, "Short name cannot exceed 50 characters").optional().nullable(),
  description: z.string().max(1000, "Description cannot exceed 1000 characters").optional().nullable(),
  orgUnitTypeId: z.coerce.number({ invalid_type_error: "Unit type is required" }).min(1, "Unit type is required"),
  parentOrgUnitId: z.string().optional().nullable(),
  costCenterCode: z.string().max(50).optional().nullable(),
  oracleOrgCode: z.string().max(50).optional().nullable(),
  emailAddress: z.string().email("Invalid email address").max(200).optional().nullable().or(z.literal("")),
  phoneNumber: z.string().max(50).optional().nullable(),
  sortOrder: z.coerce.number().min(0).default(0),
  effectiveFrom: z.string().min(1, "Effective From date is required"),
  effectiveTo: z.string().optional().nullable().or(z.literal("")),
});

export type OrgUnitFormData = z.infer<typeof orgUnitSchema>;

export interface OrgUnitFormProps {
  initialData?: Partial<OrgUnitDetailDto> | null;
  defaultParent?: OrgUnitSummaryDto | null;
  onSubmit: (data: any) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  isEdit?: boolean;
}

export function OrgUnitForm({
  initialData,
  defaultParent,
  onSubmit,
  onCancel,
  isSubmitting = false,
  isEdit = false,
}: OrgUnitFormProps) {
  const [selectedParentId, setSelectedParentId] = React.useState<string | null>(
    initialData?.parentOrgUnitId || defaultParent?.orgUnitId || null
  );

  const { data: parentDetail } = useOrgUnit(selectedParentId || "");
  const { data: allTypesData } = useOrgUnitTypes();

  const today = new Date().toISOString().split("T")[0];

  const form = useForm<OrgUnitFormData>({
    resolver: zodResolver(orgUnitSchema) as any,
    defaultValues: {
      code: initialData?.code || "",
      name: initialData?.name || "",
      nameAr: initialData?.nameAr || "",
      shortName: initialData?.shortName || "",
      description: initialData?.description || "",
      orgUnitTypeId: initialData?.orgUnitTypeId || 0,
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

  // Filter allowed unit types based on selected parent type
  const availableTypes = React.useMemo(() => {
    if (!allTypesData) return [];
    if (!selectedParentId) {
      // Root level (depth 0) only allows ORGANIZATION type (canonicalLevel = 1)
      return allTypesData.filter((t) => t.canonicalLevel === 1);
    }
    if (!parentDetail) {
      return allTypesData;
    }
    const parentTypeId = parentDetail.orgUnitTypeId;
    // Hierarchy Matrix Rules:
    // Organization (1) -> Business Unit (2), Department (3)
    // Business Unit (2) -> Department (3)
    // Department (3) -> Section (4)
    return allTypesData.filter((childType) => {
      if (parentTypeId === 1) return childType.orgUnitTypeId === 2 || childType.orgUnitTypeId === 3;
      if (parentTypeId === 2) return childType.orgUnitTypeId === 3;
      if (parentTypeId === 3) return childType.orgUnitTypeId === 4;
      return false;
    });
  }, [allTypesData, selectedParentId, parentDetail]);

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

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      {/* Parent Organization Unit (Creation only) */}
      {!isEdit && (
        <div className="space-y-2">
          <Label className="text-sm font-semibold">
            Parent Organization Unit <span className="text-muted-foreground font-normal">(Leave empty for Root Organization)</span>
          </Label>
          <OrgUnitPicker
            value={selectedParentId}
            onChange={(unit) => {
              setSelectedParentId(unit ? unit.orgUnitId : null);
              form.setValue("parentOrgUnitId", unit ? unit.orgUnitId : null);
              // Reset type selection if it no longer matches allowed rules
              form.setValue("orgUnitTypeId", 0);
            }}
            placeholder="Select Parent Organization Unit..."
          />
        </div>
      )}

      {/* Basic Attributes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Unit Type */}
        <div className="space-y-2">
          <Label htmlFor="orgUnitTypeId" className="text-sm font-semibold">
            Unit Type <span className="text-destructive">*</span>
          </Label>
          <Select
            disabled={isEdit}
            value={form.watch("orgUnitTypeId") ? String(form.watch("orgUnitTypeId")) : ""}
            onValueChange={(val) => form.setValue("orgUnitTypeId", Number(val))}
          >
            <SelectTrigger id="orgUnitTypeId">
              <SelectValue placeholder="Select Unit Type..." />
            </SelectTrigger>
            <SelectContent>
              {availableTypes.map((type) => (
                <SelectItem key={type.orgUnitTypeId} value={String(type.orgUnitTypeId)}>
                  {type.name} ({type.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.orgUnitTypeId && (
            <p className="text-xs text-destructive">{form.formState.errors.orgUnitTypeId.message}</p>
          )}
        </div>

        {/* Code */}
        <div className="space-y-2">
          <Label htmlFor="code" className="text-sm font-semibold">
            Unit Code <span className="text-destructive">*</span>
          </Label>
          <Input
            id="code"
            placeholder="e.g. FIN_DEPT"
            {...form.register("code")}
            className="font-mono uppercase"
            onChange={(e) => form.setValue("code", e.target.value.toUpperCase())}
          />
          {form.formState.errors.code && (
            <p className="text-xs text-destructive">{form.formState.errors.code.message}</p>
          )}
        </div>

        {/* Name (English) */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-semibold">
            Unit Name (English) <span className="text-destructive">*</span>
          </Label>
          <Input id="name" placeholder="e.g. Finance & Accounting" {...form.register("name")} />
          {form.formState.errors.name && (
            <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
          )}
        </div>

        {/* Name (Arabic) */}
        <div className="space-y-2">
          <Label htmlFor="nameAr" className="text-sm font-semibold">
            Unit Name (Arabic)
          </Label>
          <Input
            id="nameAr"
            placeholder="مثال: الشؤون المالية"
            dir="rtl"
            className="font-arabic text-right"
            {...form.register("nameAr")}
          />
          {form.formState.errors.nameAr && (
            <p className="text-xs text-destructive">{form.formState.errors.nameAr.message}</p>
          )}
        </div>

        {/* Short Name */}
        <div className="space-y-2">
          <Label htmlFor="shortName" className="text-sm font-semibold">
            Short Name
          </Label>
          <Input id="shortName" placeholder="e.g. FIN" {...form.register("shortName")} />
        </div>

        {/* Cost Center Code */}
        <div className="space-y-2">
          <Label htmlFor="costCenterCode" className="text-sm font-semibold">
            Cost Center Code
          </Label>
          <Input id="costCenterCode" placeholder="e.g. CC-1002" {...form.register("costCenterCode")} />
        </div>

        {/* Oracle Org Code */}
        <div className="space-y-2">
          <Label htmlFor="oracleOrgCode" className="text-sm font-semibold">
            Oracle Org Code
          </Label>
          <Input id="oracleOrgCode" placeholder="e.g. ORCL-883" {...form.register("oracleOrgCode")} />
        </div>

        {/* Sort Order */}
        <div className="space-y-2">
          <Label htmlFor="sortOrder" className="text-sm font-semibold">
            Display Sort Order
          </Label>
          <Input id="sortOrder" type="number" min={0} {...form.register("sortOrder")} />
        </div>

        {/* Email Address */}
        <div className="space-y-2">
          <Label htmlFor="emailAddress" className="text-sm font-semibold">
            Contact Email
          </Label>
          <Input id="emailAddress" type="email" placeholder="finance@diez.ae" {...form.register("emailAddress")} />
          {form.formState.errors.emailAddress && (
            <p className="text-xs text-destructive">{form.formState.errors.emailAddress.message}</p>
          )}
        </div>

        {/* Phone Number */}
        <div className="space-y-2">
          <Label htmlFor="phoneNumber" className="text-sm font-semibold">
            Contact Phone
          </Label>
          <Input id="phoneNumber" placeholder="+971 4 123 4567" {...form.register("phoneNumber")} />
        </div>

        {/* Effective From */}
        <div className="space-y-2">
          <Label htmlFor="effectiveFrom" className="text-sm font-semibold">
            Effective From <span className="text-destructive">*</span>
          </Label>
          <Input id="effectiveFrom" type="date" {...form.register("effectiveFrom")} />
          {form.formState.errors.effectiveFrom && (
            <p className="text-xs text-destructive">{form.formState.errors.effectiveFrom.message}</p>
          )}
        </div>

        {/* Effective To */}
        <div className="space-y-2">
          <Label htmlFor="effectiveTo" className="text-sm font-semibold">
            Effective To
          </Label>
          <Input id="effectiveTo" type="date" {...form.register("effectiveTo")} />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-semibold">
          Description
        </Label>
        <Textarea
          id="description"
          rows={3}
          placeholder="Detailed functional mandate of this unit..."
          {...form.register("description")}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
