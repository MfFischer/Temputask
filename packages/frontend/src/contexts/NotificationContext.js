import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';

export const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const supabase = useSupabaseClient();
  const user = useUser();
  
  // Load notifications
  useEffect(() => {
    if (!user) return;
    
    async function loadNotifications() {
      setIsLoading(true);
      
      try {
        // Fetch notifications
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50);
          
        if (error) {
          throw error;
        }
        
        setNotifications(data || []);
        
        // Calculate unread count
        const unread = data.filter(notification => !notification.is_read).length;
        setUnreadCount(unread);
      } catch (err) {
        console.error('Error loading notifications:', err);
        setError('Failed to load notifications');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadNotifications();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('notifications_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        // Handle different change types
        switch (payload.eventType) {
          case 'INSERT':
            // New notification
            setNotifications(prev => [payload.new, ...prev]);
            setUnreadCount(prev => prev + 1);
            // Show browser notification if enabled
            showBrowserNotification(payload.new);
            break;
          case 'UPDATE':
            // Updated notification (e.g., marked as read)
            setNotifications(prev => 
              prev.map(notif => 
                notif.id === payload.new.id ? payload.new : notif
              )
            );
            // Recalculate unread count
            recalculateUnreadCount();
            break;
          case 'DELETE':
            // Deleted notification
            setNotifications(prev => 
              prev.filter(notif => notif.id !== payload.old.id)
            );
            // Recalculate unread count
            recalculateUnreadCount();
            break;
          default:
            break;
        }
      })
      .subscribe();
      
    return () => {
      subscription.unsubscribe();
    };
  }, [user, supabase]);
  
  // Recalculate unread count
  const recalculateUnreadCount = useCallback(() => {
    const unread = notifications.filter(notification => !notification.is_read).length;
    setUnreadCount(unread);
  }, [notifications]);
  
  // Show browser notification
  const showBrowserNotification = useCallback((notification) => {
    // Check if browser notifications are supported and permission granted
    if (
      typeof window !== 'undefined' && 
      'Notification' in window && 
      Notification.permission === 'granted'
    ) {
      // Check user settings for browser notifications
      // In a real app, you'd check user.settings.notifications.pushNotifications
      
      // Create and show notification
      const browserNotification = new Notification('Tempu Task', {
        body: notification.message,
        icon: '/icons/logo.svg',
      });
      
      // Handle notification click
      browserNotification.onclick = function() {
        window.focus();
        // Mark as read when clicked
        markAsRead(notification.id);
      };
    }
  }, []);
  
  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
        
      if (error) {
        throw error;
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
      
      // Decrement unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, [user, supabase]);
  
  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
        
      if (error) {
        throw error;
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true }))
      );
      
      // Reset unread count
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  }, [user, supabase]);
  
  // Delete a notification
  const deleteNotification = useCallback(async (notificationId) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);
        
      if (error) {
        throw error;
      }
      
      // Update local state
      setNotifications(prev => 
        prev.filter(notif => notif.id !== notificationId)
      );
      
      // Recalculate unread count
      const notif = notifications.find(n => n.id === notificationId);
      if (notif && !notif.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  }, [user, supabase, notifications]);
  
  // Request browser notification permission
  const requestNotificationPermission = useCallback(async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }
      return Notification.permission === 'granted';
    }
    return false;
  }, []);
  
  // Create a new notification (for testing)
  const createNotification = useCallback(async (message, type = 'info') => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          message,
          type,
          is_read: false,
        })
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      return data;
    } catch (err) {
      console.error('Error creating notification:', err);
      return null;
    }
  }, [user, supabase]);
  
  const value = {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    requestNotificationPermission,
    createNotification,
  };
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  return React.useContext(NotificationContext);
};