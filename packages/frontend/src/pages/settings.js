import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import SettingsNavigation from '../components/settings/SettingsNavigation';

export default function SettingsPage() {
  const { user, updateProfile, signOut } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [retentionDays, setRetentionDays] = useState(30);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [profileForm, setProfileForm] = useState({
    displayName: user?.user_metadata?.name || '',
    jobTitle: user?.user_metadata?.job_title || '',
    timeZone: user?.user_metadata?.time_zone || 'UTC'
  });
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  
  // Update profile
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsProfileSaving(true);
    
    try {
      await updateProfile({
        name: profileForm.displayName,
        job_title: profileForm.jobTitle,
        time_zone: profileForm.timeZone
      });
      
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsProfileSaving(false);
    }
  };
  
  // Handle profile form changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };
  
  // Export user data
  const handleExportData = async () => {
    setIsExporting(true);
    
    try {
      const response = await fetch('/api/user/dataExport');
      
      if (!response.ok) {
        throw new Error('Failed to export data');
      }
      
      // Create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'tempos_data_export.json';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };
  
  // Delete user data
  const handleDeleteData = async () => {
    if (deleteConfirm !== 'DELETE') {
      alert('Please type DELETE to confirm data deletion');
      return;
    }
    
    setIsDeleting(true);
    
    try {
      const response = await fetch('/api/user/deleteData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          confirm: true,
          retention_days: retentionDays || null,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete data');
      }
      
      setDeleteSuccess(true);
      setDeleteConfirm('');
    } catch (error) {
      console.error('Error deleting data:', error);
      alert(`Failed to delete data: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Available timezones (simplified list)
  const timeZones = [
    'UTC', 
    'America/New_York', 
    'America/Chicago', 
    'America/Denver', 
    'America/Los_Angeles', 
    'Europe/London', 
    'Europe/Paris', 
    'Europe/Berlin', 
    'Asia/Tokyo', 
    'Asia/Singapore', 
    'Australia/Sydney'
  ];
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-64 flex-shrink-0">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h1>
          <SettingsNavigation />
        </div>
        
        <div className="flex-1 md:ml-8">
          <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Account Settings</h2>
          
          <div className="space-y-8">
            {/* User Profile */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">User Profile</h3>
              
              {profileSuccess && (
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">
                        Your profile has been updated successfully.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    name="displayName"
                    value={profileForm.displayName}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
                    placeholder="Your Name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Job Title (optional)
                  </label>
                  <input
                    type="text"
                    name="jobTitle"
                    value={profileForm.jobTitle}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
                    placeholder="Developer, Designer, etc."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Time Zone
                  </label>
                  <select
                    name="timeZone"
                    value={profileForm.timeZone}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
                  >
                    {timeZones.map(tz => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <Button
                    type="submit"
                    disabled={isProfileSaving}
                  >
                    {isProfileSaving ? 'Saving...' : 'Save Profile'}
                  </Button>
                </div>
              </form>
            </Card>
            
            {/* Account Information */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Account Information</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="text-gray-900 dark:text-white">{user?.email}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Account Created</p>
                  <p className="text-gray-900 dark:text-white">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                
                <div className="pt-2">
                  <Button variant="outline" onClick={signOut}>
                    Sign Out
                  </Button>
                </div>
              </div>
            </Card>
            
            {/* Data Management */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Data Management</h3>
              
              <div className="space-y-6">
                {/* Export Data */}
                <div>
                  <h4 className="text-md font-medium mb-2 text-gray-900 dark:text-white">Export Your Data</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Download all your time tracking data in JSON format. This includes 
                    your projects, time entries, and settings.
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleExportData}
                    disabled={isExporting}
                  >
                    {isExporting ? 'Exporting...' : 'Export Data'}
                  </Button>
                </div>
                
                <hr className="border-gray-200 dark:border-gray-700" />
                
                {/* Delete Data */}
                <div>
                  <h4 className="text-md font-medium mb-2 text-gray-900 dark:text-white">Delete Your Data</h4>
                  
                  {deleteSuccess ? (
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md mb-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-green-800 dark:text-green-200">
                            Your data has been deleted successfully.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        You can delete your time tracking data permanently. This action cannot be undone.
                      </p>
                      
                      <div className="mb-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="deleteOption"
                            checked={!retentionDays}
                            onChange={() => setRetentionDays(null)}
                            className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 dark:border-gray-600 dark:bg-slate-700"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Delete all data</span>
                        </label>
                        
                        <label className="flex items-center mt-2">
                          <input
                            type="radio"
                            name="deleteOption"
                            checked={!!retentionDays}
                            onChange={() => setRetentionDays(30)}
                            className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 dark:border-gray-600 dark:bg-slate-700"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Keep recent data</span>
                        </label>
                        
                        {retentionDays && (
                          <div className="mt-2 ml-6">
                            <label className="text-sm text-gray-700 dark:text-gray-300">Keep data from the last</label>
                            <div className="flex items-center mt-1">
                              <input
                                type="number"
                                value={retentionDays}
                                onChange={(e) => setRetentionDays(parseInt(e.target.value) || 0)}
                                min="1"
                                max="365"
                                className="w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-slate-700 dark:text-white"
                              />
                              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">days</span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Type DELETE to confirm
                        </label>
                        <input
                          type="text"
                          value={deleteConfirm}
                          onChange={(e) => setDeleteConfirm(e.target.value)}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-slate-700 dark:text-white"
                          placeholder="DELETE"
                        />
                      </div>
                      
                      <Button
                        variant="danger"
                        onClick={handleDeleteData}
                        disabled={isDeleting || deleteConfirm !== 'DELETE'}
                      >
                        {isDeleting ? 'Deleting...' : 'Delete Data'}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
            
            {/* Privacy & Security */}
            <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-100 dark:border-indigo-800">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Privacy & Security</h3>
              
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  We value your privacy and ensure your data is securely stored.
                  Review our privacy policy to learn how we handle your information.
                </p>
                
                <a
                  href="/privacy"
                  className="inline-block text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                >
                  View Privacy Policy
                </a>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}