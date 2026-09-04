import { useState } from 'react';
import { X, LogIn, UserPlus, CheckCircle2, Mail, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../lib/auth';

function validatePassword(pw: string): { valid: boolean; message: string } {
  if (pw.length < 8) return { valid: false, message: 'Password must be at least 8 characters' };
  if (!/[A-Z]/.test(pw)) return { valid: false, message: 'Include at least one uppercase letter' };
  if (!/[a-z]/.test(pw)) return { valid: false, message: 'Include at least one lowercase letter' };
  if (!/[0-9]/.test(pw)) return { valid: false, message: 'Include at least one number' };
  return { valid: true, message: '' };
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'signin' | 'signup' | 'forgot';
}

export default function AuthModal({ isOpen, onClose, defaultMode = 'signin' }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [pwStrength, setPwStrength] = useState<{ valid: boolean; message: string } | null>(null);
  const { signIn, signUp, resetPassword } = useAuth();

  if (!isOpen) return null;

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setName('');
    setOtp('');
    setError(null);
    setSuccess(false);
    setResetSent(false);
    setOtpSent(false);
    setPwStrength(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (mode === 'forgot') {
      const { error } = await resetPassword(email);
      if (error) {
        setError(error);
        setSubmitting(false);
      } else {
        setResetSent(true);
        setSubmitting(false);
      }
      return;
    }

    if (mode === 'signin') {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error);
        setSubmitting(false);
      } else {
        handleClose();
      }
    } else {
      const pwCheck = validatePassword(password);
      if (!pwCheck.valid) {
        setError(pwCheck.message);
        setSubmitting(false);
        return;
      }
      const { error } = await signUp(email, password, name);
      if (error) {
        setError(error);
        setSubmitting(false);
      } else {
        setOtpSent(true);
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={handleClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {success ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-serif text-slate-900 mb-2">Account Created!</h3>
            <p className="text-slate-700 mb-6">You can now sign in to save properties and manage your searches.</p>
            <button
              onClick={() => { setSuccess(false); setMode('signin'); }}
              className="px-6 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-900 transition-colors"
            >
              Sign In Now
            </button>
          </div>
        ) : otpSent ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-serif text-slate-900 mb-2">Verify Your Email</h3>
            <p className="text-slate-700 mb-6">
              We've sent a verification link to <strong>{email}</strong>. Click the link in the email to confirm your account, then sign in below.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => { setOtpSent(false); setMode('signin'); }}
                className="w-full px-6 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
              >
                I've Verified — Sign In
              </button>
              <button
                onClick={() => { setOtpSent(false); setMode('signup'); }}
                className="w-full px-6 py-3 text-slate-600 text-sm font-medium hover:bg-slate-50 rounded-lg transition-colors"
              >
                Resend Verification Email
              </button>
            </div>
          </div>
        ) : resetSent ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-serif text-slate-900 mb-2">Check Your Email</h3>
            <p className="text-slate-700 mb-6">We've sent a password reset link to <strong>{email}</strong>. Click the link in the email to reset your password.</p>
            <button
              onClick={() => { setResetSent(false); setMode('signin'); }}
              className="px-6 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="flex items-center gap-2">
                {mode === 'signin' ? <LogIn className="w-5 h-5 text-slate-800" /> : mode === 'signup' ? <UserPlus className="w-5 h-5 text-slate-800" /> : <Mail className="w-5 h-5 text-slate-800" />}
                <h3 className="text-xl font-serif text-slate-900">
                  {mode === 'signin' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
                </h3>
              </div>
              <button onClick={handleClose} className="text-slate-500 hover:text-slate-900 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {mode === 'forgot' && (
                <button onClick={() => { setMode('signin'); setError(null); }} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-4">
                  <ArrowLeft size={14} /> Back to Sign In
                </button>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-800 mb-1.5">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none transition-all"
                      placeholder="Enter your name"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-slate-800 mb-1.5">Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none transition-all"
                    placeholder="you@example.com"
                  />
                </div>
                {mode !== 'forgot' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-800 mb-1.5">Password *</label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (mode === 'signup' && e.target.value) setPwStrength(validatePassword(e.target.value));
                        else setPwStrength(null);
                      }}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none transition-all"
                      placeholder="Min 8 chars, 1 uppercase, 1 number"
                    />
                  </div>
                )}

                {mode === 'signin' && (
                  <div className="text-right">
                    <button type="button" onClick={() => { setMode('forgot'); setError(null); }} className="text-sm text-slate-500 hover:text-slate-800 transition-colors">
                      Forgot password?
                    </button>
                  </div>
                )}

                {pwStrength && mode === 'signup' && password && (
                  <div className={`flex items-center gap-1.5 text-xs ${pwStrength.valid ? 'text-green-600' : 'text-amber-600'}`}>
                    {pwStrength.valid ? <ShieldCheck size={14} /> : <AlertCircle size={14} />}
                    {pwStrength.valid ? 'Strong password' : pwStrength.message}
                  </div>
                )}

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Please wait...' : mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
                </button>
              </form>

              <div className="mt-4 text-center text-sm text-slate-600">
                {mode === 'signin' ? (
                  <>Don't have an account?{' '}
                    <button onClick={() => { setMode('signup'); setError(null); }} className="text-slate-900 font-medium hover:underline">
                      Sign Up
                    </button>
                  </>
                ) : mode === 'signup' ? (
                  <>Already have an account?{' '}
                    <button onClick={() => { setMode('signin'); setError(null); }} className="text-slate-900 font-medium hover:underline">
                      Sign In
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
