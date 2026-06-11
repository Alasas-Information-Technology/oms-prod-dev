"use client";

import { Icon } from '@iconify/react';
import { UserProfile } from "../profile.types";

interface ProfileHeaderProps {
    profile: UserProfile;
    onEditClick: () => void;
}

export function ProfileHeader({ profile, onEditClick }: ProfileHeaderProps) {
    return (
        <div className="bg-card text-card-foreground rounded-xl border border-border px-6 py-5 flex items-center justify-between">
            {/* Avatar + name */}
            <div className="flex items-center gap-4">
                <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl font-semibold select-none">
                        {profile.avatarInitials}
                    </div>
                    <button
                        className="absolute bottom-0 right-0 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center hover:bg-muted transition-colors shadow-sm"
                        aria-label="Change profile photo"
                    >
                        <Icon icon="mdi:camera" className="w-3 h-3 text-muted-foreground" />
                    </button>
                </div>

                <div>
                    <h2 className="text-lg font-semibold text-foreground">{profile.fullName}</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">{profile.title}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                        <span className="text-xs text-muted-foreground">Active account</span>
                    </div>
                </div>
            </div>

            {/* Edit button */}
            <button
                onClick={onEditClick}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground border border-border rounded-lg hover:bg-muted transition-colors"
            >
                <Icon icon="mdi:pencil" className="w-4 h-4" />
                Edit Profile
            </button>
        </div>
    );
}