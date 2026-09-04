import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';

export default function ContactPage() {
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interest: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const { error } = await supabase.from('leads').insert({
      user_id: user?.id || null,
      name: formData.name,
      email: formData.email || null,
      phone: formData.phone,
      lead_type: formData.interest || 'enquiry',
      message: `${formData.interest ? `Interest: ${formData.interest}\n` : ''}${formData.message || ''}`.trim() || null,
    });

    if (error) {
      setError('Something went wrong. Please call us at +91 70157 14787.');
      setSubmitting(false);
      return;
    }

    setSubmitted(true);
    setSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-slate-900 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-gold-400 text-sm font-semibold uppercase tracking-wider">Get in Touch</span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-2 mb-4">
            Contact Us
          </h1>
          <p className="text-slate-300 max-w-2xl">
            Have questions about our projects? Want to schedule a site visit? We are here to help you every step of the way.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Info */}
          <div>
            <span className="text-gold-600 text-sm font-semibold uppercase tracking-wider">Reach Out</span>
            <h2 className="font-serif text-3xl font-bold text-slate-900 mt-3 mb-6">
              We Would Love to Hear From You
            </h2>
            <p className="text-slate-600 leading-relaxed mb-10">
              Whether you are looking for your first home, an investment property, or commercial space, our team is ready to guide you. Drop us a message or visit our office.
            </p>

            <div className="space-y-6">
              {[
                { icon: MapPin, title: 'Office Address', content: 'Sector 33, Sohna, Haryana 122103' },
                { icon: Phone, title: 'Phone', content: '+91 70157 14787', href: 'tel:+917015714787' },
                { icon: Mail, title: 'Email', content: 'virasatrealty@gmail.com', href: 'mailto:virasatrealty@gmail.com' },
                { icon: Clock, title: 'Working Hours', content: 'Monday - Saturday: 9:00 AM - 7:00 PM' },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                    <item.icon size={20} className="text-gold-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">{item.title}</h4>
                    {item.href ? (
                      <a href={item.href} className="text-slate-600 hover:text-gold-600 transition-colors">
                        {item.content}
                      </a>
                    ) : (
                      <p className="text-slate-600">{item.content}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 rounded-2xl overflow-hidden h-64 bg-slate-100">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3509.2!2d77.0574!3d28.2472!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d6e8d8e8d8e8d%3A0x0!2sSector%2033%2C%20Sohna%2C%20Haryana%20122103!5e0!3m2!1sen!2sin!4v1"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Office Location"
              />
            </div>
          </div>

          {/* Contact Form */}
          <div>
            {submitted ? (
              <div className="bg-slate-50 rounded-2xl p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={32} className="text-green-600" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-slate-900 mb-3">Thank You!</h3>
                <p className="text-slate-600 mb-6">
                  Your message has been received. Our team will get back to you within 24 hours.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', phone: '', interest: '', message: '' }); }}
                  className="px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
                <h3 className="font-serif text-xl font-bold text-slate-900 mb-6">Send Us a Message</h3>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-800 mb-1.5">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-800 mb-1.5">Email *</label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-800 mb-1.5">Phone *</label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
                        placeholder="+91 70157 14787"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-800 mb-1.5">Interested In</label>
                    <select
                      name="interest"
                      value={formData.interest}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
                    >
                      <option value="">Select property type</option>
                      <option value="residential">Residential Apartment</option>
                      <option value="commercial">Commercial Space</option>
                      <option value="plot">Plot / Land</option>
                      <option value="villa">Luxury Villa</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-800 mb-1.5">Message</label>
                    <textarea
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent resize-none"
                      placeholder="Tell us about your requirements..."
                    />
                  </div>
                  {error && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>
                  )}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-all hover:translate-y-[-2px] shadow-lg disabled:opacity-50"
                  >
                    {submitting ? 'Sending...' : (<><Send size={18} /> Send Message</>)}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
