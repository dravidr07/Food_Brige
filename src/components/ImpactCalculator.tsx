import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, ArrowRight, RotateCcw, Utensils, Users, Leaf, Cloud, AlertCircle, Sparkles } from 'lucide-react';
import Reveal from './Reveal';
import { useCountUp } from '@/lib/useCountUp';
import { computeImpact, parseAmount, DEFAULT_QUANTITY, DEFAULT_UNIT, type Unit } from '@/lib/impact';
import { SPRING_TAP } from '@/lib/springs';

function StatCard({ icon: Icon, value, label, color }: { icon: typeof Leaf; value: number; label: string; color: string }) {
  const { count } = useCountUp(value, 1200);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-cream/10 p-4 text-center backdrop-blur"
    >
      <div className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="text-3xl font-extrabold text-cream tabular-nums">{count.toLocaleString()}</div>
      <div className="mt-1 text-xs font-semibold text-cream/60">{label}</div>
    </motion.div>
  );
}

export default function ImpactCalculator({ onOpenPopup }: { onOpenPopup?: () => void }) {
  const [quantity, setQuantity] = useState(DEFAULT_QUANTITY);
  const [unit, setUnit] = useState<Unit>(DEFAULT_UNIT);
  const [showResult, setShowResult] = useState(false);

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

  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <Reveal>
          <div className="overflow-hidden rounded-5xl bg-gradient-to-br from-forest to-forest-dark p-6 shadow-float sm:p-12">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange">
                <Calculator className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-sm font-bold uppercase tracking-wider text-fresh">Impact Calculator</span>
                <h3 className="text-2xl font-extrabold text-cream sm:text-3xl">See Your Potential Impact</h3>
              </div>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {/* Input */}
              <div className="rounded-3xl bg-cream/10 p-6 backdrop-blur">
                <label htmlFor="calc-quantity" className="text-sm font-semibold text-cream/80">
                  How much surplus food do you have?
                </label>
                <div className="mt-3 flex gap-3">
                  <input
                    id="calc-quantity"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="any"
                    value={quantity}
                    onChange={(e) => { setQuantity(e.target.value); setShowResult(false); }}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter amount"
                    aria-label="Food quantity"
                    className="flex-1 rounded-xl border border-cream/20 bg-cream/5 px-4 py-3 text-cream placeholder:text-cream/40 focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <select
                    value={unit}
                    onChange={(e) => { setUnit(e.target.value as Unit); setShowResult(false); }}
                    aria-label="Unit"
                    className="rounded-xl border border-cream/20 bg-cream/5 px-3 py-3 text-cream focus:border-orange focus:outline-none"
                  >
                    <option value="kg" className="text-dark">kg</option>
                    <option value="lbs" className="text-dark">lbs</option>
                  </select>
                </div>

                <AnimatePresence>
                  {errorMsg && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 flex items-center gap-1.5 text-xs text-orange-light"
                    >
                      <AlertCircle className="h-3.5 w-3.5" /> {errorMsg}
                    </motion.p>
                  )}
                </AnimatePresence>

                <div className="mt-4 flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ ...SPRING_TAP }}
                    onClick={handleCalculate}
                    disabled={!result.valid}
                    className="flex flex-1 items-center justify-center gap-2 rounded-full bg-orange py-3.5 font-bold text-white shadow-lg shadow-orange/30 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Calculate <ArrowRight className="h-5 w-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ ...SPRING_TAP }}
                    onClick={handleReset}
                    aria-label="Reset calculator"
                    className="flex items-center justify-center gap-2 rounded-full border border-cream/20 px-4 py-3.5 font-semibold text-cream/70 transition hover:bg-cream/10 hover:text-cream"
                  >
                    <RotateCcw className="h-4 w-4" /> Reset
                  </motion.button>
                </div>

                {/* Live preview */}
                {result.valid && !showResult && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-3 flex items-center gap-1.5 text-xs text-cream/50"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-fresh" />
                    Live preview: ~{result.meals.toLocaleString()} meals, ~{result.people.toLocaleString()} people fed
                  </motion.div>
                )}

                {onOpenPopup && (
                  <button
                    onClick={onOpenPopup}
                    className="mt-3 w-full text-center text-xs font-semibold text-cream/40 underline-offset-2 transition hover:text-cream/70 hover:underline"
                  >
                    Open detailed calculator
                  </button>
                )}
              </div>

              {/* Result */}
              <div className="rounded-3xl bg-cream/10 p-6 backdrop-blur">
                <AnimatePresence mode="wait">
                  {showResult && result.valid ? (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                    >
                      <p className="text-sm font-semibold text-cream/80">Your donation could provide:</p>
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <StatCard icon={Utensils} value={result.meals} label="Meals Provided" color="bg-forest-light" />
                        <StatCard icon={Users} value={result.people} label="People Fed" color="bg-orange" />
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <StatCard icon={Leaf} value={Math.round(result.kg)} label="kg Food Saved" color="bg-forest" />
                        <StatCard icon={Cloud} value={Math.round(result.co2SavedKg)} label="kg CO2e Avoided" color="bg-dark-light" />
                      </div>
                      <p className="mt-4 text-xs text-cream/50">
                        Approximate estimate: ~0.4 kg per meal, ~1.5 meals per person per day, ~2.5 kg CO2e per kg food saved. Actual impact varies.
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex h-full flex-col items-center justify-center text-center"
                    >
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cream/5">
                        <Utensils className="h-8 w-8 text-cream/30" />
                      </div>
                      <p className="mt-4 max-w-[14rem] text-sm text-cream/60">
                        Enter an amount and press Calculate to see how many meals your surplus food could become.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
