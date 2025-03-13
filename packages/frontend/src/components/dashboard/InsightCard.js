import React, { useContext } from 'react';
import { TimeTrackingContext } from '../../contexts/TimeTrackingContext';
import Card from '../common/Card';
import { LightBulbIcon } from '@heroicons/react/24/outline';
import Link from 'next/link'; // Import Link from next/link

// Mock functions to replace the missing ones from the shared package
const mockIdentifyDistractionPatterns = (entries) => {
  if (!entries || entries.length === 0) return [];
  
  // Simple mock implementation
  const distractions = entries.filter(entry => entry.category === 'Distraction');
  if (distractions.length > 0) {
    return [{
      type: 'frequency',
      value: distractions.length,
      description: 'You have several distractions in your work day'
    }];
  }
  return [];
};

const mockGenerateRecommendations = (patterns) => {
  if (!patterns || patterns.length === 0) return [];
  
  // Simple mock recommendations based on patterns
  const recommendations = [];
  
  patterns.forEach(pattern => {
    if (pattern.type === 'frequency' && pattern.value > 3) {
      recommendations.push({
        recommendation: 'Try using the Pomodoro technique to reduce distractions',
        confidence: 0.8
      });
    }
  });
  
  // Default recommendation if none matched
  if (recommendations.length === 0) {
    recommendations.push({
      recommendation: 'Keep tracking your time to get more personalized insights',
      confidence: 0.6
    });
  }
  
  return recommendations;
};

export default function InsightCard() {
  const { timeEntries } = useContext(TimeTrackingContext);
  
  // Try using the real functions, fallback to mock ones if they don't exist
  let patterns = [];
  let recommendations = [];
  
  try {
    // Import the functions dynamically if they exist
    const { identifyDistractionPatterns, generateRecommendations } = require('@tempos-ai/shared');
    
    if (typeof identifyDistractionPatterns === 'function') {
      patterns = identifyDistractionPatterns(timeEntries);
    } else {
      patterns = mockIdentifyDistractionPatterns(timeEntries);
    }
    
    if (typeof generateRecommendations === 'function') {
      recommendations = generateRecommendations(patterns);
    } else {
      recommendations = mockGenerateRecommendations(patterns);
    }
  } catch (error) {
    // Use mock implementations if the import fails
    patterns = mockIdentifyDistractionPatterns(timeEntries);
    recommendations = mockGenerateRecommendations(patterns);
  }
  
  // Get top recommendation if available
  const topRecommendation = recommendations.length > 0
    ? recommendations[0]
    : null;
  
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-5 text-gray-900 dark:text-white flex items-center">
        <span className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-full mr-3">
          <LightBulbIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        </span>
        Smart Insight
      </h2>
      
      {topRecommendation ? (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
          <div className="flex items-start">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex-shrink-0">
              <LightBulbIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            
            <div className="ml-4">
              <div className="text-md font-medium text-gray-900 dark:text-white">Distraction Pattern Detected</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {topRecommendation.recommendation}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg shadow-sm text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            Continue tracking your time to receive personalized insights.
          </p>
        </div>
      )}
      
      <div className="mt-4 text-xs text-right">
        <Link href="/insights" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium">
          View all insights →
        </Link>
      </div>
    </Card>
  );
}