import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export const useActivities = (projectId) => {
  const { user } = useContext(AuthContext);
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch activities when projectId changes or on mount
  useEffect(() => {
    if (user && projectId) {
      fetchActivities();
    } else {
      setActivities([]);
      setIsLoading(false);
    }
  }, [user, projectId]);

  // Fetch all activities for a specific project
  const fetchActivities = async () => {
    if (!user || !projectId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/activities/getActivities?projectId=${projectId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch activities');
      }
      
      const data = await response.json();
      console.log('Fetched activities:', data.activities); // Debug log
      setActivities(data.activities || []);
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError('Failed to load activities');
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new activity
  const createActivity = async (name, description = '', hourlyRate = null) => {
    if (!user || !projectId) return null;
    
    try {
      console.log('Creating activity:', { 
        name, 
        description, 
        hourly_rate: hourlyRate,
        project_id: projectId
      }); // Debug log
      
      const response = await fetch('/api/activities/createActivity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name, 
          description, 
          hourly_rate: hourlyRate,
          project_id: projectId
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create activity');
      }
      
      const { activity } = await response.json();
      console.log('Created activity:', activity); // Debug log
      
      // Update local state
      setActivities(prevActivities => [activity, ...prevActivities]);
      
      return activity;
    } catch (err) {
      console.error('Error creating activity:', err);
      setError('Failed to create activity');
      return null;
    }
  };

  // Update an existing activity
  const updateActivity = async (activityId, updates) => {
    if (!user) return null;
    
    try {
      const response = await fetch(`/api/activities/updateActivity`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          activity_id: activityId,
          updates 
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update activity');
      }
      
      const { activity } = await response.json();
      
      // Update local state
      setActivities(prevActivities => 
        prevActivities.map(a => a.id === activity.id ? activity : a)
      );
      
      return activity;
    } catch (err) {
      console.error('Error updating activity:', err);
      setError('Failed to update activity');
      return null;
    }
  };

  // Delete an activity
  const deleteActivity = async (activityId) => {
    if (!user) return false;
    
    try {
      const response = await fetch(`/api/activities/deleteActivity?id=${activityId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete activity');
      }
      
      // Update local state
      setActivities(prevActivities => 
        prevActivities.filter(a => a.id !== activityId)
      );
      
      return true;
    } catch (err) {
      console.error('Error deleting activity:', err);
      setError('Failed to delete activity');
      return false;
    }
  };

  return {
    activities,
    isLoading,
    error,
    fetchActivities,
    createActivity,
    updateActivity,
    deleteActivity,
  };
};