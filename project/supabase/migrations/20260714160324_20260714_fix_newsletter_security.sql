/*
# Fix newsletter_subscribers security

## Changes
- Drop open `select_newsletter` (was USING true → any user could read all subscriber emails)
- Drop open `update_newsletter` (was USING true → any user could modify subscriber data)
- Drop `admin_select_newsletter` (hardcoded email check) → recreate with is_admin()
- Drop `admin_delete_newsletter` (hardcoded email check) → recreate with is_admin()
- Drop open `delete_newsletter` (was USING true → any user could delete subscribers)
- Keep `insert_newsletter` as-is (anon can subscribe)
*/

DROP POLICY IF EXISTS "select_newsletter" ON newsletter_subscribers;
DROP POLICY IF EXISTS "update_newsletter" ON newsletter_subscribers;
DROP POLICY IF EXISTS "delete_newsletter" ON newsletter_subscribers;
DROP POLICY IF EXISTS "admin_select_newsletter" ON newsletter_subscribers;
DROP POLICY IF EXISTS "admin_delete_newsletter" ON newsletter_subscribers;

CREATE POLICY "admin_select_newsletter" ON newsletter_subscribers
  FOR SELECT TO authenticated USING (is_admin());

CREATE POLICY "admin_update_newsletter" ON newsletter_subscribers
  FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "admin_delete_newsletter" ON newsletter_subscribers
  FOR DELETE TO authenticated USING (is_admin());