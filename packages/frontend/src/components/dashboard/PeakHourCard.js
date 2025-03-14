import React, { useContext } from 'react';
import { TimeTrackingContext } from '../../contexts/TimeTrackingContext';
import Card from '../common/Card';

export default function PeakHourCard() {
  const { timeEntries, getPeakHour, isLoading } = useContext(TimeTrackingContext);
  
  // Get actual peak hour data instead of using a mock
  const peakHourData = getPeakHour();
  
  // Format the peak hour if available
  const formatPeakHour = (hour) => {
    if (hour === undefined) return null;
    
    // Convert 24h format to 12h format with AM/PM
    const startHour = hour % 12 === 0 ? 12 : hour % 12;
    const endHour = (hour + 1) % 12 === 0 ? 12 : (hour + 1) % 12;
    const startAmPm = hour < 12 ? 'AM' : 'PM';
    const endAmPm = (hour + 1) < 12 ? 'AM' : 'PM';
    
    return `${startHour}:00 ${startAmPm} - ${endHour}:00 ${endAmPm}`;
  };
  
  const formattedPeakHour = peakHourData ? formatPeakHour(peakHourData.hour) : null;
  
  // If loading or no data
  if (isLoading) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-5 text-gray-900 dark:text-white flex items-center">
          <span className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-full mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </span>
          Peak Productivity
        </h2>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
          <div className="h-16 flex items-center justify-center">
            <div className="text-gray-400 dark:text-gray-500">Loading...</div>
          </div>
        </div>
      </Card>
    );
  }
  
  // Don't check for length > 5, just check if we have any data
  if (!timeEntries.length || !peakHourData || !formattedPeakHour) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-5 text-gray-900 dark:text-white flex items-center">
          <span className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-full mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </span>
          Peak Productivity
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </span>
        Peak Productivity
      </h2>
      
      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
        <div className="flex items-center">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <div className="ml-4">
            <div className="text-xl font-medium text-gray-900 dark:text-white">{formattedPeakHour}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Most productive time
            </div>
          </div>
        </div>
        
        <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          {peakHourData?.duration ? `${formatDuration(peakHourData.duration)} of focused work during this hour.` : 
            'Schedule your most important tasks during your peak productivity hours.'}
        </div>
      </div>
    </Card>
  );
}

// Helper function to format duration in seconds to a readable string
function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}