import React, { useState } from 'react';
import Button from '../common/Button';

const DateRangePicker = ({ dateRange, setDateRange, customDateRange, setCustomDateRange }) => {
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  
  // Get date string for input fields
  const formatDateForInput = (date) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };
  
  // Get formatted date range description
  const getDateRangeDescription = () => {
    const now = new Date();
    
    switch (dateRange) {
      case 'today':
        return `Today (${now.toLocaleDateString()})`;
      case 'yesterday': {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        return `Yesterday (${yesterday.toLocaleDateString()})`;
      }
      case 'week': {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return `This Week (${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()})`;
      }
      case 'last-week': {
        const lastWeekStart = new Date(now);
        lastWeekStart.setDate(now.getDate() - now.getDay() - 7);
        const lastWeekEnd = new Date(lastWeekStart);
        lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
        return `Last Week (${lastWeekStart.toLocaleDateString()} - ${lastWeekEnd.toLocaleDateString()})`;
      }
      case 'month': {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return `This Month (${monthStart.toLocaleDateString()} - ${monthEnd.toLocaleDateString()})`;
      }
      case 'last-month': {
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        return `Last Month (${lastMonthStart.toLocaleDateString()} - ${lastMonthEnd.toLocaleDateString()})`;
      }
      case 'quarter': {
        const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        const quarterEnd = new Date(quarterStart.getFullYear(), quarterStart.getMonth() + 3, 0);
        return `This Quarter (${quarterStart.toLocaleDateString()} - ${quarterEnd.toLocaleDateString()})`;
      }
      case 'year': {
        const yearStart = new Date(now.getFullYear(), 0, 1);
        const yearEnd = new Date(now.getFullYear(), 11, 31);
        return `This Year (${yearStart.toLocaleDateString()} - ${yearEnd.toLocaleDateString()})`;
      }
      case 'custom':
        if (customDateRange.start && customDateRange.end) {
          return `Custom (${new Date(customDateRange.start).toLocaleDateString()} - ${new Date(customDateRange.end).toLocaleDateString()})`;
        }
        return 'Custom Range';
      default:
        return 'Select Date Range';
    }
  };

  const handleCustomDateChange = (e) => {
    const { name, value } = e.target;
    setCustomDateRange({
      ...customDateRange,
      [name]: value
    });
  };

  const applyCustomRange = () => {
    if (customDateRange.start && customDateRange.end) {
      setDateRange('custom');
      setShowCustomPicker(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-2">
        <Button 
          variant={dateRange === 'today' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setDateRange('today')}
        >
          Today
        </Button>
        <Button 
          variant={dateRange === 'yesterday' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setDateRange('yesterday')}
        >
          Yesterday
        </Button>
        <Button 
          variant={dateRange === 'week' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setDateRange('week')}
        >
          This Week
        </Button>
        <Button 
          variant={dateRange === 'last-week' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setDateRange('last-week')}
        >
          Last Week
        </Button>
        <Button 
          variant={dateRange === 'month' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setDateRange('month')}
        >
          This Month
        </Button>
        <Button 
          variant={dateRange === 'quarter' ? 'primary' : 'outline'} 
          size="sm"
          onClick={() => setDateRange('quarter')}
        >
          Quarter
        </Button>
        <Button 
          variant={dateRange === 'custom' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setShowCustomPicker(!showCustomPicker)}
        >
          Custom
        </Button>
      </div>
      
      {showCustomPicker && (
        <div className="absolute z-10 mt-2 p-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
          <div className="flex gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                name="start"
                value={customDateRange.start || ''}
                onChange={handleCustomDateChange}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Date
              </label>
              <input
                type="date"
                name="end"
                value={customDateRange.end || ''}
                onChange={handleCustomDateChange}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
                min={customDateRange.start || ''}
              />
            </div>
            <Button 
              onClick={applyCustomRange}
              disabled={!customDateRange.start || !customDateRange.end}
              size="sm"
            >
              Apply
            </Button>
          </div>
        </div>
      )}
      
      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        {getDateRangeDescription()}
      </div>
    </div>
  );
};

export default DateRangePicker;