import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, ChevronLeft, ChevronRight, Pause, Play, X, MapPin, ArrowRight, Heart } from 'lucide-react';
import { TESTIMONIALS, Testimonial } from '@/lib/data';
import { easeOutExpo } from '@/lib/animations';
import Reveal from './Reveal';
import { BottomSheetHandle, SPRING_TAP, SPRING_SHEET } from '@/lib/springs';

export default function Stories() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [detailStory, setDetailStory] = useState<Testimonial | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const next = useCallback(() => setIndex((i) => (i + 1) % TESTIMONIALS.length), []);
  const prev = () => setIndex((i) => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(next, 6000);
    return () => clearInterval(timerRef.current);
  }, [paused, next]);

  const story = TESTIMONIALS[index];

  return (
    <section id="stories" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="inline-block rounded-full bg-orange/15 px-4 py-1.5 text-sm font-bold uppercase tracking-wider text-orange-dark">
            Community Stories
          </span>
          <h2 className="mt-5 text-section font-extrabold tracking-tight text-dark text-balance">
            Real People. Shared Purpose. Bigger Impact.
          </h2>
          <p className="mt-4 text-dark/60">
            Sample testimonials — illustrative stories for this prototype.
          </p>
        </Reveal>

        <div
          className="relative mx-auto mt-14 max-w-4xl"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={story.id}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.6, ease: easeOutExpo }}
              className="overflow-hidden rounded-5xl bg-white shadow-float"
            >
              <div className="grid md:grid-cols-5">
                {/* Image */}
                <div className="relative h-72 md:col-span-2 md:h-auto">
                  <img src={story.image} alt={story.name} className="h-full w-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark/40 to-transparent md:bg-gradient-to-r" />
                  <div className="absolute bottom-4 left-4 rounded-full bg-orange px-3 py-1 text-xs font-bold text-white">
                    {story.highlight}
                  </div>
                </div>

                {/* Content */}
                <div className="relative flex flex-col justify-center p-8 md:col-span-3 md:p-12">
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-fresh/40"
                  >
                    <Quote className="h-6 w-6 text-forest" />
                  </motion.div>

                  <p className="text-lg font-semibold leading-relaxed text-dark sm:text-xl">
                    "{story.quote}"
                  </p>

                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-extrabold text-dark">{story.name}</div>
                        <div className="text-sm text-dark/50">{story.role} · {story.location}</div>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setDetailStory(story)}
                      className="flex items-center gap-1.5 rounded-full bg-forest/10 px-4 py-2 text-sm font-bold text-forest transition hover:bg-forest hover:text-cream"
                    >
                      Read Full Story <ArrowRight className="h-4 w-4" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              onClick={prev}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-forest shadow-premium transition hover:bg-forest hover:text-cream"
              aria-label="Previous story"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: i === index ? 28 : 8,
                    backgroundColor: i === index ? '#176B45' : 'rgba(23,107,69,0.25)',
                  }}
                  aria-label={`Go to story ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-forest shadow-premium transition hover:bg-forest hover:text-cream"
              aria-label="Next story"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <button
              onClick={() => setPaused(!paused)}
              className="ml-2 flex h-11 w-11 items-center justify-center rounded-full bg-white text-forest shadow-premium transition hover:bg-forest hover:text-cream"
              aria-label={paused ? 'Play' : 'Pause'}
            >
              {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Story detail popup */}
      <AnimatePresence>
        {detailStory && (
          <StoryDetailModal story={detailStory} onClose={() => setDetailStory(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}

function StoryDetailModal({ story, onClose }: { story: Testimonial; onClose: () => void }) {
  const [isMobile, setIsMobile] = useState(false);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => { document.body.style.overflow = ''; window.removeEventListener('resize', check); };
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const entrance = isMobile
    ? { initial: { opacity: 0, y: '100%' }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: '100%' } }
    : { initial: { opacity: 0, scale: 0.9, rotateX: -6, y: 30 }, animate: { opacity: 1, scale: 1, rotateX: 0, y: 0 }, exit: { opacity: 0, scale: 0.92, y: 30 } };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={handleBackdrop}
      className={`fixed inset-0 z-[85] flex p-4 ${isMobile ? 'items-end' : 'items-center justify-center'}`}
    >
      <div className="absolute inset-0 bg-dark/50 backdrop-blur-md" />

      <motion.div
        {...entrance}
        transition={isMobile ? { ...SPRING_SHEET } : { type: 'spring', stiffness: 260, damping: 24 }}
        style={!isMobile ? { transformPerspective: 1000 } : {}}
        className={`relative z-10 w-full overflow-hidden bg-cream shadow-float ${isMobile ? 'max-h-[92vh] rounded-t-4xl' : 'max-h-[90vh] max-w-2xl overflow-y-auto rounded-4xl'}`}
      >
        {isMobile && <BottomSheetHandle />}
        {/* Header image with overlay */}
        <div className="relative h-48 overflow-hidden sm:h-64">
          <motion.img
            src={story.image}
            alt={story.name}
            className="h-full w-full object-cover"
            initial={{ scale: 1.15 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.2, ease: easeOutExpo }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark/70 to-transparent" />

          <button
            onClick={onClose}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur transition hover:bg-white/30"
            aria-label="Close story"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Name overlay at bottom of image */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="absolute bottom-4 left-5"
          >
            <h3 className="text-2xl font-extrabold text-white">{story.name}</h3>
            <p className="flex items-center gap-1.5 text-sm text-white/80">
              <MapPin className="h-3.5 w-3.5" /> {story.role} · {story.location}
            </p>
          </motion.div>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8">
          {/* Highlight badge */}
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.25, type: 'spring', stiffness: 200 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full bg-orange/15 px-4 py-2 text-sm font-bold text-orange-dark"
          >
            <Heart className="h-4 w-4" /> {story.highlight}
          </motion.div>

          {/* Full quote */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative rounded-3xl bg-white p-6 shadow-premium"
          >
            <Quote className="absolute -top-3 -left-1 h-8 w-8 text-forest/20" />
            <p className="text-lg font-semibold leading-relaxed text-dark">
              "{story.quote}"
            </p>
          </motion.div>

          {/* Like button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 flex items-center justify-between"
          >
            <button
              onClick={() => setLiked(!liked)}
              className="flex items-center gap-2 rounded-full bg-dark/5 px-5 py-2.5 text-sm font-bold text-dark/70 transition hover:bg-dark/10"
            >
              <motion.span
                animate={liked ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <Heart className={`h-5 w-5 ${liked ? 'fill-orange text-orange' : 'text-dark/40'}`} />
              </motion.span>
              {liked ? 'Inspiring!' : 'Inspire me'}
            </button>

            <button
              onClick={onClose}
              className="flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-bold text-cream"
            >
              Close <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>

          {/* Prototype note */}
          <p className="mt-4 text-center text-xs text-dark/35">
            Illustrative testimonial for prototype demonstration.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
