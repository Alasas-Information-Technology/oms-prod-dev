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
  }
};
