import api from './axios';
import {
    SecurityDashboardDto,
    SecuritySummaryDto,
    SecurityEventDto,
    FailedLoginAttemptDto
} from '../types/security.types';

export const securityApi = {
    /**
     * Get the overall security dashboard data
     */
    getDashboard: async (): Promise<SecurityDashboardDto> => {
        const response = await api.get('/internal/security/dashboard');
        return response.data;
    },

    /**
     * Get the summary of security data (e.g., active sessions, logins last 30 days)
     */
    getSummary: async (): Promise<SecuritySummaryDto> => {
        const response = await api.get('/internal/security/summary');
        return response.data;
    },

    /**
     * Get security events with pagination
     */
    getEvents: async (page: number = 1, pageSize: number = 25): Promise<SecurityEventDto[]> => {
        const response = await api.get(`/internal/security/events`, {
            params: { page, pageSize }
        });
        return response.data;
    },

    /**
     * Get failed login attempts with pagination
     */
    getFailedLogins: async (page: number = 1, pageSize: number = 25): Promise<FailedLoginAttemptDto[]> => {
        const response = await api.get(`/internal/security/failed-logins`, {
            params: { page, pageSize }
        });
        return response.data;
    },

    /**
     * Get the current user's security summary
     */
    getUserSummary: async (): Promise<SecuritySummaryDto> => {
        const response = await api.get('/internal/security/user-summary');
        return response.data;
    }
};
