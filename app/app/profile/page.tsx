"use client";

import * as React from "react";
import {
  User,
  Mail,
  MapPin,
  Clock,
  Pencil,
  Lock,
  Phone,
  Building2,
  BadgeCheck,
  KeyRound,
  Shield,
} from "lucide-react";
import { ProfileTabs } from "./ProfileTabs";
import { PersonalInfoCard } from "./mydetails/PersonalInfoCard";
import { AccountDetailsCard } from "./mydetails/AccountDetailsCard";
import { SessionsTab } from "./sessions/SessionsTab";
import { useProfilePage } from "./useProfilePage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// ─── Small helper: initials avatar ───────────────────────────────────────────

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(/\s+/);
  const letters =
    parts.length >= 2
      ? parts[0][0] + parts[parts.length - 1][0]
      : parts[0].slice(0, 2);
  return (
    <div className="w-20 h-20 rounded-md bg-linear-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center text-2xl font-bold shrink-0 select-none shadow-md">
      {letters.toUpperCase()}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const {
    activeTab,
    setActiveTab,
    profile,
    sessions,
    sessionsLoading,
    sessionsError,
    isEditProfileOpen,
    setIsEditProfileOpen,
    isChangePasswordOpen,
    setIsChangePasswordOpen,
    fetchSessions,
    handleTerminateSession,
    handleTerminateAllOther,
    handleSaveProfile,
    handleSavePassword,
  } = useProfilePage();

  // Edit Profile Form Local State
  const [editForm, setEditForm] = React.useState({
    fullName: profile.fullName,
    phone: profile.phone,
    location: profile.location,
    department: profile.department,
    employeeId: profile.employeeId,
  });

  // Change Password Local State
  const [passwordForm, setPasswordForm] = React.useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  React.useEffect(() => {
    setEditForm({
      fullName: profile.fullName,
      phone: profile.phone,
      location: profile.location,
      department: profile.department,
      employeeId: profile.employeeId,
    });
  }, [profile]);

  const fullName = profile ? profile.fullName : "—";

  return (
    <div className="p-6 space-y-6 animate-in fade-in-50 duration-200">
      {/* ── Profile header card ── */}
      <div className="p-6 rounded-md border border-border/70 bg-card/60 backdrop-blur-xs shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left: avatar + info */}
        <div className="flex items-center gap-5">
          <Initials name={fullName} />

          <div className="flex flex-col gap-1.5">
            {/* Name + role badge */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-bold font-display text-foreground leading-tight">
                {fullName}
              </h1>
              {profile?.role && (
                <Badge
                  variant="outline"
                  className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold px-2.5 py-0.5"
                >
                  {profile.role}
                </Badge>
              )}
              <Badge
                variant="outline"
                className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-xs font-semibold px-2"
              >
                <BadgeCheck className="size-3 mr-1" />
                Active Account
              </Badge>
            </div>

            {/* Meta row */}
            <div className="flex items-center gap-4 flex-wrap text-xs text-muted-foreground">
              {profile?.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="size-3.5 text-muted-foreground shrink-0" />
                  {profile.email}
                </span>
              )}
              {profile?.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-muted-foreground shrink-0" />
                  {profile.location}
                </span>
              )}
              {profile?.memberSince && (
                <span className="flex items-center gap-1.5">
                  <Clock className="size-3.5 text-muted-foreground shrink-0" />
                  Member since {profile.memberSince}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Edit Profile & Password buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsChangePasswordOpen(true)}
            className="rounded-md text-xs h-9 gap-1.5 font-semibold cursor-pointer"
          >
            <KeyRound className="size-3.5 text-muted-foreground" />
            <span>Change Password</span>
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={() => setIsEditProfileOpen(true)}
            className="rounded-md text-xs h-9 gap-1.5 font-semibold cursor-pointer shadow-xs"
          >
            <Pencil className="size-3.5" />
            <span>Edit Profile</span>
          </Button>
        </div>
      </div>

      {/* ── Underline tabs ── */}
      <div>
        <ProfileTabs activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {/* ── Tab content ── */}
      {activeTab === "profile" && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <PersonalInfoCard profile={profile} />
            <AccountDetailsCard
              profile={profile}
              onChangePassword={() => setIsChangePasswordOpen(true)}
            />
          </div>
        </div>
      )}

      {activeTab === "sessions" && (
        <SessionsTab
          sessions={sessions}
          loading={sessionsLoading}
          error={sessionsError}
          onTerminate={handleTerminateSession}
          onTerminateAll={handleTerminateAllOther}
          onRetry={fetchSessions}
        />
      )}

      {/* ── Edit Profile Dialog ── */}
      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent className="sm:max-w-lg rounded-md p-6">
          <DialogHeader className="space-y-2">
            <div className="size-10 rounded-md bg-primary/10 text-primary flex items-center justify-center">
              <Pencil className="size-5" />
            </div>
            <DialogTitle className="text-lg font-bold font-display">
              Edit User Profile Details
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Update your personal display attributes. Changes sync across all DIEZ OMS services and the top navigation bar.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Full Name</Label>
              <Input
                type="text"
                value={editForm.fullName}
                onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                className="text-xs h-9 rounded-md"
                placeholder="e.g. Nabil Al-Rashidi"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Phone Number</Label>
                <Input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="text-xs h-9 rounded-md"
                  placeholder="+971 50 123 4567"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Department</Label>
                <Input
                  type="text"
                  value={editForm.department}
                  onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                  className="text-xs h-9 rounded-md"
                  placeholder="Operations Management"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Location / Office</Label>
              <Input
                type="text"
                value={editForm.location}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                className="text-xs h-9 rounded-md"
                placeholder="Dubai Integrated Economic Zones (DIEZ), UAE"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Employee ID</Label>
              <Input
                type="text"
                value={editForm.employeeId}
                onChange={(e) => setEditForm({ ...editForm, employeeId: e.target.value })}
                className="text-xs h-9 rounded-md font-mono"
                placeholder="DEZ-2024-0087"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditProfileOpen(false)}
              className="rounded-md text-xs h-9"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => handleSaveProfile(editForm)}
              className="rounded-md text-xs h-9 font-semibold"
            >
              Save Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Change Password Dialog ── */}
      <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
        <DialogContent className="sm:max-w-md rounded-md p-6">
          <DialogHeader className="space-y-2">
            <div className="size-10 rounded-md bg-primary/10 text-primary flex items-center justify-center">
              <KeyRound className="size-5" />
            </div>
            <DialogTitle className="text-lg font-bold font-display">
              Change Account Password
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Enter your current password and choose a secure replacement.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Current Password</Label>
              <Input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="text-xs h-9 rounded-md"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">New Password</Label>
              <Input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="text-xs h-9 rounded-md"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Confirm New Password</Label>
              <Input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="text-xs h-9 rounded-md"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsChangePasswordOpen(false)}
              className="rounded-md text-xs h-9"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              disabled={!passwordForm.currentPassword || !passwordForm.newPassword || passwordForm.newPassword !== passwordForm.confirmPassword}
              onClick={() => handleSavePassword(passwordForm.currentPassword, passwordForm.newPassword)}
              className="rounded-md text-xs h-9 font-semibold"
            >
              Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}