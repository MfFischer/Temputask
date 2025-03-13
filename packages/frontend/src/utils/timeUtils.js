/**
 * Format seconds into a human-readable time string (HH:MM:SS)
 * @param {number} seconds - Total seconds
 * @returns {string} - Formatted time string
 */
export function formatTimeString(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0'),
    ].join(':');
  }
  
  /**
   * Calculate elapsed time between a start date and now (or an end date)
   * @param {Date|string} startDate - Start date/time
   * @param {Date|string} [endDate=null] - End date/time (defaults to now)
   * @returns {number} - Elapsed time in seconds
   */
  export function calculateElapsedTime(startDate, endDate = null) {
    const start = new Date(startDate).getTime();
    const end = endDate ? new Date(endDate).getTime() : Date.now();
    
    return Math.floor((end - start) / 1000);
  }
  
  /**
   * Format a date to display in a localized format
   * @param {Date|string} date - Date to format
   * @param {string} [format='medium'] - Format type (short, medium, long, full)
   * @returns {string} - Formatted date string
   */
  export function formatDate(date, format = 'medium') {
    if (!date) return '';
    
    const dateObj = new Date(date);
    
    const options = {
      short: { month: 'numeric', day: 'numeric' },
      medium: { month: 'short', day: 'numeric', year: 'numeric' },
      long: { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' },
      full: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
      time: { hour: 'numeric', minute: 'numeric' },
      datetime: { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' },
    };
    
    return new Intl.DateTimeFormat('en-US', options[format]).format(dateObj);
  }
  
  /**
   * Get start and end of a date range
   * @param {string} range - Range type ('today', 'week', 'month', 'year')
   * @returns {Object} - Start and end dates as ISO strings
   */
  export function getDateRange(range) {
    const now = new Date();
    let start = new Date(now);
    let end = new Date(now);
    
    switch (range) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'week':
        // Start of week (Sunday)
        const dayOfWeek = now.getDay();
        start.setDate(now.getDate() - dayOfWeek);
        start.setHours(0, 0, 0, 0);
        // End of week (Saturday)
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        break;
      case 'month':
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(now.getMonth() + 1);
        end.setDate(0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'year':
        start.setMonth(0, 1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(11, 31);
        end.setHours(23, 59, 59, 999);
        break;
      default:
        // Default to today
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
    }
    
    return {
      start: start.toISOString(),
      end: end.toISOString(),
    };
  }
  