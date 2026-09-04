import { useState, useEffect } from 'react';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  IndianRupee,
  Loader2,
  Palette,
  Paintbrush,
  Phone,
  Ruler,
  Sparkles,
  Star,
  Timer,
  Users,
  Wand2,
  X,
} from 'lucide-react';
import { supabase, type InteriorPackage } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { useAuthUI } from '../lib/authUI';

const FALLBACK_IMG = 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800';

const DESIGN_STYLES = [
  { key: 'modern', label: 'Modern', desc: 'Clean lines, neutral colors' },
  { key: 'contemporary', label: 'Contemporary', desc: 'Current trends, functionality' },
  { key: 'minimalist', label: 'Minimalist', desc: 'Less is more approach' },
  { key: 'scandinavian', label: 'Scandinavian', desc: 'Warm, functional simplicity' },
  { key: 'industrial', label: 'Industrial', desc: 'Raw, unfinished elements' },
  { key: 'traditional', label: 'Traditional', desc: 'Classic Indian designs' },
];

export default function InteriorDesignPage() {
  const { user } = useAuth();
  const { openAuth } = useAuthUI();

  const [packages, setPackages] = useState<InteriorPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Booking Modal State
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<InteriorPackage | null>(null);
  const [propertyAddress, setPropertyAddress] = useState('');
  const [propertyType, setPropertyType] = useState('2bhk');
  const [areaSqft, setAreaSqft] = useState('');
  const [designStyle, setDesignStyle] = useState('modern');
  const [colorPreference, setColorPreference] = useState('');
  const [budgetRange, setBudgetRange] = useState('standard');
  const [preferredStartDate, setPreferredStartDate] = useState('');
  const [additionalRequirements, setAdditionalRequirements] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [bookingSubmitted, setBookingSubmitted] = useState(false);


  useEffect(() => {
    async function fetchPackages() {
      const { data } = await supabase
        .from('interior_packages')
        .select('*')
        .eq('active', true)
        .order('starting_price', { ascending: true });
      if (data) setPackages(data as InteriorPackage[]);
      setLoading(false);
    }
    fetchPackages();
  }, []);

  const filteredPackages = selectedCategory === 'all'
    ? packages
    : packages.filter(p => p.category === selectedCategory);

  useEffect(() => {
    if (user) {
      setContactEmail(user.email || '');
    }
  }, [user]);

  async function handleSubmitBooking() {
    if (!user) {
      openAuth('signin');
      return;
    }
    if (!selectedPackage || !propertyAddress || !areaSqft || !contactName || !contactPhone) {
      setSubmitError('Please fill all required fields.');
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const { error } = await supabase.from('interior_bookings').insert({
        user_id: user.id,
        package_id: selectedPackage.id,
        property_address: propertyAddress,
        property_type: propertyType,
        area_sqft: parseFloat(areaSqft),
        design_style: designStyle,
        color_preference: colorPreference || null,
        budget_range: budgetRange,
        preferred_start_date: preferredStartDate || null,
        additional_requirements: additionalRequirements || null,
        contact_name: contactName,
        contact_phone: contactPhone,
        contact_email: contactEmail || null,
      });
      if (error) throw error;
      setBookingSubmitted(true);
    } catch (err: any) {
      setSubmitError('Failed to submit: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function resetBookingForm() {
    setPropertyAddress('');
    setAreaSqft('');
    setDesignStyle('modern');
    setColorPreference('');
    setPreferredStartDate('');
    setAdditionalRequirements('');
    setContactName('');
    setContactPhone('');
    setContactEmail('');
  }

  function openBooking(pkg: InteriorPackage) {
    setSelectedPackage(pkg);
    setPropertyType(pkg.category);
    setShowBookingModal(true);
  }

  function formatCurrency(value: number): string {
    if (value >= 100000) return `Rs ${(value / 100000).toFixed(2)} L`;
    return `Rs ${value.toLocaleString('en-IN')}`;
  }

  const stats = [
    { value: '500+', label: 'Homes Designed' },
    { value: '50+', label: 'Expert Designers' },
    { value: '4.9', label: 'Customer Rating' },
    { value: '15+', label: 'Years Experience' },
  ];

  const designProcess = [
    { icon: Wand2, title: 'Consultation', desc: 'Free consultation to understand your style and needs' },
    { icon: Palette, title: 'Design', desc: 'Custom design creation with 3D visualization' },
    { icon: CheckCircle2, title: 'Approval', desc: 'Review and approve designs before execution' },
    { icon: Paintbrush, title: 'Execution', desc: 'Quality craftsmanship with timeline adherence' },
  ];

  const whyChooseUs = [
    { icon: Award, title: 'Award-Winning Designers', desc: 'Our team includes recognized designers with national awards.' },
    { icon: Ruler, title: 'End-to-End Service', desc: 'From concept to completion, we handle everything.' },
    { icon: Sparkles, title: 'Quality Materials', desc: 'Premium quality with brands like Godrej, Hettich, and more.' },
    { icon: Timer, title: 'On-Time Delivery', desc: 'We stick to timelines with transparent progress updates.' },
    { icon: IndianRupee, title: 'Transparent Pricing', desc: 'No hidden costs. Price you see is price you pay.' },
    { icon: Users, title: 'Post-Installation Support', desc: 'Free maintenance for 1 year after completion.' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gold-500 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500/15 backdrop-blur-sm rounded-full border border-gold-400/30 mb-6">
                <Sparkles size={16} className="text-gold-400" />
                <span className="text-gold-300 text-sm font-medium">500+ Happy Homes</span>
              </div>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Transform Your <span className="text-gold-400">Space</span> Into Art
              </h1>
              <p className="text-slate-200 text-lg sm:text-xl mb-10 leading-relaxed">
                Premium interior design services for homes and offices. From modular kitchens
                to complete home makeovers, we'll bring your vision to life.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => {
                    const el = document.getElementById('packages');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gold-500 hover:bg-gold-600 text-slate-900 font-semibold rounded-lg transition-all duration-300 hover:-translate-y-0.5 shadow-lg shadow-gold-500/20"
                >
                  View Packages
                  <ArrowRight size={18} />
                </button>
                <button
                  onClick={() => setShowBookingModal(true)}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg backdrop-blur-sm border border-white/20 transition-all"
                >
                  <Phone size={18} />
                  Book Consultation
                </button>
              </div>

              {/* Quick Stats */}
              <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="p-4 bg-slate-900/50 rounded-xl border border-slate-800/50">
                    <div className="font-serif text-2xl sm:text-3xl font-bold text-gold-400">{stat.value}</div>
                    <div className="text-slate-300 text-xs mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Image Grid */}
            <div className="hidden lg:grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <img
                  src="https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Modern Living Room"
                  className="w-full h-48 object-cover rounded-2xl"
                />
                <img
                  src="https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Kitchen Design"
                  className="w-full h-64 object-cover rounded-2xl"
                />
              </div>
              <div className="space-y-4 pt-8">
                <img
                  src="https://images.pexels.com/photos/2089698/pexels-photo-2089698.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Bedroom Design"
                  className="w-full h-64 object-cover rounded-2xl"
                />
                <img
                  src="https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Bathroom Design"
                  className="w-full h-48 object-cover rounded-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Design Process */}
      <section className="py-16 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {designProcess.map((step) => (
              <div key={step.title} className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
                  <step.icon className="w-6 h-6 text-gold-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">{step.title}</h3>
                  <p className="text-slate-600 text-xs mt-1">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interior Packages */}
      <section id="packages" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-gold-600 text-sm font-semibold uppercase tracking-wider">
              Interior Packages
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mt-3 mb-4">
              Design Solutions for Every Home
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Choose from our curated packages designed for different home sizes and budgets.
              All packages include modular furniture, civil work, and accessories.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              All Categories
            </button>
            {['1bhk', '2bhk', '3bhk', 'villa'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all capitalize ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {cat.replace('bhk', ' BHK')}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={32} className="text-slate-500 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {filteredPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`bg-white rounded-2xl border ${
                    pkg.featured ? 'border-gold-300 shadow-xl shadow-gold-100/50' : 'border-slate-100'
                  } overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group`}
                >
                  {/* Image */}
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={pkg.image_url || FALLBACK_IMG}
                      alt={pkg.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {pkg.featured && (
                      <div className="absolute top-4 left-4">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gold-500 text-slate-900 text-xs font-semibold rounded-full">
                          <Star size={12} className="fill-current" />
                          Most Popular
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-slate-900 text-xs font-semibold rounded-full capitalize">
                        {pkg.category.replace('bhk', ' BHK')}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6">
                    <h3 className="font-serif text-xl font-bold text-slate-900 mb-2">
                      {pkg.name}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed mb-4">
                      {pkg.description}
                    </p>

                    {/* Price */}
                    <div className="flex items-end gap-2 mb-5">
                      <span className="font-serif text-3xl font-bold text-slate-900">
                        {formatCurrency(pkg.starting_price)}
                      </span>
                      <span className="text-slate-500 text-sm">onwards</span>
                    </div>

                    {/* Includes */}
                    <div className="mb-6">
                      <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">
                        What's Included
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {pkg.includes.slice(0, 6).map((item) => (
                          <div key={item} className="flex items-center gap-2 text-xs text-slate-700">
                            <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Highlights */}
                    {pkg.highlights && pkg.highlights.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {pkg.highlights.map((h) => (
                          <span key={h} className="px-2 py-1 bg-gold-50 text-gold-700 text-xs rounded-md font-medium">
                            {h}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Timeline */}
                    {pkg.timeline_weeks && (
                      <div className="flex items-center gap-2 text-slate-600 text-sm mb-5">
                        <Clock size={16} className="text-gold-500" />
                        <span>{pkg.timeline_weeks} weeks delivery</span>
                      </div>
                    )}

                    {/* CTA */}
                    <button
                      onClick={() => openBooking(pkg)}
                      className="w-full px-6 py-3 bg-slate-900 hover:bg-slate-900 text-white font-semibold rounded-lg transition-colors"
                    >
                      Book Free Consultation
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-gold-400 text-sm font-semibold uppercase tracking-wider">
              Why Choose Us
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-3 mb-4">
              Quality Is Our Promise
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyChooseUs.map((item) => (
              <div
                key={item.title}
                className="p-6 rounded-xl bg-slate-900/50 border border-slate-800/50 hover:bg-slate-900 hover:border-gold-500/30 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-gold-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-slate-300 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Design Styles */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-gold-600 text-sm font-semibold uppercase tracking-wider">
              Popular Styles
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mt-3 mb-4">
              Choose Your Design Style
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {DESIGN_STYLES.map((style) => (
              <button
                key={style.key}
                onClick={() => {
                  setDesignStyle(style.key);
                  setShowBookingModal(true);
                }}
                className="p-5 rounded-xl bg-slate-50 border border-slate-100 hover:border-gold-300 hover:bg-gold-50/30 transition-all text-center"
              >
                <div className="font-semibold text-slate-900 text-sm">{style.label}</div>
                <div className="text-slate-500 text-xs mt-1">{style.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-6">
            <CheckCircle2 size={16} />
            Free Design Consultation
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-5">
            Ready to Transform Your Home?
          </h2>
          <p className="text-slate-600 text-lg mb-10 max-w-2xl mx-auto">
            Let our expert designers create your dream space. Book a free consultation today
            and see your vision come to life with 3D visualization.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setShowBookingModal(true)}
              className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 hover:bg-slate-900 text-white font-semibold rounded-lg transition-all"
            >
              Book Free Consultation
              <ArrowRight size={18} />
            </button>
            <a
              href="tel:+917015714787"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gold-500 hover:bg-gold-600 text-slate-900 font-semibold rounded-lg transition-all"
            >
              <Phone size={18} />
              Call Us
            </a>
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={() => setShowBookingModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="font-serif text-xl font-bold text-slate-900">
                  Book Interior Consultation
                </h2>
                {selectedPackage && (
                  <p className="text-slate-600 text-sm">{selectedPackage.name} Package</p>
                )}
              </div>
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  setSelectedPackage(null);
                }}
                className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-50"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-6">
              {/* Property Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">
                    Property Type *
                  </label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 bg-white text-slate-900"
                  >
                    <option value="1bhk">1 BHK</option>
                    <option value="2bhk">2 BHK</option>
                    <option value="3bhk">3 BHK</option>
                    <option value="4bhk">4 BHK</option>
                    <option value="villa">Villa</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">
                    Area (sq ft) *
                  </label>
                  <input
                    type="number"
                    value={areaSqft}
                    onChange={(e) => setAreaSqft(e.target.value)}
                    placeholder="1200"
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 bg-white text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Property Address *
                </label>
                <input
                  type="text"
                  value={propertyAddress}
                  onChange={(e) => setPropertyAddress(e.target.value)}
                  placeholder="Enter complete address"
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 bg-white text-slate-900"
                />
              </div>

              {/* Design Preferences */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-3">
                  Preferred Design Style
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {DESIGN_STYLES.map((style) => (
                    <button
                      key={style.key}
                      onClick={() => setDesignStyle(style.key)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        designStyle === style.key
                          ? 'border-gold-500 bg-gold-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-medium text-slate-900 text-sm">{style.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">
                    Color Preference
                  </label>
                  <input
                    type="text"
                    value={colorPreference}
                    onChange={(e) => setColorPreference(e.target.value)}
                    placeholder="e.g., Light colors, Earth tones"
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">
                    Budget Range
                  </label>
                  <select
                    value={budgetRange}
                    onChange={(e) => setBudgetRange(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 bg-white text-slate-900"
                  >
                    <option value="budget">Budget (Under Rs 5L)</option>
                    <option value="standard">Standard (Rs 5L - 10L)</option>
                    <option value="premium">Premium (Rs 10L - 20L)</option>
                    <option value="luxury">Luxury (Above Rs 20L)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Preferred Start Date
                </label>
                <input
                  type="date"
                  value={preferredStartDate}
                  onChange={(e) => setPreferredStartDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Additional Requirements
                </label>
                <textarea
                  value={additionalRequirements}
                  onChange={(e) => setAdditionalRequirements(e.target.value)}
                  placeholder="Tell us about your specific requirements..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 bg-white text-slate-900 resize-none"
                />
              </div>

              {/* Contact Details */}
              <div className="border-t border-slate-100 pt-6">
                <h3 className="font-semibold text-slate-900 mb-4">Contact Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Your name"
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 bg-white text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 bg-white text-slate-900"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 bg-white text-slate-900"
                  />
                </div>
              </div>

              {/* Submit */}
              {bookingSubmitted ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={28} className="text-emerald-500" />
                  </div>
                  <h4 className="font-semibold text-slate-900 text-lg mb-2">Booking Submitted!</h4>
                  <p className="text-slate-500 text-sm">Our design team will contact you within 24 hours.</p>
                  <button onClick={() => { setShowBookingModal(false); setBookingSubmitted(false); resetBookingForm(); }}
                    className="mt-4 px-5 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
                    Close
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={handleSubmitBooking}
                    disabled={submitting}
                    className="w-full px-6 py-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors disabled:opacity-60"
                  >
                    {submitting ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 size={18} className="animate-spin" />
                        Submitting...
                      </span>
                    ) : (
                      'Submit Booking Request'
                    )}
                  </button>
                  {submitError && (
                    <p className="text-sm text-red-600 text-center mt-2">{submitError}</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
