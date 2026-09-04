/*
# Create properties table for Virasat Realty

1. New Tables
- `properties`
  - `id` (uuid, primary key)
  - `title` (text, not null) - property/project name
  - `location` (text, not null) - e.g. "Sonepat", "Sonipat", "Kundli"
  - `description` (text) - detailed description
  - `price` (text) - price range or starting price
  - `type` (text) - residential, commercial, plot, villa
  - `status` (text) - available, sold out, coming soon
  - `area` (text) - plot/flat area
  - `bedrooms` (integer) - number of bedrooms
  - `bathrooms` (integer) - number of bathrooms
  - `image_url` (text) - main image
  - `gallery` (text[]) - array of image URLs
  - `features` (text[]) - amenities/features
  - `created_at` (timestamptz)

2. Security
- Enable RLS on `properties`.
- Allow public read access (no auth needed for a realty website).
*/

CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  location text NOT NULL,
  description text,
  price text,
  type text,
  status text DEFAULT 'available',
  area text,
  bedrooms integer,
  bathrooms integer,
  image_url text,
  gallery text[],
  features text[],
  created_at timestamptz DEFAULT now()
);

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_properties" ON properties;
CREATE POLICY "anon_select_properties" ON properties FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_properties" ON properties;
CREATE POLICY "anon_insert_properties" ON properties FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_properties" ON properties;
CREATE POLICY "anon_update_properties" ON properties FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_properties" ON properties;
CREATE POLICY "anon_delete_properties" ON properties FOR DELETE
  TO anon, authenticated USING (true);
