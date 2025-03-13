import React, { useState, useEffect } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import Card from '../common/Card';
import Button from '../common/Button';

export default function NotificationSettings() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    inAppNotifications: true,
    inactivityReminders: true,
    inactivityThreshold: 2, // days
    weeklyReports: true,
    productivityReminders: false,
    pushNotifications: false,
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  const supabase = useSupabaseClient();
  const user = useUser();
  
  // Load user notification settings
  useEffect(() => {
    if (!user) return;
    
    async function loadSettings() {
      setIsLoading(true);
      
      try {
        // Get user profile with settings
        const { data, error } = await supabase
          .from('users')
          .select('settings')
          .eq('id', user.id)
          .single();
          
        if (error) {
          throw error;
        }
        
        // Update state with saved settings if they exist
        if (data?.settings?.notifications) {
          setSettings(prevSettings => ({
            ...prevSettings,
            ...data.settings.notifications,
          }));
        }
      } catch (err) {
        console.error('Error loading notification settings:', err);
        setError('Failed to load notification settings');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadSettings();
  }, [user, supabase]);
  
  // Save notification settings
  const saveSettings = async () => {
    if (!user) return;
    
    setIsSaving(true);
    setSaveSuccess(false);
    setError(null);
    
    try {
      // First get current user settings to preserve other settings
      const { data: currentData, error: fetchError } = await supabase
        .from('users')
        .select('settings')
        .eq('id', user.id)
        .single();
        
      if (fetchError) {
        throw fetchError;
      }
      
      // Prepare updated settings object
      const currentSettings = currentData?.settings || {};
      const updatedSettings = {
        ...currentSettings,
        notifications: settings,
      };
      
      // Update settings in database
      const { error: updateError } = await supabase
        .from('users')
        .update({ settings: updatedSettings })
        .eq('id', user.id);
        
      if (updateError) {
        throw updateError;
      }
      
      // Show success message
      setSaveSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error saving notification settings:', err);
      setError('Failed to save notification settings');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle toggle change
  const handleToggleChange = (setting) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [setting]: !prevSettings[setting],
    }));
  };
  
  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prevSettings => ({
      ...prevSettings,
      [name]: value,
    }));
  };
  
  if (isLoading) {
    return (
      <Card>
        <h2 className="text-xl font-semibold mb-4">Notification Settings</h2>
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </Card>
    );
  }
  
  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">Notification Settings</h2>
      
      {error && (
        <div className="mb-4 bg-red-100 p-3 rounded-md text-red-700">
          {error}
        </div>
      )}
      
      {saveSuccess && (
        <div className="mb-4 bg-green-100 p-3 rounded-md text-green-700">
          Settings saved successfully!
        </div>
      )}
      
      <div className="space-y-6">
        {/* Email Notifications */}
        <div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Email Notifications</h3>
              <p className="text-sm text-gray-600">Receive important updates via email</p>
            </div>
            <div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.emailNotifications} 
                  onChange={() => handleToggleChange('emailNotifications')} 
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
        
        {/* In-App Notifications */}
        <div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">In-App Notifications</h3>
              <p className="text-sm text-gray-600">Show notifications within the app</p>
            </div>
            <div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.inAppNotifications} 
                  onChange={() => handleToggleChange('inAppNotifications')} 
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
        
        {/* Inactivity Reminders */}
        <div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Inactivity Reminders</h3>
              <p className="text-sm text-gray-600">Get reminded when you haven't tracked time</p>
            </div>
            <div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.inactivityReminders} 
                  onChange={() => handleToggleChange('inactivityReminders')} 
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
          
          {settings.inactivityReminders && (
            <div className="mt-3 pl-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Send reminder after inactivity of
              </label>
              <div className="flex items-center">
                <select
                  name="inactivityThreshold"
                  value={settings.inactivityThreshold}
                  onChange={handleInputChange}
                  className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="1">1 day</option>
                  <option value="2">2 days</option>
                  <option value="3">3 days</option>
                  <option value="5">5 days</option>
                  <option value="7">1 week</option>
                </select>
              </div>
            </div>
          )}
        </div>
        
        {/* Weekly Reports */}
        <div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Weekly Reports</h3>
              <p className="text-sm text-gray-600">Receive weekly productivity summaries</p>
            </div>
            <div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.weeklyReports} 
                  onChange={() => handleToggleChange('weeklyReports')} 
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
        
        {/* Productivity Reminders */}
        <div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Productivity Reminders</h3>
              <p className="text-sm text-gray-600">Get tips based on your work patterns</p>
            </div>
            <div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.productivityReminders} 
                  onChange={() => handleToggleChange('productivityReminders')} 
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
        
        {/* Push Notifications */}
        <div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Browser Push Notifications</h3>
              <p className="text-sm text-gray-600">Get notifications even when the app is closed</p>
            </div>
            <div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.pushNotifications} 
                  onChange={() => handleToggleChange('pushNotifications')} 
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-200">
          <Button
            onClick={saveSettings}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </Card>
  );
}