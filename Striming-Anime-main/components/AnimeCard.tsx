import Image from 'next/image';
import Link from 'next/link';
import { PlayCircle, Bookmark, Star } from 'lucide-react';
import type { AnimeItem } from '@/lib/scraper';

export function AnimeCard({ anime }: { anime: AnimeItem }) {
  return (
    <Link href={`/anime/${anime.slug}`} className="group relative flex flex-col gap-2">
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-neutral-800 transition-all group-hover:opacity-80">
        {anime.poster ? (
          <Image
            src={anime.poster.startsWith('http') ? anime.poster : `https:${anime.poster}`}
            alt={anime.title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-white/30">
            No Image
          </div>
        )}
        
        {/* Play Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center pointer-events-none">
             <PlayCircle className="w-12 h-12 text-white/90 drop-shadow-lg scale-75 group-hover:scale-100 transition-transform duration-300" />
        </div>

        {/* Top left Bookmark */}
        <div className="absolute top-2 left-2 flex items-center justify-center w-7 h-7 bg-black/60 backdrop-blur rounded-[4px] border border-white/10 hover:bg-black/80 transition-colors">
           <Bookmark className="w-4 h-4 text-white" />
        </div>

        {/* Top right Badge */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
          {(anime.episode || anime.status) && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 bg-black/60 backdrop-blur text-[11px] text-white font-bold rounded-[4px] border border-white/10">
              <Star className="w-3 h-3 text-[#ffbd00] fill-[#ffbd00]" /> 
              {anime.episode || anime.status}
            </span>
          )}
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 pointer-events-none">
             <div className="flex justify-between items-center text-xs w-full text-white">
                 <span className="truncate">{anime.type || 'Anime'}</span>
                 {anime.sub && <span className="text-[#ff4e00] ml-2 shrink-0">{anime.sub}</span>}
             </div>
        </div>
      </div>
      <div className="px-0.5 mt-1">
        <h3 className="line-clamp-2 text-sm font-semibold text-[#f0f0f0] group-hover:text-white transition-colors truncate">
          {anime.title}
        </h3>
        {(anime.type || anime.status) && (
          <p className="text-xs text-white/40 mt-0.5 truncate font-medium">
            {anime.type || "Anime"} {anime.status ? `• ${anime.status}` : ''}
          </p>
        )}
      </div>
    </Link>
  );
}
