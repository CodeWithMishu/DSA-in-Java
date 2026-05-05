-- DSA Command Center feature upgrade schema
-- Run this in Supabase SQL Editor after the base schema.

ALTER TABLE users
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user',
ADD COLUMN IF NOT EXISTS opt_in_leaderboard BOOLEAN DEFAULT false;

ALTER TABLE user_progress
ADD COLUMN IF NOT EXISTS solution_code TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS solution_language TEXT DEFAULT 'java',
ADD COLUMN IF NOT EXISTS bookmarked BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS mistake_journal TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS review_interval_days INTEGER,
ADD COLUMN IF NOT EXISTS revise_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS attempt_count INTEGER DEFAULT 0;

CREATE TABLE IF NOT EXISTS admin_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS official_problem_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id TEXT UNIQUE NOT NULL,
  official_notes TEXT DEFAULT '',
  official_solution_code TEXT DEFAULT '',
  official_solution_language TEXT DEFAULT 'java',
  review_status TEXT DEFAULT 'published',
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE admin_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE official_problem_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own profile"
ON users FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Anyone can read active announcements"
ON admin_announcements FOR SELECT
USING (is_active = true);

CREATE POLICY "Anyone can read published official content"
ON official_problem_content FOR SELECT
USING (review_status = 'published');

CREATE POLICY "Admins can manage announcements"
ON admin_announcements FOR ALL
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage official content"
ON official_problem_content FOR ALL
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can read audit log"
ON admin_audit_log FOR SELECT
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can write audit log"
ON admin_audit_log FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE OR REPLACE VIEW admin_user_analytics AS
SELECT
  u.id,
  u.email,
  u.role,
  u.opt_in_leaderboard,
  COUNT(up.problem_id) AS touched_problems,
  COUNT(up.problem_id) FILTER (WHERE up.status = 'done') AS solved,
  COUNT(up.problem_id) FILTER (WHERE up.bookmarked = true) AS bookmarks,
  MAX(up.updated_at) AS last_active_at
FROM users u
LEFT JOIN user_progress up ON up.user_id = u.id
GROUP BY u.id, u.email, u.role, u.opt_in_leaderboard
ORDER BY last_active_at DESC NULLS LAST;

CREATE OR REPLACE VIEW leaderboard AS
SELECT
  u.id,
  COALESCE(u.username, split_part(u.email, '@', 1)) AS display_name,
  u.avatar_url,
  COUNT(up.problem_id) FILTER (WHERE up.status = 'done') AS solved,
  MAX(up.updated_at) AS last_active_at
FROM users u
LEFT JOIN user_progress up ON up.user_id = u.id
WHERE u.opt_in_leaderboard = true
GROUP BY u.id, u.username, u.email, u.avatar_url
ORDER BY solved DESC, last_active_at DESC NULLS LAST;
