import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { SecurityDashboardDto } from '@/lib/types/security.types';

export function useSecurityMonitoring(pollingIntervalMs = 30000) {
    const [summary, setSummary] = useState<SecurityDashboardDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSummary = useCallback(async () => {
        try {
            const response = await axios.get<SecurityDashboardDto>('/api/internal/security/summary');
            setSummary(response.data);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to fetch security summary');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSummary();
        const intervalId = setInterval(fetchSummary, pollingIntervalMs);
        return () => clearInterval(intervalId);
    }, [fetchSummary, pollingIntervalMs]);

    return { summary, isLoading, error, refetch: fetchSummary };
}
