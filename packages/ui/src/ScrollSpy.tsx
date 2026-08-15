import React, { useEffect, useState } from 'react';

export interface ScrollSpyItem {
  id: string;
  label: string;
}

export function ScrollSpy({ items }: { items: ScrollSpyItem[] }) {
  const [activeNav, setActiveNav] = useState(items[0]?.id || '');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveNav(entry.target.id);
        });
      },
      { rootMargin: '-40% 0px -40% 0px' }
    );
    const nodes = items.map((item) => document.getElementById(item.id)).filter(Boolean);
    nodes.forEach((node) => {
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, [items]);

  return (
    <div className="fixed left-2 md:left-4 xl:left-6 top-1/2 -translate-y-1/2 z-[100] hidden lg:flex flex-col gap-4">
      {items.map((nav) => (
        <a
          key={nav.id}
          href={`#${nav.id}`}
          className="group relative flex items-center justify-start p-1 cursor-pointer"
        >
          <div
            className={`rounded-full transition-all duration-300 ${
              activeNav === nav.id
                ? 'w-2.5 h-2.5 bg-neon-cyan drop-shadow-[0_0_6px_rgba(0,240,255,0.8)]'
                : 'w-1.5 h-1.5 bg-white/20 group-hover:bg-white/60 group-hover:scale-125'
            }`}
          />
          <span
            className={`absolute left-6 text-[9px] uppercase font-black tracking-[0.2em] whitespace-nowrap px-2.5 py-1 rounded-md border backdrop-blur-md transition-all duration-300 pointer-events-none ${
              activeNav === nav.id
                ? 'opacity-100 text-neon-cyan border-neon-cyan/40 bg-black/95 translate-x-0 drop-shadow-md'
                : 'opacity-0 text-white border-white/10 bg-black/60 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100'
            }`}
          >
            {nav.label}
          </span>
        </a>
      ))}
    </div>
  );
}

export default ScrollSpy;