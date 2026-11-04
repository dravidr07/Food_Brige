import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FOOD } from '@/lib/data';

const WORDS = ['SHARE FOOD', 'SAVE MEALS', 'REDUCE WASTE', 'SPREAD HAPPINESS'];

const FOOD_ICONS = [FOOD.tomatoes, FOOD.lettuce, FOOD.bread, FOOD.carrots, FOOD.fruitBowl];

export default function FoodMarquee() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  const items = [...WORDS, ...WORDS];
  const foodItems = [...FOOD_ICONS, ...FOOD_ICONS];

  return (
    <div className="relative overflow-hidden border-y border-dark/8 bg-gradient-to-r from-forest via-forest-dark to-forest py-5">
      <div
        className="flex items-center gap-8 whitespace-nowrap"
        style={{
          animation: reduced ? 'none' : 'marquee 30s linear infinite',
        }}
      >
        {items.map((word, i) => (
          <div key={i} className="flex items-center gap-8">
            <span className="text-2xl font-extrabold tracking-tight text-cream sm:text-3xl">
              {word}
            </span>
            <div className="flex h-10 w-10 overflow-hidden rounded-xl shadow-food sm:h-12 sm:w-12">
              <img
                src={foodItems[i % foodItems.length]}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <span className="text-2xl text-orange sm:text-3xl">•</span>
          </div>
        ))}
      </div>
    </div>
  );
}
