import { 
  getHome, getTop, getPopular, getUpcoming, getMovies,
  getAction, getRomance, getComedy, getAdventure, getSciFi, getFantasy
} from '@/lib/scraper';
import { AnimeCard } from '@/components/AnimeCard';
import { Pagination } from '@/components/Pagination';
import { HorizontalScroller } from '@/components/HorizontalScroller';

export default async function HomePage(props: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const page = searchParams?.page ? parseInt(searchParams.page as string) : 1;
  
  // We stagger the fetches slightly or group them to improve reliability with Jikan API rate limits (3 requests / second)
  let homeData = { items: [], currentPage: 1, hasNext: false };
  let extraSections: { title: string, href: string, items: any[] }[] = [];

  if (page === 1) {
    // Group 1
    const [resHome, resTop, resPopular] = await Promise.all([
      getHome(page), getTop(1), getPopular(1)
    ]);
    // Group 2
    await new Promise(r => setTimeout(r, 600)); // wait 600ms
    const [resUpcoming, resMovies, resAction] = await Promise.all([
      getUpcoming(1), getMovies(1), getAction(1)
    ]);
    // Group 3
    await new Promise(r => setTimeout(r, 600)); // wait 600ms
    const [resRomance, resComedy, resAdventure] = await Promise.all([
      getRomance(1), getComedy(1), getAdventure(1)
    ]);
    // Group 4
    await new Promise(r => setTimeout(r, 600));
    const [resSciFi, resFantasy] = await Promise.all([
      getSciFi(1), getFantasy(1)
    ]);

    homeData = resHome as any;
    extraSections = [
      { title: "Trending Animes", href: "/top", items: resTop.items },
      { title: "Now Playing", href: "/", items: resHome.items },
      { title: "Most Popular", href: "/popular", items: resPopular.items },
      { title: "Upcoming Seasons", href: "/upcoming", items: resUpcoming.items },
      { title: "Top Movies", href: "/movies", items: resMovies.items },
      { title: "Action", href: "/genre/1", items: resAction.items },
      { title: "Romance", href: "/genre/22", items: resRomance.items },
      { title: "Comedy", href: "/genre/4", items: resComedy.items },
      { title: "Adventure", href: "/genre/2", items: resAdventure.items },
      { title: "Sci-Fi", href: "/genre/24", items: resSciFi.items },
      { title: "Fantasy", href: "/genre/10", items: resFantasy.items },
    ];
  } else {
    homeData = await getHome(page) as any;
  }

  return (
    <div className="flex flex-col gap-10 overflow-hidden w-full">
      {page === 1 ? (
        <>
          {extraSections.map((section, idx) => {
            if (!section.items || section.items.length === 0) return null;
            return (
              <section key={idx}>
                <HorizontalScroller title={section.title} viewAllHref={section.href}>
                  {section.items.slice(0, 15).map((anime, i) => (
                    <div key={`${section.title}-${i}`} className="snap-start min-w-[140px] w-[140px] md:min-w-[180px] md:w-[180px] shrink-0">
                      <AnimeCard anime={anime} />
                    </div>
                  ))}
                </HorizontalScroller>
              </section>
            );
          })}
        </>
      ) : (
        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-[1.1rem] md:text-xl font-bold text-[#e0e0e0] flex items-center">
              Now Playing (Page {page})
            </h2>
          </div>
          
          {homeData.items.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {homeData.items.map((anime: any, i: number) => (
                <AnimeCard key={`home-${anime.slug}-${i}`} anime={anime} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-white/40">
              No anime found.
            </div>
          )}
        </section>
      )}

      <div className="mt-8">
        <Pagination currentPage={homeData.currentPage} hasNext={homeData.hasNext} basePath="/" />
      </div>
    </div>
  );
}
