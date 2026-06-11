"use client";

import { Icon } from '@iconify/react';
import { ProfileTabs } from "./ProfileTabs";
import { PersonalInfoCard } from "./mydetails/PersonalInfoCard";
import { AccountDetailsCard } from "./mydetails/AccountDetailsCard";
import { SessionsTab } from "./sessions/SessionsTab";
import { useProfilePage } from "./useProfilePage";

// ─── Small helper: initials avatar ───────────────────────────────────────────

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(/\s+/);
  const letters =
    parts.length >= 2
      ? parts[0][0] + parts[parts.length - 1][0]
      : parts[0].slice(0, 2);
  return (
    <div className="w-20 h-20 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold shrink-0 select-none">
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
    fetchSessions,
    handleTerminateSession,
    handleTerminateAllOther,
    handleEditProfile,
    handleChangePassword,
  } = useProfilePage();

  const fullName = profile
    ? `${profile.fullName} `
    : "—";

  return (
    <div className="min-h-screen">
      <div className="mx-auto py-8">

        {/* ── Profile header card ── */}
        <div className="flex items-start justify-between gap-4 mb-6">

          {/* Left: avatar + info */}
          <div className="flex items-center gap-4">
            <Initials name={fullName} />

            <div className="flex flex-col gap-1">
              {/* Name + role badge */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-bold text-foreground leading-tight">
                  {fullName}
                </h1>
                {profile?.role && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                    {profile.role.charAt(0).toUpperCase() +
                      profile.role.slice(1).toLowerCase()}
                  </span>
                )}
              </div>

              {/* Meta row */}
              <div className="flex items-center gap-4 flex-wrap mt-0.5">
                {profile?.email && (
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Icon icon="mdi:email" className="w-3.5 h-3.5 shrink-0" />
                    {profile.email}
                  </span>
                )}
                {profile?.location && (
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Icon icon="mdi:map-marker" className="w-3.5 h-3.5 shrink-0" />
                    {profile.location}
                  </span>
                )}
                {profile?.memberSince && (
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Icon icon="mdi:clock-time" className="w-3.5 h-3.5 shrink-0" />
                    Member since{" "}
                    {new Date(profile.memberSince).toLocaleDateString("en-GB", {
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Edit Profile button */}
          <button
            onClick={handleEditProfile}
            className="cursor-pointer inline-flex items-center gap-2 h-9 px-4 rounded-lg border border-border bg-background text-sm font-medium text-foreground hover:bg-muted transition-colors shrink-0"
          >
            <Icon icon="mdi:pencil" className="w-3.5 h-3.5" />
            Edit Profile
          </button>
        </div>

        {/* ── Underline tabs ── */}
        <div className="mb-6">
          <ProfileTabs activeTab={activeTab} onChange={setActiveTab} />
        </div>

        {/* ── Tab content (unchanged) ── */}
        {activeTab === "profile" && (
          <div className="flex flex-col gap-4">
            <div className="flex gap-4 items-start">
              <PersonalInfoCard profile={profile} />
              <AccountDetailsCard
                profile={profile}
                onChangePassword={handleChangePassword}
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

      </div>
    </div>
  );
}