import { useRef, useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { FOOD } from '@/lib/data';

export interface FloatingFoodItem {
  src: string;
  size: number;
  top: string;
  left: string;
  duration: number;
  rotateDuration: number;
  delay: number;
  parallaxDepth: number;
}

export function FloatingFood({ items, className = '' }: { items: FloatingFoodItem[]; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const handleMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      mouseX.set((e.clientX - cx) / rect.width);
      mouseY.set((e.clientY - cy) / rect.height);
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [mouseX, mouseY, reduced]);

  if (reduced) return null;

  return (
    <div ref={containerRef} className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {items.map((item, i) => {
        const px = useSpring(mouseX, { stiffness: 50 + item.parallaxDepth * 30, damping: 20 });
        const py = useSpring(mouseY, { stiffness: 50 + item.parallaxDepth * 30, damping: 20 });
        const x = useTransform(px, [-0.5, 0.5], [-item.parallaxDepth * 40, item.parallaxDepth * 40]);
        const y = useTransform(py, [-0.5, 0.5], [-item.parallaxDepth * 40, item.parallaxDepth * 40]);

        return (
          <motion.div
            key={i}
            style={{ x, y }}
            className="absolute"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: item.delay, duration: 0.8, type: 'spring', stiffness: 120 }}
          >
            <motion.div
              animate={{ y: [0, -16, 0] }}
              transition={{ duration: item.duration, repeat: Infinity, ease: 'easeInOut', delay: item.delay }}
              className="relative"
              style={{ top: item.top, left: item.left }}
            >
              <motion.div
                animate={{ rotate: [0, 8, -5, 0] }}
                transition={{ duration: item.rotateDuration, repeat: Infinity, ease: 'easeInOut' }}
                className="relative"
              >
                <div
                  className="overflow-hidden rounded-3xl shadow-food"
                  style={{ width: item.size, height: item.size }}
                >
                  <img src={item.src} alt="" className="h-full w-full object-cover" loading="lazy" />
                </div>
                <div
                  className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-dark/10 blur-md"
                  style={{ width: item.size * 0.6, height: 8 }}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}

export const HERO_FOOD: FloatingFoodItem[] = [
  { src: FOOD.tomatoes, size: 72, top: '8%', left: '5%', duration: 5, rotateDuration: 14, delay: 1.0, parallaxDepth: 1.5 },
  { src: FOOD.lettuce, size: 64, top: '70%', left: '12%', duration: 6, rotateDuration: 16, delay: 1.3, parallaxDepth: 1.0 },
  { src: FOOD.bread, size: 80, top: '15%', left: '82%', duration: 5.5, rotateDuration: 12, delay: 1.1, parallaxDepth: 1.8 },
  { src: FOOD.carrots, size: 56, top: '78%', left: '75%', duration: 7, rotateDuration: 18, delay: 1.5, parallaxDepth: 0.8 },
  { src: FOOD.fruitBowl, size: 68, top: '45%', left: '88%', duration: 6.5, rotateDuration: 15, delay: 1.2, parallaxDepth: 1.3 },
  { src: FOOD.berries, size: 52, top: '50%', left: '3%', duration: 8, rotateDuration: 20, delay: 1.4, parallaxDepth: 0.6 },
];

export const SECTION_FOOD: FloatingFoodItem[] = [
  { src: FOOD.tomatoes, size: 48, top: '10%', left: '90%', duration: 6, rotateDuration: 16, delay: 0.3, parallaxDepth: 0.5 },
  { src: FOOD.lettuce, size: 42, top: '75%', left: '5%', duration: 7, rotateDuration: 18, delay: 0.5, parallaxDepth: 0.4 },
];

export const MOBILE_HERO_FOOD: FloatingFoodItem[] = [
  { src: FOOD.tomatoes, size: 44, top: '4%', left: '2%', duration: 5, rotateDuration: 14, delay: 1.0, parallaxDepth: 0.8 },
  { src: FOOD.lettuce, size: 38, top: '82%', left: '4%', duration: 6, rotateDuration: 16, delay: 1.2, parallaxDepth: 0.6 },
  { src: FOOD.berries, size: 34, top: '8%', left: '78%', duration: 5.5, rotateDuration: 15, delay: 1.1, parallaxDepth: 0.7 },
  { src: FOOD.carrots, size: 36, top: '85%', left: '72%', duration: 7, rotateDuration: 18, delay: 1.3, parallaxDepth: 0.5 },
];
