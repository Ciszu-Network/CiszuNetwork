'use client';

import { useEffect } from 'react';

const SITE_NAME = 'Ciszuko Antony';

export function usePageTitle(section: string) {
  useEffect(() => {
    document.title = `${SITE_NAME} | ${section}`;
  }, [section]);
}
