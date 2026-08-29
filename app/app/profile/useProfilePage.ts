"use client";

import { useState, useEffect, useCallback } from "react";
import { ProfileTab, UserProfile } from "./profile.types";
import { ActiveSession } from "@/lib/types/session.types";
import { sessionsApi } from "@/lib/api/sessions";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import axios from "axios";

function formatRoleName(role?: string): string {
  if (!role) return "Senior Manager";
  return role
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export function useProfilePage() {
  const { user, updateUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>("profile");

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // Compute reactive profile from AuthContext
  const initialRole = formatRoleName(user?.roles?.[0] || user?.userType);
  const initialName = user?.fullName || (user?.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1) : "Nabil Al-Rashidi");
  const initialEmail = user?.email || "nabil.rashidi@diez.ae";

  const [profile, setProfile] = useState<UserProfile>({
    id: user?.userId || "1",
    fullName: initialName,
    email: initialEmail,
    phone: user?.phone || "+971 4 293 6000",
    location: user?.location || "Dubai Integrated Economic Zones (DIEZ), UAE",
    department: user?.department || "Operations Management",
    role: initialRole,
    title: `${initialRole} · ${user?.department || "Operations Management"}`,
    employeeId: user?.employeeId || `DEZ-2024-${user?.userId ? user.userId.slice(0, 4).toUpperCase() : "0087"}`,
    memberSince: "March 15, 2024",
    accountStatus: "Active",
    avatarInitials: initialName.slice(0, 2).toUpperCase(),
    lastPasswordChange: 15,
  });

  // Sync profile if user session updates
  useEffect(() => {
    if (user) {
      const roleFormatted = formatRoleName(user.roles?.[0] || user.userType);
      const nameFormatted = user.fullName || (user.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1) : "User Account");
      
      setProfile((prev) => ({
        ...prev,
        id: user.userId || prev.id,
        fullName: user.fullName || prev.fullName || nameFormatted,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        location: user.location || prev.location,
        department: user.department || prev.department,
        role: roleFormatted,
        title: `${roleFormatted} · ${user.department || prev.department}`,
        employeeId: user.employeeId || prev.employeeId,
      }));
    }
  }, [user]);

  // Sessions state
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState<string | null>(null);

  // ── Fetch sessions ──────────────────────────────────────────────────────────
  const fetchSessions = useCallback(async () => {
    setSessionsLoading(true);
    setSessionsError(null);
    try {
      const { sessions: data } = await sessionsApi.getSessions();
      setSessions(data);
    } catch {
      setSessionsError("Failed to load sessions. Please try again.");
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  // Load sessions when the Sessions tab is first opened
  useEffect(() => {
    if (activeTab === "sessions") {
      fetchSessions();
    }
  }, [activeTab, fetchSessions]);

  // ── Terminate single session ────────────────────────────────────────────────
  const handleTerminateSession = async (loginSessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.loginSessionId !== loginSessionId));
    try {
      await sessionsApi.revokeSession(loginSessionId);
      toast.success("Session successfully terminated.");
    } catch {
      fetchSessions();
      toast.error("Failed to terminate session.");
    }
  };

  // ── Terminate all other sessions ────────────────────────────────────────────
  const handleTerminateAllOther = async () => {
    setSessions((prev) => prev.filter((s) => s.isCurrentSession));
    try {
      await sessionsApi.revokeAllOtherSessions();
      toast.success("All other active sessions terminated.");
    } catch {
      fetchSessions();
      toast.error("Failed to terminate sessions.");
    }
  };

  // ── Profile update action ───────────────────────────────────────────────────
  const handleSaveProfile = (updates: Partial<UserProfile>) => {
    setProfile((prev) => {
      const merged = { ...prev, ...updates };
      merged.title = `${merged.role} · ${merged.department}`;
      return merged;
    });

    // Synchronize globally with AuthContext & Topbar Account Dropdown
    updateUserProfile({
      fullName: updates.fullName,
      phone: updates.phone,
      location: updates.location,
      department: updates.department,
      employeeId: updates.employeeId,
      email: updates.email,
    });

    setIsEditProfileOpen(false);
    toast.success("User profile successfully updated.");
  };

  // ── Password change action ──────────────────────────────────────────────────
  const handleSavePassword = async (oldPassword: string, newPassword: string) => {
    try {
      await axios.post("/api/authorization/credentials/change-password", {
        oldPassword,
        newPassword,
      });
      setProfile((prev) => ({ ...prev, lastPasswordChange: 0 }));
      setIsChangePasswordOpen(false);
      toast.success("Password changed successfully.");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to change password. Please verify current password.");
    }
  };

  return {
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
  };
}