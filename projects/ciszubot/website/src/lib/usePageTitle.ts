'use client';

import { useEffect } from 'react';

const SITE_NAME = 'CiszuBot';

export function usePageTitle(section: string) {
  useEffect(() => {
    document.title = `${SITE_NAME} | ${section}`;
  }, [section]);
}