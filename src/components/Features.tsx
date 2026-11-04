import { motion } from 'framer-motion';
import {
  UtensilsCrossed, BadgeCheck, MapPin, CalendarClock, Activity, Users, ArrowRight,
} from 'lucide-react';
import { FEATURES } from '@/lib/data';
import { easeOutExpo } from '@/lib/animations';
import Reveal from './Reveal';
import { InfoPopover } from './InfoPopover';
import { SPRING_CARD } from '@/lib/springs';

const ICONS: Record<string, typeof UtensilsCrossed> = {
  UtensilsCrossed, BadgeCheck, MapPin, CalendarClock, Activity, Users,
};

const ACCENT: Record<string, { bg: string; icon: string; hover: string; glow: string }> = {
  forest: { bg: 'bg-forest', icon: 'text-cream', hover: 'group-hover:bg-forest-dark', glow: 'glow-forest' },
  orange: { bg: 'bg-orange', icon: 'text-white', hover: 'group-hover:bg-orange-dark', glow: 'glow-orange' },
  fresh: { bg: 'bg-fresh', icon: 'text-forest', hover: 'group-hover:bg-fresh-light', glow: '' },
};

const INFO_CONTENT: Record<number, { title: string; body: string }> = {
  0: { title: 'Food Donation Guidelines', body: 'List any surplus food — cooked meals, fresh produce, packaged items, or bakery. Include photos, quantity, and a pickup window. Our system matches you with the nearest verified recipient in under 60 seconds.' },
  1: { title: 'Verification Process', body: 'Every NGO partner undergoes a multi-step vetting process: legal registration check, site visit, capacity assessment, and ongoing performance reviews. Only verified organizations join our network.' },
  2: { title: 'How Matching Works', body: 'Our smart proximity algorithm considers distance, food type compatibility, recipient capacity, and real-time availability to find the optimal match — minimizing travel time and food spoilage.' },
  3: { title: 'Pickup Coordination', body: 'Schedule pickups with one tap. Get live status updates, route optimization for drivers, and automated reminders. Track every donation from kitchen to community in real time.' },
  4: { title: 'Real-Time Tracking', body: 'Follow each donation through five stages: listed, matched, picked up, in transit, and delivered. Get instant notifications at every step with photo confirmation at handoff.' },
  5: { title: 'Volunteer Network', body: 'Join hundreds of drivers, packers, and coordinators in your area. Choose your preferred role, set your availability, and track your community impact hours with personalized badges.' },
};

export default function Features() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="inline-block rounded-full bg-forest/15 px-4 py-1.5 text-sm font-bold uppercase tracking-wider text-forest">
            Key Features
          </span>
          <h2 className="mt-5 text-section font-extrabold tracking-tight text-dark text-balance">
            Everything You Need to Share Food, Effortlessly.
          </h2>
        </Reveal>

        <div className="mt-14 grid auto-rows-[minmax(180px,auto)] gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {FEATURES.map((feature, i) => {
            const Icon = ICONS[feature.icon];
            const accent = ACCENT[feature.accent];
            const isLarge = feature.span.includes('row-span-2');
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40, rotate: i % 2 === 0 ? -2 : 2 }}
                whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                whileTap={{ scale: 0.96, rotate: i % 2 === 0 ? -1 : 1 }}
                transition={{ delay: i * 0.08, duration: 0.6, ease: easeOutExpo, ...SPRING_CARD }}
                viewport={{ once: true, margin: '-40px' }}
                className={`group glow-border relative overflow-hidden rounded-4xl bg-white p-6 shadow-premium transition-shadow duration-500 hover:shadow-float ${feature.span}`}
              >
                {/* Hover gradient */}
                <div className={`absolute inset-0 -z-10 ${accent.hover} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
                <div className="absolute inset-0 -z-10 bg-white transition-opacity duration-500 group-hover:opacity-0" />

                {/* Glow effect on hover */}
                <div className={`absolute inset-0 -z-20 ${accent.bg} opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-10`} />

                <motion.div
                  whileHover={{ rotate: 8, scale: 1.15 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl ${accent.bg} ${accent.icon} transition-colors`}
                >
                  <Icon className={isLarge ? 'h-8 w-8' : 'h-6 w-6'} />
                </motion.div>

                <div className="flex items-start justify-between">
                  <h3 className={`mt-5 font-extrabold text-dark transition-colors group-hover:text-white ${isLarge ? 'text-2xl sm:text-3xl' : 'text-lg'}`}>
                    {feature.title}
                  </h3>
                  <InfoPopover
                    title={INFO_CONTENT[i]?.title}
                    content={INFO_CONTENT[i]?.body}
                    iconClassName="text-dark/20 group-hover:text-white/40"
                    className="mt-5"
                  />
                </div>
                <p className={`mt-2 text-dark/60 transition-colors group-hover:text-white/80 ${isLarge ? 'text-base sm:text-lg' : 'text-sm'}`}>
                  {feature.description}
                </p>

                {/* CTA arrow on hover */}
                <motion.div
                  className="mt-3 flex items-center gap-1.5 text-sm font-bold text-forest opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100"
                >
                  <span className="group-hover:text-white">Learn more</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:text-white" />
                </motion.div>

                {isLarge && (
                  <div className="mt-auto pt-6">
                    <div className="flex h-24 items-end gap-2">
                      {[40, 65, 50, 80, 60, 95, 70].map((h, j) => (
                        <motion.div
                          key={j}
                          initial={{ height: 0 }}
                          whileInView={{ height: `${h}%` }}
                          viewport={{ once: true }}
                          transition={{ delay: j * 0.08, duration: 0.6, ease: easeOutExpo }}
                          className={`flex-1 rounded-t-md ${accent.bg} opacity-80`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
