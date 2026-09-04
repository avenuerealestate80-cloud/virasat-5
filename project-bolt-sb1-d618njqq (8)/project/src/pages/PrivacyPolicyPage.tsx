import { Shield, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicyPage() {
  return (
    <div className="pt-20 min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-8">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6 text-slate-700" />
          </div>
          <div>
            <h1 className="font-serif text-3xl font-bold text-slate-900">Privacy Policy</h1>
            <p className="text-slate-500 text-sm mt-1">Last updated: July 2025</p>
          </div>
        </div>

        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <h2 className="font-serif text-xl font-bold text-slate-900 mb-3">1. Who We Are</h2>
            <p className="text-slate-600 leading-relaxed">Virasat Realty ("we", "us", "our") is a real estate agency based in Sector 33, Sohna, Haryana — 122103. We operate the website virasat-realty.in and facilitate property sales, rentals, home loans, interior design, and legal services in the Sohna region.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-slate-900 mb-3">2. Information We Collect</h2>
            <p className="text-slate-600 leading-relaxed mb-3">We collect the following categories of personal data:</p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li><strong>Identity & Contact:</strong> Full name, phone number, email address when you fill a form, register an account, or contact us.</li>
              <li><strong>Financial:</strong> Monthly income, loan amount preferences collected only when you apply for a home loan.</li>
              <li><strong>Usage Data:</strong> Pages visited, search queries, property views — collected via browser cookies and analytics tools.</li>
              <li><strong>Device Data:</strong> IP address, browser type, and operating system.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-slate-900 mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li>To contact you about property enquiries, site visit bookings, and lead follow-ups.</li>
              <li>To process home loan applications and refer you to appropriate banking partners.</li>
              <li>To send newsletters and property alerts if you have subscribed (you may unsubscribe at any time).</li>
              <li>To improve our website and personalise content for you.</li>
              <li>To comply with legal obligations under Indian law.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-slate-900 mb-3">4. How We Share Your Information</h2>
            <p className="text-slate-600 leading-relaxed">We do not sell your personal data. We may share it with:</p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 mt-3">
              <li><strong>Bank Partners:</strong> Only when you explicitly apply for a home loan via our platform.</li>
              <li><strong>Service Providers:</strong> Supabase (database hosting), analytics providers — all bound by data processing agreements.</li>
              <li><strong>Legal Authorities:</strong> When required by law, court order, or government authority.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-slate-900 mb-3">5. Cookies</h2>
            <p className="text-slate-600 leading-relaxed">We use essential cookies to operate the website and analytical cookies to understand usage. You can disable cookies via your browser settings, but this may affect site functionality.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-slate-900 mb-3">6. Data Retention</h2>
            <p className="text-slate-600 leading-relaxed">We retain your data for as long as necessary to fulfil the purposes described above. Lead data is retained for up to 2 years; account data is retained until account deletion; newsletter subscriptions until unsubscribe.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-slate-900 mb-3">7. Your Rights</h2>
            <p className="text-slate-600 leading-relaxed mb-3">Under the Digital Personal Data Protection Act 2023 (India) and applicable regulations, you have the right to:</p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li>Access your personal data we hold.</li>
              <li>Correct inaccurate or incomplete data.</li>
              <li>Request deletion of your data (right to erasure).</li>
              <li>Withdraw consent at any time for marketing communications.</li>
            </ul>
            <p className="text-slate-600 mt-3">To exercise these rights, email us at <a href="mailto:avenuerealestate80@gmail.com" className="text-gold-600 underline">avenuerealestate80@gmail.com</a>.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-slate-900 mb-3">8. Security</h2>
            <p className="text-slate-600 leading-relaxed">We implement industry-standard security measures including SSL encryption, row-level database security, and access controls. However, no transmission over the internet is 100% secure.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-slate-900 mb-3">9. Contact Us</h2>
            <p className="text-slate-600 leading-relaxed">If you have any questions about this Privacy Policy, please contact:</p>
            <div className="mt-3 p-4 bg-slate-50 rounded-xl text-slate-700 text-sm space-y-1">
              <p><strong>Virasat Realty</strong></p>
              <p>Sector 33, Sohna, Haryana 122103</p>
              <p>Phone: <a href="tel:+917015714787" className="text-gold-600">+91 70157 14787</a></p>
              <p>Email: <a href="mailto:avenuerealestate80@gmail.com" className="text-gold-600">avenuerealestate80@gmail.com</a></p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
