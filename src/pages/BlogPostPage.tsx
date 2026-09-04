import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  User,
  ArrowLeft,
  ArrowRight,
  Loader2,
  FileText,
  Share2,
  Clock,
} from 'lucide-react';
import { supabase, type BlogPost } from '../lib/supabase';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function estimateReadTime(body: string): number {
  const words = body.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
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

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchPost() {
      if (!slug) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .maybeSingle();
      if (!error && data) {
        setPost(data as BlogPost);

        // Fetch related posts in same category, excluding current
        const { data: relatedData } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('published', true)
          .eq('category', (data as BlogPost).category)
          .neq('id', (data as BlogPost).id)
          .order('published_at', { ascending: false })
          .limit(3);
        if (relatedData) {
          setRelated(relatedData as BlogPost[]);
        }
      }
      setLoading(false);
      if (!data) setNotFound(true);
    }
    fetchPost();
    // Scroll to top on slug change
    window.scrollTo(0, 0);
  }, [slug]);

  // ── Loading State ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center bg-white">
        <Loader2 size={32} className="text-slate-500 animate-spin" />
      </div>
    );
  }

  // ── Not Found State ────────────────────────────────────────
  if (!post) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center bg-white">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-6">
            <FileText size={36} className="text-slate-300" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-slate-900 mb-3">
            Article Not Found
          </h2>
          <p className="text-slate-600 mb-6">
            The article you're looking for may have been removed or is no longer available.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Blog
          </button>
        </div>
      </div>
    );
  }

  const readTime = estimateReadTime(post.body);

  return (
    <div className="pt-20 min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-slate-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-slate-500 hover:text-slate-700 transition-colors">Home</Link>
            <span className="text-slate-300">/</span>
            <Link to="/blog" className="text-slate-500 hover:text-slate-700 transition-colors">Blog</Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-800 font-medium line-clamp-1">{post.title}</span>
          </div>
        </div>
      </div>

      {/* Hero Image */}
      <div className="relative h-64 sm:h-80 lg:h-[28rem] overflow-hidden bg-slate-100">
        <img
          src={post.image_url || 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1920'}
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 ${categoryColor(post.category)}`}>
              {post.category}
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
              {post.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12">
          {/* Article Body */}
          <article>
            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 pb-6 mb-8 border-b border-slate-100">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center">
                  <User size={16} className="text-gold-400" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{post.author}</p>
                  <p className="text-xs text-slate-500">Author</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-slate-600">
                <Calendar size={16} className="text-gold-500" />
                <span>{formatDate(post.published_at)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-slate-600">
                <Clock size={16} className="text-gold-500" />
                <span>{readTime} min read</span>
              </div>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: post.title, url: window.location.href });
                  } else {
                    navigator.clipboard?.writeText(window.location.href);
                  }
                }}
                className="ml-auto inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-800 transition-colors"
              >
                <Share2 size={16} /> Share
              </button>
            </div>

            {/* Excerpt as lead */}
            {post.excerpt && (
              <p className="font-serif text-lg sm:text-xl text-slate-800 leading-relaxed mb-8 italic border-l-4 border-gold-400 pl-4">
                {post.excerpt}
              </p>
            )}

            {/* Body — split by paragraphs */}
            <div className="prose prose-lg max-w-none">
              {post.body.split('\n').map((paragraph, idx) => {
                const trimmed = paragraph.trim();
                if (!trimmed) return null;

                // Headings (lines starting with #)
                if (trimmed.startsWith('# ')) {
                  return (
                    <h2 key={idx} className="font-serif text-2xl font-bold text-slate-900 mt-8 mb-4">
                      {trimmed.slice(2)}
                    </h2>
                  );
                }
                if (trimmed.startsWith('## ')) {
                  return (
                    <h3 key={idx} className="font-serif text-xl font-bold text-slate-900 mt-6 mb-3">
                      {trimmed.slice(3)}
                    </h3>
                  );
                }

                // Bullet points
                if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                  return (
                    <div key={idx} className="flex items-start gap-3 my-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold-500 mt-2.5 shrink-0" />
                      <span className="text-slate-700 leading-relaxed">{trimmed.slice(2)}</span>
                    </div>
                  );
                }

                // Regular paragraph
                return (
                  <p key={idx} className="text-slate-700 leading-relaxed mb-4 text-base sm:text-lg">
                    {trimmed}
                  </p>
                );
              })}
            </div>

            {/* Back to Blog */}
            <div className="mt-12 pt-8 border-t border-slate-100">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-50 hover:bg-slate-100 text-slate-800 font-medium rounded-lg transition-colors border border-slate-200"
              >
                <ArrowLeft size={18} /> Back to Blog
              </button>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="space-y-8">
            {/* Related Posts */}
            <div className="lg:sticky lg:top-24">
              <h3 className="font-serif text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FileText size={20} className="text-gold-500" />
                Related Posts
              </h3>
              {related.length > 0 ? (
                <div className="space-y-4">
                  {related.map((rp) => (
                    <Link
                      key={rp.id}
                      to={`/blog/${rp.slug}`}
                      className="group flex gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                        <img
                          src={rp.image_url || 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=400'}
                          alt={rp.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-1 ${categoryColor(rp.category)}`}>
                          {rp.category}
                        </span>
                        <h4 className="font-serif text-sm font-bold text-slate-900 group-hover:text-slate-800 transition-colors line-clamp-2 leading-snug">
                          {rp.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <Calendar size={10} /> {formatDate(rp.published_at)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 p-4 bg-slate-50 rounded-lg">
                  No related articles found in this category.
                </p>
              )}
            </div>

            {/* CTA Card */}
            <div className="bg-slate-900 rounded-2xl p-6">
              <h3 className="font-serif text-lg font-bold text-white mb-2">
                Need Expert Advice?
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-4">
                Our team is here to help you make the right property investment decisions.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-slate-900 font-semibold text-sm rounded-lg transition-colors w-full justify-center"
              >
                Get in Touch <ArrowRight size={16} />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
