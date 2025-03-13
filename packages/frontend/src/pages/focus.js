// packages/frontend/src/pages/focus.js
import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useFocusContext } from '../contexts/FocusContext';
import FocusTimer from '../components/focus/FocusTimer';
import DistractionPrompt from '../components/focus/DistractionPrompt';
import FocusStats from '../components/focus/FocusStats';
import Card from '../components/common/Card';

export default function FocusPage() {
  const { user, isLoading } = useContext(AuthContext);
  const { focusStats } = useFocusContext();
  const [showDistractedPrompt, setShowDistractedPrompt] = useState(false);
  
  // Show loading state
  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }
  
  // Format minutes to a readable time string (e.g., "2 hours 15 minutes" or "45 minutes")
  const formatTimeString = (minutes) => {
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
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Focus Mode</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <FocusTimer
            onDistracted={() => setShowDistractedPrompt(true)}
          />
          
          {/* Tips for better focus */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-5 text-gray-900 dark:text-white">Tips for Better Focus</h2>
            <ul className="space-y-4">
              <li className="flex items-start">
                <span className="flex w-7 h-7 rounded-full bg-indigo-500 text-white items-center justify-center mr-3 mt-0.5 flex-shrink-0">1</span>
                <span className="text-gray-700 dark:text-gray-300">Start with a clear intention for your focus session</span>
              </li>
              <li className="flex items-start">
                <span className="flex w-7 h-7 rounded-full bg-indigo-500 text-white items-center justify-center mr-3 mt-0.5 flex-shrink-0">2</span>
                <span className="text-gray-700 dark:text-gray-300">Keep your phone out of sight and on silent</span>
              </li>
              <li className="flex items-start">
                <span className="flex w-7 h-7 rounded-full bg-indigo-500 text-white items-center justify-center mr-3 mt-0.5 flex-shrink-0">3</span>
                <span className="text-gray-700 dark:text-gray-300">Use the Pomodoro technique: 25 minutes focus, 5 minutes break</span>
              </li>
              <li className="flex items-start">
                <span className="flex w-7 h-7 rounded-full bg-indigo-500 text-white items-center justify-center mr-3 mt-0.5 flex-shrink-0">4</span>
                <span className="text-gray-700 dark:text-gray-300">Stay hydrated and take short movement breaks</span>
              </li>
            </ul>
          </Card>
        </div>
        
        <div className="space-y-8">
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
        </div>
      </div>
      
      {/* Distraction Prompt Modal */}
      {showDistractedPrompt && (
        <DistractionPrompt
          onResume={() => setShowDistractedPrompt(false)}
        />
      )}
    </div>
  );
}