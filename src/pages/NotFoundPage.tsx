import { Link } from 'react-router-dom';
import { Compass, Home, Building2, ArrowRight } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="pt-20 min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="max-w-lg w-full text-center px-4 sm:px-6 py-20">
        {/* Icon */}
        <div className="relative inline-flex items-center justify-center mb-8">
          <div className="absolute inset-0 bg-gold-200/40 blur-2xl rounded-full" />
          <div className="relative w-20 h-20 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center">
            <Compass size={36} className="text-gold-600" />
          </div>
        </div>

        {/* 404 */}
        <h1 className="font-serif text-7xl sm:text-8xl font-bold text-slate-900 leading-none mb-4">
          404
        </h1>

        {/* Message */}
        <p className="font-serif text-xl sm:text-2xl text-slate-800 mb-3">
          This page seems to have moved.
        </p>
        <p className="text-slate-600 mb-10 max-w-md mx-auto leading-relaxed">
          The page you are looking for may have been relocated or no longer
          exists. Let's get you back on track.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-900 transition-colors font-medium"
          >
            <Home size={18} />
            Back to Home
          </Link>
          <Link
            to="/projects"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-100 hover:border-slate-300 transition-colors font-medium"
          >
            <Building2 size={18} />
            Browse Properties
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
