import type { Preview } from '@storybook/react';
import { mswLoader } from 'msw-storybook-addon/csf3';

const preview: Preview = {
  loaders: [mswLoader()],
  parameters: {
    layout: 'centered',
    viewport: {
      viewports: {
        mobile: {
          name: 'Móvil (375)',
          styles: { width: '375px', height: '812px' },
        },
        tablet: {
          name: 'Tablet (768)',
          styles: { width: '768px', height: '1024px' },
        },
        laptop: {
          name: 'Laptop (1280)',
          styles: { width: '1280px', height: '800px' },
        },
        desktop: {
          name: 'Escritorio (1440)',
          styles: { width: '1440px', height: '900px' },
        },
      },
    },
  },
};

export default preview;