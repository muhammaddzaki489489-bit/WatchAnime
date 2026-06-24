'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';

export function HorizontalScroller({
  title,
  viewAllHref,
  children
}: {
  title: string;
  viewAllHref?: string;
  children: React.ReactNode;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-3">
          <h2 className="text-[1.1rem] md:text-xl font-bold text-[#e0e0e0] flex items-center">
            {title}
          </h2>
          {viewAllHref && (
            <>
              <span className="w-px h-5 bg-white/20"></span>
              <Link href={viewAllHref} className="text-sm text-[#4786d1] font-medium hover:text-white transition-colors">
                View All
              </Link>
            </>
          )}
        </div>
        <div className="hidden sm:flex gap-2">
          <button onClick={scrollLeft} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
            <ChevronLeft className="w-5 h-5 text-white/70" />
          </button>
          <button onClick={scrollRight} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
            <ChevronRight className="w-5 h-5 text-white/70" />
          </button>
        </div>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory no-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style dangerouslySetInnerHTML={{__html: `
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}} />
        {children}
      </div>
    </div>
  );
}
