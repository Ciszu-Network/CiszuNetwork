import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  staticDirs: ['public'],
  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-vitest',
    '@storybook/addon-designs',
    '@storybook/addon-themes',
    'storybook-dark-mode',
    'storybook-addon-tag-badges',
    '@chromatic-com/storybook',
    'msw-storybook-addon',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal: async (config) => {
    // En el navegador (Vite, browser mode) no existe `process`: lo resolvemos
    // en build-time (mismo patrón que Next.js y que vitest.config.mts).
    // @ciszunetwork/cdn lee NEXT_PUBLIC_CDN_URL en runtime.
    config.define = {
      ...config.define,
      'process.env.NEXT_PUBLIC_CDN_URL': JSON.stringify(
        process.env.NEXT_PUBLIC_CDN_URL ?? ''
      ),
    };
    return config;
  },
};

export default config;