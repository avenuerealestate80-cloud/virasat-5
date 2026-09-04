/*
# Fix Broker RLS — Enforce Verification at Database Level

## Problem
The previous `broker_insert_properties` policy only checked `broker_id = auth.uid()`
without verifying that the broker's profile is verified. This allowed any authenticated
user to list properties without admin verification, bypassing the entire broker
onboarding flow.

## Changes

### 1. New function: `is_verified_broker()`
- SECURITY DEFINER function that checks whether the current authenticated user
  has a `broker_profiles` row with `verified = true`.
- Used in RLS policies to enforce verification at the database level.

### 2. Updated policies on `properties`
- **INSERT**: Brokers can only insert if `is_verified_broker()` returns true AND
  `broker_id = auth.uid()`. Admins can always insert.
- **UPDATE**: Brokers can only update their own properties AND must be verified.
  Admins can always update.

### 3. New policy on `leads`
- **UPDATE**: Brokers can update leads for their own properties (e.g., change status
  from "new" to "contacted"). Admins can always update.

### 4. Trigger: auto-update broker profile listing counts
- After INSERT/DELETE on properties, update `total_listings` and `active_listings`
  on the broker's profile automatically.
*/

-- =========================================================
-- 1. Create is_verified_broker() helper function
-- =========================================================
CREATE OR REPLACE FUNCTION public.is_verified_broker()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM broker_profiles
    WHERE user_id = auth.uid() AND verified = true
  );
$$;

-- =========================================================
-- 2. Fix properties INSERT policies
-- =========================================================
DROP POLICY IF EXISTS "broker_insert_properties" ON properties;
DROP POLICY IF EXISTS "admin_insert_properties" ON properties;

CREATE POLICY "admin_insert_properties" ON properties FOR INSERT
  TO authenticated WITH CHECK (is_admin());

CREATE POLICY "broker_insert_properties" ON properties FOR INSERT
  TO authenticated
  WITH CHECK (
    broker_id = auth.uid()
    AND is_verified_broker()
  );

-- =========================================================
-- 3. Fix properties UPDATE policies
-- =========================================================
DROP POLICY IF EXISTS "broker_update_own_properties" ON properties;
DROP POLICY IF EXISTS "admin_update_properties" ON properties;

CREATE POLICY "admin_update_properties" ON properties FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "broker_update_own_properties" ON properties FOR UPDATE
  TO authenticated
  USING (broker_id = auth.uid() AND is_verified_broker())
  WITH CHECK (broker_id = auth.uid() AND is_verified_broker());

-- =========================================================
-- 4. Add broker UPDATE policy on leads
-- =========================================================
DROP POLICY IF EXISTS "broker_update_leads" ON leads;

CREATE POLICY "broker_update_leads" ON leads FOR UPDATE
  TO authenticated
  USING (
    property_id IN (
      SELECT id FROM properties WHERE broker_id = auth.uid()
    )
  )
  WITH CHECK (
    property_id IN (
      SELECT id FROM properties WHERE broker_id = auth.uid()
    )
  );

-- =========================================================
-- 5. Trigger: auto-update broker listing counts
-- =========================================================
CREATE OR REPLACE FUNCTION public.update_broker_listing_counts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  broker_user_id uuid;
BEGIN
  broker_user_id := COALESCE(NEW.broker_id, OLD.broker_id);

  IF broker_user_id IS NOT NULL THEN
    UPDATE broker_profiles
    SET
      total_listings = (
        SELECT count(*) FROM properties WHERE broker_id = broker_user_id
      ),
      active_listings = (
        SELECT count(*) FROM properties
        WHERE broker_id = broker_user_id AND listing_status = 'active'
      ),
      updated_at = now()
    WHERE user_id = broker_user_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_broker_listing_counts ON properties;
CREATE TRIGGER trigger_update_broker_listing_counts
  AFTER INSERT OR UPDATE OR DELETE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_broker_listing_counts();
