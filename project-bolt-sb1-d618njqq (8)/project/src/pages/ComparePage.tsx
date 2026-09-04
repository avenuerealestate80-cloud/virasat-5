import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  Trash2,
  MapPin,
  Bed,
  Bath,
  Maximize,
  IndianRupee,
  Building2,
  FileCheck,
  Compass,
  Calendar,
  Sofa,
  Sparkles,
  CheckCircle2,
  X as XIcon,
  ArrowRight,
  Scale,
  Loader2,
  PackageOpen,
} from 'lucide-react';
import { supabase, type Property } from '../lib/supabase';
import { useCompare } from '../lib/compare';

export default function ComparePage() {
  const { compareIds, clearCompare, toggleCompare } = useCompare();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProperties() {
      if (compareIds.length === 0) {
        setProperties([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .in('id', compareIds);
      if (!error && data) {
        // Preserve the order from compareIds
        const sorted = compareIds
          .map((id) => (data as Property[]).find((p) => p.id === id))
          .filter(Boolean) as Property[];
        setProperties(sorted);
      }
      setLoading(false);
    }
    fetchProperties();
  }, [compareIds]);

  const formatPricePerSqft = (p: Property) => {
    if (p.price_per_sqft !== null) return `₹${p.price_per_sqft.toLocaleString('en-IN')}/sqft`;
    if (p.price_value && p.area_value) return `₹${Math.round(p.price_value / p.area_value).toLocaleString('en-IN')}/sqft`;
    return '—';
  };

  const formatPrice = (p: Property) => {
    if (p.price_value) {
      if (p.price_value >= 10000000) return `₹${(p.price_value / 10000000).toFixed(2)} Cr`;
      if (p.price_value >= 100000) return `₹${(p.price_value / 100000).toFixed(2)} L`;
      return `₹${p.price_value.toLocaleString('en-IN')}`;
    }
    return p.price;
  };

  // ── Best-value helpers ────────────────────────────────────────
  // Parse a numeric price from price_value, falling back to the price string.
  const parsePriceValue = (p: Property): number | null => {
    if (p.price_value !== null) return p.price_value;
    if (!p.price) return null;
    const match = p.price.match(/[\d,.]+/);
    if (!match) return null;
    const num = parseFloat(match[0].replace(/,/g, ''));
    if (isNaN(num)) return null;
    // Heuristic: if the string contains "Cr", multiply by 1e7; "L" by 1e5.
    if (/cr/i.test(p.price)) return num * 10000000;
    if (/l\b/i.test(p.price)) return num * 100000;
    return num;
  };

  const parseAreaValue = (p: Property): number | null => {
    if (p.area_value !== null) return p.area_value;
    if (!p.area) return null;
    const match = p.area.match(/[\d,.]+/);
    if (!match) return null;
    const num = parseFloat(match[0].replace(/,/g, ''));
    return isNaN(num) ? null : num;
  };

  const parsePricePerSqft = (p: Property): number | null => {
    if (p.price_per_sqft !== null) return p.price_per_sqft;
    const price = parsePriceValue(p);
    const area = parseAreaValue(p);
    if (price !== null && area) return Math.round(price / area);
    return null;
  };

  // Returns the index of the "best" property for a given numeric extractor.
  // `lowerIsBetter` controls whether the minimum or maximum value wins.
  const bestIndex = (
    values: (number | null)[],
    lowerIsBetter: boolean
  ): number | null => {
    const valid = values
      .map((v, i) => ({ v, i }))
      .filter((x): x is { v: number; i: number } => x.v !== null && !isNaN(x.v));
    if (valid.length === 0) return null;
    let best = valid[0];
    for (const item of valid) {
      if (lowerIsBetter ? item.v < best.v : item.v > best.v) best = item;
    }
    // Only highlight when there's a genuine difference between values.
    const allEqual = valid.every((x) => x.v === best.v);
    return allEqual ? null : best.i;
  };

  // EMI formula: P * r * (1+r)^n / ((1+r)^n - 1)
  const calculateEMI = (principal: number): number => {
    const r = 8.5 / 12 / 100;
    const n = 240;
    const factor = Math.pow(1 + r, n);
    return (principal * r * factor) / (factor - 1);
  };

  const formatEMI = (emi: number): string => {
    if (emi >= 100000) return `₹${(emi / 100000).toFixed(2)} L/month`;
    return `₹${emi.toLocaleString('en-IN', { maximumFractionDigits: 0 })}/month`;
  };

  const formatIndianCurrency = (value: number): string => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
    return `₹${value.toLocaleString('en-IN')}`;
  };

  const BestBadge = () => (
    <span className="inline-flex items-center gap-1 ml-2 px-1.5 py-0.5 rounded bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wide">
      <CheckCircle2 size={11} />
      Best
    </span>
  );

  // Precompute best indices for each comparable metric.
  const priceValues = properties.map((p) => parsePriceValue(p));
  const areaValues = properties.map((p) => parseAreaValue(p));
  const bedroomValues = properties.map((p) => p.bedrooms);
  const bathroomValues = properties.map((p) => p.bathrooms);
  const psqftValues = properties.map((p) => parsePricePerSqft(p));
  const emiValues = priceValues.map((v) => (v !== null ? calculateEMI(v) : null));
  const stampValues = priceValues.map((v) => (v !== null ? v * 0.05 : null));

  const bestPriceIdx = bestIndex(priceValues, true);
  const bestAreaIdx = bestIndex(areaValues, false);
  const bestBedIdx = bestIndex(bedroomValues, false);
  const bestBathIdx = bestIndex(bathroomValues, false);
  const bestPsqftIdx = bestIndex(psqftValues, true);
  const bestEmiIdx = bestIndex(emiValues, true);
  const bestStampIdx = bestIndex(stampValues, true);

  // ── Empty State ──────────────────────────────────────────────
  if (!loading && compareIds.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-slate-900 pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <span className="text-gold-400 text-sm font-semibold uppercase tracking-wider">Compare</span>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-2 mb-4">
              Compare Properties
            </h1>
            <p className="text-slate-300 max-w-2xl">
              Side-by-side comparison to help you make the right investment decision.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-6">
              <Scale size={36} className="text-slate-300" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-slate-900 mb-3">
              No Properties to Compare
            </h2>
            <p className="text-slate-600 mb-8 leading-relaxed">
              Browse our projects and add up to 3 properties to compare them side by side.
              Look for the compare button on any property.
            </p>
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-all hover:translate-y-[-2px] shadow-lg"
            >
              Browse Projects
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Loading State ───────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white pt-20">
        <Loader2 size={32} className="text-slate-500 animate-spin" />
      </div>
    );
  }

  // ── Comparison Table ────────────────────────────────────────
  const colCount = properties.length;
  const gridStyle = { gridTemplateColumns: `200px repeat(${colCount}, minmax(260px, 1fr))` };

  // Row definitions
  const rows: {
    label: string;
    icon: typeof MapPin;
    render: (p: Property) => ReactNode;
    // Index of the property that holds the "best" value for this row, if any.
    bestIdx?: number | null;
  }[] = [
    {
      label: 'Price',
      icon: IndianRupee,
      bestIdx: bestPriceIdx,
      render: (p) => (
        <span className="font-serif text-lg font-bold text-slate-900">{formatPrice(p)}</span>
      ),
    },
    {
      label: 'EMI (20yr, 8.5%)',
      icon: IndianRupee,
      bestIdx: bestEmiIdx,
      render: (p) => {
        const price = parsePriceValue(p);
        if (price === null) return '—';
        return (
          <span className="font-serif text-base font-bold text-slate-900">
            {formatEMI(calculateEMI(price))}
          </span>
        );
      },
    },
    {
      label: 'Stamp Duty (5%)',
      icon: FileCheck,
      bestIdx: bestStampIdx,
      render: (p) => {
        const price = parsePriceValue(p);
        if (price === null) return '—';
        return (
          <span className="font-serif text-base font-bold text-slate-900">
            {formatIndianCurrency(price * 0.05)}
          </span>
        );
      },
    },
    {
      label: 'Type',
      icon: Building2,
      render: (p) => <span className="capitalize text-slate-800">{p.type}</span>,
    },
    {
      label: 'Location',
      icon: MapPin,
      render: (p) => <span className="text-slate-800">{p.location}</span>,
    },
    {
      label: 'Bedrooms',
      icon: Bed,
      bestIdx: bestBedIdx,
      render: (p) => (p.bedrooms !== null ? `${p.bedrooms} BHK` : '—'),
    },
    {
      label: 'Bathrooms',
      icon: Bath,
      bestIdx: bestBathIdx,
      render: (p) => (p.bathrooms !== null ? p.bathrooms : '—'),
    },
    {
      label: 'Area',
      icon: Maximize,
      bestIdx: bestAreaIdx,
      render: (p) => p.area || '—',
    },
    {
      label: 'Price / Sqft',
      icon: IndianRupee,
      bestIdx: bestPsqftIdx,
      render: (p) => formatPricePerSqft(p),
    },
    {
      label: 'Builder',
      icon: Building2,
      render: (p) => p.builder || '—',
    },
    {
      label: 'RERA Number',
      icon: FileCheck,
      render: (p) =>
        p.rera_number ? (
          <span className="text-sm font-mono text-slate-800">{p.rera_number}</span>
        ) : (
          '—'
        ),
    },
    {
      label: 'Facing',
      icon: Compass,
      render: (p) => p.facing || '—',
    },
    {
      label: 'Age',
      icon: Calendar,
      render: (p) => p.age || '—',
    },
    {
      label: 'Furnishing',
      icon: Sofa,
      render: (p) => (p.furnishing ? <span className="capitalize">{p.furnishing}</span> : '—'),
    },
    {
      label: 'Vastu Compliant',
      icon: Sparkles,
      render: (p) =>
        p.vastu_compliant ? (
          <CheckCircle2 size={20} className="text-green-600" />
        ) : (
          <XIcon size={18} className="text-slate-300" />
        ),
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-slate-900 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-gold-400 text-sm font-semibold uppercase tracking-wider">Compare</span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-2 mb-4">
            Compare Properties
          </h1>
          <p className="text-slate-300 max-w-2xl">
            Side-by-side comparison of {properties.length} {properties.length === 1 ? 'property' : 'properties'} to help you make the right investment decision.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 text-slate-600">
            <Scale size={18} className="text-gold-500" />
            <span className="text-sm font-medium">
              {properties.length} of 3 {properties.length === 1 ? 'property' : 'properties'} selected
            </span>
          </div>
          <button
            onClick={clearCompare}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
            Clear All
          </button>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-100 shadow-sm">
          <div className="min-w-fit">
            {/* ── Header Row: Images & Titles ─────────────────── */}
            <div className="grid bg-white sticky top-0 z-10" style={gridStyle}>
              <div className="bg-slate-50 p-4 flex items-center">
                <span className="font-serif text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Property
                </span>
              </div>
              {properties.map((p) => (
                <div key={p.id} className="relative border-l border-slate-100 bg-white">
                  <button
                    onClick={() => toggleCompare(p.id)}
                    className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-red-50 text-slate-500 hover:text-red-500 flex items-center justify-center transition-colors shadow-sm border border-slate-100"
                    title="Remove from comparison"
                  >
                    <X size={16} />
                  </button>
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={p.image_url || 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=600'}
                      alt={p.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-12">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold uppercase mb-1.5 ${
                        p.status === 'available'
                          ? 'bg-green-500 text-white'
                          : p.status === 'sold out'
                          ? 'bg-red-500 text-white'
                          : 'bg-gold-500 text-slate-900'
                      }`}>
                        {p.status}
                      </span>
                      <h3 className="font-serif text-base font-bold text-white leading-tight line-clamp-2">
                        {p.title}
                      </h3>
                    </div>
                  </div>
                  <div className="p-4">
                    <Link
                      to={`/projects/${p.id}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-slate-800 hover:text-gold-600 transition-colors"
                    >
                      View Details <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Data Rows ──────────────────────────────────── */}
            {rows.map((row, idx) => (
              <div key={row.label} className="grid border-t border-slate-100" style={gridStyle}>
                {/* Sticky label column */}
                <div
                  className={`sticky left-0 z-10 p-4 flex items-center gap-2 ${
                    idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'
                  } border-r border-slate-100`}
                >
                  <row.icon size={16} className="text-gold-500 shrink-0" />
                  <span className="text-sm font-semibold text-slate-800">{row.label}</span>
                </div>
                {/* Value columns */}
                {properties.map((p, pIdx) => {
                  const isBest = row.bestIdx === pIdx;
                  return (
                    <div
                      key={p.id}
                      className={`p-4 text-sm border-l border-slate-100 ${
                        idx % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'
                      } ${isBest ? 'bg-green-50' : ''}`}
                    >
                      <span className={isBest ? 'text-green-700 font-semibold' : 'text-slate-700'}>
                        {row.render(p)}
                      </span>
                      {isBest && <BestBadge />}
                    </div>
                  );
                })}
              </div>
            ))}

            {/* ── Features Row ──────────────────────────────── */}
            <div className="grid border-t border-slate-100" style={gridStyle}>
              <div className="sticky left-0 z-10 p-4 bg-slate-50 border-r border-slate-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-gold-500 shrink-0" />
                  <span className="text-sm font-semibold text-slate-800">Features</span>
                </div>
              </div>
              {properties.map((p) => (
                <div
                  key={p.id}
                  className="p-4 border-l border-slate-100 bg-white space-y-2"
                >
                  {p.features && p.features.length > 0 ? (
                    p.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-2">
                        <CheckCircle2 size={14} className="text-gold-500 shrink-0 mt-0.5" />
                        <span className="text-xs text-slate-700">{feature}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-slate-300 text-sm">—</span>
                  )}
                </div>
              ))}
            </div>

            {/* ── Amenities Row ──────────────────────────────── */}
            <div className="grid border-t border-slate-100" style={gridStyle}>
              <div className="sticky left-0 z-10 p-4 bg-slate-50 border-r border-slate-100">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-gold-500 shrink-0" />
                  <span className="text-sm font-semibold text-slate-800">Amenities</span>
                </div>
              </div>
              {properties.map((p) => (
                <div
                  key={p.id}
                  className="p-4 border-l border-slate-100 bg-white space-y-2"
                >
                  {p.nearby_amenities && Object.keys(p.nearby_amenities).length > 0 ? (
                    Object.entries(p.nearby_amenities).map(([key, val]) => (
                      <div key={key} className="flex items-start gap-2">
                        <CheckCircle2 size={14} className="text-gold-500 shrink-0 mt-0.5" />
                        <span className="text-xs text-slate-700 capitalize">
                          {key.replace(/_/g, ' ')}: {String(val)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <span className="text-slate-300 text-sm">—</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Add more CTA */}
        {properties.length < 3 && (
          <div className="mt-8 text-center">
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-50 hover:bg-slate-100 text-slate-800 font-medium rounded-lg transition-colors border border-slate-200"
            >
              <PackageOpen size={18} />
              Add More Properties to Compare
              <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
