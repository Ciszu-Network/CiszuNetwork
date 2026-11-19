import React from 'react';
import type { ReactNode } from 'react';
import { TelemetryTracker } from '@ciszu/ui';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen text-white">
      <TelemetryTracker app="ciszubot" />
        <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}

