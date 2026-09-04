
-- Newsletter subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text,
  subscribed_at timestamptz DEFAULT now(),
  active boolean DEFAULT true
);
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "insert_newsletter" ON newsletter_subscribers FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "select_newsletter" ON newsletter_subscribers FOR SELECT TO authenticated USING (true);
CREATE POLICY "update_newsletter" ON newsletter_subscribers FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_newsletter" ON newsletter_subscribers FOR DELETE TO authenticated USING (true);

-- Testimonials (admin-manageable)
CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  designation text,
  photo_url text,
  rating integer DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  body text NOT NULL,
  location text,
  property_type text,
  is_featured boolean DEFAULT false,
  active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_testimonials" ON testimonials FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "insert_testimonials" ON testimonials FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_testimonials" ON testimonials FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_testimonials" ON testimonials FOR DELETE TO authenticated USING (true);

-- Insert sample testimonials
INSERT INTO testimonials (name, designation, photo_url, rating, body, location, property_type, is_featured, sort_order) VALUES
('Ravi Sharma','Software Engineer, Gurgaon','https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200',5,'Virasat Realty helped us find our dream home in Sohna in just 3 weeks. Their team was transparent and guided us through every legal step. Highly recommend!','Sector 33, Sohna','2 BHK Apartment',true,1),
('Priya Agarwal','Teacher, Delhi','https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200',5,'Excellent service. The team at Virasat understood exactly what we wanted. We got a Vastu-compliant flat within our budget. The RERA verification process was seamless.','Sohna Road','3 BHK Flat',true,2),
('Amit & Sunita Verma','Business Owners, Faridabad','https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200',5,'We were NRIs looking to invest in Sohna. Virasat handled everything remotely — site visits, paperwork, registration. Top-notch professional team.','IMT Sohna','Plot',true,3),
('Deepak Mishra','IT Manager, Noida','https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=200',4,'Great support throughout the loan process. They connected us with the right bank and we got approval in 10 days. Very happy with the experience.','Golf Course Ext.','2 BHK',false,4),
('Neha Kapoor','Doctor, Gurgaon','https://images.pexels.com/photos/712513/pexels-photo-712513.jpeg?auto=compress&cs=tinysrgb&w=200',5,'The locality guides on their website were incredibly helpful to shortlist the right sector. And their agent was always available on WhatsApp. 5 stars!','Sohna Sector 5','Villa Plot',false,5);

-- Property enquiry counts
ALTER TABLE properties ADD COLUMN IF NOT EXISTS enquiry_count integer DEFAULT 0;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS weekly_enquiries integer DEFAULT 0;

-- Update some properties with realistic enquiry counts
UPDATE properties SET enquiry_count = floor(random()*80+10)::int, weekly_enquiries = floor(random()*15+3)::int WHERE enquiry_count = 0;

-- New launch alerts opt-in
CREATE TABLE IF NOT EXISTS launch_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  preferred_type text,
  budget_range text,
  subscribed_at timestamptz DEFAULT now(),
  active boolean DEFAULT true
);
ALTER TABLE launch_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "insert_launch_alerts" ON launch_alerts FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "select_launch_alerts" ON launch_alerts FOR SELECT TO authenticated USING (true);
CREATE POLICY "update_launch_alerts" ON launch_alerts FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_launch_alerts" ON launch_alerts FOR DELETE TO authenticated USING (true);

-- Market report data
CREATE TABLE IF NOT EXISTS market_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quarter text NOT NULL,
  year integer NOT NULL,
  locality text NOT NULL,
  avg_price_sqft integer,
  price_change_pct numeric,
  total_transactions integer,
  new_launches integer,
  absorption_rate numeric,
  top_builder text,
  notes text,
  published boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE market_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_market_reports" ON market_reports FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "insert_market_reports" ON market_reports FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_market_reports" ON market_reports FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_market_reports" ON market_reports FOR DELETE TO authenticated USING (true);

-- Insert historical market data for Sohna
INSERT INTO market_reports (quarter, year, locality, avg_price_sqft, price_change_pct, total_transactions, new_launches, absorption_rate, top_builder) VALUES
('Q1',2024,'Sohna Sector 33',4200,3.5,142,3,78.2,'Signature Global'),
('Q2',2024,'Sohna Sector 33',4350,3.6,158,2,81.0,'Signature Global'),
('Q3',2024,'Sohna Sector 33',4480,3.0,167,4,82.5,'Central Park'),
('Q4',2024,'Sohna Sector 33',4650,3.8,175,2,84.1,'Signature Global'),
('Q1',2025,'Sohna Sector 33',4820,3.7,182,5,85.3,'Godrej'),
('Q2',2025,'Sohna Sector 33',5010,3.9,195,3,86.7,'Signature Global'),
('Q1',2024,'Sohna Road',5100,4.2,210,6,79.5,'Central Park'),
('Q2',2024,'Sohna Road',5320,4.3,225,4,80.8,'Emaar'),
('Q3',2024,'Sohna Road',5510,3.6,238,5,82.1,'Central Park'),
('Q4',2024,'Sohna Road',5740,4.2,252,3,83.4,'Emaar'),
('Q1',2025,'Sohna Road',5980,4.2,268,7,84.9,'Signature Global'),
('Q2',2025,'Sohna Road',6210,3.9,280,4,85.8,'Central Park'),
('Q1',2024,'IMT Sohna',3800,5.1,98,2,72.3,'Vatika'),
('Q2',2024,'IMT Sohna',3990,5.0,112,3,74.5,'Signature Global'),
('Q3',2024,'IMT Sohna',4180,4.8,125,2,76.1,'Vatika'),
('Q4',2024,'IMT Sohna',4380,4.8,138,4,77.8,'Vatika'),
('Q1',2025,'IMT Sohna',4590,4.8,152,3,79.2,'Signature Global'),
('Q2',2025,'IMT Sohna',4820,5.0,168,5,80.7,'Vatika'),
('Q1',2024,'Golf Course Ext.',7200,2.8,185,4,88.5,'DLF'),
('Q2',2024,'Golf Course Ext.',7380,2.5,195,3,89.2,'DLF'),
('Q3',2024,'Golf Course Ext.',7560,2.4,208,5,89.8,'Emaar'),
('Q4',2024,'Golf Course Ext.',7750,2.5,218,2,90.1,'DLF'),
('Q1',2025,'Golf Course Ext.',7940,2.5,229,6,90.5,'Emaar'),
('Q2',2025,'Golf Course Ext.',8150,2.6,242,4,91.0,'DLF');

-- Site visit time slots (for scheduled bookings)
CREATE TABLE IF NOT EXISTS site_visit_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id text,
  property_title text,
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  visit_date date NOT NULL,
  visit_time text NOT NULL,
  message text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE site_visit_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "insert_site_visits" ON site_visit_bookings FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "select_site_visits" ON site_visit_bookings FOR SELECT TO authenticated USING (true);
CREATE POLICY "update_site_visits" ON site_visit_bookings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_site_visits" ON site_visit_bookings FOR DELETE TO authenticated USING (true);
