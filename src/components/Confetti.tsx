import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  delay: number;
  shape: 'rect' | 'circle' | 'leaf';
}

const COLORS = ['#FF9254', '#176B45', '#1E8354', '#B8E3C5', '#FFB084', '#E6753C'];

export function useConfetti() {
  const [particles, setParticles] = useState<Particle[]>([]);

  const fire = useCallback((count = 40) => {
    const newParticles: Particle[] = Array.from({ length: count }).map((_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 400,
      y: -(Math.random() * 300 + 100),
      rotation: Math.random() * 720 - 360,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 0.3,
      shape: i % 3 === 0 ? 'leaf' : i % 2 === 0 ? 'circle' : 'rect',
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 2500);
  }, []);

  return { particles, fire };
}

export function ConfettiOverlay({ particles }: { particles: Particle[] }) {
  if (particles.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
          animate={{ x: p.x, y: p.y, opacity: 0, rotate: p.rotation, scale: 0.5 }}
          transition={{ duration: 1.8, delay: p.delay, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute"
        >
          {p.shape === 'leaf' ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill={p.color}>
              <path d="M12 2C8 6 4 10 4 14c0 4 3 8 8 8s8-4 8-8c0-4-4-8-8-12z" />
            </svg>
          ) : p.shape === 'circle' ? (
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: p.color }} />
          ) : (
            <div className="h-2.5 w-4 rounded-sm" style={{ backgroundColor: p.color }} />
          )}
        </motion.div>
      ))}
    </div>
  );
}
