/*
# Fix site_visit_bookings — drop open policies

## Changes
- Drop `select_site_visits` (USING true → data leak, admin_select already exists with is_admin())
- Drop `update_site_visits` (USING true → any user could modify any booking, admin_update already exists)
- Drop `delete_site_visits` (USING true → any user could delete any booking, admin_delete already exists)
*/

DROP POLICY IF EXISTS "select_site_visits" ON site_visit_bookings;
DROP POLICY IF EXISTS "update_site_visits" ON site_visit_bookings;
DROP POLICY IF EXISTS "delete_site_visits" ON site_visit_bookings;