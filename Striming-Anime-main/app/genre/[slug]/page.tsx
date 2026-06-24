import { getGenre, getGenresList } from '@/lib/scraper';
import { AnimeCard } from '@/components/AnimeCard';
import { Pagination } from '@/components/Pagination';

export default async function GenreSlugPage(props: { params: Promise<{ slug: string }>, searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const slug = params.slug;
  const page = searchParams?.page ? parseInt(searchParams.page as string) : 1;

  const { items, currentPage, hasNext } = await getGenre(slug, page);
  
  // Try to find nice genre name
  const allGenres = await getGenresList();
  const genreInfo = allGenres.find(g => g.slug === slug);
  const title = genreInfo ? genreInfo.name : slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="flex flex-col gap-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white">Genre: {title}</h1>
      </div>
      
      {items.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {items.map((anime, i) => (
            <AnimeCard key={`genre-${anime.slug}-${i}`} anime={anime} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-white/40">
           No anime found in this genre.
        </div>
      )}

      {items.length > 0 && (
        <Pagination currentPage={currentPage} hasNext={hasNext} basePath={`/genre/${slug}`} />
      )}
    </div>
  );
}
