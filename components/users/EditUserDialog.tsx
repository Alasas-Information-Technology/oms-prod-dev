"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { OrgUnitPicker } from "@/components/organization/OrgUnitPicker";
import { OrgUnitSummaryDto } from "@/lib/types/organization.types";
import { UserDetailDto } from "@/lib/types/authorization.types";
import { useUpdateUser } from "@/hooks/useAuthorization";
import { toast } from "sonner";
import { User, Building2 } from "lucide-react";

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserDetailDto;
}

export function EditUserDialog({
  open,
  onOpenChange,
  user,
}: EditUserDialogProps) {
  const [firstName, setFirstName] = React.useState(user.profile?.firstName || "");
  const [lastName, setLastName] = React.useState(user.profile?.lastName || "");
  const [jobTitle, setJobTitle] = React.useState(user.profile?.jobTitle || "");
  const [phoneNumber, setPhoneNumber] = React.useState(user.profile?.phoneNumber || "");
  const [department, setDepartment] = React.useState<OrgUnitSummaryDto | null>(
    user.profile?.departmentId
      ? ({
          orgUnitId: user.profile.departmentId,
          name: user.profile.departmentName || "Department",
        } as any)
      : null
  );

  React.useEffect(() => {
    if (user) {
      setFirstName(user.profile?.firstName || "");
      setLastName(user.profile?.lastName || "");
      setJobTitle(user.profile?.jobTitle || "");
      setPhoneNumber(user.profile?.phoneNumber || "");
      setDepartment(
        user.profile?.departmentId
          ? ({
              orgUnitId: user.profile.departmentId,
              name: user.profile.departmentName || "Department",
            } as any)
          : null
      );
    }
  }, [user]);

  const updateMutation = useUpdateUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("First name and last name are required.");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: user.userId,
        dto: {
          profile: {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            jobTitle: jobTitle.trim() || undefined,
            phoneNumber: phoneNumber.trim() || undefined,
            departmentId: department?.orgUnitId || undefined,
          },
        },
      });

      toast.success("User profile updated successfully.");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to update profile");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="size-5 text-primary" />
            Edit User Profile
          </DialogTitle>
          <DialogDescription>
            Update personal attributes and organizational placement for <strong>{user.username}</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="edit-first-name">First Name *</Label>
              <Input
                id="edit-first-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-last-name">Last Name *</Label>
              <Input
                id="edit-last-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="edit-job-title">Job Title</Label>
              <Input
                id="edit-job-title"
                placeholder="e.g. Senior Specialist"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone Number</Label>
              <Input
                id="edit-phone"
                placeholder="+971 50 ..."
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Department</Label>
            <OrgUnitPicker
              value={department?.orgUnitId || null}
              onChange={setDepartment}
              filterByType={3} // 3 = Department
              placeholder="Search and choose department..."
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
