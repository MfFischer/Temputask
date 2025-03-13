-- Enable UUID extension for generating IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP WITH TIME ZONE,
  settings JSONB DEFAULT '{}'::jsonb
);

-- Enable Row Level Security for users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Projects Table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security for projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Time Entries Table
CREATE TABLE public.time_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER, -- in seconds, calculated on insert/update
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add to packages/backend/schema.sql
CREATE TABLE public.site_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  domain TEXT NOT NULL,
  duration INTEGER NOT NULL, -- in seconds
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security for time entries
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies to restrict access to user's own data
CREATE POLICY "Users can only access their own data" 
  ON public.users FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can only access their own projects" 
  ON public.projects FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own time entries" 
  ON public.time_entries FOR ALL USING (auth.uid() = user_id);

-- Create function to calculate duration automatically
CREATE OR REPLACE FUNCTION calculate_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.end_time IS NOT NULL THEN
    NEW.duration := EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time))::INTEGER;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to calculate duration on insert/update
CREATE TRIGGER set_duration
BEFORE INSERT OR UPDATE ON public.time_entries
FOR EACH ROW
EXECUTE FUNCTION calculate_duration();

-- Create a view for daily summaries (for insights)
CREATE OR REPLACE VIEW public.daily_summaries AS
SELECT 
  user_id,
  DATE(start_time AT TIME ZONE 'UTC') as date,
  category,
  SUM(duration) as total_duration,
  COUNT(*) as entry_count
FROM public.time_entries
WHERE end_time IS NOT NULL
GROUP BY user_id, DATE(start_time AT TIME ZONE 'UTC'), category;

-- Create a function to get the peak productivity hour
CREATE OR REPLACE FUNCTION get_peak_hour(user_uuid UUID, target_date DATE)
RETURNS TABLE (
  hour INTEGER,
  duration BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    EXTRACT(HOUR FROM start_time AT TIME ZONE 'UTC')::INTEGER as hour,
    SUM(duration) as total_duration
  FROM public.time_entries
  WHERE 
    user_id = user_uuid AND
    DATE(start_time AT TIME ZONE 'UTC') = target_date AND
    category != 'Distraction' AND
    duration IS NOT NULL
  GROUP BY hour
  ORDER BY total_duration DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;