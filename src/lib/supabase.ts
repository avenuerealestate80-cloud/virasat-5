import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Property {
  id: string;
  title: string;
  location: string;
  description: string;
  price: string;
  type: string;
  status: string;
  area: string;
  bedrooms: number | null;
  bathrooms: number | null;
  image_url: string;
  gallery: string[] | null;
  features: string[] | null;
  amenities: string[] | null;
  created_at: string;
  price_value: number | null;
  area_value: number | null;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  rera_number: string | null;
  builder: string | null;
  possession_date: string | null;
  is_verified: boolean;
  price_per_sqft: number | null;
  video_url: string | null;
  virtual_tour_url: string | null;
  floor_plan_url: string | null;
  nearby_amenities: Record<string, any> | null;
  vastu_compliant: boolean;
  facing: string | null;
  age: string | null;
  furnishing: string | null;
  views_count: number;
  enquiry_count: number;
  weekly_enquiries: number;
  broker_id: string | null;
  broker_name: string | null;
  broker_phone: string | null;
  broker_email: string | null;
  broker_agency: string | null;
  broker_verified: boolean;
  listing_status: string | null;
}

export interface Lead {
  id: string;
  property_id: string | null;
  name: string;
  email: string | null;
  phone: string;
  lead_type: string;
  message: string | null;
  preferred_date: string | null;
  preferred_time: string | null;
  status: string;
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  property_id: string;
  created_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  property_id: string | null;
  reviewer_name: string;
  rating: number;
  title: string | null;
  body: string | null;
  is_verified_buyer: boolean;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  category: string;
  image_url: string | null;
  author: string;
  published: boolean;
  published_at: string;
  created_at: string;
}

export interface Locality {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  walkability_score: number;
  safety_score: number;
  school_rating: number;
  avg_price_per_sqft: number | null;
  price_trend: Record<string, number> | null;
  future_projects: any[] | null;
  amenities: Record<string, any> | null;
  created_at: string;
}

export interface SavedSearch {
  id: string;
  user_id: string;
  name: string | null;
  filters: Record<string, any> | null;
  created_at: string;
}

// User Profile
export interface UserProfile {
  id: string;
  user_id: string;
  phone: string | null;
  alternate_phone: string | null;
  role: 'buyer' | 'seller' | 'agent' | 'nri' | 'landlord';
  full_name: string | null;
  city: string | null;
  state: string | null;
  country: string;
  preferred_localities: string[];
  budget_min: number | null;
  budget_max: number | null;
  preferred_types: string[];
  investment_timeline: string | null;
  nri_country: string | null;
  nri_passport_number: string | null;
  kyc_status: 'pending' | 'submitted' | 'verified' | 'rejected';
  bio: string | null;
  created_at: string;
  updated_at: string;
}

// Rental Properties
export interface Rental {
  id: string;
  title: string;
  description: string | null;
  location: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  property_type: 'apartment' | 'house' | 'villa' | 'studio' | 'shop' | 'office' | 'warehouse';
  listing_type: 'rent' | 'lease';
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqft: number;
  furnish_status: 'unfurnished' | 'semifurnished' | 'furnished' | 'fullyfurnished';
  monthly_rent: number;
  security_deposit: number | null;
  maintenance_charges: number | null;
  available_from: string | null;
  minimum_lease_months: number;
  preferred_tenants: string[];
  amenities: string[];
  rules: string[];
  image_url: string | null;
  gallery: string[];
  video_url: string | null;
  virtual_tour_url: string | null;
  owner_id: string;
  owner_name: string;
  owner_phone: string;
  verified: boolean;
  featured: boolean;
  status: 'available' | 'rented' | 'withdrawn';
  views_count: number;
  created_at: string;
  updated_at: string;
}

// PG Spaces
export interface PGSpace {
  id: string;
  title: string;
  description: string | null;
  location: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  pg_type: 'boys' | 'girls' | 'co-living' | 'coliving';
  room_types: string[];
  starting_price: number;
  price_includes: string[];
  meals_included: boolean;
  amenities: string[];
  rules: string[];
  image_url: string | null;
  gallery: string[];
  video_url: string | null;
  manager_name: string;
  manager_phone: string;
  verified: boolean;
  featured: boolean;
  rating: number;
  total_beds: number | null;
  available_beds: number | null;
  status: 'available' | 'full' | 'withdrawn';
  views_count: number;
  created_at: string;
  updated_at: string;
}

// Bank Partners
export interface BankPartner {
  id: string;
  name: string;
  logo_url: string | null;
  bank_type: 'bank' | 'nbfc' | 'hfc';
  min_interest_rate: number | null;
  max_interest_rate: number | null;
  min_loan_amount: number | null;
  max_loan_amount: number | null;
  min_tenure_years: number | null;
  max_tenure_years: number | null;
  processing_fee_percent: number | null;
  prepayment_charges: string | null;
  special_schemes: string[];
  eligibility_criteria: Record<string, any> | null;
  featured: boolean;
  active: boolean;
  priority: number;
  created_at: string;
}

// Loan Applications
export interface LoanApplication {
  id: string;
  user_id: string;
  property_id: string | null;
  bank_partner_id: string | null;
  application_type: 'home_loan' | 'loan_against_property' | 'balance_transfer' | 'topup';
  employment_type: 'salaried' | 'self_employed' | 'business' | 'nri';
  monthly_income: number;
  existing_emis: number;
  desired_loan_amount: number;
  tenure_years: number;
  property_value: number | null;
  property_address: string | null;
  property_type: string | null;
  co_applicant_name: string | null;
  co_applicant_income: number | null;
  credit_score: number | null;
  status: 'draft' | 'submitted' | 'documents_pending' | 'under_review' | 'approved' | 'rejected' | 'disbursed';
  assigned_to: string | null;
  remarks: string | null;
  created_at: string;
  updated_at: string;
}

// Interior Packages
export interface InteriorPackage {
  id: string;
  name: string;
  description: string | null;
  category: '1bhk' | '2bhk' | '3bhk' | '4bhk' | 'villa' | 'commercial';
  starting_price: number;
  price_per_sqft: number | null;
  includes: string[];
  highlights: string[];
  timeline_weeks: number | null;
  image_url: string | null;
  gallery: string[];
  featured: boolean;
  active: boolean;
  created_at: string;
}

// Interior Bookings
export interface InteriorBooking {
  id: string;
  user_id: string;
  package_id: string;
  property_id: string | null;
  property_address: string;
  property_type: string;
  area_sqft: number;
  design_style: string | null;
  color_preference: string | null;
  budget_range: string | null;
  preferred_start_date: string | null;
  additional_requirements: string | null;
  contact_name: string;
  contact_phone: string;
  contact_email: string | null;
  status: 'requested' | 'quoted' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  quoted_price: number | null;
  final_price: number | null;
  assigned_designer: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Legal Services
export interface LegalService {
  id: string;
  name: string;
  description: string | null;
  service_type: 'rent_agreement' | 'sale_agreement' | 'sale_deed' | 'power_of_attorney' | 'will_preparation' | 'title_verification' | 'property_registration' | 'encumbrance_certificate' | 'legal_opinion' | 'rera_complaint';
  base_price: number;
  includes: string[];
  documents_required: string[];
  timeline_days: number | null;
  active: boolean;
  featured: boolean;
  created_at: string;
}

// Legal Requests
export interface LegalRequest {
  id: string;
  user_id: string;
  service_id: string;
  property_id: string | null;
  property_address: string | null;
  parties_involved: Record<string, any>[];
  additional_details: string | null;
  contact_name: string;
  contact_phone: string;
  contact_email: string | null;
  status: 'requested' | 'documents_pending' | 'in_progress' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'refunded';
  assigned_advocate: string | null;
  document_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Property Management Subscriptions
export interface PropertyManagementSubscription {
  id: string;
  user_id: string;
  property_id: string | null;
  property_address: string;
  service_plan: 'basic' | 'standard' | 'premium';
  monthly_fee: number;
  services_included: string[];
  tenant_details: Record<string, any> | null;
  rent_collection_day: number;
  maintenance_responsibility: string;
  start_date: string;
  end_date: string | null;
  status: 'active' | 'paused' | 'cancelled';
  created_at: string;
  updated_at: string;
}

// Property Valuations
export interface PropertyValuation {
  id: string;
  user_id: string;
  property_id: string | null;
  property_address: string;
  property_type: string;
  area_sqft: number;
  bedrooms: number | null;
  floor_number: number | null;
  total_floors: number | null;
  age_of_property: number | null;
  amenities: string[];
  locality: string | null;
  nearby_landmarks: string[];
  expected_value: number | null;
  estimated_market_value: number | null;
  rental_yield_percent: number | null;
  appreciation_trend: string | null;
  comparable_properties: Record<string, any>[];
  report_url: string | null;
  status: 'requested' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
}

// User Documents
export interface UserDocument {
  id: string;
  user_id: string;
  document_type: 'pan_card' | 'aadhaar_card' | 'passport' | 'voter_id' | 'driving_license' | 'salary_slip' | 'bank_statement' | 'itr' | 'form_16' | 'business_registration' | 'property_deed' | 'sale_agreement' | 'other';
  document_name: string;
  document_url: string;
  verified: boolean;
  verification_notes: string | null;
  uploaded_at: string;
  verified_at: string | null;
}

// Support Tickets
export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  category: 'property' | 'loan' | 'interior' | 'legal' | 'technical' | 'other';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assigned_to: string | null;
  resolution: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

// Broker Profile
export interface BrokerProfile {
  id: string;
  user_id: string;
  agency_name: string | null;
  rera_number: string | null;
  license_number: string | null;
  phone: string;
  alternate_phone: string | null;
  email: string | null;
  office_address: string | null;
  service_areas: string[];
  specializations: string[];
  bio: string | null;
  logo_url: string | null;
  verified: boolean;
  rating: number;
  total_listings: number;
  active_listings: number;
  total_leads: number;
  joined_at: string;
  created_at: string;
  updated_at: string;
}

// Testimonial
export interface Testimonial {
  id: string;
  name: string;
  designation: string | null;
  photo_url: string | null;
  rating: number;
  body: string;
  location: string | null;
  property_type: string | null;
  is_featured: boolean;
  active: boolean;
  sort_order: number;
  created_at: string;
}

// Newsletter Subscriber
export interface NewsletterSubscriber {
  id: string;
  email: string;
  name: string | null;
  subscribed_at: string;
  active: boolean;
}

// Launch Alert
export interface LaunchAlert {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  preferred_type: string | null;
  budget_range: string | null;
  subscribed_at: string;
  active: boolean;
  notified: boolean;
  property_id: string | null;
}

// Market Report
export interface MarketReport {
  id: string;
  quarter: string;
  year: number;
  locality: string;
  avg_price_sqft: number | null;
  price_change_pct: number | null;
  total_transactions: number | null;
  new_launches: number | null;
  absorption_rate: number | null;
  top_builder: string | null;
  notes: string | null;
  published: boolean;
  created_at: string;
}

// Site Visit Booking
export interface SiteVisitBooking {
  id: string;
  property_id: string | null;
  property_title: string | null;
  name: string;
  phone: string;
  email: string | null;
  visit_date: string;
  visit_time: string;
  message: string | null;
  status: string;
  created_at: string;
}

// Rental Inquiry
export interface RentalInquiry {
  id: string;
  rental_id: string;
  user_id: string | null;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  preferred_move_in_date: string | null;
  status: string;
  created_at: string;
}

// PG Inquiry
export interface PGInquiry {
  id: string;
  pg_id: string;
  user_id: string | null;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  preferred_room_type: string | null;
  preferred_move_in_date: string | null;
  status: string;
  created_at: string;
}
