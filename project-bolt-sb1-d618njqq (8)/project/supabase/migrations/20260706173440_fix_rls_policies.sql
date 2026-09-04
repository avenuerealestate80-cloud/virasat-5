-- Fix RLS policies for public real estate website
-- Properties, localities, blog_posts: Public read, admin-only write
-- Leads: Public insert (contact form), admin-only read/update/delete

-- ============================================
-- PROPERTIES: Drop insecure policies, create secure ones
-- ============================================
DROP POLICY IF EXISTS anon_delete_properties ON properties;
DROP POLICY IF EXISTS anon_insert_properties ON properties;
DROP POLICY IF EXISTS anon_update_properties ON properties;
DROP POLICY IF EXISTS delete_own_properties ON properties;
DROP POLICY IF EXISTS insert_own_properties ON properties;
DROP POLICY IF EXISTS update_own_properties ON properties;

-- Keep read access public (listings should be visible to everyone)
-- CREATE POLICY anon_select_properties already exists and is fine for SELECT

-- For write operations, we restrict to service role (admin) only
-- No INSERT/UPDATE/DELETE policies for anon/authenticated users
-- Admins manage properties via Supabase dashboard with service role key

-- ============================================
-- LOCALITIES: Drop insecure policies, create secure ones
-- ============================================
DROP POLICY IF EXISTS auth_delete_localities ON localities;
DROP POLICY IF EXISTS auth_insert_localities ON localities;
DROP POLICY IF EXISTS auth_update_localities ON localities;

-- Keep read access public (localities should be visible)
-- No write policies for anon/authenticated - admin manages via dashboard

-- ============================================
-- BLOG_POSTS: Drop insecure policies, create secure ones
-- ============================================
DROP POLICY IF EXISTS auth_delete_blog_posts ON blog_posts;
DROP POLICY IF EXISTS auth_insert_blog_posts ON blog_posts;
DROP POLICY IF EXISTS auth_update_blog_posts ON blog_posts;

-- Keep read access public (blog should be visible)
-- No write policies for anon/authenticated - admin manages via dashboard

-- ============================================
-- LEADS: Drop insecure policies, create secure ones
-- ============================================
DROP POLICY IF EXISTS anon_insert_leads ON leads;
DROP POLICY IF EXISTS auth_delete_leads ON leads;
DROP POLICY IF EXISTS auth_update_leads ON leads;
DROP POLICY IF EXISTS auth_read_leads ON leads;

-- Allow public to submit leads (contact form submissions)
CREATE POLICY anon_insert_leads ON leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- No SELECT/UPDATE/DELETE for public users
-- Admins view leads via Supabase dashboard with service role key

-- ============================================
-- Verify RLS is enabled on all tables
-- ============================================
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE localities ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;