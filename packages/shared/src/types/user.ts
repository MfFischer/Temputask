export interface User {
  id: string;
  email: string;
  created_at: string;
  last_login?: string;
  settings?: UserSettings;
}

export interface UserSettings {
  theme?: 'light' | 'dark' | 'system';
  focus_duration?: number; // in minutes
  notifications_enabled?: boolean;
}

export interface UserProfile {
  user_id: string;
  display_name?: string;
  avatar_url?: string;
  timezone?: string;
  created_at: string;
  updated_at: string;
}