-- SQL commands to fix permission issues for the public schema
-- Run these commands as a superuser (postgres) or a user with sufficient privileges

-- Reset permissions (if needed)
-- REVOKE ALL ON SCHEMA public FROM PUBLIC;

-- Grant schema usage
GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

-- Grant schema create privileges
GRANT CREATE ON SCHEMA public TO postgres;
GRANT CREATE ON SCHEMA public TO service_role;

-- Grant permissions on all tables in the public schema
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Grant permissions on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Make sure the profiles table exists
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Make sure the events table exists
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

-- Specifically grant permissions on the events table
GRANT ALL PRIVILEGES ON TABLE events TO postgres;
GRANT ALL PRIVILEGES ON TABLE events TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE events TO authenticated;
GRANT SELECT ON TABLE events TO anon;

-- Grant permissions on the profiles table
GRANT ALL PRIVILEGES ON TABLE profiles TO postgres;
GRANT ALL PRIVILEGES ON TABLE profiles TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE profiles TO authenticated;
GRANT SELECT ON TABLE profiles TO anon;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL ON TABLES TO postgres;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL ON TABLES TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT ON TABLES TO anon;

-- Set default privileges for sequences
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL ON SEQUENCES TO postgres, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT USAGE, SELECT ON SEQUENCES TO authenticated, anon;

-- Drop the existing trigger if it exists
DROP TRIGGER IF EXISTS create_event_attendance_table_trigger ON events;

-- Create or replace the function with SECURITY DEFINER
CREATE OR REPLACE FUNCTION create_event_attendance_table()
RETURNS TRIGGER AS $$
DECLARE
  table_name TEXT;
  sanitized_title TEXT;
BEGIN
  -- Sanitize event title to create a valid table name
  sanitized_title := regexp_replace(lower(NEW.title), '[^a-z0-9]', '_', 'g');
  
  -- Ensure sanitized title is not empty
  IF length(sanitized_title) = 0 THEN
    sanitized_title := 'event';
  END IF;
  
  -- Generate unique table name
  table_name := 'event_' || sanitized_title || '_' || NEW.id;
  
  -- Create the attendance table
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      event_id UUID NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      check_in_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      CONSTRAINT %I FOREIGN KEY (event_id) REFERENCES events(id)
    )', table_name, 'fk_' || table_name || '_event_id');
    
  -- Grant permissions on the new table
  EXECUTE format('
    GRANT ALL PRIVILEGES ON TABLE %I TO postgres;
    GRANT ALL PRIVILEGES ON TABLE %I TO service_role;
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE %I TO authenticated;
    GRANT SELECT ON TABLE %I TO anon;
  ', table_name, table_name, table_name, table_name);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-add the trigger
CREATE TRIGGER create_event_attendance_table_trigger
AFTER INSERT ON events
FOR EACH ROW
EXECUTE FUNCTION create_event_attendance_table();

-- Enable RLS on the events table 
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Events are viewable by everyone" ON events;
DROP POLICY IF EXISTS "Users can insert their own events" ON events;
DROP POLICY IF EXISTS "Users can update their own events" ON events;
DROP POLICY IF EXISTS "Users can delete their own events" ON events;

-- Create more permissive policies for testing
CREATE POLICY "Events are viewable by everyone" 
ON events FOR SELECT 
USING (true);

-- Allow any authenticated user to insert events (for testing)
CREATE POLICY "Users can insert events" 
ON events FOR INSERT 
WITH CHECK (true);

-- Allow any authenticated user to update events (for testing)
CREATE POLICY "Users can update events" 
ON events FOR UPDATE 
USING (true);

-- Allow any authenticated user to delete events (for testing)
CREATE POLICY "Users can delete events" 
ON events FOR DELETE 
USING (true);

-- IMPORTANT: After testing, you should replace the above policies with these:
-- CREATE POLICY "Users can insert their own events" ON events FOR INSERT WITH CHECK (auth.uid() = created_by);
-- CREATE POLICY "Users can update their own events" ON events FOR UPDATE USING (auth.uid() = created_by);
-- CREATE POLICY "Users can delete their own events" ON events FOR DELETE USING (auth.uid() = created_by); 