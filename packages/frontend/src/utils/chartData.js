/**
 * Generate data for a time distribution pie chart
 * @param {Object} summary - Summary data with categories
 * @returns {Object} - Data for Chart.js pie chart
 */
export function generatePieChartData(summary) {
    if (!summary || !summary.categories) {
      return {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: [],
        }],
      };
    }
    
    // Predefined colors for common categories
    const categoryColors = {
      Coding: '#3B82F6',   // blue
      Meeting: '#10B981',  // green
      Research: '#8B5CF6', // purple
      Writing: '#F59E0B',  // amber
      Email: '#EC4899',    // pink
      Distraction: '#EF4444', // red
      Other: '#6B7280',    // gray
    };
    
    // Get categories and values
    const categories = Object.keys(summary.categories);
    const values = Object.values(summary.categories);
    
    // Generate background colors
    const backgroundColor = categories.map(
      category => categoryColors[category] || categoryColors.Other
    );
    
    return {
      labels: categories,
      datasets: [{
        data: values,
        backgroundColor,
        borderWidth: 1,
      }],
    };
  }
  
  /**
   * Generate data for a bar chart showing productivity by day
   * @param {Array} entries - Time entries data
   * @param {number} [days=7] - Number of days to include
   * @returns {Object} - Data for Chart.js bar chart
   */
  export function generateProductivityBarChart(entries, days = 7) {
    // Generate date labels for the last n days
    const dateLabels = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      dateLabels.push(formatDate(date, 'short'));
    }
    
    // Initialize data arrays
    const productiveData = Array(days).fill(0);
    const distractedData = Array(days).fill(0);
    
    // Process entries
    entries.forEach(entry => {
      if (!entry.duration) return;
      
      const entryDate = new Date(entry.start_time);
      const dayIndex = days - 1 - Math.floor((now - entryDate) / (1000 * 60 * 60 * 24));
      
      // Skip entries older than our range
      if (dayIndex < 0 || dayIndex >= days) return;
      
      // Add to appropriate category
      if (entry.category === 'Distraction') {
        distractedData[dayIndex] += entry.duration / 3600; // Convert to hours
      } else {
        productiveData[dayIndex] += entry.duration / 3600; // Convert to hours
      }
    });
    
    return {
      labels: dateLabels,
      datasets: [
        {
          label: 'Productive (hours)',
          data: productiveData.map(val => Math.round(val * 10) / 10), // Round to 1 decimal
          backgroundColor: '#10B981', // green
        },
        {
          label: 'Distracted (hours)',
          data: distractedData.map(val => Math.round(val * 10) / 10), // Round to 1 decimal
          backgroundColor: '#EF4444', // red
        },
      ],
    };
  }