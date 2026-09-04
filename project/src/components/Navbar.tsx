import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, Heart, Scale, Calculator, FileText, MapPin, ChevronDown, User, CreditCard, Gavel, Home, TrendingUp, LayoutDashboard, LogOut, Briefcase, Shield } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useAuthUI } from '../lib/authUI';
import { useCompare } from '../lib/compare';

function VirasatLogo() {
  return (
    <img
      src="/496214361_17869480887359862_6326930953806100842_n.jpg"
      alt="Virasat Realty"
      className="w-11 h-11 md:w-12 md:h-12 rounded-xl object-cover shrink-0 shadow-md"
    />
  );
}

const DARK_HERO_PATHS = new Set([
  '/', '/about', '/blog', '/compare', '/contact',
  '/localities', '/tools', '/market-reports',
  '/home-loans', '/rentals', '/legal', '/interior-design',
]);

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const { user, signOut, isAdmin } = useAuth();
  const { openAuth } = useAuthUI();
  const { compareIds } = useCompare();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setToolsOpen(false);
    setServicesOpen(false);
  }, [location]);

  const isActive = (path: string) => location.pathname === path;
  const isActivePrefix = (prefix: string) => location.pathname.startsWith(prefix);

  const hasDarkHero = DARK_HERO_PATHS.has(location.pathname);
  const solid = scrolled || !hasDarkHero;

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/projects', label: 'Projects' },
    { to: '/localities', label: 'Localities' },
    { to: '/blog', label: 'Blog' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  const serviceLinks = [
    { to: '/home-loans', label: 'Home Loans', icon: CreditCard },
    { to: '/rentals', label: 'Rentals & PG', icon: Home },
    { to: '/legal', label: 'Legal Services', icon: Gavel },
    { to: '/market-reports', label: 'Market Reports', icon: TrendingUp },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        solid
          ? 'bg-white/97 backdrop-blur-md shadow-sm border-b border-slate-100'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 md:h-20">
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <VirasatLogo />
            <div className="flex flex-col leading-tight">
              <span className={`font-serif text-xl md:text-2xl font-bold tracking-tight transition-colors ${solid ? 'text-slate-900' : 'text-white'}`}>
                Virasat<span className={`font-light ${solid ? 'text-gold-600' : 'text-gold-400'}`}>Realty</span>
              </span>
              <span className={`text-[10px] font-medium uppercase tracking-[0.15em] transition-colors ${solid ? 'text-gold-600' : 'text-gold-400'}`}>
                Your heritage, your homes
              </span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium tracking-wide transition-colors relative group ${
                  isActive(link.to)
                    ? solid ? 'text-slate-900' : 'text-gold-300'
                    : solid ? 'text-slate-600 hover:text-slate-900' : 'text-white/80 hover:text-white'
                }`}
              >
                {link.label}
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 transition-all duration-300 ${
                    isActive(link.to) ? 'w-full' : 'w-0 group-hover:w-full'
                  } ${solid ? 'bg-gold-500' : 'bg-gold-400'}`}
                />
              </Link>
            ))}

            {/* Services Dropdown */}
            <div className="relative">
              <button
                onClick={() => setServicesOpen(!servicesOpen)}
                onBlur={() => setTimeout(() => setServicesOpen(false), 150)}
                className={`flex items-center gap-1 text-sm font-medium tracking-wide transition-colors ${
                  isActivePrefix('/home-loans') || isActivePrefix('/rentals') || isActivePrefix('/legal') ? (solid ? 'text-slate-900' : 'text-gold-300') : (solid ? 'text-slate-600 hover:text-slate-900' : 'text-white/80 hover:text-white')
                }`}
              >
                Services
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${servicesOpen ? 'rotate-180' : ''}`} />
              </button>
              {servicesOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50">
                  {serviceLinks.map((service) => (
                    <Link
                      key={service.to}
                      to={service.to}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <service.icon className="w-4 h-4 text-gold-500" /> {service.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Tools dropdown */}
            <div className="relative">
              <button
                onClick={() => setToolsOpen(!toolsOpen)}
                onBlur={() => setTimeout(() => setToolsOpen(false), 150)}
                className={`flex items-center gap-1 text-sm font-medium tracking-wide transition-colors ${
                  isActivePrefix('/tools') || isActive('/compare') ? (solid ? 'text-slate-900' : 'text-gold-300') : (solid ? 'text-slate-600 hover:text-slate-900' : 'text-white/80 hover:text-white')
                }`}
              >
                Tools
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${toolsOpen ? 'rotate-180' : ''}`} />
              </button>
              {toolsOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50">
                  <Link to="/tools" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                    <Calculator className="w-4 h-4 text-gold-500" /> EMI & ROI Calculators
                  </Link>
                  <Link to="/compare" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                    <Scale className="w-4 h-4 text-gold-500" /> Compare Properties
                    {compareIds.length > 0 && (
                      <span className="ml-auto bg-slate-800 text-white text-xs px-1.5 py-0.5 rounded-full">{compareIds.length}</span>
                    )}
                  </Link>
                  <Link to="/blog" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                    <FileText className="w-4 h-4 text-gold-500" /> Buying Guides
                  </Link>
                  <Link to="/localities" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                    <MapPin className="w-4 h-4 text-gold-500" /> Locality Guides
                  </Link>
                </div>
              )}
            </div>

            <Link
              to="/favorites"
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                isActive('/favorites')
                  ? solid ? 'text-slate-900' : 'text-gold-300'
                  : solid ? 'text-slate-600 hover:text-slate-900' : 'text-white/80 hover:text-white'
              }`}
            >
              <Heart className="w-4 h-4" />
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  onBlur={() => setTimeout(() => setUserMenuOpen(false), 150)}
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                    isActive('/dashboard')
                      ? solid ? 'text-slate-900' : 'text-gold-300'
                      : solid ? 'text-slate-600 hover:text-slate-900' : 'text-white/80 hover:text-white'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {userMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-sm font-medium text-slate-900 truncate">{user.email}</p>
                    </div>
                    <Link to="/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                      <LayoutDashboard className="w-4 h-4 text-slate-500" /> Dashboard
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                        <Shield className="w-4 h-4 text-gold-500" /> Admin Panel
                      </Link>
                    )}
                    <Link to="/broker-dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                      <Briefcase className="w-4 h-4 text-slate-500" /> Broker Portal
                    </Link>
                    <Link to="/favorites" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                      <Heart className="w-4 h-4 text-slate-500" /> Favorites
                    </Link>
                    <button onClick={signOut} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => openAuth('signin')}
                className={`text-sm font-medium transition-colors ${solid ? 'text-slate-600 hover:text-slate-900' : 'text-white/80 hover:text-white'}`}
              >
                Sign In
              </button>
            )}

            <a
              href="tel:+917015714787"
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                solid
                  ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm'
                  : 'bg-white/15 backdrop-blur-sm text-white border border-white/30 hover:bg-white/25'
              }`}
            >
              <Phone size={15} />
              <span className="hidden xl:inline">+91 70157 14787</span>
            </a>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`lg:hidden p-2 rounded-lg transition-colors ${solid ? 'text-slate-800 hover:bg-slate-100' : 'text-white hover:bg-white/10'}`}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="lg:hidden bg-white border-t border-slate-100 shadow-xl max-h-[80vh] overflow-y-auto">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.to)
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-slate-100 my-2" />
            <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Services</div>
            {serviceLinks.map((service) => (
              <Link
                key={service.to}
                to={service.to}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                <service.icon className="w-4 h-4 text-gold-500" /> {service.label}
              </Link>
            ))}
            <div className="border-t border-slate-100 my-2" />
            <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tools</div>
            <Link to="/tools" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg">
              <Calculator className="w-4 h-4 text-gold-500" /> EMI & ROI Calculators
            </Link>
            <Link to="/compare" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg">
              <Scale className="w-4 h-4 text-gold-500" /> Compare Properties
              {compareIds.length > 0 && (
                <span className="ml-auto bg-slate-900 text-white text-xs px-1.5 py-0.5 rounded-full">{compareIds.length}</span>
              )}
            </Link>
            <Link to="/favorites" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg">
              <Heart className="w-4 h-4 text-gold-500" /> Favorites
            </Link>
            {user ? (
              <>
                <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg">
                  <User className="w-4 h-4" /> Dashboard
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg">
                    <Shield className="w-4 h-4 text-gold-500" /> Admin Panel
                  </Link>
                )}
                <Link to="/broker-dashboard" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg">
                  <Briefcase className="w-4 h-4" /> Broker Portal
                </Link>
                <button onClick={signOut} className="block w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg">
                  Sign Out
                </button>
              </>
            ) : (
              <button onClick={() => openAuth('signin')} className="block w-full text-left px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg">
                Sign In
              </button>
            )}
            <div className="border-t border-slate-100 my-2" />
            <a
              href="tel:+917015714787"
              className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-slate-900"
            >
              <Phone size={16} className="text-gold-500" />
              +91 70157 14787
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
