-- Fix RLS Policy to Allow Alumni Network Visibility
-- Run this in your Supabase SQL Editor

-- 1. Drop the old restrictive policy
DROP POLICY IF EXISTS "Users can view own profile, admins can view all" ON alumni;

-- 2. Create the new simplified privacy policy
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

-- 3. Migrate existing alumni-only profiles to public (since they're the same now)
UPDATE alumni 
SET "profilePrivacy" = 'public' 
WHERE "profilePrivacy" = 'alumni-only';

-- 4. Verify the policy is working
-- SELECT * FROM alumni; -- Should now show profiles based on privacy settings