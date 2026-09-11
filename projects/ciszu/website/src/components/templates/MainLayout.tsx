import React from 'react';
import type { ReactNode } from 'react';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}
