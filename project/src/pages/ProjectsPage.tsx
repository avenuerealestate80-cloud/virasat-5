import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  MapIcon,
  List,
  Heart,
  GitCompare,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MapPin,
  Bed,
  Bath,
  Maximize,
  Eye,
  BadgeCheck,
  ArrowUpDown,
  BookmarkPlus,
  BookmarkCheck,
} from 'lucide-react';
import { supabase, type Property } from '../lib/supabase';
import { useCompare } from '../lib/compare';
import { useAuth } from '../lib/auth';
import { useAuthUI } from '../lib/authUI';
import MapView from '../components/MapView';

const ITEMS_PER_PAGE = 9;
const FALLBACK_IMG = 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800';

function formatPrice(p: Property): string {
  if (p.price_value) {
    if (p.price_value >= 10000000) return `₹${(p.price_value / 10000000).toFixed(2)} Cr`;
    if (p.price_value >= 100000) return `₹${(p.price_value / 100000).toFixed(2)} L`;
    return `₹${p.price_value.toLocaleString('en-IN')}`;
  }
  return p.price;
}

function formatPricePerSqft(p: Property): string {
  if (p.price_per_sqft) return `₹${p.price_per_sqft.toLocaleString('en-IN')}/sqft`;
  if (p.price_value && p.area_value) return `₹${Math.round(p.price_value / p.area_value).toLocaleString('en-IN')}/sqft`;
  return '';
}

function statusBadgeClass(status: string): string {
  switch (status?.toLowerCase()) {
    case 'available': return 'bg-emerald-500 text-white';
    case 'sold out': return 'bg-red-500 text-white';
    case 'upcoming':
    case 'coming soon': return 'bg-blue-500 text-white';
    case 'under construction': return 'bg-amber-500 text-white';
    default: return 'bg-slate-500 text-white';
  }
}

interface FilterState {
  search: string;
  type: string;
  minPrice: number;
  maxPrice: number;
  bedrooms: number | null;
  status: string;
  locality: string;
  builder: string;
  amenities: string[];
}

const INITIAL_FILTERS: FilterState = {
  search: '',
  type: 'all',
  minPrice: 0,
  maxPrice: 100000000,
  bedrooms: null,
  status: 'all',
  locality: 'all',
  builder: 'all',
  amenities: [],
};

const AMENITY_OPTIONS = [
  'Swimming Pool', 'Gym', 'Clubhouse', 'Power Backup', 'Garden',
  'Security', 'Parking', 'Lift', 'Play Area', 'Sports Court',
  'Jogging Track', 'Fire Safety', 'CCTV', 'Wi-Fi', 'Gas Pipeline',
];

interface PropertyCardProps {
  property: Property;
  isComparing: boolean;
  onToggleCompare: (id: string) => void;
  compareDisabled: boolean;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  favoriteLoading: boolean;
  isAuthed: boolean;
}

function PropertyCard({
  property,
  isComparing,
  onToggleCompare,
  compareDisabled,
  isFavorite,
  onToggleFavorite,
  favoriteLoading,
  isAuthed,
}: PropertyCardProps) {
  return (
    <div className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
      <Link to={`/projects/${property.id}`} className="relative block h-52 overflow-hidden">
        <img
          src={property.image_url || FALLBACK_IMG}
          alt={property.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadgeClass(property.status)}`}>
            {property.status}
          </span>
          {property.is_verified && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500 text-white flex items-center gap-1">
              <BadgeCheck size={10} /> Verified
            </span>
          )}
        </div>
        {property.gallery && property.gallery.length > 0 && (
          <span className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
            +{property.gallery.length} photos
          </span>
        )}
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <Link to={`/projects/${property.id}`} className="flex-1 min-w-0">
            <h3 className="font-serif text-base font-bold text-slate-900 line-clamp-1 group-hover:text-slate-700 transition-colors">
              {property.title}
            </h3>
          </Link>
          <button
            onClick={() => onToggleFavorite(property.id)}
            disabled={favoriteLoading}
            title={isAuthed ? (isFavorite ? 'Remove from favorites' : 'Save to favorites') : 'Sign in to save'}
            className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              isFavorite
                ? 'bg-red-50 text-red-500 hover:bg-red-100'
                : 'bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-400'
            }`}
          >
            <Heart size={15} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>

        <div className="flex items-center gap-1 text-slate-500 text-xs mb-3">
          <MapPin size={11} />
          <span className="truncate">{property.location}</span>
        </div>

        <div className="flex items-center gap-3 text-slate-600 text-xs mb-3">
          {property.bedrooms && (
            <span className="flex items-center gap-1"><Bed size={12} /> {property.bedrooms} BHK</span>
          )}
          {property.bathrooms && (
            <span className="flex items-center gap-1"><Bath size={12} /> {property.bathrooms}</span>
          )}
          {property.area && (
            <span className="flex items-center gap-1"><Maximize size={12} /> {property.area}</span>
          )}
        </div>

        {property.amenities && property.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {property.amenities.slice(0, 4).map((a) => (
              <span key={a} className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-600 rounded-full">{a}</span>
            ))}
            {property.amenities.length > 4 && (
              <span className="px-2 py-0.5 text-[10px] font-medium text-slate-400">+{property.amenities.length - 4} more</span>
            )}
          </div>
        )}

        <div className="mt-auto flex items-end justify-between">
          <div>
            <div className="font-serif text-lg font-bold text-slate-900">{formatPrice(property)}</div>
            {formatPricePerSqft(property) && (
              <div className="text-xs text-slate-500">{formatPricePerSqft(property)}</div>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {property.views_count > 0 && (
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Eye size={11} /> {property.views_count}
              </span>
            )}
            <button
              onClick={() => onToggleCompare(property.id)}
              disabled={!isComparing && compareDisabled}
              title={isComparing ? 'Remove from compare' : compareDisabled ? 'Max 3 properties' : 'Add to compare'}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                isComparing
                  ? 'bg-slate-900 text-white'
                  : compareDisabled
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <GitCompare size={11} />
              {isComparing ? 'Added' : 'Compare'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface FilterSidebarProps {
  filters: FilterState;
  setFilters: (f: FilterState) => void;
  localities: string[];
  builders: string[];
  onClose?: () => void;
}

function FilterSidebar({ filters, setFilters, localities, builders, onClose }: FilterSidebarProps) {
  const set = (patch: Partial<FilterState>) => setFilters({ ...filters, ...patch });

  const propertyTypes = ['all', 'Apartment', 'Villa', 'Plot', 'Commercial', 'Studio', 'Penthouse', 'Row House'];
  const statusOptions = ['all', 'Available', 'Under Construction', 'Upcoming', 'Sold Out'];
  const bedroomOptions = [null, 1, 2, 3, 4];

  const hasActive =
    filters.search !== '' ||
    filters.type !== 'all' ||
    filters.minPrice !== 0 ||
    filters.maxPrice !== 100000000 ||
    filters.bedrooms !== null ||
    filters.status !== 'all' ||
    filters.locality !== 'all' ||
    filters.builder !== 'all' ||
    filters.amenities.length > 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">Filters</h3>
        <div className="flex items-center gap-2">
          {hasActive && (
            <button onClick={() => setFilters(INITIAL_FILTERS)} className="text-xs text-red-500 hover:text-red-600 font-medium">
              Clear All
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div>
        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2 block">Search</label>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Project name, area..."
            value={filters.search}
            onChange={(e) => set({ search: e.target.value })}
            className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400"
          />
        </div>
      </div>

      {/* Property Type */}
      <div>
        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2 block">Property Type</label>
        <div className="flex flex-wrap gap-1.5">
          {propertyTypes.map((t) => (
            <button
              key={t}
              onClick={() => set({ type: t })}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filters.type === t
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t === 'all' ? 'All Types' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div>
        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2 block">Budget</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Under 50L', min: 0, max: 5000000 },
            { label: '50L–1Cr', min: 5000000, max: 10000000 },
            { label: '1Cr–2Cr', min: 10000000, max: 20000000 },
            { label: 'Above 2Cr', min: 20000000, max: 100000000 },
          ].map((b) => (
            <button
              key={b.label}
              onClick={() => set({ minPrice: b.min, maxPrice: b.max })}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all text-center ${
                filters.minPrice === b.min && filters.maxPrice === b.max
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* BHK */}
      <div>
        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2 block">BHK</label>
        <div className="flex gap-1.5">
          {bedroomOptions.map((b) => (
            <button
              key={String(b)}
              onClick={() => set({ bedrooms: b })}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filters.bedrooms === b
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {b === null ? 'Any' : `${b}+`}
            </button>
          ))}
        </div>
      </div>

      {/* Status */}
      <div>
        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2 block">Status</label>
        <select
          value={filters.status}
          onChange={(e) => set({ status: e.target.value })}
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 bg-white"
        >
          {statusOptions.map((s) => (
            <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s}</option>
          ))}
        </select>
      </div>

      {/* Locality */}
      {localities.length > 0 && (
        <div>
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2 block">Locality</label>
          <select
            value={filters.locality}
            onChange={(e) => set({ locality: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 bg-white"
          >
            <option value="all">All Localities</option>
            {localities.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
      )}

      {/* Builder */}
      {builders.length > 0 && (
        <div>
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2 block">Builder / Developer</label>
          <select
            value={filters.builder}
            onChange={(e) => set({ builder: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 bg-white"
          >
            <option value="all">All Builders</option>
            {builders.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
      )}

      {/* Amenities */}
      <div>
        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2 block">Amenities</label>
        <div className="flex flex-wrap gap-2">
          {AMENITY_OPTIONS.map((a) => {
            const active = filters.amenities.includes(a);
            return (
              <button
                key={a}
                onClick={() => {
                  set({
                    amenities: active
                      ? filters.amenities.filter(x => x !== a)
                      : [...filters.amenities, a],
                  });
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
                  active
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                }`}
              >
                {a}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}export default function ProjectsPage() {
  const [searchParams] = useSearchParams();
  const { toggleCompare, isComparing, compareIds } = useCompare();
  const { user } = useAuth();
  const { openAuth } = useAuthUI();

  const [properties, setProperties] = useState<Property[]>([]);
  const [localities, setLocalities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [favoriteLoading, setFavoriteLoading] = useState<string | null>(null);
  const [savedSearchToast, setSavedSearchToast] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'views'>('newest');

  const [filters, setFilters] = useState<FilterState>(() => ({
    ...INITIAL_FILTERS,
    type: searchParams.get('type') || 'all',
    search: searchParams.get('q') || '',
    status: searchParams.get('status') || 'all',
  }));

  const builders = useMemo(
    () =>
      [...new Set(properties.map((p) => p.builder).filter((b): b is string => !!b))].sort(),
    [properties]
  );

  useEffect(() => {
    async function load() {
      setLoading(true);
      let query = supabase.from('properties').select('*', { count: 'exact' });

      // Server-side filters
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,location.ilike.%${filters.search}%,builder.ilike.%${filters.search}%`);
      }
      if (filters.type !== 'all') query = query.eq('type', filters.type);
      if (filters.status !== 'all') query = query.eq('status', filters.status);
      if (filters.locality !== 'all') query = query.eq('location', filters.locality);
      if (filters.bedrooms !== null) query = query.gte('bedrooms', filters.bedrooms);
      if (filters.minPrice > 0) query = query.gte('price_value', filters.minPrice);
      if (filters.maxPrice < 100000000) query = query.lte('price_value', filters.maxPrice);
      if (filters.amenities.length > 0) query = query.contains('amenities', filters.amenities);

      // Server-side sort
      switch (sortBy) {
        case 'price_asc': query = query.order('price_value', { ascending: true }); break;
        case 'price_desc': query = query.order('price_value', { ascending: false }); break;
        case 'views': query = query.order('views_count', { ascending: false }); break;
        default: query = query.order('created_at', { ascending: false });
      }

      // Server-side pagination
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const [{ data: props, count }, { data: locs }] = await Promise.all([
        query,
        supabase.from('localities').select('name').order('name'),
      ]);
      if (props) setProperties(props as Property[]);
      if (count !== null) setTotalCount(count);
      if (locs) setLocalities((locs as { name: string }[]).map((l) => l.name));
      setLoading(false);
    }
    load();
  }, [filters, sortBy, currentPage]);

  useEffect(() => {
    if (!user) { setFavorites(new Set()); return; }
    supabase
      .from('favorites')
      .select('property_id')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (data) setFavorites(new Set(data.map((f: { property_id: string }) => f.property_id)));
      });
  }, [user]);

  // Reset page on filter change
  useEffect(() => { setCurrentPage(1); }, [filters, sortBy]);

  // Server already filtered + paginated; use directly
  const filtered = properties;
  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));
  const paged = properties;

  const handleToggleFavorite = useCallback(
    async (id: string) => {
      if (!user) { openAuth('signin'); return; }
      setFavoriteLoading(id);
      if (favorites.has(id)) {
        await supabase.from('favorites').delete().eq('user_id', user.id).eq('property_id', id);
        setFavorites((prev) => { const n = new Set(prev); n.delete(id); return n; });
      } else {
        await supabase.from('favorites').insert({ user_id: user.id, property_id: id });
        setFavorites((prev) => new Set([...prev, id]));
      }
      setFavoriteLoading(null);
    },
    [user, favorites, openAuth]
  );

  const handleSaveSearch = useCallback(async () => {
    if (!user) { openAuth('signin'); return; }
    const name = [
      filters.type !== 'all' ? filters.type : '',
      filters.locality !== 'all' ? `in ${filters.locality}` : '',
      filters.status !== 'all' ? filters.status : '',
      filters.bedrooms ? `${filters.bedrooms}+ BHK` : '',
    ].filter(Boolean).join(', ') || 'All Properties';
    await supabase.from('saved_searches').insert({
      user_id: user.id,
      name,
      filters: filters as unknown as Record<string, unknown>,
    });
    setSavedSearchToast(true);
    setTimeout(() => setSavedSearchToast(false), 2500);
  }, [user, filters, openAuth]);

  const compareDisabled = compareIds.length >= 3;

  const hasActiveFilters =
    filters.search !== '' ||
    filters.type !== 'all' ||
    filters.minPrice !== 0 ||
    filters.maxPrice !== 100000000 ||
    filters.bedrooms !== null ||
    filters.status !== 'all' ||
    filters.locality !== 'all' ||
    filters.builder !== 'all';

  // Pagination helpers
  function getPageNumbers(current: number, total: number): (number | '...')[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: (number | '...')[] = [];
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push('...');
      pages.push(total);
    } else if (current >= total - 3) {
      pages.push(1);
      pages.push('...');
      for (let i = total - 4; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push('...');
      for (let i = current - 1; i <= current + 1; i++) pages.push(i);
      pages.push('...');
      pages.push(total);
    }
    return pages;
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-16 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-xl font-bold text-slate-900">
              {filters.type !== 'all' ? `${filters.type}s` : 'All Properties'}
              {filters.locality !== 'all' ? ` in ${filters.locality}` : ''}
            </h1>
            <p className="text-xs text-slate-500">{filtered.length} {filtered.length === 1 ? 'property' : 'properties'} found</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Sort */}
            <div className="relative hidden sm:block">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="appearance-none pl-3 pr-8 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-slate-400 cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="views">Most Viewed</option>
              </select>
              <ArrowUpDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Save search */}
            <button
              onClick={handleSaveSearch}
              title="Save this search"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-colors text-slate-600"
            >
              {savedSearchToast ? <BookmarkCheck size={14} className="text-green-600" /> : <BookmarkPlus size={14} />}
              <span className="text-xs">{savedSearchToast ? 'Saved!' : 'Save Search'}</span>
            </button>

            {/* View toggle */}
            <div className="flex border border-slate-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-2 ${viewMode === 'map' ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
              >
                <MapIcon size={16} />
              </button>
            </div>

            {/* Mobile filter */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium lg:hidden"
            >
              <SlidersHorizontal size={14} />
              Filters
              {hasActiveFilters && (
                <span className="w-4 h-4 bg-gold-500 text-slate-900 text-[10px] font-bold rounded-full flex items-center justify-center">!</span>
              )}
            </button>
          </div>
        </div>

        {/* Compare bar */}
        {compareIds.length > 0 && (
          <div className="border-t border-slate-100 bg-slate-950 text-white py-2 px-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <span className="text-sm font-medium">{compareIds.length} / 3 properties selected for comparison</span>
              <Link
                to="/compare"
                className="px-4 py-1.5 bg-gold-500 text-slate-950 text-sm font-semibold rounded-lg hover:bg-gold-400 transition-colors"
              >
                Compare Now
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-32">
              <FilterSidebar
                filters={filters}
                setFilters={setFilters}
                localities={localities}
                builders={builders}
              />
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="flex items-center justify-center py-32">
                <Loader2 size={32} className="animate-spin text-slate-400" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-2xl border border-slate-100">
                <Search size={40} className="text-slate-300 mx-auto mb-3" />
                <h3 className="font-serif text-lg font-bold text-slate-800 mb-2">No properties found</h3>
                <p className="text-slate-500 text-sm mb-5">Try adjusting your filters or broadening your search.</p>
                <button
                  onClick={() => setFilters(INITIAL_FILTERS)}
                  className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            ) : viewMode === 'map' ? (
              <div className="rounded-2xl overflow-hidden border border-slate-100 h-[600px]">
                <MapView properties={filtered} />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {paged.map((property) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      isComparing={isComparing(property.id)}
                      onToggleCompare={toggleCompare}
                      compareDisabled={compareDisabled}
                      isFavorite={favorites.has(property.id)}
                      onToggleFavorite={handleToggleFavorite}
                      favoriteLoading={favoriteLoading === property.id}
                      isAuthed={!!user}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalCount > ITEMS_PER_PAGE && (
                  <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-slate-500">
                      Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount} properties
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      {getPageNumbers(currentPage, totalPages).map((p, i) =>
                        p === '...' ? (
                          <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-slate-400 text-sm">…</span>
                        ) : (
                          <button
                            key={p}
                            onClick={() => setCurrentPage(p as number)}
                            className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                              currentPage === p
                                ? 'bg-slate-900 text-white border border-slate-900'
                                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {p}
                          </button>
                        )
                      )}
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white overflow-y-auto">
            <div className="p-4">
              <FilterSidebar
                filters={filters}
                setFilters={setFilters}
                localities={localities}
                builders={builders}
                onClose={() => setShowMobileFilters(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
