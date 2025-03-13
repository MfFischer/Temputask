import React, { useState, useMemo } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { 
  CalendarIcon, 
  ClockIcon, 
  ArrowPathIcon, 
  DocumentDuplicateIcon,
  CheckIcon,
  BoltIcon,
  CogIcon,
  BeakerIcon,
  ArrowDownTrayIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';

const OptimalScheduleGenerator = ({ timeEntries }) => {
  const [scheduleType, setScheduleType] = useState('balanced'); // 'focused', 'balanced', 'flexible'
  const [showDetails, setShowDetails] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  // Analyze productivity patterns in time entries
  const productivityPatterns = useMemo(() => {
    if (!timeEntries || timeEntries.length === 0) {
      return {
        morningScore: 65,
        afternoonScore: 55,
        eveningScore: 45,
        peakHours: [9, 10, 15],
        slumpHours: [13, 22, 23],
        averageSessionLength: 45,
        hasLongFocusSessions: true
      };
    }
    
    // Distribution by hour (0-23)
    const hourlyDistribution = Array(24).fill().map(() => ({
      totalTime: 0,
      focusTime: 0,
      distractionTime: 0,
      entries: 0
    }));
    
    timeEntries.forEach(entry => {
      if (!entry.start_time || !entry.duration) return;
      
      const hour = new Date(entry.start_time).getHours();
      
      hourlyDistribution[hour].entries += 1;
      hourlyDistribution[hour].totalTime += entry.duration;
      
      if (entry.category === 'Distraction') {
        hourlyDistribution[hour].distractionTime += entry.duration;
      } else {
        hourlyDistribution[hour].focusTime += entry.duration;
      }
    });
    
    // Calculate productivity scores per hour (focus time / total time)
    const hourlyScores = hourlyDistribution.map((hour, index) => ({
      hour: index,
      productivity: hour.totalTime > 0 
        ? (hour.focusTime / hour.totalTime) * 100 
        : 0,
      volume: hour.totalTime,
      count: hour.entries
    })).filter(hour => hour.volume > 0); // Only include hours with data
    
    // Group into time blocks
    const morningHours = hourlyScores.filter(h => h.hour >= 5 && h.hour < 12);
    const afternoonHours = hourlyScores.filter(h => h.hour >= 12 && h.hour < 18);
    const eveningHours = hourlyScores.filter(h => h.hour >= 18 || h.hour < 5);
    
    // Calculate average scores per block
    const morningScore = morningHours.length > 0
      ? Math.round(morningHours.reduce((sum, h) => sum + h.productivity, 0) / morningHours.length)
      : 65; // Default if no data
      
    const afternoonScore = afternoonHours.length > 0
      ? Math.round(afternoonHours.reduce((sum, h) => sum + h.productivity, 0) / afternoonHours.length)
      : 55; // Default if no data
      
    const eveningScore = eveningHours.length > 0
      ? Math.round(eveningHours.reduce((sum, h) => sum + h.productivity, 0) / eveningHours.length)
      : 40; // Default if no data
    
    // Find peak productivity hours (top 3 hours with highest scores and sufficient data)
    const peakHours = [...hourlyScores]
      .filter(h => h.count >= 3) // At least 3 entries for statistical significance
      .sort((a, b) => b.productivity - a.productivity)
      .slice(0, 3)
      .map(h => h.hour);
      
    // Find productivity slump hours (lowest scores with sufficient data)
    const slumpHours = [...hourlyScores]
      .filter(h => h.count >= 3) // At least 3 entries for statistical significance
      .sort((a, b) => a.productivity - b.productivity)
      .slice(0, 3)
      .map(h => h.hour);
    
    // If we don't have enough data, use reasonable defaults
    if (peakHours.length === 0) peakHours.push(9, 10, 15);
    if (slumpHours.length === 0) slumpHours.push(13, 22, 23);
    
    // Check if user has long focus sessions
    const longSessions = timeEntries.filter(entry => 
      entry.category !== 'Distraction' && 
      entry.duration && 
      entry.duration > 60 * 60 // More than 60 minutes
    ).length;
    
    const hasLongFocusSessions = longSessions > 0;
    
    // Calculate average session length for non-distraction entries
    const workEntries = timeEntries.filter(entry => 
      entry.category !== 'Distraction' && entry.duration
    );
    
    const averageSessionLength = workEntries.length > 0
      ? Math.round(workEntries.reduce((sum, entry) => sum + entry.duration, 0) / workEntries.length / 60) // In minutes
      : 45; // Default if no data
    
    return {
      morningScore,
      afternoonScore,
      eveningScore,
      peakHours,
      slumpHours,
      averageSessionLength,
      hasLongFocusSessions
    };
  }, [timeEntries]);
  
  // Generate schedule blocks based on productivity patterns
  const generateSchedule = (type = scheduleType) => {
    // Start with a basic 9-5 schedule
    const start = 9;
    const end = 17;
    
    // Adjust based on productivity patterns
    const { peakHours, slumpHours, averageSessionLength, hasLongFocusSessions } = productivityPatterns;
    
    // Sort peak and slump hours
    const sortedPeakHours = [...peakHours].sort((a, b) => a - b);
    const sortedSlumpHours = [...slumpHours].sort((a, b) => a - b);
    
    // Determine focus block duration based on user data and schedule type
    let focusBlockDuration;
    if (type === 'focused') {
      focusBlockDuration = hasLongFocusSessions ? 90 : 60;
    } else if (type === 'balanced') {
      focusBlockDuration = Math.max(Math.min(averageSessionLength, 60), 30);
    } else { // flexible
      focusBlockDuration = 25; // Pomodoro style
    }
    
    // Determine break duration based on schedule type
    const breakDuration = type === 'focused' ? 15 : type === 'balanced' ? 10 : 5;
    
    // Determine number of blocks in a row before a longer break
    const blocksBeforeLongBreak = type === 'focused' ? 2 : type === 'balanced' ? 3 : 4;
    
    // Long break duration
    const longBreakDuration = type === 'focused' ? 30 : type === 'balanced' ? 20 : 15;
    
    // Generate blocks
    const blocks = [];
    let currentHour = start;
    let currentMinute = 0;
    let blockCount = 0;
    
    while (currentHour < end) {
      // Format time
      const startTime = `${currentHour % 12 || 12}:${currentMinute.toString().padStart(2, '0')} ${currentHour >= 12 ? 'PM' : 'AM'}`;
      
      // Determine if this is a peak or slump hour
      const isPeakHour = sortedPeakHours.includes(currentHour);
      const isSlumpHour = sortedSlumpHours.includes(currentHour);
      
      // Determine block type based on hour and previous blocks
      let blockType;
      let blockDuration;
      
      if (blockCount > 0 && blockCount % blocksBeforeLongBreak === 0) {
        // Time for a long break
        blockType = 'longBreak';
        blockDuration = longBreakDuration;
      } else if (isSlumpHour) {
        // Slump hour - use for breaks, administrative tasks, or shorter focus
        const options = ['break', 'admin', 'shortFocus'];
        blockType = options[Math.floor(Math.random() * options.length)];
        
        if (blockType === 'break') {
          blockDuration = type === 'flexible' ? 15 : 20;
        } else if (blockType === 'admin') {
          blockDuration = 30;
        } else {
          blockDuration = 20; // Short focus
        }
      } else if (isPeakHour) {
        // Peak hour - use for deep work
        blockType = 'deepWork';
        blockDuration = focusBlockDuration;
      } else {
        // Regular hour - alternate between focus and breaks
        if (blockCount % (type === 'focused' ? 3 : 2) === 0) {
          blockType = 'break';
          blockDuration = breakDuration;
        } else {
          blockType = 'focus';
          blockDuration = focusBlockDuration;
        }
      }
      
      // Calculate end time
      let endHour = currentHour;
      let endMinute = currentMinute + blockDuration;
      
      if (endMinute >= 60) {
        endHour += Math.floor(endMinute / 60);
        endMinute %= 60;
      }
      
      const endTime = `${endHour % 12 || 12}:${endMinute.toString().padStart(2, '0')} ${endHour >= 12 ? 'PM' : 'AM'}`;
      
      // Skip if we've gone past the end time
      if (endHour >= end) break;
      
      // Block description based on type
      let description;
      let icon;
      
      switch (blockType) {
        case 'deepWork':
          description = 'Deep Work / Focus';
          icon = BoltIcon;
          break;
        case 'focus':
          description = 'Focused Work';
          icon = ClockIcon;
          break;
        case 'shortFocus':
          description = 'Light Focus Work';
          icon = CogIcon;
          break;
        case 'break':
          description = 'Short Break';
          icon = SunIcon;
          break;
        case 'longBreak':
          description = 'Extended Break';
          icon = MoonIcon;
          break;
        case 'admin':
          description = 'Admin / Email';
          icon = DocumentDuplicateIcon;
          break;
        default:
          description = 'Work Block';
          icon = ClockIcon;
      }
      
      // Add block to schedule
      blocks.push({
        startTime,
        endTime,
        duration: blockDuration,
        type: blockType,
        description,
        icon
      });
      
      // Move to next block
      currentHour = endHour;
      currentMinute = endMinute;
      blockCount++;
    }
    
    return blocks;
  };
  
  // Generated schedule
  const schedule = useMemo(() => generateSchedule(), [scheduleType, productivityPatterns]);
  
  // Format schedule as text (for copying)
  const getScheduleText = () => {
    let text = `Optimal ${scheduleType.charAt(0).toUpperCase() + scheduleType.slice(1)} Schedule:\n\n`;
    
    schedule.forEach(block => {
      text += `${block.startTime} - ${block.endTime}: ${block.description}\n`;
    });
    
    text += '\nGenerated by Tempu Task';
    
    return text;
  };
  
  // Handle copying schedule to clipboard
  const copySchedule = () => {
    navigator.clipboard.writeText(getScheduleText())
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy schedule: ', err);
      });
  };
  
  // Get block style based on type
  const getBlockStyle = (type) => {
    switch (type) {
      case 'deepWork':
        return 'border-l-4 border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20';
      case 'focus':
        return 'border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20';
      case 'shortFocus':
        return 'border-l-4 border-sky-500 bg-sky-50 dark:bg-sky-900/20';
      case 'break':
        return 'border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20';
      case 'longBreak':
        return 'border-l-4 border-teal-500 bg-teal-50 dark:bg-teal-900/20';
      case 'admin':
        return 'border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-900/20';
      default:
        return 'border-l-4 border-gray-500 bg-gray-50 dark:bg-gray-800/50';
    }
  };
  
  // Get icon background class
  const getIconBgClass = (type) => {
    switch (type) {
      case 'deepWork':
        return 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400';
      case 'focus':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
      case 'shortFocus':
        return 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400';
      case 'break':
        return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
      case 'longBreak':
        return 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400';
      case 'admin':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
    }
  };
  
  // Get text color class
  const getTextColorClass = (type) => {
    switch (type) {
      case 'deepWork':
        return 'text-indigo-700 dark:text-indigo-300';
      case 'focus':
        return 'text-blue-700 dark:text-blue-300';
      case 'shortFocus':
        return 'text-sky-700 dark:text-sky-300';
      case 'break':
        return 'text-green-700 dark:text-green-300';
      case 'longBreak':
        return 'text-teal-700 dark:text-teal-300';
      case 'admin':
        return 'text-amber-700 dark:text-amber-300';
      default:
        return 'text-gray-700 dark:text-gray-300';
    }
  };
  
  // Get schedule description
  const getScheduleDescription = () => {
    switch (scheduleType) {
      case 'focused':
        return 'Optimized for deep work with longer focus blocks and adequate recovery periods.';
      case 'balanced':
        return 'Balanced mix of focus time and breaks for steady productivity throughout the day.';
      case 'flexible':
        return 'Shorter work intervals inspired by the Pomodoro Technique for flexibility and variety.';
      default:
        return 'Personalized schedule based on your productivity patterns.';
    }
  };
  
  return (
    <Card className="overflow-hidden" animate={true}>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2 text-indigo-500" />
            Optimal Schedule Generator
          </h2>
          
          <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
            <Button 
              size="sm"
              variant="outline"
              onClick={() => {
                setScheduleType(scheduleType);
                // Regenerate with same settings to get a fresh schedule
                generateSchedule(scheduleType);
              }}
            >
              <ArrowPathIcon className="h-4 w-4 mr-1" />
              Regenerate
            </Button>
            
            <Button 
              size="sm"
              variant={isCopied ? 'success' : 'outline'}
              onClick={copySchedule}
            >
              {isCopied ? (
                <>
                  <CheckIcon className="h-4 w-4 mr-1" />
                  Copied!
                </>
              ) : (
                <>
                  <DocumentDuplicateIcon className="h-4 w-4 mr-1" />
                  Copy Schedule
                </>
              )}
            </Button>
            
            <Button 
              size="sm"
              variant="outline"
              onClick={() => {
                // Would handle calendar export in real implementation
                alert('Schedule would be exported to your calendar');
              }}
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
        
        {/* Productivity pattern summary */}
        <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
          <h3 className="text-lg font-medium text-indigo-800 dark:text-indigo-300 mb-2 flex items-center">
            <BeakerIcon className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
            Your Productivity Pattern
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-white dark:bg-slate-800/70 p-3 rounded-lg">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Morning Productivity</p>
              <div className="flex items-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {productivityPatterns.morningScore}%
                </p>
                <div className={`ml-3 w-3 h-3 rounded-full ${
                  productivityPatterns.morningScore > 70 ? 'bg-green-500' :
                  productivityPatterns.morningScore > 50 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}></div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800/70 p-3 rounded-lg">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Afternoon Productivity</p>
              <div className="flex items-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {productivityPatterns.afternoonScore}%
                </p>
                <div className={`ml-3 w-3 h-3 rounded-full ${
                  productivityPatterns.afternoonScore > 70 ? 'bg-green-500' :
                  productivityPatterns.afternoonScore > 50 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}></div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800/70 p-3 rounded-lg">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Evening Productivity</p>
              <div className="flex items-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {productivityPatterns.eveningScore}%
                </p>
                <div className={`ml-3 w-3 h-3 rounded-full ${
                  productivityPatterns.eveningScore > 70 ? 'bg-green-500' :
                  productivityPatterns.eveningScore > 50 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}></div>
              </div>
            </div>
          </div>
          
          <div className="text-sm text-indigo-700 dark:text-indigo-400">
            <p>
              {productivityPatterns.morningScore > productivityPatterns.afternoonScore && 
               productivityPatterns.morningScore > productivityPatterns.eveningScore ?
                "You're a morning person! Schedule your most demanding work early in the day." :
               productivityPatterns.afternoonScore > productivityPatterns.morningScore && 
               productivityPatterns.afternoonScore > productivityPatterns.eveningScore ?
                "Your productivity peaks in the afternoon. Plan your critical tasks for mid-day." :
                "You perform better in the evening. Consider shifting important work to later hours when possible."
              }
            </p>
            
            <div className="mt-2 flex flex-wrap gap-2">
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">
                <BoltIcon className="h-3 w-3 mr-1" />
                Peak Hours: {productivityPatterns.peakHours.map(h => `${h % 12 || 12}${h >= 12 ? 'pm' : 'am'}`).join(', ')}
              </div>
              
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                <CogIcon className="h-3 w-3 mr-1" />
                Avg Session: {productivityPatterns.averageSessionLength} minutes
              </div>
            </div>
          </div>
        </div>
        
        {/* Schedule type selector */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div 
            className={`flex-1 p-4 rounded-lg cursor-pointer border transition-all ${
              scheduleType === 'focused' 
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700'
            }`}
            onClick={() => setScheduleType('focused')}
          >
            <div className="flex items-center mb-2">
              <div className={`w-5 h-5 rounded-full mr-2 flex items-center justify-center ${
                scheduleType === 'focused' 
                  ? 'bg-indigo-500 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}>
                {scheduleType === 'focused' && <CheckIcon className="h-3 w-3" />}
              </div>
              <h3 className="font-medium">Deep Focus</h3>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              90-minute deep work blocks with longer recovery periods.
            </p>
          </div>
          
          <div 
            className={`flex-1 p-4 rounded-lg cursor-pointer border transition-all ${
              scheduleType === 'balanced' 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
            }`}
            onClick={() => setScheduleType('balanced')}
          >
            <div className="flex items-center mb-2">
              <div className={`w-5 h-5 rounded-full mr-2 flex items-center justify-center ${
                scheduleType === 'balanced' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}>
                {scheduleType === 'balanced' && <CheckIcon className="h-3 w-3" />}
              </div>
              <h3 className="font-medium">Balanced</h3>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              50-60 minute focus blocks with regular breaks for sustained energy.
            </p>
          </div>
          
          <div 
            className={`flex-1 p-4 rounded-lg cursor-pointer border transition-all ${
              scheduleType === 'flexible' 
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700'
            }`}
            onClick={() => setScheduleType('flexible')}
          >
            <div className="flex items-center mb-2">
              <div className={`w-5 h-5 rounded-full mr-2 flex items-center justify-center ${
                scheduleType === 'flexible' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}>
                {scheduleType === 'flexible' && <CheckIcon className="h-3 w-3" />}
              </div>
              <h3 className="font-medium">Flexible</h3>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Pomodoro-style 25-minute sprints with frequent short breaks.
            </p>
          </div>
        </div>
        
        {/* Schedule description */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-medium text-blue-800 dark:text-blue-300">
            {scheduleType.charAt(0).toUpperCase() + scheduleType.slice(1)} Schedule
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
            {getScheduleDescription()}
          </p>
        </div>
        
        {/* Generated schedule */}
        <div className="mt-4 space-y-3">
          {schedule.map((block, index) => (
            <div 
              key={index}
              className={`p-3 rounded-lg ${getBlockStyle(block.type)}`}
            >
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${getIconBgClass(block.type)} mr-3`}>
                  <block.icon className="h-5 w-5" />
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <h4 className={`font-medium ${getTextColorClass(block.type)}`}>
                      {block.description}
                    </h4>
                    <span className="sm:ml-2 text-sm text-gray-600 dark:text-gray-400">
                      {block.duration} min
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {block.startTime} - {block.endTime}
                  </p>
                </div>
                
                {block.type === 'deepWork' && (
                  <div className="px-2 py-1 rounded text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                    Peak hour
                  </div>
                )}
              </div>
              
              {showDetails && index < schedule.length - 1 && (
                <div className="mt-3 pl-12 text-xs text-gray-500 dark:text-gray-400 italic">
                  {block.type === 'focus' || block.type === 'deepWork' ? 
                    "Remember to silence notifications and minimize interruptions." :
                   block.type === 'break' ? 
                    "Stand up, stretch, or get a drink of water." :
                   block.type === 'longBreak' ? 
                    "Take a proper break away from screens. Consider a short walk or meditation." :
                   block.type === 'admin' ?
                    "Good time to handle emails, Slack messages, and administrative tasks." :
                   block.type === 'shortFocus' ?
                    "Suitable for lighter focus work like planning or reviewing." : 
                    ""}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Toggle detail tips */}
        <button 
          className="mt-4 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium flex items-center mx-auto"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? 'Hide tips' : 'Show tips'}
        </button>
      </div>
    </Card>
  );
};

export default OptimalScheduleGenerator;