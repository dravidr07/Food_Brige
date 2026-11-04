import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { IMAGES, FOOD } from '@/lib/data';
import { useCountUp } from '@/lib/useCountUp';
import { easeOutExpo } from '@/lib/animations';
import Reveal from './Reveal';
import { BlobBackground, GlowParticles } from './FoodDecorations';

function StatCard({
  value,
  suffix,
  label,
  image,
  alt,
  reverse,
}: {
  value: number;
  suffix: string;
  label: string;
  image: string;
  alt: string;
  reverse?: boolean;
}) {
  const { count, ref } = useCountUp(value);
  const imgRef = useRef(null);
  const inView = useInView(imgRef, { once: true, margin: '-60px' });

  return (
    <div ref={ref} className={`flex flex-col gap-5 ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} lg:items-center`}>
      <motion.div
        ref={imgRef}
        initial={{ clipPath: 'inset(100% 0 0 0)', opacity: 0 }}
        animate={inView ? { clipPath: 'inset(0% 0 0 0)', opacity: 1 } : {}}
        transition={{ duration: 1.1, ease: easeOutExpo }}
        className="relative h-72 w-full overflow-hidden rounded-4xl shadow-premium lg:h-80 lg:w-1/2"
      >
        <img src={image} alt={alt} className="h-full w-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark/50 to-transparent" />
        <div className="absolute bottom-4 left-4 rounded-2xl glass px-4 py-2">
          <span className="text-2xl font-extrabold text-dark">{count.toLocaleString()}{suffix}</span>
        </div>
      </motion.div>

      <div className="lg:w-1/2">
        <div className="text-5xl font-extrabold text-dark sm:text-6xl">
          {count.toLocaleString()}
          <span className="text-orange">{suffix}</span>
        </div>
        <p className="mt-3 text-lg font-semibold text-dark/80">{label}</p>
      </div>
    </div>
  );
}

export default function Problem() {
  return (
    <section id="mission" className="relative py-24 sm:py-32">
      <BlobBackground color="bg-fresh/20" />
      <GlowParticles count={8} />
      {/* Floating food accents */}
      <motion.div
        className="pointer-events-none absolute right-[5%] top-[20%] hidden overflow-hidden rounded-2xl shadow-food lg:block"
        animate={{ y: [0, -14, 0], rotate: [0, 6, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <img src={FOOD.tomatoes} alt="" className="h-16 w-16 object-cover" loading="lazy" />
      </motion.div>
      <motion.div
        className="pointer-events-none absolute left-[4%] bottom-[15%] hidden overflow-hidden rounded-2xl shadow-food lg:block"
        animate={{ y: [0, 12, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      >
        <img src={FOOD.bread} alt="" className="h-14 w-14 object-cover" loading="lazy" />
      </motion.div>
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="inline-block rounded-full bg-orange/15 px-4 py-1.5 text-sm font-bold uppercase tracking-wider text-orange-dark">
            The Reality
          </span>
          <h2 className="mt-5 text-section font-extrabold tracking-tight text-dark text-balance">
            Too Much Food Is Wasted. Too Many People Go Hungry.
          </h2>
        </Reveal>

        <div className="mt-16 space-y-20 sm:mt-24 sm:space-y-28">
          <StatCard
            value={931}
            suffix="M"
            label="tonnes of food wasted globally each year — enough to feed billions."
            image={IMAGES.fridgeWaste}
            alt="Food waste in a refrigerator"
          />
          <StatCard
            value={783}
            suffix="M"
            label="people face chronic hunger worldwide, while surplus food fills landfills."
            image={IMAGES.freshVeg}
            alt="Fresh vegetables in containers"
            reverse
          />
        </div>

        <Reveal delay={0.2} className="mx-auto mt-24 max-w-2xl text-center">
          <div className="rounded-4xl bg-gradient-to-br from-forest to-forest-dark px-8 py-12 shadow-float sm:px-12">
            <p className="text-2xl font-bold leading-snug text-cream sm:text-3xl text-balance">
              What if the food we throw away could become someone's most important meal?
            </p>
            <p className="mt-4 text-sm font-medium uppercase tracking-wider text-fresh/70">
              Illustrative figures based on widely reported global estimates
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
