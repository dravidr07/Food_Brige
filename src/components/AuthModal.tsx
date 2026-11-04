import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Leaf, Mail, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { easeOutExpo } from '@/lib/animations';
import { SuccessCheckmark } from './SuccessAnimation';
import { BottomSheetHandle, SPRING_TAP, SPRING_SHEET } from '@/lib/springs';

export default function AuthModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => { document.body.style.overflow = ''; window.removeEventListener('resize', check); };
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) setUser({ email: data.session.user.email });
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ email: session.user.email });
        setLoading(false);
        setEmailLoading(false);
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email.');
      return;
    }
    setError('');
    setEmailLoading(true);
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    if (err) {
      setError(err.message);
      setEmailLoading(false);
    } else {
      setEmailSent(true);
      setEmailLoading(false);
    }
  };

  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleBackdrop}
        className={`fixed inset-0 z-[90] flex p-4 ${isMobile ? 'items-end' : 'items-center justify-center'}`}
      >
        <div className="absolute inset-0 bg-dark/50 backdrop-blur-md" />

        <motion.div
          ref={modalRef}
          initial={isMobile ? { opacity: 0, y: '100%' } : { opacity: 0, scale: 0.9, rotateX: -8, y: 30 }}
          animate={isMobile ? { opacity: 1, y: 0 } : { opacity: 1, scale: 1, rotateX: 0, y: 0 }}
          exit={isMobile ? { opacity: 0, y: '100%' } : { opacity: 0, scale: 0.9, rotateX: 8, y: 30 }}
          transition={isMobile ? { ...SPRING_SHEET } : { type: 'spring', stiffness: 260, damping: 24 }}
          style={!isMobile ? { transformPerspective: 1000 } : {}}
          className={`relative z-10 w-full overflow-hidden shadow-float ${
            isMobile
              ? 'max-h-[92vh] rounded-t-4xl bg-cream'
              : 'max-h-[90vh] max-w-md overflow-y-auto rounded-4xl border border-white/30 bg-white/70 backdrop-blur-2xl'
          }`}
        >
          {isMobile && <BottomSheetHandle />}
          {/* Animated gradient header */}
          <div className="relative overflow-hidden bg-gradient-to-br from-forest to-forest-dark px-6 pb-8 pt-7">
            <motion.div
              className="absolute inset-0 opacity-30"
              style={{
                background: 'linear-gradient(120deg, #FF9254, #B8E3C5, #FF9254)',
                backgroundSize: '200% 200%',
              }}
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            />

            <button
              onClick={onClose}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-cream transition hover:bg-white/25"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Animated logo */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
              className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur"
            >
              <motion.div
                animate={{ rotate: [0, 8, -4, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Leaf className="h-8 w-8 text-fresh" />
              </motion.div>
              <motion.div
                className="absolute inset-0 rounded-2xl border-2 border-fresh/40"
                animate={{ scale: [1, 1.3], opacity: [0.6, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
              />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mt-4 text-center text-2xl font-extrabold text-cream"
            >
              {user ? 'Welcome Back!' : 'Welcome to FoodBridge'}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="mt-1 text-center text-sm text-fresh/80"
            >
              {user ? `Signed in as ${user.email}` : 'Join our mission to make every meal count.'}
            </motion.p>
          </div>

          {/* Body */}
          <div className="px-6 py-7">
            {user ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="flex flex-col items-center py-6 text-center"
              >
                <SuccessCheckmark size={72} />
                <p className="mt-5 text-lg font-bold text-dark">You're signed in!</p>
                <p className="mt-2 text-sm text-dark/60">{user.email}</p>
                <button
                  onClick={() => { supabase.auth.signOut(); setUser(null); }}
                  className="mt-6 rounded-full bg-dark/5 px-5 py-2.5 text-sm font-bold text-dark/70 transition hover:bg-dark/10"
                >
                  Sign out
                </button>
              </motion.div>
            ) : emailSent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center py-6 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-fresh"
                >
                  <CheckCircle2 className="h-8 w-8 text-forest" />
                </motion.div>
                <p className="mt-5 text-lg font-bold text-dark">Check your inbox!</p>
                <p className="mt-2 max-w-xs text-sm text-dark/60">
                  We sent a magic link to <span className="font-bold">{email}</span>. Click it to sign in.
                </p>
                <button
                  onClick={onClose}
                  className="mt-6 rounded-full bg-forest px-6 py-3 font-bold text-cream"
                >
                  Done
                </button>
              </motion.div>
            ) : (
              <>
                {/* Google button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ ...SPRING_TAP }}
                  onClick={handleGoogle}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-dark/10 bg-white px-6 py-4 font-bold text-dark shadow-sm transition hover:border-dark/20 disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-forest" />
                  ) : (
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  )}
                  {loading ? 'Redirecting...' : 'Continue with Google'}
                </motion.button>

                {/* Divider */}
                <div className="my-5 flex items-center gap-3">
                  <div className="h-px flex-1 bg-dark/10" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-dark/40">or</span>
                  <div className="h-px flex-1 bg-dark/10" />
                </div>

                {/* Email magic link */}
                <form onSubmit={handleEmail}>
                  <div className="flex items-center gap-2.5 rounded-2xl border-2 border-dark/12 bg-white px-4 py-3.5 focus-within:border-forest">
                    <Mail className="h-5 w-5 text-dark/40" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(''); }}
                      placeholder="Enter your email"
                      className="flex-1 bg-transparent text-sm text-dark placeholder:text-dark/30 focus:outline-none"
                    />
                  </div>
                  {error && <p className="mt-2 text-xs text-orange-dark">{error}</p>}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ ...SPRING_TAP }}
                    type="submit"
                    disabled={emailLoading}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-forest to-forest-light py-3.5 font-bold text-cream shadow-lg shadow-forest/25 disabled:opacity-60"
                  >
                    {emailLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Mail className="h-5 w-5" />}
                    {emailLoading ? 'Sending...' : 'Send Magic Link'}
                  </motion.button>
                </form>

                <p className="mt-4 text-center text-xs text-dark/40">
                  By signing in, you agree to our terms and privacy policy.
                </p>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
