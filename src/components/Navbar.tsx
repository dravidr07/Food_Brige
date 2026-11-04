import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { Menu, X, Leaf, ArrowRight, Inbox, User, LayoutDashboard } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { SPRING_TAP } from '@/lib/springs';

const LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'Our Mission', href: '#mission' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Impact', href: '#impact' },
  { label: 'Stories', href: '#stories' },
];

export default function Navbar({ onDonate, onInbox, unreadCount = 0, onSignIn, signedIn, onSignOut, onDashboard }: { onDonate: () => void; onInbox: () => void; unreadCount?: number; onSignIn?: () => void; signedIn?: boolean; onSignOut?: () => void; onDashboard?: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 40);

    // Track active section
    const sections = ['home', 'mission', 'how-it-works', 'impact', 'stories'];
    for (let i = sections.length - 1; i >= 0; i--) {
      const el = document.getElementById(sections[i]);
      if (el && el.getBoundingClientRect().top <= 120) {
        setActiveSection(sections[i]);
        break;
      }
    }
  });

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleNav = (href: string) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <nav
          className={`mx-auto flex items-center justify-between px-5 sm:px-8 transition-all duration-500 ${
            scrolled ? 'mt-3 max-w-6xl rounded-2xl glass shadow-premium py-3' : 'py-5 max-w-7xl'
          }`}
        >
          {/* Logo */}
          <button onClick={() => handleNav('#home')} className="group flex items-center gap-2">
            <motion.div
              whileHover={{ rotate: -15, scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest"
            >
              <Leaf className="h-5 w-5 text-fresh" />
            </motion.div>
            <span className="text-lg font-bold tracking-tight text-dark">
              Food<span className="text-forest">Bridge</span>
            </span>
          </button>

          {/* Desktop links */}
          <ul className="hidden items-center gap-1 lg:flex">
            {LINKS.map((link) => {
              const section = link.href.replace('#', '');
              const active = activeSection === section;
              return (
                <li key={link.href}>
                  <button
                    onClick={() => handleNav(link.href)}
                    className="relative px-4 py-2 text-sm font-semibold text-dark/70 transition-colors hover:text-forest"
                  >
                    {link.label}
                    {active && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-orange"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          {/* CTA + mobile toggle */}
          <div className="flex items-center gap-3">
            {/* Dashboard button */}
            {onDashboard && (
              <button
                onClick={onDashboard}
                className="hidden items-center gap-2 rounded-full bg-dark/5 px-3.5 py-2.5 text-sm font-bold text-dark/70 transition hover:bg-dark/10 hover:text-dark md:flex"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </button>
            )}

            {/* Inbox button */}
            <button
              onClick={onInbox}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-dark transition hover:bg-dark/5"
              aria-label="Open messages"
            >
              <Inbox className="h-5 w-5" />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange px-1 text-[10px] font-extrabold text-white shadow-md"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
              )}
            </button>

            {/* Sign in / out button */}
            {signedIn ? (
              <button
                onClick={onSignOut}
                className="hidden items-center gap-2 rounded-full bg-dark/5 px-4 py-2.5 text-sm font-bold text-dark transition hover:bg-dark/10 sm:flex"
              >
                <User className="h-4 w-4" />
                Sign Out
              </button>
            ) : (
              <button
                onClick={onSignIn}
                className="hidden items-center gap-2 rounded-full border-2 border-forest/20 px-4 py-2.5 text-sm font-bold text-forest transition hover:border-forest hover:bg-forest/5 sm:flex"
              >
                <User className="h-4 w-4" />
                Sign In
              </button>
            )}

            <motion.button
              onClick={() => { playSound('click'); onDonate(); }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.93 }}
              transition={{ type: 'spring', stiffness: 400, damping: 18, mass: 0.8 }}
              className="group hidden items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-bold text-cream shadow-lg shadow-forest/25 sm:flex"
            >
              Donate Food
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </motion.button>

            <button
              onClick={() => setMenuOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-dark lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] lg:hidden"
          >
            {/* Backdrop with blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-dark/40 backdrop-blur-md"
              onClick={() => setMenuOpen(false)}
            />

            {/* Slide-down panel from top */}
            <motion.div
              initial={{ y: '-100%' }}
              animate={{ y: 0 }}
              exit={{ y: '-100%' }}
              transition={{ type: 'spring', stiffness: 260, damping: 26, mass: 0.8 }}
              className="absolute left-0 right-0 top-0 flex flex-col bg-cream/95 p-6 pt-5 shadow-2xl backdrop-blur-xl"
              style={{ maxHeight: '100vh', overflowY: 'auto' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest">
                    <Leaf className="h-5 w-5 text-fresh" />
                  </div>
                  <span className="text-lg font-bold text-dark">Food<span className="text-forest">Bridge</span></span>
                </div>
                <motion.button
                  onClick={() => setMenuOpen(false)}
                  whileTap={{ scale: 0.9 }}
                  transition={{ ...SPRING_TAP }}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-dark/5 text-dark"
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6" />
                </motion.button>
              </div>

              <ul className="mt-8 flex flex-col gap-1">
                {LINKS.map((link, i) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.07, type: 'spring', stiffness: 300, damping: 24 }}
                  >
                    <motion.button
                      onClick={() => handleNav(link.href)}
                      whileTap={{ scale: 0.95 }}
                      transition={{ ...SPRING_TAP }}
                      className="w-full rounded-xl px-4 py-3.5 text-left text-lg font-bold text-dark hover:bg-fresh/40"
                    >
                      {link.label}
                    </motion.button>
                  </motion.li>
                ))}
              </ul>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 300, damping: 24 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => { setMenuOpen(false); onDashboard?.(); }}
                className="flex items-center justify-center gap-2 rounded-xl bg-dark/5 py-3.5 text-base font-bold text-dark"
              >
                <LayoutDashboard className="h-5 w-5" />
                Dashboard
              </motion.button>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, type: 'spring', stiffness: 300, damping: 24 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => { setMenuOpen(false); onInbox(); }}
                className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-dark/5 py-3.5 text-base font-bold text-dark"
              >
                <Inbox className="h-5 w-5" />
                Messages
                {unreadCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-orange px-1.5 text-xs font-extrabold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </motion.button>

              {/* Sign in/out for mobile */}
              {signedIn ? (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, type: 'spring', stiffness: 300, damping: 24 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => { setMenuOpen(false); onSignOut?.(); }}
                  className="mt-2 flex items-center justify-center gap-2 rounded-xl border-2 border-forest/20 py-3.5 text-base font-bold text-forest"
                >
                  <User className="h-5 w-5" /> Sign Out
                </motion.button>
              ) : (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, type: 'spring', stiffness: 300, damping: 24 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => { setMenuOpen(false); onSignIn?.(); }}
                  className="mt-2 flex items-center justify-center gap-2 rounded-xl border-2 border-forest/20 py-3.5 text-base font-bold text-forest"
                >
                  <User className="h-5 w-5" /> Sign In
                </motion.button>
              )}

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, type: 'spring', stiffness: 300, damping: 24 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => { setMenuOpen(false); playSound('click'); onDonate(); }}
                className="mt-4 flex items-center justify-center gap-2 rounded-full bg-orange py-4 text-base font-bold text-white shadow-lg shadow-orange/30"
              >
                Donate Food
                <ArrowRight className="h-5 w-5" />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
