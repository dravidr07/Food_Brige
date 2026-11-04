import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';

export function FallingLeaves({ count = 6, className = '' }: { count?: number; className?: string }) {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  const leaves = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: `${(i / count) * 100 + Math.random() * 10}%`,
        delay: Math.random() * 8,
        duration: 12 + Math.random() * 10,
        size: 12 + Math.random() * 10,
        opacity: 0.15 + Math.random() * 0.15,
      })),
    [count],
  );

  if (reduced) return null;

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {leaves.map((leaf) => (
        <motion.svg
          key={leaf.id}
          width={leaf.size}
          height={leaf.size}
          viewBox="0 0 24 24"
          fill="none"
          className="absolute top-0"
          style={{ left: leaf.left, opacity: leaf.opacity }}
          animate={{ y: ['-5vh', '110vh'], x: [0, 30, -15, 25], rotate: [0, 180, 360] }}
          transition={{
            duration: leaf.duration,
            repeat: Infinity,
            delay: leaf.delay,
            ease: 'linear',
          }}
        >
          <path
            d="M12 2C8 6 4 10 4 14c0 4 3 8 8 8s8-4 8-8c0-4-4-8-8-12z"
            fill="#176B45"
          />
          <path d="M12 4v16" stroke="#0F4A2F" strokeWidth="0.8" strokeLinecap="round" />
        </motion.svg>
      ))}
    </div>
  );
}

export function GlowParticles({ count = 12, className = '' }: { count?: number; className?: string }) {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  const particles = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: 3 + Math.random() * 6,
        delay: Math.random() * 4,
        duration: 3 + Math.random() * 4,
        color: Math.random() > 0.5 ? '#FF9254' : '#B8E3C5',
      })),
    [count],
  );

  if (reduced) return null;

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            filter: 'blur(1px)',
          }}
          animate={{
            opacity: [0, 0.5, 0],
            scale: [0, 1.2, 0],
            y: [0, -30, -60],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

export function BlobBackground({ className = '', color = 'bg-fresh/30' }: { className?: string; color?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`}>
      <div
        className={`animate-blob absolute -left-20 top-1/4 h-80 w-80 ${color} blur-3xl`}
      />
      <div
        className={`animate-blob absolute -right-20 bottom-1/4 h-96 w-96 ${color} blur-3xl`}
        style={{ animationDelay: '4s' }}
      />
    </div>
  );
}
