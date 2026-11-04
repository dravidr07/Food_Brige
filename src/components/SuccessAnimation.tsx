import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';

export function SuccessCheckmark({ size = 80 }: { size?: number }) {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -30 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* Glow rings */}
      <motion.div
        className="absolute inset-0 rounded-full bg-fresh/40"
        animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
      />
      <motion.div
        className="absolute inset-0 rounded-full bg-fresh/30"
        animate={{ scale: [1, 1.6], opacity: [0.4, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut', delay: 0.3 }}
      />
      {/* Main circle */}
      <div className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-fresh to-forest-light shadow-lg">
        <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 52 52" fill="none">
          <motion.path
            d="M14 27 L22 35 L38 17"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>
      </div>
      {/* Floating leaves */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute"
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0.8],
            x: [0, (i - 1) * 40],
            y: [0, -50 - i * 20],
            rotate: [0, i * 120],
          }}
          transition={{ duration: 1.5, delay: 0.3 + i * 0.2, ease: 'easeOut' }}
        >
          <Leaf className="h-4 w-4 text-forest" />
        </motion.div>
      ))}
    </motion.div>
  );
}

export function FloatingFoodIcons() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute text-forest/10"
          style={{
            left: `${15 + i * 25}%`,
            top: `${10 + (i % 2) * 70}%`,
          }}
          animate={{
            y: [0, -15, 0],
            rotate: [0, 10, -5, 0],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.5,
          }}
        >
          <Leaf className="h-8 w-8" />
        </motion.div>
      ))}
    </div>
  );
}
