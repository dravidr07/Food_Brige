import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calculator, ArrowRight, RotateCcw, Utensils, Users, Leaf, Cloud, AlertCircle, Sparkles } from 'lucide-react';
import { useCountUp } from '@/lib/useCountUp';
import { FOOD } from '@/lib/data';
import { easeOutExpo } from '@/lib/animations';
import { BottomSheetHandle, SPRING_TAP, SPRING_SHEET } from '@/lib/springs';
import { computeImpact, parseAmount, DEFAULT_QUANTITY, DEFAULT_UNIT, type Unit } from '@/lib/impact';

function StatCard({ icon: Icon, value, label, color, delay }: { icon: typeof Leaf; value: number; label: string; color: string; delay: number }) {
  const { count } = useCountUp(value, 1200);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 200 }}
      className="rounded-2xl bg-cream/80 p-4 text-center"
    >
      <div className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="text-3xl font-extrabold text-dark tabular-nums">{count.toLocaleString()}</div>
      <div className="mt-1 text-xs font-semibold text-dark/60">{label}</div>
    </motion.div>
  );
}

export default function ImpactPopup({ onClose }: { onClose: () => void }) {
  const [quantity, setQuantity] = useState(DEFAULT_QUANTITY);
  const [unit, setUnit] = useState<Unit>(DEFAULT_UNIT);
  const [showResult, setShowResult] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

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

  const result = useMemo(() => computeImpact(quantity, unit), [quantity, unit]);

  const errorMsg = useMemo(() => {
    if (quantity === '') return '';
    const n = parseAmount(quantity);
    if (Number.isNaN(n)) return 'Please enter a valid number.';
    if (n < 0) return 'Amount cannot be negative.';
    return '';
  }, [quantity]);

  const handleCalculate = () => {
    if (result.valid) setShowResult(true);
  };

  const handleReset = () => {
    setQuantity(DEFAULT_QUANTITY);
    setUnit(DEFAULT_UNIT);
    setShowResult(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && result.valid) {
      e.preventDefault();
      handleCalculate();
    }
  };

  const entrance = isMobile
    ? { initial: { opacity: 0, y: '100%' }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: '100%' } }
    : { initial: { opacity: 0, scale: 0.9, rotateX: -6, y: 30 }, animate: { opacity: 1, scale: 1, rotateX: 0, y: 0 }, exit: { opacity: 0, scale: 0.92, y: 30 } };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleBackdrop}
        className={`fixed inset-0 z-[80] flex p-4 ${isMobile ? 'items-end' : 'items-center justify-center'}`}
      >
        <div className="absolute inset-0 bg-dark/50 backdrop-blur-md" />

        <motion.div
          ref={modalRef}
          {...entrance}
          transition={isMobile ? { ...SPRING_SHEET } : { type: 'spring', stiffness: 260, damping: 24 }}
          style={!isMobile ? { transformPerspective: 1000 } : {}}
          className={`relative z-10 w-full overflow-hidden bg-cream shadow-float ${isMobile ? 'max-h-[92vh] rounded-t-4xl' : 'max-h-[90vh] max-w-md overflow-y-auto rounded-4xl'}`}
        >
          {isMobile && <BottomSheetHandle />}

          {/* Gradient header */}
          <div className="relative overflow-hidden bg-gradient-to-br from-forest to-forest-dark px-6 pb-6 pt-7">
            <motion.div
              className="absolute inset-0 opacity-20"
              style={{ background: 'linear-gradient(120deg, #FF9254, #B8E3C5)', backgroundSize: '200% 200%' }}
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            />

            <button
              onClick={onClose}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-white transition hover:bg-white/25"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className="relative flex items-center gap-3"
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange"
              >
                <Calculator className="h-6 w-6 text-white" />
              </motion.div>
              <div>
                <motion.h3
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-xl font-extrabold text-cream"
                >
                  Calculate Your Impact
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className="text-sm text-fresh/80"
                >
                  See how many meals your surplus food can become
                </motion.p>
              </div>
            </motion.div>

            {[0, 1].map((i) => (
              <motion.div
                key={i}
                className="absolute overflow-hidden rounded-xl opacity-20"
                style={{ right: i === 0 ? '60px' : '20px', top: i === 0 ? '8px' : '50px', width: 28, height: 28 }}
                animate={{ y: [0, -8, 0], rotate: [0, 10, 0] }}
                transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.5 }}
              >
                <img src={i === 0 ? FOOD.berries : FOOD.fruitBowl} alt="" className="h-full w-full object-cover" />
              </motion.div>
            ))}
          </div>

          {/* Body */}
          <div className="max-h-[60vh] overflow-y-auto p-6">
            <label htmlFor="popup-quantity" className="text-sm font-semibold text-dark/80">
              How much surplus food do you have?
            </label>
            <div className="mt-2 flex gap-3">
              <input
                id="popup-quantity"
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                value={quantity}
                onChange={(e) => { setQuantity(e.target.value); setShowResult(false); }}
                onKeyDown={handleKeyDown}
                placeholder="Enter amount"
                aria-label="Food quantity"
                className="flex-1 rounded-xl border border-dark/15 bg-white px-4 py-3 text-sm text-dark placeholder:text-dark/30 focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/15 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <select
                value={unit}
                onChange={(e) => { setUnit(e.target.value as Unit); setShowResult(false); }}
                aria-label="Unit"
                className="rounded-xl border border-dark/15 bg-white px-3 py-3 text-sm text-dark focus:border-forest focus:outline-none"
              >
                <option value="kg">kg</option>
                <option value="lbs">lbs</option>
              </select>
            </div>

            <AnimatePresence>
              {errorMsg && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 flex items-center gap-1.5 text-xs text-orange-dark"
                >
                  <AlertCircle className="h-3.5 w-3.5" /> {errorMsg}
                </motion.p>
              )}
            </AnimatePresence>

            <div className="mt-4 flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                transition={{ ...SPRING_TAP }}
                onClick={handleCalculate}
                disabled={!result.valid}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange to-orange-dark py-3.5 font-bold text-white shadow-lg shadow-orange/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Calculate Impact <ArrowRight className="h-5 w-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ ...SPRING_TAP }}
                onClick={handleReset}
                aria-label="Reset calculator"
                className="flex items-center justify-center gap-2 rounded-full border border-dark/15 px-4 py-3.5 font-semibold text-dark/60 transition hover:bg-dark/5 hover:text-dark"
              >
                <RotateCcw className="h-4 w-4" /> Reset
              </motion.button>
            </div>

            {/* Live preview */}
            {result.valid && !showResult && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3 flex items-center gap-1.5 text-xs text-dark/50"
              >
                <Sparkles className="h-3.5 w-3.5 text-forest" />
                Live preview: ~{result.meals.toLocaleString()} meals, ~{result.people.toLocaleString()} people fed
              </motion.div>
            )}

            {/* Result */}
            <AnimatePresence mode="wait">
              {showResult && result.valid && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, ease: easeOutExpo }}
                  className="mt-6"
                >
                  <p className="text-sm font-semibold text-dark/70">Your donation could provide:</p>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <StatCard icon={Utensils} value={result.meals} label="Meals Provided" color="bg-forest-light" delay={0.1} />
                    <StatCard icon={Users} value={result.people} label="People Fed" color="bg-orange" delay={0.2} />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <StatCard icon={Leaf} value={Math.round(result.kg)} label="kg Food Saved" color="bg-forest" delay={0.3} />
                    <StatCard icon={Cloud} value={Math.round(result.co2SavedKg)} label="kg CO2e Avoided" color="bg-dark-light" delay={0.4} />
                  </div>

                  {/* Impact summary */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-4 rounded-2xl bg-fresh/20 p-4"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-forest" />
                      <p className="text-sm font-bold text-forest">Impact Summary</p>
                    </div>
                    <p className="mt-2 text-xs text-dark/60">
                      {result.meals.toLocaleString()} meals could feed approximately {result.people.toLocaleString()} people for a day and avoid about {Math.round(result.co2SavedKg).toLocaleString()} kg of CO2e emissions. That's real nourishment and a real step against food waste.
                    </p>
                  </motion.div>

                  <p className="mt-3 flex items-center gap-1.5 text-xs text-dark/40">
                    <Leaf className="h-3.5 w-3.5" /> Approximate estimate based on ~0.4 kg per meal, ~1.5 meals per person per day, and ~2.5 kg CO2e per kg of food saved. Actual impact varies.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
