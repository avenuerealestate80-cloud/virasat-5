import { useEffect, useState, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useParams, Link } from 'react-router-dom';
import LeadModal from '../components/LeadModal';
import {
  MapPin,
  Bed,
  Bath,
  Maximize,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  ImageIcon,
  Shield,
  ShieldCheck,
  Building,
  Compass,
  Calendar,
  Eye,
  Phone,
  CalendarCheck,
  MessageCircle,
  Star,
  GraduationCap,
  Heart,
  ShoppingBag,
  Bus,
  Video,
  View,
  Share2,
  Link2,
  Check,
  ChevronDown,
  ChevronUp,
  PenLine,
  X,
  Sparkles,
  Clock,
  Flame,
  TrendingUp,
} from 'lucide-react';
import { supabase, type Property, type Review, type Locality } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { useAuthUI } from '../lib/authUI';
import { useCompare } from '../lib/compare';
import { useRecentlyViewed } from '../lib/useRecentlyViewed';
import SiteVisitModal from '../components/SiteVisitModal';
import EMICalculator from '../components/EMICalculator';
import StampDutyCalculator from '../components/StampDutyCalculator';

const FALLBACK_IMG =
  'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1600';

function getEmbedUrl(url: string): string {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return url;
}

const AMENITY_META: Record<
  string,
  { label: string; icon: typeof GraduationCap }
> = {
  schools: { label: 'Schools & Education', icon: GraduationCap },
  hospitals: { label: 'Hospitals & Healthcare', icon: Heart },
  shopping: { label: 'Shopping & Retail', icon: ShoppingBag },
  transport: { label: 'Transport & Connectivity', icon: Bus },
};

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { openAuth } = useAuthUI();
  const { toggleCompare, isComparing } = useCompare();

  const [property, setProperty] = useState<Property | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [similar, setSimilar] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  // Site visit modal
  const [showSiteVisit, setShowSiteVisit] = useState(false);
  const [leadOpen, setLeadOpen] = useState(false);
  const [leadType, setLeadType] = useState<'callback' | 'site_visit'>('callback');

  // Floor plan expand
  const [floorPlanOpen, setFloorPlanOpen] = useState(false);

  // Review form
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewBody, setReviewBody] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Share
  const [copied, setCopied] = useState(false);

  // Recently viewed + locality price trend
  const { trackView } = useRecentlyViewed();
  const [locality, setLocality] = useState<Locality | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      setLoading(true);
      setNotFound(false);
      setActiveImage(0);

      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const prop = data as Property;
      setProperty(prop);

      // Increment views count (fire and forget)
      supabase
        .from('properties')
        .update({ views_count: (prop.views_count ?? 0) + 1 })
        .eq('id', id)
        .then();

      // Fetch reviews
      const { data: reviewData } = await supabase
        .from('reviews')
        .select('*')
        .eq('property_id', id)
        .order('created_at', { ascending: false });
      if (reviewData) setReviews(reviewData as Review[]);

      // Fetch similar properties (same type, exclude current)
      const { data: similarData } = await supabase
        .from('properties')
        .select('*')
        .eq('type', prop.type)
        .neq('id', id)
        .limit(3);
      if (similarData) setSimilar(similarData as Property[]);

      // Fetch locality price trend (match property.location to locality.name)
      if (prop.location) {
        const { data: localityData } = await supabase
          .from('localities')
          .select('*')
          .eq('name', prop.location)
          .maybeSingle();
        if (localityData) setLocality(localityData as Locality);
        else setLocality(null);
      } else {
        setLocality(null);
      }

      setLoading(false);
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Track recently viewed once the property is loaded
  useEffect(() => {
    if (property) {
      trackView(property.id);
    }
  }, [property, trackView]);

  const allImages = useMemo(() => {
    if (!property) return [];
    return [property.image_url, ...(property.gallery || [])].filter(Boolean) as string[];
  }, [property]);

  const avgRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  }, [reviews]);

  const daysSinceListing = useMemo(() => {
    if (!property) return 0;
    const created = new Date(property.created_at).getTime();
    const now = Date.now();
    return Math.max(0, Math.floor((now - created) / (1000 * 60 * 60 * 24)));
  }, [property]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const openLead = (type: 'callback' | 'site_visit') => {
    if (type === 'site_visit') {
      setShowSiteVisit(true);
    } else {
      setLeadType(type);
      setLeadOpen(true);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError(null);

    if (!user) {
      setReviewError('Please sign in to write a review.');
      return;
    }

    setReviewSubmitting(true);
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        property_id: id,
        user_id: user.id,
        reviewer_name: reviewName,
        rating: reviewRating,
        title: reviewTitle || null,
        body: reviewBody || null,
        is_verified_buyer: false,
      })
      .select()
      .single();

    if (error) {
      setReviewError('Could not submit review. Please try again.');
      setReviewSubmitting(false);
      return;
    }

    if (data) {
      setReviews([data as Review, ...reviews]);
    }
    setReviewSuccess(true);
    setReviewSubmitting(false);
    setReviewName('');
    setReviewRating(5);
    setReviewTitle('');
    setReviewBody('');
    setTimeout(() => {
      setReviewSuccess(false);
      setReviewFormOpen(false);
    }, 2000);
  };

  /* ---------------- Loading ---------------- */
  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 size={40} className="text-gold-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading property details…</p>
        </div>
      </div>
    );
  }

  /* ---------------- Not Found ---------------- */
  if (notFound || !property) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Building size={36} className="text-slate-500" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-slate-900 mb-3">
            Project Not Found
          </h2>
          <p className="text-slate-600 mb-8">
            The property you are looking for may have been removed or does not exist.
          </p>
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-900 transition-colors"
          >
            <ArrowLeft size={18} /> Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  const statusStyles: Record<string, string> = {
    available: 'bg-green-100 text-green-800 border-green-200',
    'sold out': 'bg-red-100 text-red-800 border-red-200',
    'coming soon': 'bg-gold-100 text-gold-800 border-gold-200',
  };
  const statusDot: Record<string, string> = {
    available: 'bg-green-500',
    'sold out': 'bg-red-500',
    'coming soon': 'bg-gold-500',
  };

  const nearby = property.nearby_amenities ?? {};
  const nearbyCategories = Object.keys(nearby).filter(
    (k) => Array.isArray(nearby[k]) && (nearby[k] as any[]).length > 0
  );

  const whatsappText = encodeURIComponent(
    `I am interested in ${property.title}`
  );

  return (
    <div className="pt-20 min-h-screen bg-white">
      {/* ============ BREADCRUMB ============ */}
      <div className="bg-slate-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm flex-wrap">
            <Link to="/" className="text-slate-500 hover:text-slate-700 transition-colors">
              Home
            </Link>
            <span className="text-slate-300">/</span>
            <Link to="/projects" className="text-slate-500 hover:text-slate-700 transition-colors">
              Projects
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-800 font-medium truncate max-w-[200px] sm:max-w-xs">
              {property.title}
            </span>
          </nav>
        </div>
      </div>

      {/* ============ IMAGE GALLERY ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <div className="grid grid-cols-1 gap-4">
          {/* Main image */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-100 aspect-[16/10] sm:aspect-[16/9] group">
            {allImages.length > 0 ? (
              <img
                src={allImages[activeImage] || FALLBACK_IMG}
                alt={property.title}
                onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMG; }}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon size={56} className="text-slate-300" />
              </div>
            )}

            {/* Gradient overlay for legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

            {/* Status badge */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide border backdrop-blur-sm ${
                  statusStyles[property.status] || 'bg-slate-100 text-slate-900 border-slate-200'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusDot[property.status] || 'bg-slate-600'}`} />
                {property.status}
              </span>
              {property.is_verified && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-sm text-slate-900 border border-white/40">
                  <ShieldCheck size={14} className="text-green-600" />
                  Verified
                </span>
              )}
            </div>

            {/* Virtual tour / video buttons */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              {property.virtual_tour_url && (
                <a
                  href={property.virtual_tour_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-900/80 backdrop-blur-sm text-white hover:bg-slate-900 transition-colors"
                >
                  <View size={14} /> Virtual Tour
                </a>
              )}
              {property.video_url && (
                <a
                  href={property.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-sm text-slate-900 hover:bg-white transition-colors"
                >
                  <Video size={14} /> Watch Video
                </a>
              )}
            </div>

            {/* Image counter */}
            {allImages.length > 1 && (
              <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full text-xs font-medium bg-black/50 backdrop-blur-sm text-white">
                {activeImage + 1} / {allImages.length}
              </div>
            )}
          </div>

          {/* Thumbnail strip */}
          {allImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`shrink-0 w-24 h-20 sm:w-28 sm:h-22 rounded-xl overflow-hidden border-2 transition-all ${
                    activeImage === idx
                      ? 'border-gold-500 ring-2 ring-gold-200'
                      : 'border-transparent hover:border-slate-300 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`${property.title} ${idx + 1}`} onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMG; }} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============ MAIN CONTENT ============ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ---------- LEFT COLUMN (2/3) ---------- */}
          <div className="lg:col-span-2 space-y-10">
            {/* 3a. Header */}
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-900 capitalize">
                  <Building size={13} />
                  {property.type}
                </span>
                {property.vastu_compliant && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gold-50 text-gold-800 border border-gold-200">
                    <Compass size={13} />
                    Vastu Compliant
                  </span>
                )}
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight mb-4">
                {property.title}
              </h1>

              <div className="flex items-center gap-2 text-slate-700 mb-3">
                <MapPin size={18} className="text-gold-600 shrink-0" />
                <span className="text-base">{property.location}</span>
              </div>

              {property.rera_number && (
                <div className="group inline-flex items-center gap-2 mb-2">
                  <div className="relative">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-800 border border-green-200">
                      <Shield size={13} />
                      RERA: {property.rera_number}
                    </span>
                    <span className="absolute left-1/2 -translate-x-1/2 -bottom-9 whitespace-nowrap px-2 py-1 rounded bg-slate-900 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      RERA Registered
                    </span>
                  </div>
                </div>
              )}

              {property.builder && (
                <div className="flex items-center gap-2 text-slate-700 text-sm mt-3">
                  <Building size={16} className="text-slate-500" />
                  <span>by </span>
                  <span className="font-semibold text-slate-900">{property.builder}</span>
                </div>
              )}

              {/* Key stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
                {property.bedrooms !== null && property.bedrooms !== undefined && (
                  <StatCard icon={<Bed size={20} />} label="Configuration" value={`${property.bedrooms} BHK`} />
                )}
                {property.bathrooms !== null && property.bathrooms !== undefined && (
                  <StatCard icon={<Bath size={20} />} label="Bathrooms" value={`${property.bathrooms}`} />
                )}
                {property.area && (
                  <StatCard icon={<Maximize size={20} />} label="Area" value={property.area} />
                )}
                {property.facing && (
                  <StatCard icon={<Compass size={20} />} label="Facing" value={property.facing} />
                )}
                {property.age && (
                  <StatCard icon={<Clock size={20} />} label="Age" value={property.age} />
                )}
                {property.furnishing && (
                  <StatCard icon={<Sparkles size={20} />} label="Furnishing" value={property.furnishing} />
                )}
              </div>
            </div>

            {/* 3a. Price Trend */}
            {locality && locality.price_trend && Object.keys(locality.price_trend).length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={24} className="text-gold-500" />
                  <h2 className="font-serif text-2xl font-bold text-slate-900">
                    Price Trend - {locality.name}
                  </h2>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <div className="flex items-end justify-between gap-3 h-48 overflow-x-auto">
                    {(() => {
                      const entries = Object.entries(locality.price_trend as Record<string, number>);
                      const max = Math.max(...entries.map(([, v]) => v), 1);
                      return entries.map(([quarter, value]) => {
                        const heightPct = Math.max((value / max) * 100, 4);
                        return (
                          <div key={quarter} className="flex flex-col items-center justify-end gap-2 min-w-[64px] flex-1">
                            <span className="text-xs font-semibold text-slate-700">
                              ₹{Math.round(value).toLocaleString('en-IN')}
                            </span>
                            <div
                              className="w-full rounded-t-lg bg-gradient-to-t from-gold-500 to-gold-300 transition-all"
                              style={{ height: `${heightPct}%` }}
                              title={`₹${Math.round(value).toLocaleString('en-IN')} / sq.ft`}
                            />
                            <span className="text-xs text-slate-500 text-center leading-tight">{quarter}</span>
                          </div>
                        );
                      });
                    })()}
                  </div>
                  <p className="text-xs text-slate-400 mt-4 text-center">
                    Average price per sq.ft. by quarter
                  </p>
                </div>
              </section>
            )}

            {/* 3b. Description */}
            {property.description && (
              <section>
                <h2 className="font-serif text-2xl font-bold text-slate-900 mb-4">
                  About this property
                </h2>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              </section>
            )}

            {/* 3c. Features & Amenities */}
            {property.features && property.features.length > 0 && (
              <section>
                <h2 className="font-serif text-2xl font-bold text-slate-900 mb-5">
                  Features
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {property.features.map((feature, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100"
                    >
                      <CheckCircle2 size={20} className="text-gold-600 shrink-0" />
                      <span className="text-slate-800 text-sm font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {property.amenities && property.amenities.length > 0 && (
              <section>
                <h2 className="font-serif text-2xl font-bold text-slate-900 mb-5">
                  Amenities
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {property.amenities.map((amenity, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200"
                    >
                      <CheckCircle2 size={20} className="text-gold-600 shrink-0" />
                      <span className="text-slate-800 text-sm font-medium">{amenity}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 3d. Floor Plan */}
            {property.floor_plan_url && (
              <section>
                <button
                  onClick={() => setFloorPlanOpen((v) => !v)}
                  className="w-full flex items-center justify-between p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-gold-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gold-50 text-gold-700 flex items-center justify-center">
                      <Maximize size={20} />
                    </div>
                    <div className="text-left">
                      <h2 className="font-serif text-xl font-bold text-slate-900">Floor Plan</h2>
                      <p className="text-sm text-slate-600">View the layout of this property</p>
                    </div>
                  </div>
                  {floorPlanOpen ? (
                    <ChevronUp size={22} className="text-slate-500" />
                  ) : (
                    <ChevronDown size={22} className="text-slate-500" />
                  )}
                </button>
                {floorPlanOpen && (
                  <div className="mt-4 rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 p-4">
                    <img
                      src={property.floor_plan_url}
                      alt={`${property.title} floor plan`}
                      onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMG; }}
                      className="w-full h-auto rounded-lg"
                    />
                  </div>
                )}
              </section>
            )}

            {/* 3e. Video & Virtual Tour */}
            {(property.video_url || property.virtual_tour_url) && (
              <section>
                <h2 className="font-serif text-xl font-bold text-slate-900 mb-4">Video & Virtual Tour</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {property.video_url && (
                    <div className="rounded-2xl overflow-hidden border border-slate-100 bg-black aspect-video">
                      <iframe
                        src={getEmbedUrl(property.video_url)}
                        title={`${property.title} video`}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}
                  {property.virtual_tour_url && (
                    <div className="rounded-2xl overflow-hidden border border-slate-100 bg-black aspect-video">
                      <iframe
                        src={property.virtual_tour_url}
                        title={`${property.title} virtual tour`}
                        className="w-full h-full"
                        allow="fullscreen; xr-spatial-tracking"
                        allowFullScreen
                      />
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* 3d. Unit Configurations */}
            {(() => {
              const bhk = property.bedrooms ?? null;
              const area = property.area_value ?? null;
              const price = property.price_value ?? null;
              const ppsf = property.price_per_sqft ?? null;

              type Row = { config: string; area: string; price: string; ppsf: string; current?: boolean };
              const rows: Row[] = [];

              if (bhk !== null) {
                // Current unit
                if (area !== null && price !== null) {
                  rows.push({
                    config: `${bhk} BHK`,
                    area: `${area.toLocaleString('en-IN')} sq.ft`,
                    price: `₹${price.toLocaleString('en-IN')}`,
                    ppsf: ppsf != null ? `₹${ppsf.toLocaleString('en-IN')}` : '—',
                    current: true,
                  });
                }
                // Variants
                const variants = [bhk - 1, bhk + 1, bhk + 2].filter((v) => v >= 1 && v !== bhk);
                for (const v of variants) {
                  const estArea = area != null ? Math.round(area * (0.7 + 0.15 * (v - bhk))) : null;
                  const estPrice = ppsf != null && estArea != null ? ppsf * estArea : null;
                  rows.push({
                    config: `${v} BHK`,
                    area: estArea != null ? `${estArea.toLocaleString('en-IN')} sq.ft*` : 'On request',
                    price: estPrice != null ? `₹${estPrice.toLocaleString('en-IN')}*` : 'Available on request',
                    ppsf: ppsf != null ? `₹${ppsf.toLocaleString('en-IN')}` : '—',
                  });
                }
              } else if (area !== null && price !== null) {
                rows.push({
                  config: 'Base Unit',
                  area: `${area.toLocaleString('en-IN')} sq.ft`,
                  price: `₹${price.toLocaleString('en-IN')}`,
                  ppsf: ppsf != null ? `₹${ppsf.toLocaleString('en-IN')}` : '—',
                  current: true,
                });
              }

              if (rows.length === 0) return null;

              return (
                <section>
                  <h2 className="font-serif text-2xl font-bold text-slate-900 mb-5">
                    Unit Configurations
                  </h2>
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[480px]">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-5 py-3 font-serif text-sm font-semibold text-slate-700">Configuration</th>
                          <th className="px-5 py-3 font-serif text-sm font-semibold text-slate-700">Area</th>
                          <th className="px-5 py-3 font-serif text-sm font-semibold text-slate-700">Price</th>
                          <th className="px-5 py-3 font-serif text-sm font-semibold text-slate-700">Price/sqft</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((r, i) => (
                          <tr
                            key={r.config}
                            className={`border-b border-slate-100 last:border-0 ${i % 2 === 1 ? 'bg-slate-50/50' : ''} ${r.current ? 'bg-gold-50/40' : ''}`}
                          >
                            <td className="px-5 py-3 text-sm font-semibold text-slate-800">
                              {r.config}
                              {r.current && (
                                <span className="ml-2 text-xs text-gold-600 font-medium">This unit</span>
                              )}
                            </td>
                            <td className="px-5 py-3 text-sm text-slate-600">{r.area}</td>
                            <td className="px-5 py-3 text-sm text-slate-600">{r.price}</td>
                            <td className="px-5 py-3 text-sm text-slate-600">{r.ppsf}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    </div>
                    <p className="text-xs text-slate-400 px-5 py-3 bg-slate-50/30">
                      * Estimated configurations — confirm availability &amp; pricing with the sales team.
                    </p>
                  </div>
                </section>
              );
            })()}

            {/* 3e. Specifications */}
            <section>
              <h2 className="font-serif text-2xl font-bold text-slate-900 mb-5">
                Specifications
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { cat: 'Flooring', spec: 'Vitrified tiles in living & bedrooms; anti-skid ceramic in balconies' },
                  { cat: 'Doors', spec: 'Engineered hardwood entrance door; flush internal doors with premium hardware' },
                  { cat: 'Windows', spec: 'UPVC frame windows with mosquito mesh & safety grilles' },
                  { cat: 'Kitchen', spec: 'Granite platform with stainless steel sink; provision for chimney & hob' },
                  { cat: 'Bathroom', spec: 'Premium CP fittings; anti-skid ceramic tiles; branded sanitaryware' },
                  { cat: 'Electrical', spec: 'Copper concealed wiring; modular switches; backup power provision' },
                  { cat: 'Walls', spec: 'AAC block walls with plaster; exterior weatherproof textured finish' },
                  { cat: 'Paint', spec: 'Premium acrylic emulsion interior; weatherproof exterior paint' },
                ].map((s) => (
                  <div
                    key={s.cat}
                    className="bg-white rounded-2xl border border-slate-200 p-4 flex items-start gap-3"
                  >
                    <CheckCircle2 size={22} className="text-gold-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-serif text-base font-semibold text-slate-900">{s.cat}</h3>
                      <p className="text-sm text-slate-600 mt-0.5">{s.spec}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 3f. Nearby Amenities */}
            {nearbyCategories.length > 0 && (
              <section>
                <h2 className="font-serif text-2xl font-bold text-slate-900 mb-5">
                  Nearby Amenities
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {nearbyCategories.map((category) => {
                    const meta = AMENITY_META[category.toLowerCase()];
                    const Icon = meta?.icon || MapPin;
                    const items = (nearby[category] as any[]).filter(Boolean);
                    return (
                      <div
                        key={category}
                        className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-lg bg-gold-50 text-gold-700 flex items-center justify-center">
                            <Icon size={18} />
                          </div>
                          <h3 className="font-serif text-lg font-bold text-slate-900">
                            {meta?.label || capitalize(category)}
                          </h3>
                        </div>
                        <ul className="space-y-2">
                          {items.map((item, i) => {
                            const label =
                              typeof item === 'string'
                                ? item
                                : item.name || item.label || '—';
                            const distance =
                              typeof item === 'object' && item !== null
                                ? item.distance
                                : null;
                            return (
                              <li
                                key={i}
                                className="flex items-center justify-between gap-3 text-sm py-1.5 border-b border-slate-50 last:border-0"
                              >
                                <span className="text-slate-800">{label}</span>
                                {distance && (
                                  <span className="text-slate-500 text-xs whitespace-nowrap">
                                    {distance}
                                  </span>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* 3f. Reviews */}
            <section id="reviews">
              <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-slate-900">
                    Resident Reviews
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          size={18}
                          className={
                            i <= Math.round(avgRating)
                              ? 'fill-gold-400 text-gold-400'
                              : 'text-slate-200'
                          }
                        />
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-slate-900">
                      {avgRating.toFixed(1)}
                    </span>
                    <span className="text-sm text-slate-500">
                      ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setReviewFormOpen((v) => !v)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-900 transition-colors"
                >
                  <PenLine size={16} />
                  Write a Review
                </button>
              </div>

              {/* Review form */}
              {reviewFormOpen && (
                <div className="mb-6 p-6 rounded-2xl border border-slate-100 bg-slate-50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-serif text-lg font-bold text-slate-900">
                      Share your experience
                    </h3>
                    <button
                      onClick={() => setReviewFormOpen(false)}
                      className="text-slate-500 hover:text-slate-800 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {reviewSuccess ? (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200">
                      <CheckCircle2 size={22} className="text-green-600 shrink-0" />
                      <p className="text-green-800 font-medium">
                        Thank you! Your review has been submitted.
                      </p>
                    </div>
                  ) : !user ? (
                    <div className="flex flex-col items-center text-center py-6">
                      <p className="text-slate-700 mb-4">
                        Please sign in to write a review.
                      </p>
                      <button
                        onClick={() => openAuth('signin')}
                        className="text-slate-800 font-medium underline hover:text-slate-900"
                      >
                        Sign in to continue
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-800 mb-1.5">
                          Your Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={reviewName}
                          onChange={(e) => setReviewName(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none transition-all bg-white"
                          placeholder="Enter your name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-800 mb-1.5">
                          Rating
                        </label>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setReviewRating(i)}
                              className="p-1"
                            >
                              <Star
                                size={28}
                                className={
                                  i <= reviewRating
                                    ? 'fill-gold-400 text-gold-400 transition-all'
                                    : 'text-slate-200 hover:text-gold-300 transition-all'
                                }
                              />
                            </button>
                          ))}
                          <span className="ml-2 text-sm font-medium text-slate-800">
                            {reviewRating} / 5
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-800 mb-1.5">
                          Title
                        </label>
                        <input
                          type="text"
                          value={reviewTitle}
                          onChange={(e) => setReviewTitle(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none transition-all bg-white"
                          placeholder="Summarize your experience"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-800 mb-1.5">
                          Review
                        </label>
                        <textarea
                          value={reviewBody}
                          onChange={(e) => setReviewBody(e.target.value)}
                          rows={4}
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none transition-all resize-none bg-white"
                          placeholder="Tell others about your experience…"
                        />
                      </div>

                      {reviewError && (
                        <p className="text-sm text-red-600">{reviewError}</p>
                      )}

                      <button
                        type="submit"
                        disabled={reviewSubmitting}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-900 transition-colors disabled:opacity-50"
                      >
                        {reviewSubmitting ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <Check size={18} />
                        )}
                        {reviewSubmitting ? 'Submitting…' : 'Submit Review'}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Review list */}
              {reviews.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100">
                  <Star size={36} className="text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600">
                    No reviews yet. Be the first to share your experience.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="p-5 rounded-2xl border border-slate-100 bg-white hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <Star
                                  key={i}
                                  size={14}
                                  className={
                                    i <= review.rating
                                      ? 'fill-gold-400 text-gold-400'
                                      : 'text-slate-200'
                                  }
                                />
                              ))}
                            </div>
                            {review.is_verified_buyer && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                                <ShieldCheck size={11} />
                                Verified Buyer
                              </span>
                            )}
                          </div>
                          {review.title && (
                            <h4 className="font-serif text-base font-bold text-slate-900">
                              {review.title}
                            </h4>
                          )}
                        </div>
                        <span className="text-xs text-slate-500 whitespace-nowrap">
                          {formatDate(review.created_at)}
                        </span>
                      </div>
                      {review.body && (
                        <p className="text-slate-700 text-sm leading-relaxed mb-3">
                          {review.body}
                        </p>
                      )}
                      <div className="text-sm font-medium text-slate-900">
                        — {review.reviewer_name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* ---------- RIGHT COLUMN (sticky sidebar) ---------- */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-5">
              {/* Agent contact card */}
              {(() => {
                const builderName = property.builder ?? 'Sales Team';
                const initial = builderName.trim().charAt(0).toUpperCase() || 'S';
                const phone = '+91 70157 14787';
                const phoneHref = '+917015714787';
                const waText = encodeURIComponent(
                  `Hi, I'm interested in ${property.title} (${property.location}). Could you share more details?`
                );
                return (
                  <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gold-500 text-white flex items-center justify-center font-serif text-xl font-bold flex-shrink-0">
                        {initial}
                      </div>
                      <div className="min-w-0">
                        <div className="font-serif font-semibold text-slate-900 truncate">{builderName}</div>
                        <div className="text-xs text-gold-600 font-medium">Authorized Partner</div>
                      </div>
                    </div>
                    <a href={`tel:${phoneHref}`} className="flex items-center gap-2 mt-3 text-sm text-slate-700 hover:text-gold-600 transition-colors">
                      <Phone size={15} className="text-gold-500" />
                      {phone}
                    </a>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <a
                        href={`tel:${phoneHref}`}
                        className="flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
                      >
                        <Phone size={15} />
                        Call
                      </a>
                      <a
                        href={`https://wa.me/${phoneHref.replace(/\D/g, '')}?text=${waText}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
                      >
                        <MessageCircle size={15} />
                        WhatsApp
                      </a>
                    </div>
                  </div>
                );
              })()}

              {/* 3g. Price box */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="text-slate-600 text-sm mb-1">Starting Price</div>
                <div className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 mb-1">
                  {property.price}
                </div>
                {property.price_per_sqft != null && (
                  <div className="text-sm text-slate-600 mb-4">
                    ₹{property.price_per_sqft.toLocaleString('en-IN')} / sq.ft.
                  </div>
                )}

                <div className="space-y-2.5 pt-4 border-t border-slate-100">
                  {property.possession_date && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 flex items-center gap-2">
                        <Calendar size={15} className="text-slate-500" />
                        Possession
                      </span>
                      <span className="font-medium text-slate-900">
                        {formatDate(property.possession_date)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 flex items-center gap-2">
                      <Clock size={15} className="text-slate-500" />
                      Listed
                    </span>
                    <span className="font-medium text-slate-900">
                      {daysSinceListing} {daysSinceListing === 1 ? 'day' : 'days'} ago
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 flex items-center gap-2">
                      <Eye size={15} className="text-slate-500" />
                      Views
                    </span>
                    <span className="font-medium text-slate-900">
                      {(property.views_count ?? 0) + 1}
                    </span>
                  </div>
                </div>
              </div>

              {/* CTA buttons */}
              <div className="space-y-3">
                {(property as any).weekly_enquiries > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl">
                    <Flame size={14} className="text-amber-500 shrink-0" />
                    <p className="text-xs text-amber-800 font-medium">
                      {(property as any).weekly_enquiries} people enquired this week
                    </p>
                  </div>
                )}
                <button
                  onClick={() => openLead('callback')}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-900 transition-colors shadow-sm"
                >
                  <Phone size={18} />
                  Request Callback
                </button>
                <button
                  onClick={() => openLead('site_visit')}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-gold-500 text-slate-900 rounded-xl font-semibold hover:bg-gold-600 transition-colors shadow-sm"
                >
                  <CalendarCheck size={18} />
                  Schedule Site Visit
                </button>
                <a
                  href={`https://wa.me/917015714787?text=${whatsappText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-sm"
                >
                  <MessageCircle size={18} />
                  WhatsApp
                </a>
              </div>

              {/* Compare toggle */}
              <button
                onClick={() => toggleCompare(property.id)}
                className={`w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium border transition-colors ${
                  isComparing(property.id)
                    ? 'bg-slate-900 text-white border-slate-900 hover:bg-slate-900'
                    : 'bg-white text-slate-800 border-slate-200 hover:border-slate-500'
                }`}
              >
                <CheckCircle2 size={18} />
                {isComparing(property.id) ? 'Added to Compare' : 'Add to Compare'}
              </button>

              {/* 3i. EMI Calculator */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <EMICalculator
                  defaultPrice={property.price_value ?? 4500000}
                  compact
                />
              </div>

              {/* 3i-b. Stamp Duty Calculator */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <StampDutyCalculator
                  defaultValue={property.price_value ?? 4500000}
                  compact
                />
              </div>

              {/* 3j. Share */}
              <div className="rounded-2xl border border-slate-100 bg-white p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Share2 size={18} className="text-slate-600" />
                  <h3 className="font-serif text-base font-bold text-slate-900">
                    Share this property
                  </h3>
                </div>
                <button
                  onClick={handleCopyLink}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-800 text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check size={16} className="text-green-600" />
                      Link Copied!
                    </>
                  ) : (
                    <>
                      <Link2 size={16} />
                      Copy Link
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============ SIMILAR PROPERTIES ============ */}
      {similar.length > 0 && (
        <section className="bg-slate-50 border-t border-slate-100 mt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-8">
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
                  Similar Properties
                </h2>
                <p className="text-slate-600 text-sm mt-1">
                  Other {property.type} projects you may like
                </p>
              </div>
              <Link
                to="/projects"
                className="inline-flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
              >
                View all <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {similar.map((p) => (
                <Link
                  key={p.id}
                  to={`/projects/${p.id}`}
                  className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={p.image_url || FALLBACK_IMG}
                      alt={p.title}
                      onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMG; }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${
                          p.status === 'available'
                            ? 'bg-green-500 text-white'
                            : p.status === 'sold out'
                            ? 'bg-red-500 text-white'
                            : 'bg-gold-500 text-slate-900'
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-1 text-slate-500 text-xs mb-2">
                      <MapPin size={13} />
                      <span className="truncate">{p.location}</span>
                    </div>
                    <h3 className="font-serif text-lg font-bold text-slate-900 mb-3 group-hover:text-slate-800 transition-colors line-clamp-1">
                      {p.title}
                    </h3>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <div>
                        <div className="text-xs text-slate-500">Price</div>
                        <div className="font-serif text-base font-bold text-slate-900">
                          {p.price}
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-gold-700 group-hover:text-gold-800">
                        Details <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Site Visit Modal */}
      {showSiteVisit && (
        <SiteVisitModal
          propertyId={property.id}
          propertyTitle={property.title}
          onClose={() => setShowSiteVisit(false)}
        />
      )}
      {/* Lead Modal (callback) */}
      <LeadModal
        isOpen={leadOpen}
        onClose={() => setLeadOpen(false)}
        propertyId={property.id}
        propertyTitle={property.title}
        defaultType={leadType}
      />
    </div>
  );
}

/* ---------------- Helper components ---------------- */

function StatCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
      <div className="text-gold-600 mb-2">{icon}</div>
      <div className="text-slate-900 font-semibold text-sm">{value}</div>
      <div className="text-slate-500 text-xs">{label}</div>
    </div>
  );
}

/* ---------------- Helpers ---------------- */

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
