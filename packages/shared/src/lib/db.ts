import { Pool, PoolConfig } from 'pg';
import type { QueryResult } from 'pg';

// Only initialize the pool on the server side
let pool: Pool | null = null;

// Create the pool only in a Node.js environment
if (typeof window === 'undefined' && process.env.DATABASE_URL) {
  // Create explicit Pool config to disable native
  const poolConfig: PoolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false
    } : undefined
  };

  // Initialize the pool with the config
  pool = new Pool(poolConfig);

  // Explicitly disable native client
  // @ts-ignore - This is a valid property but TypeScript doesn't know about it
  pool.options.native = false;
}

export const db = {
  query: async (text: string, params?: any[]): Promise<QueryResult> => {
    if (!pool) {
      if (typeof window !== 'undefined') {
        console.warn('Database connection not initialized in browser environment');
        return { rows: [], command: '', rowCount: 0, oid: 0, fields: [] } as QueryResult;
      }
      throw new Error('Database connection not initialized');
    }
    return pool.query(text, params);
  }
};