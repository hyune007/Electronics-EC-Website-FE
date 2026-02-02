import { useState } from "react";

const MIN = 0;
const MAX = 100_000_000;
const STEP = 500_000;
const MIN_GAP = 10_000_000;

export default function PriceRange() {
  const [minPrice, setMinPrice] = useState(MIN);
  const [maxPrice, setMaxPrice] = useState(MAX);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="number"
          value={minPrice}
          min={MIN}
          max={maxPrice - MIN_GAP}
          step={STEP}
          onChange={(e) =>
            setMinPrice(Math.min(+e.target.value || MIN, maxPrice - MIN_GAP))
          }
          className="w-1/2 rounded-lg border px-2 py-1 text-sm
                     dark:text-slate-100 dark:bg-slate-900 dark:border-slate-700"
        />
        <input
          type="number"
          value={maxPrice}
          min={minPrice + MIN_GAP}
          max={MAX}
          step={STEP}
          onChange={(e) =>
            setMaxPrice(Math.max(+e.target.value || MAX, minPrice + MIN_GAP))
          }
          className="w-1/2 rounded-lg border px-2 py-1 text-sm
                     dark:text-slate-100 dark:bg-slate-900 dark:border-slate-700"
        />
      </div>

      <div className="relative h-3">
        <div className="absolute inset-0 rounded-full bg-slate-200 dark:bg-slate-700" />

        <div
          className="absolute h-3 rounded-full bg-primary"
          style={{
            left: `${(minPrice / MAX) * 100}%`,
            right: `${100 - (maxPrice / MAX) * 100}%`,
          }}
        />

        <input
          type="range"
          min={MIN}
          max={MAX}
          step={STEP}
          value={minPrice}
          onChange={(e) =>
            setMinPrice(Math.min(+e.target.value, maxPrice - MIN_GAP))
          }
          className="absolute left-0 top-1/2 w-full -translate-y-1/2
            appearance-none bg-transparent pointer-events-none
            [&::-webkit-slider-thumb]:pointer-events-auto
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-primary
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-white
            [&::-webkit-slider-thumb]:shadow-md"
        />
        <input
          type="range"
          min={MIN}
          max={MAX}
          step={STEP}
          value={maxPrice}
          onChange={(e) =>
            setMaxPrice(Math.max(+e.target.value, minPrice + MIN_GAP))
          }
          className="absolute left-0 top-1/2 w-full -translate-y-1/2
            appearance-none bg-transparent pointer-events-none
            [&::-webkit-slider-thumb]:pointer-events-auto
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-primary
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-white
            [&::-webkit-slider-thumb]:shadow-md"
        />
      </div>
    </div>
  );
}
