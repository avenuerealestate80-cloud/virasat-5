import { FileText, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TermsPage() {
  return (
    <div className="pt-20 min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-8">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6 text-slate-700" />
          </div>
          <div>
            <h1 className="font-serif text-3xl font-bold text-slate-900">Terms of Service</h1>
            <p className="text-slate-500 text-sm mt-1">Last updated: July 2025</p>
          </div>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="font-serif text-xl font-bold text-slate-900 mb-3">1. Acceptance of Terms</h2>
            <p className="text-slate-600 leading-relaxed">By accessing or using the Virasat Realty website ("Site"), you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, please discontinue use of the Site immediately.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-slate-900 mb-3">2. Nature of Services</h2>
            <p className="text-slate-600 leading-relaxed mb-3">Virasat Realty provides:</p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li>Property listings and search for sale and rental properties in Sohna, Haryana.</li>
              <li>Referral services for home loans through partner banks and NBFCs.</li>
              <li>Legal documentation services via empanelled advocates.</li>
              <li>Interior design consultation and project facilitation.</li>
              <li>Market information, locality guides, and investment tools.</li>
            </ul>
            <p className="text-slate-600 mt-3 leading-relaxed">All information on the Site is for general informational purposes only. Property prices, availability, and details are subject to change without notice.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-slate-900 mb-3">3. RERA Compliance</h2>
            <p className="text-slate-600 leading-relaxed">Properties listed on this Site may carry RERA registration numbers issued by the Haryana Real Estate Regulatory Authority (H-RERA). Buyers are advised to independently verify RERA status at <a href="https://hrera.in" target="_blank" rel="noopener noreferrer" className="text-gold-600 underline">hrera.in</a> before making any financial commitment.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-slate-900 mb-3">4. User Accounts</h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li>You must be at least 18 years old to create an account.</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li>You must provide accurate information during registration.</li>
              <li>We reserve the right to suspend or terminate accounts that violate these terms.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-slate-900 mb-3">5. Prohibited Conduct</h2>
            <p className="text-slate-600 mb-3">You agree not to:</p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li>Post false, misleading, or fraudulent property information.</li>
              <li>Attempt to reverse-engineer, scrape, or copy our database or listings.</li>
              <li>Use the Site for any unlawful purpose.</li>
              <li>Impersonate any person or organisation.</li>
              <li>Transmit any spam, unsolicited communications, or malicious code.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-slate-900 mb-3">6. Disclaimers & Limitation of Liability</h2>
            <p className="text-slate-600 leading-relaxed">Virasat Realty is a facilitator and is not a party to any property transaction. We make no warranties about the accuracy, completeness, or fitness for purpose of any listings or information. To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Site or any transaction entered into on the basis of information found on the Site.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-slate-900 mb-3">7. Intellectual Property</h2>
            <p className="text-slate-600 leading-relaxed">All content on this Site — including text, images, logos, data, and software — is owned by or licensed to Virasat Realty. You may not reproduce, distribute, or create derivative works without express written permission.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-slate-900 mb-3">8. Governing Law</h2>
            <p className="text-slate-600 leading-relaxed">These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Gurugram, Haryana.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-slate-900 mb-3">9. Changes to Terms</h2>
            <p className="text-slate-600 leading-relaxed">We reserve the right to modify these Terms at any time. Changes will be posted on this page with an updated date. Continued use of the Site constitutes acceptance of the revised Terms.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-slate-900 mb-3">10. Contact</h2>
            <div className="p-4 bg-slate-50 rounded-xl text-slate-700 text-sm space-y-1">
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
