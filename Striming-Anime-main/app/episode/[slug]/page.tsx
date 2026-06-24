import { getEpisode } from '@/lib/scraper';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, List, AlertCircle } from 'lucide-react';

export default async function EpisodePage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const slug = params.slug;
  const episode = await getEpisode(slug);

  if (!episode.title) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold">Episode Not Found</h1>
        <p className="text-slate-500 mt-2">The episode you requested could not be loaded.</p>
        <Link href="/" className="text-blue-500 hover:underline mt-4 inline-block">Return Home</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{episode.title}</h1>
        </div>
        {episode.allEpisodesSlug && (
          <Link 
            href={`/anime/${episode.allEpisodesSlug}`}
            className="flex items-center gap-2 text-sm font-bold text-black bg-white hover:bg-white/90 px-4 py-2 rounded-xl transition-colors shadow-lg"
          >
            <List className="w-4 h-4" /> All Episodes
          </Link>
        )}
      </div>

      {/* Video Player Section */}
      <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl relative border border-slate-800">
        {episode.iframeUrl ? (
          <iframe 
            src={episode.iframeUrl} 
            allowFullScreen 
            className="w-full h-full border-0 absolute inset-0"
          ></iframe>
        ) : episode.videoUrl ? (
          <video 
            src={episode.videoUrl} 
            controls 
            className="w-full h-full outline-none"
            controlsList="nodownload"
          ></video>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
             <AlertCircle className="w-12 h-12 text-slate-600" />
             <p>No video player found for this episode.</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-2 pt-4 border-t border-white/10">
        {episode.prevEpisode ? (
          <Link 
            href={`/episode/${episode.prevEpisode}`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-colors font-bold text-sm border border-white/10"
          >
            <ChevronLeft className="w-4 h-4" /> Prev Episode
          </Link>
        ) : (
          <div className="w-[120px]"></div> // Placeholder for spacing
        )}

        {episode.nextEpisode ? (
          <Link 
            href={`/episode/${episode.nextEpisode}`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#ff4e00] text-black hover:bg-[#ff4e00]/90 transition-colors font-bold text-sm shadow-lg shadow-[#ff4e00]/20"
          >
            Next Episode <ChevronRight className="w-4 h-4" />
          </Link>
        ) : null}
      </div>

      {/* Episode List (Dropdown or Grid) */}
      {episode.episodeList && episode.episodeList.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4 text-white">Other Episodes</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {episode.episodeList.map((ep: {slug: string, title: string, info: string}) => (
              <Link 
                key={ep.slug} 
                href={`/episode/${ep.slug}`}
                className={`p-3 rounded-xl border text-sm font-bold transition-all ${
                  ep.slug === slug 
                  ? 'border-[#ff4e00] bg-[#ff4e00]/10 text-[#ff4e00]' 
                  : 'border-white/10 bg-[#0a0a0a] hover:border-white/20 hover:bg-white/5 text-white/60 hover:text-white'
                }`}
              >
                <div className="truncate">{ep.title}</div>
                {ep.info && <div className="text-xs text-white/40 mt-1">{ep.info}</div>}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
