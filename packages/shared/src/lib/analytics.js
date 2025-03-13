
/**
 * Identify times of day when distractions commonly occur
 * @param {Array} timeEntries - Array of time entries
 * @returns {Array} Array of time periods with distraction likelihood
 */
export function identifyDistractionPatterns(timeEntries) {
    const distractionHours = Array(24).fill(0);
    const hourCounts = Array(24).fill(0);
    
    // Count distraction occurrences by hour
    timeEntries.forEach(entry => {
      if (entry.category === 'Distraction' && entry.start_time) {
        const hour = new Date(entry.start_time).getHours();
        distractionHours[hour]++;
      }
      
      // Count all entries by hour
      if (entry.start_time) {
        const hour = new Date(entry.start_time).getHours();
        hourCounts[hour]++;
      }
    });
    
    // Calculate distraction likelihood by hour
    const patterns = distractionHours.map((count, hour) => {
      const totalEntries = hourCounts[hour];
      const likelihood = totalEntries > 0 ? (count / totalEntries) : 0;
      
      return {
        hour,
        likelihood,
        formattedHour: formatHour(hour),
      };
    });
    
    // Return top distraction hours (likelihood > 0.3)
    return patterns
      .filter(p => p.likelihood > 0.3)
      .sort((a, b) => b.likelihood - a.likelihood);
  }
  
  /**
   * Generate recommendations based on distraction patterns
   * @param {Array} patterns - Array of distraction patterns
   * @returns {Array} Array of recommendation objects
   */
  export function generateRecommendations(patterns) {
    return patterns.map(pattern => {
      let recommendation = '';
      
      if (pattern.likelihood > 0.7) {
        recommendation = `Consider blocking distracting sites between ${pattern.formattedHour}`;
      } else if (pattern.likelihood > 0.5) {
        recommendation = `Try scheduling focused work outside of ${pattern.formattedHour}`;
      } else {
        recommendation = `Be mindful of potential distractions around ${pattern.formattedHour}`;
      }
      
      return {
        hour: pattern.hour,
        likelihood: pattern.likelihood,
        recommendation
      };
    });
  }
  
  /**
   * Format hour to human-readable time
   * @param {number} hour - Hour (0-23)
   * @returns {string} Formatted time (e.g., "2:00 PM")
   */
  function formatHour(hour) {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:00 ${ampm}`;
  }