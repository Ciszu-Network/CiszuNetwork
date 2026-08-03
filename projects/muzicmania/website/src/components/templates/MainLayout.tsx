import React from 'react';
import type { ReactNode } from 'react';
import { DesktopGuard } from '@/components/desktop/DesktopGuard';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <DesktopGuard>
      <div className="flex flex-col min-h-screen bg-black text-white selection:bg-neon-blue/30 selection:text-neon-cyan">
        <main className="flex-grow">
          {children}
        </main>
      </div>
    </DesktopGuard>
  );
}
