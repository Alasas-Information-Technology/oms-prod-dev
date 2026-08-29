"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  FileSpreadsheet,
  ArrowLeft,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Users,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  useValidateImport,
  useCommitImport,
} from "@/hooks/useAuthorization";
import { userImportApi } from "@/lib/api/authorization";
import { usePermission } from "@/hooks/usePermission";
import { ImportValidationResultDto, UserImportRowDto } from "@/lib/types/authorization.types";
import { toast } from "sonner";

export default function UserImportPage() {
  const router = useRouter();
  const { can } = usePermission();

  const [csvText, setCsvText] = React.useState<string>("");
  const [validationResult, setValidationResult] = React.useState<ImportValidationResultDto | null>(null);

  const validateMutation = useValidateImport();
  const commitMutation = useCommitImport();

  if (!can("USER.IMPORT")) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold text-foreground">Access Restricted</h2>
        <p className="text-sm text-muted-foreground">
          You lack [USER.IMPORT] permission required to execute bulk onboarding operations.
        </p>
        <Button onClick={() => router.push("/app/administration/users")}>
          Return to Users
        </Button>
      </div>
    );
  }

  const handleDownloadTemplate = async () => {
    try {
      const blob = await userImportApi.downloadTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "user_import_template.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success("CSV Template downloaded successfully.");
    } catch (err) {
      toast.error("Failed to download template.");
    }
  };

  const parseCsvToRows = (text: string): UserImportRowDto[] => {
    const lines = text.trim().split("\n");
    if (lines.length <= 1) return [];

    const headers = lines[0].split(",").map((h) => h.trim());
    const rows: UserImportRowDto[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const values = line.split(",").map((v) => v.trim());

      const row: any = { rowNumber: i };
      headers.forEach((h, idx) => {
        const val = values[idx];
        if (h === "roles") {
          row.roles = val ? val.split(";").map((r) => r.trim()).filter(Boolean) : [];
        } else {
          row[h] = val;
        }
      });
      rows.push(row);
    }
    return rows;
  };

  const handleValidate = async () => {
    if (!csvText.trim()) {
      toast.error("Please paste CSV data or choose a template.");
      return;
    }

    const rows = parseCsvToRows(csvText);
    if (rows.length === 0) {
      toast.error("No data rows found in CSV. Please verify formatting.");
      return;
    }

    if (rows.length > 500) {
      toast.error("Maximum 500 rows allowed per import.");
      return;
    }

    try {
      const result = await validateMutation.mutateAsync({ rows });
      setValidationResult(result);
      if (result.invalidRows === 0) {
        toast.success(`Validation succeeded! ${result.validRows} rows ready to commit.`);
      } else {
        toast.error(`Validation found ${result.errors.length} error(s). Review below.`);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Validation failed");
    }
  };

  const handleCommit = async () => {
    if (!validationResult?.importToken) {
      toast.error("No valid import token found. Please re-validate.");
      return;
    }

    try {
      const res = await commitMutation.mutateAsync({
        importToken: validationResult.importToken,
      });

      toast.success(
        `Import complete! ${res.importedCount} users created and onboarding invitations dispatched.`
      );
      router.push("/app/administration/users");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Commit failed");
    }
  };

  return (
    <div className="p-6 space-y-6 w-full">
      {/* Back link */}
      <button
        onClick={() => router.push("/app/administration/users")}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-3.5" />
        <span>Back to Users List</span>
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <FileSpreadsheet className="size-7 text-primary" />
            Two-Phase Bulk User Import
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Section 5.1 & 6.2 all-or-nothing batch onboarding. Passwords are never assigned; invitation tokens are securely issued.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={handleDownloadTemplate} className="gap-1.5">
          <Download className="size-4" />
          Download CSV Template
        </Button>
      </div>

      {/* Step 1: Input CSV */}
      <Card className="border-border/60 shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Phase 1: Validate Batch File</CardTitle>
          <CardDescription>
            Paste CSV data with headers: <code>employeeId,username,email,firstName,lastName,jobTitle,departmentCode,roles,scopeCode,scopeUnitCode</code>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <textarea
            rows={8}
            className="w-full p-3 text-xs font-mono rounded-md border border-input bg-muted/20 focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Paste CSV rows here..."
            value={csvText}
            onChange={(e) => {
              setCsvText(e.target.value);
              setValidationResult(null);
            }}
          />

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-muted-foreground">
              Maximum 500 rows per batch. Token cached server-side for 30 minutes.
            </span>
            <Button
              onClick={handleValidate}
              disabled={validateMutation.isPending || !csvText.trim()}
              className="gap-1.5 shadow-xs"
            >
              <Upload className="size-4" />
              {validateMutation.isPending ? "Validating..." : "Validate CSV Batch"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Validation Results & Commit */}
      {validationResult && (
        <Card
          className={`border shadow-xs ${
            validationResult.invalidRows === 0
              ? "border-emerald-500/40 bg-emerald-500/5"
              : "border-rose-500/40 bg-rose-500/5"
          }`}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                {validationResult.invalidRows === 0 ? (
                  <CheckCircle2 className="size-5 text-emerald-500" />
                ) : (
                  <AlertCircle className="size-5 text-rose-500" />
                )}
                Validation Evaluation: {validationResult.validRows} Valid, {validationResult.invalidRows} Invalid
              </CardTitle>
              {validationResult.importToken && (
                <Badge variant="outline" className="font-mono text-xs gap-1">
                  <Clock className="size-3" />
                  Token: {validationResult.importToken.substring(0, 12)}... (Valid 30m)
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {validationResult.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-rose-600">Errors to Resolve:</h4>
                <div className="max-h-60 overflow-y-auto space-y-1.5 pr-2">
                  {validationResult.errors.map((err, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-background border border-rose-200 dark:border-rose-900/50 text-xs flex items-center justify-between text-rose-700 dark:text-rose-300"
                    >
                      <span>
                        <strong>Row {err.rowNumber}:</strong> [{err.field}] {err.message}
                      </span>
                      <code className="text-[10px] bg-rose-50 dark:bg-rose-950/50 px-1.5 py-0.5 rounded">
                        {err.errorCode}
                      </code>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {validationResult.invalidRows === 0 && (
              <div className="flex items-center justify-between pt-3 border-t">
                <p className="text-xs text-muted-foreground">
                  All {validationResult.totalRows} rows passed Section 5.1 & 6.2 validation rules. Ready for atomic commit.
                </p>
                <Button
                  onClick={handleCommit}
                  disabled={commitMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-xs"
                >
                  <Check className="size-4" />
                  {commitMutation.isPending ? "Committing..." : "Commit Batch & Issue Invitations"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
