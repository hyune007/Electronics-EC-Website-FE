import { useState, useEffect, useCallback } from "react";

const MIN = 0;
const MAX = 100_000;
const STEP = 500;
const MIN_GAP = 10000;

const clampMin = (value, max) =>
  Math.min(Math.max(value || MIN, MIN), max - MIN_GAP);

const clampMax = (value, min) =>
  Math.max(Math.min(value || MAX, MAX), min + MIN_GAP);

export default function PriceRange({
  min: propMin = null,
  max: propMax = null,
  onChange = () => {},
}) {
  const [minPrice, setMinPrice] = useState(propMin ?? MIN);
  const [maxPrice, setMaxPrice] = useState(propMax ?? MAX);

  useEffect(() => {
    if (typeof propMin === "number") setMinPrice(propMin);
  }, [propMin]);

  useEffect(() => {
    if (typeof propMax === "number") setMaxPrice(propMax);
  }, [propMax]);

  const updateMin = useCallback(
    (value) => {
      const next = clampMin(value, maxPrice);
      setMinPrice(next);
      onChange(next, maxPrice);
    },
    [maxPrice, onChange],
  );

  const updateMax = useCallback(
    (value) => {
      const next = clampMax(value, minPrice);
      setMaxPrice(next);
      onChange(minPrice, next);
    },
    [minPrice, onChange],
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="number"
          value={minPrice}
          min={MIN}
          max={maxPrice - MIN_GAP}
          step={STEP}
          onChange={(e) => updateMin(+e.target.value)}
          className="w-1/2 rounded-lg border px-2 py-1 text-sm
                     dark:text-slate-100 dark:bg-slate-900 dark:border-slate-700"
        />
        <input
          type="number"
          value={maxPrice}
          min={minPrice + MIN_GAP}
          max={MAX}
          step={STEP}
          onChange={(e) => updateMax(+e.target.value)}
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
          onChange={(e) => updateMin(+e.target.value)}
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
          onChange={(e) => updateMax(+e.target.value)}
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
