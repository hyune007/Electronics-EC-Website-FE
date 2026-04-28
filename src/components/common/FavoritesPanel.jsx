import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFavorites } from "../../hooks/useFavorites";

export default function FavoritesPanel() {
  const { favoritesCount } = useFavorites();
  const navigate = useNavigate();
  const [lastCount, setLastCount] = useState(favoritesCount);
  const [jumped, setJumped] = useState(false);

  // Trigger jump animation when count changes
  useEffect(() => {
    if (favoritesCount !== lastCount) {
      setJumped(true);
      setLastCount(favoritesCount);
      const timer = setTimeout(() => setJumped(false), 600);
      return () => clearTimeout(timer);
    }
  }, [favoritesCount, lastCount]);

  return (
    <button
      type="button"
      onClick={() => navigate("/favorites")}
      aria-label="Danh sách yêu thích"
      className="fixed bottom-20 left-5 z-[80] inline-flex h-12 w-12 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-primary)] shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white md:bottom-24 md:left-7"
    >
      <div className="relative flex items-center justify-center">
        <span className="material-symbols-outlined !text-2xl">favorite</span>
        <span
          className={`absolute -top-1.5 -right-1.5 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-primary)] px-1 text-[10px] font-bold leading-none text-white transition-transform duration-600 ${
            jumped ? "scale-125" : "scale-100"
          }`}
        >
          {favoritesCount > 99 ? "99+" : favoritesCount}
        </span>
      </div>
    </button>
  );
}
