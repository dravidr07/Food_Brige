import { useEffect, useRef, useState } from 'react';

/** Counts up to `target` when the element scrolls into view. Respects reduced motion. */
export function useCountUp<T extends HTMLElement = HTMLDivElement>(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<T | null>(null);
  const started = useRef(false);

  useEffect(() => {
    started.current = false;
    setCount(0);

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setCount(target);
      return;
    }

    const el = ref.current;
    if (!el) {
      // No ref attached — animate immediately on mount
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        setCount(Math.round(eased * target));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started.current) {
            started.current = true;
            const start = performance.now();
            const tick = (now: number) => {
              const progress = Math.min((now - start) / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 4);
              setCount(Math.round(eased * target));
              if (progress < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }
        });
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}
