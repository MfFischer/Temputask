// Use the correct import path for jsPDF version 2.5.1
import { jsPDF } from 'jspdf';
// Import autotable separately
import autoTable from 'jspdf-autotable';

// Use dynamic imports for jsPDF to fix the Next.js compatibility issue
/**
 * Generates a client-friendly billable hours report as PDF
 */
export const generateBillableReport = async (
  timeEntries,
  filters = {},
  options = {},
  companyInfo = {}
) => {
  try {
    console.log('Starting PDF generation with', timeEntries?.length, 'entries');
    
    // Dynamically import jsPDF and jspdf-autotable to avoid build issues
    const jsPDFModule = await import('jspdf');
    const autoTableModule = await import('jspdf-autotable');
    
    // Get the constructors/functions from the imports
    const jsPDF = jsPDFModule.default || jsPDFModule.jsPDF;
    const autoTable = autoTableModule.default;
    
    console.log('PDF libraries loaded successfully');
    
    // Create new PDF document
    const doc = new jsPDF({
      orientation: options.orientation || 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    
    // Set document properties
    doc.setProperties({
      title: `Billable Hours Report - ${new Date().toLocaleDateString()}`,
      subject: 'Time Tracking Report',
      author: companyInfo.name || 'Tempu Task',
      creator: 'Tempu Task'
    });
    
    // Filter entries by billable status, client, project, etc.
    const filteredEntries = timeEntries.filter(entry => {
      // Only include billable entries for client reports unless specified
      if (filters.includeBillableOnly !== false && !entry.billable) {
        return false;
      }
      
      // Filter by project if specified
      if (filters.projectId && entry.project_id !== filters.projectId) {
        return false;
      }
      
      // Filter by company/client if specified
      if (filters.companyId && 
          (!entry.projects || entry.projects.company_id !== filters.companyId)) {
        return false;
      }
      
      // Filter by date range
      if (filters.startDate && new Date(entry.start_time) < new Date(filters.startDate)) {
        return false;
      }
      
      if (filters.endDate && new Date(entry.end_time) > new Date(filters.endDate)) {
        return false;
      }
      
      return true;
    });
    
    console.log('Filtered to', filteredEntries.length, 'entries');
    
    // Calculate totals
    const totalHours = filteredEntries.reduce((total, entry) => 
      total + (entry.duration || 0) / 3600, 0);
    
    const totalBillableAmount = filteredEntries.reduce((total, entry) => {
      const rate = entry.hourly_rate || 
                  (entry.activities && entry.activities.hourly_rate) || 
                  (entry.projects && entry.projects.default_hourly_rate) || 0;
      return total + (rate * (entry.duration / 3600));
    }, 0);
    
    // Add header with logo if available
    if (companyInfo.logo) {
      doc.addImage(companyInfo.logo, 'PNG', 10, 10, 40, 20);
      doc.setFontSize(10);
      doc.text(companyInfo.name || 'Your Company', 170, 15, { align: 'right' });
      doc.text(companyInfo.address || '', 170, 20, { align: 'right' });
      doc.text(companyInfo.email || '', 170, 25, { align: 'right' });
    } else {
      // Simple text header
      doc.setFontSize(20);
      doc.text('Billable Hours Report', 105, 15, { align: 'center' });
      doc.setFontSize(10);
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, 105, 22, { align: 'center' });
    }
    
    // Add client info if available
    if (filters.companyId && filters.companyInfo) {
      doc.setFontSize(11);
      doc.text('Client:', 14, 40);
      doc.setFontSize(12);
      doc.text(filters.companyInfo.name, 35, 40);
      if (filters.companyInfo.contact) {
        doc.setFontSize(10);
        doc.text(`Contact: ${filters.companyInfo.contact}`, 35, 46);
      }
    }
    
    // Add date range
    doc.setFontSize(11);
    doc.text('Period:', 14, 55);
    doc.setFontSize(10);
    const dateRangeText = filters.startDate && filters.endDate 
      ? `${new Date(filters.startDate).toLocaleDateString()} - ${new Date(filters.endDate).toLocaleDateString()}`
      : 'All time';
    doc.text(dateRangeText, 35, 55);
    
    // Add summary section
    doc.setFillColor(240, 240, 240);
    doc.rect(14, 65, 182, 25, 'F');
    doc.setFontSize(12);
    doc.text('Summary', 20, 75);
    
    doc.setFontSize(10);
    doc.text('Total Hours:', 20, 83);
    doc.text(totalHours.toFixed(2), 60, 83);
    
    doc.text('Total Billable Amount:', 100, 83);
    doc.text(
      `${options.currency || '$'}${totalBillableAmount.toFixed(2)}`, 
      160, 83
    );
    
    // Prepare data for the table
    const tableColumn = [
      'Date', 
      'Project', 
      options.includeActivities !== false ? 'Activity' : null, 
      'Description', 
      'Duration', 
      'Rate', 
      'Amount'
    ].filter(Boolean);
    
    const tableRows = filteredEntries.map(entry => {
      const date = new Date(entry.start_time).toLocaleDateString();
      const projectName = entry.projects ? entry.projects.name : 'Unknown Project';
      const activityName = entry.activities ? entry.activities.name : 'General';
      
      // Use the most specific rate available
      const rate = entry.hourly_rate || 
                  (entry.activities && entry.activities.hourly_rate) || 
                  (entry.projects && entry.projects.default_hourly_rate) || 0;
                  
      const duration = entry.duration / 3600; // Convert seconds to hours
      const amount = rate * duration;
      
      const description = entry.description || '';
      
      const row = [
        date,
        projectName,
        options.includeActivities !== false ? activityName : null,
        description.substring(0, 30) + (description.length > 30 ? '...' : ''),
        duration.toFixed(2) + ' hrs',
        `${options.currency || '$'}${rate.toFixed(2)}`,
        `${options.currency || '$'}${amount.toFixed(2)}`
      ].filter(Boolean);
      
      return row;
    });
    
    console.log('Adding table with', tableRows.length, 'rows');
    
    // Add the table
    try {
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 100,
        theme: 'grid',
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [66, 66, 155],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        columnStyles: {
          0: { cellWidth: 25 }, // Date
          4: { halign: 'right' }, // Duration
          5: { halign: 'right' }, // Rate
          6: { halign: 'right' }, // Amount
        },
        didDrawPage: function(data) {
          // Add page number at the bottom
          const pageCount = doc.internal.getNumberOfPages();
          doc.setFontSize(8);
          doc.text(
            `Page ${data.pageNumber} of ${pageCount}`, 
            data.settings.margin.left, 
            doc.internal.pageSize.height - 10
          );
          
          // Add footer with terms
          if (options.includeTerms !== false && options.terms) {
            doc.setFontSize(8);
            doc.text(
              options.terms,
              105,
              doc.internal.pageSize.height - 20,
              { align: 'center', maxWidth: 170 }
            );
          }
        },
        margin: { top: 10 }
      });
      
      console.log('Table added successfully');
    } catch (tableError) {
      console.error('Error adding table:', tableError);
      throw new Error(`Error adding table to PDF: ${tableError.message}`);
    }
    
    // Add terms and conditions if not in the table footer
    if (options.includeTerms !== false && options.terms && options.termsLocation !== 'footer') {
      const finalY = (doc.lastAutoTable && doc.lastAutoTable.finalY) || 150;
      
      if (finalY + 50 > doc.internal.pageSize.height - 20) {
        // Add a new page if there's not enough space
        doc.addPage();
        doc.setFontSize(12);
        doc.text('Terms and Conditions', 14, 20);
        doc.setFontSize(10);
        doc.text(options.terms, 14, 30, { maxWidth: 180 });
      } else {
        doc.setFontSize(12);
        doc.text('Terms and Conditions', 14, finalY + 20);
        doc.setFontSize(10);
        doc.text(options.terms, 14, finalY + 30, { maxWidth: 180 });
      }
    }
    
    console.log('Finalizing PDF');
    
    // Return the PDF as a blob
    const pdfBlob = doc.output('blob');
    console.log('PDF generated successfully');
    return pdfBlob;
  } catch (error) {
    console.error('Error generating billable report:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    throw error; // Re-throw to be handled by the calling function
  }
};

/**
 * Generates a CSV export of billable time entries
 */
export const generateBillableCSV = (
  timeEntries,
  filters = {},
  options = {}
) => {
  try {
    // Filter entries
    const filteredEntries = timeEntries.filter(entry => {
      // Only include billable entries for client reports unless specified
      if (filters.includeBillableOnly !== false && !entry.billable) {
        return false;
      }
      
      // Filter by project if specified
      if (filters.projectId && entry.project_id !== filters.projectId) {
        return false;
      }
      
      // Filter by company/client if specified
      if (filters.companyId && 
          (!entry.projects || entry.projects.company_id !== filters.companyId)) {
        return false;
      }
      
      // Filter by date range
      if (filters.startDate && new Date(entry.start_time) < new Date(filters.startDate)) {
        return false;
      }
      
      if (filters.endDate && new Date(entry.end_time) > new Date(filters.endDate)) {
        return false;
      }
      
      return true;
    });
    
    // Prepare CSV headers
    const headers = [
      'Date',
      'Project',
      options.includeActivities !== false ? 'Activity' : null,
      'Description',
      'Start Time',
      'End Time',
      'Duration (hrs)',
      'Rate',
      'Amount'
    ].filter(Boolean).join(',');
    
    // Prepare CSV rows
    const rows = filteredEntries.map(entry => {
      const date = new Date(entry.start_time).toLocaleDateString();
      const projectName = entry.projects ? entry.projects.name.replace(/,/g, ' ') : 'Unknown Project';
      const activityName = entry.activities ? entry.activities.name.replace(/,/g, ' ') : 'General';
      
      // Use the most specific rate available
      const rate = entry.hourly_rate || 
                  (entry.activities && entry.activities.hourly_rate) || 
                  (entry.projects && entry.projects.default_hourly_rate) || 0;
                  
      const duration = entry.duration / 3600; // Convert seconds to hours
      const amount = rate * duration;
      
      // Format times
      const startTime = new Date(entry.start_time).toLocaleTimeString();
      const endTime = new Date(entry.end_time).toLocaleTimeString();
      
      // Escape quotes in the description
      const description = (entry.description || '').replace(/"/g, '""');
      
      const rowData = [
        date,
        `"${projectName}"`,
        options.includeActivities !== false ? `"${activityName}"` : null,
        `"${description}"`,
        startTime,
        endTime,
        duration.toFixed(2),
        rate.toFixed(2),
        amount.toFixed(2)
      ].filter(Boolean);
      
      return rowData.join(',');
    });
    
    // Combine headers and rows
    const csvContent = [headers, ...rows].join('\n');
    
    // Return as blob
    const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    return csvBlob;
  } catch (error) {
    console.error('Error generating CSV:', error);
    throw error;
  }
};