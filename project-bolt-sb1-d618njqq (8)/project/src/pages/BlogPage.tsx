import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  User,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Newspaper,
  Search,
  X,
} from 'lucide-react';
import { supabase, type BlogPost } from '../lib/supabase';

const CATEGORIES = ['All', 'Buying Guide', 'Legal', 'Market Trends', 'Locality Guide'];

type SortBy = 'newest' | 'oldest' | 'title-asc';

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'title-asc', label: 'Title A-Z' },
];

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function categoryColor(category: string): string {
  const map: Record<string, string> = {
    'Buying Guide': 'bg-gold-100 text-gold-700',
    Legal: 'bg-red-100 text-red-700',
    'Market Trends': 'bg-green-100 text-green-700',
    'Locality Guide': 'bg-blue-100 text-blue-700',
  };
  return map[category] || 'bg-slate-100 text-slate-800';
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('newest');

  useEffect(() => {
    async function fetchPosts() {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('published_at', { ascending: false });
      if (!error && data) {
        setPosts(data as BlogPost[]);
      }
      setLoading(false);
    }
    fetchPosts();
  }, []);

  const filtered = posts
    .filter((p) => activeCategory === 'All' || p.category === activeCategory)
    .filter((p) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        (p.excerpt?.toLowerCase().includes(q) ?? false) ||
        (p.body?.toLowerCase().includes(q) ?? false)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.published_at).getTime() - new Date(b.published_at).getTime();
      }
      // title-asc
      return a.title.localeCompare(b.title);
    });

  const featured = filtered[0];
  const rest = filtered.slice(1);
  const isSearchActive = searchQuery.trim().length > 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-slate-900 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-gold-400 text-sm font-semibold uppercase tracking-wider">Insights & Resources</span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-2 mb-4">
            Virasat Realty Blog
          </h1>
          <p className="text-slate-300 max-w-2xl">
            Expert insights, buying guides, market trends, and locality spotlights to help you make
            informed real estate decisions in Sohna and beyond.
          </p>
        </div>
      </div>

      {/* Category Filter + Search & Sort */}
      <div className="sticky top-16 z-30 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Categories */}
            <div className="flex items-center gap-2 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeCategory === cat
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search + Sort */}
            <div className="flex items-center gap-3 sm:ml-auto">
              {/* Search */}
              <div className="relative flex-1 sm:flex-none">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles..."
                  className="w-full sm:w-64 pl-9 pr-9 py-2 rounded-full text-sm bg-slate-50 border border-slate-100 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                />
                {isSearchActive && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                    aria-label="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="appearance-none pl-4 pr-9 py-2 rounded-full text-sm bg-slate-50 border border-slate-100 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all cursor-pointer"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <svg
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={32} className="text-slate-500 animate-spin" />
          </div>
        )}

        {/* Empty State */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-24">
            <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-6">
              {isSearchActive ? (
                <Search size={36} className="text-slate-300" />
              ) : (
                <Newspaper size={36} className="text-slate-300" />
              )}
            </div>
            <h3 className="font-serif text-xl font-semibold text-slate-900 mb-2">
              No articles found
            </h3>
            <p className="text-slate-600 mb-6">
              {isSearchActive
                ? `No articles match "${searchQuery}"${activeCategory !== 'All' ? ` in ${activeCategory}` : ''}.`
                : activeCategory === 'All'
                  ? 'Check back soon for new content.'
                  : `No articles in the "${activeCategory}" category yet.`}
            </p>
            {isSearchActive ? (
              <button
                onClick={() => setSearchQuery('')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gold-500 hover:bg-gold-600 text-white font-medium rounded-lg transition-colors"
              >
                <X size={16} /> Clear search
              </button>
            ) : activeCategory !== 'All' ? (
              <button
                onClick={() => setActiveCategory('All')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-50 hover:bg-slate-100 text-slate-800 font-medium rounded-lg transition-colors"
              >
                <ArrowLeft size={16} /> View All Articles
              </button>
            ) : null}
          </div>
        )}

        {/* Featured Post + Grid */}
        {!loading && filtered.length > 0 && (
          <>
            {/* Featured Post */}
            {featured && (
              <Link
                to={`/blog/${featured.slug}`}
                className="group block mb-12"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-slate-50 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="relative h-64 lg:h-96 overflow-hidden">
                    <img
                      src={featured.image_url || 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1200'}
                      alt={featured.title}
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1200'; }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${categoryColor(featured.category)}`}>
                        {featured.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-8 lg:p-12">
                    <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                      <span className="flex items-center gap-1">
                        <User size={14} /> {featured.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={14} /> {formatDate(featured.published_at)}
                      </span>
                    </div>
                    <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-4 group-hover:text-slate-800 transition-colors leading-tight">
                      {featured.title}
                    </h2>
                    {featured.excerpt && (
                      <p className="text-slate-600 leading-relaxed mb-6 line-clamp-3">
                        {featured.excerpt}
                      </p>
                    )}
                    <span className="inline-flex items-center gap-2 text-slate-900 font-semibold text-sm group-hover:text-gold-600 transition-colors">
                      Read Article <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>
            )}

            {/* Grid of remaining posts */}
            {rest.length > 0 && (
              <>
                <h3 className="font-serif text-2xl font-bold text-slate-900 mb-6">
                  {activeCategory === 'All' ? 'Latest Articles' : `More in ${activeCategory}`}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {rest.map((post) => (
                    <Link
                      key={post.id}
                      to={`/blog/${post.slug}`}
                      className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={post.image_url || 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800'}
                          alt={post.title}
                          onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800'; }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${categoryColor(post.category)}`}>
                            {post.category}
                          </span>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                          <span className="flex items-center gap-1">
                            <User size={12} /> {post.author}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={12} /> {formatDate(post.published_at)}
                          </span>
                        </div>
                        <h3 className="font-serif text-lg font-bold text-slate-900 mb-2 group-hover:text-slate-800 transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="text-slate-600 text-sm leading-relaxed line-clamp-2 mb-4">
                            {post.excerpt}
                          </p>
                        )}
                        <span className="inline-flex items-center gap-1 text-slate-900 font-semibold text-sm group-hover:text-gold-600 transition-colors">
                          Read More <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
