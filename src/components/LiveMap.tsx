import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X, Filter, Navigation, Clock, Phone, Utensils, Building2, Home, Store, HeartHandshake, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { easeOutExpo } from '@/lib/animations';
import Reveal from './Reveal';
import { SPRING_TAP } from '@/lib/springs';

type LocationType = 'food_bank' | 'pantry' | 'drop_off' | 'shelter';

interface FoodLocation {
  id: string;
  name: string;
  type: LocationType;
  address: string;
  neighborhood: string;
  map_x: number;
  map_y: number;
  hours: string;
  phone: string;
  capacity: number;
  active: boolean;
}

interface RecentDonation {
  id: string;
  donor_name: string;
  food_type: string;
  quantity: number;
  pickup_location: string;
  created_at: string;
}

const TYPE_CONFIG: Record<LocationType, { icon: typeof MapPin; color: string; bg: string; label: string }> = {
  food_bank: { icon: Building2, color: 'bg-orange', bg: 'bg-orange/15', label: 'Food Bank' },
  pantry: { icon: Store, color: 'bg-forest', bg: 'bg-forest/15', label: 'Pantry' },
  drop_off: { icon: Home, color: 'bg-forest-light', bg: 'bg-forest-light/15', label: 'Drop-off' },
  shelter: { icon: HeartHandshake, color: 'bg-dark-light', bg: 'bg-dark/10', label: 'Shelter' },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function LiveMap() {
  const [locations, setLocations] = useState<FoodLocation[]>([]);
  const [donations, setDonations] = useState<RecentDonation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<FoodLocation | null>(null);
  const [filter, setFilter] = useState<'all' | LocationType>('all');
  const [donationFilter, setDonationFilter] = useState<'all' | 'recent'>('recent');

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [locRes, donRes] = await Promise.all([
      supabase.from('food_locations').select('*').eq('active', true).order('name'),
      supabase.from('donations').select('*').order('created_at', { ascending: false }).limit(8),
    ]);
    setLoading(false);
    if (locRes.data) setLocations(locRes.data);
    if (donRes.data) setDonations(donRes.data);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredLocations = locations.filter((l) => filter === 'all' || l.type === filter);

  const counts = locations.reduce((acc, l) => {
    acc[l.type] = (acc[l.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalCapacity = locations.reduce((sum, l) => sum + l.capacity, 0);
  const totalMealsFromDonations = donations.reduce((sum, d) => sum + Math.round((d.quantity || 0) / 0.4), 0);

  return (
    <Reveal delay={0.1} className="mt-6 overflow-hidden rounded-4xl bg-white shadow-premium lg:col-span-3">
      <div className="grid lg:grid-cols-5">
        {/* Map */}
        <div className="relative lg:col-span-3">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-dark/5 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest/10">
                <MapPin className="h-5 w-5 text-forest" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-dark">Nearby Food Locations</h3>
                <p className="text-xs text-dark/50">Food banks, pantries, shelters & drop-off points</p>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              transition={{ ...SPRING_TAP }}
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-full bg-dark/5 px-3 py-1.5 text-xs font-bold text-dark/60 transition hover:bg-dark/10 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </motion.button>
          </div>

          {/* Map canvas */}
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-fresh-light/40 to-cream-dark/60 sm:aspect-[16/10]">
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 75" preserveAspectRatio="none">
              {/* River */}
              <path
                d="M 0 48 Q 20 42, 35 50 T 70 46 Q 85 44, 100 52 L 100 56 Q 85 48, 70 50 T 35 54 Q 20 46, 0 52 Z"
                fill="rgba(23,107,69,0.08)"
              />
              {/* Roads */}
              <line x1="0" y1="25" x2="100" y2="25" stroke="rgba(23,40,32,0.06)" strokeWidth="0.8" />
              <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(23,40,32,0.06)" strokeWidth="0.8" />
              <line x1="35" y1="0" x2="35" y2="75" stroke="rgba(23,40,32,0.06)" strokeWidth="0.8" />
              <line x1="70" y1="0" x2="70" y2="75" stroke="rgba(23,40,32,0.06)" strokeWidth="0.8" />
            </svg>

            {/* Neighborhood zone overlays (subtle) */}
            {[
              { x: 18, y: 28, w: 26, h: 22, name: 'Riverside' },
              { x: 52, y: 20, w: 22, h: 20, name: 'Old Town' },
              { x: 16, y: 58, w: 24, h: 24, name: 'Greenfield' },
              { x: 50, y: 50, w: 28, h: 26, name: 'Harbor District' },
              { x: 78, y: 16, w: 18, h: 22, name: 'North Heights' },
              { x: 80, y: 52, w: 16, h: 24, name: 'Sunset Vale' },
            ].map((nb, i) => (
              <div
                key={i}
                className="absolute rounded-lg border border-dark/5"
                style={{
                  left: `${nb.x}%`, top: `${nb.y * 0.75}%`, width: `${nb.w}%`, height: `${nb.h * 0.75}%`,
                  background: i % 2 === 0 ? 'rgba(184,227,197,0.12)' : 'rgba(255,146,84,0.06)',
                }}
              />
            ))}

            {/* Location markers */}
            <AnimatePresence>
              {filteredLocations.map((loc, i) => {
                const cfg = TYPE_CONFIG[loc.type];
                const Icon = cfg.icon;
                return (
                  <motion.button
                    key={loc.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.4, ease: easeOutExpo }}
                    onClick={() => setSelected(loc)}
                    className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${loc.map_x}%`, top: `${loc.map_y * 0.75}%` }}
                    aria-label={`${cfg.label}: ${loc.name}`}
                  >
                    {/* Pulse ring */}
                    <span
                      className={`absolute inset-0 animate-ping rounded-full opacity-50 ${cfg.color}`}
                      style={{ animationDuration: '3s' }}
                    />
                    {/* Marker dot */}
                    <span
                      className={`relative flex h-6 w-6 items-center justify-center rounded-full border-2 border-white shadow-lg ${cfg.color}`}
                    >
                      <Icon className="h-3 w-3 text-white" />
                    </span>
                  </motion.button>
                );
              })}
            </AnimatePresence>

            {/* Selected location detail popover */}
            <AnimatePresence>
              {selected && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  transition={{ duration: 0.3, ease: easeOutExpo }}
                  className="absolute bottom-4 left-4 right-4 z-20 rounded-2xl bg-white p-4 shadow-float sm:left-4 sm:right-auto sm:max-w-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${TYPE_CONFIG[selected.type].color}`}>
                        {(() => { const Icon = TYPE_CONFIG[selected.type].icon; return <Icon className="h-4 w-4 text-white" />; })()}
                      </span>
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wide text-dark/50">
                          {TYPE_CONFIG[selected.type].label}
                        </span>
                        <p className="text-sm font-extrabold text-dark">{selected.name}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelected(null)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-dark/5 text-dark/60 hover:bg-dark/10"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-3 space-y-1.5 text-sm">
                    <div className="flex items-center gap-2 text-dark/70">
                      <MapPin className="h-3.5 w-3.5 text-dark/40" />
                      <span>{selected.address}, {selected.neighborhood}</span>
                    </div>
                    <div className="flex items-center gap-2 text-dark/70">
                      <Clock className="h-3.5 w-3.5 text-dark/40" />
                      <span>{selected.hours}</span>
                    </div>
                    {selected.phone && (
                      <div className="flex items-center gap-2 text-dark/70">
                        <Phone className="h-3.5 w-3.5 text-dark/40" />
                        <span>{selected.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-1">
                      <span className="rounded-full bg-fresh/30 px-2.5 py-0.5 text-xs font-bold text-forest">
                        {selected.capacity} meals/day
                      </span>
                      <button className="flex items-center gap-1 text-xs font-bold text-orange-dark transition hover:text-orange">
                        <Navigation className="h-3.5 w-3.5" /> Directions
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Legend */}
            <div className="absolute right-3 top-3 flex flex-col gap-1.5 rounded-xl bg-white/80 px-3 py-2 text-xs backdrop-blur">
              {(Object.keys(TYPE_CONFIG) as LocationType[]).map((t) => (
                <div key={t} className="flex items-center gap-2 font-semibold text-dark/70">
                  <span className={`h-2.5 w-2.5 rounded-full ${TYPE_CONFIG[t].color}`} /> {TYPE_CONFIG[t].label}
                </div>
              ))}
            </div>

            {/* Loading overlay */}
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-cream/60 backdrop-blur-sm">
                <RefreshCw className="h-6 w-6 animate-spin text-forest" />
              </div>
            )}
          </div>

          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-2 border-t border-dark/5 p-4">
            <Filter className="h-4 w-4 text-dark/40" />
            <button
              onClick={() => setFilter('all')}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                filter === 'all' ? 'bg-forest text-cream' : 'bg-dark/5 text-dark/60 hover:bg-dark/10'
              }`}
            >
              All ({locations.length})
            </button>
            {(Object.keys(TYPE_CONFIG) as LocationType[]).map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                  filter === t ? 'bg-forest text-cream' : 'bg-dark/5 text-dark/60 hover:bg-dark/10'
                }`}
              >
                {TYPE_CONFIG[t].label}{counts[t] ? ` (${counts[t]})` : ''}
              </button>
            ))}
            <span className="ml-auto text-xs font-semibold text-dark/50">
              {totalCapacity.toLocaleString()} meals/day capacity
            </span>
          </div>
        </div>

        {/* Recent donations feed */}
        <div className="flex flex-col border-t border-dark/5 lg:col-span-2 lg:border-l lg:border-t-0">
          <div className="flex items-center gap-2 border-b border-dark/5 p-5">
            <Utensils className="h-4 w-4 text-orange" />
            <h4 className="text-sm font-extrabold text-dark">Recent Donations</h4>
            <span className="ml-auto rounded-full bg-fresh/30 px-2.5 py-0.5 text-xs font-bold text-forest">
              {totalMealsFromDonations.toLocaleString()} meals
            </span>
          </div>

          <div className="max-h-[340px] flex-1 overflow-y-auto p-3 lg:max-h-[420px]">
            {donations.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center py-10 text-center">
                <Utensils className="h-8 w-8 text-dark/20" />
                <p className="mt-3 text-sm text-dark/40">No donations yet</p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {donations.map((d, i) => (
                  <motion.div
                    key={d.id}
                    layout
                    initial={{ opacity: 0, x: -20, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: 'auto' }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.4, ease: easeOutExpo }}
                    className={`cursor-pointer rounded-xl p-3 transition hover:bg-dark/5 ${i > 0 ? 'mt-2' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange/15">
                        <Utensils className="h-4 w-4 text-orange-dark" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-dark">{d.donor_name}</p>
                        <p className="truncate text-xs text-dark/50">{d.food_type} • {d.pickup_location}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-extrabold text-forest">{Math.round(d.quantity / 0.4)}</div>
                        <div className="text-[10px] text-dark/40">{timeAgo(d.created_at)}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          <div className="border-t border-dark/5 p-3">
            <p className="text-center text-xs text-dark/40">
              {locations.length} active locations • Data from FoodBridge network
            </p>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
