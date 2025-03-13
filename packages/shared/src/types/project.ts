export interface Project {
    id: string;
    user_id: string;
    name: string;
    description?: string;
    color: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface ProjectSummary extends Project {
    total_time?: number;  // Total seconds spent on this project
    todays_time?: number; // Seconds spent today
    entry_count?: number; // Number of time entries
  }
  
  export interface ProjectCreateInput {
    name: string;
    description?: string;
    color: string;
  }
  
  export interface ProjectUpdateInput {
    name?: string;
    description?: string;
    color?: string;
  }