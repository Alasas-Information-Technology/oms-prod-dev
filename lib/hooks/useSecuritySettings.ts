import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { SecuritySettingsResponseDto, UpdateSecuritySettingsDto } from '@/lib/types/security-settings.types';

export function useSecuritySettings() {
    const [settings, setSettings] = useState<SecuritySettingsResponseDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSettings = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await axios.get<SecuritySettingsResponseDto>('/api/internal/security/settings');
            setSettings(response.data);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to fetch security settings');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const updateSettings = async (data: UpdateSecuritySettingsDto) => {
        try {
            setIsSaving(true);
            // Optimistic update
            const previousSettings = settings;
            setSettings({ ...previousSettings, ...data } as SecuritySettingsResponseDto);
            
            await axios.put('/api/internal/security/settings', data);
            setError(null);
            return true;
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message || 'Failed to update security settings';
            setError(errorMsg);
            // Revert on error
            fetchSettings();
            throw new Error(errorMsg);
        } finally {
            setIsSaving(false);
        }
    };

    return { settings, isLoading, isSaving, error, updateSettings, refetch: fetchSettings };
}
