import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Instagram, Linkedin, Facebook, ArrowRight, CheckCircle2 } from 'lucide-react';

const NAV = ['Home', 'Our Mission', 'How It Works', 'Impact', 'Stories'];
const ABOUT = ['About Us', 'Our Team', 'Careers', 'Press Kit'];
const CONTACT = { email: 'hello@foodbridge.org', phone: '+1 (555) 010-2025', address: '123 Community Ave, Impact City' };

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState('');

  const subscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 4000);
  };

  const scrollTo = (id: string) => {
    document.querySelector(`#${id.toLowerCase().replace(/\s/g, '-')}`)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="relative overflow-hidden bg-dark pt-20 pb-8">
      <div className="absolute inset-0 -z-10 bg-grid opacity-5" />
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Brand + newsletter */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest">
                <Leaf className="h-5 w-5 text-fresh" />
              </div>
              <span className="text-xl font-bold text-cream">Food<span className="text-fresh">Bridge</span></span>
            </div>
            <p className="mt-4 max-w-sm text-cream/60">
              Turning surplus into smiles. Connecting food donors with NGOs and communities who need it most.
            </p>

            <form onSubmit={subscribe} className="mt-6 max-w-sm">
              <label className="text-sm font-semibold text-cream/80">Join our newsletter</label>
              <div className="mt-2 flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="flex-1 rounded-full border border-cream/20 bg-cream/5 px-4 py-3 text-sm text-cream placeholder:text-cream/40 focus:border-fresh focus:outline-none"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center rounded-full bg-orange px-4 text-white"
                  aria-label="Subscribe"
                >
                  <ArrowRight className="h-5 w-5" />
                </motion.button>
              </div>
              {error && <p className="mt-2 text-sm text-orange-light">{error}</p>}
              {subscribed && (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="mt-3 flex items-center gap-2 rounded-2xl border border-fresh/30 bg-fresh/15 px-4 py-3"
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                    >
                      <CheckCircle2 className="h-5 w-5 text-forest" />
                    </motion.div>
                    <p className="text-sm font-bold text-fresh">You're subscribed! Welcome to the community.</p>
                  </motion.div>
                </AnimatePresence>
              )}
            </form>
          </div>

          {/* Nav links */}
          <div className="lg:col-span-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-fresh">Navigate</h4>
            <ul className="mt-4 space-y-2.5">
              {NAV.map((item) => (
                <li key={item}>
                  <button
                    onClick={() => scrollTo(item)}
                    className="text-cream/60 transition hover:text-cream hover:translate-x-1"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-sm font-bold uppercase tracking-wider text-fresh">About</h4>
            <ul className="mt-4 space-y-2.5">
              {ABOUT.map((item) => (
                <li key={item}>
                  <span className="cursor-pointer text-cream/60 transition hover:text-cream">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-sm font-bold uppercase tracking-wider text-fresh">Contact</h4>
            <ul className="mt-4 space-y-3 text-sm text-cream/60">
              <li>{CONTACT.email}</li>
              <li>{CONTACT.phone}</li>
              <li>{CONTACT.address}</li>
            </ul>
            <div className="mt-5 flex gap-3">
              {[Instagram, Linkedin, Facebook].map((Icon, i) => (
                <motion.a
                  key={i}
                  href="#"
                  whileHover={{ y: -4, scale: 1.1 }}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-cream/10 text-cream/70 transition hover:bg-orange hover:text-white"
                  aria-label="Social link"
                >
                  <Icon className="h-5 w-5" />
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-cream/10 pt-6 sm:flex-row">
          <p className="text-sm text-cream/40">© 2026 FoodBridge. Illustrative prototype — not a live service.</p>
          <p className="text-sm text-cream/40">Built with care for a better tomorrow.</p>
        </div>
      </div>
    </footer>
  );
}
