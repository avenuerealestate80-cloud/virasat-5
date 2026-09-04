/*
# Migrate all hardcoded email admin policies to use is_admin()

## Summary
Previously, admin write policies (INSERT/UPDATE/DELETE) on 20 tables checked admin access
by matching the JWT email against a hardcoded array of two email addresses:
  auth.jwt() ->> 'email' = ANY(ARRAY['virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'])

This is fragile and insecure:
- If an admin's email changes, they lose access silently
- The email is stored in raw_user_meta_data which is user-mutable
- It bypasses the proper user_roles table

This migration replaces ALL such policies with the existing is_admin() function,
which checks the user_roles table for role = 'admin'.

## Tables Modified (policy-only, no data changes)
1. bank_partners — INSERT, UPDATE, DELETE
2. blog_posts — INSERT, UPDATE, DELETE
3. interior_bookings — SELECT, UPDATE, DELETE (admin policies)
4. interior_packages — INSERT, UPDATE, DELETE
5. legal_requests — SELECT, UPDATE, DELETE (admin policies)
6. legal_services — INSERT, UPDATE, DELETE
7. loan_applications — SELECT, UPDATE, DELETE (admin policies)
8. localities — INSERT, UPDATE, DELETE
9. market_reports — INSERT, UPDATE, DELETE
10. pg_inquiries — SELECT, UPDATE, DELETE (admin policies)
11. pg_spaces — INSERT, UPDATE, DELETE
12. property_management_subscriptions — SELECT, UPDATE, DELETE (admin policies)
13. property_valuations — SELECT, UPDATE, DELETE (admin policies)
14. rental_inquiries — SELECT, UPDATE, DELETE (admin policies)
15. rentals — INSERT, UPDATE, DELETE
16. reviews — SELECT, UPDATE, DELETE (admin policies)
17. support_tickets — SELECT, UPDATE, DELETE (admin policies)
18. testimonials — INSERT, UPDATE, DELETE
19. user_documents — SELECT, UPDATE, DELETE (admin policies)
20. user_profiles — SELECT, UPDATE, DELETE (admin policies)

## Security
All admin policies now use is_admin() which queries: SELECT EXISTS(SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
Non-admin policies (anon read, owner-scoped) are NOT touched.
*/

-- bank_partners
DROP POLICY IF EXISTS "admin_insert_bank_partners" ON bank_partners;
DROP POLICY IF EXISTS "admin_update_bank_partners" ON bank_partners;
DROP POLICY IF EXISTS "admin_delete_bank_partners" ON bank_partners;
CREATE POLICY "admin_insert_bank_partners" ON bank_partners FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "admin_update_bank_partners" ON bank_partners FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_delete_bank_partners" ON bank_partners FOR DELETE TO authenticated USING (is_admin());

-- blog_posts
DROP POLICY IF EXISTS "admin_insert_blog_posts" ON blog_posts;
DROP POLICY IF EXISTS "admin_update_blog_posts" ON blog_posts;
DROP POLICY IF EXISTS "admin_delete_blog_posts" ON blog_posts;
CREATE POLICY "admin_insert_blog_posts" ON blog_posts FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "admin_update_blog_posts" ON blog_posts FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_delete_blog_posts" ON blog_posts FOR DELETE TO authenticated USING (is_admin());

-- interior_bookings (admin policies only)
DROP POLICY IF EXISTS "admin_select_interiors" ON interior_bookings;
DROP POLICY IF EXISTS "admin_update_interiors" ON interior_bookings;
DROP POLICY IF EXISTS "admin_delete_interiors" ON interior_bookings;
CREATE POLICY "admin_select_interiors" ON interior_bookings FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "admin_update_interiors" ON interior_bookings FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_delete_interiors" ON interior_bookings FOR DELETE TO authenticated USING (is_admin());

-- interior_packages
DROP POLICY IF EXISTS "admin_insert_interior_packages" ON interior_packages;
DROP POLICY IF EXISTS "admin_update_interior_packages" ON interior_packages;
DROP POLICY IF EXISTS "admin_delete_interior_packages" ON interior_packages;
CREATE POLICY "admin_insert_interior_packages" ON interior_packages FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "admin_update_interior_packages" ON interior_packages FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_delete_interior_packages" ON interior_packages FOR DELETE TO authenticated USING (is_admin());

-- legal_requests (admin policies only)
DROP POLICY IF EXISTS "admin_select_legal_requests" ON legal_requests;
DROP POLICY IF EXISTS "admin_update_legal_requests" ON legal_requests;
DROP POLICY IF EXISTS "admin_delete_legal_requests" ON legal_requests;
CREATE POLICY "admin_select_legal_requests" ON legal_requests FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "admin_update_legal_requests" ON legal_requests FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_delete_legal_requests" ON legal_requests FOR DELETE TO authenticated USING (is_admin());

-- legal_services
DROP POLICY IF EXISTS "admin_insert_legal_services" ON legal_services;
DROP POLICY IF EXISTS "admin_update_legal_services" ON legal_services;
DROP POLICY IF EXISTS "admin_delete_legal_services" ON legal_services;
CREATE POLICY "admin_insert_legal_services" ON legal_services FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "admin_update_legal_services" ON legal_services FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_delete_legal_services" ON legal_services FOR DELETE TO authenticated USING (is_admin());

-- loan_applications (admin policies only)
DROP POLICY IF EXISTS "admin_select_loans" ON loan_applications;
DROP POLICY IF EXISTS "admin_update_loans" ON loan_applications;
DROP POLICY IF EXISTS "admin_delete_loans" ON loan_applications;
CREATE POLICY "admin_select_loans" ON loan_applications FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "admin_update_loans" ON loan_applications FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_delete_loans" ON loan_applications FOR DELETE TO authenticated USING (is_admin());

-- localities
DROP POLICY IF EXISTS "admin_insert_localities" ON localities;
DROP POLICY IF EXISTS "admin_update_localities" ON localities;
DROP POLICY IF EXISTS "admin_delete_localities" ON localities;
CREATE POLICY "admin_insert_localities" ON localities FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "admin_update_localities" ON localities FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_delete_localities" ON localities FOR DELETE TO authenticated USING (is_admin());

-- market_reports
DROP POLICY IF EXISTS "admin_insert_market_reports" ON market_reports;
DROP POLICY IF EXISTS "admin_update_market_reports" ON market_reports;
DROP POLICY IF EXISTS "admin_delete_market_reports" ON market_reports;
CREATE POLICY "admin_insert_market_reports" ON market_reports FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "admin_update_market_reports" ON market_reports FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_delete_market_reports" ON market_reports FOR DELETE TO authenticated USING (is_admin());

-- pg_inquiries (admin policies only)
DROP POLICY IF EXISTS "admin_select_pg_inquiries" ON pg_inquiries;
DROP POLICY IF EXISTS "admin_update_pg_inquiries" ON pg_inquiries;
DROP POLICY IF EXISTS "admin_delete_pg_inquiries" ON pg_inquiries;
CREATE POLICY "admin_select_pg_inquiries" ON pg_inquiries FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "admin_update_pg_inquiries" ON pg_inquiries FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_delete_pg_inquiries" ON pg_inquiries FOR DELETE TO authenticated USING (is_admin());

-- pg_spaces
DROP POLICY IF EXISTS "admin_insert_pg_spaces" ON pg_spaces;
DROP POLICY IF EXISTS "admin_update_pg_spaces" ON pg_spaces;
DROP POLICY IF EXISTS "admin_delete_pg_spaces" ON pg_spaces;
CREATE POLICY "admin_insert_pg_spaces" ON pg_spaces FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "admin_update_pg_spaces" ON pg_spaces FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_delete_pg_spaces" ON pg_spaces FOR DELETE TO authenticated USING (is_admin());

-- property_management_subscriptions (admin policies only)
DROP POLICY IF EXISTS "admin_select_pm" ON property_management_subscriptions;
DROP POLICY IF EXISTS "admin_update_pm" ON property_management_subscriptions;
DROP POLICY IF EXISTS "admin_delete_pm" ON property_management_subscriptions;
CREATE POLICY "admin_select_pm" ON property_management_subscriptions FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "admin_update_pm" ON property_management_subscriptions FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_delete_pm" ON property_management_subscriptions FOR DELETE TO authenticated USING (is_admin());

-- property_valuations (admin policies only)
DROP POLICY IF EXISTS "admin_select_valuations" ON property_valuations;
DROP POLICY IF EXISTS "admin_update_valuations" ON property_valuations;
DROP POLICY IF EXISTS "admin_delete_valuations" ON property_valuations;
CREATE POLICY "admin_select_valuations" ON property_valuations FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "admin_update_valuations" ON property_valuations FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_delete_valuations" ON property_valuations FOR DELETE TO authenticated USING (is_admin());

-- rental_inquiries (admin policies only)
DROP POLICY IF EXISTS "admin_select_rental_inquiries" ON rental_inquiries;
DROP POLICY IF EXISTS "admin_update_rental_inquiries" ON rental_inquiries;
DROP POLICY IF EXISTS "admin_delete_rental_inquiries" ON rental_inquiries;
CREATE POLICY "admin_select_rental_inquiries" ON rental_inquiries FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "admin_update_rental_inquiries" ON rental_inquiries FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_delete_rental_inquiries" ON rental_inquiries FOR DELETE TO authenticated USING (is_admin());

-- rentals
DROP POLICY IF EXISTS "admin_insert_rentals" ON rentals;
DROP POLICY IF EXISTS "admin_update_rentals" ON rentals;
DROP POLICY IF EXISTS "admin_delete_rentals" ON rentals;
CREATE POLICY "admin_insert_rentals" ON rentals FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "admin_update_rentals" ON rentals FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_delete_rentals" ON rentals FOR DELETE TO authenticated USING (is_admin());

-- reviews (admin policies only)
DROP POLICY IF EXISTS "admin_select_reviews" ON reviews;
DROP POLICY IF EXISTS "admin_update_reviews" ON reviews;
DROP POLICY IF EXISTS "admin_delete_reviews" ON reviews;
CREATE POLICY "admin_select_reviews" ON reviews FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "admin_update_reviews" ON reviews FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_delete_reviews" ON reviews FOR DELETE TO authenticated USING (is_admin());

-- support_tickets (admin policies only)
DROP POLICY IF EXISTS "admin_select_tickets" ON support_tickets;
DROP POLICY IF EXISTS "admin_update_tickets" ON support_tickets;
DROP POLICY IF EXISTS "admin_delete_tickets" ON support_tickets;
CREATE POLICY "admin_select_tickets" ON support_tickets FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "admin_update_tickets" ON support_tickets FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_delete_tickets" ON support_tickets FOR DELETE TO authenticated USING (is_admin());

-- testimonials
DROP POLICY IF EXISTS "admin_insert_testimonials" ON testimonials;
DROP POLICY IF EXISTS "admin_update_testimonials" ON testimonials;
DROP POLICY IF EXISTS "admin_delete_testimonials" ON testimonials;
CREATE POLICY "admin_insert_testimonials" ON testimonials FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "admin_update_testimonials" ON testimonials FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_delete_testimonials" ON testimonials FOR DELETE TO authenticated USING (is_admin());

-- user_documents (admin policies only)
DROP POLICY IF EXISTS "admin_select_docs" ON user_documents;
DROP POLICY IF EXISTS "admin_update_docs" ON user_documents;
DROP POLICY IF EXISTS "admin_delete_docs" ON user_documents;
CREATE POLICY "admin_select_docs" ON user_documents FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "admin_update_docs" ON user_documents FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_delete_docs" ON user_documents FOR DELETE TO authenticated USING (is_admin());

-- user_profiles (admin policies only)
DROP POLICY IF EXISTS "admin_select_profiles" ON user_profiles;
DROP POLICY IF EXISTS "admin_update_profiles" ON user_profiles;
DROP POLICY IF EXISTS "admin_delete_profiles" ON user_profiles;
CREATE POLICY "admin_select_profiles" ON user_profiles FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "admin_update_profiles" ON user_profiles FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_delete_profiles" ON user_profiles FOR DELETE TO authenticated USING (is_admin());