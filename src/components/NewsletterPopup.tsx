import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, CheckCircle2, Loader2, Leaf } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { SuccessCheckmark } from './SuccessAnimation';
import { BottomSheetHandle, SPRING_TAP, SPRING_SHEET } from '@/lib/springs';

const STORAGE_KEY = 'foodbridge-newsletter-shown';

export default function NewsletterPopup({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
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
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email.');
      return;
    }
    setError('');
    setLoading(true);
    // Store in the partners table as a newsletter entry (demo)
    const { error: err } = await supabase
      .from('partners')
      .insert({ org_name: 'Newsletter', contact_name: 'Newsletter', email, org_type: 'Newsletter' });
    setLoading(false);
    if (err && err.code !== '23505') {
      setError('Something went wrong. Please try again.');
    } else {
      setDone(true);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleBackdrop}
        className={`fixed inset-0 z-[85] flex p-4 ${isMobile ? 'items-end' : 'items-center justify-center'}`}
      >
        <div className="absolute inset-0 bg-dark/40 backdrop-blur-md" />

        <motion.div
          ref={modalRef}
          initial={isMobile ? { opacity: 0, y: '100%' } : { opacity: 0, scale: 0.88, y: 30, rotateX: -8 }}
          animate={isMobile ? { opacity: 1, y: 0 } : { opacity: 1, scale: 1, y: 0, rotateX: 0 }}
          exit={isMobile ? { opacity: 0, y: '100%' } : { opacity: 0, scale: 0.9, y: 30 }}
          transition={isMobile ? { ...SPRING_SHEET } : { type: 'spring', stiffness: 250, damping: 22 }}
          style={!isMobile ? { transformPerspective: 1000 } : {}}
          className={`relative z-10 w-full overflow-hidden bg-cream shadow-float ${
            isMobile ? 'max-h-[92vh] rounded-t-4xl' : 'max-w-md rounded-4xl'
          }`}
        >
          {isMobile && <BottomSheetHandle />}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-xl bg-white/60 text-dark/60 transition hover:bg-white/90"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          {done ? (
            <div className="flex flex-col items-center px-6 py-14 text-center">
              <SuccessCheckmark size={76} />
              <h3 className="mt-5 text-xl font-extrabold text-dark">You're Subscribed!</h3>
              <p className="mt-2 max-w-xs text-sm text-dark/60">
                We'll send you impact stories and updates. Welcome to the FoodBridge community!
              </p>
              <button
                onClick={onClose}
                className="mt-6 rounded-full bg-forest px-6 py-3 font-bold text-cream"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {/* Animated envelope illustration header */}
              <div className="relative overflow-hidden bg-gradient-to-br from-forest to-forest-dark px-6 pb-10 pt-12">
                <motion.div
                  className="absolute inset-0 opacity-20"
                  style={{ background: 'linear-gradient(120deg, #FF9254, #B8E3C5)', backgroundSize: '200% 200%' }}
                  animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                  transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                />

                {/* Floating leaves */}
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute text-fresh/15"
                    style={{ left: `${10 + i * 30}%`, top: `${15 + (i % 2) * 50}%` }}
                    animate={{ y: [0, -10, 0], rotate: [0, 12, 0] }}
                    transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.3 }}
                  >
                    <Leaf className="h-6 w-6" />
                  </motion.div>
                ))}

                {/* Animated envelope */}
                <motion.div
                  initial={{ scale: 0, y: -20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ delay: 0.15, type: 'spring', stiffness: 180 }}
                  className="relative mx-auto flex h-20 w-28 items-center justify-center"
                >
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="flex h-full w-full items-center justify-center rounded-2xl border-2 border-fresh/40 bg-white/10 backdrop-blur"
                  >
                    <Mail className="h-10 w-10 text-fresh" />
                  </motion.div>
                  {/* Pulse ring */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl border-2 border-fresh/30"
                    animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                  />
                </motion.div>
              </div>

              {/* Body */}
              <div className="px-6 py-7">
                <h3 className="text-center text-xl font-extrabold text-dark">
                  Stay in the Loop
                </h3>
                <p className="mt-2 text-center text-sm text-dark/60">
                  Get inspiring impact stories and food rescue updates delivered to your inbox.
                </p>

                <form onSubmit={submit} className="mt-5">
                  <div className="flex items-center gap-2.5 rounded-2xl border-2 border-dark/12 bg-white px-4 py-3.5 focus-within:border-forest">
                    <Mail className="h-5 w-5 text-dark/40" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(''); }}
                      placeholder="your@email.com"
                      className="flex-1 bg-transparent text-sm text-dark placeholder:text-dark/30 focus:outline-none"
                    />
                  </div>
                  {error && <p className="mt-2 text-xs text-orange-dark">{error}</p>}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ ...SPRING_TAP }}
                    type="submit"
                    disabled={loading}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange to-orange-dark py-3.5 font-bold text-white shadow-lg shadow-orange/30 disabled:opacity-60"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                    {loading ? 'Subscribing...' : 'Subscribe'}
                  </motion.button>
                </form>
                <p className="mt-3 text-center text-xs text-dark/35">
                  No spam, just good news. Unsubscribe anytime.
                </p>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/** Hook to show the newsletter popup on exit-intent or after delay */
export function useNewsletterExit(trigger: () => void) {
  useEffect(() => {
    const shown = sessionStorage.getItem(STORAGE_KEY);
    if (shown) return;

    let fired = false;
    const fire = () => {
      if (fired) return;
      fired = true;
      sessionStorage.setItem(STORAGE_KEY, '1');
      trigger();
    };

    // Exit intent — mouse leaves through top
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) fire();
    };

    // Fallback: show after 45s if no exit intent
    const timer = setTimeout(fire, 45000);

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      clearTimeout(timer);
    };
  }, [trigger]);
}
