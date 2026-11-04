import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Trophy, Crown, Medal, Award, Flame, TrendingUp, MapPin, Star, Heart,
  Calendar, Package, Truck, Clock, Utensils, Sparkles, Lock, Mail, Send, CheckCircle2, ArrowRight,
} from 'lucide-react';
import { easeOutExpo } from '@/lib/animations';

type BadgeKey = 'pioneer' | 'streak30' | 'milestone1k' | 'topContributor' | 'communityHero' | 'greenChampion';

interface RankedEntry {
  rank: number;
  name: string;
  avatar: string;
  metrics: { week: number; month: number; allTime: number };
  metricLabel: string;
  badges: BadgeKey[];
  streak: number;
  trend: 'up' | 'same' | 'down';
  city: string;
  region: string;
}

const BADGES: Record<BadgeKey, { label: string; icon: typeof Star; color: string; bg: string; description: string }> = {
  pioneer: { label: 'Pioneer', icon: Star, color: 'text-orange-dark', bg: 'bg-orange/15', description: 'Among the first to join the platform' },
  streak30: { label: '30-Day Streak', icon: Flame, color: 'text-orange-dark', bg: 'bg-orange/15', description: 'Contributed every day for 30+ days' },
  milestone1k: { label: '1K Milestone', icon: Award, color: 'text-forest', bg: 'bg-forest/15', description: 'Surpassed 1,000 meals contributed' },
  topContributor: { label: 'Top Contributor', icon: Trophy, color: 'text-orange-dark', bg: 'bg-orange/15', description: 'Ranked #1 in their category' },
  communityHero: { label: 'Community Hero', icon: Heart, color: 'text-forest', bg: 'bg-forest/15', description: 'Recognized for outstanding community impact' },
  greenChampion: { label: 'Green Champion', icon: Medal, color: 'text-forest', bg: 'bg-forest/15', description: 'Prevented significant food waste' },
};

const ALL_BADGES = Object.keys(BADGES) as BadgeKey[];

const AVATAR_COLORS = [
  'bg-forest', 'bg-orange', 'bg-forest-light', 'bg-orange-dark', 'bg-dark-light',
  'bg-forest', 'bg-orange', 'bg-forest-light', 'bg-orange-dark', 'bg-dark-light',
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

interface ActivityEntry {
  date: string;
  description: string;
  amount: number;
  type: 'donation' | 'delivery';
}

function generateHistory(entry: RankedEntry): { month: string; value: number }[] {
  const total = entry.metrics.allTime;
  const ratio = total > 0 ? entry.metrics.month / total : 0.15;
  const base = entry.metrics.month;
  const factors = [0.45, 0.55, 0.68, 0.80, 0.90, 1];
  return MONTHS.map((month, i) => ({
    month,
    value: Math.round(base * factors[i] * (0.85 + Math.random() * 0.3)),
  }));
}

function generateActivity(entry: RankedEntry, isDonor: boolean): ActivityEntry[] {
  const recent = entry.metrics.week;
  const desc = isDonor
    ? ['Cooked meals', 'Fresh produce', 'Bakery items', 'Packaged food', 'Beverages']
    : ['Downtown delivery', 'Shelter drop-off', 'Community center', 'Senior housing', 'Food bank run'];
  const amounts = [0.18, 0.22, 0.15, 0.20, 0.13];
  const dates = ['Today', 'Yesterday', '2 days ago', '3 days ago', '5 days ago'];
  const type: 'donation' | 'delivery' = isDonor ? 'donation' : 'delivery';
  return dates.map((date, i) => ({
    date,
    amount: Math.round(recent * amounts[i]),
    type,
    description: desc[i % desc.length],
  }));
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange to-orange-dark shadow-lg shadow-orange/30">
        <Crown className="h-5 w-5 text-white" />
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-dark-light to-dark shadow-lg">
        <Medal className="h-5 w-5 text-fresh" />
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-light to-orange">
        <Medal className="h-5 w-5 text-white" />
      </div>
    );
  }
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-dark/5 text-base font-extrabold text-dark/50">
      {rank}
    </div>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: string; icon: typeof TrendingUp }) {
  return (
    <div className="rounded-2xl bg-cream/60 p-4">
      <div className="flex items-center gap-2 text-dark/45">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-bold uppercase tracking-wide">{label}</span>
      </div>
      <div className="mt-1.5 text-xl font-extrabold text-dark">{value}</div>
    </div>
  );
}

export default function ContributorProfile({
  entry,
  isDonor,
  onClose,
}: {
  entry: RankedEntry;
  isDonor: boolean;
  onClose: () => void;
}) {
  const [showMessage, setShowMessage] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const history = useMemo(() => generateHistory(entry), [entry]);
  const activities = useMemo(() => generateActivity(entry, isDonor), [entry, isDonor]);
  const maxBar = Math.max(...history.map((h) => h.value), 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  const handleMessageReset = () => {
    setShowMessage(false);
    setSent(false);
    setSubject('');
    setBody('');
  };

  const avatarColor = AVATAR_COLORS[entry.rank % AVATAR_COLORS.length];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      >
        <div className="absolute inset-0 bg-dark/60 backdrop-blur-sm" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ duration: 0.4, ease: easeOutExpo }}
          className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-4xl bg-cream shadow-float"
        >
          {/* Header banner */}
          <div className="relative bg-gradient-to-br from-forest to-forest-light p-6 sm:p-8">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-white transition hover:bg-white/25"
              aria-label="Close profile"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
                className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-xl font-extrabold text-white shadow-float sm:h-20 sm:w-20 sm:text-2xl ${avatarColor}`}
              >
                {entry.avatar}
              </motion.div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-xl font-extrabold text-cream sm:text-2xl">{entry.name}</h3>
                  <RankBadge rank={entry.rank} />
                </div>
                <div className="mt-1 flex items-center gap-2 text-sm text-cream/70">
                  <MapPin className="h-3.5 w-3.5" />
                  {entry.city}, {entry.region}
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white/15 px-3 py-0.5 text-xs font-bold text-cream">
                    {isDonor ? 'Food Donor' : 'Volunteer'}
                  </span>
                  {entry.streak >= 30 && (
                    <span className="flex items-center gap-1 rounded-full bg-orange/90 px-3 py-0.5 text-xs font-bold text-white">
                      <Flame className="h-3 w-3" /> {entry.streak}-day streak
                    </span>
                  )}
                  <button
                    onClick={() => setShowMessage((v) => !v)}
                    className="ml-auto flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-forest transition hover:bg-cream"
                  >
                    <Mail className="h-3.5 w-3.5" /> Message
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 p-6 sm:p-8">
            {/* Message composer */}
            <AnimatePresence>
              {showMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.35, ease: easeOutExpo }}
                  className="overflow-hidden"
                >
                  {sent ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                      className="flex flex-col items-center rounded-3xl bg-forest/8 p-6 text-center"
                    >
                      <motion.div
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                        className="flex h-14 w-14 items-center justify-center rounded-full bg-forest"
                      >
                        <CheckCircle2 className="h-7 w-7 text-cream" />
                      </motion.div>
                      <p className="mt-4 font-extrabold text-dark">Message Sent!</p>
                      <p className="mt-1 max-w-xs text-sm text-dark/55">
                        Your message to {entry.name} has been delivered. This is a prototype demo — no real message was sent.
                      </p>
                      <button
                        onClick={handleMessageReset}
                        className="mt-4 flex items-center gap-2 rounded-full bg-dark/5 px-5 py-2.5 text-sm font-bold text-dark/60 transition hover:bg-dark/10 hover:text-dark"
                      >
                        Close <ArrowRight className="h-4 w-4" />
                      </button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="rounded-3xl border border-dark/8 bg-white p-5">
                      <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest/12">
                          <Mail className="h-4.5 w-4.5 text-forest" />
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold text-dark">Message {entry.name}</h4>
                          <p className="text-xs text-dark/45">Start a conversation about food donation coordination</p>
                        </div>
                      </div>

                      <div className="mt-4 space-y-3">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wide text-dark/50">
                            Subject
                          </label>
                          <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="e.g. Food pickup coordination"
                            required
                            className="mt-1.5 w-full rounded-xl border border-dark/15 bg-cream/40 px-4 py-2.5 text-sm text-dark placeholder:text-dark/30 focus:border-forest focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wide text-dark/50">
                            Message
                          </label>
                          <textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder="Write your message here..."
                            required
                            rows={4}
                            className="mt-1.5 w-full resize-none rounded-xl border border-dark/15 bg-cream/40 px-4 py-2.5 text-sm text-dark placeholder:text-dark/30 focus:border-forest focus:outline-none"
                          />
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs text-dark/35">
                            Prototype demo — no real message is sent.
                          </p>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setShowMessage(false)}
                              className="rounded-full px-4 py-2.5 text-sm font-bold text-dark/50 transition hover:text-dark"
                            >
                              Cancel
                            </button>
                            <motion.button
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              type="submit"
                              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-forest to-forest-light px-5 py-2.5 text-sm font-bold text-cream shadow-md"
                            >
                              Send <Send className="h-4 w-4" />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </form>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="This Week" value={entry.metrics.week.toLocaleString()} icon={Clock} />
              <StatCard label="This Month" value={entry.metrics.month.toLocaleString()} icon={Calendar} />
              <StatCard label="All Time" value={entry.metrics.allTime.toLocaleString()} icon={TrendingUp} />
            </div>

            {/* Impact history chart */}
            <div>
              <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-dark/50">
                <TrendingUp className="h-4 w-4 text-forest" />
                Impact History — Last 6 Months
              </h4>
              <div className="mt-3 flex items-end justify-between gap-2 rounded-2xl bg-white p-4 pt-6 sm:gap-3">
                {history.map((h, i) => (
                  <div key={h.month} className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex w-full items-end justify-center" style={{ height: '120px' }}>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(h.value / maxBar) * 100}%` }}
                        transition={{ delay: 0.3 + i * 0.08, duration: 0.6, ease: easeOutExpo }}
                        className="w-full max-w-[36px] rounded-t-lg bg-gradient-to-t from-forest to-forest-light"
                      />
                    </div>
                    <span className="text-xs font-bold text-dark/45">{h.month}</span>
                    <span className="text-xs font-extrabold text-dark">{h.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Badge breakdown */}
            <div>
              <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-dark/50">
                <Award className="h-4 w-4 text-forest" />
                Badge Breakdown
              </h4>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {ALL_BADGES.map((key, i) => {
                  const badge = BADGES[key];
                  const Icon = badge.icon;
                  const earned = entry.badges.includes(key);
                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.05, duration: 0.4 }}
                      className={`flex items-center gap-3 rounded-2xl border p-3 transition ${
                        earned ? 'border-transparent bg-white' : 'border-dark/5 bg-dark/5'
                      }`}
                    >
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${earned ? badge.bg : 'bg-dark/10'}`}>
                        {earned ? (
                          <Icon className={`h-5 w-5 ${badge.color}`} />
                        ) : (
                          <Lock className="h-4 w-4 text-dark/30" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className={`text-sm font-bold ${earned ? 'text-dark' : 'text-dark/40'}`}>
                          {badge.label}
                        </div>
                        <div className={`text-xs ${earned ? 'text-dark/50' : 'text-dark/30'}`}>
                          {earned ? badge.description : 'Not yet earned'}
                        </div>
                      </div>
                      {earned && <Sparkles className="ml-auto h-4 w-4 shrink-0 text-orange" />}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Recent activity */}
            <div>
              <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-dark/50">
                {isDonor ? <Package className="h-4 w-4 text-forest" /> : <Truck className="h-4 w-4 text-forest" />}
                Recent {isDonor ? 'Donations' : 'Deliveries'}
              </h4>
              <div className="mt-3 space-y-2">
                {activities.map((act, i) => {
                  const Icon = isDonor ? Utensils : Truck;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.06, duration: 0.4 }}
                      className="flex items-center gap-3 rounded-2xl bg-white p-3.5"
                    >
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isDonor ? 'bg-orange/15' : 'bg-forest/15'}`}>
                        <Icon className={`h-5 w-5 ${isDonor ? 'text-orange-dark' : 'text-forest'}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-bold text-dark">{act.description}</div>
                        <div className="text-xs text-dark/45">{act.date}</div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-sm font-extrabold text-forest">{act.amount.toLocaleString()}</div>
                        <div className="text-[10px] uppercase tracking-wide text-dark/40">meals</div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <p className="text-center text-xs text-dark/35">
              Illustrative profile — sample data for prototype demonstration
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
