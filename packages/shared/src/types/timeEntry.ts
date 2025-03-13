export interface TimeEntry {
    id: string;
    user_id: string;
    project_id?: string;
    category: string;
    description?: string;
    start_time: string;
    end_time?: string;
    duration?: number; // in seconds
    created_at: string;
  }
  
  export interface TimeEntrySummary {
    user_id: string;
    date: string;
    category: string;
    total_duration: number;
    entry_count: number;
  }
  
  export interface TimeEntryCreateInput {
    project_id?: string;
    category: string;
    description?: string;
    start_time: string;
    end_time?: string;
  }
  
  export interface TimeEntryUpdateInput {
    project_id?: string;
    category?: string;
    description?: string;
    start_time?: string;
    end_time?: string;
  }