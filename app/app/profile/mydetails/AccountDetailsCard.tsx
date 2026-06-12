import { Icon } from '@iconify/react';
import { UserProfile } from "../profile.types";

interface AccountDetailsCardProps {
    profile: UserProfile;
    onChangePassword: () => void;
}

export function AccountDetailsCard({ profile, onChangePassword }: AccountDetailsCardProps) {
    return (
        <div className="flex flex-col gap-4 w-72 shrink-0">
            {/* Account Details */}
            <div className="bg-card text-card-foreground rounded-xl border border-border px-5 py-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">Account Details</h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Employee ID</span>
                        <span className="text-xs font-medium text-foreground">{profile.employeeId}</span>
                    </div>
                    <div className="h-px bg-border" />
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Member Since</span>
                        <span className="text-xs font-medium text-foreground">{profile.memberSince}</span>
                    </div>
                    <div className="h-px bg-border" />
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Account Status</span>
                        <span className="flex items-center gap-1 text-xs font-medium text-primary">
                            <Icon icon="mdi:check-circle" className="w-3.5 h-3.5" />
                            {profile.accountStatus}
                        </span>
                    </div>
                </div>
            </div>

            {/* Security */}
            <div className="bg-accent/30 rounded-xl border border-border px-5 py-4">
                <div className="flex items-center gap-2 mb-2">
                    <Icon icon="mdi:lock" className="w-4 h-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold text-foreground">Security</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                    Last password change was {profile.lastPasswordChange} days ago.
                </p>
                <button
                    onClick={onChangePassword}
                    className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                    Change Password →
                </button>
            </div>
        </div>
    );
}