import { supabase } from './supabase';

export const notificationService = {
  // 1. Fetch unread notifications
  async getNotifications() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20); // Get latest 20

    if (error) throw error;
    return data;
  },

  // 2. Mark a notification as read
  async markAsRead(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) throw error;
  },

  // 3. Mark ALL as read
  async markAllAsRead() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (error) throw error;
  },

  // 4. Create a new notification (We will call this when adding a folder/app)
  async createNotification(title: string, message: string, type: 'info' | 'success' | 'warning' = 'info') {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .insert([{ user_id: user.id, title, message, type }]);

    if (error) throw error;
  },

  // 5. REAL-TIME: Keep Topbar bell in sync (user-scoped)
  subscribeToNotifications(callback: () => void) {
    // Caller expects this to be user-scoped; we fetch user inside.
    // Supabase will deliver changes only when they match the filter.
    return supabase.auth.getUser().then(({ data }) => {
      const userId = data.user?.id;
      if (!userId) return { unsubscribe: () => {} };

      return supabase
        .channel(`notifications_${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`,
          },
          () => callback()
        )
        .subscribe();
    });
  }
};