import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ComparePage from './pages/ComparePage';
import ToolsPage from './pages/ToolsPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import LocalitiesPage from './pages/LocalitiesPage';
import LocalityDetailPage from './pages/LocalityDetailPage';
import FavoritesPage from './pages/FavoritesPage';
import AdminPage from './pages/AdminPage';
import BrokerDashboardPage from './pages/BrokerDashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import HomeLoansPage from './pages/HomeLoansPage';
import RentalsPage from './pages/RentalsPage';
import RentalDetailPage from './pages/RentalDetailPage';
import LegalServicesPage from './pages/LegalServicesPage';
import InteriorDesignPage from './pages/InteriorDesignPage';
import UserDashboardPage from './pages/UserDashboardPage';
import MarketReportsPage from './pages/MarketReportsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import WhatsAppWidget from './components/WhatsAppWidget';
import Chatbot from './components/Chatbot';
import { AuthUIProvider } from './lib/authUI';
import { useAuth } from './lib/auth';
import { Loader2 } from 'lucide-react';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-slate-400" />
      </div>
    );
  }
  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <AuthUIProvider>
      <ScrollToTop />
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:id" element={<ProjectDetailPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/tools" element={<ToolsPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/localities" element={<LocalitiesPage />} />
            <Route path="/localities/:slug" element={<LocalityDetailPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
            <Route path="/broker-dashboard" element={<ProtectedRoute><BrokerDashboardPage /></ProtectedRoute>} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            {/* Services */}
            <Route path="/home-loans" element={<HomeLoansPage />} />
            <Route path="/rentals" element={<RentalsPage />} />
            <Route path="/rentals/:type/:id" element={<RentalDetailPage />} />
            <Route path="/legal" element={<LegalServicesPage />} />
            <Route path="/interior-design" element={<InteriorDesignPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><UserDashboardPage /></ProtectedRoute>} />
            {/* Market & Info */}
            <Route path="/market-reports" element={<MarketReportsPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            {/* Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
        <WhatsAppWidget />
      <Chatbot />
      </div>
    </AuthUIProvider>
  );
}

export default App;
