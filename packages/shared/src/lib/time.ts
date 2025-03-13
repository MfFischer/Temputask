// packages/shared/src/lib/time.ts

/**
 * Format seconds into a human-readable duration string
 * @param seconds - Duration in seconds
 * @returns Formatted string (e.g., "2h 30m")
 */
export function formatDuration(seconds: number): string {
    if (!seconds || seconds < 0) return '0m';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours === 0) {
      return `${minutes}m`;
    } else if (minutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${minutes}m`;
    }
  }
  
  /**
   * Get the start of the day in ISO format
   * @param date - Date to get start of day for (defaults to today)
   * @returns ISO string for start of day
   */
  export function getStartOfDay(date = new Date()): string {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    return startOfDay.toISOString();
  }
  
  /**
   * Get the end of the day in ISO format
   * @param date - Date to get end of day for (defaults to today)
   * @returns ISO string for end of day
   */
  export function getEndOfDay(date = new Date()): string {
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    return endOfDay.toISOString();
  }
  
  /**
   * Check if a date is today
   * @param dateString - ISO date string to check
   * @returns Boolean indicating if date is today
   */
  export function isToday(dateString: string): boolean {
    const date = new Date(dateString);
    const today = new Date();
    
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }