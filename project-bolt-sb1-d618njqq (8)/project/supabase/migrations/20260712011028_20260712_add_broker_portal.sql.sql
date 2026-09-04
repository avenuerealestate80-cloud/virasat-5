-- ============================================================
-- Broker Portal: Add broker_id to properties + RLS policies
-- ============================================================

-- Add broker_id column to properties
ALTER TABLE properties ADD COLUMN IF NOT EXISTS broker_id uuid DEFAULT auth.uid();
ALTER TABLE properties ADD COLUMN IF NOT EXISTS broker_name text;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS broker_phone text;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS broker_email text;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS broker_agency text;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS broker_verified boolean DEFAULT false;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS listing_status text DEFAULT 'active';

-- Index for broker queries
CREATE INDEX IF NOT EXISTS idx_properties_broker_id ON properties(broker_id);

-- ============================================================
-- RLS Policies: Brokers can manage their own listings
-- ============================================================

-- Brokers can INSERT their own properties
DROP POLICY IF EXISTS "broker_insert_properties" ON properties;
CREATE POLICY "broker_insert_properties" ON properties
  FOR INSERT TO authenticated
  WITH CHECK (broker_id = auth.uid());

-- Brokers can UPDATE their own properties
DROP POLICY IF EXISTS "broker_update_own_properties" ON properties;
CREATE POLICY "broker_update_own_properties" ON properties
  FOR UPDATE TO authenticated
  USING (broker_id = auth.uid())
  WITH CHECK (broker_id = auth.uid());

-- Brokers can DELETE their own properties
DROP POLICY IF EXISTS "broker_delete_own_properties" ON properties;
CREATE POLICY "broker_delete_own_properties" ON properties
  FOR DELETE TO authenticated
  USING (broker_id = auth.uid());

-- Brokers can SELECT their own properties (in addition to the existing public SELECT)
DROP POLICY IF EXISTS "broker_select_own_properties" ON properties;
CREATE POLICY "broker_select_own_properties" ON properties
  FOR SELECT TO authenticated
  USING (broker_id = auth.uid() OR broker_id IS NULL);

-- ============================================================
-- Brokers can view leads on their properties
-- ============================================================

DROP POLICY IF EXISTS "broker_select_leads" ON leads;
CREATE POLICY "broker_select_leads" ON leads
  FOR SELECT TO authenticated
  USING (
    property_id IN (
      SELECT id FROM properties WHERE broker_id = auth.uid()
    )
  );

-- ============================================================
-- Create broker_profiles table
-- ============================================================

CREATE TABLE IF NOT EXISTS broker_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() UNIQUE,
  agency_name text,
  rera_number text,
  license_number text,
  phone text NOT NULL,
  alternate_phone text,
  email text,
  office_address text,
  service_areas text[],
  specializations text[],
  bio text,
  logo_url text,
  verified boolean DEFAULT false,
  rating numeric DEFAULT 0,
  total_listings integer DEFAULT 0,
  active_listings integer DEFAULT 0,
  total_leads integer DEFAULT 0,
  joined_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE broker_profiles ENABLE ROW LEVEL SECURITY;

-- Brokers can CRUD their own profile
DROP POLICY IF EXISTS "select_own_broker_profile" ON broker_profiles;
CREATE POLICY "select_own_broker_profile" ON broker_profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_broker_profile" ON broker_profiles;
CREATE POLICY "insert_own_broker_profile" ON broker_profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_broker_profile" ON broker_profiles;
CREATE POLICY "update_own_broker_profile" ON broker_profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_broker_profile" ON broker_profiles;
CREATE POLICY "delete_own_broker_profile" ON broker_profiles
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Admin can manage broker profiles
DROP POLICY IF EXISTS "admin_select_broker_profiles" ON broker_profiles;
CREATE POLICY "admin_select_broker_profiles" ON broker_profiles
  FOR SELECT TO authenticated
  USING (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

DROP POLICY IF EXISTS "admin_update_broker_profiles" ON broker_profiles;
CREATE POLICY "admin_update_broker_profiles" ON broker_profiles
  FOR UPDATE TO authenticated
  USING (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'))
  WITH CHECK (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));

DROP POLICY IF EXISTS "admin_delete_broker_profiles" ON broker_profiles;
CREATE POLICY "admin_delete_broker_profiles" ON broker_profiles
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' IN ('virasatrealty@gmail.com', 'avenuerealestate80@gmail.com'));
