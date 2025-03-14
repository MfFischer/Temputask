// packages/shared/src/lib/db-browser.ts
import type { QueryResult } from 'pg';

// This is a replacement for the real db.ts module when in browser context
// It returns mock data or makes calls to an external API instead

// Mock implementation that matches the interface of the server-side module
export const db = {
  query: async (text: string, params?: any[]): Promise<QueryResult> => {
    console.warn('Database queries are not available in the browser. Text:', text);
    
    // Return an empty result that matches the QueryResult structure
    return {
      rows: [],
      command: '',
      rowCount: 0,
      oid: 0,
      fields: []
    };
  }
};

// You could add specific mock implementations for common queries
// For example:
export const getMockProjects = (): any[] => {
  return [
    { id: '1', name: 'Website Redesign', companyId: '1' },
    { id: '2', name: 'Mobile App', companyId: '2' }
  ];
};

export const getMockCompanies = (): any[] => {
  return [
    { id: '1', name: 'Acme Corp' },
    { id: '2', name: 'Globex' }
  ];
};

// You could enhance the db.query method to return mock data based on the query text
// For more complex applications