import React, { useContext } from 'react';
import { TimeTrackingContext } from '../../contexts/TimeTrackingContext';
import Card from '../common/Card';

export default function AvgTimeCard() {
  const { timeEntries, getAverageTaskDuration, isLoading } = useContext(TimeTrackingContext);
  
  // Call the function with null parameter to get all categories
  // and implement a fallback calculation
  const calculateAvgTime = () => {
    // First try the context function with explicit null parameter
    const contextAvg = getAverageTaskDuration(null);
    if (contextAvg) return contextAvg;
    
    // If that doesn't work, calculate manually
    if (!timeEntries || timeEntries.length === 0) return null;
    
    // Filter for completed entries with duration that aren't distractions
    const validEntries = timeEntries.filter(entry => 
      entry.duration && 
      entry.duration > 0 && 
      entry.category !== 'Distraction');
    
    if (validEntries.length === 0) return null;
    
    // Calculate average
    const totalDuration = validEntries.reduce((sum, entry) => sum + entry.duration, 0);
    const avgSeconds = Math.round(totalDuration / validEntries.length);
    
    // Format to human-readable time
    return {
      seconds: avgSeconds,
      formatted: formatDuration(avgSeconds)
    };
  };
  
  const avgTime = calculateAvgTime();
  
  // Helper function to format seconds into a readable duration
  function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }
  
  // If loading or no data
  if (isLoading) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-5 text-gray-900 dark:text-white flex items-center">
          <span className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-full mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          Average Task Time
        </h2>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
          <div className="h-16 flex items-center justify-center">
            <div className="text-gray-400 dark:text-gray-500">Loading...</div>
          </div>
        </div>
      </Card>
    );
  }
  
  if (!timeEntries.length || !avgTime) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-5 text-gray-900 dark:text-white flex items-center">
          <span className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-full mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          Average Task Time
        </h2>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
          <div className="text-gray-500 dark:text-gray-400 text-sm">
            Not enough data yet
          </div>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-5 text-gray-900 dark:text-white flex items-center">
        <span className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-full mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </span>
        Average Task Time
      </h2>
      
      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
        <div className="flex items-center">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          
          <div className="ml-4">
            <div className="text-xl font-medium text-gray-900 dark:text-white">{avgTime.formatted}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Average task duration
            </div>
          </div>
        </div>
        
        <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          Plan your work blocks according to your average task time.
        </div>
      </div>
    </Card>
  );
}