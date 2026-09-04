import { useState, useEffect } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  FileCheck,
  FileText,
  Gavel,
  Loader2,
  Phone,
  Scale,
  Shield,
  Zap,
  X,
} from 'lucide-react';
import { supabase, type LegalService } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { useAuthUI } from '../lib/authUI';


export default function LegalServicesPage() {
  const { user } = useAuth();
  const { openAuth } = useAuthUI();

  const [services, setServices] = useState<LegalService[]>([]);
  const [loading, setLoading] = useState(true);

  // Booking Modal
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedService, setSelectedService] = useState<LegalService | null>(null);
  const [propertyAddress, setPropertyAddress] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [parties, setParties] = useState<{ name: string; type: string; address: string }[]>([
    { name: '', type: 'individual', address: '' },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  useEffect(() => {
    async function fetchServices() {
      const { data } = await supabase
        .from('legal_services')
        .select('*')
        .eq('active', true)
        .order('featured', { ascending: false });
      if (data) setServices(data as LegalService[]);
      setLoading(false);
    }
    fetchServices();
  }, []);

  function openBooking(service: LegalService) {
    setSelectedService(service);
    setShowBookingModal(true);
  }

  function addParty() {
    setParties([...parties, { name: '', type: 'individual', address: '' }]);
  }

  function removeParty(index: number) {
    setParties(parties.filter((_, i) => i !== index));
  }

  function updateParty(index: number, field: string, value: string) {
    const updated = [...parties];
    updated[index] = { ...updated[index], [field]: value };
    setParties(updated);
  }

  async function handleSubmitRequest() {
    if (!user) {
      openAuth('signin');
      return;
    }
    if (!selectedService || !contactName || !contactPhone) {
      setSubmitError('Please fill all required fields.');
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const { error } = await supabase.from('legal_requests').insert({
        user_id: user.id,
        service_id: selectedService.id,
        property_address: propertyAddress || null,
        parties_involved: parties.filter(p => p.name.trim()),
        additional_details: additionalDetails || null,
        contact_name: contactName,
        contact_phone: contactPhone,
        contact_email: contactEmail || null,
      });
      if (error) throw error;
      setRequestSubmitted(true);
    } catch (err: any) {
      setSubmitError('Failed to submit: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setPropertyAddress('');
    setAdditionalDetails('');
    setContactName('');
    setContactPhone('');
    setContactEmail('');
    setParties([{ name: '', type: 'individual', address: '' }]);
  }

  const features = [
    { icon: Shield, title: '100% Legal Compliance', desc: 'All documents drafted as per Indian laws' },
    { icon: Gavel, title: 'Experienced Advocates', desc: 'Network of verified legal professionals' },
    { icon: Clock, title: 'Quick Turnaround', desc: 'Most documents ready within 3-5 days' },
    { icon: Zap, title: 'Digital Signing', desc: 'E-Stamp & E-Sign for convenience' },
  ];

  const whyLegal = [
    'Protect yourself from future disputes',
    'Ensure clear property title',
    'Get proper documentation without errors',
    'Save time with expert handling',
    'Avoid legal complications later',
  ];

  const serviceIconMap: Record<string, typeof FileText> = {
    'rent_agreement': FileText,
    'sale_agreement': Scale,
    'sale_deed': Gavel,
    'power_of_attorney': FileCheck,
    'title_verification': Shield,
    'property_registration': CheckCircle2,
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative pt-24 pb-16 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-900">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gold-500 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500/15 backdrop-blur-sm rounded-full border border-gold-400/30 mb-6">
              <Shield size={18} className="text-gold-400" />
              <span className="text-gold-300 text-sm font-medium">Verified Legal Partners</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Legal Services for <span className="text-gold-400">Property</span>
            </h1>
            <p className="text-slate-200 text-lg max-w-3xl mx-auto mb-10">
              From rent agreements to sale deeds, get all your property documents drafted by
              experienced advocates. 100% compliance, quick turnaround.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
            {features.map((feature) => (
              <div key={feature.title} className="p-5 rounded-xl bg-slate-900/50 border border-slate-800/50">
                <feature.icon className="w-8 h-8 text-gold-400 mb-3" />
                <h3 className="font-semibold text-white text-sm">{feature.title}</h3>
                <p className="text-slate-300 text-xs mt-1">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-gold-600 text-sm font-semibold uppercase tracking-wider">
              Our Services
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mt-3 mb-4">
              Property Legal Documentation
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={32} className="text-slate-500 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => {
                const Icon = serviceIconMap[service.service_type] || FileText;
                return (
                  <div
                    key={service.id}
                    className={`bg-white rounded-2xl border ${
                      service.featured ? 'border-gold-300 shadow-lg shadow-gold-100/50' : 'border-slate-100'
                    } p-6 hover:shadow-xl transition-all hover:-translate-y-1`}
                  >
                    {service.featured && (
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-gold-100 text-gold-700 text-xs font-semibold rounded-full mb-4">
                        <Star size={12} />
                        Popular
                      </div>
                    )}

                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-slate-700" />
                    </div>

                    <h3 className="font-serif text-lg font-bold text-slate-900 mb-2">
                      {service.name}
                    </h3>
                    {service.description && (
                      <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                        {service.description}
                      </p>
                    )}

                    <div className="flex items-end gap-2 mb-5">
                      <span className="font-serif text-2xl font-bold text-slate-900">
                        Rs {service.base_price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-slate-500 text-sm">onwards</span>
                    </div>

                    {/* Includes */}
                    {service.includes && service.includes.length > 0 && (
                      <div className="mb-5">
                        <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                          Includes
                        </div>
                        <ul className="space-y-1.5">
                          {service.includes.map((item) => (
                            <li key={item} className="flex items-center gap-2 text-xs text-slate-700">
                              <CheckCircle2 size={14} className="text-green-500" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Documents Required */}
                    {service.documents_required && service.documents_required.length > 0 && (
                      <div className="mb-5 p-3 bg-slate-50 rounded-lg">
                        <div className="text-xs font-medium text-slate-600 mb-2">
                          Documents Required
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {service.documents_required.map((doc) => (
                            <span key={doc} className="px-2 py-0.5 bg-white text-slate-700 text-xs rounded border border-slate-100">
                              {doc}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Timeline */}
                    {service.timeline_days && (
                      <div className="flex items-center gap-2 text-slate-600 text-sm mb-5">
                        <Clock size={16} className="text-gold-500" />
                        <span>{service.timeline_days} days delivery</span>
                      </div>
                    )}

                    <button
                      onClick={() => openBooking(service)}
                      className="w-full px-6 py-3 bg-slate-900 hover:bg-slate-900 text-white font-semibold rounded-lg transition-colors"
                    >
                      Request Service
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Rent Agreement Generator Highlight */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-gold-600 text-sm font-semibold uppercase tracking-wider">
                Most Popular
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 mt-3 mb-6">
                Online Rent Agreement
              </h2>
              <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                Get your rental agreement drafted and registered online. We handle everything
                from drafting to e-Stamp and digital signing.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  'Professional drafting with all standard clauses',
                  'E-Stamp paper included',
                  'Digital signing (No physical visit needed)',
                  'Fast delivery within 24-48 hours',
                  'Valid across India',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-slate-800">
                    <CheckCircle2 size={18} className="text-green-500" />
                    {item}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    const rentService = services.find(s => s.service_type === 'rent_agreement');
                    if (rentService) openBooking(rentService);
                  }}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 hover:bg-slate-900 text-white font-semibold rounded-lg transition-colors"
                >
                  Draft Rent Agreement
                  <ArrowRight size={18} />
                </button>
                <div className="text-slate-600 text-sm">
                  Starting <span className="font-semibold text-slate-900">Rs 1,499</span>
                </div>
              </div>
            </div>

            {/* Sample Preview */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-slate-900">Sample Rent Agreement</h3>
                <span className="px-3 py-1 bg-slate-50 text-slate-700 text-xs rounded-full">
                  Preview
                </span>
              </div>
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 space-y-4 font-mono text-xs text-slate-700 leading-relaxed">
                <p className="text-center font-bold">RENT AGREEMENT</p>
                <p>This Rent Agreement is made and executed at __________ on this ____ day of _________, 20__.</p>
                <p><strong>BETWEEN</strong></p>
                <p>_________________ (the "Landlord")...</p>
                <p><strong>AND</strong></p>
                <p>_________________ (the "Tenant")...</p>
                <p className="text-slate-500 text-center mt-4">[Preview continues...]</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Legal Section */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-gold-400 text-sm font-semibold uppercase tracking-wider">
                Why It Matters
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mt-3 mb-8">
                Importance of Legal Documentation
              </h2>
              <ul className="space-y-4">
                {whyLegal.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-slate-200">
                    <Gavel size={18} className="text-gold-400 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800/50">
                <div className="font-serif text-3xl font-bold text-gold-400 mb-2">10,000+</div>
                <div className="text-slate-300 text-sm">Documents Delivered</div>
              </div>
              <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800/50">
                <div className="font-serif text-3xl font-bold text-gold-400 mb-2">99.9%</div>
                <div className="text-slate-300 text-sm">Accuracy Rate</div>
              </div>
              <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800/50">
                <div className="font-serif text-3xl font-bold text-gold-400 mb-2">48hrs</div>
                <div className="text-slate-300 text-sm">Avg Delivery Time</div>
              </div>
              <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800/50">
                <div className="font-serif text-3xl font-bold text-gold-400 mb-2">50+</div>
                <div className="text-slate-300 text-sm">Expert Advocates</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 mb-5">
            Need Legal Assistance?
          </h2>
          <p className="text-slate-600 text-lg mb-10">
            Our legal experts are ready to help you with all property documentation needs.
            Get a free consultation today.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="tel:+917015714787"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gold-500 hover:bg-gold-600 text-slate-900 font-semibold rounded-lg transition-colors"
            >
              <Phone size={18} />
              Call Us
            </a>
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      {showBookingModal && selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={() => setShowBookingModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="font-serif text-xl font-bold text-slate-900">
                  {selectedService.name}
                </h2>
                <p className="text-slate-600 text-sm">Request this legal service</p>
              </div>
              <button onClick={() => setShowBookingModal(false)} className="p-2">
                <X size={20} className="text-slate-600" />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-6">
              {/* Property Address */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Property Address
                </label>
                <input
                  type="text"
                  value={propertyAddress}
                  onChange={(e) => setPropertyAddress(e.target.value)}
                  placeholder="Enter property address"
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 bg-white text-slate-900"
                />
              </div>

              {/* Parties Involved */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-semibold text-slate-800">
                    Parties Involved
                  </label>
                  <button
                    onClick={addParty}
                    className="text-xs text-gold-600 font-medium hover:text-gold-700"
                  >
                    + Add Party
                  </button>
                </div>
                <div className="space-y-3">
                  {parties.map((party, index) => (
                    <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-slate-600">Party {index + 1}</span>
                        {parties.length > 1 && (
                          <button onClick={() => removeParty(index)} className="text-xs text-red-500">
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <input
                            type="text"
                            value={party.name}
                            onChange={(e) => updateParty(index, 'name', e.target.value)}
                            placeholder="Name"
                            className="w-full px-3 py-2 rounded border border-slate-200 text-sm"
                          />
                        </div>
                        <div>
                          <select
                            value={party.type}
                            onChange={(e) => updateParty(index, 'type', e.target.value)}
                            className="w-full px-3 py-2 rounded border border-slate-200 text-sm"
                          >
                            <option value="individual">Individual</option>
                            <option value="company">Company</option>
                          </select>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={party.address}
                        onChange={(e) => updateParty(index, 'address', e.target.value)}
                        placeholder="Address"
                        className="w-full px-3 py-2 mt-2 rounded border border-slate-200 text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Details */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Additional Details
                </label>
                <textarea
                  value={additionalDetails}
                  onChange={(e) => setAdditionalDetails(e.target.value)}
                  rows={3}
                  placeholder="Any specific requirements..."
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
                    Email
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

              {/* Price Summary */}
              <div className="p-4 bg-gold-50 rounded-lg border border-gold-200">
                <div className="flex items-center justify-between">
                  <span className="text-slate-800">Service Fee</span>
                  <span className="font-serif text-xl font-bold text-slate-900">
                    Rs {selectedService.base_price.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Submit */}
              {requestSubmitted ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={28} className="text-emerald-500" />
                  </div>
                  <h4 className="font-semibold text-slate-900 text-lg mb-2">Request Submitted!</h4>
                  <p className="text-slate-500 text-sm">Our legal team will contact you within 24 hours.</p>
                  <button onClick={() => { setShowBookingModal(false); setRequestSubmitted(false); resetForm(); }}
                    className="mt-4 px-5 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
                    Close
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={handleSubmitRequest}
                    disabled={submitting}
                    className="w-full px-6 py-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors disabled:opacity-60"
                  >
                    {submitting ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 size={18} className="animate-spin" />
                        Submitting...
                      </span>
                    ) : (
                      'Submit Request'
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

function Star({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}
