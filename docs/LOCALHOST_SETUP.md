# Localhost Development Setup for Magic Links

## Overview
This guide helps you configure Supabase authentication to work with localhost during development.

## Current Configuration
Your application is already set up to use magic links (OTP authentication) via `supabase.auth.signInWithOtp()`.

## Steps to Enable Localhost Magic Links

### 1. Update Environment Variables for Local Development

In your `.env.local` file, change the site URL for local development:

```bash
# Change this line from:
NEXT_PUBLIC_SITE_URL=https://derisk.space

# To this for local development:
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 2. Configure Supabase Dashboard

You need to add localhost URLs to your Supabase project's allowed redirect URLs:

1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project: `irtrknetstrchlqqqdir`

2. **Navigate to Authentication Settings**
   - Go to: Authentication → Settings
   - Or directly: https://supabase.com/dashboard/project/irtrknetstrchlqqqdir/auth/settings

3. **Add Localhost URLs to Site URL**
   - In the "Site URL" field, add:
   ```
   http://localhost:3000
   ```
   - If you want both production and localhost, you can add multiple URLs separated by commas:
   ```
   https://derisk.space,http://localhost:3000
   ```

4. **Add Localhost to Redirect URLs**
   - In the "Redirect URLs" section, add:
   ```
   http://localhost:3000/**
   ```
   - This allows any path on localhost:3000 to be used as a redirect destination

5. **Save the changes**

### 3. Test the Configuration

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Visit the signup page:**
   ```
   http://localhost:3000/signup
   ```

3. **Enter your email and submit**
   - You should receive a magic link in your email
   - The link should redirect to `http://localhost:3000/dashboard`

### 4. Troubleshooting

**If magic links don't work:**

1. **Check the email link**
   - Make sure the link starts with `http://localhost:3000`
   - Not `https://derisk.space`

2. **Check browser console**
   - Open Developer Tools → Console
   - Look for any authentication errors

3. **Verify environment variables**
   - Make sure `NEXT_PUBLIC_SITE_URL=http://localhost:3000`
   - Restart your dev server after changing environment variables

4. **Check Supabase logs**
   - Go to Supabase Dashboard → Logs → Auth
   - Look for any authentication errors

**Common Issues:**

- **"Invalid redirect URL"**: Make sure localhost is added to redirect URLs in Supabase
- **Link redirects to production**: Check your `NEXT_PUBLIC_SITE_URL` environment variable
- **Email not received**: Check spam folder, or try a different email address

### 5. Switching Between Environments

**For local development:**
```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**For production:**
```bash
NEXT_PUBLIC_SITE_URL=https://derisk.space
```

### 6. Optional: Create Environment-Specific Configs

You can create separate environment files:

**`.env.development`:**
```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**`.env.production`:**
```bash
NEXT_PUBLIC_SITE_URL=https://derisk.space
```

Then use them with:
```bash
# For development
npm run dev

# For production build
NODE_ENV=production npm run build
```

## Security Notes

- Only add localhost URLs to redirect URLs in development
- Remove localhost URLs from production Supabase settings
- Never commit `.env.local` files to version control
- Use different Supabase projects for development and production if possible
