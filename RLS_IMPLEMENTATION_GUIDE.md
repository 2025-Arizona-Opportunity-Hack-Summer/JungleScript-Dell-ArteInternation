# RLS Implementation Guide for Dell'Arte Alumni Network

## Overview
This guide walks you through implementing Row Level Security (RLS) for your Supabase database to ensure users can only access their own data while admins can access all data.

## Prerequisites
- Clerk authentication is already set up ✅
- Supabase project is configured ✅
- Alumni table exists with `clerkUserId` field ✅

## Step 1: Configure Clerk JWT Template

1. Go to your Clerk Dashboard
2. Navigate to **JWT Templates**
3. Create a new template called "supabase"
4. Use this configuration:

```json
{
  "aud": "authenticated",
  "exp": {{exp}},
  "iat": {{iat}},
  "iss": "{{iss}}",
  "sub": "{{user.id}}",
  "email": "{{user.primary_email_address.email_address}}",
  "metadata": {
    "role": "{{user.public_metadata.role}}"
  }
}
```

5. Save the template

## Step 2: Run SQL Commands in Supabase

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Run all the commands from `supabase-rls-setup.sql`

## Step 3: Update Environment Variables

Make sure you have these environment variables set:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Keep for admin operations
```

## Step 4: Code Changes Completed ✅

### ✅ Created `lib/supabase-server.ts`
- Server-side authenticated Supabase client
- Automatically includes Clerk JWT for RLS

### ✅ Created `lib/supabase-client.ts`
- Client-side authenticated Supabase client for React components

### ✅ Updated `app/api/alumni/profile/route.ts`
- Now uses authenticated client instead of admin client for GET requests
- Respects RLS policies for user data access

### ✅ Created Admin API Routes
- `app/api/admin/alumni/route.ts` - GET/POST operations with proper RLS
- `app/api/admin/alumni/[id]/route.ts` - PUT/DELETE operations with proper RLS

### ✅ Updated Alumni Store
- `lib/alumni-store.ts` - Now uses secure API routes instead of direct Supabase calls
- Maintains same interface for existing components

## How RLS Works in Your App

### For Regular Users:
- Can only read/update their own profile (where `clerkUserId` matches their ID)
- Cannot see other users' data
- Cannot delete any profiles

### For Admins:
- Can read/update any profile
- Can delete profiles
- Have full access to all data

## Testing Your Implementation

1. **As a regular user:**
   ```javascript
   // This should only return their own profile
   const { data } = await supabase.from('alumni').select('*')
   ```

2. **As an admin:**
   ```javascript
   // This should return all profiles
   const { data } = await supabase.from('alumni').select('*')
   ```

3. **Test unauthorized access:**
   - Try to update another user's profile (should fail)
   - Try to access admin data as regular user (should fail)

## Admin Operations

For admin operations that need to bypass RLS, continue using `supabaseAdmin`:

```typescript
// In admin API routes
import { supabaseAdmin } from "@/lib/supabaseAdmin"

// This bypasses RLS for admin operations
const { data } = await supabaseAdmin.from('alumni').select('*')
```

## Security Benefits

✅ **Data Isolation:** Users can only access their own data  
✅ **Admin Control:** Admins have full access when needed  
✅ **Automatic Enforcement:** Database-level security, not just application-level  
✅ **JWT-based:** Leverages Clerk's secure authentication  
✅ **Scalable:** Works automatically as you add more users  

## Troubleshooting

### Common Issues:

1. **"insufficient_privilege" error:**
   - Check that RLS policies are created correctly
   - Verify JWT template is configured in Clerk

2. **Admin can't access data:**
   - Verify admin role is set in Clerk's public metadata
   - Check JWT template includes role in metadata

3. **Users can't access their own data:**
   - Verify `clerkUserId` field is populated correctly
   - Check that JWT sub claim matches stored clerkUserId

### Debug Commands:
```sql
-- Check current user context
SELECT current_setting('request.jwt.claims');

-- Test helper functions
SELECT is_admin();
SELECT get_clerk_user_id();
```

## Next Steps

1. ✅ Run the SQL commands in Supabase (use the `supabase-rls-setup.sql` file)
2. ✅ Configure Clerk JWT template (see Step 1 above)
3. ✅ Test with both regular users and admins
4. ✅ All code changes are complete - your app now has RLS security!

## Important Notes

- **Keep `supabaseAdmin`**: Still needed for admin operations and system tasks
- **Use authenticated clients**: For user-facing operations that should respect RLS  
- **Test thoroughly**: Especially admin vs user permissions
- **Monitor logs**: Watch for RLS policy violations during testing

This implementation follows Supabase's best practices and gives you enterprise-grade security! 🛡️