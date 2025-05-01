-- SQL Diagnostic Queries
-- Run these queries to diagnose permission issues

-- Check if the tables exist
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check table permissions
SELECT grantee, privilege_type, table_name 
FROM information_schema.table_privileges 
WHERE table_schema = 'public' 
AND table_name IN ('events', 'profiles', 'public_events');

-- Check existing policies
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE schemaname = 'public';

-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Display current user and role
SELECT current_user, current_setting('role');

-- Check schema permissions
SELECT nspname, privilege_type, grantee
FROM information_schema.schema_privileges
JOIN pg_namespace ON pg_namespace.nspname = schema_name
WHERE schema_name = 'public';

-- Check if the trigger exists
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public' 
AND event_object_table = 'events';

-- Check for existing function
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'create_event_attendance_table';

-- Check existing permissions for the PostgreSQL roles
SELECT r.rolname, r.rolsuper, r.rolinherit,
  r.rolcreaterole, r.rolcreatedb, r.rolcanlogin,
  r.rolconnlimit, r.rolvaliduntil,
  ARRAY(SELECT b.rolname
        FROM pg_catalog.pg_auth_members m
        JOIN pg_catalog.pg_roles b ON (m.roleid = b.oid)
        WHERE m.member = r.oid) as memberof
FROM pg_catalog.pg_roles r
WHERE r.rolname NOT LIKE 'pg_%'
ORDER BY 1; 