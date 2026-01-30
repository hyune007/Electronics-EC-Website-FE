import { useState } from "react";

const MIN = 0;
const MAX = 100_000_000;
const STEP = 500_000;

export default function PriceRange() {
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(MAX);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="number"
          value={minPrice}
          min={MIN}
          max={maxPrice}
          step={STEP}
          onChange={(e) => setMinPrice(Math.min(+e.target.value, maxPrice))}
          className="w-1/2 rounded-lg border px-2 py-1 text-sm dark:text-slate-100
                     dark:bg-slate-900 dark:border-slate-700"
          placeholder="Min"
        />

        <input
          type="number"
          value={maxPrice}
          min={minPrice}
          max={MAX}
          step={STEP}
          onChange={(e) => setMaxPrice(Math.max(+e.target.value, minPrice))}
          className="w-1/2 rounded-lg border px-2 py-1 text-sm dark:text-slate-100
                     dark:bg-slate-900 dark:border-slate-700"
          placeholder="Max"
        />
      </div>

      <div className="relative h-2">
        <div className="absolute inset-0 bg-slate-200 dark:bg-slate-700 rounded" />

        <div
          className="absolute h-2 bg-primary rounded"
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
            setMinPrice(Math.min(+e.target.value, maxPrice - STEP))
          }
          className="absolute w-full pointer-events-none
                     appearance-none [&::-webkit-slider-thumb]:pointer-events-auto
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:h-4
                     [&::-webkit-slider-thumb]:w-4
                     [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:bg-primary"
        />

        <input
          type="range"
          min={MIN}
          max={MAX}
          step={STEP}
          value={maxPrice}
          onChange={(e) =>
            setMaxPrice(Math.max(+e.target.value, minPrice + STEP))
          }
          className="absolute w-full pointer-events-none
                     appearance-none [&::-webkit-slider-thumb]:pointer-events-auto
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:h-4
                     [&::-webkit-slider-thumb]:w-4
                     [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:bg-primary"
        />
      </div>
    </div>
  );
}
