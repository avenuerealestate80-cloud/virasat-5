/*
# Full Platform Feature Expansion

This migration adds comprehensive features to match and exceed Square Yards capabilities.

## 1. New Tables

### User Profiles (extends auth.users)
- `user_profiles` - Extended user data (phone, role, nri_status, preferences)

### Rental Properties
- `rentals` - Properties available for rent (apartments, houses, commercial)
- `pg_spaces` - Paying guest/co-living spaces with amenities

### Home Loans
- `bank_partners` - Partner banks and NBFCs for home loans
- `loan_applications` - User loan applications with status tracking

### Interior Design
- `interior_packages` - Interior design service packages
- `interior_bookings` - User bookings for interior services

### Legal Services
- `legal_services` - Available legal services (rent agreement, sale deed, etc.)
- `legal_requests` - User requests for legal services

### Property Management
- `property_management_subscriptions` - NRI landlord property management

### Property Valuations
- `property_valuations` - User-requested property valuations

### Documents
- `user_documents` - User uploaded documents (ID proof, income, etc.)

### Reviews & Ratings
- Already exists as `reviews` table

### Contact/Support
- `support_tickets` - User support tickets

## 2. Security
- RLS enabled on all tables
- Policies for authenticated user ownership
- Some tables readable by anon for public display (bank_partners, interior_packages, legal_services)

## 3. Key Features
- Users can be regular, NRI, or agent
- Full home loan application flow
- Interior design booking with quotes
- Legal services including rent agreement generation
- Property management for landlords
- Document upload and verification
*/

-- ═══════════════════════════════════════════════════════════════
-- USER PROFILES
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  phone text,
  alternate_phone text,
  role text NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller', 'agent', 'nri', 'landlord')),
  full_name text,
  city text,
  state text,
  country text DEFAULT 'India',
  preferred_localities text[] DEFAULT '{}',
  budget_min numeric,
  budget_max numeric,
  preferred_types text[] DEFAULT '{}',
  investment_timeline text,
  nri_country text,
  nri_passport_number text,
  kyc_status text DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'submitted', 'verified', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON user_profiles;
CREATE POLICY "select_own_profile" ON user_profiles FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_profile" ON user_profiles;
CREATE POLICY "insert_own_profile" ON user_profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_profile" ON user_profiles;
CREATE POLICY "update_own_profile" ON user_profiles FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════
-- RENTAL PROPERTIES
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS rentals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  location text NOT NULL,
  address text,
  latitude double precision,
  longitude double precision,
  property_type text NOT NULL CHECK (property_type IN ('apartment', 'house', 'villa', 'studio', 'shop', 'office', 'warehouse')),
  listing_type text NOT NULL DEFAULT 'rent' CHECK (listing_type IN ('rent', 'lease')),
  bedrooms integer,
  bathrooms integer,
  area_sqft numeric NOT NULL,
  furnish_status text DEFAULT 'unfurnished' CHECK (furnish_status IN ('unfurnished', 'semifurnished', 'furnished', 'fullyfurnished')),
  monthly_rent numeric NOT NULL,
  security_deposit numeric,
  maintenance_charges numeric,
  available_from date,
  minimum_lease_months integer DEFAULT 11,
  preferred_tenants text[] DEFAULT '{}',
  amenities text[] DEFAULT '{}',
  rules text[] DEFAULT '{}',
  image_url text,
  gallery text[] DEFAULT '{}',
  video_url text,
  virtual_tour_url text,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_name text NOT NULL,
  owner_phone text NOT NULL,
  verified boolean DEFAULT false,
  featured boolean DEFAULT false,
  status text DEFAULT 'available' CHECK (status IN ('available', 'rented', 'withdrawn')),
  views_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;

-- Public can view available rentals
DROP POLICY IF EXISTS "anon_view_rentals" ON rentals;
CREATE POLICY "anon_view_rentals" ON rentals FOR SELECT
  TO anon, authenticated USING (status = 'available');

-- Owners can manage their rentals
DROP POLICY IF EXISTS "owner_manage_rentals" ON rentals;
CREATE POLICY "owner_manage_rentals" ON rentals FOR ALL
  TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

-- ═══════════════════════════════════════════════════════════════
-- PG / CO-LIVING SPACES
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS pg_spaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  location text NOT NULL,
  address text,
  latitude double precision,
  longitude double precision,
  pg_type text NOT NULL CHECK (pg_type IN ('boys', 'girls', 'co-living', 'coliving')),
  room_types text[] NOT NULL DEFAULT '{"single", "double", "triple"}',
  starting_price numeric NOT NULL,
  price_includes text[] DEFAULT '{"rent", "meals", "wifi", "cleaning"}',
  meals_included boolean DEFAULT true,
  amenities text[] DEFAULT '{}',
  rules text[] DEFAULT '{}',
  image_url text,
  gallery text[] DEFAULT '{}',
  video_url text,
  manager_name text NOT NULL,
  manager_phone text NOT NULL,
  verified boolean DEFAULT false,
  featured boolean DEFAULT false,
  rating numeric DEFAULT 0,
  total_beds integer,
  available_beds integer,
  status text DEFAULT 'available' CHECK (status IN ('available', 'full', 'withdrawn')),
  views_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE pg_spaces ENABLE ROW LEVEL SECURITY;

-- Public can view available PG spaces
DROP POLICY IF EXISTS "anon_view_pg" ON pg_spaces;
CREATE POLICY "anon_view_pg" ON pg_spaces FOR SELECT
  TO anon, authenticated USING (status != 'withdrawn');

-- ═══════════════════════════════════════════════════════════════
-- BANK PARTNERS (for Home Loans)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS bank_partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text,
  bank_type text NOT NULL CHECK (bank_type IN ('bank', 'nbfc', 'hfc')),
  min_interest_rate numeric,
  max_interest_rate numeric,
  min_loan_amount numeric,
  max_loan_amount numeric,
  min_tenure_years integer,
  max_tenure_years integer,
  processing_fee_percent numeric,
  prepayment_charges text,
  special_schemes text[] DEFAULT '{}',
  eligibility_criteria jsonb DEFAULT '{}',
  featured boolean DEFAULT false,
  active boolean DEFAULT true,
  priority integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bank_partners ENABLE ROW LEVEL SECURITY;

-- Public can view active bank partners
DROP POLICY IF EXISTS "anon_view_banks" ON bank_partners;
CREATE POLICY "anon_view_banks" ON bank_partners FOR SELECT
  TO anon, authenticated USING (active = true);

-- ═══════════════════════════════════════════════════════════════
-- LOAN APPLICATIONS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS loan_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id uuid REFERENCES properties(id) ON DELETE SET NULL,
  bank_partner_id uuid REFERENCES bank_partners(id) ON DELETE SET NULL,
  application_type text NOT NULL CHECK (application_type IN ('home_loan', 'loan_against_property', 'balance_transfer', 'topup')),
  employment_type text NOT NULL CHECK (employment_type IN ('salaried', 'self_employed', 'business', 'nri')),
  monthly_income numeric NOT NULL,
  existing_emis numeric DEFAULT 0,
  desired_loan_amount numeric NOT NULL,
  tenure_years integer NOT NULL,
  property_value numeric,
  property_address text,
  property_type text,
  co_applicant_name text,
  co_applicant_income numeric,
  credit_score integer,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'documents_pending', 'under_review', 'approved', 'rejected', 'disbursed')),
  assigned_to text,
  remarks text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE loan_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_loans" ON loan_applications;
CREATE POLICY "select_own_loans" ON loan_applications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_loans" ON loan_applications;
CREATE POLICY "insert_own_loans" ON loan_applications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_loans" ON loan_applications;
CREATE POLICY "update_own_loans" ON loan_applications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════
-- INTERIOR DESIGN PACKAGES
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS interior_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text NOT NULL CHECK (category IN ('1bhk', '2bhk', '3bhk', '4bhk', 'villa', 'commercial')),
  starting_price numeric NOT NULL,
  price_per_sqft numeric,
  includes text[] NOT NULL DEFAULT '{}',
  highlights text[] DEFAULT '{}',
  timeline_weeks integer,
  image_url text,
  gallery text[] DEFAULT '{}',
  featured boolean DEFAULT false,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE interior_packages ENABLE ROW LEVEL SECURITY;

-- Public can view active interior packages
DROP POLICY IF EXISTS "anon_view_interiors" ON interior_packages;
CREATE POLICY "anon_view_interiors" ON interior_packages FOR SELECT
  TO anon, authenticated USING (active = true);

-- ═══════════════════════════════════════════════════════════════
-- INTERIOR BOOKINGS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS interior_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package_id uuid NOT NULL REFERENCES interior_packages(id) ON DELETE SET NULL,
  property_id uuid REFERENCES properties(id) ON DELETE SET NULL,
  property_address text NOT NULL,
  property_type text NOT NULL,
  area_sqft numeric NOT NULL,
  design_style text,
  color_preference text,
  budget_range text,
  preferred_start_date date,
  additional_requirements text,
  contact_name text NOT NULL,
  contact_phone text NOT NULL,
  contact_email text,
  status text DEFAULT 'requested' CHECK (status IN ('requested', 'quoted', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  quoted_price numeric,
  final_price numeric,
  assigned_designer text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE interior_bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_interiors" ON interior_bookings;
CREATE POLICY "select_own_interiors" ON interior_bookings FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_interiors" ON interior_bookings;
CREATE POLICY "insert_own_interiors" ON interior_bookings FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_interiors" ON interior_bookings;
CREATE POLICY "update_own_interiors" ON interior_bookings FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════
-- LEGAL SERVICES
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS legal_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  service_type text NOT NULL CHECK (service_type IN (
    'rent_agreement', 'sale_agreement', 'sale_deed', 'power_of_attorney',
    'will_preparation', 'title_verification', 'property_registration',
    'encumbrance_certificate', 'legal_opinion', 'rera_complaint'
  )),
  base_price numeric NOT NULL,
  includes text[] DEFAULT '{}',
  documents_required text[] DEFAULT '{}',
  timeline_days integer,
  active boolean DEFAULT true,
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE legal_services ENABLE ROW LEVEL SECURITY;

-- Public can view active legal services
DROP POLICY IF EXISTS "anon_view_legal" ON legal_services;
CREATE POLICY "anon_view_legal" ON legal_services FOR SELECT
  TO anon, authenticated USING (active = true);

-- ═══════════════════════════════════════════════════════════════
-- LEGAL REQUESTS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS legal_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES legal_services(id) ON DELETE SET NULL,
  property_id uuid REFERENCES properties(id) ON DELETE SET NULL,
  property_address text,
  parties_involved jsonb DEFAULT '[]',
  additional_details text,
  contact_name text NOT NULL,
  contact_phone text NOT NULL,
  contact_email text,
  status text DEFAULT 'requested' CHECK (status IN ('requested', 'documents_pending', 'in_progress', 'completed', 'cancelled')),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  assigned_advocate text,
  document_url text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE legal_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_legal_requests" ON legal_requests;
CREATE POLICY "select_own_legal_requests" ON legal_requests FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_legal_requests" ON legal_requests;
CREATE POLICY "insert_own_legal_requests" ON legal_requests FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_legal_requests" ON legal_requests;
CREATE POLICY "update_own_legal_requests" ON legal_requests FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════
-- PROPERTY MANAGEMENT (for NRI landlords)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS property_management_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id uuid REFERENCES properties(id) ON DELETE SET NULL,
  property_address text NOT NULL,
  service_plan text NOT NULL CHECK (service_plan IN ('basic', 'standard', 'premium')),
  monthly_fee numeric NOT NULL,
  services_included text[] NOT NULL DEFAULT '{}',
  tenant_details jsonb,
  rent_collection_day integer DEFAULT 1,
  maintenance_responsibility text DEFAULT 'owner',
  start_date date NOT NULL,
  end_date date,
  status text DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE property_management_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_pm" ON property_management_subscriptions;
CREATE POLICY "select_own_pm" ON property_management_subscriptions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_pm" ON property_management_subscriptions;
CREATE POLICY "insert_own_pm" ON property_management_subscriptions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_pm" ON property_management_subscriptions;
CREATE POLICY "update_own_pm" ON property_management_subscriptions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════
-- PROPERTY VALUATIONS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS property_valuations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id uuid REFERENCES properties(id) ON DELETE SET NULL,
  property_address text NOT NULL,
  property_type text NOT NULL,
  area_sqft numeric NOT NULL,
  bedrooms integer,
  floor_number integer,
  total_floors integer,
  age_of_property integer,
  amenities text[] DEFAULT '{}',
  locality text,
  nearby_landmarks text[] DEFAULT '{}',
  expected_value numeric,
  estimated_market_value numeric,
  rental_yield_percent numeric,
  appreciation_trend text,
  comparable_properties jsonb DEFAULT '[]',
  report_url text,
  status text DEFAULT 'requested' CHECK (status IN ('requested', 'in_progress', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE property_valuations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_valuations" ON property_valuations;
CREATE POLICY "select_own_valuations" ON property_valuations FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_valuations" ON property_valuations;
CREATE POLICY "insert_own_valuations" ON property_valuations FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_valuations" ON property_valuations;
CREATE POLICY "update_own_valuations" ON property_valuations FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════
-- USER DOCUMENTS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS user_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type text NOT NULL CHECK (document_type IN (
    'pan_card', 'aadhaar_card', 'passport', 'voter_id', 'driving_license',
    'salary_slip', 'bank_statement', 'itr', 'form_16', 'business_registration',
    'property_deed', 'sale_agreement', 'other'
  )),
  document_name text NOT NULL,
  document_url text NOT NULL,
  verified boolean DEFAULT false,
  verification_notes text,
  uploaded_at timestamptz DEFAULT now(),
  verified_at timestamptz
);

ALTER TABLE user_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_docs" ON user_documents;
CREATE POLICY "select_own_docs" ON user_documents FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_docs" ON user_documents;
CREATE POLICY "insert_own_docs" ON user_documents FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_docs" ON user_documents;
CREATE POLICY "delete_own_docs" ON user_documents FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════
-- SUPPORT TICKETS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  category text NOT NULL CHECK (category IN ('property', 'loan', 'interior', 'legal', 'technical', 'other')),
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  description text NOT NULL,
  status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  assigned_to text,
  resolution text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_tickets" ON support_tickets;
CREATE POLICY "select_own_tickets" ON support_tickets FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_tickets" ON support_tickets;
CREATE POLICY "insert_own_tickets" ON support_tickets FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════
-- RENTAL INQUIRIES
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS rental_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rental_id uuid NOT NULL REFERENCES rentals(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  message text,
  preferred_move_in_date date,
  status text DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'visited', 'negotiating', 'closed')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE rental_inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "insert_rental_inquiries" ON rental_inquiries;
CREATE POLICY "insert_rental_inquiries" ON rental_inquiries FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════
-- PG INQUIRIES
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS pg_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pg_id uuid NOT NULL REFERENCES pg_spaces(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  message text,
  preferred_room_type text,
  preferred_move_in_date date,
  status text DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'visited', 'confirmed', 'closed')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pg_inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "insert_pg_inquiries" ON pg_inquiries;
CREATE POLICY "insert_pg_inquiries" ON pg_inquiries FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════
-- POPULATE INITIAL DATA
-- ═══════════════════════════════════════════════════════════════

-- Insert bank partners
INSERT INTO bank_partners (name, bank_type, min_interest_rate, max_interest_rate, min_loan_amount, max_loan_amount, min_tenure_years, max_tenure_years, processing_fee_percent, special_schemes, featured, priority) VALUES
('HDFC Home Loans', 'hfc', 8.40, 9.50, 500000, 500000000, 5, 30, 0.50, ARRAY['NRI Special', 'Women Borrowers', 'Balance Transfer'], true, 1),
('SBI Home Loans', 'bank', 8.40, 9.65, 500000, 500000000, 5, 30, 0.35, ARRAY['PMAY', 'NRI', 'Defense Personnel'], true, 2),
('ICICI Home Loans', 'hfc', 8.45, 9.55, 500000, 500000000, 5, 30, 0.50, ARRAY['Instant Approval', 'Pre-Approved Offers'], true, 3),
('LIC Housing Finance', 'hfc', 8.50, 9.75, 500000, 500000000, 5, 30, 0.50, ARRAY['Senior Citizens', 'Women'], false, 4),
('Axis Bank Home Loans', 'bank', 8.55, 9.60, 500000, 500000000, 5, 30, 0.50, ARRAY['Quick Processing', 'Digital KYC'], false, 5),
('Bank of Baroda', 'bank', 8.45, 9.50, 500000, 500000000, 5, 30, 0.25, ARRAY['PSU Benefits', 'Government Employees'], false, 6);

-- Insert interior packages
INSERT INTO interior_packages (name, description, category, starting_price, price_per_sqft, includes, highlights, timeline_weeks, featured) VALUES
('Essential', 'Budget-friendly design with quality materials and essential furniture', '2bhk', 350000, 800, ARRAY['Modular Kitchen', 'Wardrobes', 'False Ceiling (Living)', 'Wall Paint', 'Basic Lighting'], ARRAY['Perfect for first-time buyers', 'Quick turnaround', 'Quality materials'], 6, true),
('Premium', 'Modern design with premium finishes and smart home features', '2bhk', 650000, 1500, ARRAY['Premium Modular Kitchen', 'Bedroom Wardrobes', 'Full False Ceiling', 'Designer Wall Treatment', 'Smart Lighting', 'AC Concealing', 'Bathroom Fittings'], ARRAY['Premium materials', 'Smart home ready', 'Personalized design'], 8, true),
('Luxury', 'Bespoke luxury interiors with imported materials and automation', '3bhk', 1500000, 2500, ARRAY[' Imported Kitchen', 'Walk-in Wardrobes', 'Designer False Ceiling', 'Wall Paneling', 'Home Automation', 'Premium Flooring', 'Luxury Bath fittings', 'Home Theater Setup'], ARRAY['Bespoke design', 'Imported materials', 'Full automation', 'Dedicated designer'], 12, true);

-- Insert legal services
INSERT INTO legal_services (name, description, service_type, base_price, includes, documents_required, timeline_days, featured) VALUES
('Rent Agreement', 'Comprehensive rental agreement drafted by legal experts with all standard clauses', 'rent_agreement', 1499, ARRAY['Agreement Draft', 'E-Stamp Paper', 'Notarization', 'Digital Signing'], ARRAY['Property Tax Receipt', 'ID Proof of Owner', 'ID Proof of Tenant'], 3, true),
('Sale Agreement', 'Drafting of sale agreement with all necessary clauses and terms', 'sale_agreement', 4999, ARRAY['Agreement Draft', 'Legal Review', 'Clause Customization', 'Witness Coordination'], ARRAY['Property Documents', 'ID Proofs', 'NOC if applicable'], 5, true),
('Sale Deed Registration', 'Complete registration support including document preparation and registrar visit coordination', 'sale_deed', 15999, ARRAY['Sale Deed Draft', 'Stamp Duty Calculation', 'Document Preparation', 'Registration Support', 'Sub-Registrar Coordination'], ARRAY['Property Documents', 'ID Proofs', 'Address Proof', ' Photos'], 7, true),
('Title Verification', 'Thorough title search and verification to ensure clear property title', 'title_verification', 9999, ARRAY['30 Year Title Search', 'Encumbrance Certificate', 'Legal Opinion Report', 'Risk Assessment'], ARRAY['Property Documents', 'Sale Deed History'], 5, false),
('Power of Attorney', 'Drafting and registration of General/Special Power of Attorney', 'power_of_attorney', 3499, ARRAY['POA Draft', 'Legal Advice', 'Registration Support'], ARRAY['ID Proofs', 'Property Documents', 'Purpose Statement'], 3, false);

-- Update interior packages with images
UPDATE interior_packages SET 
  image_url = 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800'
WHERE name = 'Essential';

UPDATE interior_packages SET 
  image_url = 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800'
WHERE name = 'Premium';

UPDATE interior_packages SET 
  image_url = 'https://images.pexels.com/photos/2089698/pexels-photo-2089698.jpeg?auto=compress&cs=tinysrgb&w=800'
WHERE name = 'Luxury';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_rentals_location ON rentals(location);
CREATE INDEX IF NOT EXISTS idx_rentals_status ON rentals(status);
CREATE INDEX IF NOT EXISTS idx_rentals_price ON rentals(monthly_rent);
CREATE INDEX IF NOT EXISTS idx_pg_spaces_type ON pg_spaces(pg_type);
CREATE INDEX IF NOT EXISTS idx_pg_spaces_status ON pg_spaces(status);
CREATE INDEX IF NOT EXISTS idx_loan_applications_user ON loan_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_loan_applications_status ON loan_applications(status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_documents_user ON user_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_property_valuations_user ON property_valuations(user_id);