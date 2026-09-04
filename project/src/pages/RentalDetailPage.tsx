import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Bed, Bath, Maximize, MapPin, Phone, MessageCircle,
  Wifi, Tv, Wind, ParkingCircle, Zap, Shield, Building2, Leaf,
  Coffee, Home, CheckCircle2, Calendar, Star,
  ChevronLeft, ChevronRight, Loader2, X, User
} from 'lucide-react';
import { supabase, type Rental, type PGSpace } from '../lib/supabase';
import { useAuth } from '../lib/auth';

const FALLBACK_IMG = 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800';

const AMENITY_ICONS: Record<string, typeof Wifi> = {
  wifi: Wifi, tv: Tv, ac: Wind, parking: ParkingCircle, gym: Zap,
  power_backup: Zap, security: Shield, lift: Building2, garden: Leaf,
  food: Coffee, cleaning: Home, washing: Home,
};

function AmenityPill({ label }: { label: string }) {
  const Icon = AMENITY_ICONS[label.toLowerCase().replace(/\s/g, '_')] || CheckCircle2;
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-sm">
      <Icon size={14} className="text-gold-500" />
      {label.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
    </span>
  );
}

function formatCurrency(value: number): string {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  return `₹${value.toLocaleString('en-IN')}`;
}

export default function RentalDetailPage() {
  const { id, type } = useParams<{ id: string; type: string }>();
  const { user } = useAuth();
  const [rental, setRental] = useState<Rental | null>(null);
  const [pg, setPg] = useState<PGSpace | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [showEnquiry, setShowEnquiry] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      if (type === 'pg') {
        const { data } = await supabase.from('pg_spaces').select('*').eq('id', id).maybeSingle();
        if (data) setPg(data as PGSpace);
      } else {
        const { data } = await supabase.from('rentals').select('*').eq('id', id).maybeSingle();
        if (data) setRental(data as Rental);
      }
      setLoading(false);
    }
    load();
  }, [id, type]);

  const handleEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    const { error } = await supabase.from('leads').insert({
      user_id: user?.id || null,
      name: form.name, phone: form.phone, email: form.email || null,
      message: form.message || null, lead_type: type === 'pg' ? 'pg_enquiry' : 'rental_enquiry',
      status: 'new'
    });
    setSubmitting(false);
    if (error) {
      setSubmitError('Failed to send enquiry. Please try again.');
    } else {
      setSubmitted(true);
    }
  };

  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="text-gold-500 animate-spin" />
      </div>
    );
  }

  const item = rental || pg;
  if (!item) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Listing not found.</p>
          <Link to="/rentals" className="text-gold-600 underline">Back to Rentals</Link>
        </div>
      </div>
    );
  }

  const images = [item.image_url || FALLBACK_IMG, ...(item.gallery || [])].filter(Boolean) as string[];
  const isRental = !!rental;
  const title = item.title;
  const location = item.location;
  const amenities = item.amenities || [];
  const rules = item.rules || [];

  return (
    <div className="pt-20 min-h-screen bg-slate-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link to="/rentals" className="hover:text-slate-800 transition-colors inline-flex items-center gap-1.5">
              <ArrowLeft size={14} /> Rentals
            </Link>
            <span>/</span>
            <span className="text-slate-800 truncate">{title}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gallery */}
            <div className="rounded-2xl overflow-hidden bg-white shadow-sm border border-slate-100">
              <div className="relative aspect-[16/9] bg-slate-200">
                <img
                  src={images[activeImg]}
                  alt={title}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMG; }}
                />
                {images.length > 1 && (
                  <>
                    <button onClick={() => setActiveImg(p => (p - 1 + images.length) % images.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors">
                      <ChevronLeft size={18} />
                    </button>
                    <button onClick={() => setActiveImg(p => (p + 1) % images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors">
                      <ChevronRight size={18} />
                    </button>
                    <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/60 text-white text-xs rounded-lg">
                      {activeImg + 1} / {images.length}
                    </div>
                  </>
                )}
                {item.verified && (
                  <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg shadow">
                    <CheckCircle2 size={12} /> Verified
                  </div>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto">
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setActiveImg(i)}
                      className={`shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-colors ${i === activeImg ? 'border-gold-500' : 'border-transparent'}`}>
                      <img src={img} alt="" className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMG; }} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title & Key Info */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-1 bg-gold-100 text-gold-700 text-xs font-semibold rounded-lg uppercase tracking-wide">
                      {isRental ? (rental?.listing_type === 'lease' ? 'Lease' : 'For Rent') : `PG — ${(pg as PGSpace).pg_type}`}
                    </span>
                    {item.featured && <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-lg">Featured</span>}
                  </div>
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 mb-1">{title}</h1>
                  <p className="text-slate-500 flex items-center gap-1.5"><MapPin size={14} /> {location}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-serif text-2xl font-bold text-slate-900">
                    {isRental
                      ? formatCurrency((rental as Rental).monthly_rent)
                      : formatCurrency((pg as PGSpace).starting_price)}
                  </div>
                  <div className="text-slate-500 text-sm">{isRental ? '/month' : '/month starting'}</div>
                </div>
              </div>

              {isRental && rental && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-t border-slate-100">
                  {rental.bedrooms != null && (
                    <div className="flex items-center gap-2 text-slate-700"><Bed size={16} className="text-gold-500" /> {rental.bedrooms} Beds</div>
                  )}
                  {rental.bathrooms != null && (
                    <div className="flex items-center gap-2 text-slate-700"><Bath size={16} className="text-gold-500" /> {rental.bathrooms} Baths</div>
                  )}
                  <div className="flex items-center gap-2 text-slate-700"><Maximize size={16} className="text-gold-500" /> {rental.area_sqft} sqft</div>
                  <div className="flex items-center gap-2 text-slate-700 capitalize"><Home size={16} className="text-gold-500" /> {rental.furnish_status.replace('fully', 'Fully ')}</div>
                </div>
              )}

              {!isRental && pg && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-slate-700"><User size={16} className="text-gold-500" /> {pg.pg_type.replace('-', '/')} PG</div>
                  {pg.total_beds && <div className="flex items-center gap-2 text-slate-700"><Building2 size={16} className="text-gold-500" /> {pg.available_beds}/{pg.total_beds} Beds Available</div>}
                  {pg.meals_included && <div className="flex items-center gap-2 text-slate-700"><Coffee size={16} className="text-gold-500" /> Meals Included</div>}
                </div>
              )}
            </div>

            {/* Description */}
            {item.description && (
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <h2 className="font-serif text-xl font-bold text-slate-900 mb-3">About this property</h2>
                <p className="text-slate-600 leading-relaxed">{item.description}</p>
              </div>
            )}

            {/* Amenities */}
            {amenities.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <h2 className="font-serif text-xl font-bold text-slate-900 mb-4">Amenities</h2>
                <div className="flex flex-wrap gap-2">
                  {amenities.map((a) => <AmenityPill key={a} label={a} />)}
                </div>
              </div>
            )}

            {/* Room types (PG) */}
            {!isRental && pg && pg.room_types.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <h2 className="font-serif text-xl font-bold text-slate-900 mb-4">Room Types</h2>
                <div className="flex flex-wrap gap-2">
                  {pg.room_types.map(rt => (
                    <span key={rt} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm capitalize">{rt}</span>
                  ))}
                </div>
                {pg.price_includes.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-slate-700 mb-2">Price includes:</p>
                    <div className="flex flex-wrap gap-2">
                      {pg.price_includes.map(p => (
                        <span key={p} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-sm">
                          <CheckCircle2 size={13} /> {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Rules */}
            {rules.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <h2 className="font-serif text-xl font-bold text-slate-900 mb-4">House Rules</h2>
                <ul className="space-y-2">
                  {rules.map((r) => (
                    <li key={r} className="flex items-center gap-2 text-slate-600 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold-500 shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Availability */}
            {isRental && rental?.available_from && (
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <h2 className="font-serif text-xl font-bold text-slate-900 mb-3">Availability</h2>
                <div className="flex items-center gap-3 text-slate-700">
                  <Calendar size={18} className="text-gold-500" />
                  <span>Available from <strong>{new Date(rental.available_from).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></span>
                </div>
                {rental.minimum_lease_months > 0 && (
                  <p className="text-slate-500 text-sm mt-2">Minimum lease: {rental.minimum_lease_months} months</p>
                )}
                {rental.preferred_tenants?.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-slate-700 mb-1">Preferred tenants:</p>
                    <div className="flex flex-wrap gap-2">
                      {rental.preferred_tenants.map(t => (
                        <span key={t} className="px-3 py-1 bg-slate-100 text-slate-600 text-sm rounded-lg capitalize">{t}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Owner / Manager card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm sticky top-24">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                  <User size={20} className="text-slate-500" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{isRental ? (rental as Rental).owner_name : (pg as PGSpace).manager_name}</p>
                  <p className="text-sm text-slate-500">{isRental ? 'Property Owner' : 'PG Manager'}</p>
                </div>
              </div>

              <div className="space-y-3 mb-5">
                <div className="bg-gold-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold font-serif text-slate-900">
                    {isRental ? formatCurrency((rental as Rental).monthly_rent) : formatCurrency((pg as PGSpace).starting_price)}
                  </p>
                  <p className="text-slate-500 text-sm">{isRental ? 'per month' : 'per month onwards'}</p>
                </div>
                {isRental && rental?.security_deposit && (
                  <p className="text-sm text-slate-500 text-center">Security deposit: {formatCurrency(rental.security_deposit)}</p>
                )}
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setShowEnquiry(true)}
                  className="w-full py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Send Enquiry
                </button>
                <a
                  href={`tel:${isRental ? (rental as Rental).owner_phone : (pg as PGSpace).manager_phone}`}
                  className="w-full py-3 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:border-slate-400 transition-colors flex items-center justify-center gap-2"
                >
                  <Phone size={16} /> Call Now
                </a>
                <a
                  href={`https://wa.me/91${(isRental ? (rental as Rental).owner_phone : (pg as PGSpace).manager_phone).replace(/\D/g, '')}`}
                  target="_blank" rel="noopener noreferrer"
                  className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle size={16} /> WhatsApp
                </a>
              </div>

              {!isRental && pg && pg.rating > 0 && (
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} size={14} className={i <= Math.round(pg.rating) ? 'fill-gold-400 text-gold-400' : 'text-slate-300'} />
                    ))}
                  </div>
                  <span className="text-sm text-slate-600">{pg.rating.toFixed(1)} rating</span>
                </div>
              )}
            </div>

            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 text-sm text-amber-800">
              <strong>Note:</strong> Always verify the property in person before making any payment. Virasat Realty is a facilitator and is not liable for any disputes between tenants and landlords.
            </div>
          </div>
        </div>
      </div>

      {/* Enquiry Modal */}
      {showEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowEnquiry(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="font-serif text-xl font-bold text-slate-900">Send Enquiry</h3>
              <button onClick={() => setShowEnquiry(false)} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
            </div>
            {submitted ? (
              <div className="p-8 text-center">
                <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-3" />
                <h4 className="font-serif text-xl font-bold text-slate-900 mb-2">Enquiry Sent!</h4>
                <p className="text-slate-500 mb-5">We'll connect you with the {isRental ? 'owner' : 'manager'} shortly.</p>
                <button onClick={() => setShowEnquiry(false)} className="px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold">Done</button>
              </div>
            ) : (
              <form onSubmit={handleEnquiry} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name *</label>
                  <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none" placeholder="Your name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone *</label>
                  <input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none" placeholder="+91 XXXXX XXXXX" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none" placeholder="your@email.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Message</label>
                  <textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})} rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none resize-none"
                    placeholder="Tell us about your requirements..." />
                </div>
                <button type="submit" disabled={submitting}
                  className="w-full py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50">
                  {submitting ? 'Sending...' : 'Send Enquiry'}
                </button>
                {submitError && (
                  <p className="text-sm text-red-600 text-center">{submitError}</p>
                )}
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
