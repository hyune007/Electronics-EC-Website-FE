import { useState, useEffect, useCallback } from "react";

const FAVORITES_STORAGE_KEY = "ubrain_favorites";

const FAVORITES_CHANGE_EVENT = "ubrain-favorites-change";

function readFavoritesFromStorage() {
  try {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];

    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Error reading favorites from localStorage:", e);
    return [];
  }
}

function syncFavoritesToStorage(nextFavorites) {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(nextFavorites));
    window.dispatchEvent(new Event(FAVORITES_CHANGE_EVENT));
  } catch (e) {
    console.error("Error saving favorites to localStorage:", e);
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState(readFavoritesFromStorage);

  // Keep all hook instances aligned when another component updates favorites.
  useEffect(() => {
    const handleFavoritesChange = () => {
      setFavorites(readFavoritesFromStorage());
    };

    handleFavoritesChange();
    window.addEventListener(FAVORITES_CHANGE_EVENT, handleFavoritesChange);
    window.addEventListener("storage", handleFavoritesChange);

    return () => {
      window.removeEventListener(FAVORITES_CHANGE_EVENT, handleFavoritesChange);
      window.removeEventListener("storage", handleFavoritesChange);
    };
  }, []);

  // Check if a product is favorited
  const isFavorited = useCallback(
    (productId) => {
      return favorites.map(String).includes(String(productId));
    },
    [favorites],
  );

  // Add or remove a product from favorites
  const toggleFavorite = useCallback((productId) => {
    setFavorites((prev) => {
      const normalizedId = String(productId);

      const nextFavorites = prev.map(String);

      if (nextFavorites.includes(normalizedId)) {
        const filtered = nextFavorites.filter((id) => id !== normalizedId);
        syncFavoritesToStorage(filtered);
        return filtered;
      }

      const next = [...nextFavorites, normalizedId];
      syncFavoritesToStorage(next);
      return next;
    });
  }, []);

  // Add to favorites
  const addFavorite = useCallback((productId) => {
    setFavorites((prev) => {
      const normalizedId = String(productId);
      const nextFavorites = prev.map(String);

      if (!nextFavorites.includes(normalizedId)) {
        const next = [...nextFavorites, normalizedId];
        syncFavoritesToStorage(next);
        return next;
      }

      return nextFavorites;
    });
  }, []);

  // Remove from favorites
  const removeFavorite = useCallback((productId) => {
    setFavorites((prev) => {
      const normalizedId = String(productId);
      const next = prev.map(String).filter((id) => id !== normalizedId);
      syncFavoritesToStorage(next);
      return next;
    });
  }, []);

  return {
    favorites,
    favoritesCount: favorites.length,
    isFavorited,
    toggleFavorite,
    addFavorite,
    removeFavorite,
  };
}
