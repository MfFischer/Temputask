// packages/frontend/src/components/focus/CustomTimerInput.js
import React, { useState } from 'react';

export default function CustomTimerInput({ isActive, onSelectCustomTime }) {
  const [isOpen, setIsOpen] = useState(false);
  const [customValue, setCustomValue] = useState('');
  
  const handleToggle = () => {
    if (isActive) return; // Disabled during active timer
    setIsOpen(prev => !prev);
  };
  
  const handleInputChange = (e) => {
    // Only allow numbers
    const value = e.target.value.replace(/[^0-9]/g, '');
    setCustomValue(value);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const customMinutes = parseInt(customValue, 10);
    if (!isNaN(customMinutes) && customMinutes > 0) {
      onSelectCustomTime(customMinutes);
      setCustomValue('');
      setIsOpen(false);
    }
  };
  
  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className={`
          px-3 py-1 rounded-full text-sm font-medium transition-all duration-200
          ${isOpen
            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 font-semibold'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600'
          }
          ${isActive ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        disabled={isActive}
      >
        Custom
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-800 rounded-md shadow-lg p-2 z-10 w-40">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <input
              type="text"
              value={customValue}
              onChange={handleInputChange}
              placeholder="Minutes"
              className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-slate-700 dark:text-gray-200"
              autoFocus
            />
            <button
              type="submit"
              className="px-2 py-1 text-xs bg-indigo-500 text-white rounded hover:bg-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-700"
              disabled={!customValue}
            >
              Set
            </button>
          </form>
        </div>
      )}
    </div>
  );
}