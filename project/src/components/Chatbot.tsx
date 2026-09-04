import { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, X, Send, Sparkles, Home, Calculator, FileText, Phone, MapPin, TrendingUp, Sofa, Search, BedDouble, Building2, Newspaper } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Message {
  id: string;
  role: 'bot' | 'user';
  text: string;
  quickReplies?: { label: string; icon?: keyof typeof icons }[];
  cards?: { title: string; subtitle: string; link?: string; price?: string; badge?: string }[];
}

const icons = { Home, Calculator, FileText, Phone, MapPin, TrendingUp, Sofa, Search, Sparkles, BedDouble, Building2, Newspaper };

const QUICK_STARTS = [
  { label: 'Find properties', icon: 'Search' as const },
  { label: 'Rentals & PG', icon: 'BedDouble' as const },
  { label: 'Home loan rates', icon: 'Calculator' as const },
  { label: 'Legal services', icon: 'FileText' as const },
  { label: 'Interior design', icon: 'Sofa' as const },
  { label: 'Market trends', icon: 'TrendingUp' as const },
  { label: 'Explore localities', icon: 'MapPin' as const },
  { label: 'Read blog', icon: 'Newspaper' as const },
];

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function formatPrice(p: string | number | null): string {
  if (!p) return 'Price on request';
  const s = String(p);
  if (/^[0-9]+$/.test(s)) {
    const n = parseInt(s, 10);
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
    return `₹${n.toLocaleString('en-IN')}`;
  }
  return s;
}

function formatRent(p: string | number | null): string {
  if (!p) return '—';
  const n = Number(p);
  if (isNaN(n)) return String(p);
  return `₹${n.toLocaleString('en-IN')}/mo`;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showBadge, setShowBadge] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const greeting: Message = {
    id: 'greeting',
    role: 'bot',
    text: "Hi! I'm Virasat AI, your real estate assistant. I can help you find properties, rentals, check loan rates, explore localities, and more. What are you looking for today?",
    quickReplies: QUICK_STARTS,
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([greeting]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) {
      setShowBadge(false);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const addMessage = useCallback((msg: Omit<Message, 'id'>) => {
    setMessages((prev) => [...prev, { ...msg, id: uid() }]);
  }, []);

  // ─── PROPERTY SEARCH ──────────────────────────────────────────────
  const searchProperties = async (query: string): Promise<Message | null> => {
    const lower = query.toLowerCase();

    type Budget = { label: string; min: number; max: number };
    const budgets: Budget[] = [
      { label: 'under 20l', min: 0, max: 2000000 },
      { label: 'under 50l', min: 0, max: 5000000 },
      { label: 'under 1cr', min: 0, max: 10000000 },
      { label: 'below 20 lakh', min: 0, max: 2000000 },
      { label: 'below 50 lakh', min: 0, max: 5000000 },
    ];
    const matchedBudget = budgets.find((b) => lower.includes(b.label));

    const typeMatch = ['apartment', 'flat', 'villa', 'plot', 'commercial', 'shop', 'office', 'house', 'studio', 'penthouse']
      .find((t) => lower.includes(t));
    const bhkMatch = ['1bhk', '2bhk', '3bhk', '4bhk', '1 bhk', '2 bhk', '3 bhk', '4 bhk']
      .find((t) => lower.includes(t));

    let q = supabase.from('properties').select('id, title, location, price, price_value, type, bedrooms, status').eq('is_verified', true).limit(4);

    if (matchedBudget) {
      q = q.gte('price_value', matchedBudget.min).lte('price_value', matchedBudget.max);
    }
    if (typeMatch) {
      q = q.ilike('type', `%${typeMatch}%`);
    }
    if (bhkMatch) {
      const bhkNum = parseInt(bhkMatch);
      q = q.eq('bedrooms', bhkNum);
    }

    const locMatch = ['mohali', 'chandigarh', 'patiala', 'zirakpur', 'kharar', 'aerocity', 'sohna', 'gurgaon', 'gurugram', 'sector']
      .find((t) => lower.includes(t));
    if (locMatch) {
      q = q.or(`location.ilike.%${locMatch}%,title.ilike.%${locMatch}%`);
    }

    const { data, error } = await q.order('views_count', { ascending: false });

    if (error || !data || data.length === 0) return null;

    return {
      role: 'bot' as const,
      text: `I found ${data.length} propert${data.length === 1 ? 'y' : 'ies'} matching your search:`,
      cards: data.map((p: any) => ({
        title: p.title,
        subtitle: `${p.location}${p.bedrooms ? ` • ${p.bedrooms} BHK` : ''}${p.type ? ` • ${p.type}` : ''}`,
        price: formatPrice(p.price_value ?? p.price),
        link: `/projects/${p.id}`,
        badge: p.status,
      })),
      quickReplies: [
        { label: 'See all projects' },
        { label: 'Schedule a visit' },
        { label: 'Talk to an agent' },
      ],
    };
  };

  // ─── RENTAL SEARCH ────────────────────────────────────────────────
  const searchRentals = async (query: string): Promise<Message | null> => {
    const lower = query.toLowerCase();

    let q = supabase.from('rentals').select('id, title, location, monthly_rent, property_type, bedrooms, furnish_status, status').eq('status', 'available').limit(4);

    const typeMatch = ['apartment', 'studio', 'villa', 'house', 'shop', 'office']
      .find((t) => lower.includes(t));
    if (typeMatch) {
      q = q.eq('property_type', typeMatch);
    }

    const bhkMatch = ['1bhk', '2bhk', '3bhk', '4bhk', '1 bhk', '2 bhk', '3 bhk', '4 bhk']
      .find((t) => lower.includes(t));
    if (bhkMatch) {
      q = q.eq('bedrooms', parseInt(bhkMatch));
    }

    const furnMatch = ['furnished', 'unfurnished', 'semifurnished']
      .find((t) => lower.includes(t));
    if (furnMatch) {
      q = q.eq('furnish_status', furnMatch);
    }

    const locMatch = ['sohna', 'gurgaon', 'gurugram', 'sector']
      .find((t) => lower.includes(t));
    if (locMatch) {
      q = q.ilike('location', `%${locMatch}%`);
    }

    const { data, error } = await q.order('featured', { ascending: false });

    if (error || !data || data.length === 0) return null;

    return {
      role: 'bot' as const,
      text: `Here are ${data.length} rental${data.length === 1 ? '' : 's'} available right now:`,
      cards: data.map((r: any) => ({
        title: r.title,
        subtitle: `${r.location} • ${r.property_type}${r.bedrooms ? ` • ${r.bedrooms} BHK` : ''} • ${r.furnish_status}`,
        price: formatRent(r.monthly_rent),
        link: `/rentals/${r.id}`,
        badge: 'For Rent',
      })),
      quickReplies: [{ label: 'Browse all rentals' }, { label: 'Find a PG' }, { label: 'Talk to an agent' }],
    };
  };

  // ─── PG SEARCH ────────────────────────────────────────────────────
  const searchPGs = async (): Promise<Message | null> => {
    const { data, error } = await supabase
      .from('pg_spaces')
      .select('id, title, location, pg_type, starting_price, rating, available_beds, status')
      .eq('status', 'available')
      .order('featured', { ascending: false })
      .limit(4);

    if (error || !data || data.length === 0) return null;

    return {
      role: 'bot' as const,
      text: `I found ${data.length} PG space${data.length === 1 ? '' : 's'} with available beds:`,
      cards: data.map((pg: any) => ({
        title: pg.title,
        subtitle: `${pg.location} • ${pg.pg_type.toUpperCase()} • ${pg.available_beds} beds available • ⭐ ${pg.rating}`,
        price: `From ₹${Number(pg.starting_price).toLocaleString('en-IN')}/mo`,
        link: `/rentals`,
        badge: 'PG',
      })),
      quickReplies: [{ label: 'Browse all rentals' }, { label: 'Find properties' }],
    };
  };

  // ─── LOCALITIES ───────────────────────────────────────────────────
  const searchLocalities = async (query: string): Promise<Message | null> => {
    const lower = query.toLowerCase();
    const locMatch = ['sohna', 'gurgaon', 'gurugram', 'sector', 'mohali', 'chandigarh']
      .find((t) => lower.includes(t));

    let q = supabase
      .from('localities')
      .select('id, name, slug, avg_price_per_sqft, walkability_score, safety_score, school_rating')
      .order('name')
      .limit(5);

    if (locMatch) {
      q = q.or(`name.ilike.%${locMatch}%,slug.ilike.%${locMatch}%`);
    }

    const { data, error } = await q;

    if (error || !data || data.length === 0) return null;

    return {
      role: 'bot' as const,
      text: `Here are ${data.length} localit${data.length === 1 ? 'y' : 'ies'} with their live data:`,
      cards: data.map((l: any) => ({
        title: l.name,
        subtitle: `Walkability: ${l.walkability_score}/100 • Safety: ${l.safety_score}/100 • Schools: ${l.school_rating}/5`,
        price: l.avg_price_per_sqft ? `₹${Number(l.avg_price_per_sqft).toLocaleString('en-IN')}/sqft` : undefined,
        link: `/localities/${l.slug}`,
        badge: 'Locality',
      })),
      quickReplies: [{ label: 'Explore localities' }, { label: 'Market trends' }, { label: 'Find properties' }],
    };
  };

  // ─── MARKET REPORTS ───────────────────────────────────────────────
  const searchMarketReports = async (): Promise<Message | null> => {
    const { data, error } = await supabase
      .from('market_reports')
      .select('id, quarter, year, locality, avg_price_sqft, price_change_pct, total_transactions, new_launches')
      .eq('published', true)
      .order('year', { ascending: false })
      .order('quarter', { ascending: false })
      .limit(5);

    if (error || !data || data.length === 0) return null;

    return {
      role: 'bot' as const,
      text: `Here are the latest market reports (Q2 2025):`,
      cards: data.map((r: any) => ({
        title: `${r.locality} — ${r.quarter} ${r.year}`,
        subtitle: `${r.total_transactions} transactions • ${r.new_launches} new launches • ${r.price_change_pct > 0 ? '+' : ''}${r.price_change_pct}% price change`,
        price: r.avg_price_sqft ? `₹${Number(r.avg_price_sqft).toLocaleString('en-IN')}/sqft` : undefined,
        link: `/market-reports`,
        badge: r.price_change_pct > 0 ? `↑ ${r.price_change_pct}%` : `↓ ${r.price_change_pct}%`,
      })),
      quickReplies: [{ label: 'View market reports' }, { label: 'Explore localities' }, { label: 'Find properties' }],
    };
  };

  // ─── BANK PARTNERS / LOANS ─────────────────────────────────────────
  const searchBankPartners = async (): Promise<Message | null> => {
    const { data, error } = await supabase
      .from('bank_partners')
      .select('id, name, bank_type, min_interest_rate, max_interest_rate, min_loan_amount, max_loan_amount')
      .eq('active', true)
      .order('priority')
      .limit(6);

    if (error || !data || data.length === 0) return null;

    return {
      role: 'bot' as const,
      text: `We partner with ${data.length} banks/NBFCs offering home loans. Here are the current rates:`,
      cards: data.map((b: any) => ({
        title: b.name,
        subtitle: `${b.bank_type.toUpperCase()} • Loan up to ${formatPrice(b.max_loan_amount)}`,
        price: `${b.min_interest_rate}%–${b.max_interest_rate}% p.a.`,
        link: `/home-loans`,
        badge: 'Loan Partner',
      })),
      quickReplies: [{ label: 'EMI Calculator' }, { label: 'Apply for a loan' }, { label: 'Home loan partners' }],
    };
  };

  // ─── INTERIOR PACKAGES ─────────────────────────────────────────────
  const searchInteriorPackages = async (): Promise<Message | null> => {
    const { data, error } = await supabase
      .from('interior_packages')
      .select('id, name, category, starting_price, price_per_sqft, timeline_weeks')
      .eq('active', true)
      .order('featured', { ascending: false })
      .limit(3);

    if (error || !data || data.length === 0) return null;

    return {
      role: 'bot' as const,
      text: `Here are our interior design packages:`,
      cards: data.map((p: any) => ({
        title: `${p.name} (${p.category.toUpperCase()})`,
        subtitle: `Timeline: ${p.timeline_weeks} weeks${p.price_per_sqft ? ` • ₹${p.price_per_sqft}/sq.ft` : ''}`,
        price: `From ${formatPrice(p.starting_price)}`,
        link: `/interior-design`,
        badge: 'Interior',
      })),
      quickReplies: [{ label: 'View interior packages' }, { label: 'Book a design consult' }],
    };
  };

  // ─── LEGAL SERVICES ────────────────────────────────────────────────
  const searchLegalServices = async (): Promise<Message | null> => {
    const { data, error } = await supabase
      .from('legal_services')
      .select('id, name, service_type, base_price, timeline_days')
      .eq('active', true)
      .order('featured', { ascending: false })
      .limit(5);

    if (error || !data || data.length === 0) return null;

    return {
      role: 'bot' as const,
      text: `Here are our legal services with live pricing:`,
      cards: data.map((s: any) => ({
        title: s.name,
        subtitle: `${s.service_type.replace(/_/g, ' ')} • ${s.timeline_days} days timeline`,
        price: formatPrice(s.base_price),
        link: `/legal`,
        badge: 'Legal',
      })),
      quickReplies: [{ label: 'View legal services' }, { label: 'Stamp duty calculator' }, { label: 'Talk to an agent' }],
    };
  };

  // ─── BLOG POSTS ───────────────────────────────────────────────────
  const searchBlogPosts = async (): Promise<Message | null> => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('id, title, slug, category, author')
      .eq('published', true)
      .order('published_at', { ascending: false })
      .limit(4);

    if (error || !data || data.length === 0) return null;

    return {
      role: 'bot' as const,
      text: `Here are our latest articles:`,
      cards: data.map((b: any) => ({
        title: b.title,
        subtitle: `${b.category} • by ${b.author}`,
        link: `/blog/${b.slug}`,
        badge: 'Blog',
      })),
      quickReplies: [{ label: 'Read more articles' }],
    };
  };

  // ─── RESPONSE GENERATOR ───────────────────────────────────────────
  const generateResponse = async (userText: string): Promise<Message> => {
    const lower = userText.toLowerCase().trim();

    if (lower.match(/^(hi|hello|hey|namaste|namaskar)/)) {
      return {
        role: 'bot',
        text: 'Hello! Welcome to Virasat Realty. How can I assist you today?',
        quickReplies: QUICK_STARTS,
      };
    }

    if (lower.match(/(thank|thanks|thx)/)) {
      return { role: 'bot', text: "You're welcome! Is there anything else I can help you with?", quickReplies: QUICK_STARTS };
    }

    if (lower.match(/(bye|goodbye|see you|exit)/)) {
      return { role: 'bot', text: 'Goodbye! Feel free to come back anytime. Have a great day!' };
    }

    // PG-specific query must be checked before general rental
    if (lower.match(/\bpg\b/) || lower.includes('co-living') || lower.includes('coliving') || lower.includes('hostel')) {
      const result = await searchPGs();
      if (result) return result;
      return {
        role: 'bot',
        text: "I couldn't find available PG spaces right now. You can check all rentals on our Rentals page.",
        quickReplies: [{ label: 'Browse all rentals' }, { label: 'Find properties' }],
      };
    }

    // Rentals
    if (lower.match(/(rent|rental|tenant|lease|apartment for rent|house for rent|villa for rent)/)) {
      const result = await searchRentals(lower);
      if (result) return result;
      return {
        role: 'bot',
        text: "I couldn't find matching rentals right now, but you can browse all available rentals on our Rentals page.",
        quickReplies: [{ label: 'Browse all rentals' }, { label: 'Find a PG' }, { label: 'Talk to an agent' }],
      };
    }

    // Properties (must come after rental/pg checks)
    if (lower.match(/(property|properties|project|home|house|flat|apartment|villa|plot|commercial|shop|office|2bhk|3bhk|1bhk|4bhk|budget|affordable|luxury|buy|purchase)/)) {
      const result = await searchProperties(lower);
      if (result) return result;
      return {
        role: 'bot',
        text: "I couldn't find exact matches right now, but you can browse all our verified properties on the Projects page.",
        quickReplies: [{ label: 'See all projects' }, { label: 'Schedule a visit' }, { label: 'Talk to an agent' }],
      };
    }

    // Loans / EMI / Bank partners
    if (lower.match(/(emi|loan|interest|home loan|mortgage|installment|bank|lender|finance)/)) {
      const result = await searchBankPartners();
      if (result) return result;
      return {
        role: 'bot',
        text: "I can help with home loans! You can use our EMI calculator to estimate your monthly payments, or apply directly through our Home Loans page.",
        quickReplies: [{ label: 'EMI Calculator' }, { label: 'Apply for a loan' }],
      };
    }

    // Legal services
    if (lower.match(/(stamp duty|registration|tax|legal|document|agreement|sale deed|title|encumbrance|power of attorney|will|advocate|lawyer)/)) {
      const result = await searchLegalServices();
      if (result) return result;
      return {
        role: 'bot',
        text: "Our legal services cover rent agreements, sale deeds, title verification, property registration, and more.",
        quickReplies: [{ label: 'View legal services' }, { label: 'Stamp duty calculator' }],
      };
    }

    // Interior design
    if (lower.match(/(interior|design|furniture|decor|renovation|modular|wardrobe|kitchen)/)) {
      const result = await searchInteriorPackages();
      if (result) return result;
      return {
        role: 'bot',
        text: "Our interior design service offers end-to-end packages. Starting at ₹800/sq.ft.",
        quickReplies: [{ label: 'View interior packages' }, { label: 'Book a design consult' }],
      };
    }

    // Market reports / trends
    if (lower.match(/(market|trend|report|price trend|appreciation|investment|quarterly|absorption)/)) {
      const result = await searchMarketReports();
      if (result) return result;
      return {
        role: 'bot',
        text: "Our market reports provide quarterly data on average prices, transaction volumes, and new launches.",
        quickReplies: [{ label: 'View market reports' }, { label: 'Explore localities' }],
      };
    }

    // Localities
    if (lower.match(/(locality|area|neighborhood|location|where|sector|sohna|gurgaon|gurugram|mohali|chandigarh|walkability|safety|school)/)) {
      const result = await searchLocalities(lower);
      if (result) return result;
      return {
        role: 'bot',
        text: "We cover prime localities with walkability scores, safety ratings, school ratings, and average price per sqft.",
        quickReplies: [{ label: 'Explore localities' }, { label: 'Market trends' }],
      };
    }

    // Blog
    if (lower.match(/(blog|article|news|guide|read|post)/)) {
      const result = await searchBlogPosts();
      if (result) return result;
      return {
        role: 'bot',
        text: "Check out our blog for buying guides, market trends, and locality guides.",
        quickReplies: [{ label: 'Read more articles' }],
      };
    }

    // Site visit
    if (lower.match(/(visit|site visit|tour|schedule|appointment|see the property)/)) {
      return {
        role: 'bot',
        text: "I'd be happy to help you schedule a site visit! You can book a visit from any property detail page, or I can have our team call you.",
        quickReplies: [{ label: 'Browse projects to visit' }, { label: 'Request a callback' }],
      };
    }

    // Contact
    if (lower.match(/(contact|call|phone|agent|broker|callback|reach|email)/)) {
      return {
        role: 'bot',
        text: "You can reach us at +91 70157 14787 or visit our Contact page. Would you like me to connect you with a property specialist?",
        quickReplies: [{ label: 'Contact page' }, { label: 'Schedule a visit' }],
      };
    }

    // Compare
    if (lower.match(/(compare|vs|versus|difference between)/)) {
      return {
        role: 'bot',
        text: "You can compare up to 3 properties side-by-side on our Compare page — price, area, amenities, location scores, and more.",
        quickReplies: [{ label: 'Compare properties' }],
      };
    }

    // Favorites
    if (lower.match(/(favorite|save|shortlist|wishlist)/)) {
      return {
        role: 'bot',
        text: "You can save properties to your favorites by clicking the heart icon on any property card. View them anytime from your dashboard.",
        quickReplies: [{ label: 'View favorites' }, { label: 'Browse projects' }],
      };
    }

    return {
      role: 'bot',
      text: "I'm not sure I understood that fully, but I'm here to help! You can ask me about finding properties, rentals, PG spaces, home loan rates, legal services, interior design, market trends, localities, or our blog.",
      quickReplies: QUICK_STARTS,
    };
  };

  const handleSend = async (text?: string) => {
    const userText = (text ?? input).trim();
    if (!userText) return;

    addMessage({ role: 'user', text: userText });
    setInput('');
    setIsTyping(true);

    const response = await generateResponse(userText);

    setTimeout(() => {
      setIsTyping(false);
      addMessage(response);
    }, 600 + Math.random() * 500);
  };

  const handleQuickReply = (label: string) => {
    const routeMap: Record<string, string> = {
      'See all projects': '/projects',
      'Browse projects': '/projects',
      'Browse projects to visit': '/projects',
      'Browse all rentals': '/rentals',
      'Find a PG': '/rentals',
      'Find properties': '/projects',
      'EMI Calculator': '/tools',
      'Home loan partners': '/home-loans',
      'Apply for a loan': '/home-loans',
      'View legal services': '/legal',
      'Stamp duty calculator': '/tools',
      'View interior packages': '/interior-design',
      'Book a design consult': '/interior-design',
      'Explore localities': '/localities',
      'Market trends': '/market-reports',
      'View market reports': '/market-reports',
      'Request a callback': '/contact',
      'Contact page': '/contact',
      'Talk to an agent': '/contact',
      'Schedule a visit': '/projects',
      'Compare properties': '/compare',
      'View favorites': '/favorites',
      'Read more articles': '/blog',
    };

    const route = routeMap[label];
    if (route) {
      window.history.pushState({}, '', route);
      window.dispatchEvent(new PopStateEvent('popstate'));
      setIsOpen(false);
      return;
    }

    handleSend(label);
  };

  return (
    <>
      {/* Floating button — bottom-left */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-gold-500 to-gold-700 shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 group"
        aria-label="Open chat assistant"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <>
            <Bot className="w-6 h-6 text-white" />
            {showBadge && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-maroon-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-fade-in">
                1
              </span>
            )}
            <span className="absolute inset-0 rounded-full bg-gold-400 animate-ping opacity-20" />
          </>
        )}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-24 left-4 sm:left-6 z-50 w-[calc(100vw-2rem)] max-w-[380px] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col animate-slide-up" style={{ maxHeight: 'min(600px, calc(100vh - 8rem))' }}>
          {/* Header */}
          <div className="bg-gradient-to-r from-gold-600 to-gold-800 p-4 flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center relative">
              <Bot className="w-5 h-5 text-white" />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-gold-700 rounded-full" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold text-sm flex items-center gap-1.5">
                Virasat AI
                <Sparkles className="w-3 h-3 text-gold-200" />
              </h3>
              <p className="text-white/70 text-xs">Online • Connected to live database</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-slate-50 to-white">
            {messages.map((msg) => (
              <div key={msg.id}>
                {msg.role === 'user' ? (
                  <div className="flex justify-end">
                    <div className="bg-gold-600 text-white rounded-2xl rounded-br-md px-4 py-2.5 max-w-[80%] shadow-sm">
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-start">
                    <div className="flex gap-2 max-w-[88%]">
                      <div className="w-7 h-7 rounded-full bg-gold-100 flex items-center justify-center shrink-0 mt-0.5">
                        <Bot className="w-4 h-4 text-gold-600" />
                      </div>
                      <div>
                        <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-md px-4 py-2.5 shadow-sm">
                          <p className="text-sm text-slate-800 leading-relaxed">{msg.text}</p>
                        </div>

                        {/* Cards */}
                        {msg.cards && msg.cards.length > 0 && (
                          <div className="mt-2 space-y-2">
                            {msg.cards.map((card, i) => (
                              <a
                                key={i}
                                href={card.link}
                                className="block bg-white border border-slate-200 rounded-xl p-3 hover:border-gold-300 hover:shadow-md transition-all group"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                      <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-gold-700 transition-colors">{card.title}</p>
                                      {card.badge && (
                                        <span className="shrink-0 px-1.5 py-0.5 bg-gold-100 text-gold-700 text-[10px] font-bold rounded-full">{card.badge}</span>
                                      )}
                                    </div>
                                    <p className="text-xs text-slate-500 mt-0.5">{card.subtitle}</p>
                                  </div>
                                  {card.price && (
                                    <span className="text-xs font-bold text-gold-600 shrink-0 whitespace-nowrap">{card.price}</span>
                                  )}
                                </div>
                              </a>
                            ))}
                          </div>
                        )}

                        {/* Quick replies */}
                        {msg.quickReplies && msg.quickReplies.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {msg.quickReplies.map((qr, i) => {
                              const Icon = qr.icon ? icons[qr.icon] : null;
                              return (
                                <button
                                  key={i}
                                  onClick={() => handleQuickReply(qr.label)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gold-200 text-gold-700 text-xs font-medium rounded-full hover:bg-gold-50 hover:border-gold-400 transition-all"
                                >
                                  {Icon && <Icon className="w-3 h-3" />}
                                  {qr.label}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-gold-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4 text-gold-600" />
                  </div>
                  <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gold-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-gold-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-gold-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-slate-100 shrink-0">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                placeholder="Type your message..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className="w-10 h-10 rounded-full bg-gold-600 text-white flex items-center justify-center hover:bg-gold-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-2">Powered by Virasat AI • For complex queries, call +91 70157 14787</p>
          </div>
        </div>
      )}
    </>
  );
}
