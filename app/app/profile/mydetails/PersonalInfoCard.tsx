import { Icon } from '@iconify/react';
import { UserProfile } from "../profile.types";

interface PersonalInfoCardProps {
    profile: UserProfile;
}

interface InfoFieldProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    note?: string;
}

function InfoField({ icon, label, value, note }: InfoFieldProps) {
    return (
        <div>
            <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                {icon}
                <span className="text-xs font-medium">{label}</span>
            </div>
            <p className="text-sm font-medium text-foreground">{value}</p>
            {note && <p className="text-xs text-muted-foreground mt-0.5">{note}</p>}
        </div>
    );
}

export function PersonalInfoCard({ profile }: PersonalInfoCardProps) {
    return (
        <div className="bg-card text-card-foreground rounded-xl border border-border px-6 py-5 flex-1">
            <h3 className="text-sm font-semibold text-foreground mb-5">Personal Information</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                <InfoField
                    icon={<Icon icon="mdi:account" className="w-3.5 h-3.5" />}
                    label="Full Name"
                    value={profile.fullName}
                />
                <InfoField
                    icon={<Icon icon="mdi:email" className="w-3.5 h-3.5" />}
                    label="Email Address"
                    value={profile.email}
                />
                <InfoField
                    icon={<Icon icon="mdi:phone" className="w-3.5 h-3.5" />}
                    label="Phone Number"
                    value={profile.phone}
                />
                <InfoField
                    icon={<Icon icon="mdi:earth" className="w-3.5 h-3.5" />}
                    label="Location"
                    value={profile.location}
                />
                <InfoField
                    icon={<Icon icon="mdi:office-building" className="w-3.5 h-3.5" />}
                    label="Department"
                    value={profile.department}
                />
                <InfoField
                    icon={<Icon icon="mdi:shield" className="w-3.5 h-3.5" />}
                    label="Role"
                    value={profile.role}
                    note="Contact admin to change role"
                />
            </div>
        </div>
    );
}