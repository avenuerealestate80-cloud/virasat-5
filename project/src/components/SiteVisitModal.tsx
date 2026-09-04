import { useState } from 'react';
import { X, Calendar, Clock, CheckCircle2, Phone, Mail, MessageSquare, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';

const TIME_SLOTS = [
  '10:00 AM', '11:00 AM', '12:00 PM',
  '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM',
];

function getNextDays(n: number): { label: string; value: string }[] {
  const days = [];
  for (let i = 1; i <= n; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const value = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
    days.push({ label, value });
  }
  return days;
}

interface Props {
  propertyId?: string;
  propertyTitle?: string;
  onClose: () => void;
}

export default function SiteVisitModal({ propertyId, propertyTitle, onClose }: Props) {
  const { user } = useAuth();
  const days = getNextDays(10).filter(d => {
    const dow = new Date(d.value).getDay();
    return dow !== 0; // exclude Sundays
  });

  const [form, setForm] = useState({
    name: '', phone: '', email: '', message: '',
    visit_date: days[0]?.value ?? '',
    visit_time: TIME_SLOTS[0],
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    const { error: visitError } = await supabase.from('site_visit_bookings').insert({
      property_id: propertyId ?? null,
      property_title: propertyTitle ?? null,
      name: form.name,
      phone: form.phone,
      email: form.email || null,
      visit_date: form.visit_date,
      visit_time: form.visit_time,
      message: form.message || null,
      status: 'pending',
    });
    if (visitError) {
      setSubmitError('Failed to book visit. Please try again.');
      setSubmitting(false);
      return;
    }
    // Also create a lead
    await supabase.from('leads').insert({
      property_id: propertyId ?? null,
      user_id: user?.id || null,
      name: form.name,
      phone: form.phone,
      email: form.email || null,
      lead_type: 'site_visit',
      preferred_date: form.visit_date,
      preferred_time: form.visit_time,
      message: form.message || null,
      status: 'new',
    });
    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div>
            <h3 className="font-serif text-xl font-bold text-slate-900">Schedule a Site Visit</h3>
            {propertyTitle && <p className="text-slate-500 text-sm mt-0.5 truncate max-w-xs">{propertyTitle}</p>}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
            <X size={20} />
          </button>
        </div>

        {submitted ? (
          <div className="p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-emerald-600" />
            </div>
            <h4 className="font-serif text-2xl font-bold text-slate-900 mb-2">Visit Scheduled!</h4>
            <p className="text-slate-500 mb-1">
              <strong>{form.visit_date && new Date(form.visit_date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</strong> at <strong>{form.visit_time}</strong>
            </p>
            <p className="text-slate-500 mb-6">Our agent will confirm via WhatsApp shortly.</p>
            <a
              href={`https://wa.me/917015714787?text=Hi, I booked a site visit for ${propertyTitle ?? 'a property'} on ${form.visit_date} at ${form.visit_time}. My name is ${form.name}.`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors mr-3"
            >
              Confirm on WhatsApp
            </a>
            <button onClick={onClose} className="px-6 py-3 border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors">
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Date picker */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Calendar size={14} className="inline mr-1.5 text-gold-500" />
                Select Date *
              </label>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {days.map(d => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, visit_date: d.value }))}
                    className={`shrink-0 px-3 py-2 rounded-xl border text-sm font-medium transition-colors ${
                      form.visit_date === d.value
                        ? 'bg-slate-900 border-slate-900 text-white'
                        : 'border-slate-200 text-slate-600 hover:border-slate-400'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Time slots */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Clock size={14} className="inline mr-1.5 text-gold-500" />
                Select Time *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {TIME_SLOTS.map(slot => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, visit_time: slot }))}
                    className={`py-2 rounded-xl border text-sm font-medium transition-colors ${
                      form.visit_time === slot
                        ? 'bg-slate-900 border-slate-900 text-white'
                        : 'border-slate-200 text-slate-600 hover:border-slate-400'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  <Phone size={13} className="inline mr-1 text-gold-500" /> Full Name *
                </label>
                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none text-sm"
                  placeholder="Your name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  <Phone size={13} className="inline mr-1 text-gold-500" /> Phone *
                </label>
                <input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none text-sm"
                  placeholder="+91 XXXXX XXXXX" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                <Mail size={13} className="inline mr-1 text-gold-500" /> Email
              </label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none text-sm"
                placeholder="your@email.com (optional)" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                <MessageSquare size={13} className="inline mr-1 text-gold-500" /> Message
              </label>
              <textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})} rows={2}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none resize-none text-sm"
                placeholder="Any specific requirements?" />
            </div>

            <button type="submit" disabled={submitting || !form.visit_date || !form.visit_time}
              className="w-full py-3.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {submitting ? <><Loader2 size={16} className="animate-spin" /> Booking...</> : 'Confirm Site Visit'}
            </button>
            {submitError && (
              <p className="text-sm text-red-600 text-center">{submitError}</p>
            )}
            <p className="text-xs text-slate-400 text-center">Mon–Sat, 10 AM–6 PM. Our agent will reach out within 2 hours to confirm.</p>
          </form>
        )}
      </div>
    </div>
  );
}
