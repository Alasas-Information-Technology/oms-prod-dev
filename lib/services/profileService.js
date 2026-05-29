import { supabase } from '../supabaseClient';
import { hasGlobalView } from '../utils/permissions';

/**
 * Profile API Service
 * Handles user directory fetching and departmental isolation.
 */
export const profileService = {
  /**
   * Fetch users from the profiles table based on departmental isolation rules.
   * 
   * @param {object} currentUser - Logged in user object
   * @returns {Promise<Array>}
   */
  async getUsers(currentUser) {
    if (!currentUser || !currentUser.roles) return [];

    const roleName = currentUser.roles.role_name;

    // 1. Vendor Lockout: vendors cannot see the internal user directory
    if (roleName === 'VENDOR_USER') {
      return [];
    }

    let query = supabase
      .from('profiles')
      .select('*, roles(role_name), departments(dept_name)')
      .order('full_name', { ascending: true });

    // 2. Strict Departmental Isolation
    // Only fetch colleagues in their specific department unless they have global visibility
    if (!hasGlobalView(roleName)) {
      if (currentUser.department_id) {
        query = query.eq('department_id', currentUser.department_id);
      } else {
        // Edge case: if a non-global user has no department assigned, 
        // restrict them to seeing only themselves for safety
        query = query.eq('id', currentUser.id);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('profileService.getUsers error:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Fetch specific profiles by a list of IDs.
   * Useful for population interviewer panels, etc.
   * 
   * @param {Array<string>} ids - Array of UUIDs
   * @returns {Promise<Array>}
   */
  async getProfilesByIds(ids) {
    if (!ids || ids.length === 0) return [];

    const { data, error } = await supabase
      .from('profiles')
      .select('*, roles(role_name), departments(dept_name)')
      .in('id', ids);

    if (error) {
      console.error('profileService.getProfilesByIds error:', error);
      throw error;
    }

    return data || [];
  }
};
