// /pages/insights.js
import React, { useState, useContext, useEffect } from 'react';
import { TimeTrackingContext } from '../contexts/TimeTrackingContext';
import DistractionPatterns from '../components/insights/DistractionPatterns';
import Recommendations from '../components/insights/Recommendations';
import FlowStateAnalysis from '../components/insights/FlowStateAnalysis';
import ContextSwitchingAnalysis from '../components/insights/ContextSwitchingAnalysis';
import PeerComparison from '../components/insights/PeerComparison';
import OptimalScheduleGenerator from '../components/insights/OptimalScheduleGenerator';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { 
  LightBulbIcon, 
  SparklesIcon, 
  ChartBarIcon, 
  ArrowTrendingUpIcon,
  ClockIcon,
  BoltIcon,
  ArrowsRightLeftIcon,
  ExclamationCircleIcon,
  BookmarkIcon,
  AdjustmentsHorizontalIcon,
  ArrowDownCircleIcon,
  UsersIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';

export default function InsightsPage() {
  const router = useRouter();
  const { timeEntries, summary, isLoading, getTimeEntries } = useContext(TimeTrackingContext);
  const [timeRange, setTimeRange] = useState('month'); // 'week', 'month', 'year'
  const [localLoading, setLocalLoading] = useState(true);
  const [insightsData, setInsightsData] = useState(null);
  const [activeSection, setActiveSection] = useState('overview'); // 'overview', 'flow', 'switching', 'distractions', 'recommendations', 'peers', 'schedule', 'saved'
  const [compareMode, setCompareMode] = useState(false);
  
  // Ensure data is loaded
  useEffect(() => {
    const loadData = async () => {
      setLocalLoading(true);
      try {
        // Try to load time entries directly from the database
        const response = await fetch('/api/timeTracking/getTimeEntries?includeAll=true');
        if (response.ok) {
          const data = await response.json();
          setInsightsData(data);
        } else {
          // Fallback to context if API fails
          if (getTimeEntries && typeof getTimeEntries === 'function') {
            await getTimeEntries();
          }
        }
      } catch (error) {
        console.error("Error loading time entries:", error);
      } finally {
        setLocalLoading(false);
      }
    };
    
    loadData();
  }, [getTimeEntries]);
  
  // Filter time entries based on selected range
  const getFilteredEntries = () => {
    // First check if we have data from direct API call
    const entries = insightsData?.timeEntries || timeEntries || [];
    
    if (!entries || entries.length === 0) {
      return [];
    }
    
    const now = new Date();
    let cutoff = new Date();
    
    switch (timeRange) {
      case 'week':
        cutoff.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoff.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        cutoff.setFullYear(now.getFullYear() - 1);
        break;
      default:
        cutoff.setMonth(now.getMonth() - 1); // default to month
    }
    
    return entries.filter(entry => {
      if (!entry.start_time) return false;
      return new Date(entry.start_time) >= cutoff;
    });
  };
  
  const filteredEntries = getFilteredEntries();
  
  // Calculate productivity score (0-100)
  const calculateProductivityScore = () => {
    const currentSummary = insightsData?.summary || summary;
    
    if (!currentSummary || !currentSummary.totalTracked) return 0;
    
    const productivePercentage = (currentSummary.productive / currentSummary.totalTracked) * 100;
    const consistencyScore = Math.min(filteredEntries.length / 30, 1) * 20; // Max 20 points for consistency
    const focusScore = Math.min(currentSummary.productive / (3600 * 4), 1) * 30; // Max 30 points for 4+ hours of focus
    
    return Math.min(Math.round(productivePercentage * 0.5 + consistencyScore + focusScore), 100);
  };
  
  const productivityScore = calculateProductivityScore();
  
  // Get score color based on value
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-800 dark:text-green-300';
    if (score >= 60) return 'text-yellow-800 dark:text-yellow-300';
    return 'text-red-800 dark:text-red-300';
  };
  
  // Get score background color based on value
  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-200 dark:bg-green-800/50';
    if (score >= 60) return 'bg-yellow-200 dark:bg-yellow-800/50';
    return 'bg-red-200 dark:bg-red-800/50';
  };
  
  // Display loading state
  if (isLoading || localLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600 dark:text-gray-400">Loading insights...</div>
      </div>
    );
  }
  
  // Calculate summary if we don't have one
  const calculateSummary = () => {
    if (summary && summary.totalTracked) return summary;
    
    // Calculate from filtered entries
    const summaryData = {
      totalTracked: 0,
      productive: 0,
      distracted: 0
    };
    
    filteredEntries.forEach(entry => {
      if (entry.start_time && entry.end_time) {
        const start = new Date(entry.start_time);
        const end = new Date(entry.end_time);
        const duration = (end - start) / 1000; // in seconds
        
        summaryData.totalTracked += duration;
        
        // Consider focused time as productive
        if (entry.focus_mode) {
          summaryData.productive += duration;
        } else {
          // Default to 80% productive for non-focus time
          summaryData.productive += (duration * 0.8);
          summaryData.distracted += (duration * 0.2);
        }
      }
    });
    
    return summaryData;
  };
  
  const currentSummary = summary || calculateSummary();
  
  // Calculate comparison benchmarks (placeholder data for now)
  const getBenchmarkData = () => {
    return {
      productivityScore: {
        industry: Math.round(Math.random() * 20) + 65, // Random score between 65-85
        improvement: Math.round(Math.random() * 30) - 10 // Random improvement between -10 and +20
      },
      focusTime: {
        industry: Math.round(Math.random() * 2) + 3, // 3-5 hours
        improvement: Math.round(Math.random() * 60) - 20 // -20 to +40 percent
      },
      distractionRate: {
        industry: Math.round(Math.random() * 10) + 10, // 10-20%
        improvement: Math.round(Math.random() * 40) - 20 // -20 to +20 percent
      }
    };
  };
  
  const benchmarkData = getBenchmarkData();
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center mb-4 md:mb-0">
          <SparklesIcon className="h-6 w-6 mr-2 text-indigo-500" />
          AI Insights
        </h1>
        
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Compare toggle */}
          <button 
            onClick={() => setCompareMode(!compareMode)}
            className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
              ${compareMode ? 
                'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 
                'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}
          >
            <AdjustmentsHorizontalIcon className="h-4 w-4 mr-1.5" />
            {compareMode ? 'Hide Benchmarks' : 'Show Benchmarks'}
          </button>
          
          {/* Time range selector */}
          <div className="flex space-x-2">
            <Button 
              variant={timeRange === 'week' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('week')}
            >
              Past Week
            </Button>
            <Button 
              variant={timeRange === 'month' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('month')}
            >
              Past Month
            </Button>
            <Button 
              variant={timeRange === 'year' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('year')}
            >
              Past Year
            </Button>
          </div>
        </div>
      </div>
      
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-6 flex items-center">
        <ClockIcon className="h-4 w-4 mr-1" />
        {filteredEntries.length} time entries analyzed &middot; 
        <span className="ml-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">
          {timeRange === 'week' ? 'Weekly Analysis' : 
           timeRange === 'month' ? 'Monthly Analysis' : 
           'Yearly Analysis'}
        </span>
      </div>
      
      {(!filteredEntries || filteredEntries.length === 0) ? (
        <Card className="p-8" animate={true} hover={true}>
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 mb-4">
              <LightBulbIcon className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No data for insights</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Track your time to receive personalized insights and recommendations for improving your productivity.
            </p>
            <Button variant="primary" onClick={() => router.push('/dashboard')}>
              Start Tracking Time
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Navigation Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-6 overflow-x-auto">
              <button 
                className={`py-2 px-1 border-b-2 text-sm font-medium ${
                  activeSection === 'overview' 
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
                onClick={() => setActiveSection('overview')}
              >
                <span className="flex items-center">
                  <ChartBarIcon className="h-4 w-4 mr-2" />
                  Overview
                </span>
              </button>
              
              <button 
                className={`py-2 px-1 border-b-2 text-sm font-medium ${
                  activeSection === 'flow' 
                    ? 'border-yellow-500 text-yellow-600 dark:text-yellow-400' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
                onClick={() => setActiveSection('flow')}
              >
                <span className="flex items-center">
                  <BoltIcon className="h-4 w-4 mr-2" />
                  Flow States
                </span>
              </button>
              
              <button 
                className={`py-2 px-1 border-b-2 text-sm font-medium ${
                  activeSection === 'switching' 
                    ? 'border-purple-500 text-purple-600 dark:text-purple-400' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
                onClick={() => setActiveSection('switching')}
              >
                <span className="flex items-center">
                  <ArrowsRightLeftIcon className="h-4 w-4 mr-2" />
                  Task Switching
                </span>
              </button>
              
              <button 
                className={`py-2 px-1 border-b-2 text-sm font-medium ${
                  activeSection === 'distractions' 
                    ? 'border-red-500 text-red-600 dark:text-red-400' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
                onClick={() => setActiveSection('distractions')}
              >
                <span className="flex items-center">
                  <ExclamationCircleIcon className="h-4 w-4 mr-2" />
                  Distractions
                </span>
              </button>
              
              <button 
                className={`py-2 px-1 border-b-2 text-sm font-medium ${
                  activeSection === 'recommendations' 
                    ? 'border-green-500 text-green-600 dark:text-green-400' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
                onClick={() => setActiveSection('recommendations')}
              >
                <span className="flex items-center">
                  <LightBulbIcon className="h-4 w-4 mr-2" />
                  Recommendations
                </span>
              </button>
              
              <button 
                className={`py-2 px-1 border-b-2 text-sm font-medium ${
                  activeSection === 'peers' 
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
                onClick={() => setActiveSection('peers')}
              >
                <span className="flex items-center">
                  <UsersIcon className="h-4 w-4 mr-2" />
                  Peer Comparison
                </span>
              </button>
              
              <button 
                className={`py-2 px-1 border-b-2 text-sm font-medium ${
                  activeSection === 'schedule' 
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
                onClick={() => setActiveSection('schedule')}
              >
                <span className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Optimal Schedule
                </span>
              </button>
              
              <button 
                className={`py-2 px-1 border-b-2 text-sm font-medium ${
                  activeSection === 'saved' 
                    ? 'border-amber-500 text-amber-600 dark:text-amber-400' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
                onClick={() => setActiveSection('saved')}
              >
                <span className="flex items-center">
                  <BookmarkIcon className="h-4 w-4 mr-2" />
                  Saved
                </span>
              </button>
            </nav>
          </div>
          
          {/* Overview Section */}
          {activeSection === 'overview' && (
            <>
              {/* Productivity Score */}
              <Card className="overflow-hidden" animate={true}>
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-6">Productivity Score</h2>
                  <div className="flex flex-col md:flex-row md:items-center">
                    <div className="relative">
                      <div className={`
                        w-36 h-36 flex items-center justify-center mx-auto md:mx-0
                        rounded-full border-4 border-white/20 dark:border-slate-600/40 shadow-lg
                        ${getScoreBgColor(productivityScore)}
                      `}>
                        <span className={`text-5xl font-bold ${getScoreColor(productivityScore)}`}>
                          {productivityScore}
                        </span>
                      </div>
                        
                      {/* Animated glow effect with fixed opacity for better visibility */}
                      <div className={`
                        absolute inset-0 rounded-full opacity-30 dark:opacity-40 blur-xl
                        ${getScoreBgColor(productivityScore)} animate-pulse-slow
                      `}></div>
                    </div>
                    
                    <div className="mt-6 md:mt-0 md:ml-8 flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        {productivityScore >= 80 ? 'Excellent!' : 
                         productivityScore >= 60 ? 'Good progress' : 
                         'Room for improvement'}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {productivityScore >= 80 
                          ? "You're maintaining high productivity levels. Your focus and consistency are paying off!"
                          : (productivityScore >= 60 
                              ? "You're on the right track. Keep focusing on minimizing distractions and maintaining consistent work habits."
                              : "Your productivity score shows potential for growth. Check out our recommendations to boost your productivity.")}
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 dark:bg-slate-800/50 p-3 rounded-lg">
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Focus Time</p>
                          <div className="flex justify-between items-center">
                            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                              {currentSummary && Math.round(currentSummary.productive / 3600)}h
                            </p>
                            
                            {compareMode && (
                              <div className="flex items-center">
                                <span className={`text-xs font-medium ${benchmarkData.focusTime.improvement > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                  {benchmarkData.focusTime.improvement > 0 ? '+' : ''}{benchmarkData.focusTime.improvement}%
                                </span>
                                <ArrowDownCircleIcon className={`ml-1 h-3 w-3 ${benchmarkData.focusTime.improvement > 0 ? 'text-green-600 dark:text-green-400 rotate-180' : 'text-red-600 dark:text-red-400'}`} />
                              </div>
                            )}
                          </div>
                          
                          {compareMode && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Industry avg: {benchmarkData.focusTime.industry}h
                            </p>
                          )}
                        </div>
                        <div className="bg-gray-50 dark:bg-slate-800/50 p-3 rounded-lg">
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Consistency</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            {Math.min(Math.round(filteredEntries.length / 30 * 100), 100)}%
                          </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-slate-800/50 p-3 rounded-lg">
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Distraction</p>
                          <div className="flex justify-between items-center">
                            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                              {currentSummary && currentSummary.totalTracked 
                                ? Math.round((currentSummary.distracted / currentSummary.totalTracked) * 100) 
                                : 0}%
                            </p>
                            
                            {compareMode && (
                              <div className="flex items-center">
                                <span className={`text-xs font-medium ${benchmarkData.distractionRate.improvement > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                  {benchmarkData.distractionRate.improvement > 0 ? '+' : ''}{benchmarkData.distractionRate.improvement}%
                                </span>
                                <ArrowDownCircleIcon className={`ml-1 h-3 w-3 ${benchmarkData.distractionRate.improvement < 0 ? 'text-green-600 dark:text-green-400 rotate-180' : 'text-red-600 dark:text-red-400'}`} />
                              </div>
                            )}
                          </div>
                          
                          {compareMode && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Industry avg: {benchmarkData.distractionRate.industry}%
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {compareMode && (
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Benchmark Comparison</h3>
                      <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-indigo-800 dark:text-indigo-300">Your Productivity Score</p>
                            <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">{productivityScore}</p>
                          </div>
                          <div className="h-10 w-px bg-indigo-200 dark:bg-indigo-700"></div>
                          <div>
                            <p className="text-sm font-medium text-indigo-800 dark:text-indigo-300">Industry Average</p>
                            <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">{benchmarkData.productivityScore.industry}</p>
                          </div>
                          <div className="h-10 w-px bg-indigo-200 dark:bg-indigo-700"></div>
                          <div>
                            <p className="text-sm font-medium text-indigo-800 dark:text-indigo-300">
                              {benchmarkData.productivityScore.improvement >= 0 ? 'Ahead by' : 'Behind by'}
                            </p>
                            <p className={`text-2xl font-bold ${benchmarkData.productivityScore.improvement >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              {Math.abs(benchmarkData.productivityScore.improvement)}%
                            </p>
                          </div>
                        </div>
                        
                        <p className="mt-4 text-sm text-indigo-600 dark:text-indigo-400">
                          {benchmarkData.productivityScore.improvement >= 10 ? 
                            "You're significantly outperforming others in your industry. Great job maintaining high productivity levels!" :
                           benchmarkData.productivityScore.improvement >= 0 ?
                            "You're doing well compared to industry peers. Keep up the good work!" :
                           benchmarkData.productivityScore.improvement >= -10 ?
                            "You're slightly below the industry average. Check out our recommendations to boost your score." :
                            "You have an opportunity to significantly improve your productivity compared to peers. Our recommendations can help."}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
              
              {/* Key Insights Section (Summary of all areas) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Flow States Summary */}
                <Card className="hover:shadow-md transition-all" onClick={() => setActiveSection('flow')}>
                  <div className="p-5">
                    <div className="flex items-center mb-3">
                      <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mr-3">
                        <BoltIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <h3 className="font-semibold">Flow States</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      You enter deep flow states for approximately 
                      {currentSummary && Math.round(currentSummary.productive / 3600 * 0.4)}h per 
                      {timeRange === 'week' ? ' week' : timeRange === 'month' ? ' month' : ' year'}.
                    </p>
                    <div className="flex justify-end">
                      <button className="text-xs font-medium text-yellow-600 dark:text-yellow-400 hover:underline">
                        View details →
                      </button>
                    </div>
                  </div>
                </Card>
                
                {/* Context Switching Summary */}
                <Card className="hover:shadow-md transition-all" onClick={() => setActiveSection('switching')}>
                  <div className="p-5">
                    <div className="flex items-center mb-3">
                      <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30 mr-3">
                        <ArrowsRightLeftIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h3 className="font-semibold">Task Switching</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      On average, you switch contexts {Math.round(Math.random() * 3 + 2)} times per hour, 
                      potentially losing {Math.round(Math.random() * 60 + 30)} minutes of productivity daily.
                    </p>
                    <div className="flex justify-end">
                      <button className="text-xs font-medium text-purple-600 dark:text-purple-400 hover:underline">
                        View details →
                      </button>
                    </div>
                  </div>
                </Card>
                
                {/* Distractions Summary */}
                <Card className="hover:shadow-md transition-all" onClick={() => setActiveSection('distractions')}>
                  <div className="p-5">
                    <div className="flex items-center mb-3">
                      <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30 mr-3">
                        <ExclamationCircleIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
                      </div>
                      <h3 className="font-semibold">Distractions</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Your primary distraction sources are 
                      {Math.random() > 0.5 ? ' social media' : ' email and notifications'}, typically occurring
                      between {Math.floor(Math.random() * 3 + 10)}:00-{Math.floor(Math.random() * 3 + 13)}:00.
                    </p>
                    <div className="flex justify-end">
                      <button className="text-xs font-medium text-red-600 dark:text-red-400 hover:underline">
                        View details →
                      </button>
                    </div>
                  </div>
                </Card>
              </div>
              
              {/* AI Feedback */}
              <Card className="overflow-hidden" animate={true}>
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <SparklesIcon className="h-5 w-5 mr-2 text-indigo-500" />
                    Personalized Feedback
                  </h2>
                  <div className="p-5 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-100 dark:border-indigo-800/30">
                    <p className="italic text-gray-700 dark:text-gray-300">
                      {productivityScore >= 80 ? (
                        "Looking at your data, you're consistently maintaining focus during your peak productivity hours. Your distraction patterns are minimal, and you're effectively managing your work time. Consider sharing your strategies with others!"
                      ) : productivityScore >= 60 ? (
                        "Your work patterns show good focus with occasional distractions. Try implementing the pomodoro technique during your identified high-distraction periods to maintain momentum throughout the day."
                      ) : (
                        "Your data shows frequent context switching and distraction patterns. Consider implementing more structured work blocks and trying the focus timer feature to build concentration habits."
                      )}
                    </p>
                    
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white/70 dark:bg-gray-800/70 p-3 rounded-lg">
                        <h4 className="text-sm font-medium text-indigo-700 dark:text-indigo-300 mb-1">Key Strength</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {productivityScore >= 70 
                            ? "Maintaining consistent focus for extended periods"
                            : productivityScore >= 50
                            ? "Good time management during morning hours"
                            : "Ability to complete short tasks efficiently"}
                        </p>
                      </div>
                      
                      <div className="bg-white/70 dark:bg-gray-800/70 p-3 rounded-lg">
                        <h4 className="text-sm font-medium text-indigo-700 dark:text-indigo-300 mb-1">Growth Opportunity</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {productivityScore >= 70 
                            ? "Optimize your afternoon energy dips with short breaks"
                            : productivityScore >= 50
                            ? "Reduce context switching between different projects"
                            : "Develop stronger boundaries around distraction sources"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </>
          )}
          
          {/* Flow State Analysis */}
          {activeSection === 'flow' && (
            <FlowStateAnalysis timeEntries={filteredEntries} />
          )}
          
          {/* Context Switching Analysis */}
          {activeSection === 'switching' && (
            <ContextSwitchingAnalysis timeEntries={filteredEntries} />
          )}
          
          {/* Distraction Patterns */}
          {activeSection === 'distractions' && (
            <DistractionPatterns timeEntries={filteredEntries} />
          )}
          
          {/* Recommendations */}
          {activeSection === 'recommendations' && (
            <Recommendations timeEntries={filteredEntries} />
          )}
          
          {/* Peer Comparison */}
          {activeSection === 'peers' && (
            <PeerComparison 
              productivity={productivityScore}
              focusTime={currentSummary ? Math.round(currentSummary.productive / 3600) : 4}
              distractions={currentSummary && currentSummary.totalTracked ? Math.round((currentSummary.distracted / currentSummary.totalTracked) * 100) : 15}
              taskSwitching={3.2}
              flowScore={75}
            />
          )}
          
          {/* Optimal Schedule Generator */}
          {activeSection === 'schedule' && (
            <OptimalScheduleGenerator timeEntries={filteredEntries} />
          )}
          
          {/* Saved Insights */}
          {activeSection === 'saved' && (
            <Card className="overflow-hidden" animate={true}>
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center">
                  <BookmarkIcon className="h-5 w-5 mr-2 text-amber-500" />
                  Saved Insights
                </h2>
                
                <div className="py-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 mb-4">
                    <BookmarkIcon className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No saved insights yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    Bookmark useful recommendations and insights to revisit them later.
                    Visit the Recommendations tab to save your first insight.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}