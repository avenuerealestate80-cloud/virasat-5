import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  MapPin,
  Bed,
  Bath,
  Maximize,
  ArrowRight,
  Trash2,
  Loader2,
  Search,
  X,
} from 'lucide-react';
import { supabase, type Property, type SavedSearch } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { useAuthUI } from '../lib/authUI';

const FALLBACK_IMG =
  'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&dpr=1';

export default function FavoritesPage() {
  const { user, loading: authLoading } = useAuth();
  const { openAuth } = useAuthUI();
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFavorites() {
      if (!user) {
        setLoading(false);
        return;
      }
      const { data: favRows, error: favError } = await supabase
        .from('favorites')
        .select('property_id')
        .eq('user_id', user.id);

      if (favError || !favRows || favRows.length === 0) {
        setLoading(false);
        return;
      }

      const ids = favRows.map((r) => r.property_id);
      const { data: props, error: propsError } = await supabase
        .from('properties')
        .select('*')
        .in('id', ids)
        .order('created_at', { ascending: false });

      if (!propsError && props) {
        setFavorites(props as Property[]);
      }

      const { data: searches } = await supabase
        .from('saved_searches')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (searches) setSavedSearches(searches as SavedSearch[]);

      setLoading(false);
    }
    fetchFavorites();
  }, [user]);

  async function handleRemove(propertyId: string) {
    if (!user) return;
    setRemoving(propertyId);
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('property_id', propertyId);
    if (!error) {
      setFavorites((prev) => prev.filter((p) => p.id !== propertyId));
    }
    setRemoving(null);
  }

  // Auth still resolving
  if (authLoading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="text-slate-500 animate-spin" />
      </div>
    );
  }

  // Not signed in
  if (!user) {
    return (
      <div className="pt-20 min-h-screen bg-white">
        <div className="bg-slate-900 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <span className="text-gold-400 text-sm font-semibold uppercase tracking-wider">
              Your Shortlist
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-2">
              Favorite Properties
            </h1>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-md mx-auto text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-slate-50 flex items-center justify-center mb-6">
              <Heart size={36} className="text-slate-300" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-slate-900 mb-3">
              Sign in to view your favorites
            </h2>
            <p className="text-slate-600 mb-8 leading-relaxed">
              Save properties you love and access them anytime from your
              personalized shortlist. Sign in to keep track of your favorite
              homes.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => openAuth('signin')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-900 transition-colors font-medium"
              >
                Sign In <ArrowRight size={16} />
              </button>
              <button
                onClick={() => openAuth('signup')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors font-medium"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Signed in — loading
  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-white">
        <div className="bg-slate-900 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <span className="text-gold-400 text-sm font-semibold uppercase tracking-wider">
              Your Shortlist
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-2">
              Favorite Properties
            </h1>
          </div>
        </div>
        <div className="flex items-center justify-center py-24">
          <Loader2 size={32} className="text-slate-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-white">
      {/* Page Header */}
      <div className="bg-slate-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-gold-400 text-sm font-semibold uppercase tracking-wider">
            Your Shortlist
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-2 mb-4">
            Favorite Properties
          </h1>
          <p className="text-slate-300 max-w-2xl">
            {favorites.length > 0
              ? `You have ${favorites.length} ${
                  favorites.length === 1 ? 'property' : 'properties'
                } saved to your shortlist.`
              : 'Properties you save will appear here for quick access.'}
          </p>
        </div>
      </div>

      {/* Favorites Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {favorites.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 mx-auto rounded-full bg-slate-50 flex items-center justify-center mb-6">
              <Heart size={36} className="text-slate-300" />
            </div>
            <h3 className="font-serif text-xl font-semibold text-slate-900 mb-2">
              No favorites yet
            </h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              Start exploring our properties and tap the heart icon to save
              your favorites here.
            </p>
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-900 transition-colors font-medium"
            >
              Browse Properties <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {favorites.map((property) => (
              <div
                key={property.id}
                className="group relative bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={property.image_url || FALLBACK_IMG}
                    alt={property.title}
                    onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMG; }}
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
                  <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-2">
                    {property.description}
                  </p>

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

                {/* Remove button — bottom-left of image */}
                <button
                  onClick={() => handleRemove(property.id)}
                  disabled={removing === property.id}
                  title="Remove from favorites"
                  className="absolute bottom-4 left-4 z-10 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-slate-700 hover:text-red-600 hover:bg-white shadow-sm border border-slate-100 transition-colors disabled:opacity-50 text-xs font-medium"
                >
                  {removing === property.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <>
                      <Trash2 size={14} />
                      <span>Remove</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Saved Searches */}
        {savedSearches.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center gap-2 mb-4">
              <Search size={20} className="text-slate-800" />
              <h2 className="font-serif text-xl font-bold text-slate-900">Saved Searches</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedSearches.map((ss) => (
                <div key={ss.id} className="bg-white rounded-xl border border-slate-100 p-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-900 truncate">{ss.name || 'Untitled search'}</div>
                    <div className="text-xs text-slate-500 mt-1">{new Date(ss.created_at).toLocaleDateString()}</div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Link
                      to={`/projects?${new URLSearchParams(
                        Object.entries(ss.filters || {}).reduce<Record<string,string>>((acc, [k,v]) => {
                          if (v && v !== 'all') acc[k] = String(v);
                          return acc;
                        }, {})
                      ).toString()}`}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors"
                      title="Apply search"
                    >
                      <Search size={14} />
                    </Link>
                    <button
                      onClick={async () => {
                        await supabase.from('saved_searches').delete().eq('id', ss.id);
                        setSavedSearches((prev) => prev.filter((s) => s.id !== ss.id));
                      }}
                      className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete search"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
