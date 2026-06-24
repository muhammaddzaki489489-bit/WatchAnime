'use client';

import { useState, useEffect } from 'react';

export interface FavoriteItem {
  slug: string;
  title: string;
  poster: string | null;
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('animeFavorites');
      if (stored) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFavorites(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to parse favorites from local storage');
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoaded(true);
  }, []);

  const toggleFavorite = (item: FavoriteItem) => {
    setFavorites(prev => {
      const exists = prev.some(f => f.slug === item.slug);
      let updated;
      if (exists) {
        updated = prev.filter(f => f.slug !== item.slug);
      } else {
        updated = [...prev, item];
      }
      localStorage.setItem('animeFavorites', JSON.stringify(updated));
      return updated;
    });
  };

  const isFavorite = (slug: string) => {
    return favorites.some(f => f.slug === slug);
  };

  return { favorites, toggleFavorite, isFavorite, isLoaded };
}
