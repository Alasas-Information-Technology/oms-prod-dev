"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  UserPlus,
  ArrowLeft,
  Shield,
  Building2,
  Mail,
  CheckCircle2,
  Info,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrgUnitPicker } from "@/components/organization/OrgUnitPicker";
import { OrgUnitSummaryDto } from "@/lib/types/organization.types";
import { UserType } from "@/lib/types/authorization.types";
import { useCreateUser } from "@/hooks/useAuthorization";
import { usePermission } from "@/hooks/usePermission";
import { toast } from "sonner";

export default function NewUserPage() {
  const router = useRouter();
  const { can } = usePermission();

  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [employeeId, setEmployeeId] = React.useState("");
  const [jobTitle, setJobTitle] = React.useState("");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [department, setDepartment] = React.useState<OrgUnitSummaryDto | null>(null);
  const [initialRole, setInitialRole] = React.useState<string>("");

  const createMutation = useCreateUser();

  if (!can("USER.CREATE")) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold text-foreground">Access Denied</h2>
        <p className="text-sm text-muted-foreground">
          You lack the [USER.CREATE] permission required to create new user accounts.
        </p>
        <Button onClick={() => router.push("/app/administration/users")}>
          Return to Users
        </Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !email.trim() || !firstName.trim() || !lastName.trim() || !employeeId.trim()) {
      toast.error("Please fill in all required fields (Username, Email, Name, Employee ID).");
      return;
    }

    try {
      const created = await createMutation.mutateAsync({
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        userType: UserType.INTERNAL,
        employeeId: employeeId.trim(),
        profile: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          jobTitle: jobTitle.trim() || undefined,
          phoneNumber: phoneNumber.trim() || undefined,
          departmentId: department?.orgUnitId || undefined,
        },
        initialRoleIds: initialRole ? [initialRole] : undefined,
      });

      toast.success(
        `User [${created.username}] created successfully! An onboarding invitation has been dispatched.`
      );
      router.push(`/app/administration/users/${created.userId}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to create user");
    }
  };

  return (
    <div className="p-6 space-y-6 w-full">
      {/* Back button */}
      <button
        onClick={() => router.push("/app/administration/users")}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-3.5" />
        <span>Back to Users List</span>
      </button>

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
          <UserPlus className="size-7 text-primary" />
          Create New Internal User
        </h1>
        <p className="text-sm text-muted-foreground">
          Register a new employee account. Administrators never set passwords; an onboarding invitation is securely issued to the employee&apos;s email.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Account & Profile Information */}
        <Card className="border-border/60 shadow-xs">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">1. Account & Identity Details</CardTitle>
            <CardDescription>
              Basic credentials and contact profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-first-name">First Name *</Label>
                <Input
                  id="new-first-name"
                  placeholder="e.g. Ali"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-last-name">Last Name *</Label>
                <Input
                  id="new-last-name"
                  placeholder="e.g. Rashid"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-username">Username *</Label>
                <Input
                  id="new-username"
                  placeholder="e.g. ali.rashid"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-email">Corporate Email Address *</Label>
                <Input
                  id="new-email"
                  type="email"
                  placeholder="e.g. ali.rashid@diez.ae"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-emp-id">Employee ID *</Label>
                <Input
                  id="new-emp-id"
                  placeholder="e.g. EMP-1042"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-job-title">Job Title</Label>
                <Input
                  id="new-job-title"
                  placeholder="e.g. Senior Specialist"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-phone">Phone Number</Label>
                <Input
                  id="new-phone"
                  placeholder="+971 50 ..."
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Organizational Placement */}
        <Card className="border-border/60 shadow-xs">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">2. Organizational Placement</CardTitle>
            <CardDescription>
              Assign the primary department this employee belongs to.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Assigned Department</Label>
              <OrgUnitPicker
                value={department?.orgUnitId || null}
                onChange={setDepartment}
                filterByType={3} // 3 = Department
                placeholder="Search and select department..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Initial Role (Optional) */}
        <Card className="border-border/60 shadow-xs">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">3. Initial Role Assignment</CardTitle>
            <CardDescription>
              Optionally grant starting capabilities. Additional roles and scopes can be assigned after onboarding.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="init-role">Initial Role (Optional)</Label>
              <Select value={initialRole} onValueChange={setInitialRole}>
                <SelectTrigger id="init-role">
                  <SelectValue placeholder="None (Standard User Baseline)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3053433E-F36B-1410-85ED-009A959FB303">
                    Procurement Buyer (PROCUREMENT_BUYER)
                  </SelectItem>
                  <SelectItem value="3053433E-F36B-1410-85ED-009A959FB304">
                    Finance Analyst (FINANCE_ANALYST)
                  </SelectItem>
                  <SelectItem value="3053433E-F36B-1410-85ED-009A959FB305">
                    Department Head (DEPARTMENT_HEAD)
                  </SelectItem>
                  <SelectItem value="3053433E-F36B-1410-85ED-009A959FB302">
                    Organization Administrator (ORG_ADMIN)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Onboarding Notice */}
            <div className="p-3.5 rounded-xl border bg-muted/40 flex items-start gap-3 text-xs text-muted-foreground">
              <Mail className="size-4 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-foreground">Passwordless Onboarding Security: </span>
                An automated invitation with a single-use token will be sent to the employee&apos;s corporate email. The employee will establish their own confidential password upon acceptance.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/app/administration/users")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={createMutation.isPending} className="shadow-xs gap-1.5">
            <UserPlus className="size-4" />
            {createMutation.isPending ? "Creating..." : "Create User & Dispatch Invite"}
          </Button>
        </div>
      </form>
    </div>
  );
}
