// packages/frontend/src/components/focus/FocusStats.js
import React from 'react';
import { useFocusContext } from '../../contexts/FocusContext';
import Card from '../common/Card';

export default function FocusStats() {
  const { 
    focusStats, 
    formatTimeString = (minutes) => {
      // Fallback implementation if formatTimeString is not provided by context
      if (!minutes) return '0 minutes';
      
      if (minutes < 60) {
        return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
      } else {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        
        if (remainingMinutes === 0) {
          return `${hours} hour${hours !== 1 ? 's' : ''}`;
        } else {
          return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
        }
      }
    }
  } = useFocusContext();
  
  return (
    <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-100 dark:border-indigo-800">
      <h2 className="text-xl font-semibold mb-5 text-gray-900 dark:text-white flex items-center">
        <span className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-full mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </span>
        Your Focus Stats
      </h2>
      <div className="space-y-5">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Average Focus Session</p>
          <p className="text-2xl font-medium text-gray-900 dark:text-white">
            {formatTimeString(focusStats?.averageSession || 0)}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Longest Streak</p>
          <p className="text-2xl font-medium text-gray-900 dark:text-white">
            {formatTimeString(focusStats?.longestStreak || 0)}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Focus Sessions Today</p>
          <p className="text-2xl font-medium text-gray-900 dark:text-white">
            {focusStats?.sessionsToday || 0} session{(focusStats?.sessionsToday || 0) !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </Card>
  );
}