# Investor Venture Visibility - Setup Guide

## Quick Setup (5 minutes)

This guide will help you activate the investor venture visibility system.

## Step 1: Run Database Migration

Execute the SQL migration to add the new fields:

### Option A: Using Supabase Dashboard
1. Open your [Supabase Dashboard](https://app.supabase.com)
2. Navigate to **SQL Editor**
3. Copy the contents of [`sql/add-venture-visibility-fields.sql`](sql/add-venture-visibility-fields.sql)
4. Paste and **Run** the SQL

### Option B: Using psql CLI
```bash
psql -h your-db-host.supabase.co -U postgres -d postgres -f sql/add-venture-visibility-fields.sql
```

## Step 2: Verify Database Changes

Check that the new columns were added:

```sql
-- Check columns
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'ventures'
AND column_name IN ('is_demo', 'visible_to_investors');

-- Should return:
-- is_demo             | boolean | false
-- visible_to_investors | boolean | false
```

## Step 3: Create Demo Ventures (Optional)

If you want to create demo/example ventures for investors to explore:

```sql
-- Mark existing ventures as demo
UPDATE ventures
SET is_demo = true
WHERE id IN ('venture-id-1', 'venture-id-2');

-- Or create a new demo venture
INSERT INTO ventures (id, name, description, stage, is_demo, user_id)
VALUES (
  gen_random_uuid(),
  'Demo Space Venture',
  'An example venture showcasing the assessment platform',
  'seed',
  true,
  (SELECT id FROM auth.users WHERE email = 'your-founder@email.com')
);
```

## Step 4: Test the System

### Test as Founder
1. Go to http://localhost:3000/signup
2. Sign in as a founder
3. Navigate to a venture: `/venture/[venture-id]`
4. Click "Edit"
5. ✅ Check "Visible to Investors" checkbox
6. Save changes

### Test as Investor
1. Go to http://localhost:3000/investors/join
2. Sign in as an investor
3. View dashboard: `/investors/dashboard`
4. You should see:
   - ✅ All demo ventures (with "Demo" badge)
   - ✅ Ventures marked as visible by founders
5. Click "View Details" to see read-only venture information

## What You Get

### ✅ Investor Features
- **Dashboard with venture cards**
  - Demo ventures marked with purple "Demo" badge
  - Readiness scores displayed
  - Assessment progress (X/8 dimensions)
- **Read-only venture detail pages**
  - Complete assessment data
  - Score distribution visualization
  - Confidence levels and justifications
- **Header with user menu**
  - Avatar with email initial
  - Sign out functionality
  - Version information

### ✅ Founder Features
- **Visibility toggle in venture management**
  - Checkbox to make venture visible to investors
  - Located in the edit form below description
  - Changes saved with venture updates
- **Privacy by default**
  - All new ventures are private (`visible_to_investors = false`)
  - Founders explicitly opt-in to share with investors

### ✅ Security
- **RLS policies enforce access control**
- **Investors have read-only access**
- **JWT role validation**
- **Explicit consent model**

## Current Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/investors/join` | Public | Investor signup page |
| `/investors/dashboard` | Investors | Dashboard showing visible ventures |
| `/investors/venture/[id]` | Investors | Read-only venture details |
| `/venture/[id]` | Founders | Venture management with visibility toggle |

## Troubleshooting

### "No ventures yet" message for investors

**Cause**: No ventures are marked as demo or visible to investors

**Solution**:
```sql
-- Make a venture visible
UPDATE ventures SET visible_to_investors = true WHERE id = 'venture-id';

-- OR create a demo venture
UPDATE ventures SET is_demo = true WHERE id = 'venture-id';
```

### Visibility checkbox not appearing

**Cause**: Database migration not run or fields don't exist

**Solution**: Re-run the migration from Step 1

### 404 on venture details

**Cause**: Incorrect route or venture not visible

**Solution**:
- Ensure using `/investors/venture/[id]` (not `/ventures/[id]`)
- Verify venture has `is_demo = true` OR `visible_to_investors = true`

## Production Deployment

When deploying to production:

1. **Run migration on production database**
   ```bash
   # Using Supabase Dashboard SQL Editor
   # OR via CLI with production credentials
   ```

2. **Update environment variables** (already configured)
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

3. **Verify RLS policies are active**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'ventures';
   ```

4. **Test both flows**
   - Founder: Can toggle visibility
   - Investor: Can see visible/demo ventures only

## Next Steps

1. ✅ Run database migration
2. ✅ Test founder visibility toggle
3. ✅ Test investor access
4. 📝 Create demo ventures for showcase
5. 📝 Document for users
6. 🚀 Deploy to production

## Documentation

Full documentation available in:
- [`docs/INVESTOR_VENTURE_VISIBILITY.md`](docs/INVESTOR_VENTURE_VISIBILITY.md) - Complete feature documentation
- [`docs/INVESTOR_AUTH_SETUP.md`](docs/INVESTOR_AUTH_SETUP.md) - Investor authentication setup
- [`sql/add-venture-visibility-fields.sql`](sql/add-venture-visibility-fields.sql) - Database migration

## Support

If you encounter issues:
1. Check database migration ran successfully
2. Verify RLS policies are active
3. Check browser console for errors
4. Review the troubleshooting section above
