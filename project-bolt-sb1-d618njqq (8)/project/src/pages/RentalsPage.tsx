import { useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  Bath,
  Bed,
  Coffee,
  Loader2,
  MapPin,
  Maximize,
  Menu,
  RotateCcw,
  Search,
  X,
} from 'lucide-react';
import { supabase, type Rental, type PGSpace } from '../lib/supabase';
import { useAuth } from '../lib/auth';

type ListingType = 'rentals' | 'pg';
type FilterTab = 'all' | 'apartments' | 'house' | 'villa' | 'studio' | 'boys' | 'girls' | 'coliving';

const FALLBACK_IMG = 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800';

function formatCurrency(value: number): string {
  if (value >= 100000) return `Rs ${(value / 100000).toFixed(2)} L`;
  return `Rs ${value.toLocaleString('en-IN')}`;
}

export default function RentalsPage() {

  const { user } = useAuth();

  const [listingType, setListingType] = useState<ListingType>('rentals');
  const [filterTab, setFilterTab] = useState<FilterTab>('all');

  const [rentals, setRentals] = useState<Rental[]>([]);
  const [pgSpaces, setPGSpaces] = useState<PGSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [rentalsPage, setRentalsPage] = useState(1);
  const [rentalsTotal, setRentalsTotal] = useState(0);
  const RENTALS_PER_PAGE = 12;

  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [furnishFilter, setFurnishFilter] = useState<string>('all');
  const [bedroomsFilter, setBedroomsFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Inquiry Modal
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [inquiryType, setInquiryType] = useState<'rental' | 'pg'>('rental');
  const [inquiryId, setInquiryId] = useState<string>('');
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquiryMoveInDate, setInquiryMoveInDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchRentals() {
      setLoading(true);
      let query = supabase.from('rentals').select('*', { count: 'exact' }).eq('status', 'available');

      if (searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%,address.ilike.%${searchQuery}%`);
      }
      if (minPrice) query = query.gte('monthly_rent', parseInt(minPrice));
      if (maxPrice) query = query.lte('monthly_rent', parseInt(maxPrice));
      if (furnishFilter !== 'all') query = query.eq('furnish_status', furnishFilter);
      if (bedroomsFilter !== 'all') {
        const beds = parseInt(bedroomsFilter);
        if (beds >= 4) query = query.gte('bedrooms', 4);
        else query = query.eq('bedrooms', beds);
      }

      const from = (rentalsPage - 1) * RENTALS_PER_PAGE;
      query = query.range(from, from + RENTALS_PER_PAGE - 1).order('created_at', { ascending: false });

      const { data, count } = await query;
      if (data) setRentals(data as Rental[]);
      if (count !== null) setRentalsTotal(count);
      setLoading(false);
    }
    fetchRentals();
  }, [searchQuery, minPrice, maxPrice, furnishFilter, bedroomsFilter, rentalsPage]);

  useEffect(() => {
    async function fetchPGs() {
      let query = supabase.from('pg_spaces').select('*').neq('status', 'withdrawn');
      if (searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%,address.ilike.%${searchQuery}%`);
      }
      if (minPrice) query = query.gte('starting_price', parseInt(minPrice));
      if (maxPrice) query = query.lte('starting_price', parseInt(maxPrice));
      const { data } = await query;
      if (data) setPGSpaces(data as PGSpace[]);
    }
    fetchPGs();
  }, [searchQuery, minPrice, maxPrice]);

  const filteredRentals = useMemo(() => {
    if (filterTab === 'all') return rentals;
    const typeMap: Record<string, string> = {
      apartments: 'apartment',
      house: 'house',
      villa: 'villa',
      studio: 'studio',
    };
    const targetType = typeMap[filterTab];
    if (targetType) return rentals.filter(r => r.property_type === targetType);
    return rentals;
  }, [rentals, filterTab]);

  const filteredPG = useMemo(() => {
    if (filterTab === 'all') return pgSpaces;
    if (['boys', 'girls', 'coliving'].includes(filterTab)) {
      const pgType = filterTab === 'coliving' ? 'co-living' : filterTab;
      return pgSpaces.filter(p => p.pg_type === pgType);
    }
    return pgSpaces;
  }, [pgSpaces, filterTab]);

  const clearFilters = () => {
    setSearchQuery('');
    setMinPrice('');
    setMaxPrice('');
    setFurnishFilter('all');
    setBedroomsFilter('all');
    setFilterTab('all');
  };

  const hasActiveFilters = searchQuery || minPrice || maxPrice || furnishFilter !== 'all' || bedroomsFilter !== 'all' || filterTab !== 'all';

  async function handleSubmitInquiry() {
    if (!inquiryName || !inquiryPhone) {
      alert('Please enter your name and phone number');
      return;
    }
    setSubmitting(true);
    try {
      if (inquiryType === 'rental') {
        const { error } = await supabase.from('rental_inquiries').insert({
          rental_id: inquiryId,
          user_id: user?.id || null,
          name: inquiryName,
          phone: inquiryPhone,
          email: inquiryEmail || null,
          message: inquiryMessage || null,
          preferred_move_in_date: inquiryMoveInDate || null,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.from('pg_inquiries').insert({
          pg_id: inquiryId,
          user_id: user?.id || null,
          name: inquiryName,
          phone: inquiryPhone,
          email: inquiryEmail || null,
          message: inquiryMessage || null,
          preferred_move_in_date: inquiryMoveInDate || null,
        });
        if (error) throw error;
      }
      setInquiryOpen(false);
      setInquiryName('');
      setInquiryPhone('');
      setInquiryEmail('');
      setInquiryMessage('');
      setInquiryMoveInDate('');
      alert('Inquiry submitted! The owner will contact you soon.');
    } catch (err: any) {
      alert('Failed to submit: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function openInquiry(type: 'rental' | 'pg', id: string) {
    setInquiryType(type);
    setInquiryId(id);
    setInquiryOpen(true);
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative pt-24 pb-12 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-900">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
              {listingType === 'rentals' ? 'Rent Properties' : 'PG & Co-living'}
            </h1>
            <p className="text-slate-200 text-lg max-w-2xl mx-auto">
              Find fully verified rental apartments, houses, and PG accommodations in Sohna.
              Direct contact with owners, no brokerage fees.
            </p>
          </div>

          {/* Search Bar */}
          <div className="mt-8 max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl p-4 shadow-2xl">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by location, project name..."
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 bg-white text-slate-900"
                  />
                </div>
                {/* Toggle Type */}
                <div className="flex gap-2">
                  <button
                    onClick={() => { setListingType('rentals'); setFilterTab('all'); }}
                    className={`px-5 py-3 rounded-xl font-medium text-sm transition-all ${
                      listingType === 'rentals'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Flats for Rent
                  </button>
                  <button
                    onClick={() => { setListingType('pg'); setFilterTab('all'); }}
                    className={`px-5 py-3 rounded-xl font-medium text-sm transition-all ${
                      listingType === 'pg'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    PG / Co-living
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="sticky top-16 z-30 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-hide">
            {listingType === 'rentals' ? (
              <>
                <TabButton active={filterTab === 'all'} onClick={() => setFilterTab('all')}>All Rentals</TabButton>
                <TabButton active={filterTab === 'apartments'} onClick={() => setFilterTab('apartments')}>Apartments</TabButton>
                <TabButton active={filterTab === 'house'} onClick={() => setFilterTab('house')}>House</TabButton>
                <TabButton active={filterTab === 'villa'} onClick={() => setFilterTab('villa')}>Villa</TabButton>
                <TabButton active={filterTab === 'studio'} onClick={() => setFilterTab('studio')}>Studio</TabButton>
              </>
            ) : (
              <>
                <TabButton active={filterTab === 'all'} onClick={() => setFilterTab('all')}>All</TabButton>
                <TabButton active={filterTab === 'boys'} onClick={() => setFilterTab('boys')}>Boys PG</TabButton>
                <TabButton active={filterTab === 'girls'} onClick={() => setFilterTab('girls')}>Girls PG</TabButton>
                <TabButton active={filterTab === 'coliving'} onClick={() => setFilterTab('coliving')}>Co-living</TabButton>
              </>
            )}
            <div className="ml-auto">
              <button
                onClick={() => setShowFilters(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-800 rounded-lg font-medium text-sm"
              >
                <Menu size={16} />
                Filters
                {hasActiveFilters && <span className="w-2 h-2 bg-gold-500 rounded-full" />}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            {/* Desktop Filters Sidebar */}
            <aside className="hidden lg:block w-72 shrink-0">
              <div className="sticky top-32 bg-white rounded-2xl border border-slate-100 p-6">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                  <h3 className="font-semibold text-slate-900">Filters</h3>
                  {hasActiveFilters && (
                    <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1">
                      <RotateCcw size={12} /> Clear
                    </button>
                  )}
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">
                    Budget (Monthly)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <input
                        type="number"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        placeholder="Min"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        placeholder="Max"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Furnishing (Rentals only) */}
                {listingType === 'rentals' && (
                  <div className="mb-6">
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">
                      Furnishing
                    </label>
                    <div className="space-y-2">
                      {['all', 'unfurnished', 'semifurnished', 'furnished', 'fullyfurnished'].map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setFurnishFilter(opt)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                            furnishFilter === opt
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {opt === 'all' ? 'Any' : opt === 'fullyfurnished' ? 'Fully Furnished' : opt.charAt(0).toUpperCase() + opt.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bedrooms (Rentals only) */}
                {listingType === 'rentals' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">
                      Bedrooms
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {['all', '1', '2', '3', '4'].map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setBedroomsFilter(opt)}
                          className={`px-2 py-2 rounded-lg text-sm font-semibold transition-all border ${
                            bedroomsFilter === opt
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {opt === 'all' ? 'Any' : opt === '4' ? '4+' : opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </aside>

            {/* Results Grid */}
            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 size={32} className="text-slate-500 animate-spin" />
                </div>
              ) : (
                <>
                  {/* Results Count */}
                  <div className="mb-6 flex items-center justify-between">
                    <p className="text-sm text-slate-600">
                      Showing{' '}
                      <span className="font-semibold text-slate-900">
                        {listingType === 'rentals' ? filteredRentals.length : filteredPG.length}
                      </span>{' '}
                      results
                    </p>
                  </div>

                  {/* Rental Cards */}
                  {listingType === 'rentals' ? (
                    filteredRentals.length === 0 ? (
                      <EmptyState onClear={clearFilters} />
                    ) : (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                          {filteredRentals.map((rental) => (
                            <RentalCard
                              key={rental.id}
                              rental={rental}
                              onInquire={() => openInquiry('rental', rental.id)}
                            />
                          ))}
                        </div>
                        {rentalsTotal > RENTALS_PER_PAGE && (
                          <div className="mt-10 flex items-center justify-center gap-2">
                            {Array.from({ length: Math.ceil(rentalsTotal / RENTALS_PER_PAGE) }, (_, i) => (
                              <button
                                key={i}
                                onClick={() => setRentalsPage(i + 1)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                  rentalsPage === i + 1
                                    ? 'bg-slate-900 text-white'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400'
                                }`}
                              >
                                {i + 1}
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )
                  ) : filteredPG.length === 0 ? (
                    <EmptyState onClear={clearFilters} />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {filteredPG.map((pg) => (
                        <PGCard
                          key={pg.id}
                          pg={pg}
                          onInquire={() => openInquiry('pg', pg.id)}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Filter Drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setShowFilters(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Filters</h3>
              <button onClick={() => setShowFilters(false)} className="p-2">
                <X size={20} className="text-slate-600" />
              </button>
            </div>
            <div className="p-5 space-y-6">
              {/* Same filters as desktop */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">
                  Budget (Monthly)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="Min"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  />
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Max"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  />
                </div>
              </div>
              {listingType === 'rentals' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">
                      Furnishing
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {['all', 'unfurnished', 'semifurnished', 'furnished'].map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setFurnishFilter(opt)}
                          className={`px-3 py-2 rounded-lg text-xs font-medium border ${
                            furnishFilter === opt
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-white text-slate-700 border-slate-200'
                          }`}
                        >
                          {opt === 'all' ? 'Any' : opt.charAt(0).toUpperCase() + opt.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">
                      Bedrooms
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {['all', '1', '2', '3', '4'].map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setBedroomsFilter(opt)}
                          className={`px-2 py-2 rounded-lg text-sm font-semibold border ${
                            bedroomsFilter === opt
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-white text-slate-700 border-slate-200'
                          }`}
                        >
                          {opt === 'all' ? 'Any' : opt === '4' ? '4+' : opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
              <button
                onClick={() => setShowFilters(false)}
                className="w-full px-4 py-3 bg-slate-900 text-white rounded-lg font-medium"
              >
                Show Results
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inquiry Modal */}
      {inquiryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/70" onClick={() => setInquiryOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <h2 className="font-serif text-xl font-bold text-slate-900">
                Request Details
              </h2>
              <button onClick={() => setInquiryOpen(false)} className="p-2">
                <X size={20} className="text-slate-600" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1.5">Name *</label>
                <input
                  type="text"
                  value={inquiryName}
                  onChange={(e) => setInquiryName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1.5">Phone *</label>
                <input
                  type="tel"
                  value={inquiryPhone}
                  onChange={(e) => setInquiryPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20"
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1.5">Email</label>
                <input
                  type="email"
                  value={inquiryEmail}
                  onChange={(e) => setInquiryEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1.5">Preferred Move-in Date</label>
                <input
                  type="date"
                  value={inquiryMoveInDate}
                  onChange={(e) => setInquiryMoveInDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1.5">Message</label>
                <textarea
                  value={inquiryMessage}
                  onChange={(e) => setInquiryMessage(e.target.value)}
                  rows={3}
                  placeholder="Any specific requirements..."
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 resize-none"
                />
              </div>
              <button
                onClick={handleSubmitInquiry}
                disabled={submitting}
                className="w-full px-6 py-4 bg-slate-900 hover:bg-slate-900 text-white font-semibold rounded-lg transition-colors disabled:opacity-60"
              >
                {submitting ? 'Submitting...' : 'Submit Inquiry'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
        active
          ? 'bg-slate-900 text-white'
          : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
      }`}
    >
      {children}
    </button>
  );
}

function RentalCard({ rental, onInquire }: { rental: Rental; onInquire: () => void }) {
  return (
    <div className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1">
      <div className="relative h-48 overflow-hidden">
        <img src={rental.image_url || FALLBACK_IMG} alt={rental.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-3 left-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${rental.verified ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-white'}`}>
            {rental.verified ? 'Verified' : rental.listing_type}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 backdrop-blur-sm text-slate-700 capitalize">{rental.property_type}</span>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-1 text-slate-400 text-xs mb-1"><MapPin size={13} />{rental.location}</div>
        <h3 className="font-serif text-lg font-bold text-slate-900 mb-3 line-clamp-1">{rental.title}</h3>
        <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
          {rental.bedrooms !== null && <div className="flex items-center gap-1"><Bed size={14} className="text-gold-500" />{rental.bedrooms} BHK</div>}
          {rental.bathrooms !== null && <div className="flex items-center gap-1"><Bath size={14} className="text-gold-500" />{rental.bathrooms} Bath</div>}
          <div className="flex items-center gap-1"><Maximize size={14} className="text-gold-500" />{rental.area_sqft.toLocaleString()} sqft</div>
        </div>
        <div className="mb-3">
          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-md capitalize">{rental.furnish_status.replace('furnished', ' furnished')}</span>
        </div>
        {rental.amenities && rental.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {rental.amenities.slice(0, 4).map(a => (
              <span key={a} className="text-xs text-slate-500 flex items-center gap-1"><CheckIcon size={12} className="text-emerald-500" />{a}</span>
            ))}
          </div>
        )}
        <div className="flex items-end justify-between pt-4 border-t border-slate-100">
          <div>
            <div className="font-serif text-xl font-bold text-slate-900">{formatCurrency(rental.monthly_rent)}/mo</div>
            {rental.security_deposit && <div className="text-xs text-slate-400">Deposit: {formatCurrency(rental.security_deposit)}</div>}
          </div>
          <div className="flex items-center gap-2">
            <Link to={`/rentals/rental/${rental.id}`}
              className="px-3 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors">
              Details
            </Link>
            <button onClick={onInquire} className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors">
              Inquire
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PGCard({ pg, onInquire }: { pg: PGSpace; onInquire: () => void }) {
  return (
    <div className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1">
      <div className="relative h-48 overflow-hidden">
        <img src={pg.image_url || FALLBACK_IMG} alt={pg.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-3 left-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
            pg.pg_type === 'boys' ? 'bg-blue-500 text-white' :
            pg.pg_type === 'girls' ? 'bg-pink-500 text-white' : 'bg-slate-800 text-white'
          }`}>
            {pg.pg_type === 'co-living' ? 'Co-living' : pg.pg_type.charAt(0).toUpperCase() + pg.pg_type.slice(1) + ' PG'}
          </span>
        </div>
        {pg.featured && (
          <div className="absolute top-3 right-3">
            <span className="px-2 py-1 bg-gold-500 text-slate-900 text-xs font-semibold rounded-full">Featured</span>
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-center gap-1 text-slate-400 text-xs mb-1"><MapPin size={13} />{pg.location}</div>
        <h3 className="font-serif text-lg font-bold text-slate-900 mb-2">{pg.title}</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {pg.room_types.map(rt => (
            <span key={rt} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-md capitalize">{rt} sharing</span>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {pg.amenities.slice(0, 5).map(a => (
            <span key={a} className="text-xs text-slate-500 flex items-center gap-1"><CheckIcon size={12} className="text-emerald-500" />{a}</span>
          ))}
        </div>
        {pg.meals_included && (
          <div className="flex items-center gap-2 text-emerald-600 text-sm mb-3">
            <Coffee size={16} /><span>Meals Included</span>
          </div>
        )}
        <div className="flex items-end justify-between pt-4 border-t border-slate-100">
          <div>
            <div className="text-xs text-slate-400 mb-0.5">Starting from</div>
            <div className="font-serif text-xl font-bold text-slate-900">{formatCurrency(pg.starting_price)}/mo</div>
          </div>
          <div className="flex items-center gap-2">
            <Link to={`/rentals/pg/${pg.id}`}
              className="px-3 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors">
              Details
            </Link>
            <button onClick={onInquire} className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors">
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="text-center py-16">
      <Search size={48} className="text-slate-300 mx-auto mb-4" />
      <h3 className="font-serif text-xl font-bold text-slate-900 mb-2">No Results Found</h3>
      <p className="text-slate-500 mb-6">Try adjusting your filters or search query</p>
      <button onClick={onClear} className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-medium rounded-xl">
        <RotateCcw size={16} /> Clear Filters
      </button>
    </div>
  );
}

function CheckIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={className}>
      <polyline points="20,6 9,17 4,12" />
    </svg>
  );
}
