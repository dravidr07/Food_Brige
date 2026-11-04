import { motion, useScroll, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Utensils, Search, Truck, Heart, Sparkles } from 'lucide-react';
import { STEPS, FOOD } from '@/lib/data';
import { easeOutExpo } from '@/lib/animations';
import Reveal from './Reveal';
import { GlowParticles } from './FoodDecorations';

const ICONS: Record<string, typeof Utensils> = {
  Utensils, Search, Truck, Heart,
};

const STEP_FOOD = [FOOD.fruitBowl, FOOD.tomatoes, FOOD.vegMarket, FOOD.breakfast];

export default function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const journeyRef = useRef<HTMLDivElement>(null);
  const inView = useInView(journeyRef, { once: true, margin: '-40px' });
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start 70%', 'end 60%'] });

  return (
    <section id="how-it-works" ref={sectionRef} className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="inline-block rounded-full bg-orange/15 px-4 py-1.5 text-sm font-bold uppercase tracking-wider text-orange-dark">
            How It Works
          </span>
          <h2 className="mt-5 text-section font-extrabold tracking-tight text-dark text-balance">
            Four Simple Steps. One Powerful Impact.
          </h2>
        </Reveal>

        {/* Animated donation journey visualization */}
        <Reveal delay={0.1} className="mt-14">
          <div ref={journeyRef} className="relative overflow-hidden rounded-5xl bg-gradient-to-br from-cream-dark to-fresh-light/40 p-6 shadow-premium sm:p-10">
            <GlowParticles count={10} />

            {/* Animated path line */}
            <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
              <motion.path
                d="M10,50 Q30,20 50,50 T90,50"
                fill="none"
                stroke="rgba(23,107,69,0.15)"
                strokeWidth="0.5"
                strokeDasharray="2 2"
                initial={{ pathLength: 0 }}
                animate={inView ? { pathLength: 1 } : {}}
                transition={{ duration: 2, ease: easeOutExpo }}
              />
              <motion.path
                d="M10,50 Q30,20 50,50 T90,50"
                fill="none"
                stroke="#FF9254"
                strokeWidth="0.8"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={inView ? { pathLength: 1 } : {}}
                transition={{ duration: 2.5, delay: 0.3, ease: easeOutExpo }}
              />
            </svg>

            <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
              {STEPS.map((step, i) => {
                const Icon = ICONS[step.icon];
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 40, rotate: -5 }}
                    animate={inView ? { opacity: 1, y: 0, rotate: 0 } : {}}
                    transition={{ delay: 0.3 + i * 0.3, duration: 0.7, ease: easeOutExpo }}
                    className="flex flex-col items-center text-center"
                  >
                    {/* Food image circle */}
                    <motion.div
                      className="relative mb-3 h-20 w-20 overflow-hidden rounded-full border-4 border-cream shadow-food sm:h-24 sm:w-24"
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
                    >
                      <img src={STEP_FOOD[i]} alt="" className="h-full w-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-dark/30 to-transparent" />
                      <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
                      >
                        <Icon className="h-8 w-8 text-white drop-shadow-lg" />
                      </motion.div>
                    </motion.div>

                    {/* Step number badge */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={inView ? { scale: 1 } : {}}
                      transition={{ delay: 0.5 + i * 0.3, type: 'spring', stiffness: 300 }}
                      className="mb-2 flex h-7 w-7 items-center justify-center rounded-full bg-orange text-xs font-extrabold text-white shadow-md"
                    >
                      {step.number}
                    </motion.div>

                    <h3 className="text-sm font-extrabold text-dark sm:text-base">{step.title}</h3>
                    <p className="mt-1 text-xs text-dark/55 sm:text-sm">{step.description}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* Animated celebration at the end */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 1.8, type: 'spring', stiffness: 200 }}
              className="mt-6 flex items-center justify-center gap-2 rounded-full bg-forest/10 py-3"
            >
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="h-5 w-5 text-orange" />
              </motion.div>
              <span className="text-sm font-bold text-forest">Meals shared, smiles created</span>
              <motion.div
                animate={{ rotate: [0, -15, 15, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              >
                <Sparkles className="h-5 w-5 text-forest" />
              </motion.div>
            </motion.div>
          </div>
        </Reveal>

        {/* Step cards */}
        <div className="relative mt-12">
          {/* Animated connecting line (desktop) */}
          <div className="absolute left-1/2 top-0 hidden -translate-x-1/2 lg:block">
            <div className="relative h-full w-1">
              <div className="absolute inset-0 rounded-full bg-fresh" />
              <motion.div
                className="absolute left-0 top-0 w-1 rounded-full bg-gradient-to-b from-orange to-forest"
                style={{ scaleY: scrollYProgress, transformOrigin: 'top', height: '100%' }}
              />
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {STEPS.map((step, i) => {
              const Icon = ICONS[step.icon];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 50, rotate: i % 2 === 0 ? -3 : 3 }}
                  whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ delay: i * 0.15, duration: 0.7, ease: easeOutExpo }}
                  className="group relative"
                >
                  <motion.div
                    whileHover={{ y: -10, rotate: i % 2 === 0 ? 1 : -1 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 22, mass: 0.8 }}
                    className="glow-border relative h-full overflow-hidden rounded-4xl bg-white p-7 shadow-premium"
                  >
                    {/* Number */}
                    <div className="flex items-center justify-between">
                      <span className="text-5xl font-extrabold text-fresh transition-colors group-hover:text-orange">
                        {step.number}
                      </span>
                      <motion.div
                        whileHover={{ rotate: 15, scale: 1.1 }}
                        className="flex h-12 w-12 items-center justify-center rounded-2xl bg-forest/10 text-forest transition-colors group-hover:bg-forest group-hover:text-cream"
                      >
                        <Icon className="h-6 w-6" />
                      </motion.div>
                    </div>

                    <h3 className="mt-6 text-xl font-extrabold text-dark">{step.title}</h3>
                    <p className="mt-2 text-dark/60">{step.description}</p>

                    {/* Progress dot on the line */}
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.15, type: 'spring', stiffness: 300 }}
                      className="absolute -top-2 left-1/2 hidden h-4 w-4 -translate-x-1/2 rounded-full border-4 border-cream bg-orange lg:block"
                    />
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
