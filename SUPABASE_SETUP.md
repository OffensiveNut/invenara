# Supabase Setup Guide for Invenara

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in:
   - **Project Name**: `invenara` (or your preferred name)
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Select closest to you
   - **Pricing Plan**: Free tier is fine for development
4. Click "Create new project" and wait 2-3 minutes

## Step 2: Run the Schema SQL

1. Once your project is ready, go to **SQL Editor** in the left sidebar
2. Click "New Query"
3. Open the file `ref/project/database/schema.sql` from your project
4. Copy the entire contents and paste into the SQL Editor
5. Click "Run" (or press Ctrl+Enter)
6. Wait for the success message

This will create:
- ✅ All tables (components, picking_lists, etc.)
- ✅ Indexes for performance
- ✅ Functions and triggers
- ✅ Sample data for testing
- ✅ Row Level Security policies

## Step 3: Get Your API Credentials

1. Go to **Project Settings** (gear icon in left sidebar)
2. Click **API Keys** in the settings menu
3. Under "Publishable and secret API keys", copy:
   - **Project URL** - looks like: `https://xxxxx.supabase.co`
   - **Publishable key** - starts with `sb_publishable_`

## Step 4: Configure Environment Variables

1. Open `.env` file in your project root
2. Replace the placeholder values:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_your_key_here
```

3. Save the file

⚠️ **Important**: Never commit `.env` to git! It's already in `.gitignore`

## Step 5: Verify the Connection

Run your dev server:
```bash
bun run dev
```

Check the browser console - you should see no Supabase errors.

## Step 6: Test the Database

1. Go to **Table Editor** in Supabase dashboard
2. You should see these tables:
   - `components` (with 10 sample components)
   - `component_specifications`
   - `picking_lists` (with 1 sample)
   - `picking_list_items`
   - `stock_transactions`

3. Click on `components` table to see the sample data

## Optional: Use Supabase CLI

For advanced workflows (migrations, local development):

```bash
# Install Supabase CLI
bun add -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Pull remote schema
supabase db pull
```

## Troubleshooting

### Error: "Missing Supabase environment variables"
- Make sure `.env` file exists in project root
- Check that values are correct (no quotes needed)
- Restart the dev server after changing `.env`

### Error: "Invalid API key"
- Double-check you copied the **Publishable** key (starts with `sb_publishable_`), not the secret key
- Make sure there's no extra spaces in the `.env` file
- The new publishable keys work the same as legacy anon keys

### Connection refused
- Verify your project URL is correct
- Check if your Supabase project is active (green status)
- Make sure you're not behind a firewall blocking supabase.co

### RLS Policy errors
- The schema includes permissive policies for development
- For production, update the policies in the SQL Editor

## Next Steps

Now that Supabase is connected, the app will:
- ✅ Load real components from database
- ✅ Save changes permanently
- ✅ Track stock transactions
- ✅ Persist picking lists and history

Ready to integrate the services into your components!
