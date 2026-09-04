import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  MapPin,
  MapPinned,
  Home,
  Building2,
  Castle,
  Shield,
  Tag,
  Users,
  Award,
  BadgeCheck,
  Calculator,
  Scale,
  TrendingUp,
  Star,
  Quote,
  Handshake,
  FileCheck,
  Headphones,
  Phone,
  Search,
  Bed,
  Bath,
  Maximize,
  Footprints,
  Calendar,
  User,
  ChevronDown,
  Loader2,
  CheckCircle2,
  CreditCard,
  Gavel,
  Heart,
  Sparkles,
  Landmark,
  Flame,
} from 'lucide-react';
import { supabase, type Property, type BlogPost, type Locality } from '../lib/supabase';
import LeadModal from '../components/LeadModal';
import { useRecentlyViewed } from '../lib/useRecentlyViewed';

const FALLBACK_IMG =
  'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1200';

const PROPERTY_TYPES = [
  { key: 'all', label: 'All' },
  { key: 'residential', label: 'Residential' },
  { key: 'commercial', label: 'Commercial' },
  { key: 'plot', label: 'Plot' },
  { key: 'villa', label: 'Villa' },
];

const BUDGET_RANGES = [
  { key: 'all', label: 'Any Budget' },
  { key: 'under-25l', label: 'Under Rs 25L' },
  { key: '25l-50l', label: 'Rs 25L - Rs 50L' },
  { key: '50l-1cr', label: 'Rs 50L - Rs 1Cr' },
  { key: 'above-1cr', label: 'Above Rs 1Cr' },
];

function AnimatedCounter({ end, suffix = '', duration = 2000 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const startTime = Date.now();
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.4 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

function formatPrice(p: Property): string {
  if (p.price_value) {
    if (p.price_value >= 1_00_00_000) return `Rs ${(p.price_value / 1_00_00_000).toFixed(2)} Cr`;
    if (p.price_value >= 1_00_000) return `Rs ${(p.price_value / 1_00_000).toFixed(2)} L`;
    return `Rs ${p.price_value.toLocaleString('en-IN')}`;
  }
  return p.price;
}

function formatPricePerSqft(p: Property): string {
  if (p.price_per_sqft !== null) return `Rs ${p.price_per_sqft.toLocaleString('en-IN')}/sqft`;
  if (p.price_value && p.area_value) return `Rs ${Math.round(p.price_value / p.area_value).toLocaleString('en-IN')}/sqft`;
  return '-';
}

function statusBadgeClass(status: string): string {
  if (status === 'available') return 'bg-emerald-600 text-white';
  if (status === 'sold out') return 'bg-red-600 text-white';
  return 'bg-gold-500 text-slate-950';
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

function categoryColor(category: string): string {
  const map: Record<string, string> = {
    'Buying Guide': 'bg-emerald-100 text-emerald-700',
    Legal: 'bg-rose-100 text-rose-700',
    'Market Trends': 'bg-sky-100 text-sky-700',
    'Locality Guide': 'bg-indigo-100 text-indigo-700',
  };
  return map[category] || 'bg-slate-100 text-slate-700';
}

function formatLocalityPrice(value: number | null): string {
  if (value === null) return '-';
  if (value >= 10000000) return `Rs ${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `Rs ${(value / 100000).toFixed(2)} L`;
  if (value >= 1000) return `Rs ${(value / 1000).toFixed(0)}K`;
  return `Rs ${value}`;
}

export default function HomePage() {
  const navigate = useNavigate();
  const [searchType, setSearchType] = useState('all');
  const [searchBudget, setSearchBudget] = useState('all');
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [trendingProjects, setTrendingProjects] = useState<{ id: string; name: string; location: string; price: string; tag: string | null; tagColor: string }[]>([]);
  const [testimonials, setTestimonials] = useState<{ id: string; name: string; designation: string | null; photo_url: string | null; rating: number; body: string; location: string | null; property_type: string | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const { recentProperties } = useRecentlyViewed();

  useEffect(() => {
    async function fetchAll() {
      const [featuredRes, countsRes, localitiesRes, blogRes, trendingRes, testimonialsRes] = await Promise.all([
        supabase.from('properties').select('*').eq('status', 'available').limit(3).order('views_count', { ascending: false }),
        supabase.from('properties').select('type'),
        supabase.from('localities').select('*').limit(3),
        supabase.from('blog_posts').select('*').eq('published', true).order('published_at', { ascending: false }).limit(2),
        supabase.from('properties').select('id, name, location, price, status, type').eq('status', 'available').order('views_count', { ascending: false }).limit(6),
        supabase.from('testimonials').select('id, name, designation, photo_url, rating, body, location, property_type').eq('active', true).order('sort_order', { ascending: true }).limit(6),
      ]);
      if (featuredRes.data) setFeaturedProperties(featuredRes.data as Property[]);
      if (countsRes.data) {
        const counts: Record<string, number> = {};
        (countsRes.data as Pick<Property, 'type'>[]).forEach((row) => {
          counts[row.type] = (counts[row.type] || 0) + 1;
        });
        setCategoryCounts(counts);
      }
      if (localitiesRes.data) setLocalities(localitiesRes.data as Locality[]);
      if (blogRes.data) setBlogPosts(blogRes.data as BlogPost[]);
      if (trendingRes.data) {
        const tagColors = ['bg-gold-500', 'bg-emerald-600', 'bg-blue-600', 'bg-rose-600'];
        setTrendingProjects((trendingRes.data as any[]).map((p, i) => ({
          id: p.id,
          name: p.name,
          location: p.location || '',
          price: p.price || '',
          tag: i === 0 ? 'HOT' : i === 1 ? 'NEW' : null,
          tagColor: tagColors[i % tagColors.length],
        })));
      }
      if (testimonialsRes.data) setTestimonials(testimonialsRes.data as any[]);
      setLoading(false);
    }
    fetchAll();
  }, []);

  const searchQuery = useMemo(() => {
    const params = new URLSearchParams();
    if (searchType !== 'all') params.set('type', searchType);
    if (searchBudget !== 'all') params.set('budget', searchBudget);
    const qs = params.toString();
    return qs ? `?${qs}` : '';
  }, [searchType, searchBudget]);

  const stats = [
    { value: 15, suffix: '+', label: 'Years Experience', icon: Award },
    { value: 500, suffix: '+', label: 'Happy Families', icon: Heart },
    { value: 25, suffix: '+', label: 'Projects Completed', icon: Building2 },
    { value: 100, suffix: '+', label: 'Bank Partners', icon: CreditCard },
  ];

  const categories = [
    { icon: Home, title: 'Residential', desc: '2, 3 & 4 BHK apartments with modern amenities', type: 'residential', image: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800', accent: 'from-emerald-600/90 to-teal-800/90' },
    { icon: Building2, title: 'Commercial', desc: 'Shops, offices & showrooms in prime locations', type: 'commercial', image: 'https://images.pexels.com/photos/1170412/pexels-photo-1170412.jpeg?auto=compress&cs=tinysrgb&w=800', accent: 'from-blue-600/90 to-slate-900/90' },
    { icon: MapPin, title: 'Plots', desc: 'Residential plots in gated communities', type: 'plot', image: 'https://images.pexels.com/photos/440731/pexels-photo-440731.jpeg?auto=compress&cs=tinysrgb&w=800', accent: 'from-amber-600/90 to-orange-900/90' },
    { icon: Castle, title: 'Villas', desc: 'Independent luxury villas with private gardens', type: 'villa', image: 'https://images.pexels.com/photos/1732414/pexels-photo-1732414.jpeg?auto=compress&cs=tinysrgb&w=800', accent: 'from-rose-600/90 to-slate-900/90' },
  ];

  const services = [
    { icon: CreditCard, title: 'Home Loans', desc: 'Compare 100+ banks. Get instant eligibility check with rates starting at 8.40%.', to: '/home-loans', stats: 'Rs 25,000 Cr+ disbursed' },
    { icon: Home, title: 'Rentals & PG', desc: 'Find verified rental apartments and PG spaces with zero brokerage fees.', to: '/rentals', stats: '1,000+ listings' },
    { icon: Gavel, title: 'Legal Services', desc: 'Rent agreements, sale deeds, and all property documents - done online.', to: '/legal', stats: '10,000+ documents' },
  ];

  return (
    <div className="bg-white">
      {/* HERO */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1920" alt="Luxury property" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/97 via-slate-950/80 to-slate-950/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/40" />
        </div>

        {/* Animated floating elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-1/4 w-48 h-48 bg-slate-800/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-gold-400 rounded-full animate-pulse" />
          <div className="absolute top-1/2 right-20 w-1 h-1 bg-gold-300 rounded-full animate-pulse delay-300" />
          <div className="absolute top-2/3 right-1/2 w-1.5 h-1.5 bg-gold-400 rounded-full animate-pulse delay-500" />
          <div className="absolute top-1/4 right-1/4 w-1 h-1 bg-gold-300 rounded-full animate-pulse delay-700" />
        </div>

        {/* Trending ticker — vertical right sidebar */}
        <div className="hidden lg:flex absolute top-0 right-0 bottom-0 w-56 bg-slate-900/40 backdrop-blur-md border-l border-white/15 overflow-hidden z-20 flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Flame size={14} className="text-gold-400" />
              <span className="text-gold-300 text-xs font-bold uppercase tracking-widest">Trending</span>
            </div>
            <span className="text-white/30 text-[10px] font-medium">LIVE</span>
          </div>
          <div className="flex-1 overflow-hidden relative">
            <div className="flex flex-col animate-marquee-vertical">
              {[...trendingProjects, ...trendingProjects].map((project, idx) => (
                <button
                  key={idx}
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="group flex flex-col gap-1.5 px-4 py-4 border-b border-white/5 hover:bg-gold-500/10 transition-all duration-300 text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-400/60 group-hover:bg-gold-400 group-hover:scale-125 transition-all shrink-0" />
                    <span className="text-white/90 text-xs font-semibold truncate group-hover:text-gold-300 transition-colors">{project.name}</span>
                  </div>
                  <span className="text-white/40 text-[11px] pl-3.5 truncate group-hover:text-white/60 transition-colors">{project.location}</span>
                  <div className="flex items-center justify-between pl-3.5">
                    <span className="text-gold-400/90 text-xs font-bold group-hover:text-gold-300 transition-colors">{project.price}</span>
                    {project.tag && (
                      <span className={`px-1.5 py-0.5 rounded text-[10px] text-white font-medium ${project.tagColor}`}>{project.tag}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-slate-900/40 to-transparent pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-slate-900/40 to-transparent pointer-events-none" />
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-36 w-full mt-10 lg:pr-56">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500/10 backdrop-blur-md rounded-full border border-gold-400/30">
                  <Sparkles size={14} className="text-gold-400" />
                  <span className="text-gold-300 text-sm font-medium">Trusted Real Estate Partner in Sohna</span>
                </div>
                <div className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 backdrop-blur-md rounded-full border border-emerald-400/30">
                  <BadgeCheck size={14} className="text-emerald-400" />
                  <span className="text-emerald-300 text-sm font-medium">RERA Registered</span>
                </div>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.1] mb-4 sm:mb-6">
                Find Your <span className="text-gold-400">Dream Home</span>
                <br />With Confidence
              </h1>

              <p className="text-slate-300 text-base sm:text-lg lg:text-xl leading-relaxed mb-6 sm:mb-10 max-w-xl">
                Discover premium residential, commercial, and plot properties in Sohna. Complete transparency, verified listings, and end-to-end support from search to registration.
              </p>

              {/* Search Box */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-2xl w-full max-w-xl border border-white/50">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Property Type</label>
                    <select value={searchType} onChange={(e) => setSearchType(e.target.value)} className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-gold-400 focus:border-transparent cursor-pointer">
                      {PROPERTY_TYPES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Budget</label>
                    <select value={searchBudget} onChange={(e) => setSearchBudget(e.target.value)} className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-gold-400 focus:border-transparent cursor-pointer">
                      {BUDGET_RANGES.map((b) => <option key={b.key} value={b.key}>{b.label}</option>)}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <Link to={`/projects${searchQuery}`} className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-900 to-slate-950 hover:from-slate-900 hover:to-slate-900 text-white font-semibold rounded-xl transition-all shadow-lg shadow-slate-900/30">
                      <Search size={18} />
                      Search
                    </Link>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="shrink-0">Popular:</span>
                  {['2BHK Flats', 'Under 50L', 'Commercial', 'Plots'].map((term) => (
                    <Link key={term} to={`/projects?q=${encodeURIComponent(term)}`} className="px-3 py-1 bg-slate-50 hover:bg-gold-50 hover:text-gold-700 rounded-full transition-colors border border-transparent hover:border-gold-200 shrink-0">{term}</Link>
                  ))}
                </div>
              </div>

              {/* Quick Action Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-4 sm:mt-6 w-full max-w-xl">
                {[
                  { icon: Calculator, label: 'EMI Calculator', to: '/tools', color: 'text-blue-500 bg-blue-50' },
                  { icon: Scale, label: 'Compare', to: '/compare', color: 'text-purple-500 bg-purple-50' },
                  { icon: CreditCard, label: 'Home Loans', to: '/home-loans', color: 'text-emerald-500 bg-emerald-50' },
                  { icon: Gavel, label: 'Legal Help', to: '/legal', color: 'text-rose-500 bg-rose-50' },
                ].map((action) => (
                  <Link key={action.label} to={action.to} className="flex items-center gap-2 px-3 py-2.5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/20 transition-colors group">
                    <action.icon size={16} className={action.color.split(' ')[0]} />
                    <span className="text-white text-xs font-medium group-hover:text-gold-300 transition-colors">{action.label}</span>
                  </Link>
                ))}
              </div>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-8 mt-10">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <stat.icon className="w-5 h-5 text-gold-400" />
                      <span className="text-2xl sm:text-3xl font-bold text-white">
                        <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                      </span>
                    </div>
                    <div className="text-slate-400 text-xs mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Featured Property Card */}
            {featuredProperties[0] && (
              <div className="hidden lg:block">
                <div className="relative">
                  {/* Glow effect */}
                  <div className="absolute -inset-4 bg-gradient-to-r from-gold-500/20 to-slate-800/20 rounded-3xl blur-2xl" />

                  <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden transform hover:scale-[1.02] transition-transform duration-500">
                    <div className="relative h-72">
                      <img src={featuredProperties[0].image_url || FALLBACK_IMG} alt={featuredProperties[0].title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadgeClass(featuredProperties[0].status)}`}>{featuredProperties[0].status}</span>
                        {featuredProperties[0].is_verified && <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500 text-white flex items-center gap-1"><BadgeCheck size={12} /> Verified</span>}
                      </div>
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gold-500 text-slate-950">Featured</span>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center gap-1 text-white/80 text-sm mb-1">
                          <MapPin size={14} /> {featuredProperties[0].location}
                        </div>
                        <h3 className="text-xl font-bold text-white">{featuredProperties[0].title}</h3>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-4 mb-4 text-sm text-slate-600">
                        <span className="flex items-center gap-1"><Bed size={16} className="text-gold-500" /> {featuredProperties[0].bedrooms || 'N/A'} BHK</span>
                        <span className="flex items-center gap-1"><Bath size={16} className="text-gold-500" /> {featuredProperties[0].bathrooms || 'N/A'} Bath</span>
                        <span className="flex items-center gap-1"><Maximize size={16} className="text-gold-500" /> {featuredProperties[0].area || 'N/A'}</span>
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <div className="text-xs text-slate-500">Starting from</div>
                          <div className="text-2xl font-bold text-slate-900">{formatPrice(featuredProperties[0])}</div>
                          <div className="text-xs text-slate-500">{formatPricePerSqft(featuredProperties[0])}</div>
                        </div>
                        <Link to={`/projects/${featuredProperties[0].id}`} className="px-5 py-2.5 bg-gradient-to-r from-slate-950 to-slate-900 text-white rounded-xl font-medium text-sm hover:from-slate-900 hover:to-slate-900 transition-colors flex items-center gap-2 shadow-lg">
                          View Details <ArrowRight size={16} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-slate-400 text-xs">Scroll to explore</span>
          <ChevronDown className="text-gold-400" />
        </div>
      </section>

      {/* Trending ticker — horizontal auto-scroll */}
      <div className="bg-slate-900/60 backdrop-blur-md border-y border-white/10 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2 border-b border-white/10">
          <Flame size={12} className="text-gold-400" />
          <span className="text-gold-300 text-[11px] font-bold uppercase tracking-widest">Trending</span>
        </div>
        <div className="overflow-hidden py-2">
          <div className="flex gap-3 animate-marquee w-max">
            {[...trendingProjects, ...trendingProjects].map((project, idx) => (
              <button
                key={idx}
                onClick={() => navigate(`/projects/${project.id}`)}
                className="shrink-0 w-44 flex flex-col gap-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-gold-500/10 hover:border-gold-500/30 transition-all text-left cursor-pointer"
              >
                <span className="text-white/90 text-xs font-semibold truncate">{project.name}</span>
                <span className="text-white/40 text-[11px] truncate">{project.location}</span>
                <div className="flex items-center justify-between">
                  <span className="text-gold-400 text-xs font-bold">{project.price}</span>
                  {project.tag && (
                    <span className={`px-1.5 py-0.5 rounded text-[10px] text-white font-medium ${project.tagColor}`}>{project.tag}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Property Categories */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <span className="text-gold-600 text-xs font-semibold uppercase tracking-wider">What We Offer</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">Browse by Category</h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {categories.map((cat) => {
              const count = categoryCounts[cat.type] || 0;
              return (
                <Link
                  key={cat.title}
                  to={`/projects?type=${cat.type}`}
                  className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="relative h-36">
                    <img src={cat.image} alt={cat.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className={`absolute inset-0 bg-gradient-to-t ${cat.accent}`} />
                    <div className="absolute inset-0 flex flex-col justify-between p-3.5">
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                          <cat.icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="px-2 py-0.5 bg-black/30 backdrop-blur-sm rounded-full text-white/90 text-[11px] font-semibold">{count} props</span>
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white leading-tight">{cat.title}</h3>
                        <div className="flex items-center gap-1 text-white/80 text-xs mt-0.5 group-hover:text-white transition-colors">
                          Explore <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white px-3.5 py-2.5 border-t border-slate-100">
                    <p className="text-slate-500 text-xs leading-snug line-clamp-1">{cat.desc}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-14 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12 gap-4">
            <div>
              <span className="text-gold-600 text-sm font-semibold uppercase tracking-wider">Handpicked for You</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mt-3">Featured Properties</h2>
            </div>
            <Link to="/projects" className="inline-flex items-center gap-2 text-slate-900 font-semibold hover:text-gold-600 transition-colors group">
              View All Properties <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24"><Loader2 size={32} className="text-slate-400 animate-spin" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProperties.slice(0, 3).map((property) => (
                <Link key={property.id} to={`/projects/${property.id}`} className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="relative h-56 overflow-hidden">
                    <img src={property.image_url || FALLBACK_IMG} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadgeClass(property.status)}`}>{property.status}</span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-sm text-slate-800 capitalize">{property.type}</span>
                    </div>
                    {property.is_verified && (
                      <div className="absolute bottom-3 left-3">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-blue-500 text-white shadow-sm"><BadgeCheck size={12} /> Verified</span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-1 text-slate-400 text-xs mb-1.5"><MapPin size={13} className="shrink-0" /> <span className="truncate">{property.location}</span></div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-gold-600 transition-colors line-clamp-1">{property.title}</h3>
                    <div className="flex items-center gap-4 mb-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Bed size={15} className="text-gold-500" /> {property.bedrooms !== null ? `${property.bedrooms} BHK` : 'N/A'}</span>
                      <span className="flex items-center gap-1"><Bath size={15} className="text-gold-500" /> {property.bathrooms !== null ? `${property.bathrooms} Bath` : 'N/A'}</span>
                      <span className="flex items-center gap-1"><Maximize size={15} className="text-gold-500" /> <span className="truncate">{property.area || 'N/A'}</span></span>
                    </div>
                    <div className="pt-4 border-t border-slate-100">
                      <div className="flex items-end justify-between">
                        <div>
                          <span className="text-xs text-slate-400">Starting from</span>
                          <div className="text-xl font-bold text-slate-800">{formatPrice(property)}</div>
                          <div className="text-xs text-slate-400">{formatPricePerSqft(property)}</div>
                        </div>
                        <span className="inline-flex items-center gap-1 px-4 py-2 bg-slate-900 group-hover:bg-gold-500 text-white text-xs font-medium rounded-lg transition-colors">View <ArrowRight size={13} /></span>
                      </div>
                      {(property as any).weekly_enquiries > 0 && (
                        <p className="text-xs text-amber-700 mt-2 flex items-center gap-1">
                          <Flame size={11} className="text-amber-500" />
                          {(property as any).weekly_enquiries} people enquired this week
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Recently Viewed */}
      {recentProperties.length > 0 && (
        <section className="py-16 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-gold-600 text-sm font-semibold uppercase tracking-wider">Pick up where you left off</span>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">Recently Viewed</h2>
              </div>
              <Link to="/projects" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1">
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {recentProperties.slice(0, 4).map((property) => (
                <Link key={property.id} to={`/projects/${property.id}`} className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="relative h-40 overflow-hidden">
                    <img src={property.image_url || FALLBACK_IMG} alt={property.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${statusBadgeClass(property.status)}`}>{property.status}</span>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-1 text-slate-500 text-xs mb-1"><MapPin size={11} /><span className="truncate">{property.location}</span></div>
                    <h3 className="font-serif text-sm font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-slate-700 transition-colors">{property.title}</h3>
                    <div className="flex items-center justify-between">
                      <div className="font-serif text-base font-bold text-slate-900">{formatPrice(property)}</div>
                      <span className="text-xs text-slate-500">{property.bedrooms ? `${property.bedrooms} BHK` : 'N/A'}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Services */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <span className="text-gold-600 text-xs font-semibold uppercase tracking-wider">Full-Stack Services</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">Everything You Need</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service) => (
              <Link key={service.title} to={service.to} className="group relative overflow-hidden rounded-2xl bg-white border border-slate-100 hover:border-gold-300 hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gold-100 to-gold-50 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative p-8">
                  <div className="w-14 h-14 rounded-xl bg-gold-500/10 flex items-center justify-center mb-6 group-hover:bg-slate-800 transition-colors">
                    <service.icon className="w-7 h-7 text-gold-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{service.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-4">{service.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gold-600">{service.stats}</span>
                    <span className="inline-flex items-center gap-1 text-slate-900 font-semibold text-sm group-hover:text-gold-600 transition-colors">Explore <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" /></span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Localities */}
      <section className="py-14 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <span className="text-gold-600 text-xs font-semibold uppercase tracking-wider">Neighborhood Guides</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">Locality Highlights</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24"><Loader2 size={32} className="text-slate-400 animate-spin" /></div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                {localities.map((locality) => (
                  <Link key={locality.id} to={`/localities/${locality.slug}`} className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="relative h-56">
                      <img src={locality.image_url || FALLBACK_IMG} alt={locality.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <div className="flex items-center gap-2 text-gold-300 text-xs font-semibold uppercase tracking-wider mb-1"><MapPin size={14} /> Sohna, Haryana</div>
                        <h3 className="text-2xl font-bold text-white">{locality.name}</h3>
                      </div>
                    </div>
                    <div className="p-5">
                      {locality.description && <p className="text-slate-500 text-sm mb-4 line-clamp-2">{locality.description}</p>}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-50 text-slate-700 text-xs font-medium rounded-full"><Footprints size={13} className="text-gold-500" /> Walk: {locality.walkability_score}/100</span>
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-50 text-slate-700 text-xs font-medium rounded-full"><Shield size={13} className="text-gold-500" /> Safety: {locality.safety_score}/100</span>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <span className="text-sm font-medium text-slate-600">Avg: <span className="font-bold text-slate-900">{formatLocalityPrice(locality.avg_price_per_sqft)}/sqft</span></span>
                        <span className="inline-flex items-center gap-1 px-4 py-2 bg-slate-900 group-hover:bg-gold-500 text-white text-xs font-medium rounded-lg transition-colors">Explore <ArrowRight size={12} /></span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="text-center">
                <Link to="/localities" className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 hover:bg-gold-500 text-white hover:text-slate-900 font-semibold rounded-xl transition-colors shadow-lg">
                  Explore All Localities <ArrowRight size={18} />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-gold-600 text-xs font-semibold uppercase tracking-wider">Why Virasat Realty</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">A Trusted Partner in Your Property Journey</h2>
            <p className="text-slate-500 mt-3 max-w-2xl mx-auto">From discovery to registration, we provide end-to-end real estate services with transparency and expertise.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: 'RERA Verified', desc: 'Every listing is legally verified and RERA-compliant for your peace of mind.', color: 'text-emerald-600 bg-emerald-50' },
              { icon: Handshake, title: 'Zero Brokerage', desc: 'Buy directly from builders and owners with no hidden charges or middlemen.', color: 'text-blue-600 bg-blue-50' },
              { icon: FileCheck, title: 'End-to-End Legal', desc: 'Title checks, registration, and documentation handled by our legal experts.', color: 'text-gold-600 bg-gold-50' },
              { icon: Headphones, title: 'Dedicated Support', desc: 'A relationship manager guides you from first call to handover and beyond.', color: 'text-rose-600 bg-rose-50' },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mb-4`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-gold-600 text-xs font-semibold uppercase tracking-wider">Client Stories</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">What Our Families Say</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <div key={t.id} className="relative bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:shadow-md transition-shadow">
                  <Quote className="absolute top-4 right-4 w-8 h-8 text-gold-200" />
                  <div className="flex items-center gap-3 mb-4">
                    {t.photo_url ? (
                      <img src={t.photo_url} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gold-100 flex items-center justify-center text-gold-600 font-bold text-lg">
                        {t.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-slate-900">{t.name}</div>
                      {t.designation && <div className="text-xs text-slate-500">{t.designation}</div>}
                    </div>
                  </div>
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < t.rating ? 'text-gold-400 fill-gold-400' : 'text-slate-300'}`} />
                    ))}
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">"{t.body}"</p>
                  {t.location && (
                    <div className="flex items-center gap-1 mt-4 text-xs text-slate-400">
                      <MapPin size={12} /> {t.location}
                      {t.property_type && <span className="text-slate-300">•</span>}
                      {t.property_type && <span>{t.property_type}</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Blog */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 gap-3">
            <div>
              <span className="text-gold-600 text-xs font-semibold uppercase tracking-wider">Insights & Resources</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">Latest From Blog</h2>
            </div>
            <Link to="/blog" className="inline-flex items-center gap-2 text-slate-900 font-semibold hover:text-gold-600 transition-colors group">
              View All Articles <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24"><Loader2 size={32} className="text-slate-400 animate-spin" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {blogPosts.map((post) => (
                <Link key={post.id} to={`/blog/${post.slug}`} className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="relative h-48 overflow-hidden">
                    <img src={post.image_url || FALLBACK_IMG} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-3 left-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${categoryColor(post.category)}`}>{post.category}</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
                      <span className="flex items-center gap-1"><User size={12} /> {post.author}</span>
                      <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(post.published_at)}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-gold-600 transition-colors line-clamp-2">{post.title}</h3>
                    {post.excerpt && <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-4">{post.excerpt}</p>}
                    <span className="inline-flex items-center gap-1 text-slate-900 font-semibold text-sm group-hover:text-gold-600 transition-colors">Read More <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" /></span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-gold-50 border-y border-gold-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <NewsletterForm />
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-16 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gold-500/8 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/15 backdrop-blur-sm rounded-full border border-emerald-400/30 mb-6">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span className="text-emerald-300 text-sm font-medium">Free Consultation Available</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight">
            Ready to Find Your <span className="text-gold-400">Dream Property?</span>
          </h2>
          <p className="text-slate-300 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
            Let our experts guide you through the best options tailored to your needs and budget. Schedule a free consultation today.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <button onClick={() => setShowLeadModal(true)} className="inline-flex items-center gap-2 px-8 py-4 bg-gold-500 hover:bg-gold-400 text-slate-950 font-semibold rounded-xl transition-all shadow-lg shadow-gold-500/20">
              Schedule a Visit <ArrowRight size={18} />
            </button>
            <a href="tel:+917015714787" className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl backdrop-blur-sm border border-white/20 transition-all">
              <Phone size={18} /> Call Us Now
            </a>
          </div>
        </div>
      </section>
      {showLeadModal && <LeadModal isOpen={showLeadModal} onClose={() => setShowLeadModal(false)} defaultType="site_visit" />}
    </div>
  );
}

function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    setError('');
    const { error: err } = await supabase.from('newsletter_subscribers').upsert(
      { email, name: name || null },
      { onConflict: 'email' }
    );
    setSubmitting(false);
    if (err) {
      setError('Something went wrong. Please try again.');
    } else {
      setDone(true);
    }
  };

  if (done) {
    return (
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif">Get Latest Property Updates</h3>
          <p className="text-slate-600 mt-1">Subscribe to our newsletter for new listings, price trends, and market insights.</p>
        </div>
        <div className="flex items-center gap-3 bg-emerald-100 text-emerald-800 px-6 py-3 rounded-xl font-medium">
          <CheckCircle2 size={20} className="text-emerald-600" /> Subscribed successfully!
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
      <div>
        <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif">Get Latest Property Updates</h3>
        <p className="text-slate-600 mt-1">New listings, price trends, and market insights — straight to your inbox.</p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
        <input value={name} onChange={e => setName(e.target.value)}
          className="px-4 py-3 rounded-xl border border-gold-300 bg-white placeholder-slate-400 text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 w-full sm:w-36"
          placeholder="Your name" />
        <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
          className="px-5 py-3 rounded-xl border border-gold-300 bg-white placeholder-slate-400 text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 w-full sm:w-64"
          placeholder="Enter your email" />
        <button type="submit" disabled={submitting}
          className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-colors whitespace-nowrap disabled:opacity-60">
          {submitting ? 'Subscribing...' : 'Subscribe'}
        </button>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </form>
    </div>
  );
}
