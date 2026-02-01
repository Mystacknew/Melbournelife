# 🔑 Getting Your Supabase Anon Key

The anon key currently in the code is a **placeholder**. Follow these steps to get your real key:

## Steps:

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard

2. **Select Your Project**
   - Project Ref: `mggcjyfnagjttezrqdwx`
   - Project URL: `https://mggcjyfnagjttezrqdwx.supabase.co`

3. **Get API Keys**
   - Click on **Settings** (gear icon in sidebar)
   - Click on **API**
   - Copy the **anon/public** key (starts with `eyJ...`)

4. **Update App.tsx**
   - Open `App.tsx`
   - Find line ~9: `const supabaseAnonKey = '...'`
   - Replace with your real key

## Example:

```typescript
// Before (placeholder):
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nZ2NqeWZuYWdqdHRlenJxZHd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0MTUyMDAsImV4cCI6MjA1Mzk5MTIwMH0.9PFvIEaCeRcP3wTcWNw8Q_StI9GOJC';

// After (your real key):
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nZ2NqeWZuYWdqdHRlenJxZHd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0MTUyMDAsImV4cCI6MjA1Mzk5MTIwMH0.YOUR_REAL_SECRET_HERE';
```

## Note:
The anon key is **safe to expose** in client-side code. It's protected by Row Level Security (RLS) policies in your database.

✅ Once updated, commit and push the change to GitHub!
