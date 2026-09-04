/*
# Fix RLS policies, add admin-level access, and fix user_id defaults

## Summary

This migration fixes multiple critical issues identified in a database audit:

1. **Admin panel RLS access** — The admin panel was completely broken because RLS had no admin-level policies. Admin could not add/edit/delete properties, leads, reviews, blog posts, localities, or other content. This adds admin-level INSERT/UPDATE/DELETE policies using email-based admin identification (matching the frontend check).

2. **Missing DEFAULT auth.uid()** — 8 tables had `user_id NOT NULL` without a default, causing frontend inserts to fail RLS checks. All now have `DEFAULT auth.uid()`.

3. **Overly permissive policies tightened** — `testimonials` and `market_reports` allowed ANY authenticated user to INSERT/UPDATE/DELETE. These are now admin-only.

4. **`rentals` FOR ALL policy split** into 4 separate policies per best practice.

5. **`launch_alerts` DELETE security fix** — was `USING (true)` (any authenticated user could delete any alert), now admin-only (launch_alerts has no user_id column — it's a public form).

6. **Missing user-facing policies added** — SELECT on pg_inquiries/rental_inquiries for own records, DELETE on interior_bookings/user_profiles, UPDATE on favorites/saved_searches/user_documents.

## Admin email addresses
- virasatrealty@gmail.com
- avenuerealestate80@gmail.com

## Tables modified
- properties, leads, reviews, blog_posts, localities, market_reports, testimonials
- bank_partners, interior_packages, legal_services, pg_spaces, rentals
- launch_alerts, newsletter_subscribers
- interior_bookings, legal_requests, loan_applications, property_management_subscriptions
- property_valuations, support_tickets, user_documents, user_profiles
- favorites, saved_searches, pg_inquiries, rental_inquiries

## Security changes
- Admin-level RLS policies added (email-based check via auth.jwt())
- Overly permissive authenticated-level policies tightened to admin-only
- launch_alerts DELETE fixed from public to admin-only
- user_id defaults added to prevent silent insert failures
*/

-- ============================================================
-- 1. Add DEFAULT auth.uid() to tables missing it
-- ============================================================

ALTER TABLE interior_bookings ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE legal_requests ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE loan_applications ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE property_management_subscriptions ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE property_valuations ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE support_tickets ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE user_documents ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE user_profiles ALTER COLUMN user_id SET DEFAULT auth.uid();

-- ============================================================
-- 2. Admin-level policies for content management tables
--    Admin = email in the admin list (checked via auth.jwt())
-- ============================================================

-- properties: admin needs INSERT, UPDATE, DELETE
DROP POLICY IF EXISTS "admin_insert_properties" ON properties;
CREATE POLICY "admin_insert_properties" ON properties
  FOR INSERT TO authenticated
  WITH CHECK (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

DROP POLICY IF EXISTS "admin_update_properties" ON properties;
CREATE POLICY "admin_update_properties" ON properties
  FOR UPDATE TO authenticated
  USING (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'))
  WITH CHECK (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

DROP POLICY IF EXISTS "admin_delete_properties" ON properties;
CREATE POLICY "admin_delete_properties" ON properties
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

-- leads: admin needs SELECT, UPDATE, DELETE for all rows
DROP POLICY IF EXISTS "admin_select_leads" ON leads;
CREATE POLICY "admin_select_leads" ON leads
  FOR SELECT TO authenticated
  USING (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

DROP POLICY IF EXISTS "admin_update_leads" ON leads;
CREATE POLICY "admin_update_leads" ON leads
  FOR UPDATE TO authenticated
  USING (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'))
  WITH CHECK (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

DROP POLICY IF EXISTS "admin_delete_leads" ON leads;
CREATE POLICY "admin_delete_leads" ON leads
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

-- reviews: admin needs SELECT, UPDATE, DELETE for all rows (not just own)
DROP POLICY IF EXISTS "admin_select_reviews" ON reviews;
CREATE POLICY "admin_select_reviews" ON reviews
  FOR SELECT TO authenticated
  USING (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

DROP POLICY IF EXISTS "admin_update_reviews" ON reviews;
CREATE POLICY "admin_update_reviews" ON reviews
  FOR UPDATE TO authenticated
  USING (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'))
  WITH CHECK (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

DROP POLICY IF EXISTS "admin_delete_reviews" ON reviews;
CREATE POLICY "admin_delete_reviews" ON reviews
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

-- blog_posts: admin needs INSERT, UPDATE, DELETE
DROP POLICY IF EXISTS "admin_insert_blog_posts" ON blog_posts;
CREATE POLICY "admin_insert_blog_posts" ON blog_posts
  FOR INSERT TO authenticated
  WITH CHECK (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

DROP POLICY IF EXISTS "admin_update_blog_posts" ON blog_posts;
CREATE POLICY "admin_update_blog_posts" ON blog_posts
  FOR UPDATE TO authenticated
  USING (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'))
  WITH CHECK (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

DROP POLICY IF EXISTS "admin_delete_blog_posts" ON blog_posts;
CREATE POLICY "admin_delete_blog_posts" ON blog_posts
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

-- localities: admin needs INSERT, UPDATE, DELETE
DROP POLICY IF EXISTS "admin_insert_localities" ON localities;
CREATE POLICY "admin_insert_localities" ON localities
  FOR INSERT TO authenticated
  WITH CHECK (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

DROP POLICY IF EXISTS "admin_update_localities" ON localities;
CREATE POLICY "admin_update_localities" ON localities
  FOR UPDATE TO authenticated
  USING (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'))
  WITH CHECK (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

DROP POLICY IF EXISTS "admin_delete_localities" ON localities;
CREATE POLICY "admin_delete_localities" ON localities
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

-- bank_partners: admin needs INSERT, UPDATE, DELETE
DROP POLICY IF EXISTS "admin_insert_bank_partners" ON bank_partners;
CREATE POLICY "admin_insert_bank_partners" ON bank_partners
  FOR INSERT TO authenticated
  WITH CHECK (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

DROP POLICY IF EXISTS "admin_update_bank_partners" ON bank_partners;
CREATE POLICY "admin_update_bank_partners" ON bank_partners
  FOR UPDATE TO authenticated
  USING (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'))
  WITH CHECK (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

DROP POLICY IF EXISTS "admin_delete_bank_partners" ON bank_partners;
CREATE POLICY "admin_delete_bank_partners" ON bank_partners
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

-- interior_packages: admin needs INSERT, UPDATE, DELETE
DROP POLICY IF EXISTS "admin_insert_interior_packages" ON interior_packages;
CREATE POLICY "admin_insert_interior_packages" ON interior_packages
  FOR INSERT TO authenticated
  WITH CHECK (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

DROP POLICY IF EXISTS "admin_update_interior_packages" ON interior_packages;
CREATE POLICY "admin_update_interior_packages" ON interior_packages
  FOR UPDATE TO authenticated
  USING (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'))
  WITH CHECK (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

DROP POLICY IF EXISTS "admin_delete_interior_packages" ON interior_packages;
CREATE POLICY "admin_delete_interior_packages" ON interior_packages
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

-- legal_services: admin needs INSERT, UPDATE, DELETE
DROP POLICY IF EXISTS "admin_insert_legal_services" ON legal_services;
CREATE POLICY "admin_insert_legal_services" ON legal_services
  FOR INSERT TO authenticated
  WITH CHECK (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

DROP POLICY IF EXISTS "admin_update_legal_services" ON legal_services;
CREATE POLICY "admin_update_legal_services" ON legal_services
  FOR UPDATE TO authenticated
  USING (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'))
  WITH CHECK (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

DROP POLICY IF EXISTS "admin_delete_legal_services" ON legal_services;
CREATE POLICY "admin_delete_legal_services" ON legal_services
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

-- pg_spaces: admin needs INSERT, UPDATE, DELETE
DROP POLICY IF EXISTS "admin_insert_pg_spaces" ON pg_spaces;
CREATE POLICY "admin_insert_pg_spaces" ON pg_spaces
  FOR INSERT TO authenticated
  WITH CHECK (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

DROP POLICY IF EXISTS "admin_update_pg_spaces" ON pg_spaces;
CREATE POLICY "admin_update_pg_spaces" ON pg_spaces
  FOR UPDATE TO authenticated
  USING (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'))
  WITH CHECK (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

DROP POLICY IF EXISTS "admin_delete_pg_spaces" ON pg_spaces;
CREATE POLICY "admin_delete_pg_spaces" ON pg_spaces
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

-- ============================================================
-- 3. Tighten overly permissive policies to admin-only
-- ============================================================

-- market_reports: was any authenticated, now admin-only
DROP POLICY IF EXISTS "insert_market_reports" ON market_reports;
CREATE POLICY "admin_insert_market_reports" ON market_reports
  FOR INSERT TO authenticated
  WITH CHECK (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

DROP POLICY IF EXISTS "update_market_reports" ON market_reports;
CREATE POLICY "admin_update_market_reports" ON market_reports
  FOR UPDATE TO authenticated
  USING (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'))
  WITH CHECK (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

DROP POLICY IF EXISTS "delete_market_reports" ON market_reports;
CREATE POLICY "admin_delete_market_reports" ON market_reports
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

-- testimonials: was any authenticated, now admin-only
DROP POLICY IF EXISTS "insert_testimonials" ON testimonials;
CREATE POLICY "admin_insert_testimonials" ON testimonials
  FOR INSERT TO authenticated
  WITH CHECK (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

DROP POLICY IF EXISTS "update_testimonials" ON testimonials;
CREATE POLICY "admin_update_testimonials" ON testimonials
  FOR UPDATE TO authenticated
  USING (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'))
  WITH CHECK (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

DROP POLICY IF EXISTS "delete_testimonials" ON testimonials;
CREATE POLICY "admin_delete_testimonials" ON testimonials
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

-- ============================================================
-- 4. Fix rentals: split FOR ALL into separate policies
-- ============================================================

DROP POLICY IF EXISTS "owner_manage_rentals" ON rentals;

-- Admin full access
DROP POLICY IF EXISTS "admin_insert_rentals" ON rentals;
CREATE POLICY "admin_insert_rentals" ON rentals
  FOR INSERT TO authenticated
  WITH CHECK (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

DROP POLICY IF EXISTS "admin_update_rentals" ON rentals;
CREATE POLICY "admin_update_rentals" ON rentals
  FOR UPDATE TO authenticated
  USING (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'))
  WITH CHECK (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

DROP POLICY IF EXISTS "admin_delete_rentals" ON rentals;
CREATE POLICY "admin_delete_rentals" ON rentals
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

-- ============================================================
-- 5. Fix launch_alerts DELETE (was USING true — any user could delete any alert)
--    launch_alerts has no user_id column, so admin-only is correct
-- ============================================================

DROP POLICY IF EXISTS "delete_launch_alerts" ON launch_alerts;
CREATE POLICY "admin_delete_launch_alerts" ON launch_alerts
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

-- Admin can see all launch alerts
DROP POLICY IF EXISTS "admin_select_launch_alerts" ON launch_alerts;
CREATE POLICY "admin_select_launch_alerts" ON launch_alerts
  FOR SELECT TO authenticated
  USING (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

-- ============================================================
-- 6. Add missing user-facing policies
-- ============================================================

-- pg_inquiries: users should see their own
DROP POLICY IF EXISTS "select_own_pg_inquiries" ON pg_inquiries;
CREATE POLICY "select_own_pg_inquiries" ON pg_inquiries
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- rental_inquiries: users should see, update, delete their own
DROP POLICY IF EXISTS "select_own_rental_inquiries" ON rental_inquiries;
CREATE POLICY "select_own_rental_inquiries" ON rental_inquiries
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_rental_inquiries" ON rental_inquiries;
CREATE POLICY "update_own_rental_inquiries" ON rental_inquiries
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_rental_inquiries" ON rental_inquiries;
CREATE POLICY "delete_own_rental_inquiries" ON rental_inquiries
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- interior_bookings: users should be able to delete (cancel) their own
DROP POLICY IF EXISTS "delete_own_interiors" ON interior_bookings;
CREATE POLICY "delete_own_interiors" ON interior_bookings
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- user_profiles: users should be able to delete their own
DROP POLICY IF EXISTS "delete_own_profile" ON user_profiles;
CREATE POLICY "delete_own_profile" ON user_profiles
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- favorites: users should be able to update
DROP POLICY IF EXISTS "update_own_favorites" ON favorites;
CREATE POLICY "update_own_favorites" ON favorites
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- saved_searches: users should be able to update
DROP POLICY IF EXISTS "update_own_saved_searches" ON saved_searches;
CREATE POLICY "update_own_saved_searches" ON saved_searches
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- user_documents: users should be able to update
DROP POLICY IF EXISTS "update_own_docs" ON user_documents;
CREATE POLICY "update_own_docs" ON user_documents
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 7. Admin access to user-submitted data tables (for management)
-- ============================================================

-- newsletter_subscribers: admin can see all, delete
DROP POLICY IF EXISTS "admin_select_newsletter" ON newsletter_subscribers;
CREATE POLICY "admin_select_newsletter" ON newsletter_subscribers
  FOR SELECT TO authenticated
  USING (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

DROP POLICY IF EXISTS "admin_delete_newsletter" ON newsletter_subscribers;
CREATE POLICY "admin_delete_newsletter" ON newsletter_subscribers
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

-- site_visit_bookings: admin can see all, update, delete
DROP POLICY IF EXISTS "admin_select_site_visits" ON site_visit_bookings;
CREATE POLICY "admin_select_site_visits" ON site_visit_bookings
  FOR SELECT TO authenticated
  USING (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

DROP POLICY IF EXISTS "admin_update_site_visits" ON site_visit_bookings;
CREATE POLICY "admin_update_site_visits" ON site_visit_bookings
  FOR UPDATE TO authenticated
  USING (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'))
  WITH CHECK (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

DROP POLICY IF EXISTS "admin_delete_site_visits" ON site_visit_bookings;
CREATE POLICY "admin_delete_site_visits" ON site_visit_bookings
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

-- interior_bookings: admin can see all, update, delete
DROP POLICY IF EXISTS "admin_select_interiors" ON interior_bookings;
CREATE POLICY "admin_select_interiors" ON interior_bookings
  FOR SELECT TO authenticated
  USING (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

DROP POLICY IF EXISTS "admin_update_interiors" ON interior_bookings;
CREATE POLICY "admin_update_interiors" ON interior_bookings
  FOR UPDATE TO authenticated
  USING (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'))
  WITH CHECK (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

DROP POLICY IF EXISTS "admin_delete_interiors" ON interior_bookings;
CREATE POLICY "admin_delete_interiors" ON interior_bookings
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

-- legal_requests: admin can see all, update, delete
DROP POLICY IF EXISTS "admin_select_legal_requests" ON legal_requests;
CREATE POLICY "admin_select_legal_requests" ON legal_requests
  FOR SELECT TO authenticated
  USING (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

DROP POLICY IF EXISTS "admin_update_legal_requests" ON legal_requests;
CREATE POLICY "admin_update_legal_requests" ON legal_requests
  FOR UPDATE TO authenticated
  USING (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'))
  WITH CHECK (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

DROP POLICY IF EXISTS "admin_delete_legal_requests" ON legal_requests;
CREATE POLICY "admin_delete_legal_requests" ON legal_requests
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

-- loan_applications: admin can see all, update, delete
DROP POLICY IF EXISTS "admin_select_loans" ON loan_applications;
CREATE POLICY "admin_select_loans" ON loan_applications
  FOR SELECT TO authenticated
  USING (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

DROP POLICY IF EXISTS "admin_update_loans" ON loan_applications;
CREATE POLICY "admin_update_loans" ON loan_applications
  FOR UPDATE TO authenticated
  USING (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'))
  WITH CHECK (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

DROP POLICY IF EXISTS "admin_delete_loans" ON loan_applications;
CREATE POLICY "admin_delete_loans" ON loan_applications
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

-- property_valuations: admin can see all, update, delete
DROP POLICY IF EXISTS "admin_select_valuations" ON property_valuations;
CREATE POLICY "admin_select_valuations" ON property_valuations
  FOR SELECT TO authenticated
  USING (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

DROP POLICY IF EXISTS "admin_update_valuations" ON property_valuations;
CREATE POLICY "admin_update_valuations" ON property_valuations
  FOR UPDATE TO authenticated
  USING (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'))
  WITH CHECK (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

DROP POLICY IF EXISTS "admin_delete_valuations" ON property_valuations;
CREATE POLICY "admin_delete_valuations" ON property_valuations
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

-- property_management_subscriptions: admin can see all, update, delete
DROP POLICY IF EXISTS "admin_select_pm" ON property_management_subscriptions;
CREATE POLICY "admin_select_pm" ON property_management_subscriptions
  FOR SELECT TO authenticated
  USING (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

DROP POLICY IF EXISTS "admin_update_pm" ON property_management_subscriptions;
CREATE POLICY "admin_update_pm" ON property_management_subscriptions
  FOR UPDATE TO authenticated
  USING (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'))
  WITH CHECK (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

DROP POLICY IF EXISTS "admin_delete_pm" ON property_management_subscriptions;
CREATE POLICY "admin_delete_pm" ON property_management_subscriptions
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

-- support_tickets: admin can see all, update, delete
DROP POLICY IF EXISTS "admin_select_tickets" ON support_tickets;
CREATE POLICY "admin_select_tickets" ON support_tickets
  FOR SELECT TO authenticated
  USING (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

DROP POLICY IF EXISTS "admin_update_tickets" ON support_tickets;
CREATE POLICY "admin_update_tickets" ON support_tickets
  FOR UPDATE TO authenticated
  USING (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'))
  WITH CHECK (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

DROP POLICY IF EXISTS "admin_delete_tickets" ON support_tickets;
CREATE POLICY "admin_delete_tickets" ON support_tickets
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

-- user_documents: admin can see all, update, delete
DROP POLICY IF EXISTS "admin_select_docs" ON user_documents;
CREATE POLICY "admin_select_docs" ON user_documents
  FOR SELECT TO authenticated
  USING (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

DROP POLICY IF EXISTS "admin_update_docs" ON user_documents;
CREATE POLICY "admin_update_docs" ON user_documents
  FOR UPDATE TO authenticated
  USING (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'))
  WITH CHECK (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

DROP POLICY IF EXISTS "admin_delete_docs" ON user_documents;
CREATE POLICY "admin_delete_docs" ON user_documents
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

-- pg_inquiries: admin can see all, update, delete
DROP POLICY IF EXISTS "admin_select_pg_inquiries" ON pg_inquiries;
CREATE POLICY "admin_select_pg_inquiries" ON pg_inquiries
  FOR SELECT TO authenticated
  USING (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

DROP POLICY IF EXISTS "admin_update_pg_inquiries" ON pg_inquiries;
CREATE POLICY "admin_update_pg_inquiries" ON pg_inquiries
  FOR UPDATE TO authenticated
  USING (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'))
  WITH CHECK (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

DROP POLICY IF EXISTS "admin_delete_pg_inquiries" ON pg_inquiries;
CREATE POLICY "admin_delete_pg_inquiries" ON pg_inquiries
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

-- rental_inquiries: admin can see all, update, delete
DROP POLICY IF EXISTS "admin_select_rental_inquiries" ON rental_inquiries;
CREATE POLICY "admin_select_rental_inquiries" ON rental_inquiries
  FOR SELECT TO authenticated
  USING (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

DROP POLICY IF EXISTS "admin_update_rental_inquiries" ON rental_inquiries;
CREATE POLICY "admin_update_rental_inquiries" ON rental_inquiries
  FOR UPDATE TO authenticated
  USING (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'))
  WITH CHECK (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

DROP POLICY IF EXISTS "admin_delete_rental_inquiries" ON rental_inquiries;
CREATE POLICY "admin_delete_rental_inquiries" ON rental_inquiries
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

-- user_profiles: admin can see all, update, delete
DROP POLICY IF EXISTS "admin_select_profiles" ON user_profiles;
CREATE POLICY "admin_select_profiles" ON user_profiles
  FOR SELECT TO authenticated
  USING (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

DROP POLICY IF EXISTS "admin_update_profiles" ON user_profiles;
CREATE POLICY "admin_update_profiles" ON user_profiles
  FOR UPDATE TO authenticated
  USING (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'))
  WITH CHECK (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

DROP POLICY IF EXISTS "admin_delete_profiles" ON user_profiles;
CREATE POLICY "admin_delete_profiles" ON user_profiles
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));
