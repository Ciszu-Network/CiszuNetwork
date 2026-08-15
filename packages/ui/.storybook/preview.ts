import type { Preview } from '@storybook/react';
import { mswLoader } from 'msw-storybook-addon/csf3';

const preview: Preview = {
  loaders: [mswLoader()],
  parameters: {
    layout: 'centered',
  },
};

export default preview;