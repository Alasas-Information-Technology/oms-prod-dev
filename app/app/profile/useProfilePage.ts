"use client";

import { useState, useEffect, useCallback } from "react";
import { ProfileTab, UserProfile } from "./profile.types";
import { ActiveSession } from "@/lib/types/session.types";
import { sessionsApi } from "@/lib/api/sessions";
import { mockUserProfile } from "./mock-data";

export function useProfilePage() {
    const [activeTab, setActiveTab] = useState<ProfileTab>("profile");

    // Profile — swap mockUserProfile with your real user API when ready
    const [profile] = useState<UserProfile>(mockUserProfile);

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
        // Optimistic update
        setSessions((prev) => prev.filter((s) => s.loginSessionId !== loginSessionId));
        try {
            await sessionsApi.revokeSession(loginSessionId);
        } catch {
            // Rollback on failure by re-fetching
            fetchSessions();
        }
    };

    // ── Terminate all other sessions ────────────────────────────────────────────
    const handleTerminateAllOther = async () => {
        // Optimistic update — keep only current session
        setSessions((prev) => prev.filter((s) => s.isCurrentSession));
        try {
            await sessionsApi.revokeAllOtherSessions();
        } catch {
            fetchSessions();
        }
    };

    // ── Profile actions (wire up when ready) ────────────────────────────────────
    const handleEditProfile = () => {
        console.log("Edit profile clicked");
    };

    const handleChangePassword = () => {
        console.log("Change password clicked");
    };

    return {
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
    };
}