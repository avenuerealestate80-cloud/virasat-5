/*
# Fix launch_alerts security

## Changes
- Drop open `select_launch_alerts` (was USING true → any authenticated user could read all subscribers' phone numbers and budget info)
- Drop open `update_launch_alerts` (was USING true → any user could modify alert subscriptions)
- Drop `admin_select_launch_alerts` (hardcoded email) → recreate with is_admin()
- Drop `admin_delete_launch_alerts` (hardcoded email) → recreate with is_admin()
- Keep `insert_launch_alerts` as-is (anon can subscribe to alerts)
*/

DROP POLICY IF EXISTS "select_launch_alerts" ON launch_alerts;
DROP POLICY IF EXISTS "update_launch_alerts" ON launch_alerts;
DROP POLICY IF EXISTS "admin_select_launch_alerts" ON launch_alerts;
DROP POLICY IF EXISTS "admin_delete_launch_alerts" ON launch_alerts;

CREATE POLICY "admin_select_launch_alerts" ON launch_alerts
  FOR SELECT TO authenticated USING (is_admin());

CREATE POLICY "admin_delete_launch_alerts" ON launch_alerts
  FOR DELETE TO authenticated USING (is_admin());