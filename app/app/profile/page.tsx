"use client";

import { ProfileTabs } from "./ProfileTabs";
import { ProfileHeader } from "./ProfileHeader";
import { PersonalInfoCard } from "./PersonalInfoCard";
import { AccountDetailsCard } from "./AccountDetailsCard";
import { SessionsTab } from "./SessionsTab";
import { useProfilePage } from "./useProfilePage";

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

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto py-8">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your personal information and active sessions
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <ProfileTabs activeTab={activeTab} onChange={setActiveTab} />
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="flex flex-col gap-4">
            <ProfileHeader profile={profile} onEditClick={handleEditProfile} />
            <div className="flex gap-4 items-start">
              <PersonalInfoCard profile={profile} />
              <AccountDetailsCard
                profile={profile}
                onChangePassword={handleChangePassword}
              />
            </div>
          </div>
        )}

        {/* Sessions Tab */}
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