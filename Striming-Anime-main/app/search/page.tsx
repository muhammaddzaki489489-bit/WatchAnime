import { getSearch } from '@/lib/scraper';
import { AnimeCard } from '@/components/AnimeCard';
import { Pagination } from '@/components/Pagination';

export default async function SearchPage(props: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const q = searchParams?.q as string || '';
  const page = searchParams?.page ? parseInt(searchParams.page as string) : 1;
  
  if (!q) {
     return (
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold text-white/60">Enter a search term to find anime.</h1>
        </div>
     );
  }

  const { items, currentPage, hasNext } = await getSearch(q, page);

  return (
    <div className="flex flex-col gap-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white">Search results for &quot;{q}&quot;</h1>
        <p className="text-white/40 text-sm mt-1">Found {items.length} items on this page</p>
      </div>
      
      {items.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {items.map((anime, i) => (
            <AnimeCard key={`search-${anime.slug}-${i}`} anime={anime} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-white/40">
           No anime found matching your search.
        </div>
      )}

      {items.length > 0 && (
        <Pagination currentPage={currentPage} hasNext={hasNext} basePath={`/search?q=${encodeURIComponent(q)}`} />
      )}
    </div>
  );
}
