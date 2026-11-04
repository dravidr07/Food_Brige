/**
 * Shared FoodBridge impact calculation logic.
 *
 * Conversion assumptions (clearly labeled, approximate):
 *  - 0.4 kg of food ≈ 1 meal (FAO-style rough average for plated meals)
 *  - 1.5 meals per person per day (covers one adult + partial child share)
 *  - 1 lb = 0.4536 kg (standard conversion)
 *  - 1 kg food diverted ≈ 2.5 kg CO2e avoided (rough midpoint of WRAP/EPA
 *    food-waste footprint estimates; displayed as "approximate")
 */

export type Unit = 'kg' | 'lbs';

export interface ImpactInput {
  quantity: string;
  unit: Unit;
}

export interface ImpactResult {
  kg: number;
  meals: number;
  people: number;
  co2SavedKg: number;
  valid: boolean;
}

const KG_PER_MEAL = 0.4;
const MEALS_PER_PERSON = 1.5;
const LB_TO_KG = 0.4536;
const CO2_PER_KG = 2.5;

/** Parse a raw input string into a safe non-negative finite number, or NaN. */
export function parseAmount(raw: string): number {
  if (raw === '' || raw === null || raw === undefined) return NaN;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return NaN;
  return n;
}

/** Core calculation. Returns valid:false for empty/invalid/zero input. */
export function computeImpact(quantity: string, unit: Unit): ImpactResult {
  const amount = parseAmount(quantity);
  if (Number.isNaN(amount) || amount === 0) {
    return { kg: 0, meals: 0, people: 0, co2SavedKg: 0, valid: false };
  }

  const kg = unit === 'kg' ? amount : amount * LB_TO_KG;
  const meals = Math.round(kg / KG_PER_MEAL);
  const people = Math.max(1, Math.round(meals / MEALS_PER_PERSON));
  const co2SavedKg = kg * CO2_PER_KG;

  return { kg, meals, people, co2SavedKg, valid: true };
}

export const IMPACT_ASSUMPTIONS = {
  kgPerMeal: KG_PER_MEAL,
  mealsPerPerson: MEALS_PER_PERSON,
  lbToKg: LB_TO_KG,
  co2PerKg: CO2_PER_KG,
};

export const DEFAULT_QUANTITY = '';
export const DEFAULT_UNIT: Unit = 'kg';
