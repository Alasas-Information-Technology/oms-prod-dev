import { supabase } from '../supabaseClient';

/**
 * Notification Service
 * Handles fetching, updating, and real-time triggers for user notifications.
 */
export const notificationService = {
  /**
   * Fetch all notifications for a specific user.
   */
  async getUserNotifications(userId) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
    return data;
  },

  /**
   * Get total unread count for a user.
   */
  async getUnreadCount(userId) {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
    return count || 0;
  },

  /**
   * Mark a single notification as read.
   */
  async markAsRead(notificationId) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .select()
      .single();

    if (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
    return data;
  },

  /**
   * Mark all unread notifications for a user as read.
   */
  async markAllAsRead(userId) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('recipient_id', userId)
      .eq('is_read', false)
      .select();

    if (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
    return data;
  },

  /**
   * Create a new notification (generally used by other services).
   */
  async createNotification({ recipientId, requisitionId, title, message }) {
    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        recipient_id: recipientId,
        requisition_id: requisitionId,
        title,
        message,
        is_read: false
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
    return data;
  },

  /**
   * Subscribe to real-time notification changes for a user.
   */
  subscribeToNotifications(userId, callback) {
    return supabase
      .channel(`user-notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${userId}`
        },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe();
  },

  /**
   * Internal Dispatcher: Sends a notification to all active users with a specific role.
   * Filters by department_id for roles that are not global (INTERVIEWER, LINE_MANAGER, etc).
   */
  async dispatchRoleNotification(targetRoleName, targetDepartmentId, requisitionId, title, message) {
    // 1. Resolve Role ID first to ensure we match correctly regardless of join complexity
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('role_id')
      .eq('role_name', targetRoleName)
      .single();

    if (roleError || !roleData) {
      console.error(`Dynamic Dispatcher: Role resolution failed for "${targetRoleName}"`, roleError);
      return;
    }

    // 2. Fetch matching active profiles
    let query = supabase
      .from('profiles')
      .select('id')
      .eq('role_id', roleData.role_id)
      .eq('is_active', true);

    // 3. Apply department isolation for non-global administrative roles
    const globalRoles = ['SYSTEM_ADMIN', 'HR_ADMIN', 'PROCUREMENT_OFFICER', 'FINANCE_OFFICER'];
    if (targetDepartmentId && !globalRoles.includes(targetRoleName)) {
      query = query.eq('department_id', targetDepartmentId);
    }

    const { data: profiles, error: fetchError } = await query;

    if (fetchError) {
      console.error(`Dynamic Dispatcher: Failed to fetch recipients for ${targetRoleName}:`, fetchError);
      return;
    }

    if (!profiles || profiles.length === 0) {
      console.warn(`Dynamic Dispatcher: No active users found for role: ${targetRoleName}${targetDepartmentId ? ` in department: ${targetDepartmentId}` : ''}`);
      return;
    }

    // 4. Bulk insert notifications
    const notifications = profiles.map(p => ({
      recipient_id: p.id,
      requisition_id: requisitionId,
      title,
      message,
      is_read: false
    }));

    const { error: insertError } = await supabase.from('notifications').insert(notifications);
    if (insertError) console.error('Dynamic Dispatcher: Bulk insert failed:', insertError);
  }
};
