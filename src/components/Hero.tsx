import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { ArrowRight, Heart, Sparkles, TrendingUp, Users } from 'lucide-react';
import { IMAGES } from '@/lib/data';
import { staggerContainer, wordReveal, easeOutExpo } from '@/lib/animations';
import { FloatingFood, HERO_FOOD, MOBILE_HERO_FOOD } from './FloatingFood';
import { FallingLeaves, GlowParticles } from './FoodDecorations';

const HEADLINE = ['Good', 'Food', 'Deserves', 'a'];

export default function Hero({ onDonate, onMission }: { onDonate: () => void; onMission: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const yImages = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const yCards = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const floatingCards = [
    { icon: Heart, label: 'Meals Rescued', value: '12,500+', color: 'bg-orange', delay: 0.8 },
    { icon: Users, label: 'Food Donors', value: '850+', color: 'bg-forest', delay: 1.0 },
    { icon: TrendingUp, label: 'NGO Partners', value: '120+', color: 'bg-forest-light', delay: 1.2 },
  ];

  return (
    <section id="home" ref={ref} className="relative min-h-screen overflow-hidden pt-28 pb-16 sm:pt-32">
      {/* Animated gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-cream via-cream to-fresh-light" />
        <motion.div
          className="absolute -left-32 top-20 h-[28rem] w-[28rem] rounded-full bg-fresh/40 blur-3xl"
          animate={{ x: [0, 60, 0], y: [0, 40, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -right-32 bottom-10 h-[32rem] w-[32rem] rounded-full bg-orange/15 blur-3xl"
          animate={{ x: [0, -50, 0], y: [0, -30, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="absolute inset-0 bg-grid opacity-60" />
      </div>

      {/* Falling leaves — fewer on mobile */}
      <FallingLeaves count={3} className="lg:hidden" />
      <FallingLeaves count={5} className="hidden lg:block" />

      {/* Glowing particles — fewer on mobile */}
      <GlowParticles count={8} className="lg:hidden" />
      <GlowParticles count={14} className="hidden lg:block" />

      {/* Floating food elements — mobile + desktop */}
      {mounted && <FloatingFood items={MOBILE_HERO_FOOD} className="lg:hidden" />}
      {mounted && <FloatingFood items={HERO_FOOD} className="hidden lg:block" />}

      {/* Decorative rotating sparkles */}
      <motion.div
        className="absolute left-8 top-1/3 hidden text-forest/15 lg:block"
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      >
        <Sparkles className="h-16 w-16" />
      </motion.div>
      <motion.div
        className="absolute right-12 top-1/2 hidden text-orange/20 lg:block"
        animate={{ rotate: -360 }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
      >
        <Sparkles className="h-10 w-10" />
      </motion.div>

      <motion.div style={{ opacity }} className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-8">
          {/* Left — headline */}
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: easeOutExpo }}
              className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-forest shadow-sm backdrop-blur"
            >
              <span className="flex h-2 w-2 animate-pulse rounded-full bg-orange" />
              Turning Surplus Into Smiles
            </motion.div>

            <h1 className="font-display text-[clamp(2.8rem,7vw,5.5rem)] font-extrabold leading-[1] tracking-tight text-dark">
              <motion.span
                className="block overflow-hidden"
                variants={staggerContainer(0.12, 0.3)}
                initial="hidden"
                animate="visible"
              >
                {HEADLINE.map((word, i) => (
                  <span key={i} className="mr-[0.25em] inline-block overflow-hidden align-bottom">
                    <motion.span className="inline-block" variants={wordReveal}>
                      {word}
                    </motion.span>
                  </span>
                ))}
              </motion.span>

              <motion.span
                className="block overflow-hidden"
                variants={staggerContainer(0.12, 0.7)}
                initial="hidden"
                animate="visible"
              >
                <span className="mr-[0.25em] inline-block overflow-hidden align-bottom">
                  <motion.span className="inline-block gradient-text font-extrabold" variants={wordReveal}>
                    Second
                  </motion.span>
                </span>
                <span className="inline-block overflow-hidden align-bottom">
                  <motion.span className="inline-block gradient-text font-extrabold" variants={wordReveal}>
                    Chance.
                  </motion.span>
                </span>
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.7, ease: easeOutExpo }}
              className="mt-6 max-w-md text-lg text-dark/70 sm:text-xl"
            >
              Connecting surplus food with people who need it. One donation, one meal, one meaningful difference at a time.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.7, ease: easeOutExpo }}
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <motion.button
                onClick={onDonate}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.93 }}
                transition={{ type: 'spring', stiffness: 400, damping: 18, mass: 0.8 }}
                className="group flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange to-orange-dark px-7 py-4 text-base font-bold text-white shadow-xl shadow-orange/30"
              >
                Donate Food
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1.5" />
              </motion.button>

              <motion.button
                onClick={onMission}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.93 }}
                transition={{ type: 'spring', stiffness: 400, damping: 18, mass: 0.8 }}
                className="flex items-center justify-center gap-2 rounded-full border-2 border-forest/30 bg-white/40 px-7 py-4 text-base font-bold text-forest backdrop-blur hover:border-forest hover:bg-white/70"
              >
                Discover Our Mission
              </motion.button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6, duration: 0.6 }}
              className="mt-6 text-xs font-medium uppercase tracking-wider text-dark/40"
            >
              Demo metrics shown — illustrative prototype data
            </motion.p>
          </div>

          {/* Right — image composition */}
          <motion.div
            style={{ y: yImages }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 1, ease: easeOutExpo }}
            className="relative h-[420px] sm:h-[500px] lg:h-[560px]"
          >
            {/* Main image — circular mask reveal */}
            <motion.div
              initial={{ clipPath: 'circle(0% at 50% 50%)' }}
              animate={{ clipPath: 'circle(100% at 50% 50%)' }}
              transition={{ delay: 0.6, duration: 1.4, ease: easeOutExpo }}
              className="absolute right-0 top-0 h-[78%] w-[72%] overflow-hidden rounded-5xl shadow-float"
            >
              <motion.img
                src={IMAGES.heroVolunteers}
                alt="Volunteers carrying food donation boxes"
                className="h-full w-full object-cover"
                loading="eager"
                animate={{ scale: [1.1, 1] }}
                transition={{ delay: 0.6, duration: 1.8, ease: easeOutExpo }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/20 to-transparent" />
            </motion.div>

            {/* Secondary image */}
            <motion.div
              initial={{ clipPath: 'inset(0 0 100% 0)' }}
              animate={{ clipPath: 'inset(0 0 0% 0)' }}
              transition={{ delay: 0.8, duration: 1.2, ease: easeOutExpo }}
              className="absolute bottom-0 left-0 h-[48%] w-[48%] overflow-hidden rounded-4xl border-4 border-cream shadow-float"
            >
              <motion.img
                src={IMAGES.heroFoodHandoff}
                alt="Hands exchanging a food box"
                className="h-full w-full object-cover"
                loading="eager"
                animate={{ scale: [1.15, 1] }}
                transition={{ delay: 0.8, duration: 1.6, ease: easeOutExpo }}
              />
            </motion.div>

            {/* Floating cards */}
            <motion.div style={{ y: yCards }} className="absolute inset-0">
              {floatingCards.map((card, i) => {
                const Icon = card.icon;
                const positions = [
                  'left-0 top-[18%]',
                  'right-2 top-[55%] sm:right-0',
                  'left-[8%] bottom-[6%]',
                ];
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: card.delay, duration: 0.6, ease: easeOutExpo }}
                    className={`absolute ${positions[i]}`}
                  >
                    <motion.div
                      animate={{ y: [0, -12, 0] }}
                      transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
                      className="flex items-center gap-3 rounded-2xl glass px-4 py-3 shadow-premium"
                    >
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.color}`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-xl font-extrabold leading-none text-dark">{card.value}</div>
                        <div className="text-xs font-medium text-dark/60">{card.label}</div>
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex-col items-center gap-2 hidden sm:flex"
      >
        <span className="text-xs font-semibold uppercase tracking-widest text-dark/40">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="flex h-9 w-5 items-start justify-center rounded-full border-2 border-dark/30 p-1"
        >
          <div className="h-2 w-1 rounded-full bg-orange" />
        </motion.div>
      </motion.div>
    </section>
  );
}
