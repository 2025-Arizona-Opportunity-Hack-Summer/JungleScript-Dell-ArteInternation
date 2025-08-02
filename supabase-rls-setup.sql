-- Row Level Security Setup for Dell'Arte Alumni Network
-- Run these commands in your Supabase SQL Editor

-- 1. Enable RLS on the alumni table
ALTER TABLE alumni ENABLE ROW LEVEL SECURITY;

-- 2. Create a function to check if the current user is an admin
-- This assumes admin role is stored in the JWT token's metadata
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(
    (current_setting('request.jwt.claims', true)::json ->> 'metadata')::json ->> 'role' = 'admin',
    false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create a function to get the current Clerk user ID from JWT
CREATE OR REPLACE FUNCTION get_clerk_user_id()
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    current_setting('request.jwt.claims', true)::json ->> 'sub',
    ''
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Policy: Simplified privacy for alumni network
CREATE POLICY "Alumni network privacy policy"
ON alumni
FOR SELECT
USING (
  -- Admins can see all profiles
  is_admin() OR 
  -- Users can always see their own profile regardless of privacy
  "clerkUserId" = get_clerk_user_id() OR
  -- All authenticated users can see public profiles (since only alumni/admins can access app)
  "profilePrivacy" = 'public'
);

-- 5. Policy: Users can update their own profile + admins can update all
CREATE POLICY "Users can update own profile, admins can update all"
ON alumni
FOR UPDATE
USING (
  is_admin() OR 
  "clerkUserId" = get_clerk_user_id()
);

-- 6. Policy: Users can insert their own profile + admins can insert any
CREATE POLICY "Users can create own profile, admins can create any"
ON alumni
FOR INSERT
WITH CHECK (
  is_admin() OR 
  "clerkUserId" = get_clerk_user_id()
);

-- 7. Policy: Only admins can delete profiles
CREATE POLICY "Only admins can delete profiles"
ON alumni
FOR DELETE
USING (is_admin());

-- 8. Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON alumni TO authenticated;
GRANT DELETE ON alumni TO authenticated;

-- Verification queries (run these to test your setup):
-- SELECT is_admin(); -- Should return true for admin users, false for others
-- SELECT get_clerk_user_id(); -- Should return the Clerk user ID from JWT
-- SELECT * FROM alumni; -- Should only return allowed records based on RLS