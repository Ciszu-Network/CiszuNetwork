'use client';

import useEmblaCarousel from 'embla-carousel-react';
import { ReactNode } from 'react';

interface ProjectCarouselProps {
  children: ReactNode;
}

export function ProjectCarousel({ children }: ProjectCarouselProps) {
  const [emblaRef] = useEmblaCarousel({ loop: true, align: 'start', slidesToScroll: 1 });

  return (
    <div className="embla" ref={emblaRef}>
      <div className="embla__container flex gap-6">
        {children}
      </div>
    </div>
  );
}
