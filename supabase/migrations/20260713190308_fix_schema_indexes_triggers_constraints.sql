
-- 1. Auto-update updated_at trigger function
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 2. Apply trigger to all tables with updated_at
DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'rentals','pg_spaces','loan_applications','interior_bookings',
    'legal_requests','property_management_subscriptions','property_valuations',
    'user_documents','support_tickets','rental_inquiries','pg_inquiries',
    'broker_profiles','user_profiles'
  ] LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_set_updated_at ON %I;
       CREATE TRIGGER trg_set_updated_at
       BEFORE UPDATE ON %I
       FOR EACH ROW EXECUTE FUNCTION set_updated_at();',
      tbl, tbl
    );
  END LOOP;
END;
$$;

-- 3. Missing indexes on foreign keys
CREATE INDEX IF NOT EXISTS idx_leads_property_id ON leads(property_id);
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_rental_inquiries_rental_id ON rental_inquiries(rental_id);
CREATE INDEX IF NOT EXISTS idx_pg_inquiries_pg_id ON pg_inquiries(pg_id);
CREATE INDEX IF NOT EXISTS idx_launch_alerts_property_id ON launch_alerts(property_id);
CREATE INDEX IF NOT EXISTS idx_loan_applications_bank_partner_id ON loan_applications(bank_partner_id);
CREATE INDEX IF NOT EXISTS idx_interior_bookings_package_id ON interior_bookings(package_id);
CREATE INDEX IF NOT EXISTS idx_legal_requests_service_id ON legal_requests(service_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);

-- 4. Fix rentals owner_id to allow NULL (seed data has no owner)
ALTER TABLE rentals ALTER COLUMN owner_id DROP NOT NULL;

-- 5. Fix site_visit_bookings.property_id type (text → uuid)
ALTER TABLE site_visit_bookings
  ALTER COLUMN property_id TYPE uuid USING
    CASE WHEN property_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      THEN property_id::uuid
      ELSE NULL
    END;

-- 6. Add CHECK constraints to properties
ALTER TABLE properties
  DROP CONSTRAINT IF EXISTS chk_properties_type;
ALTER TABLE properties
  ADD CONSTRAINT chk_properties_type
    CHECK (type IN ('residential','commercial','plot','villa','pg','industrial'));

ALTER TABLE properties
  DROP CONSTRAINT IF EXISTS chk_properties_status;
ALTER TABLE properties
  ADD CONSTRAINT chk_properties_status
    CHECK (status IN ('available','sold out','coming soon','under construction','upcoming'));
