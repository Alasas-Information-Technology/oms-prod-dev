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

export type DeviceType = "Desktop" | "Mobile" | "Tablet";
export type BrowserType = "CHROME" | "FIREFOX" | "SAFARI" | "EDGE" | "OTHER";
export type SessionStatus = "Current" | "Active" | "Expired";

export interface Session {
    id: string;
    deviceType: DeviceType;
    browser: BrowserType;
    deviceId: string;
    ipAddress: string;
    signedIn: string;
    lastActive: string;
    expires: string;
    status: SessionStatus;
    isCurrent?: boolean;
}

export type ProfileTab = "profile" | "sessions";