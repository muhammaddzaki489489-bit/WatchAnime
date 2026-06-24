'use client';

import { useFavorites } from '@/hooks/use-favorites';
import { AnimeCard } from '@/components/AnimeCard';
import { Heart } from 'lucide-react';

export default function FavoritesPage() {
  const { favorites, isLoaded } = useFavorites();

  if (!isLoaded) {
    return <div className="animate-pulse flex space-x-4 p-8">Loading favorites...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-4">
        <Heart className="text-[#ff4e00] fill-[#ff4e00]" />
        <h1 className="text-2xl font-bold text-white">Your Favorites</h1>
      </div>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {favorites.map((anime, i) => (
            <AnimeCard 
              key={`fav-${anime.slug}-${i}`} 
              anime={{
                title: anime.title,
                slug: anime.slug,
                poster: anime.poster,
                link: '',
                status: null,
                type: null,
                episode: null,
                sub: null
              }} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 flex flex-col items-center justify-center space-y-4">
          <Heart className="w-16 h-16 text-white/20" />
          <h2 className="text-xl font-semibold text-white/60">No favorites yet</h2>
          <p className="text-sm text-white/40">Go to an anime detail page and click the heart icon to add it here.</p>
        </div>
      )}
    </div>
  );
}
