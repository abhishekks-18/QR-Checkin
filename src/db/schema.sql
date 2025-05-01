-- Schema for QR Check-in System

-- Profiles table for user management
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indices for faster lookups
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);

-- Events table for admin event creation
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

-- Function to create event attendance tables
-- Uses SECURITY DEFINER to execute with owner privileges
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
      event_id UUID REFERENCES events(id) NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      check_in_time TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )', table_name);
    
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

-- Trigger to create attendance table when a new event is added
DROP TRIGGER IF EXISTS create_event_attendance_table_trigger ON events;
CREATE TRIGGER create_event_attendance_table_trigger
AFTER INSERT ON events
FOR EACH ROW
EXECUTE FUNCTION create_event_attendance_table(); 