import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Bed, Bath, MapPin, Maximize, Loader2, Plus, X, Edit3, Trash2,
  Building2, Phone, Mail, Briefcase, Eye, MessageSquare,
  CheckCircle2, Clock, AlertCircle, Home, Settings, Award,
  Save, ChevronRight, ShieldCheck, LogOut,
  Calendar,
} from 'lucide-react';
import { supabase, type Property, type BrokerProfile, type Lead } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { useAuthUI } from '../lib/authUI';

type TabType = 'overview' | 'listings' | 'leads' | 'profile';

const FALLBACK_IMG = 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800';

function formatCurrency(value: number): string {
  if (value >= 10000000) return `Rs ${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `Rs ${(value / 100000).toFixed(2)} L`;
  return `Rs ${value.toLocaleString('en-IN')}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const PROPERTY_TYPES = ['Apartment', 'Villa', 'Independent House', 'Plot', 'Commercial', 'Penthouse', 'Studio'];
const LISTING_STATUSES = ['active', 'pending', 'sold', 'rented'];

interface ListingForm {
  title: string;
  location: string;
  description: string;
  price: string;
  price_value: string;
  type: string;
  status: string;
  area: string;
  area_value: string;
  bedrooms: string;
  bathrooms: string;
  image_url: string;
  gallery: string;
  features: string;
  address: string;
  rera_number: string;
  builder: string;
  possession_date: string;
  facing: string;
  furnishing: string;
  listing_status: string;
}

const emptyForm: ListingForm = {
  title: '', location: '', description: '', price: '', price_value: '', type: 'Apartment',
  status: 'available', area: '', area_value: '', bedrooms: '', bathrooms: '', image_url: '',
  gallery: '', features: '', address: '', rera_number: '', builder: '', possession_date: '',
  facing: '', furnishing: '', listing_status: 'active',
};

export default function BrokerDashboardPage() {
  const { user, signOut } = useAuth();
  const { openAuth } = useAuthUI();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(true);
  const [brokerProfile, setBrokerProfile] = useState<BrokerProfile | null>(null);
  const [listings, setListings] = useState<Property[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [showListingForm, setShowListingForm] = useState(false);
  const [editingListing, setEditingListing] = useState<Property | null>(null);
  const [form, setForm] = useState<ListingForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [profileForm, setProfileForm] = useState({
    agency_name: '', rera_number: '', license_number: '', phone: '',
    alternate_phone: '', email: '', office_address: '', service_areas: '',
    specializations: '', bio: '', logo_url: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const loadAllData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    await Promise.all([loadBrokerProfile(), loadListings()]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) loadAllData();
  }, [user, loadAllData]);

  async function loadBrokerProfile() {
    const { data } = await supabase
      .from('broker_profiles')
      .select('*')
      .eq('user_id', user?.id)
      .maybeSingle();
    if (data) {
      setBrokerProfile(data as BrokerProfile);
      setProfileForm({
        agency_name: data.agency_name || '',
        rera_number: data.rera_number || '',
        license_number: data.license_number || '',
        phone: data.phone || '',
        alternate_phone: data.alternate_phone || '',
        email: data.email || user?.email || '',
        office_address: data.office_address || '',
        service_areas: (data.service_areas || []).join(', '),
        specializations: (data.specializations || []).join(', '),
        bio: data.bio || '',
        logo_url: data.logo_url || '',
      });
    }
  }

  async function loadListings() {
    const { data } = await supabase
      .from('properties')
      .select('*')
      .eq('broker_id', user?.id)
      .order('created_at', { ascending: false });
    if (data) setListings(data as Property[]);
  }

  async function loadLeads() {
    if (listings.length === 0) return;
    const { data } = await supabase
      .from('leads')
      .select('*')
      .in('property_id', listings.map(l => l.id))
      .order('created_at', { ascending: false });
    if (data) setLeads(data as Lead[]);
  }

  useEffect(() => {
    if (listings.length > 0) loadLeads();
  }, [listings]);

  function startEdit(property: Property) {
    setEditingListing(property);
    setForm({
      title: property.title,
      location: property.location,
      description: property.description || '',
      price: property.price || '',
      price_value: property.price_value?.toString() || '',
      type: property.type || 'Apartment',
      status: property.status || 'available',
      area: property.area || '',
      area_value: property.area_value?.toString() || '',
      bedrooms: property.bedrooms?.toString() || '',
      bathrooms: property.bathrooms?.toString() || '',
      image_url: property.image_url || '',
      gallery: (property.gallery || []).join(', '),
      features: (property.features || []).join(', '),
      address: property.address || '',
      rera_number: property.rera_number || '',
      builder: property.builder || '',
      possession_date: property.possession_date || '',
      facing: property.facing || '',
      furnishing: property.furnishing || '',
      listing_status: property.listing_status || 'active',
    });
    setShowListingForm(true);
  }

  function startNew() {
    setEditingListing(null);
    setForm(emptyForm);
    setShowListingForm(true);
  }

  async function handleSaveListing() {
    if (!form.title.trim() || !form.location.trim()) {
      setFormError('Title and Location are required');
      return;
    }
    if (!brokerProfile) {
      setFormError('Please complete your broker profile before listing properties.');
      return;
    }
    if (!brokerProfile.verified) {
      setFormError('Your broker profile is pending verification. You can save listings as draft once verified.');
      return;
    }
    setFormError(null);
    setSaving(true);
    try {
      const payload = {
        broker_id: user?.id,
        broker_name: brokerProfile?.agency_name || user?.email?.split('@')[0] || null,
        broker_phone: brokerProfile?.phone || null,
        broker_email: user?.email || null,
        broker_agency: brokerProfile?.agency_name || null,
        title: form.title,
        location: form.location,
        description: form.description || null,
        price: form.price || null,
        price_value: form.price_value ? parseFloat(form.price_value) : null,
        type: form.type,
        status: form.status,
        area: form.area || null,
        area_value: form.area_value ? parseFloat(form.area_value) : null,
        bedrooms: form.bedrooms ? parseInt(form.bedrooms) : null,
        bathrooms: form.bathrooms ? parseInt(form.bathrooms) : null,
        image_url: form.image_url || null,
        gallery: form.gallery ? form.gallery.split(',').map(s => s.trim()).filter(Boolean) : null,
        features: form.features ? form.features.split(',').map(s => s.trim()).filter(Boolean) : null,
        address: form.address || null,
        rera_number: form.rera_number || null,
        builder: form.builder || null,
        possession_date: form.possession_date || null,
        facing: form.facing || null,
        furnishing: form.furnishing || null,
        listing_status: form.listing_status,
      };

      if (editingListing) {
        const { error } = await supabase
          .from('properties')
          .update(payload)
          .eq('id', editingListing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('properties')
          .insert(payload);
        if (error) throw error;
      }
      setShowListingForm(false);
      await loadListings();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save listing');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteListing(id: string) {
    if (!confirm('Are you sure you want to delete this listing? This cannot be undone.')) return;
    const { error } = await supabase.from('properties').delete().eq('id', id);
    if (!error) setListings(prev => prev.filter(l => l.id !== id));
  }

  async function handleSaveProfile() {
    setSavingProfile(true);
    try {
      const payload = {
        user_id: user?.id,
        agency_name: profileForm.agency_name || null,
        rera_number: profileForm.rera_number || null,
        license_number: profileForm.license_number || null,
        phone: profileForm.phone,
        alternate_phone: profileForm.alternate_phone || null,
        email: profileForm.email || user?.email || null,
        office_address: profileForm.office_address || null,
        service_areas: profileForm.service_areas.split(',').map(s => s.trim()).filter(Boolean),
        specializations: profileForm.specializations.split(',').map(s => s.trim()).filter(Boolean),
        bio: profileForm.bio || null,
        logo_url: profileForm.logo_url || null,
        updated_at: new Date().toISOString(),
      };

      if (brokerProfile) {
        const { error } = await supabase
          .from('broker_profiles')
          .update(payload)
          .eq('user_id', user?.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('broker_profiles')
          .insert(payload);
        if (error) throw error;
      }
      await loadBrokerProfile();
      setShowProfileForm(false);
    } catch (err: any) {
      alert('Failed to save profile: ' + err.message);
    } finally {
      setSavingProfile(false);
    }
  }

  const activeListings = listings.filter(l => l.listing_status === 'active');
  const totalViews = listings.reduce((sum, l) => sum + (l.views_count || 0), 0);
  const totalEnquiries = listings.reduce((sum, l) => sum + (l.enquiry_count || 0), 0);
  const newLeads = leads.filter(l => l.status === 'new');

  const tabs = [
    { key: 'overview' as TabType, label: 'Overview', icon: Home },
    { key: 'listings' as TabType, label: 'My Listings', icon: Building2, count: listings.length },
    { key: 'leads' as TabType, label: 'Leads', icon: MessageSquare, count: newLeads.length },
    { key: 'profile' as TabType, label: 'Profile', icon: Settings },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-maroon-950 flex items-center justify-center pt-20">
        <div className="text-center p-8 max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-gold-500/20">
            <Briefcase className="w-10 h-10 text-slate-950" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-white mb-3">Broker Portal</h2>
          <p className="text-slate-400 mb-8 leading-relaxed">Sign in to list properties, manage leads, and grow your real estate business.</p>
          <button onClick={() => openAuth('signin')} className="px-8 py-3.5 bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-slate-950 font-semibold rounded-xl transition-all shadow-lg shadow-gold-500/20">
            Sign In to Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-maroon-950">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(196,144,48,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(184,41,74,0.2) 0%, transparent 50%)' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/20 shrink-0">
                <Briefcase className="w-8 h-8 text-slate-950" />
              </div>
              <div>
                <h1 className="font-serif text-2xl md:text-3xl font-bold text-white">Broker Dashboard</h1>
                <p className="text-slate-400 text-sm mt-0.5">Manage your property listings and client leads</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {brokerProfile?.verified ? (
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 rounded-full text-sm font-medium border border-green-500/20">
                  <ShieldCheck size={16} /> Verified Broker
                </span>
              ) : brokerProfile ? (
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-400 rounded-full text-sm font-medium border border-amber-500/20">
                  <Clock size={16} /> Pending Verification
                </span>
              ) : null}
              <button onClick={signOut} className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 text-slate-300 rounded-full text-sm font-medium border border-white/10 hover:bg-white/10 transition-colors">
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-gradient-to-br from-slate-950 to-slate-800">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-slate-950 font-serif text-2xl font-bold mb-3 shadow-lg">
                  {(brokerProfile?.agency_name || user.email)?.charAt(0).toUpperCase() || 'B'}
                </div>
                <div className="text-white font-semibold truncate">
                  {brokerProfile?.agency_name || user.email?.split('@')[0]}
                </div>
                <div className="text-slate-400 text-sm truncate">{user.email}</div>
                {brokerProfile && (
                  <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-1 bg-gold-500/10 text-gold-400 text-xs rounded-full border border-gold-500/20">
                    <Award size={12} /> Broker
                  </span>
                )}
              </div>
              <nav className="p-4 space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      activeTab === tab.key
                        ? 'bg-gradient-to-r from-slate-950 to-slate-800 text-white shadow-md'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                    {tab.count !== undefined && tab.count > 0 && (
                      <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-semibold ${
                        activeTab === tab.key ? 'bg-gold-500 text-slate-950' : 'bg-slate-100 text-slate-700'
                      }`}>{tab.count}</span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Mobile Tab Bar */}
            <div className="lg:hidden mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                    activeTab === tab.key ? 'bg-slate-950 text-white shadow-md' : 'bg-white text-slate-700 border border-slate-200'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && <span className="text-xs">{tab.count}</span>}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={32} className="text-slate-500 animate-spin" />
              </div>
            ) : (
              <>
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6 animate-fade-in">
                    {!brokerProfile && (
                      <div className="bg-gradient-to-r from-amber-50 to-gold-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                          <AlertCircle className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                          <h3 className="font-serif text-lg font-bold text-amber-900">Complete your broker profile</h3>
                          <p className="text-sm text-amber-700 mt-1">Add your agency details, RERA number, and contact info to start listing properties.</p>
                          <button onClick={() => { setActiveTab('profile'); setShowProfileForm(true); }} className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-medium hover:bg-amber-700 transition-colors">
                            Set Up Profile <ArrowRight size={16} />
                          </button>
                        </div>
                      </div>
                    )}

                    {brokerProfile && !brokerProfile.verified && (
                      <div className="bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-200 rounded-2xl p-6 flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                          <Clock className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-serif text-lg font-bold text-blue-900">Verification in progress</h3>
                          <p className="text-sm text-blue-700 mt-1">Your profile is being reviewed by our admin team. You'll be able to list properties once verified.</p>
                        </div>
                      </div>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <StatCard icon={Building2} label="Total Listings" value={listings.length} color="gold" />
                      <StatCard icon={CheckCircle2} label="Active Listings" value={activeListings.length} color="green" />
                      <StatCard icon={Eye} label="Total Views" value={totalViews} color="blue" />
                      <StatCard icon={MessageSquare} label="Enquiries" value={totalEnquiries} color="maroon" />
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
                      <h2 className="font-serif text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <button onClick={startNew} className="group flex items-center gap-3 p-5 rounded-xl border border-slate-200 hover:border-gold-300 hover:bg-gold-50/50 transition-all text-left">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-100 to-gold-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Plus className="w-6 h-6 text-gold-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 text-sm">New Listing</div>
                            <div className="text-xs text-slate-500">Add a property</div>
                          </div>
                        </button>
                        <button onClick={() => setActiveTab('leads')} className="group flex items-center gap-3 p-5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all text-left">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <MessageSquare className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 text-sm">View Leads</div>
                            <div className="text-xs text-slate-500">{newLeads.length} new leads</div>
                          </div>
                        </button>
                        <button onClick={() => setActiveTab('profile')} className="group flex items-center gap-3 p-5 rounded-xl border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-all text-left">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Settings className="w-6 h-6 text-slate-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 text-sm">Edit Profile</div>
                            <div className="text-xs text-slate-500">Update broker info</div>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Recent Listings */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="font-serif text-lg font-bold text-slate-900">Recent Listings</h2>
                        <button onClick={() => setActiveTab('listings')} className="text-sm text-gold-600 font-medium hover:text-gold-700 flex items-center gap-1">
                          View all <ChevronRight size={16} />
                        </button>
                      </div>
                      {listings.length === 0 ? (
                        <div className="text-center py-10">
                          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                            <Building2 className="w-8 h-8 text-slate-300" />
                          </div>
                          <p className="text-slate-600 mb-4 font-medium">No listings yet</p>
                          <button onClick={startNew} className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-slate-950 to-slate-800 text-white rounded-xl text-sm font-medium hover:from-slate-900 hover:to-slate-700 transition-all">
                            <Plus size={16} /> Add Your First Listing
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {listings.slice(0, 4).map((property) => (
                            <div key={property.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                              <img src={property.image_url || FALLBACK_IMG} alt={property.title} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-slate-900 text-sm truncate">{property.title}</div>
                                <div className="text-slate-500 text-xs flex items-center gap-1 mt-0.5"><MapPin size={12} /> {property.location}</div>
                                <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                                  <span className="flex items-center gap-1"><Eye size={12} /> {property.views_count || 0}</span>
                                  <span className="flex items-center gap-1"><MessageSquare size={12} /> {property.enquiry_count || 0}</span>
                                </div>
                              </div>
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                                property.listing_status === 'active' ? 'bg-green-50 text-green-600' :
                                property.listing_status === 'pending' ? 'bg-yellow-50 text-yellow-600' :
                                'bg-slate-100 text-slate-500'
                              }`}>{property.listing_status}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Listings Tab */}
                {activeTab === 'listings' && (
                  <div className="animate-fade-in">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="font-serif text-2xl font-bold text-slate-900">My Listings</h2>
                      <button onClick={startNew} className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-slate-950 to-slate-800 hover:from-slate-900 hover:to-slate-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md">
                        <Plus size={16} /> Add Listing
                      </button>
                    </div>
                    {listings.length === 0 ? (
                      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-12 text-center">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mx-auto mb-4">
                          <Building2 className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="font-serif text-xl font-bold text-slate-900 mb-2">No Listings Yet</h3>
                        <p className="text-slate-600 mb-6">Start listing your properties to reach thousands of potential buyers.</p>
                        <button onClick={startNew} className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-slate-950 font-semibold rounded-xl transition-all shadow-md shadow-gold-500/20">
                          <Plus size={18} /> Add Your First Listing
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {listings.map((property) => (
                          <div key={property.id} className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden hover:shadow-xl hover:border-slate-300 transition-all group">
                            <div className="relative h-48 overflow-hidden">
                              <img src={property.image_url || FALLBACK_IMG} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
                              <div className="absolute top-3 right-3">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize backdrop-blur-sm ${
                                  property.listing_status === 'active' ? 'bg-green-500/90 text-white' :
                                  property.listing_status === 'pending' ? 'bg-yellow-500/90 text-white' :
                                  'bg-slate-500/90 text-white'
                                }`}>{property.listing_status}</span>
                              </div>
                              <div className="absolute top-3 left-3">
                                <span className="px-2.5 py-1 bg-white/90 text-slate-900 text-xs font-medium rounded backdrop-blur-sm capitalize">{property.type}</span>
                              </div>
                              <div className="absolute bottom-3 left-3">
                                <span className="font-serif text-lg font-bold text-white drop-shadow-lg">
                                  {property.price_value ? formatCurrency(property.price_value) : property.price}
                                </span>
                              </div>
                            </div>
                            <div className="p-4">
                              <div className="flex items-center gap-1 text-slate-500 text-xs mb-1"><MapPin size={12} /> {property.location}</div>
                              <h3 className="font-serif font-bold text-slate-900 mb-3 line-clamp-1">{property.title}</h3>
                              <div className="flex items-center gap-4 text-xs text-slate-600 mb-3">
                                {property.bedrooms !== null && <span className="flex items-center gap-1"><Bed size={14} className="text-gold-500" /> {property.bedrooms} BHK</span>}
                                {property.bathrooms !== null && <span className="flex items-center gap-1"><Bath size={14} className="text-gold-500" /> {property.bathrooms}</span>}
                                {property.area && <span className="flex items-center gap-1"><Maximize size={14} className="text-gold-500" /> {property.area}</span>}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-slate-400 mb-3 pb-3 border-b border-slate-100">
                                <span className="flex items-center gap-1"><Eye size={12} /> {property.views_count || 0} views</span>
                                <span className="flex items-center gap-1"><MessageSquare size={12} /> {property.enquiry_count || 0} enquiries</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Link to={`/projects/${property.id}`} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
                                  <Eye size={16} /> View
                                </Link>
                                <button onClick={() => startEdit(property)} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium">
                                  <Edit3 size={16} /> Edit
                                </button>
                                <button onClick={() => handleDeleteListing(property.id)} className="p-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors" title="Delete">
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Leads Tab */}
                {activeTab === 'leads' && (
                  <div className="animate-fade-in">
                    <h2 className="font-serif text-2xl font-bold text-slate-900 mb-6">Property Leads</h2>
                    {leads.length === 0 ? (
                      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-12 text-center">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mx-auto mb-4">
                          <MessageSquare className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="font-serif text-xl font-bold text-slate-900 mb-2">No Leads Yet</h3>
                        <p className="text-slate-600 mb-6">Leads from your property listings will appear here.</p>
                        <button onClick={() => setActiveTab('listings')} className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-950 to-slate-800 hover:from-slate-900 hover:to-slate-700 text-white font-semibold rounded-xl transition-all shadow-md">
                          View Listings <ArrowRight size={18} />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {leads.map((lead) => {
                          const property = listings.find(l => l.id === lead.property_id);
                          return (
                            <div key={lead.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                                lead.lead_type === 'site_visit' ? 'bg-blue-100' : lead.lead_type === 'callback' ? 'bg-amber-100' : 'bg-slate-100'
                              }`}>
                                {lead.lead_type === 'site_visit' ? <Clock size={20} className="text-blue-600" /> : <Phone size={20} className="text-amber-600" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <span className="text-sm font-semibold text-slate-900 capitalize">{lead.lead_type.replace(/_/g, ' ')}</span>
                                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                                    lead.status === 'new' ? 'bg-blue-50 text-blue-600' :
                                    lead.status === 'contacted' ? 'bg-amber-50 text-amber-600' :
                                    'bg-green-50 text-green-600'
                                  }`}>{lead.status}</span>
                                </div>
                                {property && <div className="text-xs text-slate-500 mb-1">Property: {property.title}</div>}
                                {lead.message && <p className="text-sm text-slate-600 mb-1">{lead.message}</p>}
                                <div className="flex items-center gap-3 text-xs text-slate-400">
                                  <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(lead.created_at)}</span>
                                  <span className="flex items-center gap-1"><Phone size={12} /> {lead.phone}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div className="animate-fade-in">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="font-serif text-2xl font-bold text-slate-900">Broker Profile</h2>
                      {!showProfileForm && (
                        <button onClick={() => setShowProfileForm(true)} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-gold-400 to-gold-500 text-slate-950 font-semibold rounded-xl hover:from-gold-500 hover:to-gold-600 transition-all text-sm shadow-md shadow-gold-500/20">
                          <Edit3 size={16} /> Edit Profile
                        </button>
                      )}
                    </div>
                    {brokerProfile && !showProfileForm ? (
                      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                        <div className="p-6 bg-gradient-to-br from-slate-950 to-slate-800">
                          <div className="flex items-start gap-5">
                            {brokerProfile.logo_url ? (
                              <img src={brokerProfile.logo_url || undefined} alt={brokerProfile.agency_name || undefined} className="w-20 h-20 rounded-2xl object-cover shadow-lg" />
                            ) : (
                              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg">
                                <Building2 className="w-10 h-10 text-slate-950" />
                              </div>
                            )}
                            <div>
                              <h3 className="font-serif text-xl font-bold text-white">{brokerProfile.agency_name || 'Independent Broker'}</h3>
                              {brokerProfile.rera_number && <p className="text-sm text-slate-400 mt-1">RERA: {brokerProfile.rera_number}</p>}
                              {brokerProfile.verified ? (
                                <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-xs font-medium border border-green-500/20">
                                  <ShieldCheck size={14} /> Verified
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full text-xs font-medium border border-amber-500/20">
                                  <Clock size={14} /> Pending Verification
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="p-6 space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Phone</label>
                              <div className="flex items-center gap-2 text-slate-900"><Phone size={16} className="text-slate-400" /> {brokerProfile.phone}</div>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Email</label>
                              <div className="flex items-center gap-2 text-slate-900"><Mail size={16} className="text-slate-400" /> {brokerProfile.email || user.email}</div>
                            </div>
                            {brokerProfile.office_address && (
                              <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Office Address</label>
                                <div className="text-slate-900">{brokerProfile.office_address}</div>
                              </div>
                            )}
                            {brokerProfile.service_areas.length > 0 && (
                              <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Service Areas</label>
                                <div className="flex flex-wrap gap-2">
                                  {brokerProfile.service_areas.map((area, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full text-sm">{area}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {brokerProfile.specializations.length > 0 && (
                              <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Specializations</label>
                                <div className="flex flex-wrap gap-2">
                                  {brokerProfile.specializations.map((spec, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-gold-50 text-gold-700 rounded-full text-sm">{spec}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {brokerProfile.bio && (
                              <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Bio</label>
                                <p className="text-slate-700 leading-relaxed">{brokerProfile.bio}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Agency Name</label>
                            <input type="text" value={profileForm.agency_name} onChange={(e) => setProfileForm({ ...profileForm, agency_name: e.target.value })}
                              placeholder="e.g. Sharma Properties" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-gold-500 focus:outline-none transition-all" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">RERA Number</label>
                            <input type="text" value={profileForm.rera_number} onChange={(e) => setProfileForm({ ...profileForm, rera_number: e.target.value })}
                              placeholder="RERA registration number" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-gold-500 focus:outline-none transition-all" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">License Number</label>
                            <input type="text" value={profileForm.license_number} onChange={(e) => setProfileForm({ ...profileForm, license_number: e.target.value })}
                              placeholder="Real estate license number" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-gold-500 focus:outline-none transition-all" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Phone *</label>
                            <input type="tel" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                              placeholder="Primary contact number" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-gold-500 focus:outline-none transition-all" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Alternate Phone</label>
                            <input type="tel" value={profileForm.alternate_phone} onChange={(e) => setProfileForm({ ...profileForm, alternate_phone: e.target.value })}
                              placeholder="Optional" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-gold-500 focus:outline-none transition-all" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                            <input type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                              placeholder="Contact email" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-gold-500 focus:outline-none transition-all" />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Office Address</label>
                            <input type="text" value={profileForm.office_address} onChange={(e) => setProfileForm({ ...profileForm, office_address: e.target.value })}
                              placeholder="Full office address" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-gold-500 focus:outline-none transition-all" />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Service Areas (comma-separated)</label>
                            <input type="text" value={profileForm.service_areas} onChange={(e) => setProfileForm({ ...profileForm, service_areas: e.target.value })}
                              placeholder="e.g. Mohali, Chandigarh, Panchkula" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-gold-500 focus:outline-none transition-all" />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Specializations (comma-separated)</label>
                            <input type="text" value={profileForm.specializations} onChange={(e) => setProfileForm({ ...profileForm, specializations: e.target.value })}
                              placeholder="e.g. Residential, Commercial, Plots, Luxury Homes" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-gold-500 focus:outline-none transition-all" />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Logo URL</label>
                            <input type="text" value={profileForm.logo_url} onChange={(e) => setProfileForm({ ...profileForm, logo_url: e.target.value })}
                              placeholder="Image URL for your agency logo" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-gold-500 focus:outline-none transition-all" />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Bio</label>
                            <textarea value={profileForm.bio} onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })} rows={4}
                              placeholder="Tell clients about your experience and expertise..." className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-gold-500 focus:outline-none resize-none transition-all" />
                          </div>
                        </div>
                        <div className="mt-6 flex items-center gap-3">
                          <button onClick={handleSaveProfile} disabled={savingProfile || !profileForm.phone.trim()}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gold-400 to-gold-500 text-slate-950 font-semibold rounded-xl hover:from-gold-500 hover:to-gold-600 transition-all shadow-md shadow-gold-500/20 disabled:opacity-60 disabled:cursor-not-allowed">
                            <Save size={18} /> {savingProfile ? 'Saving...' : 'Save Profile'}
                          </button>
                          {brokerProfile && (
                            <button onClick={() => setShowProfileForm(false)} className="px-6 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors">
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Listing Form Modal */}
      {showListingForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowListingForm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-slate-950 to-slate-800 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="font-serif text-xl font-bold text-white">{editingListing ? 'Edit Listing' : 'New Listing'}</h3>
              <button onClick={() => setShowListingForm(false)} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {formError && (
                <div className="px-4 py-3 rounded-xl bg-red-50 text-red-700 text-sm border border-red-100">{formError}</div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Title *</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. 3BHK Luxury Apartment in Mohali" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-gold-500 focus:outline-none transition-all" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Location *</label>
                  <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="e.g. Sector 70, Mohali" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-gold-500 focus:outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Property Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-gold-500 focus:outline-none transition-all">
                    {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3}
                  placeholder="Describe the property..." className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-gold-500 focus:outline-none resize-none transition-all" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Price (display text)</label>
                  <input type="text" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="e.g. Rs 85 L" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-gold-500 focus:outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Price Value (numeric, in Rs)</label>
                  <input type="number" value={form.price_value} onChange={(e) => setForm({ ...form, price_value: e.target.value })}
                    placeholder="e.g. 8500000" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-gold-500 focus:outline-none transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Bedrooms</label>
                  <input type="number" value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: e.target.value })}
                    placeholder="e.g. 3" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-gold-500 focus:outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Bathrooms</label>
                  <input type="number" value={form.bathrooms} onChange={(e) => setForm({ ...form, bathrooms: e.target.value })}
                    placeholder="e.g. 2" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-gold-500 focus:outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Area (display)</label>
                  <input type="text" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })}
                    placeholder="e.g. 1450 sqft" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-gold-500 focus:outline-none transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Main Image URL</label>
                <input type="text" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder="https://images.pexels.com/..." className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-gold-500 focus:outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Gallery Images (comma-separated URLs)</label>
                <input type="text" value={form.gallery} onChange={(e) => setForm({ ...form, gallery: e.target.value })}
                  placeholder="url1, url2, url3" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-gold-500 focus:outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Features (comma-separated)</label>
                <input type="text" value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })}
                  placeholder="Swimming Pool, Gym, Parking, Security" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-gold-500 focus:outline-none transition-all" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
                  <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="Full address" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-gold-500 focus:outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">RERA Number</label>
                  <input type="text" value={form.rera_number} onChange={(e) => setForm({ ...form, rera_number: e.target.value })}
                    placeholder="RERA registration" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-gold-500 focus:outline-none transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Builder</label>
                  <input type="text" value={form.builder} onChange={(e) => setForm({ ...form, builder: e.target.value })}
                    placeholder="Builder name" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-gold-500 focus:outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Facing</label>
                  <input type="text" value={form.facing} onChange={(e) => setForm({ ...form, facing: e.target.value })}
                    placeholder="North, East, etc." className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-gold-500 focus:outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Furnishing</label>
                  <select value={form.furnishing} onChange={(e) => setForm({ ...form, furnishing: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-gold-500 focus:outline-none transition-all">
                    <option value="">Select</option>
                    <option value="Furnished">Furnished</option>
                    <option value="Semi-Furnished">Semi-Furnished</option>
                    <option value="Unfurnished">Unfurnished</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Listing Status</label>
                  <select value={form.listing_status} onChange={(e) => setForm({ ...form, listing_status: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-gold-500 focus:outline-none transition-all">
                    {LISTING_STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Possession Date</label>
                  <input type="date" value={form.possession_date} onChange={(e) => setForm({ ...form, possession_date: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-gold-500 focus:outline-none transition-all" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleSaveListing} disabled={saving}
                  className="flex-1 px-6 py-3.5 bg-gradient-to-r from-slate-950 to-slate-800 text-white rounded-xl font-semibold hover:from-slate-900 hover:to-slate-700 transition-all disabled:opacity-60 shadow-md">
                  {saving ? 'Saving...' : editingListing ? 'Update Listing' : 'Create Listing'}
                </button>
                <button onClick={() => setShowListingForm(false)} className="px-6 py-3.5 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: 'gold' | 'green' | 'blue' | 'maroon' }) {
  const colors = {
    gold: 'from-gold-100 to-gold-200 text-gold-600',
    green: 'from-green-100 to-green-200 text-green-600',
    blue: 'from-blue-100 to-blue-200 text-blue-600',
    maroon: 'from-maroon-100 to-maroon-200 text-maroon-600',
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center mb-3`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-slate-600 text-sm">{label}</div>
    </div>
  );
}
