'use client';

import { useInView } from 'react-intersection-observer';
import { ReactNode } from 'react';

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  animation?: 'fade-in-up' | 'fade-in-down' | 'scale-in' | 'slide-in-right';
  delay?: number;
  threshold?: number;
}

export function AnimatedSection({
  children,
  className = '',
  animation = 'fade-in-up',
  delay = 0,
  threshold = 0.1,
}: AnimatedSectionProps) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold,
  });

  const animationClasses: Record<string, string> = {
    'fade-in-up': 'animate-fade-in-up',
    'fade-in-down': 'animate-fade-in-down',
    'scale-in': 'animate-scale-in',
    'slide-in-right': 'animate-slide-in-right',
  };

  const baseClasses = 'transition-all duration-700 ease-out';
  const hiddenClasses = inView ? '' : 'opacity-0 translate-y-8';
  const animationClass = inView ? animationClasses[animation] : '';

  return (
    <div
      ref={ref}
      className={`${baseClasses} ${hiddenClasses} ${animationClass} ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
