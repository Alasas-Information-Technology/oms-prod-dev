export interface UserProfile {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    location: string;
    department: string;
    role: string;
    title: string;
    employeeId: string;
    memberSince: string;
    accountStatus: "Active" | "Inactive" | "Suspended";
    avatarInitials: string;
    lastPasswordChange: number; // days ago
}

// Matches the API response shape exactly
export interface Session {
    loginSessionId: string;
    ipAddress: string;
    browserName: string;
    deviceType: string;
    createdAt: string;
    lastActivityAt: string;
    expiresAt: string;
    isCurrentSession: boolean;
}

export interface SessionsApiResponse {
    success: boolean;
    sessions: Session[];
}

export type ProfileTab = "profile" | "sessions";