import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Create a single supabase client for interacting with your database
const createClient = () => {
  return createClientComponentClient();
};

// Database configuration
export const dbConfig = {
  supabase: createClient(),
};

// Utility functions for common database operations
export const db = {
  // Time entries
  timeEntries: {
    async create(data) {
      const { data: entry, error } = await dbConfig.supabase
        .from('time_entries')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return entry;
    },

    async getByUserId(userId, startDate, endDate) {
      const query = dbConfig.supabase
        .from('time_entries')
        .select(`
          *,
          projects(name, color)
        `)
        .eq('user_id', userId)
        .order('start_time', { ascending: false });

      if (startDate) {
        query.gte('start_time', startDate);
      }
      if (endDate) {
        query.lte('start_time', endDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },

    async getActive(userId) {
      const { data, error } = await dbConfig.supabase
        .from('time_entries')
        .select(`
          *,
          projects(name, color)
        `)
        .eq('user_id', userId)
        .is('end_time', null)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }
  },

  // Projects
  projects: {
    async getAll(userId) {
      const { data, error } = await dbConfig.supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },

    async create(data) {
      const { data: project, error } = await dbConfig.supabase
        .from('projects')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return project;
    }
  },

  // Companies
  companies: {
    async getAll(userId) {
      const { data, error } = await dbConfig.supabase
        .from('companies')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },

    async getProfile(companyId) {
      const { data, error } = await dbConfig.supabase
        .from('company_profiles')
        .select('*')
        .eq('company_id', companyId)
        .single();

      if (error) throw error;
      return data;
    }
  },

  // Activities
  activities: {
    async getAll(userId) {
      const { data, error } = await dbConfig.supabase
        .from('activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  }
};

export default db;