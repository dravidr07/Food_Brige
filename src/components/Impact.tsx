import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Heart, Users, Building2, Recycle, TrendingUp } from 'lucide-react';
import { STATS, FOOD } from '@/lib/data';
import { useCountUp } from '@/lib/useCountUp';
import { easeOutExpo } from '@/lib/animations';
import Reveal from './Reveal';
import LiveMap from './LiveMap';
import CertificateGenerator from './CertificateGenerator';
import Leaderboard from './Leaderboard';
import { FallingLeaves, GlowParticles } from './FoodDecorations';
import { InfoPopover } from './InfoPopover';

function CircularProgress({
  value,
  label,
  icon: Icon,
  color,
  suffix,
  infoText,
}: {
  value: number;
  label: string;
  icon: typeof Heart;
  color: string;
  suffix?: string;
  infoText: string;
}) {
  const { count, ref } = useCountUp(value, 2200);
  const circumference = 2 * Math.PI * 52;
  const offset = circumference - (count / 100) * circumference;

  return (
    <div ref={ref} className="flex flex-col items-center">
      <div className="relative flex h-32 w-32 items-center justify-center">
        {/* Animated rotating ring */}
        <motion.div
          className="absolute inset-[-4px] rounded-full border-2 border-dashed"
          style={{ borderColor: `${color}40` }}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(23,107,69,0.1)" strokeWidth="10" />
          <motion.circle
            cx="60" cy="60" r="52" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 2.2, ease: easeOutExpo }}
          />
        </svg>
        <div className="flex flex-col items-center">
          <Icon className="h-6 w-6" style={{ color }} />
          <span className="mt-1 text-2xl font-extrabold text-dark">
            {count.toLocaleString()}{suffix}
          </span>
        </div>
      </div>
      <span className="mt-3 text-sm font-semibold text-dark/60">{label}</span>
      <InfoPopover
        className="mt-1"
        title={label}
        content={infoText}
      />
    </div>
  );
}

function ProgressBar({ label, value, color, infoText }: { label: string; value: number; color: string; infoText: string }) {
  const { count, ref } = useCountUp(value, 2000);
  return (
    <div ref={ref}>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-semibold text-dark/70">{label}</span>
        <span className="font-extrabold text-dark">{count}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-dark/10">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color, width: `${count}%` }}
        />
      </div>
    </div>
  );
}

const MONTHLY = [
  { month: 'Jan', value: 420 },
  { month: 'Feb', value: 580 },
  { month: 'Mar', value: 720 },
  { month: 'Apr', value: 650 },
  { month: 'May', value: 890 },
  { month: 'Jun', value: 1040 },
  { month: 'Jul', value: 1200 },
  { month: 'Aug', value: 1380 },
];

export default function Impact() {
  const chartRef = useRef(null);
  const chartInView = useInView(chartRef, { once: true, margin: '-40px' });
  const maxVal = Math.max(...MONTHLY.map((m) => m.value));

  return (
    <section id="impact" className="relative overflow-hidden py-24 sm:py-32">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-cream to-fresh-light/50" />
      <FallingLeaves count={4} />
      <GlowParticles count={10} />

      {/* Floating food accents */}
      <motion.div
        className="pointer-events-none absolute left-[3%] top-[15%] hidden overflow-hidden rounded-2xl shadow-food lg:block"
        animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <img src={FOOD.lettuce} alt="" className="h-14 w-14 object-cover" loading="lazy" />
      </motion.div>
      <motion.div
        className="pointer-events-none absolute right-[4%] top-[30%] hidden overflow-hidden rounded-2xl shadow-food lg:block"
        animate={{ y: [0, 12, 0], rotate: [0, -4, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      >
        <img src={FOOD.tomatoes} alt="" className="h-14 w-14 object-cover" loading="lazy" />
      </motion.div>
      <motion.div
        className="pointer-events-none absolute left-[6%] bottom-[10%] hidden overflow-hidden rounded-2xl shadow-food lg:block"
        animate={{ y: [0, -10, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      >
        <img src={FOOD.berries} alt="" className="h-12 w-12 object-cover" loading="lazy" />
      </motion.div>

      <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="inline-block rounded-full bg-forest/15 px-4 py-1.5 text-sm font-bold uppercase tracking-wider text-forest">
            Impact Dashboard
          </span>
          <h2 className="mt-5 text-section font-extrabold tracking-tight text-dark text-balance">
            Every Meal Saved Creates a Better Tomorrow.
          </h2>
          <p className="mt-4 text-dark/60">
            Demo data shown — illustrative metrics for prototype purposes.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {/* Circular stats */}
          <Reveal className="relative overflow-hidden rounded-4xl bg-white p-8 shadow-premium lg:col-span-1">
            <h3 className="mb-6 text-lg font-extrabold text-dark">Key Metrics</h3>
            <div className="grid grid-cols-2 gap-6">
              <CircularProgress value={78} label="Meals Rescued" icon={Heart} color="#FF9254" suffix="%" infoText="Percentage of surplus food that was successfully rescued and distributed instead of going to landfill. Measured across all registered donors." />
              <CircularProgress value={85} label="Donor Growth" icon={Users} color="#176B45" suffix="%" infoText="Year-over-year growth in new food donor registrations — restaurants, cafes, grocers, and households joining the platform." />
            </div>
            {/* Floating food icon */}
            <motion.div
              className="absolute -right-3 -top-3 h-16 w-16 overflow-hidden rounded-2xl opacity-80 shadow-food"
              animate={{ y: [0, -8, 0], rotate: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <img src={FOOD.fruitBowl} alt="" className="h-full w-full object-cover" loading="lazy" />
            </motion.div>
          </Reveal>

          {/* Bar chart */}
          <Reveal delay={0.1} className="rounded-4xl bg-white p-8 shadow-premium lg:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-dark">Monthly Meals Rescued</h3>
              <span className="flex items-center gap-1.5 rounded-full bg-fresh/30 px-3 py-1 text-xs font-bold text-forest">
                <TrendingUp className="h-3.5 w-3.5" /> +24% trend
              </span>
            </div>
            <div ref={chartRef} className="mt-8 flex h-44 items-end justify-between gap-2 sm:gap-3">
              {MONTHLY.map((m, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-2">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={chartInView ? { height: `${(m.value / maxVal) * 100}%` } : {}}
                    transition={{ delay: i * 0.08, duration: 0.7, ease: easeOutExpo }}
                    className="w-full rounded-t-lg bg-gradient-to-t from-forest to-fresh"
                  />
                  <span className="text-xs font-semibold text-dark/50">{m.month}</span>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Progress bars */}
          <Reveal delay={0.15} className="rounded-4xl bg-white p-8 shadow-premium lg:col-span-2">
            <h3 className="mb-6 text-lg font-extrabold text-dark">Goal Progress</h3>
            <div className="space-y-5">
              <ProgressBar label="Food Waste Reduced" value={38} color="#FF9254" infoText="Tons of food diverted from landfill through FoodBridge donations, measured against baseline waste levels in partner cities." />
              <ProgressBar label="NGO Partner Coverage" value={62} color="#176B45" infoText="Percentage of target districts with at least one active FoodBridge NGO partner providing distribution." />
              <ProgressBar label="Volunteer Network" value={71} color="#1E8354" infoText="Active volunteer drivers, packers, and coordinators as a percentage of our year-end recruitment goal." />
              <ProgressBar label="City Reach" value={54} color="#FFB084" infoText="Number of cities with active FoodBridge operations, out of our planned expansion target for this year." />
            </div>
          </Reveal>

          {/* Floating stat cards */}
          <Reveal delay={0.2} className="flex flex-col gap-4 lg:col-span-1">
            {[
              { icon: Heart, label: 'Meals Rescued', value: STATS.mealsRescued, suffix: '+', color: 'bg-orange' },
              { icon: Users, label: 'Food Donors', value: STATS.foodDonors, suffix: '+', color: 'bg-forest' },
              { icon: Building2, label: 'NGO Partners', value: STATS.ngoPartners, suffix: '+', color: 'bg-forest-light' },
              { icon: Recycle, label: 'Waste Reduced', value: STATS.wasteReduced, suffix: '%', color: 'bg-orange-light' },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <StatRow key={i} icon={Icon} label={stat.label} value={stat.value} suffix={stat.suffix} color={stat.color} />
              );
            })}
          </Reveal>
        </div>

        {/* Live interactive map */}
        <LiveMap />

        {/* Certificate generator */}
        <CertificateGenerator />

        {/* Leaderboard */}
        <Leaderboard />
      </div>
    </section>
  );
}

function StatRow({
  icon: Icon,
  label,
  value,
  suffix,
  color,
}: {
  icon: typeof Heart;
  label: string;
  value: number;
  suffix: string;
  color: string;
}) {
  const { count, ref } = useCountUp(value);
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      whileHover={{ x: -4 }}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.5, type: 'spring', stiffness: 300, damping: 22, mass: 0.8 }}
      className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-premium"
    >
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div>
        <div className="text-2xl font-extrabold text-dark">{count.toLocaleString()}{suffix}</div>
        <div className="text-sm text-dark/50">{label}</div>
      </div>
    </motion.div>
  );
}
