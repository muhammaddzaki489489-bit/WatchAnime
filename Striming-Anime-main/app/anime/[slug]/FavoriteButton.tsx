'use client';

import { Heart } from 'lucide-react';
import { useFavorites } from '@/hooks/use-favorites';
import type { FavoriteItem } from '@/hooks/use-favorites';

export function FavoriteButton({ anime }: { anime: FavoriteItem }) {
  const { isFavorite, toggleFavorite, isLoaded } = useFavorites();

  if (!isLoaded) return <div className="w-full h-10 bg-white/5 rounded animate-pulse"></div>;

  const fav = isFavorite(anime.slug);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        toggleFavorite(anime);
      }}
      className={`flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl font-bold transition-all ${
        fav 
        ? 'bg-[#ff4e00]/20 text-[#ff4e00] border border-[#ff4e00]/50 hover:bg-[#ff4e00]/30' 
        : 'bg-white/5 text-white/60 hover:text-white border border-white/10 hover:border-white/20 hover:bg-white/10'
      }`}
    >
      <Heart className={`w-5 h-5 ${fav ? 'fill-[#ff4e00]' : ''}`} />
      {fav ? 'Favorited' : 'Add to Favorites'}
    </button>
  );
}
