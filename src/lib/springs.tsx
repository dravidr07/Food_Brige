import { motion } from 'framer-motion';

export const SPRING_TAP = { type: 'spring' as const, stiffness: 400, damping: 18, mass: 0.8 };
export const SPRING_BOUNCE = { type: 'spring' as const, stiffness: 180, damping: 18, mass: 0.8 };
export const SPRING_CARD = { type: 'spring' as const, stiffness: 300, damping: 22, mass: 0.8 };
export const SPRING_SHEET = { type: 'spring' as const, stiffness: 300, damping: 30 };

export const TAP_SCALE = { scale: 0.95 };
export const TAP_SCALE_LIGHT = { scale: 0.97 };

export function BottomSheetHandle() {
  return (
    <motion.div
      className="flex justify-center pt-3 pb-1"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <div className="h-1.5 w-10 rounded-full bg-dark/20" />
    </motion.div>
  );
}
