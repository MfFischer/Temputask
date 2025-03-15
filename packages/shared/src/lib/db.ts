// In your shared/src/lib/db.ts file
import { Pool, PoolConfig } from 'pg';
import type { QueryResult } from 'pg';

// Disable pg-native explicitly
process.env.NODE_PG_FORCE_NATIVE = '0';

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

export { pool }; // Add this export to make pool available