import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import CustomCursor from '@/components/CustomCursor';
import ScrollProgress from '@/components/ScrollProgress';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Problem from '@/components/Problem';
import Solution from '@/components/Solution';
import HowItWorks from '@/components/HowItWorks';
import Features from '@/components/Features';
import Impact from '@/components/Impact';
import ImpactCalculator from '@/components/ImpactCalculator';
import Stories from '@/components/Stories';
import FinalCTA from '@/components/FinalCTA';
import Footer from '@/components/Footer';
import FormModal, { FormType } from '@/components/FormModal';
import MessagesInbox from '@/components/MessagesInbox';
import FoodMarquee from '@/components/FoodMarquee';
import AuthModal from '@/components/AuthModal';
import ImpactPopup from '@/components/ImpactPopup';
import NewsletterPopup, { useNewsletterExit } from '@/components/NewsletterPopup';
import Dashboard from '@/components/Dashboard';
import { ToastProvider, useToast } from '@/components/Toast';
import { supabase } from '@/lib/supabase';

function AppContent() {
  const { show: showToast } = useToast();
  const [formType, setFormType] = useState<FormType | null>(null);
  const [inboxOpen, setInboxOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(6);
  const [authOpen, setAuthOpen] = useState(false);
  const [impactOpen, setImpactOpen] = useState(false);
  const [newsletterOpen, setNewsletterOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [view, setView] = useState<'home' | 'dashboard'>('home');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) setSignedIn(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(!!session?.user);
      if (session?.user && authOpen) {
        showToast({ type: 'success', title: 'Welcome to FoodBridge!', message: `Signed in as ${session.user.email}` });
      }
    });
    return () => listener.subscription.unsubscribe();
  }, [authOpen, showToast]);

  // Welcome toast on first load
  useEffect(() => {
    const timer = setTimeout(() => {
      showToast({ type: 'welcome', title: 'Welcome to FoodBridge!', message: 'Together we can make every meal count.', duration: 5000 });
    }, 1500);
    return () => clearTimeout(timer);
  }, [showToast]);

  // Newsletter exit-intent popup
  useNewsletterExit(useCallback(() => setNewsletterOpen(true), []));

  const openForm = useCallback((type: FormType) => {
    setFormType(type);
    const messages: Record<FormType, { title: string; message: string }> = {
      donate: { title: 'Your donation form is ready', message: 'Share your surplus food in under a minute.' },
      partner: { title: 'Partnership form ready', message: 'Join our verified network of organizations.' },
      volunteer: { title: 'Volunteer form ready', message: 'Become a community champion today.' },
    };
    showToast({ type: 'info', title: messages[type].title, message: messages[type].message });
  }, [showToast]);

  const closeForm = useCallback(() => setFormType(null), []);

  const scrollToMission = () => {
    document.querySelector('#mission')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFormSuccess = useCallback(() => {
    showToast({ type: 'success', title: 'Your form has been submitted successfully!', message: "Thank you for joining our mission! We'll be in touch soon." });
  }, [showToast]);

  // Fire success toast when form closes after submission
  const handleCloseForm = useCallback(() => {
    setFormType(null);
  }, []);

  return (
    <div className="relative min-h-screen bg-cream">
      <CustomCursor />
      <ScrollProgress />
      <Navbar
        onDonate={() => openForm('donate')}
        onInbox={() => setInboxOpen(true)}
        unreadCount={unreadCount}
        onSignIn={() => setAuthOpen(true)}
        signedIn={signedIn}
        onSignOut={() => { supabase.auth.signOut(); setSignedIn(false); showToast({ type: 'info', title: 'Signed out', message: 'You have been signed out.' }); }}
        onDashboard={() => setView('dashboard')}
      />

      {view === 'dashboard' ? (
        <Dashboard onClose={() => { setView('home'); window.scrollTo({ top: 0 }); }} />
      ) : (
        <main>
          <Hero onDonate={() => openForm('donate')} onMission={scrollToMission} />
          <Problem />
          <FoodMarquee />
          <Solution />
          <HowItWorks />
          <Features />
          <Impact />
          <ImpactCalculator onOpenPopup={() => setImpactOpen(true)} />
          <Stories />
          <FoodMarquee />
          <FinalCTA
            onDonate={() => openForm('donate')}
            onPartner={() => openForm('partner')}
            onVolunteer={() => openForm('volunteer')}
          />
        </main>
      )}

      <Footer />

      <AnimatePresence>
        {formType && <FormModal type={formType} onClose={handleCloseForm} onSuccess={handleFormSuccess} />}
      </AnimatePresence>

      <AnimatePresence>
        {inboxOpen && (
          <MessagesInbox
            onClose={() => setInboxOpen(false)}
            onUnreadChange={setUnreadCount}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {impactOpen && <ImpactPopup onClose={() => setImpactOpen(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {newsletterOpen && <NewsletterPopup onClose={() => setNewsletterOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
