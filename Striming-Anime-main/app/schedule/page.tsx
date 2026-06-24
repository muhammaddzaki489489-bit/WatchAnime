import { getSchedule } from '@/lib/scraper';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar } from 'lucide-react';

export const revalidate = 3600;

export default async function SchedulePage() {
  const daysList = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu'];
  
  const scheduleResults = await Promise.all(daysList.map(async (d) => {
    // Add small delay to avoid hitting Jikan API rate limit (3 req/sec) when doing Promise.all
    await new Promise(r => setTimeout(r, 400 * daysList.indexOf(d)));
    return getSchedule(d);
  }));
  
  const schedule: Record<string, any[]> = {};
  daysList.forEach((d, i) => {
    schedule[d] = scheduleResults[i];
  });
  const days = daysList.filter(d => schedule[d] && schedule[d].length > 0);

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-2 border-b border-white/10 pb-4">
        <Calendar className="w-8 h-8 text-[#ff4e00]" />
        <div>
           <h1 className="text-3xl font-bold text-white">Release Schedule</h1>
           <p className="text-white/40">Weekly anime release schedule based on Japan time.</p>
        </div>
      </div>

      {days.length > 0 ? (
        <div className="flex flex-col gap-10">
          {days.map((day) => (
            <div key={day}>
              <h2 className="text-2xl font-bold mb-4 capitalize sticky top-[72px] bg-[#050505]/95 backdrop-blur-md py-2 z-10 border-b border-white/10 text-white">
                {day}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {schedule[day].map((anime, i) => (
                  <Link href={`/anime/${anime.slug}`} key={`sch-${day}-${i}`} className="group flex flex-col gap-2">
                    <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl bg-neutral-800 border border-white/5 transition-all group-hover:border-[#ff4e00]/50">
                      {anime.poster ? (
                        <Image
                          src={anime.poster.startsWith('http') ? anime.poster : `https:${anime.poster}`}
                          alt={anime.title}
                          fill
                          sizes="(max-width: 768px) 50vw, 25vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                      ) : null}
                      <div className="absolute top-2 right-2 bg-black/80 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg">
                        {anime.time}
                      </div>
                    </div>
                    <div className="px-0.5">
                      <h3 className="line-clamp-2 text-sm font-semibold text-[#e0e0e0] group-hover:text-white transition-colors">
                        {anime.title}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-white/40">
           Schedule not available.
        </div>
      )}
    </div>
  );
}
