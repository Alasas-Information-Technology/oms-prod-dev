import api from './axios';
import { ActiveSession } from '../types/session.types';

export const sessionsApi = {
    /**
     * Get all active sessions for the current user
     */
    getSessions: async (): Promise<{ success: boolean; sessions: ActiveSession[] }> => {
        const response = await api.get('/auth/sessions');
        return response.data;
    },

    /**
     * Revoke a specific session by its ID
     */
    revokeSession: async (id: string): Promise<{ success: boolean; message: string }> => {
        const response = await api.delete(`/auth/sessions/${id}`);
        return response.data;
    },

    /**
     * Revoke all sessions except the current one
     */
    revokeAllOtherSessions: async (): Promise<{ success: boolean; message: string }> => {
        const response = await api.post('/auth/sessions/revoke-all');
        return response.data;
    }
};
