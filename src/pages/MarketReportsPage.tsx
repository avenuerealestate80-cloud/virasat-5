import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, Download, Bell, X, Loader2, BarChart2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { MarketReport } from '../lib/supabase';

export default function MarketReportsPage() {
  const [reports, setReports] = useState<MarketReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocality, setSelectedLocality] = useState('All Localities');
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertForm, setAlertForm] = useState({ name: '', phone: '', email: '', preferred_type: '', budget_range: '' });
  const [alertSubmitting, setAlertSubmitting] = useState(false);
  const [alertSubmitted, setAlertSubmitted] = useState(false);
  const [alertError, setAlertError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('market_reports')
        .select('*')
        .eq('published', true)
        .order('year', { ascending: false })
        .order('quarter', { ascending: false });
      if (data) setReports(data as MarketReport[]);
      setLoading(false);
    }
    load();
  }, []);

  const localities = ['All Localities', ...Array.from(new Set(reports.map(r => r.locality)))];
  const filtered = selectedLocality === 'All Localities' ? reports : reports.filter(r => r.locality === selectedLocality);

  // Get latest report per locality for summary cards
  const latestByLocality: Record<string, MarketReport> = {};
  reports.forEach(r => {
    const key = r.locality;
    if (!latestByLocality[key] || r.year > latestByLocality[key].year ||
      (r.year === latestByLocality[key].year && r.quarter > latestByLocality[key].quarter)) {
      latestByLocality[key] = r;
    }
  });

  const handleAlertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlertSubmitting(true);
    setAlertError(null);
    const { error } = await supabase.from('launch_alerts').insert({
      name: alertForm.name, phone: alertForm.phone,
      email: alertForm.email || null,
      preferred_type: alertForm.preferred_type || null,
      budget_range: alertForm.budget_range || null,
    });
    setAlertSubmitting(false);
    if (error) {
      setAlertError('Failed to subscribe. Please try again.');
    } else {
      setAlertSubmitted(true);
    }
  };

  function TrendIcon({ pct }: { pct: number | null }) {
    if (pct == null) return <Minus size={16} className="text-slate-400" />;
    if (pct > 0) return <TrendingUp size={16} className="text-emerald-500" />;
    if (pct < 0) return <TrendingDown size={16} className="text-red-500" />;
    return <Minus size={16} className="text-slate-400" />;
  }

  return (
    <div className="pt-20 min-h-screen bg-slate-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-gold-400 text-sm font-medium mb-3">
                <BarChart2 size={16} />
                <span>Real Estate Analytics</span>
              </div>
              <h1 className="font-serif text-4xl font-bold mb-3">Market Reports</h1>
              <p className="text-slate-300 text-lg max-w-xl">Quarterly price trends, transaction volumes, and market insights for Sohna, Gurugram, and nearby micro-markets.</p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <button onClick={() => setShowAlertModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gold-500 hover:bg-gold-400 text-slate-900 font-semibold rounded-xl transition-colors">
                <Bell size={16} />
                Get Launch Alerts
              </button>
              <button className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors">
                <Download size={16} />
                Download
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Summary Cards */}
      {!loading && Object.keys(latestByLocality).length > 0 && (
        <section className="max-w-6xl mx-auto px-4 -mt-8 mb-10">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.values(latestByLocality).map(r => (
              <div key={r.locality} className="bg-white rounded-2xl shadow-md p-5">
                <p className="text-xs text-slate-500 mb-1 font-medium uppercase tracking-wide">{r.locality}</p>
                <p className="text-xl font-bold text-slate-900 mb-1">
                  {r.avg_price_sqft ? `₹${r.avg_price_sqft.toLocaleString('en-IN')}/sqft` : '—'}
                </p>
                <div className="flex items-center gap-1.5">
                  <TrendIcon pct={r.price_change_pct} />
                  <span className={`text-sm font-medium ${r.price_change_pct == null ? 'text-slate-400' : r.price_change_pct > 0 ? 'text-emerald-600' : r.price_change_pct < 0 ? 'text-red-600' : 'text-slate-500'}`}>
                    {r.price_change_pct != null ? `${r.price_change_pct > 0 ? '+' : ''}${r.price_change_pct}% YoY` : 'No change data'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Reports Table */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {localities.map(loc => (
            <button key={loc} onClick={() => setSelectedLocality(loc)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${selectedLocality === loc ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}>
              {loc}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={32} className="animate-spin text-slate-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400">No reports available.</div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-5 py-3.5 font-semibold text-slate-700">Quarter</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-slate-700">Locality</th>
                    <th className="text-right px-5 py-3.5 font-semibold text-slate-700">Avg Price/sqft</th>
                    <th className="text-right px-5 py-3.5 font-semibold text-slate-700">Change</th>
                    <th className="text-right px-5 py-3.5 font-semibold text-slate-700">Transactions</th>
                    <th className="text-right px-5 py-3.5 font-semibold text-slate-700">New Launches</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-slate-700">Top Builder</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => (
                    <tr key={r.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="px-5 py-3.5 text-slate-900 font-medium">{r.quarter} {r.year}</td>
                      <td className="px-5 py-3.5 text-slate-700">{r.locality}</td>
                      <td className="px-5 py-3.5 text-right text-slate-900 font-medium">
                        {r.avg_price_sqft ? `₹${r.avg_price_sqft.toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className={`inline-flex items-center gap-1 font-medium ${r.price_change_pct == null ? 'text-slate-400' : r.price_change_pct > 0 ? 'text-emerald-600' : r.price_change_pct < 0 ? 'text-red-600' : 'text-slate-500'}`}>
                          <TrendIcon pct={r.price_change_pct} />
                          {r.price_change_pct != null ? `${r.price_change_pct > 0 ? '+' : ''}${r.price_change_pct}%` : '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right text-slate-700">{r.total_transactions ?? '—'}</td>
                      <td className="px-5 py-3.5 text-right text-slate-700">{r.new_launches ?? '—'}</td>
                      <td className="px-5 py-3.5 text-slate-700">{r.top_builder ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Alert Modal */}
      {showAlertModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="font-serif text-xl font-bold text-slate-900">Get Launch Alerts</h3>
              <button onClick={() => { setShowAlertModal(false); setAlertSubmitted(false); setAlertError(null); }} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={18} className="text-slate-500" />
              </button>
            </div>
            <div className="p-6">
              {alertSubmitted ? (
                <div className="text-center py-8">
                  <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell size={24} className="text-emerald-500" />
                  </div>
                  <h4 className="font-semibold text-slate-900 text-lg mb-2">You're on the list!</h4>
                  <p className="text-slate-500 text-sm">We'll notify you about new project launches before they go public.</p>
                </div>
              ) : (
                <form onSubmit={handleAlertSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Name *</label>
                    <input required value={alertForm.name} onChange={e => setAlertForm(f => ({...f, name: e.target.value}))}
                      placeholder="Your full name"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-gold-300 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone *</label>
                    <input required value={alertForm.phone} onChange={e => setAlertForm(f => ({...f, phone: e.target.value}))}
                      placeholder="+91 98765 43210"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-gold-300 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                    <input type="email" value={alertForm.email} onChange={e => setAlertForm(f => ({...f, email: e.target.value}))}
                      placeholder="your@email.com"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-gold-300 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Preferred Type</label>
                    <select value={alertForm.preferred_type} onChange={e => setAlertForm(f => ({...f, preferred_type: e.target.value}))}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-gold-300 outline-none bg-white">
                      <option value="">Any type</option>
                      <option value="residential">Residential</option>
                      <option value="commercial">Commercial</option>
                      <option value="plot">Plot / Land</option>
                      <option value="villa">Villa</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Budget Range</label>
                    <select value={alertForm.budget_range} onChange={e => setAlertForm(f => ({...f, budget_range: e.target.value}))}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-gold-300 outline-none bg-white">
                      <option value="">Any budget</option>
                      <option value="under-50L">Under ₹50 Lakh</option>
                      <option value="50L-1Cr">₹50L – ₹1 Crore</option>
                      <option value="1Cr-3Cr">₹1 Cr – ₹3 Crore</option>
                      <option value="3Cr+">₹3 Crore+</option>
                    </select>
                  </div>
                  <button type="submit" disabled={alertSubmitting}
                    className="w-full py-3 bg-gold-500 hover:bg-gold-400 text-slate-900 font-semibold rounded-xl transition-colors disabled:opacity-50">
                    {alertSubmitting ? 'Subscribing...' : 'Subscribe to Alerts'}
                  </button>
                  {alertError && (
                    <p className="text-sm text-red-600 text-center">{alertError}</p>
                  )}
                  <p className="text-xs text-slate-400 text-center">No spam. Unsubscribe anytime. We only notify for genuine new launches.</p>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
