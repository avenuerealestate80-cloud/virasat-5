/*
# Fix Critical RLS Security Issues

## Summary
This migration fixes three categories of security vulnerabilities in the database:

1. **Open SELECT policies (data leaks)**: Three tables had `USING (true)` SELECT policies
   scoped to `authenticated`, meaning ANY logged-in user could read ALL rows — including
   other users' phone numbers, emails, and booking details. These are now scoped to
   admin-only or owner-only access.

2. **Hardcoded email-based admin checks**: 12+ tables used
   `auth.jwt() ->> 'email' = ANY(ARRAY['virasatrealty@gmail.com', ...])` to determine
   admin access. This is fragile (email changes break access) and less secure than
   the existing `is_admin()` function which checks the `user_roles` table. All such
   policies are migrated to use `is_admin()`.

3. **No changes to data**: All changes are policy-only. No columns, rows, or tables are modified.

## Tables Modified (policy-only changes)

### Data leak fixes (open SELECT → admin/owner scoped)
- `newsletter_subscribers` — SELECT was `true` for authenticated → now admin-only
- `launch_alerts` — SELECT was `true` for authenticated → now admin-only (insert remains open)
- `site_visit_bookings` — SELECT was `true` for authenticated → now admin-only (insert remains open)

### Hardcoded email → is_admin() migration
- `bank_partners` (INSERT, UPDATE, DELETE)
- `blog_posts` (INSERT, UPDATE, DELETE)
- `interior_packages` (INSERT, UPDATE, DELETE)
- `legal_services` (INSERT, UPDATE, DELETE)
- `localities` (INSERT, UPDATE, DELETE)
- `market_reports` (INSERT, UPDATE, DELETE)
- `pg_spaces` (INSERT, UPDATE, DELETE)
- `rentals` (INSERT, UPDATE, DELETE)
- `testimonials` (INSERT, UPDATE, DELETE)
- `reviews` (admin UPDATE, DELETE — non-admin policies unchanged)

## Security
- All admin write policies now use `is_admin()` which checks `user_roles` table
- Data-leak SELECT policies are now admin-only
- Public read policies (anon) remain unchanged where they were already correct
*/