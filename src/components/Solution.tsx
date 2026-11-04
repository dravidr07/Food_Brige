import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Utensils, Home, Heart, Users, Sprout } from 'lucide-react';
import { FOOD } from '@/lib/data';
import { easeOutExpo } from '@/lib/animations';
import Reveal from './Reveal';
import { GlowParticles } from './FoodDecorations';

const NODES = [
  { icon: Utensils, label: 'Restaurants', sub: 'Surplus meals', color: 'bg-orange' },
  { icon: Home, label: 'Households', sub: 'Extra groceries', color: 'bg-orange-light' },
  { icon: Sprout, label: 'FoodBridge', sub: 'Smart matching', color: 'bg-forest', isCenter: true },
  { icon: Heart, label: 'NGO Partners', sub: 'Distribution network', color: 'bg-forest-light' },
  { icon: Users, label: 'Communities', sub: 'People in need', color: 'bg-forest' },
];

export default function Solution() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-fresh-light/60 to-cream" />
      <GlowParticles count={8} />
      {/* Floating food accents */}
      <motion.div
        className="pointer-events-none absolute left-[3%] top-[15%] hidden overflow-hidden rounded-2xl shadow-food lg:block"
        animate={{ y: [0, -12, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <img src={FOOD.lettuce} alt="" className="h-14 w-14 object-cover" loading="lazy" />
      </motion.div>
      <motion.div
        className="pointer-events-none absolute right-[3%] bottom-[20%] hidden overflow-hidden rounded-2xl shadow-food lg:block"
        animate={{ y: [0, 10, 0], rotate: [0, -6, 0] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      >
        <img src={FOOD.carrots} alt="" className="h-12 w-12 object-cover" loading="lazy" />
      </motion.div>
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="inline-block rounded-full bg-forest/15 px-4 py-1.5 text-sm font-bold uppercase tracking-wider text-forest">
            The FoodBridge Connection
          </span>
          <h2 className="mt-5 text-section font-extrabold tracking-tight text-dark text-balance">
            One Platform. A Thousand Reasons to Share.
          </h2>
        </Reveal>

        {/* Desktop horizontal flow */}
        <div ref={ref} className="mt-16 hidden items-center justify-between gap-2 lg:flex">
          {NODES.map((node, i) => {
            const Icon = node.icon;
            return (
              <div key={i} className="flex items-center gap-2">
                <motion.div
                  initial={{ opacity: 0, y: 40, scale: 0.8 }}
                  animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
                  transition={{ delay: 0.3 + i * 0.25, duration: 0.7, ease: easeOutExpo }}
                  className="flex flex-col items-center"
                >
                  <motion.div
                    whileHover={{ scale: 1.12, rotate: 5 }}
                    className={`relative flex items-center justify-center rounded-3xl ${node.color} ${
                      node.isCenter ? 'h-32 w-32 shadow-float' : 'h-24 w-24 shadow-premium'
                    }`}
                  >
                    <Icon className={`text-cream ${node.isCenter ? 'h-12 w-12' : 'h-9 w-9'}`} />
                    {node.isCenter && (
                      <motion.div
                        className="absolute inset-0 rounded-3xl border-2 border-forest/30"
                        animate={{ scale: [1, 1.3], opacity: [0.6, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                      />
                    )}
                  </motion.div>
                  <div className="mt-4 text-center">
                    <div className="text-base font-extrabold text-dark">{node.label}</div>
                    <div className="text-sm text-dark/50">{node.sub}</div>
                  </div>
                </motion.div>

                {i < NODES.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={inView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: 0.6 + i * 0.25, duration: 0.5 }}
                    className="mt-[-2rem] text-forest/50"
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile vertical flow */}
        <div className="mt-12 flex flex-col items-center gap-6 lg:hidden">
          {NODES.map((node, i) => {
            const Icon = node.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                className="flex w-full max-w-xs items-center gap-4 rounded-2xl bg-white p-4 shadow-premium"
              >
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${node.color}`}>
                  <Icon className="h-7 w-7 text-cream" />
                </div>
                <div>
                  <div className="font-extrabold text-dark">{node.label}</div>
                  <div className="text-sm text-dark/50">{node.sub}</div>
                </div>
                {node.isCenter && (
                  <span className="ml-auto rounded-full bg-forest/10 px-2 py-1 text-xs font-bold text-forest">Core</span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
