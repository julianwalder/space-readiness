# Investor Venture Visibility System

This document describes the implementation of venture visibility controls for investors in the Space Readiness platform.

## Overview

The system allows founders to control which ventures are visible to investors, while also supporting demo ventures that are visible to all investors by default. This enables a controlled disclosure model where founders can choose when to share their venture data with the investor community.

## Features Implemented

### 1. Database Schema Updates

**New Fields Added to `ventures` table:**
- `is_demo` (BOOLEAN): Marks a venture as a demo/example venture
- `visible_to_investors` (BOOLEAN): Founder-controlled toggle for investor visibility

**SQL Migration File:** [`sql/add-venture-visibility-fields.sql`](../sql/add-venture-visibility-fields.sql)

```sql
ALTER TABLE ventures
ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS visible_to_investors BOOLEAN DEFAULT false;
```

### 2. Updated RLS Policies

The Row Level Security policy for ventures has been updated to support the new visibility model:

**Investors can see:**
- All demo ventures (`is_demo = true`)
- Ventures marked as visible by founders (`visible_to_investors = true`)

**Founders can see:**
- Their own ventures (via `user_id`)
- Organization ventures (via `org_id` and `memberships`)

```sql
CREATE POLICY "Investors can view visible ventures" ON ventures
FOR SELECT
USING (
  -- Investors can see demo or visible ventures
  (
    (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'investor'
    AND (is_demo = true OR visible_to_investors = true)
  )
  OR
  -- Founders can see their own ventures
  (user_id = auth.uid())
  OR
  -- Organization members can see org ventures
  (org_id IN (SELECT org_id FROM memberships WHERE user_id = auth.uid()))
);
```

### 3. Investor Dashboard Enhancements

**File:** [`src/app/investors/dashboard/page.tsx`](../src/app/investors/dashboard/page.tsx)

**New Features:**
- Display "Demo" badge on demo ventures (purple badge)
- Updated venture interface to include visibility fields
- Fixed venture detail link to point to investor-specific route

**Visual Example:**
```tsx
{venture.is_demo && (
  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
    Demo
  </span>
)}
```

### 4. Investor-Specific Venture Detail Page

**File:** [`src/app/investors/venture/[id]/page.tsx`](../src/app/investors/venture/[id]/page.tsx)

**Features:**
- Read-only view of venture information
- Complete readiness assessment display with:
  - Dimension scores (1-9 scale)
  - Confidence levels
  - Justifications
  - Score distribution visualization
- Demo badge display
- Average score calculation
- Assessment progress tracking (X/8 dimensions)

**Route:** `/investors/venture/[id]`

### 5. Founder Venture Management Controls

**File:** [`src/app/venture/[id]/page.tsx`](../src/app/venture/[id]/page.tsx)

**New Feature - Visibility Toggle:**

A checkbox control has been added to the venture management page allowing founders to toggle investor visibility:

```tsx
<div className="border-t border-gray-200 pt-4">
  <div className="flex items-start">
    <input
      id="visible_to_investors"
      type="checkbox"
      checked={formData.visible_to_investors}
      onChange={(e) => setFormData(prev => ({ ...prev, visible_to_investors: e.target.checked }))}
    />
    <label htmlFor="visible_to_investors">
      Visible to Investors
    </label>
    <p className="text-gray-500">
      Allow investors to view this venture and its assessment data
    </p>
  </div>
</div>
```

**Location:** In the venture details editing form, below the description field

### 6. Investor Header Component

**File:** [`src/components/InvestorHeader.tsx`](../src/components/InvestorHeader.tsx)

**Features:**
- Consistent branding with "Investor Portal" label
- User avatar with email initial
- Dropdown menu with:
  - User email
  - Sign out functionality
  - Version information (version, build number, build date)
- Same UX as founder header

## User Flows

### Founder Flow

1. **Create a venture** - Venture is private by default (`visible_to_investors = false`)
2. **Complete assessments** - Add venture data, upload documents, run assessments
3. **Toggle visibility** - When ready, check "Visible to Investors" in venture management
4. **Manage visibility** - Can toggle on/off at any time

### Investor Flow

1. **Sign up as investor** - Use `/investors/join` route
2. **View dashboard** - See all demo ventures and ventures made visible by founders
3. **View venture details** - Click "View Details" to see read-only venture information
4. **Track progress** - Monitor readiness scores across 8 dimensions

### Demo Ventures

Demo ventures (`is_demo = true`) are always visible to all investors and display a purple "Demo" badge. These can be used for:
- Platform demonstrations
- Example ventures
- Training purposes
- Marketing to potential investors

## API Endpoints

### Ventures Query (Investor)

```typescript
// Investors can query ventures they have access to
const { data: ventures } = await supabase
  .from('ventures')
  .select('*')
  .order('created_at', { ascending: false });

// RLS automatically filters to show only:
// - Demo ventures (is_demo = true)
// - Ventures marked visible (visible_to_investors = true)
```

### Venture Update (Founder)

```typescript
// Founders can update visibility
const { error } = await supabase
  .from('ventures')
  .update({
    visible_to_investors: true  // Toggle investor visibility
  })
  .eq('id', ventureId);
```

## Database Setup

To apply the database changes, run the SQL migration:

```bash
# Connect to your Supabase database and run:
psql -h your-db-host -U postgres -d postgres -f sql/add-venture-visibility-fields.sql
```

Or execute directly in Supabase SQL Editor:
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy and paste contents of `sql/add-venture-visibility-fields.sql`
4. Execute

## Testing

### Test Investor Access

1. Create a demo venture:
```sql
UPDATE ventures SET is_demo = true WHERE id = 'venture-id';
```

2. Make a venture visible:
```sql
UPDATE ventures SET visible_to_investors = true WHERE id = 'venture-id';
```

3. Sign in as investor and verify visibility

### Test Founder Controls

1. Sign in as founder
2. Go to venture management (`/venture/[id]`)
3. Click "Edit"
4. Toggle "Visible to Investors" checkbox
5. Save changes
6. Verify checkbox state persists

## Security Considerations

1. **RLS Enforcement**: All venture access is controlled by Row Level Security policies
2. **Read-Only Access**: Investors can only view ventures, not modify them
3. **Explicit Consent**: Founders must explicitly enable visibility (opt-in model)
4. **Demo Separation**: Demo ventures are clearly marked to distinguish from real ventures
5. **JWT Role Validation**: User roles are stored in JWT metadata and validated server-side

## Future Enhancements

Potential features for future development:

1. **Selective Dimension Visibility**: Allow founders to show/hide specific assessment dimensions
2. **Investor Following**: Let investors "follow" specific ventures for notifications
3. **Time-Limited Visibility**: Set expiration dates for investor access
4. **Visibility Groups**: Create investor groups with different access levels
5. **Activity Logging**: Track when investors view ventures
6. **Venture Analytics**: Show founders which investors are viewing their ventures

## Troubleshooting

### Investors Can't See Any Ventures

**Check:**
1. Verify RLS policy is applied: `SELECT * FROM pg_policies WHERE tablename = 'ventures';`
2. Confirm user has investor role: `SELECT raw_app_meta_data FROM auth.users WHERE id = 'user-id';`
3. Check if any ventures have `is_demo = true` or `visible_to_investors = true`

### Visibility Toggle Not Working

**Check:**
1. Database columns exist: `\d ventures` in psql
2. Update permissions: Founders should have UPDATE permission on ventures table
3. Browser console for errors
4. Verify form data is being saved correctly

### 404 on Venture Details

**Check:**
1. Correct route is `/investors/venture/[id]` (not `/ventures/[id]`)
2. Venture is visible to the investor (demo or explicitly marked visible)
3. Venture ID is valid

## Related Files

- **Database Migration**: [`sql/add-venture-visibility-fields.sql`](../sql/add-venture-visibility-fields.sql)
- **Investor Dashboard**: [`src/app/investors/dashboard/page.tsx`](../src/app/investors/dashboard/page.tsx)
- **Investor Venture View**: [`src/app/investors/venture/[id]/page.tsx`](../src/app/investors/venture/[id]/page.tsx)
- **Founder Venture Management**: [`src/app/venture/[id]/page.tsx`](../src/app/venture/[id]/page.tsx)
- **Investor Header**: [`src/components/InvestorHeader.tsx`](../src/components/InvestorHeader.tsx)
- **Auth Setup**: [`docs/INVESTOR_AUTH_SETUP.md`](./INVESTOR_AUTH_SETUP.md)
