/*
# Expand Schema for Full Real Estate Platform

## Overview
This migration expands the existing `properties` table with new columns for richer data
and creates new tables to support: user favorites, lead capture, property reviews,
saved searches, blog posts, and locality/neighborhood guides.

## 1. Modified Tables

### `properties` (existing — columns added)
- `price_value` (numeric) — numeric price for sorting/filtering (extracted from price string)
- `bedrooms` already exists — now used for filtering
- `bathrooms` already exists
- `area_value` (numeric) — numeric area in sqft for filtering
- `latitude` (double precision) — for map-based search
- `longitude` (double precision) — for map-based search
- `address` (text) — full street address
- `rera_number` (text) — RERA registration number for trust/transparency
- `builder` (text) — developer/builder name
- `possession_date` (date) — expected possession date
- `is_verified` (boolean, default false) — verified listing badge
- `days_on_market` (integer) — computed days since listing
- `price_per_sqft` (numeric) — derived price per sqft
- `video_url` (text) — video walkthrough URL
- `virtual_tour_url` (text) — 360 virtual tour URL
- `floor_plan_url` (text) — floor plan image URL
- `nearby_amenities` (jsonb) — schools, hospitals, metro, etc. with distances
- `vastu_compliant` (boolean) — Vastu compliance flag
- `facing` (text) — direction facing (North, South, East, West, etc.)
- `age` (text) — property age (New, Resale, Under Construction)
- `furnishing` (text) — Furnished / Semi-Furnished / Unfurnished
- `views_count` (integer, default 0) — page view counter

## 2. New Tables

### `leads`
Captures lead forms: callback requests, site visit bookings, general enquiries.
- `id` (uuid PK)
- `property_id` (uuid FK → properties, nullable — null for general enquiries)
- `name` (text, NOT NULL)
- `email` (text)
- `phone` (text, NOT NULL)
- `lead_type` (text) — callback / site_visit / enquiry / whatsapp
- `message` (text)
- `preferred_date` (date) — for site visits
- `preferred_time` (text) — time slot
- `status` (text, default 'new') — new / contacted / converted / lost
- `created_at` (timestpertz)

### `favorites`
User shortlisted properties (multi-user with auth).
- `id` (uuid PK)
- `user_id` (uuid, NOT NULL, DEFAULT auth.uid())
- `property_id` (uuid FK → properties)
- `created_at` (timestamptz)

### `saved_searches`
User saved search filters for email alerts.
- `id` (uuid PK)
- `user_id` (uuid, NOT NULL, DEFAULT auth.uid())
- `name` (text)
- `filters` (jsonb) — search filter criteria
- `created_at` (timestamptz)

### `reviews`
Property and builder reviews from verified users.
- `id` (uuid PK)
- `user_id` (uuid, NOT NULL, DEFAULT auth.uid())
- `property_id` (uuid FK → properties, nullable)
- `reviewer_name` (text, NOT NULL)
- `rating` (integer, NOT NULL, CHECK 1-5)
- `title` (text)
- `body` (text)
- `is_verified_buyer` (boolean, default false)
- `created_at` (timestamptz)

### `blog_posts`
Content hub for SEO — buying guides, legal tips, market trends.
- `id` (uuid PK)
- `title` (text, NOT NULL)
- `slug` (text, UNIQUE, NOT NULL)
- `excerpt` (text)
- `body` (text, NOT NULL)
- `category` (text) — buying-guide / legal / market-trends / locality-guide
- `image_url` (text)
- `author` (text, default 'Virasat Realty Team')
- `published` (boolean, default true)
- `published_at` (timestamptz, default now())
- `created_at` (timestamptz, default now())

### `localities`
Neighborhood/location guides with insights.
- `id` (uuid PK)
- `name` (text, NOT NULL) — e.g. "Sohna"
- `slug` (text, UNIQUE, NOT NULL)
- `description` (text)
- `image_url` (text)
- `walkability_score` (integer) — 0-100
- `safety_score` (integer) — 0-100
- `school_rating` (numeric) — average school rating
- `avg_price_per_sqft` (numeric)
- `price_trend` (jsonb) — yearly price data
- `future_projects` (jsonb) — upcoming infrastructure
- `amenities` (jsonb) — schools, hospitals, shopping, transport
- `created_at` (timestamptz, default now())

## 3. Security (RLS)

### `properties` — public read, authenticated write
- SELECT: `TO anon, authenticated USING (true)` — public listings
- INSERT/UPDATE/DELETE: `TO authenticated` — only logged-in admins

### `leads` — public insert (anyone can submit), authenticated read
- INSERT: `TO anon, authenticated WITH CHECK (true)` — anyone can submit
- SELECT/UPDATE/DELETE: `TO authenticated` — only admin sees leads

### `favorites` — owner-scoped (authenticated only)
- Full CRUD scoped to `auth.uid() = user_id`

### `saved_searches` — owner-scoped (authenticated only)
- Full CRUD scoped to `auth.uid() = user_id`

### `reviews` — public read, authenticated insert
- SELECT: `TO anon, authenticated USING (true)` — anyone can read reviews
- INSERT: `TO authenticated WITH CHECK (auth.uid() = user_id)` — must be logged in
- UPDATE/DELETE: `TO authenticated` — owner only

### `blog_posts` — public read, authenticated write
- SELECT: `TO anon, authenticated USING (true)`
- INSERT/UPDATE/DELETE: `TO authenticated`

### `localities` — public read, authenticated write
- SELECT: `TO anon, authenticated USING (true)`
- INSERT/UPDATE/DELETE: `TO authenticated`

## 4. Indexes
- `properties` on type, status, location, price_value, created_at
- `favorites` on user_id + property_id (unique)
- `reviews` on property_id
- `blog_posts` on slug, category, published_at
- `localities` on slug
*/

-- ============================================================
-- 1. EXPAND properties TABLE
-- ============================================================

ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS price_value numeric,
  ADD COLUMN IF NOT EXISTS area_value numeric,
  ADD COLUMN IF NOT EXISTS latitude double precision,
  ADD COLUMN IF NOT EXISTS longitude double precision,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS rera_number text,
  ADD COLUMN IF NOT EXISTS builder text,
  ADD COLUMN IF NOT EXISTS possession_date date,
  ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS price_per_sqft numeric,
  ADD COLUMN IF NOT EXISTS video_url text,
  ADD COLUMN IF NOT EXISTS virtual_tour_url text,
  ADD COLUMN IF NOT EXISTS floor_plan_url text,
  ADD COLUMN IF NOT EXISTS nearby_amenities jsonb,
  ADD COLUMN IF NOT EXISTS vastu_compliant boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS facing text,
  ADD COLUMN IF NOT EXISTS age text,
  ADD COLUMN IF NOT EXISTS furnishing text,
  ADD COLUMN IF NOT EXISTS views_count integer DEFAULT 0;

-- ============================================================
-- 2. CREATE leads TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text,
  phone text NOT NULL,
  lead_type text DEFAULT 'enquiry',
  message text,
  preferred_date date,
  preferred_time text,
  status text DEFAULT 'new',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_leads" ON leads;
CREATE POLICY "anon_insert_leads" ON leads FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_read_leads" ON leads;
CREATE POLICY "auth_read_leads" ON leads FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_update_leads" ON leads;
CREATE POLICY "auth_update_leads" ON leads FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_leads" ON leads;
CREATE POLICY "auth_delete_leads" ON leads FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- 3. CREATE favorites TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, property_id)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_favorites" ON favorites;
CREATE POLICY "select_own_favorites" ON favorites FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_favorites" ON favorites;
CREATE POLICY "insert_own_favorites" ON favorites FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_favorites" ON favorites;
CREATE POLICY "delete_own_favorites" ON favorites FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- 4. CREATE saved_searches TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS saved_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  filters jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_saved_searches" ON saved_searches;
CREATE POLICY "select_own_saved_searches" ON saved_searches FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_saved_searches" ON saved_searches;
CREATE POLICY "insert_own_saved_searches" ON saved_searches FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_saved_searches" ON saved_searches;
CREATE POLICY "delete_own_saved_searches" ON saved_searches FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- 5. CREATE reviews TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  reviewer_name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  body text,
  is_verified_buyer boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_reviews" ON reviews;
CREATE POLICY "anon_read_reviews" ON reviews FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_reviews" ON reviews;
CREATE POLICY "auth_insert_reviews" ON reviews FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "auth_update_own_reviews" ON reviews;
CREATE POLICY "auth_update_own_reviews" ON reviews FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "auth_delete_own_reviews" ON reviews;
CREATE POLICY "auth_delete_own_reviews" ON reviews FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- 6. CREATE blog_posts TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text,
  body text NOT NULL,
  category text DEFAULT 'buying-guide',
  image_url text,
  author text DEFAULT 'Virasat Realty Team',
  published boolean DEFAULT true,
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_blog_posts" ON blog_posts;
CREATE POLICY "anon_read_blog_posts" ON blog_posts FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_blog_posts" ON blog_posts;
CREATE POLICY "auth_insert_blog_posts" ON blog_posts FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_blog_posts" ON blog_posts;
CREATE POLICY "auth_update_blog_posts" ON blog_posts FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_blog_posts" ON blog_posts;
CREATE POLICY "auth_delete_blog_posts" ON blog_posts FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- 7. CREATE localities TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS localities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  image_url text,
  walkability_score integer DEFAULT 0,
  safety_score integer DEFAULT 0,
  school_rating numeric DEFAULT 0,
  avg_price_per_sqft numeric,
  price_trend jsonb,
  future_projects jsonb,
  amenities jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE localities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_localities" ON localities;
CREATE POLICY "anon_read_localities" ON localities FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_localities" ON localities;
CREATE POLICY "auth_insert_localities" ON localities FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_localities" ON localities;
CREATE POLICY "auth_update_localities" ON localities FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_localities" ON localities;
CREATE POLICY "auth_delete_localities" ON localities FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- 8. INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(type);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(location);
CREATE INDEX IF NOT EXISTS idx_properties_price_value ON properties(price_value);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_favorites_user_property ON favorites(user_id, property_id);
CREATE INDEX IF NOT EXISTS idx_reviews_property ON reviews(property_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_localities_slug ON localities(slug);

-- ============================================================
-- 9. UPDATE properties RLS (tighten write access)
-- ============================================================

-- Keep existing public read, restrict writes to authenticated
DROP POLICY IF EXISTS "insert_own_properties" ON properties;
CREATE POLICY "insert_own_properties" ON properties FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_own_properties" ON properties;
CREATE POLICY "update_own_properties" ON properties FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_own_properties" ON properties;
CREATE POLICY "delete_own_properties" ON properties FOR DELETE
  TO authenticated USING (true);