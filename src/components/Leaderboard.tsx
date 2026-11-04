import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Crown, Medal, Award, Flame, TrendingUp, Utensils, Heart, Star, MapPin, ChevronDown, Globe, Clock, ChevronRight } from 'lucide-react';
import { easeOutExpo } from '@/lib/animations';
import Reveal from './Reveal';
import ContributorProfile from './ContributorProfile';

type Role = 'donor' | 'volunteer';
type Period = 'week' | 'month' | 'allTime';

const PERIODS: { key: Period; label: string; shortLabel: string }[] = [
  { key: 'week', label: 'This Week', shortLabel: 'this week' },
  { key: 'month', label: 'This Month', shortLabel: 'this month' },
  { key: 'allTime', label: 'All Time', shortLabel: 'all time' },
];

interface LeaderEntry {
  rank?: number;
  name: string;
  avatar: string;
  metrics: { week: number; month: number; allTime: number };
  metricLabel: string;
  badges: BadgeKey[];
  streak: number;
  trend: { week: 'up' | 'same' | 'down'; month: 'up' | 'same' | 'down'; allTime: 'up' | 'same' | 'down' };
  city: string;
  region: string;
}

interface RankedEntry extends Omit<LeaderEntry, 'metric' | 'trend'> {
  rank: number;
  metric: number;
  trend: 'up' | 'same' | 'down';
}

type BadgeKey = 'pioneer' | 'streak30' | 'milestone1k' | 'topContributor' | 'communityHero' | 'greenChampion';

const BADGES: Record<BadgeKey, { label: string; icon: typeof Star; color: string; bg: string }> = {
  pioneer: { label: 'Pioneer', icon: Star, color: 'text-orange-dark', bg: 'bg-orange/15' },
  streak30: { label: '30-Day Streak', icon: Flame, color: 'text-orange-dark', bg: 'bg-orange/15' },
  milestone1k: { label: '1K Milestone', icon: Award, color: 'text-forest', bg: 'bg-forest/15' },
  topContributor: { label: 'Top Contributor', icon: Trophy, color: 'text-orange-dark', bg: 'bg-orange/15' },
  communityHero: { label: 'Community Hero', icon: Heart, color: 'text-forest', bg: 'bg-forest/15' },
  greenChampion: { label: 'Green Champion', icon: Medal, color: 'text-forest', bg: 'bg-forest/15' },
};

const DONORS: LeaderEntry[] = [
  { name: 'Bella Trattoria', avatar: 'BT', metrics: { week: 920, month: 4280, allTime: 28600 }, metricLabel: 'meals donated', badges: ['pioneer', 'milestone1k', 'topContributor'], streak: 42, trend: { week: 'same', month: 'same', allTime: 'same' }, city: 'Riverside', region: 'North' },
  { name: 'Green Grocer Co.', avatar: 'GG', metrics: { week: 780, month: 3120, allTime: 19200 }, metricLabel: 'meals donated', badges: ['streak30', 'milestone1k', 'greenChampion'], streak: 31, trend: { week: 'up', month: 'up', allTime: 'up' }, city: 'Old Town', region: 'Central' },
  { name: 'The Daily Bake', avatar: 'DB', metrics: { week: 640, month: 2650, allTime: 14800 }, metricLabel: 'meals donated', badges: ['milestone1k', 'communityHero'], streak: 18, trend: { week: 'up', month: 'up', allTime: 'up' }, city: 'Harbor District', region: 'East' },
  { name: 'Sunrise Café', avatar: 'SC', metrics: { week: 410, month: 1980, allTime: 11200 }, metricLabel: 'meals donated', badges: ['streak30', 'milestone1k'], streak: 30, trend: { week: 'down', month: 'down', allTime: 'up' }, city: 'Greenfield', region: 'South' },
  { name: 'Harvest Kitchen', avatar: 'HK', metrics: { week: 360, month: 1420, allTime: 7400 }, metricLabel: 'meals donated', badges: ['milestone1k'], streak: 12, trend: { week: 'up', month: 'up', allTime: 'up' }, city: 'North Heights', region: 'North' },
  { name: 'Urban Eats', avatar: 'UE', metrics: { week: 210, month: 890, allTime: 4600 }, metricLabel: 'meals donated', badges: ['pioneer'], streak: 8, trend: { week: 'same', month: 'same', allTime: 'same' }, city: 'Sunset Vale', region: 'West' },
  { name: 'Fresh Start Foods', avatar: 'FF', metrics: { week: 180, month: 640, allTime: 3200 }, metricLabel: 'meals donated', badges: [], streak: 5, trend: { week: 'up', month: 'up', allTime: 'up' }, city: 'Riverside', region: 'North' },
  { name: 'Corner Bistro', avatar: 'CB', metrics: { week: 150, month: 520, allTime: 2800 }, metricLabel: 'meals donated', badges: ['pioneer'], streak: 7, trend: { week: 'up', month: 'up', allTime: 'up' }, city: 'Old Town', region: 'Central' },
  { name: 'Mama\'s Kitchen', avatar: 'MK', metrics: { week: 110, month: 410, allTime: 1900 }, metricLabel: 'meals donated', badges: [], streak: 4, trend: { week: 'same', month: 'same', allTime: 'same' }, city: 'Greenfield', region: 'South' },
  { name: 'The Grain Mill', avatar: 'GM', metrics: { week: 85, month: 340, allTime: 1500 }, metricLabel: 'meals donated', badges: [], streak: 3, trend: { week: 'up', month: 'up', allTime: 'up' }, city: 'Harbor District', region: 'East' },
];

const VOLUNTEERS: LeaderEntry[] = [
  { name: 'Amara Okafor', avatar: 'AO', metrics: { week: 720, month: 3120, allTime: 22400 }, metricLabel: 'meals delivered', badges: ['pioneer', 'streak30', 'topContributor', 'communityHero'], streak: 45, trend: { week: 'same', month: 'same', allTime: 'same' }, city: 'Harbor District', region: 'East' },
  { name: 'Diego Martinez', avatar: 'DM', metrics: { week: 610, month: 2480, allTime: 16800 }, metricLabel: 'meals delivered', badges: ['streak30', 'milestone1k', 'greenChampion'], streak: 33, trend: { week: 'up', month: 'up', allTime: 'up' }, city: 'Harbor District', region: 'East' },
  { name: 'Priya Sharma', avatar: 'PS', metrics: { week: 480, month: 2010, allTime: 12600 }, metricLabel: 'meals delivered', badges: ['milestone1k', 'communityHero'], streak: 22, trend: { week: 'up', month: 'up', allTime: 'up' }, city: 'Old Town', region: 'Central' },
  { name: 'Liam O\'Brien', avatar: 'LO', metrics: { week: 390, month: 1640, allTime: 9800 }, metricLabel: 'meals delivered', badges: ['streak30'], streak: 30, trend: { week: 'down', month: 'down', allTime: 'up' }, city: 'North Heights', region: 'North' },
  { name: 'Yuki Tanaka', avatar: 'YT', metrics: { week: 280, month: 1180, allTime: 6400 }, metricLabel: 'meals delivered', badges: ['milestone1k'], streak: 14, trend: { week: 'up', month: 'up', allTime: 'up' }, city: 'Greenfield', region: 'South' },
  { name: 'Fatima Al-Rashid', avatar: 'FA', metrics: { week: 170, month: 760, allTime: 3800 }, metricLabel: 'meals delivered', badges: ['pioneer'], streak: 9, trend: { week: 'same', month: 'same', allTime: 'same' }, city: 'Sunset Vale', region: 'West' },
  { name: 'James Okonkwo', avatar: 'JO', metrics: { week: 120, month: 520, allTime: 2400 }, metricLabel: 'meals delivered', badges: [], streak: 6, trend: { week: 'up', month: 'up', allTime: 'up' }, city: 'Riverside', region: 'North' },
  { name: 'Sofia Rossi', avatar: 'SR', metrics: { week: 105, month: 460, allTime: 2100 }, metricLabel: 'meals delivered', badges: ['pioneer'], streak: 8, trend: { week: 'up', month: 'up', allTime: 'up' }, city: 'Old Town', region: 'Central' },
  { name: 'Kenji Watanabe', avatar: 'KW', metrics: { week: 80, month: 380, allTime: 1600 }, metricLabel: 'meals delivered', badges: [], streak: 5, trend: { week: 'same', month: 'same', allTime: 'same' }, city: 'Greenfield', region: 'South' },
  { name: 'Olivia Chen', avatar: 'OC', metrics: { week: 60, month: 290, allTime: 1100 }, metricLabel: 'meals delivered', badges: [], streak: 3, trend: { week: 'up', month: 'up', allTime: 'up' }, city: 'Sunset Vale', region: 'West' },
];

const REGIONS = ['All Regions', 'North', 'Central', 'East', 'South', 'West'] as const;

const AVATAR_COLORS = [
  'bg-forest', 'bg-orange', 'bg-forest-light', 'bg-orange-dark', 'bg-dark-light', 'bg-forest', 'bg-orange', 'bg-forest-light', 'bg-orange-dark', 'bg-dark-light',
];

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-orange to-orange-dark shadow-lg shadow-orange/30">
        <Crown className="h-5 w-5 text-white" />
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-dark-light to-dark shadow-lg">
        <Medal className="h-5 w-5 text-fresh" />
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-light to-orange">
        <Medal className="h-5 w-5 text-white" />
      </div>
    );
  }
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-dark/5 text-lg font-extrabold text-dark/50">
      {rank}
    </div>
  );
}

function TrendIcon({ trend }: { trend: 'up' | 'same' | 'down' }) {
  if (trend === 'up') return <TrendingUp className="h-4 w-4 text-forest" />;
  if (trend === 'down') return <TrendingUp className="h-4 w-4 rotate-180 text-orange-dark" />;
  return <span className="h-4 w-4 text-dark/30">—</span>;
}

function LeaderRow({ entry, index, onClick }: { entry: RankedEntry; index: number; onClick: () => void }) {
  const isTop3 = entry.rank <= 3;
  return (
    <motion.button
      layout
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: easeOutExpo }}
      whileHover={{ x: 4 }}
      onClick={onClick}
      className={`flex w-full items-center gap-4 rounded-2xl p-4 text-left transition ${
        isTop3 ? 'bg-gradient-to-r from-cream-dark/60 to-transparent' : 'hover:bg-dark/5'
      }`}
    >
      <RankBadge rank={entry.rank} />

      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-extrabold text-white ${AVATAR_COLORS[index % AVATAR_COLORS.length]}`}>
        {entry.avatar}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-extrabold text-dark">{entry.name}</span>
          {entry.streak >= 30 && (
            <span className="flex items-center gap-0.5 rounded-full bg-orange/10 px-2 py-0.5 text-xs font-bold text-orange-dark">
              <Flame className="h-3 w-3" /> {entry.streak}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-dark/45">
          <MapPin className="h-3 w-3" /> {entry.city}, {entry.region}
        </div>
      </div>

      <div className="hidden items-center gap-1.5 sm:flex">
        <AnimatePresence>
          {entry.badges.slice(0, 3).map((b) => {
            const badge = BADGES[b];
            const Icon = badge.icon;
            return (
              <motion.span
                key={b}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.06 + 0.3, type: 'spring', stiffness: 200 }}
                className={`flex items-center gap-1 rounded-full ${badge.bg} ${badge.color} px-2.5 py-1 text-xs font-bold`}
              >
                <Icon className="h-3 w-3" />
                <span className="hidden md:inline">{badge.label}</span>
              </motion.span>
            );
          })}
          {entry.badges.length > 3 && (
            <span className="rounded-full bg-dark/5 px-2 py-1 text-xs font-bold text-dark/40">
              +{entry.badges.length - 3}
            </span>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-3 text-right">
        <div>
          <div className="text-xl font-extrabold text-dark">{entry.metric.toLocaleString()}</div>
          <div className="hidden text-[10px] uppercase tracking-wide text-dark/40 sm:block">{entry.metricLabel}</div>
        </div>
        <TrendIcon trend={entry.trend} />
        <ChevronRight className="h-5 w-5 shrink-0 text-dark/25 transition group-hover:text-forest" />
      </div>
    </motion.button>
  );
}

function FilterDropdown({
  label,
  value,
  options,
  onChange,
  icon: Icon,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  icon: typeof MapPin;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 rounded-xl border border-dark/15 bg-cream/50 px-3.5 py-2.5 text-sm font-semibold text-dark transition hover:border-forest/40"
      >
        <Icon className="h-4 w-4 text-forest shrink-0" />
        <span className="shrink-0 text-dark/50">{label}:</span>
        <span className="truncate font-bold">{value}</span>
        <ChevronDown className={`ml-auto h-4 w-4 shrink-0 text-dark/40 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.ul
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 right-0 z-20 mt-1 max-h-56 overflow-y-auto rounded-xl border border-dark/10 bg-white p-1.5 shadow-float"
            >
              {options.map((opt) => (
                <li key={opt}>
                  <button
                    onClick={() => { onChange(opt); setOpen(false); }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${
                      value === opt ? 'bg-forest text-cream' : 'text-dark/70 hover:bg-dark/5'
                    }`}
                  >
                    {opt}
                    {value === opt && <Star className="h-3.5 w-3.5 fill-current" />}
                  </button>
                </li>
              ))}
            </motion.ul>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Leaderboard() {
  const [tab, setTab] = useState<Role>('donor');
  const [period, setPeriod] = useState<Period>('month');
  const [region, setRegion] = useState<string>('All Regions');
  const [city, setCity] = useState<string>('All Cities');
  const [selected, setSelected] = useState<RankedEntry | null>(null);

  const rawData = tab === 'donor' ? DONORS : VOLUNTEERS;
  const periodLabel = PERIODS.find((p) => p.key === period)!.label;

  // Derive available cities based on selected region
  const availableCities = useMemo(() => {
    const filtered = region === 'All Regions' ? rawData : rawData.filter((e) => e.region === region);
    const cities = Array.from(new Set(filtered.map((e) => e.city))).sort();
    return ['All Cities', ...cities];
  }, [region, rawData]);

  // Reset city if it's no longer valid for the selected region
  const effectiveCity = availableCities.includes(city) ? city : 'All Cities';

  // Filter + re-rank using the selected period's metric
  const ranked = useMemo(() => {
    let filtered = rawData;
    if (region !== 'All Regions') filtered = filtered.filter((e) => e.region === region);
    if (effectiveCity !== 'All Cities') filtered = filtered.filter((e) => e.city === effectiveCity);
    return [...filtered]
      .sort((a, b) => b.metrics[period] - a.metrics[period])
      .map((e, i) => ({
        ...e,
        rank: i + 1,
        metric: e.metrics[period],
        trend: e.trend[period],
      })) as RankedEntry[];
  }, [rawData, region, effectiveCity, period]);

  const topThree = ranked.slice(0, 3);
  const rest = ranked.slice(3);
  const totalMeals = ranked.reduce((sum, e) => sum + e.metric, 0);

  const podiumStyles = [
    { height: 'h-36 sm:h-44', order: 'sm:order-2', medal: Crown, bg: 'from-orange to-orange-dark', rank: '1st' },
    { height: 'h-28 sm:h-36', order: 'sm:order-1', medal: Medal, bg: 'from-dark-light to-dark', rank: '2nd' },
    { height: 'h-24 sm:h-32', order: 'sm:order-3', medal: Medal, bg: 'from-orange-light to-orange', rank: '3rd' },
  ];

  const isAreaFiltered = region !== 'All Regions' || effectiveCity !== 'All Cities';
  const isTimeFiltered = period !== 'month';

  return (
    <Reveal delay={0.1} className="mt-6 overflow-hidden rounded-4xl bg-white shadow-premium lg:col-span-3">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-dark/5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange/15">
            <Trophy className="h-6 w-6 text-orange-dark" />
          </div>
          <div>
            <span className="text-sm font-bold uppercase tracking-wider text-forest">Leaderboard</span>
            <h3 className="text-2xl font-extrabold text-dark">
              Top Contributors — <span className="text-orange-dark">{periodLabel}</span>
            </h3>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Time filter */}
          <div className="flex items-center gap-1 rounded-full bg-dark/5 p-1">
            <Clock className="ml-2 mr-0.5 h-3.5 w-3.5 text-dark/40" />
            {PERIODS.map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                  period === p.key ? 'bg-orange text-white shadow-md' : 'text-dark/50 hover:text-dark'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Donor/Volunteer tabs */}
          <div className="flex rounded-full bg-dark/5 p-1">
            {(['donor', 'volunteer'] as Role[]).map((r) => (
              <button
                key={r}
                onClick={() => { setTab(r); setRegion('All Regions'); setCity('All Cities'); }}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${
                  tab === r ? 'bg-forest text-cream shadow-md' : 'text-dark/50 hover:text-dark'
                }`}
              >
                {r === 'donor' ? <Utensils className="h-4 w-4" /> : <Heart className="h-4 w-4" />}
                {r === 'donor' ? 'Donors' : 'Volunteers'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 border-b border-dark/5 p-5 sm:flex-row sm:items-center sm:gap-4 sm:p-6">
        <div className="flex items-center gap-2 text-sm font-bold text-dark/50">
          <Globe className="h-4 w-4 text-forest" />
          <span>Filter by area</span>
        </div>
        <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
          <FilterDropdown
            label="Region"
            value={region}
            options={REGIONS as readonly string[] as string[]}
            onChange={(v) => { setRegion(v); setCity('All Cities'); }}
            icon={Globe}
          />
          <FilterDropdown
            label="City"
            value={effectiveCity}
            options={availableCities}
            onChange={setCity}
            icon={MapPin}
          />
        </div>
        {(isAreaFiltered || isTimeFiltered) && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => { setRegion('All Regions'); setCity('All Cities'); setPeriod('month'); }}
            className="rounded-xl bg-dark/5 px-3 py-2.5 text-sm font-bold text-dark/60 transition hover:bg-dark/10 hover:text-dark"
          >
            Clear
          </motion.button>
        )}
      </div>

      {/* Result count banner */}
      <div className="flex items-center justify-between px-6 pt-5">
        <p className="text-sm font-semibold text-dark/50">
          {ranked.length} {ranked.length === 1 ? 'contributor' : 'contributors'}
          {isAreaFiltered && ` in ${effectiveCity !== 'All Cities' ? effectiveCity : region}`}
          <span className="text-dark/35"> · {periodLabel.toLowerCase()}</span>
        </p>
        <p className="text-sm font-bold text-forest">
          {totalMeals.toLocaleString()} total {tab === 'donor' ? 'meals donated' : 'meals delivered'}
        </p>
      </div>

      {ranked.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-dark/5">
            <MapPin className="h-8 w-8 text-dark/30" />
          </div>
          <p className="mt-4 font-bold text-dark/60">No contributors found in this area yet</p>
          <p className="mt-1 text-sm text-dark/40">Try a different region or city filter</p>
        </div>
      ) : (
        <>
          {/* Podium — top 3 */}
          {topThree.length > 0 && (
            <div className="flex items-end justify-center gap-3 bg-gradient-to-b from-fresh-light/40 to-transparent p-6 sm:gap-5 sm:p-8">
              {topThree.slice(0, 3).map((entry, i) => {
                const style = podiumStyles[i];
                const PodiumIcon = style.medal;
                const avatarColor = AVATAR_COLORS[i];
                return (
                  <motion.button
                    key={entry.name}
                    layout
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.12, duration: 0.6, ease: easeOutExpo }}
                    whileHover={{ y: -6 }}
                    onClick={() => setSelected(entry)}
                    className={`group flex flex-1 cursor-pointer flex-col items-center ${style.order}`}
                  >
                    <motion.div
                      whileHover={{ scale: 1.08 }}
                      className={`flex h-16 w-16 items-center justify-center rounded-2xl text-lg font-extrabold text-white shadow-float transition group-hover:ring-4 group-hover:ring-forest/20 sm:h-20 sm:w-20 ${avatarColor}`}
                    >
                      {entry.avatar}
                    </motion.div>
                    <div className="mt-2 max-w-full text-center">
                      <div className="truncate text-sm font-extrabold text-dark transition group-hover:text-forest sm:text-base">{entry.name}</div>
                      <div className="text-xs text-dark/45">{entry.metric.toLocaleString()} {entry.metricLabel}</div>
                    </div>

                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      transition={{ delay: i * 0.12 + 0.3, duration: 0.5, ease: easeOutExpo }}
                      className={`mt-3 flex w-full ${style.height} items-start justify-center rounded-t-2xl bg-gradient-to-b ${style.bg} pt-3`}
                    >
                      <div className="flex flex-col items-center">
                        <PodiumIcon className="h-7 w-7 text-cream sm:h-8 sm:w-8" />
                        <span className="mt-1 text-xs font-bold uppercase tracking-wide text-cream/90">{style.rank}</span>
                      </div>
                    </motion.div>
                  </motion.button>
                );
              })}
            </div>
          )}

          {/* Rest of leaderboard */}
          {rest.length > 0 && (
            <div className="space-y-1 p-4 sm:p-6">
              <AnimatePresence mode="popLayout">
                {rest.map((entry, i) => (
                  <LeaderRow key={entry.name} entry={entry} index={i} onClick={() => setSelected(entry)} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </>
      )}

      {/* Badge legend */}
      <div className="border-t border-dark/5 p-5 sm:p-6">
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-dark/40">Earnable Badges</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(BADGES).map(([key, badge]) => {
            const Icon = badge.icon;
            return (
              <span
                key={key}
                className={`flex items-center gap-1.5 rounded-full ${badge.bg} ${badge.color} px-3 py-1.5 text-xs font-bold`}
              >
                <Icon className="h-3.5 w-3.5" />
                {badge.label}
              </span>
            );
          })}
        </div>
        <p className="mt-4 text-center text-xs text-dark/35">
          Illustrative leaderboard — sample contributor data for prototype demonstration
        </p>
      </div>

      {selected && (
        <ContributorProfile
          entry={selected}
          isDonor={tab === 'donor'}
          onClose={() => setSelected(null)}
        />
      )}
    </Reveal>
  );
}
