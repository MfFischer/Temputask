import { Pool } from 'pg';
import type { QueryResult } from 'pg';

// Only initialize the pool on the server side
let pool: Pool | null = null;

// Create the pool only in a Node.js environment
if (typeof window === 'undefined' && process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false
    } : undefined
  });
}

export const db = {
  query: async (text: string, params?: any[]): Promise<QueryResult> => {
    if (!pool) {
      throw new Error('Database connection not initialized');
    }
    return pool.query(text, params);
  }
};