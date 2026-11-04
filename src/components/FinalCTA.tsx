import { motion } from 'framer-motion';
import { ArrowRight, Handshake, HeartHandshake, Sparkles } from 'lucide-react';
import { easeOutExpo, staggerContainer, wordReveal } from '@/lib/animations';

const WORDS = ['Your', 'Extra', 'Food', 'Can', 'Become', "Someone's", 'Next', 'Meal.'];

export default function FinalCTA({
  onDonate,
  onPartner,
  onVolunteer,
}: {
  onDonate: () => void;
  onPartner: () => void;
  onVolunteer: () => void;
}) {
  const buttons = [
    { label: 'Start Donating', icon: ArrowRight, action: onDonate, primary: true },
    { label: 'Become a Partner', icon: Handshake, action: onPartner, primary: false },
    { label: 'Volunteer With Us', icon: HeartHandshake, action: onVolunteer, primary: false },
  ];

  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-forest via-forest to-forest-dark" />
      {/* Animated gradient overlay */}
      <motion.div
        className="absolute inset-0 -z-10 opacity-30"
        style={{
          background: 'linear-gradient(120deg, #FF9254, #B8E3C5, #FF9254)',
          backgroundSize: '200% 200%',
        }}
        animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Floating decorative leaves */}
      <motion.div
        className="absolute left-10 top-10 text-fresh/20"
        animate={{ y: [0, -20, 0], rotate: [0, 15, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
      >
        <Sparkles className="h-12 w-12" />
      </motion.div>
      <motion.div
        className="absolute right-16 bottom-12 text-orange/30"
        animate={{ y: [0, 15, 0], rotate: [0, -12, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      >
        <Sparkles className="h-16 w-16" />
      </motion.div>

      <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
        <motion.h2
          className="text-[clamp(2.2rem,6vw,4.5rem)] font-extrabold leading-[1.05] tracking-tight text-cream text-balance"
          variants={staggerContainer(0.1, 0.2)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {WORDS.map((word, i) => (
            <span key={i} className="mr-[0.25em] inline-block overflow-hidden align-bottom">
              <motion.span className="inline-block" variants={wordReveal}>
                {word}
              </motion.span>
            </span>
          ))}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.7, ease: easeOutExpo }}
          className="mx-auto mt-6 max-w-xl text-lg text-fresh/80"
        >
          Be part of a community that believes no good food should go to waste.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.7, ease: easeOutExpo }}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          {buttons.map((btn, i) => {
            const Icon = btn.icon;
            return (
              <motion.button
                key={i}
                onClick={btn.action}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.93 }}
                transition={{ type: 'spring', stiffness: 400, damping: 18, mass: 0.8 }}
                className={`group flex items-center gap-2 rounded-full px-7 py-4 text-base font-bold shadow-lg transition ${
                  btn.primary
                    ? 'bg-orange text-white shadow-orange/30 hover:bg-orange-light'
                    : 'bg-cream/10 text-cream border border-cream/30 backdrop-blur hover:bg-cream/20'
                }`}
              >
                {btn.label}
                <Icon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </motion.button>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
