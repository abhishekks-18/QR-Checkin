-- Create a stored procedure for creating event attendance tables
-- This is used when registering for an event if the attendance table doesn't exist

CREATE OR REPLACE FUNCTION create_event_attendance_table(table_name text, event_id_param uuid)
RETURNS void AS $$
BEGIN
  -- Create the attendance table
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      event_id UUID NOT NULL REFERENCES events(id),
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      qrdata TEXT,
      registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      checked_in BOOLEAN DEFAULT false,
      check_in_time TIMESTAMP WITH TIME ZONE
    )', table_name);
    
  -- Grant permissions on the new table
  EXECUTE format('
    GRANT ALL PRIVILEGES ON TABLE %I TO postgres;
    GRANT ALL PRIVILEGES ON TABLE %I TO service_role;
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE %I TO authenticated;
    GRANT SELECT ON TABLE %I TO anon;
  ', table_name, table_name, table_name, table_name);
  
  -- Create a foreign key constraint
  EXECUTE format('
    ALTER TABLE %I 
    ADD CONSTRAINT fk_%I_event_id 
    FOREIGN KEY (event_id) 
    REFERENCES events(id) 
    ON DELETE CASCADE;
  ', table_name, table_name);
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 