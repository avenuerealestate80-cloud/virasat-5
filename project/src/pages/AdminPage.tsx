import { useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Mail, Star, CheckCircle2, XCircle, Loader2, ArrowLeft,
  Phone, Calendar, Clock, Trash2, Edit3, Pencil, Plus, X, Save, FileText, MapPin,
  Eye, EyeOff, Shield, Bell, TrendingUp, Briefcase, Building, BadgeCheck, Home,
  Landmark, MessageSquareQuote, Image as ImageIcon, ChevronDown, ChevronUp, Search,
} from 'lucide-react';
import { supabase, type Property, type Lead, type Review, type BlogPost, type Locality, type BrokerProfile, type Rental, type Testimonial, type BankPartner } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { useAuthUI } from '../lib/authUI';
import { ImageUpload, GalleryUpload } from '../components/ImageUpload';

type Tab = 'overview' | 'properties' | 'rentals' | 'leads' | 'reviews' | 'blog' | 'localities' | 'market_reports' | 'alerts' | 'brokers' | 'testimonials' | 'bank_partners';

export default function AdminPage() {
  const { user, session, loading: authLoading } = useAuth();
  const { openAuth } = useAuthUI();
  const [tab, setTab] = useState<Tab>('overview');
  const [properties, setProperties] = useState<Property[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    supabase
      .rpc('is_admin')
      .then(({ data, error }) => {
        if (error) {
          supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .eq('role', 'admin')
            .maybeSingle()
            .then(({ data: fallbackData }) => setIsAdmin(!!fallbackData));
        } else {
          setIsAdmin(!!data);
        }
      });
  }, [user]);

  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [launchAlerts, setLaunchAlerts] = useState<any[]>([]);
  const [newsletterSubs, setNewsletterSubs] = useState<any[]>([]);
  const [brokers, setBrokers] = useState<BrokerProfile[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [bankPartners, setBankPartners] = useState<BankPartner[]>([]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [propsRes, leadsRes, reviewsRes, blogRes, localitiesRes, alertsRes, subsRes, brokersRes, rentalsRes, testimonialsRes, banksRes] = await Promise.all([
      supabase.from('properties').select('*').order('created_at', { ascending: false }),
      supabase.from('leads').select('*').order('created_at', { ascending: false }),
      supabase.from('reviews').select('*').order('created_at', { ascending: false }),
      supabase.from('blog_posts').select('*').order('created_at', { ascending: false }),
      supabase.from('localities').select('*').order('name', { ascending: true }),
      supabase.from('launch_alerts').select('*').order('subscribed_at', { ascending: false }),
      supabase.from('newsletter_subscribers').select('*').order('subscribed_at', { ascending: false }),
      supabase.from('broker_profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('rentals').select('*').order('created_at', { ascending: false }),
      supabase.from('testimonials').select('*').order('sort_order', { ascending: true }),
      supabase.from('bank_partners').select('*').order('priority', { ascending: true }),
    ]);
    if (propsRes.data) setProperties(propsRes.data as Property[]);
    if (leadsRes.data) setLeads(leadsRes.data as Lead[]);
    if (reviewsRes.data) setReviews(reviewsRes.data as Review[]);
    if (blogRes.data) setBlogPosts(blogRes.data as BlogPost[]);
    if (localitiesRes.data) setLocalities(localitiesRes.data as Locality[]);
    if (alertsRes.data) setLaunchAlerts(alertsRes.data);
    if (subsRes.data) setNewsletterSubs(subsRes.data);
    if (brokersRes.data) setBrokers(brokersRes.data as BrokerProfile[]);
    if (rentalsRes.data) setRentals(rentalsRes.data as Rental[]);
    if (testimonialsRes.data) setTestimonials(testimonialsRes.data as Testimonial[]);
    if (banksRes.data) setBankPartners(banksRes.data as BankPartner[]);
    setLoading(false);
  }, []);

  useEffect(() => { if (user) fetchAll(); }, [user, fetchAll]);

  const updateLeadStatus = async (id: string, status: string) => {
    await supabase.from('leads').update({ status }).eq('id', id);
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
  };
  const toggleVerifiedBuyer = async (id: string, current: boolean) => {
    await supabase.from('reviews').update({ is_verified_buyer: !current }).eq('id', id);
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, is_verified_buyer: !current } : r)));
  };
  const deleteReview = async (id: string) => {
    await supabase.from('reviews').delete().eq('id', id);
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };
  const deleteProperty = async (id: string) => {
    await supabase.from('properties').delete().eq('id', id);
    setProperties((prev) => prev.filter((p) => p.id !== id));
  };
  const deleteLead = async (id: string) => {
    await supabase.from('leads').delete().eq('id', id);
    setLeads((prev) => prev.filter((l) => l.id !== id));
  };

  if (authLoading) {
    return <div className="pt-20 min-h-screen flex items-center justify-center"><Loader2 size={32} className="text-slate-400 animate-spin" /></div>;
  }
  if (!user) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <Shield size={48} className="text-slate-300 mx-auto mb-4" />
          <h2 className="font-serif text-2xl font-bold text-slate-900 mb-2">Admin Access Required</h2>
          <p className="text-slate-500 mb-6">Please sign in with an admin account to manage properties, leads, and reviews.</p>
          <button onClick={() => openAuth('signin')} className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors">Sign In</button>
        </div>
      </div>
    );
  }
  if (!isAdmin) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <Shield size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="font-serif text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-500 mb-6">Your account does not have admin permissions. Please contact the administrator.</p>
          <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors">Back to Home</Link>
        </div>
      </div>
    );
  }

  const newLeads = leads.filter((l) => l.status === 'new').length;
  const pendingReviews = reviews.filter((r) => !r.is_verified_buyer).length;

  const tabs: { id: Tab; label: string; icon: ReactNode; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={16} /> },
    { id: 'properties', label: 'Properties', icon: <Building2 size={16} /> },
    { id: 'rentals', label: 'Rentals', icon: <Home size={16} /> },
    { id: 'leads', label: 'Leads', icon: <Mail size={16} />, badge: newLeads },
    { id: 'reviews', label: 'Reviews', icon: <Star size={16} />, badge: pendingReviews },
    { id: 'blog', label: 'Blog', icon: <FileText size={16} /> },
    { id: 'localities', label: 'Localities', icon: <MapPin size={16} /> },
    { id: 'market_reports', label: 'Market Reports', icon: <TrendingUp size={16} /> },
    { id: 'testimonials', label: 'Testimonials', icon: <MessageSquareQuote size={16} /> },
    { id: 'bank_partners', label: 'Bank Partners', icon: <Landmark size={16} /> },
    { id: 'alerts', label: 'Alerts', icon: <Bell size={16} />, badge: launchAlerts.length },
    { id: 'brokers', label: 'Brokers', icon: <Briefcase size={16} />, badge: brokers.filter(b => !b.verified).length },
  ];

  return (
    <div className="pt-20 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-500 mt-1">Manage properties, rentals, leads, blog, and more</p>
          </div>
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors">
            <ArrowLeft size={16} /> Back to site
          </Link>
        </div>

        <div className="flex gap-1 mb-8 bg-white rounded-xl p-1.5 border border-slate-200 flex-wrap">
          {tabs.map(t => (
            <TabButton key={t.id} active={tab === t.id} onClick={() => setTab(t.id)} icon={t.icon} badge={t.badge}>{t.label}</TabButton>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24"><Loader2 size={32} className="text-slate-500 animate-spin" /></div>
        ) : (
          <>
            {tab === 'overview' && <OverviewTab properties={properties} leads={leads} reviews={reviews} rentals={rentals} onTabChange={setTab} />}
            {tab === 'properties' && (
              <PropertiesTab
                properties={properties}
                onDelete={deleteProperty}
                onEdit={(p) => { setEditingProperty(p); setShowEditModal(true); }}
                onAdd={() => {
                  setEditingProperty({
                    id: '', title: '', location: '', description: '', price: '', type: 'residential', status: 'available', area: '',
                    bedrooms: null, bathrooms: null, image_url: '', gallery: null, features: null, amenities: null, created_at: '', price_value: null,
                    area_value: null, latitude: null, longitude: null, address: null, rera_number: null, builder: null,
                    possession_date: null, is_verified: false, price_per_sqft: null, video_url: null, virtual_tour_url: null,
                    floor_plan_url: null, nearby_amenities: null, vastu_compliant: false, facing: null, age: null, furnishing: null,
                    views_count: 0, enquiry_count: 0, weekly_enquiries: 0, broker_id: null, broker_name: null, broker_phone: null,
                    broker_email: null, broker_agency: null, broker_verified: false, listing_status: null,
                  });
                  setShowEditModal(true);
                }}
              />
            )}
            {tab === 'rentals' && <RentalsTab rentals={rentals} onRefresh={fetchAll} />}
            {tab === 'leads' && <LeadsTab leads={leads} onStatusChange={updateLeadStatus} onDelete={deleteLead} />}
            {tab === 'reviews' && <ReviewsTab reviews={reviews} onToggleVerified={toggleVerifiedBuyer} onDelete={deleteReview} />}
            {tab === 'blog' && <BlogTab posts={blogPosts} onRefresh={fetchAll} />}
            {tab === 'localities' && <LocalitiesTab localities={localities} onRefresh={fetchAll} />}
            {tab === 'market_reports' && <MarketReportsTab />}
            {tab === 'testimonials' && <TestimonialsTab testimonials={testimonials} onRefresh={fetchAll} />}
            {tab === 'bank_partners' && <BankPartnersTab banks={bankPartners} onRefresh={fetchAll} />}
            {tab === 'alerts' && <AlertsTab alerts={launchAlerts} subs={newsletterSubs} session={session} />}
            {tab === 'brokers' && <BrokersTab brokers={brokers} onRefresh={fetchAll} />}
          </>
        )}
      </div>

      {showEditModal && editingProperty && (
        <EditPropertyModal
          property={editingProperty}
          onClose={() => setShowEditModal(false)}
          onSave={async (updated) => {
            if (!updated.id) {
              const { id: _id, created_at: _ca, ...insertData } = updated;
              const { data, error } = await supabase.from('properties').insert(insertData).select().single();
              if (!error && data) setProperties((prev) => [data as Property, ...prev]);
            } else {
              const { id, ...updates } = updated;
              await supabase.from('properties').update(updates).eq('id', id);
              setProperties((prev) => prev.map((p) => (p.id === id ? updated : p)));
            }
            setShowEditModal(false);
          }}
        />
      )}
    </div>
  );
}

/* ---------- Tab Button ---------- */
function TabButton({ active, onClick, icon, badge, children }: { active: boolean; onClick: () => void; icon: ReactNode; badge?: number; children: ReactNode }) {
  return (
    <button onClick={onClick} className={`relative inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-50'}`}>
      {icon}{children}
      {badge != null && badge > 0 && <span className="ml-1 px-1.5 py-0.5 text-xs font-bold bg-gold-400 text-slate-900 rounded-full min-w-[20px] text-center">{badge}</span>}
    </button>
  );
}

/* ---------- Overview Tab ---------- */
function OverviewTab({ properties, leads, reviews, rentals, onTabChange }: { properties: Property[]; leads: Lead[]; reviews: Review[]; rentals: Rental[]; onTabChange: (t: Tab) => void }) {
  const newLeads = leads.filter((l) => l.status === 'new').length;
  const stats = [
    { label: 'Total Properties', value: properties.length, icon: <Building2 size={20} />, color: 'bg-blue-50 text-blue-700', tab: 'properties' as Tab },
    { label: 'Total Rentals', value: rentals.length, icon: <Home size={20} />, color: 'bg-cyan-50 text-cyan-700', tab: 'rentals' as Tab },
    { label: 'New Leads', value: newLeads, icon: <Mail size={20} />, color: 'bg-amber-50 text-amber-700', tab: 'leads' as Tab },
    { label: 'Pending Reviews', value: reviews.filter(r => !r.is_verified_buyer).length, icon: <Star size={20} />, color: 'bg-purple-50 text-purple-700', tab: 'reviews' as Tab },
  ];
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(s => (
          <button key={s.label} onClick={() => onTabChange(s.tab)} className="bg-white rounded-2xl border border-slate-100 p-6 text-left hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${s.color}`}>{s.icon}</div>
            <div className="font-serif text-3xl font-bold text-slate-900">{s.value}</div>
            <div className="text-sm text-slate-600 mt-1">{s.label}</div>
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-lg font-bold text-slate-900">Recent Leads</h3>
            <button onClick={() => onTabChange('leads')} className="text-sm text-slate-600 hover:text-slate-800">View all</button>
          </div>
          {leads.length === 0 ? <p className="text-slate-500 text-sm py-4">No leads yet.</p> : (
            <div className="space-y-3">
              {leads.slice(0, 5).map(lead => (
                <div key={lead.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div>
                    <div className="text-sm font-medium text-slate-900">{lead.name}</div>
                    <div className="text-xs text-slate-500">{lead.lead_type} · {new Date(lead.created_at).toLocaleDateString()}</div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${lead.status === 'new' ? 'bg-amber-100 text-amber-700' : lead.status === 'contacted' ? 'bg-blue-100 text-blue-700' : lead.status === 'converted' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>{lead.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-lg font-bold text-slate-900">Recent Reviews</h3>
            <button onClick={() => onTabChange('reviews')} className="text-sm text-slate-600 hover:text-slate-800">View all</button>
          </div>
          {reviews.length === 0 ? <p className="text-slate-500 text-sm py-4">No reviews yet.</p> : (
            <div className="space-y-3">
              {reviews.slice(0, 5).map(review => (
                <div key={review.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div>
                    <div className="text-sm font-medium text-slate-900">{review.reviewer_name}</div>
                    <div className="flex items-center gap-1 text-xs text-slate-500">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}{review.is_verified_buyer && <span className="ml-2 text-green-600 font-medium">Verified</span>}</div>
                  </div>
                  {!review.is_verified_buyer && <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-medium">Pending</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Properties Tab ---------- */
function PropertiesTab({ properties, onDelete, onEdit, onAdd }: { properties: Property[]; onDelete: (id: string) => void; onEdit: (p: Property) => void; onAdd: () => void }) {
  const [search, setSearch] = useState('');
  const filtered = properties.filter(p => p.title.toLowerCase().includes(search.toLowerCase()) || p.location.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 gap-4 flex-wrap">
        <h2 className="font-serif text-lg font-bold text-slate-900">Properties ({properties.length})</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none" />
          </div>
          <button onClick={onAdd} className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-colors"><Plus size={16} /> Add Property</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Property</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Type</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Price</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Views</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map(p => (
              <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {p.image_url ? <img src={p.image_url} alt={p.title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" /> : <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center"><ImageIcon size={16} className="text-slate-400" /></div>}
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-900 truncate">{p.title}</div>
                      <div className="text-xs text-slate-500">{p.location}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-700 capitalize">{p.type}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${p.status === 'available' ? 'bg-green-100 text-green-700' : p.status === 'sold out' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{p.status}</span>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">{p.price}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{p.views_count}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Link to={`/projects/${p.id}`} className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors" title="View"><Eye size={16} /></Link>
                    <button onClick={() => onEdit(p)} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit"><Edit3 size={16} /></button>
                    <button onClick={() => onDelete(p.id)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- Edit Property Modal (with image upload) ---------- */
function EditPropertyModal({ property, onClose, onSave }: { property: Property; onClose: () => void; onSave: (p: Property) => void }) {
  const [form, setForm] = useState<Property>(property);
  const [saving, setSaving] = useState(false);
  const [section, setSection] = useState<'basic' | 'images' | 'details' | 'location' | 'media'>('basic');
  const [featuresText, setFeaturesText] = useState((property.features ?? []).join(', '));
  const [amenitiesText, setAmenitiesText] = useState((property.amenities ?? []).join(', '));

  const handleSave = async () => {
    setSaving(true);
    const features = featuresText.split(',').map(f => f.trim()).filter(Boolean);
    const amenities = amenitiesText.split(',').map(a => a.trim()).filter(Boolean);
    await onSave({ ...form, features, amenities });
    setSaving(false);
  };

  const set = (key: keyof Property, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  const sections = [
    { id: 'basic' as const, label: 'Basic Info' },
    { id: 'images' as const, label: 'Images' },
    { id: 'details' as const, label: 'Details' },
    { id: 'location' as const, label: 'Location' },
    { id: 'media' as const, label: 'Media Links' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h3 className="text-xl font-serif text-slate-900">{property.id ? 'Edit Property' : 'Add New Property'}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-900 transition-colors"><X size={20} /></button>
        </div>

        <div className="flex gap-1 px-6 pt-4 border-b border-slate-100">
          {sections.map(s => (
            <button key={s.id} onClick={() => setSection(s.id)} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${section === s.id ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>{s.label}</button>
          ))}
        </div>

        <div className="p-6 space-y-4">
          {section === 'basic' && (
            <>
              <div><label className="block text-sm font-medium text-slate-800 mb-1.5">Title *</label><input value={form.title} onChange={e => set('title', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none transition-all" /></div>
              <div><label className="block text-sm font-medium text-slate-800 mb-1.5">Location *</label><input value={form.location} onChange={e => set('location', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none transition-all" /></div>
              <div><label className="block text-sm font-medium text-slate-800 mb-1.5">Description</label><textarea value={form.description ?? ''} onChange={e => set('description', e.target.value)} rows={4} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none transition-all resize-none" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-800 mb-1.5">Price</label><input value={form.price ?? ''} onChange={e => set('price', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none transition-all" placeholder="₹50L - ₹1.2Cr" /></div>
                <div><label className="block text-sm font-medium text-slate-800 mb-1.5">Price Value (numeric)</label><input type="number" value={form.price_value ?? ''} onChange={e => set('price_value', e.target.value ? Number(e.target.value) : null)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none transition-all" /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-sm font-medium text-slate-800 mb-1.5">Type</label><select value={form.type} onChange={e => set('type', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none bg-white"><option value="residential">Residential</option><option value="commercial">Commercial</option><option value="plot">Plot</option><option value="villa">Villa</option></select></div>
                <div><label className="block text-sm font-medium text-slate-800 mb-1.5">Status</label><select value={form.status} onChange={e => set('status', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none bg-white"><option value="available">Available</option><option value="under construction">Under Construction</option><option value="sold out">Sold Out</option><option value="upcoming">Upcoming</option></select></div>
                <div><label className="block text-sm font-medium text-slate-800 mb-1.5">Listing Status</label><select value={form.listing_status ?? 'active'} onChange={e => set('listing_status', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none bg-white"><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
              </div>
              <div><label className="block text-sm font-medium text-slate-800 mb-1.5">Features (comma-separated)</label><input value={featuresText} onChange={e => setFeaturesText(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none transition-all" placeholder="Swimming Pool, Gym, Garden, ..." /></div>
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1.5">Amenities (comma-separated)</label>
                <input value={amenitiesText} onChange={e => setAmenitiesText(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none transition-all" placeholder="Swimming Pool, Gym, Clubhouse, Power Backup, ..." />
                <p className="text-xs text-slate-500 mt-1">Project-level amenities shown on the projects page and used for filtering.</p>
              </div>
            </>
          )}

          {section === 'images' && (
            <>
              <ImageUpload value={form.image_url ?? ''} onChange={url => set('image_url', url)} label="Main Image" folder="properties" />
              <GalleryUpload value={form.gallery ?? []} onChange={urls => set('gallery', urls)} label="Gallery Images" folder="properties" />
              <p className="text-xs text-slate-500">Images are uploaded to Supabase storage. First gallery image can be reordered with the arrow buttons.</p>
            </>
          )}

          {section === 'details' && (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-sm font-medium text-slate-800 mb-1.5">Bedrooms</label><input type="number" value={form.bedrooms ?? ''} onChange={e => set('bedrooms', e.target.value ? Number(e.target.value) : null)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none" /></div>
                <div><label className="block text-sm font-medium text-slate-800 mb-1.5">Bathrooms</label><input type="number" value={form.bathrooms ?? ''} onChange={e => set('bathrooms', e.target.value ? Number(e.target.value) : null)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none" /></div>
                <div><label className="block text-sm font-medium text-slate-800 mb-1.5">Area</label><input value={form.area ?? ''} onChange={e => set('area', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none" placeholder="1200 sqft" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-800 mb-1.5">Price / sqft</label><input type="number" value={form.price_per_sqft ?? ''} onChange={e => set('price_per_sqft', e.target.value ? Number(e.target.value) : null)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none" /></div>
                <div><label className="block text-sm font-medium text-slate-800 mb-1.5">Area Value (numeric)</label><input type="number" value={form.area_value ?? ''} onChange={e => set('area_value', e.target.value ? Number(e.target.value) : null)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-800 mb-1.5">Builder</label><input value={form.builder ?? ''} onChange={e => set('builder', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none" /></div>
                <div><label className="block text-sm font-medium text-slate-800 mb-1.5">RERA Number</label><input value={form.rera_number ?? ''} onChange={e => set('rera_number', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none" /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-sm font-medium text-slate-800 mb-1.5">Possession Date</label><input type="date" value={form.possession_date ?? ''} onChange={e => set('possession_date', e.target.value || null)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none" /></div>
                <div><label className="block text-sm font-medium text-slate-800 mb-1.5">Furnishing</label><select value={form.furnishing ?? ''} onChange={e => set('furnishing', e.target.value || null)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none bg-white"><option value="">—</option><option value="unfurnished">Unfurnished</option><option value="semifurnished">Semi-Furnished</option><option value="furnished">Furnished</option></select></div>
                <div><label className="block text-sm font-medium text-slate-800 mb-1.5">Facing</label><select value={form.facing ?? ''} onChange={e => set('facing', e.target.value || null)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none bg-white"><option value="">—</option><option value="North">North</option><option value="South">South</option><option value="East">East</option><option value="West">West</option><option value="North-East">North-East</option><option value="North-West">North-West</option><option value="South-East">South-East</option><option value="South-West">South-West</option></select></div>
              </div>
              <div><label className="block text-sm font-medium text-slate-800 mb-1.5">Age</label><input value={form.age ?? ''} onChange={e => set('age', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none" placeholder="New / 2 years / etc." /></div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm text-slate-800"><input type="checkbox" checked={form.is_verified} onChange={e => set('is_verified', e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-slate-700 focus:ring-gold-100" /> Verified Listing</label>
                <label className="flex items-center gap-2 text-sm text-slate-800"><input type="checkbox" checked={form.vastu_compliant} onChange={e => set('vastu_compliant', e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-slate-700 focus:ring-gold-100" /> Vastu Compliant</label>
              </div>
            </>
          )}

          {section === 'location' && (
            <>
              <div><label className="block text-sm font-medium text-slate-800 mb-1.5">Address</label><input value={form.address ?? ''} onChange={e => set('address', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-800 mb-1.5">Latitude</label><input type="number" step="any" value={form.latitude ?? ''} onChange={e => set('latitude', e.target.value ? Number(e.target.value) : null)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none" /></div>
                <div><label className="block text-sm font-medium text-slate-800 mb-1.5">Longitude</label><input type="number" step="any" value={form.longitude ?? ''} onChange={e => set('longitude', e.target.value ? Number(e.target.value) : null)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none" /></div>
              </div>
              <p className="text-xs text-slate-500">Enter coordinates for map display. Use Google Maps to find the exact lat/lng.</p>
            </>
          )}

          {section === 'media' && (
            <>
              <div><label className="block text-sm font-medium text-slate-800 mb-1.5">Video URL</label><input value={form.video_url ?? ''} onChange={e => set('video_url', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none" placeholder="https://youtube.com/..." /></div>
              <div><label className="block text-sm font-medium text-slate-800 mb-1.5">Virtual Tour URL</label><input value={form.virtual_tour_url ?? ''} onChange={e => set('virtual_tour_url', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none" placeholder="https://..." /></div>
              <div><label className="block text-sm font-medium text-slate-800 mb-1.5">Floor Plan URL</label><input value={form.floor_plan_url ?? ''} onChange={e => set('floor_plan_url', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none" placeholder="https://..." /></div>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100 sticky bottom-0 bg-white">
          <button onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"><Save size={16} /> {saving ? 'Saving...' : (property.id ? 'Save Changes' : 'Create Property')}</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Rentals Tab ---------- */
function RentalsTab({ rentals, onRefresh }: { rentals: Rental[]; onRefresh: () => void }) {
  const [editing, setEditing] = useState<Partial<Rental> | null>(null);
  const [saving, setSaving] = useState(false);

  const blank = (): Partial<Rental> => ({
    title: '', description: '', location: '', address: null, latitude: null, longitude: null,
    property_type: 'apartment', listing_type: 'rent', bedrooms: null, bathrooms: null,
    area_sqft: 0, furnish_status: 'unfurnished', monthly_rent: 0, security_deposit: null,
    maintenance_charges: null, available_from: null, minimum_lease_months: 12,
    preferred_tenants: [], amenities: [], rules: [], image_url: null, gallery: [],
    video_url: null, virtual_tour_url: null, owner_id: '', owner_name: '', owner_phone: '',
    verified: false, featured: false, status: 'available',
  });

  const handleSave = async () => {
    if (!editing || !editing.title || !editing.location) return;
    setSaving(true);
    if (editing.id) {
      const { id, ...updates } = editing;
      await supabase.from('rentals').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
    } else {
      await supabase.from('rentals').insert(editing);
    }
    setSaving(false);
    setEditing(null);
    onRefresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this rental listing?')) return;
    await supabase.from('rentals').delete().eq('id', id);
    onRefresh();
  };

  const set = (key: string, value: any) => setEditing(prev => ({ ...prev!, [key]: value }));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-xl font-bold text-slate-900">Rentals ({rentals.length})</h2>
        <button onClick={() => setEditing(blank())} className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-colors"><Plus size={16} /> Add Rental</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rentals.map(r => (
          <div key={r.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            {r.image_url ? <img src={r.image_url} alt={r.title} className="w-full h-32 object-cover" /> : <div className="w-full h-32 bg-slate-100 flex items-center justify-center"><Home size={28} className="text-slate-300" /></div>}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-slate-900 truncate">{r.title}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${r.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{r.status}</span>
              </div>
              <p className="text-xs text-slate-500">{r.location} · ₹{r.monthly_rent.toLocaleString('en-IN')}/mo</p>
              <div className="flex items-center gap-2 mt-3">
                <button onClick={() => setEditing({ ...r })} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit3 size={16} /></button>
                <button onClick={() => handleDelete(r.id)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                {r.verified && <span className="text-xs text-green-600 ml-auto">Verified</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h3 className="text-xl font-serif text-slate-900">{editing.id ? 'Edit Rental' : 'Add New Rental'}</h3>
              <button onClick={() => setEditing(null)} className="text-slate-500 hover:text-slate-900"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Title *</label><input value={editing.title ?? ''} onChange={e => set('title', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Location *</label><input value={editing.location ?? ''} onChange={e => set('location', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label><textarea value={editing.description ?? ''} onChange={e => set('description', e.target.value)} rows={3} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none resize-none" /></div>
              <ImageUpload value={editing.image_url ?? ''} onChange={url => set('image_url', url)} label="Main Image" folder="rentals" />
              <GalleryUpload value={editing.gallery ?? []} onChange={urls => set('gallery', urls)} label="Gallery" folder="rentals" />
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Property Type</label><select value={editing.property_type} onChange={e => set('property_type', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none bg-white"><option value="apartment">Apartment</option><option value="house">House</option><option value="villa">Villa</option><option value="studio">Studio</option><option value="shop">Shop</option><option value="office">Office</option></select></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Listing Type</label><select value={editing.listing_type} onChange={e => set('listing_type', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none bg-white"><option value="rent">Rent</option><option value="lease">Lease</option></select></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Bedrooms</label><input type="number" value={editing.bedrooms ?? ''} onChange={e => set('bedrooms', e.target.value ? Number(e.target.value) : null)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Bathrooms</label><input type="number" value={editing.bathrooms ?? ''} onChange={e => set('bathrooms', e.target.value ? Number(e.target.value) : null)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Area (sqft)</label><input type="number" value={editing.area_sqft ?? 0} onChange={e => set('area_sqft', Number(e.target.value))} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Monthly Rent *</label><input type="number" value={editing.monthly_rent ?? 0} onChange={e => set('monthly_rent', Number(e.target.value))} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Security Deposit</label><input type="number" value={editing.security_deposit ?? ''} onChange={e => set('security_deposit', e.target.value ? Number(e.target.value) : null)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Furnishing</label><select value={editing.furnish_status} onChange={e => set('furnish_status', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none bg-white"><option value="unfurnished">Unfurnished</option><option value="semifurnished">Semi-Furnished</option><option value="furnished">Furnished</option><option value="fullyfurnished">Fully Furnished</option></select></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Min Lease (months)</label><input type="number" value={editing.minimum_lease_months ?? 12} onChange={e => set('minimum_lease_months', Number(e.target.value))} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Owner Name *</label><input value={editing.owner_name ?? ''} onChange={e => set('owner_name', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Owner Phone *</label><input value={editing.owner_phone ?? ''} onChange={e => set('owner_phone', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label><select value={editing.status} onChange={e => set('status', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none bg-white"><option value="available">Available</option><option value="rented">Rented</option><option value="withdrawn">Withdrawn</option></select></div>
                <div className="flex items-end gap-4 pb-2">
                  <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={editing.verified ?? false} onChange={e => set('verified', e.target.checked)} className="w-4 h-4 accent-gold-500" /> Verified</label>
                  <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={editing.featured ?? false} onChange={e => set('featured', e.target.checked)} className="w-4 h-4 accent-gold-500" /> Featured</label>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100 sticky bottom-0 bg-white">
              <button onClick={() => setEditing(null)} className="px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50"><Save size={16} /> {saving ? 'Saving...' : 'Save Rental'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Testimonials Tab ---------- */
function TestimonialsTab({ testimonials, onRefresh }: { testimonials: Testimonial[]; onRefresh: () => void }) {
  const [editing, setEditing] = useState<Partial<Testimonial> | null>(null);
  const [saving, setSaving] = useState(false);

  const blank = (): Partial<Testimonial> => ({
    name: '', designation: '', photo_url: null, rating: 5, body: '', location: '',
    property_type: '', is_featured: false, active: true, sort_order: 0,
  });

  const handleSave = async () => {
    if (!editing || !editing.name || !editing.body) return;
    setSaving(true);
    if (editing.id) {
      await supabase.from('testimonials').update(editing).eq('id', editing.id);
    } else {
      await supabase.from('testimonials').insert(editing);
    }
    setSaving(false);
    setEditing(null);
    onRefresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this testimonial?')) return;
    await supabase.from('testimonials').delete().eq('id', id);
    onRefresh();
  };

  const set = (key: string, value: any) => setEditing(prev => ({ ...prev!, [key]: value }));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-xl font-bold text-slate-900">Testimonials ({testimonials.length})</h2>
        <button onClick={() => setEditing(blank())} className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-colors"><Plus size={16} /> Add Testimonial</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {testimonials.map(t => (
          <div key={t.id} className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className="flex items-start gap-3">
              {t.photo_url ? <img src={t.photo_url} alt={t.name} className="w-12 h-12 rounded-full object-cover" /> : <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center"><MessageSquareQuote size={20} className="text-slate-400" /></div>}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900">{t.name}</h3>
                <p className="text-xs text-slate-500">{t.designation} · {t.location}</p>
                <div className="flex items-center gap-0.5 mt-1">{'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}</div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => setEditing({ ...t })} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg"><Edit3 size={14} /></button>
                <button onClick={() => handleDelete(t.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
              </div>
            </div>
            <p className="text-sm text-slate-600 mt-3 line-clamp-2">{t.body}</p>
            <div className="flex gap-2 mt-2">
              {t.is_featured && <span className="text-xs px-2 py-0.5 bg-gold-50 text-gold-700 rounded-full">Featured</span>}
              {!t.active && <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">Hidden</span>}
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white">
              <h3 className="text-xl font-serif font-bold text-slate-900">{editing.id ? 'Edit Testimonial' : 'Add Testimonial'}</h3>
              <button onClick={() => setEditing(null)} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Name *</label><input value={editing.name ?? ''} onChange={e => set('name', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Designation</label><input value={editing.designation ?? ''} onChange={e => set('designation', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none" /></div>
              </div>
              <ImageUpload value={editing.photo_url ?? ''} onChange={url => set('photo_url', url)} label="Photo" folder="testimonials" aspectRatio="aspect-square" />
              <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Testimonial *</label><textarea value={editing.body ?? ''} onChange={e => set('body', e.target.value)} rows={4} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none resize-none" /></div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Rating</label><select value={editing.rating ?? 5} onChange={e => set('rating', Number(e.target.value))} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none bg-white"><option value={5}>5 Stars</option><option value={4}>4 Stars</option><option value={3}>3 Stars</option><option value={2}>2 Stars</option><option value={1}>1 Star</option></select></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Location</label><input value={editing.location ?? ''} onChange={e => set('location', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Sort Order</label><input type="number" value={editing.sort_order ?? 0} onChange={e => set('sort_order', Number(e.target.value))} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none" /></div>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Property Type</label><input value={editing.property_type ?? ''} onChange={e => set('property_type', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none" placeholder="2BHK Apartment, Villa, etc." /></div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={editing.is_featured ?? false} onChange={e => set('is_featured', e.target.checked)} className="w-4 h-4 accent-gold-500" /> Featured</label>
                <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={editing.active ?? true} onChange={e => set('active', e.target.checked)} className="w-4 h-4 accent-gold-500" /> Active</label>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100 sticky bottom-0 bg-white">
              <button onClick={() => setEditing(null)} className="px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 rounded-xl">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 disabled:opacity-50"><Save size={16} /> {saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Bank Partners Tab ---------- */
function BankPartnersTab({ banks, onRefresh }: { banks: BankPartner[]; onRefresh: () => void }) {
  const [editing, setEditing] = useState<Partial<BankPartner> | null>(null);
  const [saving, setSaving] = useState(false);

  const blank = (): Partial<BankPartner> => ({
    name: '', logo_url: null, bank_type: 'bank', min_interest_rate: null, max_interest_rate: null,
    min_loan_amount: null, max_loan_amount: null, min_tenure_years: null, max_tenure_years: null,
    processing_fee_percent: null, prepayment_charges: null, special_schemes: [],
    featured: false, active: true, priority: 0,
  });

  const handleSave = async () => {
    if (!editing || !editing.name || !editing.bank_type) return;
    setSaving(true);
    if (editing.id) {
      await supabase.from('bank_partners').update(editing).eq('id', editing.id);
    } else {
      await supabase.from('bank_partners').insert(editing);
    }
    setSaving(false);
    setEditing(null);
    onRefresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this bank partner?')) return;
    await supabase.from('bank_partners').delete().eq('id', id);
    onRefresh();
  };

  const set = (key: string, value: any) => setEditing(prev => ({ ...prev!, [key]: value }));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-xl font-bold text-slate-900">Bank Partners ({banks.length})</h2>
        <button onClick={() => setEditing(blank())} className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-colors"><Plus size={16} /> Add Bank</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {banks.map(b => (
          <div key={b.id} className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className="flex items-center gap-3 mb-3">
              {b.logo_url ? <img src={b.logo_url} alt={b.name} className="w-12 h-12 rounded-lg object-contain bg-slate-50 p-1" /> : <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center"><Landmark size={20} className="text-slate-400" /></div>}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 truncate">{b.name}</h3>
                <p className="text-xs text-slate-500 capitalize">{b.bank_type} · {b.min_interest_rate ?? '—'}% – {b.max_interest_rate ?? '—'}%</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => setEditing({ ...b })} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg"><Edit3 size={14} /></button>
                <button onClick={() => handleDelete(b.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
              </div>
            </div>
            <div className="flex gap-2">
              {b.featured && <span className="text-xs px-2 py-0.5 bg-gold-50 text-gold-700 rounded-full">Featured</span>}
              {!b.active && <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">Inactive</span>}
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white">
              <h3 className="text-xl font-serif font-bold text-slate-900">{editing.id ? 'Edit Bank Partner' : 'Add Bank Partner'}</h3>
              <button onClick={() => setEditing(null)} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Bank Name *</label><input value={editing.name ?? ''} onChange={e => set('name', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Bank Type *</label><select value={editing.bank_type} onChange={e => set('bank_type', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none bg-white"><option value="bank">Bank</option><option value="nbfc">NBFC</option><option value="hfc">HFC</option></select></div>
              <ImageUpload value={editing.logo_url ?? ''} onChange={url => set('logo_url', url)} label="Logo" folder="bank-logos" aspectRatio="aspect-video" />
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Min Interest Rate (%)</label><input type="number" step="0.01" value={editing.min_interest_rate ?? ''} onChange={e => set('min_interest_rate', e.target.value ? Number(e.target.value) : null)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Max Interest Rate (%)</label><input type="number" step="0.01" value={editing.max_interest_rate ?? ''} onChange={e => set('max_interest_rate', e.target.value ? Number(e.target.value) : null)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Min Loan Amount</label><input type="number" value={editing.min_loan_amount ?? ''} onChange={e => set('min_loan_amount', e.target.value ? Number(e.target.value) : null)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Max Loan Amount</label><input type="number" value={editing.max_loan_amount ?? ''} onChange={e => set('max_loan_amount', e.target.value ? Number(e.target.value) : null)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Min Tenure (years)</label><input type="number" value={editing.min_tenure_years ?? ''} onChange={e => set('min_tenure_years', e.target.value ? Number(e.target.value) : null)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Max Tenure (years)</label><input type="number" value={editing.max_tenure_years ?? ''} onChange={e => set('max_tenure_years', e.target.value ? Number(e.target.value) : null)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Processing Fee (%)</label><input type="number" step="0.01" value={editing.processing_fee_percent ?? ''} onChange={e => set('processing_fee_percent', e.target.value ? Number(e.target.value) : null)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Priority</label><input type="number" value={editing.priority ?? 0} onChange={e => set('priority', Number(e.target.value))} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none" /></div>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Prepayment Charges</label><input value={editing.prepayment_charges ?? ''} onChange={e => set('prepayment_charges', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none" placeholder="Nil / 2% of outstanding" /></div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={editing.featured ?? false} onChange={e => set('featured', e.target.checked)} className="w-4 h-4 accent-gold-500" /> Featured</label>
                <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={editing.active ?? true} onChange={e => set('active', e.target.checked)} className="w-4 h-4 accent-gold-500" /> Active</label>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100 sticky bottom-0 bg-white">
              <button onClick={() => setEditing(null)} className="px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 rounded-xl">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 disabled:opacity-50"><Save size={16} /> {saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Leads Tab ---------- */
function LeadsTab({ leads, onStatusChange, onDelete }: { leads: Lead[]; onStatusChange: (id: string, status: string) => void; onDelete: (id: string) => void }) {
  const statuses = ['new', 'contacted', 'converted', 'lost'];
  if (leads.length === 0) return <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center"><Mail size={40} className="text-slate-300 mx-auto mb-3" /><p className="text-slate-600">No leads have been submitted yet.</p></div>;
  return (
    <div className="space-y-4">
      {leads.map(lead => (
        <div key={lead.id} className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-serif text-lg font-bold text-slate-900">{lead.name}</h3>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${lead.status === 'new' ? 'bg-amber-100 text-amber-700' : lead.status === 'contacted' ? 'bg-blue-100 text-blue-700' : lead.status === 'converted' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>{lead.status}</span>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                <span className="flex items-center gap-1.5"><Phone size={14} /> {lead.phone}</span>
                {lead.email && <span className="flex items-center gap-1.5"><Mail size={14} /> {lead.email}</span>}
                <span className="flex items-center gap-1.5 capitalize"><Mail size={14} /> {lead.lead_type}</span>
                {lead.preferred_date && <span className="flex items-center gap-1.5"><Calendar size={14} /> {lead.preferred_date}</span>}
                {lead.preferred_time && <span className="flex items-center gap-1.5"><Clock size={14} /> {lead.preferred_time}</span>}
              </div>
              {lead.message && <p className="text-sm text-slate-700 mt-3 bg-slate-50 rounded-lg p-3">{lead.message}</p>}
              {lead.property_id && <Link to={`/projects/${lead.property_id}`} className="text-xs text-slate-600 hover:text-slate-800 mt-2 inline-block">View property →</Link>}
            </div>
            <div className="flex flex-col gap-2 items-end">
              <select value={lead.status} onChange={e => onStatusChange(lead.id, e.target.value)} className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none">
                {statuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
              <button onClick={() => onDelete(lead.id)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Reviews Tab ---------- */
function ReviewsTab({ reviews, onToggleVerified, onDelete }: { reviews: Review[]; onToggleVerified: (id: string, current: boolean) => void; onDelete: (id: string) => void }) {
  if (reviews.length === 0) return <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center"><Star size={40} className="text-slate-300 mx-auto mb-3" /><p className="text-slate-600">No reviews have been submitted yet.</p></div>;
  return (
    <div className="space-y-4">
      {reviews.map(review => (
        <div key={review.id} className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-serif text-lg font-bold text-slate-900">{review.reviewer_name}</h3>
                <div className="flex items-center gap-0.5">{[1,2,3,4,5].map(i => <Star key={i} size={14} className={i <= review.rating ? 'fill-gold-400 text-gold-400' : 'text-slate-200'} />)}</div>
                {review.is_verified_buyer ? <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium"><CheckCircle2 size={12} /> Verified Buyer</span> : <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-medium"><XCircle size={12} /> Unverified</span>}
              </div>
              {review.title && <h4 className="text-sm font-medium text-slate-900 mb-1">{review.title}</h4>}
              {review.body && <p className="text-sm text-slate-700">{review.body}</p>}
              <p className="text-xs text-slate-500 mt-2">{new Date(review.created_at).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => onToggleVerified(review.id, review.is_verified_buyer)} className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${review.is_verified_buyer ? 'text-amber-700 bg-amber-50 hover:bg-amber-100' : 'text-green-700 bg-green-50 hover:bg-green-100'}`}>{review.is_verified_buyer ? <><XCircle size={14} /> Unverify</> : <><CheckCircle2 size={14} /> Verify</>}</button>
              <button onClick={() => onDelete(review.id)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Blog Tab ---------- */
function BlogTab({ posts, onRefresh }: { posts: BlogPost[]; onRefresh: () => void }) {
  const [editing, setEditing] = useState<Partial<BlogPost> | null>(null);
  const [saving, setSaving] = useState(false);

  const blankPost = (): Partial<BlogPost> => ({ title: '', slug: '', excerpt: '', body: '', category: 'Market Update', image_url: '', author: 'Virasat Realty Team', published: false });

  const handleSave = async () => {
    if (!editing || !editing.title || !editing.body) return;
    setSaving(true);
    const slug = editing.slug || editing.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (editing.id) {
      await supabase.from('blog_posts').update({ ...editing, slug }).eq('id', editing.id);
    } else {
      await supabase.from('blog_posts').insert({ ...editing, slug, published_at: new Date().toISOString() });
    }
    setSaving(false);
    setEditing(null);
    onRefresh();
  };

  const togglePublish = async (post: BlogPost) => { await supabase.from('blog_posts').update({ published: !post.published }).eq('id', post.id); onRefresh(); };
  const deletePost = async (id: string) => { if (!confirm('Delete this blog post?')) return; await supabase.from('blog_posts').delete().eq('id', id); onRefresh(); };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-xl font-bold text-slate-900">Blog Posts ({posts.length})</h2>
        <button onClick={() => setEditing(blankPost())} className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-colors"><Plus size={16} /> New Post</button>
      </div>
      <div className="space-y-3">
        {posts.map(post => (
          <div key={post.id} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${post.published ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{post.published ? 'Published' : 'Draft'}</span>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">{post.category}</span>
              </div>
              <h3 className="font-semibold text-slate-900 mt-1 truncate">{post.title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">by {post.author} · {new Date(post.published_at).toLocaleDateString('en-IN')}</p>
              {post.excerpt && <p className="text-sm text-slate-500 mt-1 line-clamp-1">{post.excerpt}</p>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => togglePublish(post)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors" title={post.published ? 'Unpublish' : 'Publish'}>{post.published ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              <button onClick={() => setEditing({ ...post })} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"><Edit3 size={16} /></button>
              <button onClick={() => deletePost(post.id)} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
        {posts.length === 0 && <p className="text-slate-400 text-center py-10">No blog posts yet.</p>}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white">
              <h3 className="font-serif text-xl font-bold text-slate-900">{editing.id ? 'Edit Post' : 'New Blog Post'}</h3>
              <button onClick={() => setEditing(null)}><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Title *</label><input value={editing.title ?? ''} onChange={e => setEditing({ ...editing, title: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none" placeholder="Post title" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Slug</label><input value={editing.slug ?? ''} onChange={e => setEditing({ ...editing, slug: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none text-sm" placeholder="auto-generated" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label><select value={editing.category ?? ''} onChange={e => setEditing({ ...editing, category: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none bg-white">{['Market Update','Investment Tips','Legal Guide','Home Loans','Lifestyle','Locality Guide','Design & Interiors'].map(c => <option key={c}>{c}</option>)}</select></div>
              </div>
              <ImageUpload value={editing.image_url ?? ''} onChange={url => setEditing({ ...editing, image_url: url })} label="Cover Image" folder="blog" />
              <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Author</label><input value={editing.author ?? ''} onChange={e => setEditing({ ...editing, author: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none text-sm" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Excerpt</label><textarea value={editing.excerpt ?? ''} onChange={e => setEditing({ ...editing, excerpt: e.target.value })} rows={2} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none resize-none text-sm" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Body * (Markdown supported)</label><textarea value={editing.body ?? ''} onChange={e => setEditing({ ...editing, body: e.target.value })} rows={10} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none resize-none text-sm font-mono" /></div>
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={editing.published ?? false} onChange={e => setEditing({ ...editing, published: e.target.checked })} className="w-4 h-4 accent-gold-500" /><span className="text-sm font-medium text-slate-700">Publish immediately</span></label>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100 sticky bottom-0 bg-white">
              <button onClick={() => setEditing(null)} className="px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50"><Save size={16} /> {saving ? 'Saving...' : 'Save Post'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Localities Tab ---------- */
function LocalityModal({ locality, onClose, onSave }: { locality: Locality | null; onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({ name: locality?.name ?? '', slug: locality?.slug ?? '', description: locality?.description ?? '', image_url: locality?.image_url ?? '', walkability_score: locality?.walkability_score ?? 50, safety_score: locality?.safety_score ?? 50, school_rating: locality?.school_rating ?? 50, avg_price_per_sqft: locality?.avg_price_per_sqft ?? 0 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError(null);
    const payload = { ...form, slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-'), avg_price_per_sqft: form.avg_price_per_sqft || null, image_url: form.image_url || null, description: form.description || null };
    try {
      if (locality) { const { error } = await supabase.from('localities').update(payload).eq('id', locality.id); if (error) throw error; }
      else { const { error } = await supabase.from('localities').insert(payload); if (error) throw error; }
      onSave(); onClose();
    } catch (err: any) { setError(err.message); } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white">
          <h3 className="font-serif text-xl font-bold text-slate-900">{locality ? 'Edit Locality' : 'Add Locality'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Name *</label><input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none text-sm" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Slug</label><input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none text-sm" placeholder="auto-generated" /></div>
          </div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none text-sm resize-none" /></div>
          <ImageUpload value={form.image_url} onChange={url => setForm({ ...form, image_url: url })} label="Image" folder="localities" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Walkability</label><input type="number" min={0} max={100} value={form.walkability_score} onChange={e => setForm({ ...form, walkability_score: +e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none text-sm" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Safety</label><input type="number" min={0} max={100} value={form.safety_score} onChange={e => setForm({ ...form, safety_score: +e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none text-sm" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">School Rating</label><input type="number" min={0} max={100} value={form.school_rating} onChange={e => setForm({ ...form, school_rating: +e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none text-sm" /></div>
          </div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Avg Price / sqft</label><input type="number" value={form.avg_price_per_sqft} onChange={e => setForm({ ...form, avg_price_per_sqft: +e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none text-sm" /></div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={saving} className="w-full py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50">{saving ? 'Saving...' : locality ? 'Update Locality' : 'Add Locality'}</button>
        </form>
      </div>
    </div>
  );
}

function LocalitiesTab({ localities, onRefresh }: { localities: Locality[]; onRefresh: () => void }) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Locality | null>(null);
  async function handleDelete(id: string) { if (!confirm('Delete this locality?')) return; const { error } = await supabase.from('localities').delete().eq('id', id); if (error) { alert('Delete failed: ' + error.message); return; } onRefresh(); }
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-xl font-bold text-slate-900">Localities ({localities.length})</h2>
        <button onClick={() => { setEditing(null); setShowModal(true); }} className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"><Plus size={16} /> Add Locality</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {localities.map(loc => (
          <div key={loc.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              {loc.image_url ? <img src={loc.image_url} alt={loc.name} className="w-10 h-10 rounded-xl object-cover" /> : <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center"><MapPin size={18} className="text-slate-500" /></div>}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 truncate">{loc.name}</h3>
                <p className="text-xs text-slate-400">/{loc.slug}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setEditing(loc); setShowModal(true); }} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"><Pencil size={14} /></button>
                <button onClick={() => handleDelete(loc.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-50 rounded-xl py-2"><p className="text-sm font-bold text-slate-900">{loc.walkability_score}</p><p className="text-xs text-slate-400">Walk</p></div>
              <div className="bg-slate-50 rounded-xl py-2"><p className="text-sm font-bold text-slate-900">{loc.safety_score}</p><p className="text-xs text-slate-400">Safety</p></div>
              <div className="bg-slate-50 rounded-xl py-2"><p className="text-sm font-bold text-slate-900">{loc.school_rating}</p><p className="text-xs text-slate-400">School</p></div>
            </div>
            {loc.avg_price_per_sqft ? <p className="text-xs text-slate-500 mt-3">Avg Rs {loc.avg_price_per_sqft}/sqft</p> : null}
          </div>
        ))}
      </div>
      {showModal && <LocalityModal locality={editing} onClose={() => setShowModal(false)} onSave={onRefresh} />}
    </div>
  );
}

/* ---------- Market Reports Tab ---------- */
interface MarketReport { id: string; quarter: string; year: number; locality: string; avg_price_sqft: number; price_change_pct: number | null; total_transactions: number | null; new_launches: number | null; absorption_rate: number | null; top_builder: string | null; notes: string | null; published: boolean; created_at: string; }

function MarketReportModal({ report, onClose, onSave }: { report: MarketReport | null; onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({ quarter: report?.quarter ?? 'Q1', year: report?.year ?? new Date().getFullYear(), locality: report?.locality ?? '', avg_price_sqft: report?.avg_price_sqft ?? 0, price_change_pct: report?.price_change_pct ?? 0, total_transactions: report?.total_transactions ?? 0, new_launches: report?.new_launches ?? 0, absorption_rate: report?.absorption_rate ?? 0, top_builder: report?.top_builder ?? '', notes: report?.notes ?? '', published: report?.published ?? true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError(null);
    const payload = { ...form, price_change_pct: form.price_change_pct || null, total_transactions: form.total_transactions || null, new_launches: form.new_launches || null, absorption_rate: form.absorption_rate || null, top_builder: form.top_builder || null, notes: form.notes || null };
    try {
      if (report) { const { error } = await supabase.from('market_reports').update(payload).eq('id', report.id); if (error) throw error; }
      else { const { error } = await supabase.from('market_reports').insert(payload); if (error) throw error; }
      onSave(); onClose();
    } catch (err: any) { setError(err.message); } finally { setSaving(false); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white"><h3 className="font-serif text-xl font-bold text-slate-900">{report ? 'Edit Report' : 'Add Report'}</h3><button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X size={20} /></button></div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Quarter</label><select value={form.quarter} onChange={e => setForm({ ...form, quarter: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none text-sm"><option>Q1</option><option>Q2</option><option>Q3</option><option>Q4</option></select></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Year</label><input type="number" value={form.year} onChange={e => setForm({ ...form, year: +e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none text-sm" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Published</label><select value={form.published ? 'yes' : 'no'} onChange={e => setForm({ ...form, published: e.target.value === 'yes' })} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none text-sm"><option value="yes">Yes</option><option value="no">No</option></select></div>
          </div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Locality *</label><input required value={form.locality} onChange={e => setForm({ ...form, locality: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none text-sm" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Avg Price / sqft</label><input type="number" value={form.avg_price_sqft} onChange={e => setForm({ ...form, avg_price_sqft: +e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none text-sm" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Price Change %</label><input type="number" step="0.1" value={form.price_change_pct} onChange={e => setForm({ ...form, price_change_pct: +e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none text-sm" /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Transactions</label><input type="number" value={form.total_transactions} onChange={e => setForm({ ...form, total_transactions: +e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none text-sm" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">New Launches</label><input type="number" value={form.new_launches} onChange={e => setForm({ ...form, new_launches: +e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none text-sm" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Absorption %</label><input type="number" step="0.1" value={form.absorption_rate} onChange={e => setForm({ ...form, absorption_rate: +e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none text-sm" /></div>
          </div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Top Builder</label><input value={form.top_builder} onChange={e => setForm({ ...form, top_builder: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none text-sm" /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label><textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none text-sm resize-none" /></div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={saving} className="w-full py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50">{saving ? 'Saving...' : report ? 'Update Report' : 'Add Report'}</button>
        </form>
      </div>
    </div>
  );
}

function MarketReportsTab() {
  const [reports, setReports] = useState<MarketReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<MarketReport | null>(null);
  async function load() { setLoading(true); const { data } = await supabase.from('market_reports').select('*').order('created_at', { ascending: false }); if (data) setReports(data as MarketReport[]); setLoading(false); }
  useEffect(() => { load(); }, []);
  async function handleDelete(id: string) { if (!confirm('Delete this market report?')) return; const { error } = await supabase.from('market_reports').delete().eq('id', id); if (error) { alert('Delete failed: ' + error.message); return; } load(); }
  async function togglePublished(report: MarketReport) { const { error } = await supabase.from('market_reports').update({ published: !report.published }).eq('id', report.id); if (error) { alert('Update failed: ' + error.message); return; } load(); }
  if (loading) return <div className="flex items-center justify-center py-16"><Loader2 size={24} className="text-slate-400 animate-spin" /></div>;
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-xl font-bold text-slate-900">Market Reports ({reports.length})</h2>
        <button onClick={() => { setEditing(null); setShowModal(true); }} className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"><Plus size={16} /> Add Report</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead><tr className="border-b border-slate-200 text-left text-xs text-slate-500 uppercase"><th className="py-3 px-4">Quarter</th><th className="py-3 px-4">Locality</th><th className="py-3 px-4">Avg Price/sqft</th><th className="py-3 px-4">Change %</th><th className="py-3 px-4">Published</th><th className="py-3 px-4">Actions</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {reports.map(r => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className="py-3 px-4 text-sm font-medium text-slate-900">{r.quarter} {r.year}</td>
                <td className="py-3 px-4 text-sm text-slate-700">{r.locality}</td>
                <td className="py-3 px-4 text-sm text-slate-700">Rs {r.avg_price_sqft}</td>
                <td className="py-3 px-4 text-sm">{r.price_change_pct !== null && <span className={r.price_change_pct >= 0 ? 'text-green-600' : 'text-red-600'}>{r.price_change_pct >= 0 ? '+' : ''}{r.price_change_pct}%</span>}</td>
                <td className="py-3 px-4"><button onClick={() => togglePublished(r)} className={`px-2 py-1 rounded-full text-xs font-medium ${r.published ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-500'}`}>{r.published ? 'Published' : 'Draft'}</button></td>
                <td className="py-3 px-4"><div className="flex gap-1"><button onClick={() => { setEditing(r); setShowModal(true); }} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"><Pencil size={14} /></button><button onClick={() => handleDelete(r.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && <MarketReportModal report={editing} onClose={() => setShowModal(false)} onSave={load} />}
    </div>
  );
}

/* ---------- Alerts Tab ---------- */
function AlertsTab({ alerts, subs, session }: { alerts: any[]; subs: any[]; session: any }) {
  const [alertMsg, setAlertMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<number | null>(null);
  async function sendAlert() {
    if (!alertMsg.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-launch-alert`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` }, body: JSON.stringify({ message: alertMsg }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setSent(json.sent); setAlertMsg('');
    } catch (err: any) { alert('Failed: ' + err.message); } finally { setSending(false); }
  }
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h2 className="font-serif text-xl font-bold text-slate-900 mb-1">Send Launch Alert</h2>
        <p className="text-sm text-slate-500 mb-4">Notify all active alert subscribers. This marks them as notified in the database.</p>
        <div className="flex gap-3">
          <input type="text" value={alertMsg} onChange={e => { setAlertMsg(e.target.value); setSent(null); }} placeholder="e.g. New phase launched at Sector 4A — prices start ₹45L" className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 focus:outline-none text-sm" />
          <button onClick={sendAlert} disabled={sending || !alertMsg.trim()} className="inline-flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-xl font-medium text-sm hover:bg-slate-800 transition-colors disabled:opacity-60 whitespace-nowrap"><Bell size={15} /> {sending ? 'Sending...' : 'Send Alert'}</button>
        </div>
        {sent !== null && <p className="mt-3 text-sm text-emerald-600 font-medium">Alert sent — {sent} subscriber{sent !== 1 ? 's' : ''} notified.</p>}
      </div>
      <div>
        <h2 className="font-serif text-xl font-bold text-slate-900 mb-4">Launch Alert Subscribers ({alerts.length})</h2>
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          {alerts.length === 0 ? <p className="text-slate-400 text-center py-10">No alert subscribers yet.</p> : (
            <div className="overflow-x-auto"><table className="w-full text-sm min-w-[640px]"><thead className="bg-slate-50 border-b border-slate-100"><tr><th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Name</th><th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Phone</th><th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Type</th><th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Budget</th><th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th><th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Date</th></tr></thead><tbody className="divide-y divide-slate-50">{alerts.map(a => (<tr key={a.id} className="hover:bg-slate-50 transition-colors"><td className="px-5 py-3 font-medium text-slate-800">{a.name}</td><td className="px-5 py-3 text-slate-600">{a.phone}</td><td className="px-5 py-3 text-slate-500">{a.preferred_type || '—'}</td><td className="px-5 py-3 text-slate-500">{a.budget_range || '—'}</td><td className="px-5 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${a.notified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{a.notified ? 'Notified' : 'Pending'}</span></td><td className="px-5 py-3 text-slate-400">{new Date(a.subscribed_at).toLocaleDateString('en-IN')}</td></tr>))}</tbody></table></div>
          )}
        </div>
      </div>
      <div>
        <h2 className="font-serif text-xl font-bold text-slate-900 mb-4">Newsletter Subscribers ({subs.length})</h2>
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          {subs.length === 0 ? <p className="text-slate-400 text-center py-10">No newsletter subscribers yet.</p> : (
            <div className="overflow-x-auto"><table className="w-full text-sm min-w-[480px]"><thead className="bg-slate-50 border-b border-slate-100"><tr><th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Name</th><th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Email</th><th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Date</th></tr></thead><tbody className="divide-y divide-slate-50">{subs.map(s => (<tr key={s.id} className="hover:bg-slate-50 transition-colors"><td className="px-5 py-3 font-medium text-slate-800">{s.name || '—'}</td><td className="px-5 py-3 text-slate-600">{s.email}</td><td className="px-5 py-3 text-slate-400">{new Date(s.subscribed_at).toLocaleDateString('en-IN')}</td></tr>))}</tbody></table></div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Brokers Tab ---------- */
function BrokersTab({ brokers, onRefresh }: { brokers: BrokerProfile[]; onRefresh: () => void }) {
  const [updating, setUpdating] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  async function toggleVerify(broker: BrokerProfile) {
    setUpdating(broker.id);
    try { const { error } = await supabase.from('broker_profiles').update({ verified: !broker.verified, updated_at: new Date().toISOString() }).eq('id', broker.id); if (error) throw error; onRefresh(); }
    catch (err: any) { alert('Failed to update broker: ' + err.message); } finally { setUpdating(null); }
  }
  const pendingBrokers = brokers.filter(b => !b.verified);
  const verifiedBrokers = brokers.filter(b => b.verified);
  if (brokers.length === 0) return <div className="bg-white rounded-xl border border-slate-200 p-12 text-center"><Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" /><h3 className="font-serif text-xl font-bold text-slate-900 mb-2">No Brokers Registered</h3><p className="text-slate-500">When brokers sign up and create their profiles, they will appear here for verification.</p></div>;
  function BrokerCard({ broker }: { broker: BrokerProfile }) {
    const isExpanded = expanded === broker.id;
    return (
      <div className={`bg-white rounded-xl border overflow-hidden transition-all ${broker.verified ? 'border-green-100' : 'border-amber-200'}`}>
        <div className="p-5 flex items-start gap-4">
          {broker.logo_url ? <img src={broker.logo_url} alt={broker.agency_name || 'Broker'} className="w-14 h-14 rounded-xl object-cover shrink-0" /> : <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-800 to-slate-600 flex items-center justify-center shrink-0"><Building className="w-7 h-7 text-gold-400" /></div>}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-serif font-bold text-slate-900">{broker.agency_name || 'Independent Broker'}</h3>
              {broker.verified ? <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-xs font-medium"><BadgeCheck size={14} /> Verified</span> : <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full text-xs font-medium"><Clock size={14} /> Pending</span>}
            </div>
            <div className="text-sm text-slate-500 mt-1 space-y-0.5">
              {broker.rera_number && <div>RERA: <span className="text-slate-700 font-medium">{broker.rera_number}</span></div>}
              {broker.phone && <div>Phone: <span className="text-slate-700">{broker.phone}</span></div>}
              {broker.email && <div>Email: <span className="text-slate-700">{broker.email}</span></div>}
            </div>
            <div className="flex items-center gap-2 mt-3">
              <button onClick={() => toggleVerify(broker)} disabled={updating === broker.id} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${broker.verified ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-600 text-white hover:bg-green-700'}`}>{updating === broker.id ? 'Updating...' : broker.verified ? 'Revoke Verification' : 'Verify Broker'}</button>
              <button onClick={() => setExpanded(isExpanded ? null : broker.id)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">{isExpanded ? 'Hide Details' : 'View Details'}</button>
            </div>
          </div>
          <div className="text-right shrink-0"><div className="text-xs text-slate-400">Listings</div><div className="text-lg font-bold text-slate-900">{broker.total_listings}</div><div className="text-xs text-slate-400 mt-2">Joined</div><div className="text-sm text-slate-600">{new Date(broker.joined_at).toLocaleDateString('en-IN')}</div></div>
        </div>
        {isExpanded && (
          <div className="px-5 pb-5 border-t border-slate-100 pt-4 space-y-3">
            {broker.license_number && <div><span className="text-xs font-medium text-slate-500">License:</span> <span className="text-sm text-slate-800">{broker.license_number}</span></div>}
            {broker.office_address && <div><span className="text-xs font-medium text-slate-500">Office:</span> <span className="text-sm text-slate-800">{broker.office_address}</span></div>}
            {broker.service_areas.length > 0 && (<div><span className="text-xs font-medium text-slate-500">Service Areas:</span><div className="flex flex-wrap gap-1.5 mt-1">{broker.service_areas.map((a, i) => <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full text-xs">{a}</span>)}</div></div>)}
            {broker.specializations.length > 0 && (<div><span className="text-xs font-medium text-slate-500">Specializations:</span><div className="flex flex-wrap gap-1.5 mt-1">{broker.specializations.map((s, i) => <span key={i} className="px-2 py-0.5 bg-gold-50 text-gold-700 rounded-full text-xs">{s}</span>)}</div></div>)}
            {broker.bio && <div><span className="text-xs font-medium text-slate-500">Bio:</span><p className="text-sm text-slate-700 mt-0.5">{broker.bio}</p></div>}
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {pendingBrokers.length > 0 && (<div><h3 className="font-serif text-lg font-bold text-slate-900 mb-3 flex items-center gap-2"><Clock size={18} className="text-amber-500" /> Pending Verification ({pendingBrokers.length})</h3><div className="space-y-3">{pendingBrokers.map(b => <BrokerCard key={b.id} broker={b} />)}</div></div>)}
      {verifiedBrokers.length > 0 && (<div><h3 className="font-serif text-lg font-bold text-slate-900 mb-3 flex items-center gap-2"><BadgeCheck size={18} className="text-green-500" /> Verified Brokers ({verifiedBrokers.length})</h3><div className="space-y-3">{verifiedBrokers.map(b => <BrokerCard key={b.id} broker={b} />)}</div></div>)}
    </div>
  );
}
