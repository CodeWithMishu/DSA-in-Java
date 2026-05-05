# Supabase Multi-User Implementation Plan

## Phase 1: Supabase Setup (5 minutes)

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in / Sign up
3. Create new project:
   - **Project name:** `dsa-command-center`
   - **Database password:** Save this securely!
   - **Region:** Choose closest to your users
4. Copy your **Project URL** and **Anon Key** from Settings → API

### 2. Database Schema

Run these SQL queries in Supabase SQL Editor:

```sql
-- Users table (extends Supabase auth)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User progress table
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  problem_id TEXT NOT NULL,
  status TEXT DEFAULT 'not-started', -- 'not-started', 'in-progress', 'done'
  notes TEXT,
  code_path TEXT,
  notes_path TEXT,
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  UNIQUE(user_id, problem_id)
);

-- Completion log (for streak tracking)
CREATE TABLE completion_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  completed_at TIMESTAMP NOT NULL,
  problem_id TEXT NOT NULL
);

-- Public profiles view
CREATE VIEW user_profiles AS
SELECT id, username, full_name, avatar_url, created_at
FROM users
WHERE username IS NOT NULL;

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE completion_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can read their own data
CREATE POLICY "Users can read own profile"
ON users FOR SELECT
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = id);

-- Users can read/write their own progress
CREATE POLICY "Users can read own progress"
ON user_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
ON user_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
ON user_progress FOR UPDATE
USING (auth.uid() = user_id);

-- Users can read/write their own completion log
CREATE POLICY "Users can read own completion log"
ON completion_log FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own completion log"
ON completion_log FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

### 3. Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project: "DSA Command Center"
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application):
   - Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`
   - Copy **Client ID** and **Client Secret**
5. In Supabase:
   - Authentication → Providers → Google
   - Paste Client ID and Secret
   - Enable Google provider

## Phase 2: App Code Changes

### Environment Variables (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### Key Files to Create/Update
- `lib/supabase.js` - Supabase client
- `app/auth/page.js` - Auth page (login/signup)
- `app/api/auth/callback/route.js` - OAuth callback
- Update `app/page.js` - Connect to Supabase
- `components/UserProfile.js` - Profile management

## Phase 3: Features

✅ Multi-user authentication (Google + Email)
✅ Per-user progress tracking
✅ Sync across devices
✅ Public user profiles
✅ Streak tracking
✅ Data persistence in Supabase

---

**Next Steps:**
1. Create Supabase project
2. Run SQL schema above
3. Set up Google OAuth
4. Update .env.local with keys
5. I'll update the app code
