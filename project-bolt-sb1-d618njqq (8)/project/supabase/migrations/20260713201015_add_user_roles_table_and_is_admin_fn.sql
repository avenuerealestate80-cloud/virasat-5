
-- User roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin', 'broker', 'staff')),
  granted_by uuid REFERENCES auth.users(id),
  granted_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_role" ON user_roles FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "admins_manage_roles" ON user_roles FOR ALL
  TO authenticated USING (
    EXISTS (SELECT 1 FROM user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin')
  );

-- is_admin() helper (SECURITY DEFINER so RLS policies can call it safely)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

-- Seed admin users from existing accounts
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com')
ON CONFLICT (user_id, role) DO NOTHING;

-- Update all existing admin_* policies to use is_admin() instead of hardcoded email checks

-- properties
DROP POLICY IF EXISTS "admin_delete_properties" ON properties;
DROP POLICY IF EXISTS "admin_insert_properties" ON properties;
DROP POLICY IF EXISTS "admin_update_properties" ON properties;

CREATE POLICY "admin_delete_properties" ON properties FOR DELETE
  TO authenticated USING (is_admin());
CREATE POLICY "admin_insert_properties" ON properties FOR INSERT
  TO authenticated WITH CHECK (is_admin() OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'broker'));
CREATE POLICY "admin_update_properties" ON properties FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- leads
DROP POLICY IF EXISTS "admin_select_leads" ON leads;
DROP POLICY IF EXISTS "admin_update_leads" ON leads;
DROP POLICY IF EXISTS "admin_delete_leads" ON leads;

CREATE POLICY "admin_select_leads" ON leads FOR SELECT
  TO authenticated USING (is_admin() OR auth.uid() = user_id);
CREATE POLICY "admin_update_leads" ON leads FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_delete_leads" ON leads FOR DELETE
  TO authenticated USING (is_admin());

-- broker_profiles
DROP POLICY IF EXISTS "admin_select_broker_profiles" ON broker_profiles;
DROP POLICY IF EXISTS "admin_update_broker_profiles" ON broker_profiles;
DROP POLICY IF EXISTS "admin_delete_broker_profiles" ON broker_profiles;

CREATE POLICY "admin_select_broker_profiles" ON broker_profiles FOR SELECT
  TO authenticated USING (is_admin() OR auth.uid() = user_id);
CREATE POLICY "admin_update_broker_profiles" ON broker_profiles FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_delete_broker_profiles" ON broker_profiles FOR DELETE
  TO authenticated USING (is_admin());

-- site_visit_bookings
DROP POLICY IF EXISTS "admin_select_site_visits" ON site_visit_bookings;
DROP POLICY IF EXISTS "admin_update_site_visits" ON site_visit_bookings;
DROP POLICY IF EXISTS "admin_delete_site_visits" ON site_visit_bookings;

CREATE POLICY "admin_select_site_visits" ON site_visit_bookings FOR SELECT
  TO authenticated USING (is_admin());
CREATE POLICY "admin_update_site_visits" ON site_visit_bookings FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_delete_site_visits" ON site_visit_bookings FOR DELETE
  TO authenticated USING (is_admin());
