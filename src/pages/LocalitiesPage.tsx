import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Footprints,
  Shield,
  GraduationCap,
  IndianRupee,
  ArrowRight,
  Loader2,
  Compass,
} from 'lucide-react';
import { supabase, type Locality } from '../lib/supabase';

const FALLBACK_IMG =
  'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1200';

export default function LocalitiesPage() {
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLocalities() {
      const { data, error } = await supabase
        .from('localities')
        .select('*')
        .order('name');
      if (error) {
        setError(error.message);
      } else if (data) {
        setLocalities(data as Locality[]);
      }
      setLoading(false);
    }
    fetchLocalities();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Page Header */}
      <div className="bg-slate-900 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-gold-400 text-sm font-semibold uppercase tracking-wider">
            Neighborhood Guides
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-2 mb-4">
            Explore Localities in Sohna
          </h1>
          <p className="text-slate-300 max-w-2xl">
            Discover the character, amenities, and investment potential of
            Sohna's most sought-after neighborhoods — with insights on
            walkability, safety, schools, and price trends.
          </p>
        </div>
      </div>

      {/* Localities Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={32} className="text-slate-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-24">
            <Compass size={48} className="text-slate-300 mx-auto mb-4" />
            <h3 className="font-serif text-xl font-semibold text-slate-900 mb-2">
              Something went wrong
            </h3>
            <p className="text-slate-600">{error}</p>
          </div>
        ) : localities.length === 0 ? (
          <div className="text-center py-24">
            <Compass size={48} className="text-slate-300 mx-auto mb-4" />
            <h3 className="font-serif text-xl font-semibold text-slate-900 mb-2">
              No localities available
            </h3>
            <p className="text-slate-600">
              Neighborhood guides are being curated. Please check back soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {localities.map((locality) => (
              <Link
                key={locality.id}
                to={`/localities/${locality.slug}`}
                className="group block bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={locality.image_url || FALLBACK_IMG}
                    alt={locality.name}
                    onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMG; }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-center gap-2 text-gold-300 text-xs font-semibold uppercase tracking-wider mb-1">
                      <MapPin size={14} />
                      <span>Sohna, Haryana</span>
                    </div>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                      {locality.name}
                    </h2>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6">
                  {locality.description && (
                    <p className="text-slate-600 text-sm leading-relaxed mb-5 line-clamp-3">
                      {locality.description}
                    </p>
                  )}

                  {/* Stat pills */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    <StatPill
                      icon={<Footprints size={13} />}
                      label="Walkability"
                      value={`${locality.walkability_score}/100`}
                    />
                    <StatPill
                      icon={<Shield size={13} />}
                      label="Safety"
                      value={`${locality.safety_score}/100`}
                    />
                    <StatPill
                      icon={<GraduationCap size={13} />}
                      label="Schools"
                      value={`${locality.school_rating}/5`}
                    />
                    {locality.avg_price_per_sqft != null && (
                      <StatPill
                        icon={<IndianRupee size={13} />}
                        label="Avg / sqft"
                        value={formatPrice(locality.avg_price_per_sqft)}
                      />
                    )}
                  </div>

                  {/* CTA */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <span className="text-sm font-medium text-slate-800">
                      View neighborhood guide
                    </span>
                    <span className="inline-flex items-center gap-1 px-4 py-2 bg-slate-900 group-hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors">
                      Explore <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatPill({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-800 text-xs font-medium rounded-full">
      <span className="text-gold-600">{icon}</span>
      <span className="text-slate-500">{label}:</span>
      <span className="font-semibold">{value}</span>
    </span>
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
