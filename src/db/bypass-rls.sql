-- SQL script to temporarily disable RLS for debugging purposes
-- WARNING: This reduces security but helps with debugging permission issues
-- Only use this in development, never in production!

-- Disable RLS on the events table
ALTER TABLE events DISABLE ROW LEVEL SECURITY;

-- Create a basic events table that's not affected by RLS
CREATE TABLE IF NOT EXISTS public_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID
);

-- Grant all privileges to all roles on this table
GRANT ALL PRIVILEGES ON TABLE public_events TO postgres;
GRANT ALL PRIVILEGES ON TABLE public_events TO service_role;
GRANT ALL PRIVILEGES ON TABLE public_events TO authenticated;
GRANT ALL PRIVILEGES ON TABLE public_events TO anon;

-- Grant usage on the sequence
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Fix the auth.uid() issue in policies
-- Create a helper function that returns null if auth.uid() fails
CREATE OR REPLACE FUNCTION safe_uid() 
RETURNS UUID AS $$
BEGIN
  BEGIN
    RETURN auth.uid();
  EXCEPTION
    WHEN OTHERS THEN
      RETURN NULL;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-enable RLS but with safer policies
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Events are viewable by everyone" ON events;
DROP POLICY IF EXISTS "Users can insert events" ON events;
DROP POLICY IF EXISTS "Users can update events" ON events;
DROP POLICY IF EXISTS "Users can delete events" ON events;

-- Create unconditional policies that don't depend on auth.uid()
CREATE POLICY "Events are viewable by everyone" 
ON events FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert events" 
ON events FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update events" 
ON events FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete events" 
ON events FOR DELETE 
USING (true);

-- IMPORTANT: Re-enable proper security after debugging
-- To re-enable proper security, run:
-- ALTER TABLE events ENABLE ROW LEVEL SECURITY;
-- Then recreate proper policies with auth.uid() checks 