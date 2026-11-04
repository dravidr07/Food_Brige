import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Utensils, Leaf, Users, TrendingUp, Clock, MapPin, Package, RefreshCw, ImageIcon, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useCountUp } from '@/lib/useCountUp';
import { computeImpact } from '@/lib/impact';
import Reveal from './Reveal';
import { SPRING_TAP, SPRING_CARD } from '@/lib/springs';

interface Donation {
  id: string;
  donor_name: string;
  food_type: string;
  quantity: number;
  pickup_location: string;
  status: string;
  notes: string | null;
  photo_url: string | null;
  created_at: string;
}

const STATUS_STYLES: Record<string, string> = {
  available: 'bg-orange/15 text-orange-dark',
  matched: 'bg-forest/15 text-forest',
  picked_up: 'bg-dark/10 text-dark/60',
  delivered: 'bg-forest/15 text-forest',
};

const STATUS_LABELS: Record<string, string> = {
  available: 'Available',
  matched: 'Matched',
  picked_up: 'Picked Up',
  delivered: 'Delivered',
};

const FOOD_TYPE_ICONS: Record<string, string> = {
  'Cooked Meals': '🍽️',
  'Fresh Produce': '🥬',
  'Packaged Items': '📦',
  'Bakery': '🥖',
  'Beverages': '🥤',
  'Other': '🍲',
};

function StatCard({ icon: Icon, value, label, color, delay }: { icon: typeof Utensils; value: number; label: string; color: string; delay: number }) {
  const { count } = useCountUp(value, 1500);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, ...SPRING_CARD }}
      className="rounded-3xl bg-white p-5 shadow-premium"
    >
      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${color}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="mt-3 text-3xl font-extrabold text-dark tabular-nums">{count.toLocaleString()}</div>
      <div className="mt-0.5 text-xs font-semibold text-dark/50">{label}</div>
    </motion.div>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export default function Dashboard({ onClose }: { onClose?: () => void }) {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('all');

  const fetchDonations = useCallback(async () => {
    setLoading(true);
    setError('');
    const { data, error: fetchError } = await supabase
      .from('donations')
      .select('*')
      .order('created_at', { ascending: false });
    setLoading(false);
    if (fetchError) {
      setError(fetchError.message || 'Could not load donations.');
      return;
    }
    setDonations(data || []);
  }, []);

  useEffect(() => { fetchDonations(); }, [fetchDonations]);

  const stats = useMemo(() => {
    const totalDonations = donations.length;
    const totalPortions = donations.reduce((sum, d) => sum + (d.quantity || 0), 0);
    const impact = computeImpact(String(totalPortions), 'kg');
    return {
      totalDonations,
      totalPortions,
      totalMeals: impact.meals,
      totalPeople: impact.people,
      totalKg: Math.round(impact.kg),
    };
  }, [donations]);

  const foodTypes = useMemo(() => {
    const types = new Set(donations.map((d) => d.food_type));
    return Array.from(types);
  }, [donations]);

  const filtered = useMemo(() => {
    if (filter === 'all') return donations;
    return donations.filter((d) => d.food_type === filter);
  }, [donations, filter]);

  return (
    <div className="min-h-screen bg-cream pb-20 pt-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        {/* Header */}
        <Reveal>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-forest to-forest-dark shadow-lg shadow-forest/20">
                <LayoutDashboard className="h-7 w-7 text-cream" />
              </div>
              <div>
                <span className="text-sm font-bold uppercase tracking-wider text-forest">Your Dashboard</span>
                <h1 className="text-3xl font-extrabold text-dark sm:text-4xl">Donation History</h1>
              </div>
            </div>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ ...SPRING_TAP }}
                onClick={fetchDonations}
                disabled={loading}
                className="flex items-center gap-2 rounded-full border border-dark/15 bg-white px-4 py-2.5 text-sm font-bold text-dark/70 transition hover:bg-dark/5 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
              </motion.button>
              {onClose && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ ...SPRING_TAP }}
                  onClick={onClose}
                  className="flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-bold text-cream shadow-lg shadow-forest/20"
                >
                  Back to Home <ArrowRight className="h-4 w-4" />
                </motion.button>
              )}
            </div>
          </div>
        </Reveal>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={Package} value={stats.totalDonations} label="Total Donations" color="bg-orange" delay={0} />
          <StatCard icon={Utensils} value={stats.totalMeals} label="Meals Provided" color="bg-forest-light" delay={0.08} />
          <StatCard icon={Users} value={stats.totalPeople} label="People Fed" color="bg-forest" delay={0.16} />
          <StatCard icon={Leaf} value={stats.totalKg} label="kg Food Saved" color="bg-dark-light" delay={0.24} />
        </div>

        {/* Filters */}
        {foodTypes.length > 0 && (
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-dark/40">Filter:</span>
            <button
              onClick={() => setFilter('all')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                filter === 'all' ? 'bg-forest text-cream' : 'bg-white text-dark/60 hover:bg-dark/5'
              }`}
            >
              All ({donations.length})
            </button>
            {foodTypes.map((type) => {
              const count = donations.filter((d) => d.food_type === type).length;
              return (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                    filter === type ? 'bg-forest text-cream' : 'bg-white text-dark/60 hover:bg-dark/5'
                  }`}
                >
                  {FOOD_TYPE_ICONS[type] || '🍲'} {type} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 rounded-2xl bg-orange/10 px-5 py-4 text-sm font-semibold text-orange-dark"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading skeleton */}
        {loading && (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse overflow-hidden rounded-3xl bg-white shadow-premium">
                <div className="h-40 bg-dark/5" />
                <div className="p-5">
                  <div className="h-4 w-2/3 rounded bg-dark/5" />
                  <div className="mt-3 h-3 w-1/2 rounded bg-dark/5" />
                  <div className="mt-4 h-3 w-1/3 rounded bg-dark/5" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && !error && (
          <Reveal>
            <div className="mt-12 flex flex-col items-center rounded-3xl bg-white py-16 text-center shadow-premium">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-fresh/30">
                <Package className="h-10 w-10 text-forest" />
              </div>
              <h3 className="mt-6 text-xl font-extrabold text-dark">
                {donations.length === 0 ? 'No donations yet' : 'No donations in this category'}
              </h3>
              <p className="mt-2 max-w-sm text-dark/50">
                {donations.length === 0
                  ? 'Your submitted food donations will appear here with photos and impact details.'
                  : 'Try a different filter to see your other donations.'}
              </p>
            </div>
          </Reveal>
        )}

        {/* Donation cards */}
        {!loading && filtered.length > 0 && (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((donation, i) => {
                const impact = computeImpact(String(donation.quantity), 'kg');
                return (
                  <motion.div
                    key={donation.id}
                    layout
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.05, ...SPRING_CARD }}
                    whileHover={{ y: -4 }}
                    className="group overflow-hidden rounded-3xl bg-white shadow-premium"
                  >
                    {/* Photo or placeholder */}
                    <div className="relative h-40 overflow-hidden bg-dark/5">
                      {donation.photo_url ? (
                        <img
                          src={donation.photo_url}
                          alt={donation.food_type}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-fresh/20 to-cream-dark">
                          <ImageIcon className="h-10 w-10 text-dark/20" />
                        </div>
                      )}
                      {/* Status badge */}
                      <span
                        className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_STYLES[donation.status] || STATUS_STYLES.available}`}
                      >
                        {STATUS_LABELS[donation.status] || donation.status}
                      </span>
                      {/* Food type badge */}
                      <span className="absolute bottom-3 left-3 rounded-full bg-dark/60 px-2.5 py-1 text-xs font-bold text-white backdrop-blur">
                        {FOOD_TYPE_ICONS[donation.food_type] || '🍲'} {donation.food_type}
                      </span>
                    </div>

                    {/* Card body */}
                    <div className="p-5">
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-extrabold text-dark">{donation.donor_name}</h4>
                      </div>
                      <div className="mt-2 space-y-1.5 text-sm text-dark/60">
                        <div className="flex items-center gap-2">
                          <Package className="h-3.5 w-3.5 text-dark/30" />
                          <span>{donation.quantity} portions</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-dark/30" />
                          <span className="truncate">{donation.pickup_location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-dark/30" />
                          <span>{timeAgo(donation.created_at)}</span>
                        </div>
                      </div>

                      {/* Impact mini-stats */}
                      <div className="mt-4 grid grid-cols-3 gap-2">
                        <div className="rounded-xl bg-orange/10 py-2 text-center">
                          <div className="text-sm font-extrabold text-orange-dark">{impact.meals}</div>
                          <div className="text-[10px] font-semibold text-dark/40">Meals</div>
                        </div>
                        <div className="rounded-xl bg-forest/10 py-2 text-center">
                          <div className="text-sm font-extrabold text-forest">{impact.people}</div>
                          <div className="text-[10px] font-semibold text-dark/40">People</div>
                        </div>
                        <div className="rounded-xl bg-fresh/20 py-2 text-center">
                          <div className="text-sm font-extrabold text-forest">{Math.round(impact.kg)}</div>
                          <div className="text-[10px] font-semibold text-dark/40">kg</div>
                        </div>
                      </div>

                      {donation.notes && (
                        <p className="mt-3 line-clamp-2 text-xs text-dark/40">{donation.notes}</p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Approximate disclaimer */}
        {filtered.length > 0 && (
          <p className="mt-8 flex items-center justify-center gap-1.5 text-xs text-dark/40">
            <TrendingUp className="h-3.5 w-3.5" /> Impact estimates are approximate: ~0.4 kg per meal, ~1.5 meals per person.
          </p>
        )}
      </div>
    </div>
  );
}
