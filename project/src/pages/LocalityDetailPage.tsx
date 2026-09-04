import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  ArrowLeft,
  Footprints,
  Shield,
  GraduationCap,
  IndianRupee,
  Star,
  TrendingUp,
  Building2,
  School,
  Cross,
  ShoppingBag,
  Bus,
  Loader2,
  Compass,
  ArrowRight,
  Bed,
  Bath,
  Maximize,
} from 'lucide-react';
import { supabase, type Locality, type Property } from '../lib/supabase';

const FALLBACK_IMG =
  'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1600';

const AMENITY_ICONS: Record<string, ReactNode> = {
  schools: <School size={18} />,
  hospitals: <Cross size={18} />,
  healthcare: <Cross size={18} />,
  shopping: <ShoppingBag size={18} />,
  malls: <ShoppingBag size={18} />,
  transport: <Bus size={18} />,
  transit: <Bus size={18} />,
};

const AMENITY_LABELS: Record<string, string> = {
  schools: 'Schools & Education',
  hospitals: 'Hospitals & Healthcare',
  healthcare: 'Hospitals & Healthcare',
  shopping: 'Shopping & Retail',
  malls: 'Shopping & Retail',
  transport: 'Transport & Connectivity',
  transit: 'Transport & Connectivity',
};

export default function LocalityDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [locality, setLocality] = useState<Locality | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchLocality() {
      if (!slug) return;
      const { data, error } = await supabase
        .from('localities')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      if (error || !data) {
        setNotFound(true);
      } else {
        setLocality(data as Locality);
        // Fetch properties in this locality by name match
        const { data: props } = await supabase
          .from('properties')
          .select('*')
          .ilike('location', `%${(data as Locality).name}%`)
          .order('created_at', { ascending: false });
        if (props) setProperties(props as Property[]);
      }
      setLoading(false);
    }
    fetchLocality();
  }, [slug]);

  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="text-slate-500 animate-spin" />
      </div>
    );
  }

  if (notFound || !locality) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Compass size={48} className="text-slate-300 mx-auto mb-4" />
          <h2 className="font-serif text-2xl font-bold text-slate-900 mb-2">
            Locality Not Found
          </h2>
          <p className="text-slate-600 mb-6">
            The neighborhood guide you are looking for does not exist.
          </p>
          <Link
            to="/localities"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-900 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Localities
          </Link>
        </div>
      </div>
    );
  }

  const priceTrend = locality.price_trend ?? {};
  const trendYears = Object.keys(priceTrend).sort();
  const trendValues = trendYears.map((y) => priceTrend[y]);
  const maxTrend = Math.max(...trendValues, 1);
  const minTrend = Math.min(...trendValues, 0);
  const hasTrend = trendYears.length > 0;
  const priceChange =
    trendValues.length >= 2
      ? trendValues[trendValues.length - 1] - trendValues[0]
      : 0;
  const priceChangePct =
    trendValues.length >= 2 && trendValues[0] !== 0
      ? ((trendValues[trendValues.length - 1] - trendValues[0]) /
          trendValues[0]) *
        100
      : 0;

  const futureProjects = locality.future_projects ?? [];
  const amenities = locality.amenities ?? {};
  const amenityCategories = Object.keys(amenities).filter(
    (k) => Array.isArray(amenities[k]) && amenities[k].length > 0
  );

  return (
    <div className="pt-20 min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-slate-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link
              to="/"
              className="text-slate-500 hover:text-slate-700 transition-colors"
            >
              Home
            </Link>
            <span className="text-slate-300">/</span>
            <Link
              to="/localities"
              className="text-slate-500 hover:text-slate-700 transition-colors"
            >
              Localities
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-800 font-medium">{locality.name}</span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="relative h-[60vh] min-h-[420px] overflow-hidden">
        <img
          src={locality.image_url || FALLBACK_IMG}
          alt={locality.name}
          onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMG; }}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-slate-900/10" />
        <div className="absolute bottom-0 left-0 right-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
            <div className="flex items-center gap-2 text-gold-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <MapPin size={14} />
              <span>Sohna, Haryana, India</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-3">
              {locality.name}
            </h1>
            {locality.avg_price_per_sqft != null && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                <IndianRupee size={16} className="text-gold-300" />
                <span className="text-white text-sm font-medium">
                  Avg {formatPrice(locality.avg_price_per_sqft)} / sqft
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back link */}
        <Link
          to="/localities"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors text-sm font-medium mb-8"
        >
          <ArrowLeft size={16} /> All Localities
        </Link>

        {/* Description */}
        {locality.description && (
          <div className="max-w-3xl mb-12">
            <h2 className="font-serif text-2xl font-bold text-slate-900 mb-4">
              About {locality.name}
            </h2>
            <p className="text-slate-700 leading-relaxed whitespace-pre-line">
              {locality.description}
            </p>
          </div>
        )}

        {/* Score Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Walkability */}
          <ScoreCard
            icon={<Footprints size={20} />}
            label="Walkability"
            value={`${locality.walkability_score}`}
            suffix="/ 100"
          >
            <ProgressBar value={locality.walkability_score} max={100} />
          </ScoreCard>

          {/* Safety */}
          <ScoreCard
            icon={<Shield size={20} />}
            label="Safety"
            value={`${locality.safety_score}`}
            suffix="/ 100"
          >
            <ProgressBar value={locality.safety_score} max={100} />
          </ScoreCard>

          {/* School Rating */}
          <ScoreCard
            icon={<GraduationCap size={20} />}
            label="School Rating"
            value={`${locality.school_rating}`}
            suffix="/ 5"
          >
            <div className="flex items-center gap-0.5 mt-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  size={18}
                  className={
                    i <= Math.round(locality.school_rating)
                      ? 'fill-gold-400 text-gold-400'
                      : 'text-slate-200'
                  }
                />
              ))}
            </div>
          </ScoreCard>

          {/* Avg Price */}
          <ScoreCard
            icon={<IndianRupee size={20} />}
            label="Avg Price / sqft"
            value={
              locality.avg_price_per_sqft != null
                ? formatPrice(locality.avg_price_per_sqft)
                : '—'
            }
          >
            <p className="text-xs text-slate-500 mt-1">
              Indicative market rate
            </p>
          </ScoreCard>
        </div>

        {/* Price Trend Chart */}
        {hasTrend && (
          <section className="mb-12">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-slate-900">
                  Price Trend
                </h2>
                <p className="text-slate-600 text-sm mt-1">
                  Average price per square foot over the years
                </p>
              </div>
              {priceChange !== 0 && (
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${
                    priceChange > 0
                      ? 'bg-green-50 text-green-700'
                      : 'bg-red-50 text-red-700'
                  }`}
                >
                  <TrendingUp
                    size={16}
                    className={priceChange < 0 ? 'rotate-180' : ''}
                  />
                  {priceChange > 0 ? '+' : ''}
                  {priceChangePct.toFixed(1)}% over {trendYears.length} yrs
                </div>
              )}
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 sm:p-8 border border-slate-100">
              <div className="flex items-end justify-between gap-3 sm:gap-6 h-64">
                {trendYears.map((year) => {
                  const value = priceTrend[year];
                  // Scale relative to min-max range for visual contrast,
                  // but ensure a minimum height for single-value or flat ranges.
                  const range = maxTrend - minTrend;
                  const heightPct =
                    range === 0
                      ? 60
                      : 20 + ((value - minTrend) / range) * 70;
                  const isMax = value === maxTrend;
                  return (
                    <div
                      key={year}
                      className="flex-1 flex flex-col items-center justify-end h-full group"
                    >
                      <div className="text-xs font-semibold text-slate-800 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {formatPrice(value)}
                      </div>
                      <div
                        className={`w-full max-w-[56px] rounded-t-lg transition-all duration-500 ${
                          isMax
                            ? 'bg-gradient-to-t from-gold-600 to-gold-400'
                            : 'bg-gradient-to-t from-slate-800 to-slate-600'
                        } group-hover:from-gold-600 group-hover:to-gold-400`}
                        style={{ height: `${heightPct}%` }}
                      />
                      <div className="text-xs text-slate-600 font-medium mt-2">
                        {year}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Future Infrastructure Projects */}
        {futureProjects.length > 0 && (
          <section className="mb-12">
            <h2 className="font-serif text-2xl font-bold text-slate-900 mb-6">
              Future Infrastructure Projects
            </h2>
            <div className="relative pl-8">
              {/* Vertical line */}
              <div className="absolute left-3 top-2 bottom-2 w-px bg-slate-200" />
              <div className="space-y-8">
                {futureProjects.map((project, idx) => (
                  <div key={idx} className="relative">
                    {/* Dot */}
                    <div className="absolute -left-[1.85rem] top-1.5 w-6 h-6 rounded-full bg-gold-400 border-4 border-white shadow flex items-center justify-center">
                      <Building2 size={12} className="text-slate-900" />
                    </div>
                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 hover:border-gold-300 transition-colors">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                          <h3 className="font-serif text-lg font-bold text-slate-900">
                            {project.name || project.title || 'Upcoming Project'}
                          </h3>
                          {project.year && (
                            <span className="inline-block mt-1 text-xs font-semibold text-gold-700 bg-gold-50 px-2 py-0.5 rounded-full">
                              Expected: {project.year}
                            </span>
                          )}
                        </div>
                        {project.status && (
                          <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                            {project.status}
                          </span>
                        )}
                      </div>
                      {project.description && (
                        <p className="text-slate-700 text-sm leading-relaxed mt-3">
                          {project.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Amenities */}
        {amenityCategories.length > 0 && (
          <section className="mb-12">
            <h2 className="font-serif text-2xl font-bold text-slate-900 mb-6">
              Nearby Amenities
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {amenityCategories.map((category) => {
                const items = (amenities[category] as any[]).filter(Boolean);
                if (items.length === 0) return null;
                return (
                  <div
                    key={category}
                    className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-gold-50 text-gold-700 flex items-center justify-center">
                        {AMENITY_ICONS[category.toLowerCase()] || (
                          <MapPin size={18} />
                        )}
                      </div>
                      <h3 className="font-serif text-lg font-bold text-slate-900">
                        {AMENITY_LABELS[category.toLowerCase()] ||
                          capitalize(category)}
                      </h3>
                    </div>
                    <ul className="space-y-2">
                      {items.map((item, i) => {
                        const label =
                          typeof item === 'string'
                            ? item
                            : item.name || item.label || JSON.stringify(item);
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

        {/* Properties in this locality */}
        <section>
          <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
            <h2 className="font-serif text-2xl font-bold text-slate-900">
              Properties in {locality.name}
            </h2>
            <Link
              to="/projects"
              className="inline-flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
            >
              View all projects <ArrowRight size={14} />
            </Link>
          </div>

          {properties.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-100">
              <Building2 size={40} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">
                No listed properties in this locality yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.map((property) => (
                <div
                  key={property.id}
                  className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={
                        property.image_url ||
                        'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&dpr=1'
                      }
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                          property.status === 'available'
                            ? 'bg-green-500 text-white'
                            : property.status === 'sold out'
                            ? 'bg-red-500 text-white'
                            : 'bg-gold-500 text-slate-900'
                        }`}
                      >
                        {property.status}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-sm text-slate-900 capitalize">
                        {property.type}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-1 text-slate-500 text-sm mb-2">
                      <MapPin size={14} />
                      <span>{property.location}</span>
                    </div>
                    <h3 className="font-serif text-xl font-bold text-slate-900 mb-2 group-hover:text-slate-800 transition-colors">
                      {property.title}
                    </h3>
                    <div className="flex items-center gap-4 mb-4 text-sm text-slate-600">
                      {property.bedrooms !== null && (
                        <div className="flex items-center gap-1">
                          <Bed size={16} className="text-gold-500" />
                          <span>{property.bedrooms} BHK</span>
                        </div>
                      )}
                      {property.bathrooms !== null && (
                        <div className="flex items-center gap-1">
                          <Bath size={16} className="text-gold-500" />
                          <span>{property.bathrooms} Bath</span>
                        </div>
                      )}
                      {property.area && (
                        <div className="flex items-center gap-1">
                          <Maximize size={16} className="text-gold-500" />
                          <span>{property.area}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div>
                        <span className="text-xs text-slate-500">
                          Starting from
                        </span>
                        <div className="font-serif text-lg font-bold text-slate-900">
                          {property.price}
                        </div>
                      </div>
                      <Link
                        to={`/projects/${property.id}`}
                        className="inline-flex items-center gap-1 px-4 py-2 bg-slate-900 hover:bg-slate-900 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        Details <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

/* ---------- Helper components ---------- */

function ScoreCard({
  icon,
  label,
  value,
  suffix,
  children,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  suffix?: string;
  children?: ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-gold-50 text-gold-700 flex items-center justify-center">
          {icon}
        </div>
        <span className="text-sm font-medium text-slate-600">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="font-serif text-3xl font-bold text-slate-900">
          {value}
        </span>
        {suffix && <span className="text-sm text-slate-500">{suffix}</span>}
      </div>
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-gold-500 to-gold-400 rounded-full transition-all duration-700"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function formatPrice(value: number): string {
  if (value >= 10000000) {
    return `${(value / 10000000).toFixed(2)} Cr`;
  }
  if (value >= 100000) {
    return `${(value / 100000).toFixed(2)} L`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K`;
  }
  return `${value}`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
