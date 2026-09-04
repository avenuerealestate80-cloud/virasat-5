import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/496214361_17869480887359862_6326930953806100842_n.jpg"
                alt="Virasat Realty"
                className="w-12 h-12 rounded-xl object-cover shrink-0"
              />
              <div className="flex flex-col leading-tight">
                <span className="font-serif text-xl font-bold text-white">
                  Virasat<span className="font-light text-gold-400">Realty</span>
                </span>
                <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-gold-500">
                  Your heritage, your homes
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-5">
              Building trust, delivering dreams. Your trusted real estate partner in Sohna, Haryana with 15+ years of heritage.
            </p>
            <div className="flex gap-3">
              {[
                { Icon: Facebook, href: 'https://www.facebook.com/virasatrealty' },
                { Icon: Instagram, href: 'https://www.instagram.com/virasatrealty' },
                { Icon: Linkedin, href: 'https://www.linkedin.com/company/virasat-realty' },
                { Icon: Twitter, href: 'https://twitter.com/virasatrealty' },
              ].map(({ Icon, href }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-gold-600 transition-colors flex items-center justify-center"
                >
                  <Icon className="w-4 h-4 text-gold-300" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-serif text-lg text-white mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              {[
                { to: '/', label: 'Home' },
                { to: '/projects', label: 'Our Projects' },
                { to: '/localities', label: 'Locality Guides' },
                { to: '/blog', label: 'Blog & Guides' },
                { to: '/about', label: 'About Us' },
                { to: '/contact', label: 'Contact' },
                { to: '/broker-dashboard', label: 'For Brokers' },
                { to: '/admin', label: 'Admin' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-slate-400 hover:text-gold-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-lg text-white mb-4">Tools & Resources</h3>
            <ul className="space-y-2.5">
              {[
                { to: '/tools', label: 'EMI Calculator' },
                { to: '/tools', label: 'ROI Calculator' },
                { to: '/tools', label: 'Land Area Converter' },
                { to: '/market-reports', label: 'Market Reports' },
                { to: '/compare', label: 'Compare Properties' },
                { to: '/favorites', label: 'My Favorites' },
              ].map((link, i) => (
                <li key={i}>
                  <Link to={link.to} className="text-sm text-slate-400 hover:text-gold-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-lg text-white mb-4">Get in Touch</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-400">Sector 33, Sohna Road, Sohna, Haryana 122103</span>
              </li>
              <li>
                <a href="tel:+917015714787" className="flex items-center gap-3 text-sm text-slate-400 hover:text-gold-400 transition-colors">
                  <Phone className="w-5 h-5 text-gold-400 shrink-0" />
                  +91 70157 14787
                </a>
              </li>
              <li>
                <a href="mailto:virasatrealty@gmail.com" className="flex items-center gap-3 text-sm text-slate-400 hover:text-gold-400 transition-colors">
                  <Mail className="w-5 h-5 text-gold-400 shrink-0" />
                  virasatrealty@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-400">Mon - Sat: 9:00 AM - 7:00 PM</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">© {new Date().getFullYear()} Virasat Realty. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link to="/privacy" className="text-xs text-slate-500 hover:text-gold-400 transition-colors">Privacy Policy</Link>
              <span className="text-slate-700">·</span>
              <Link to="/terms" className="text-xs text-slate-500 hover:text-gold-400 transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
