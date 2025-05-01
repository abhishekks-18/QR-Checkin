-- Create a stored procedure for manually creating event attendance tables
-- This is used by the alternative events implementation

CREATE OR REPLACE FUNCTION create_attendance_table(table_name text, event_id uuid)
RETURNS void AS $$
BEGIN
  -- Create the attendance table
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      event_id UUID NOT NULL,
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
  
  -- Insert a dummy record to test the table
  EXECUTE format('
    INSERT INTO %I (event_id, name, email)
    VALUES ($1, ''Test User'', ''test@example.com'')
  ', table_name) USING event_id;
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 