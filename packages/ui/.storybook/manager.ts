import { addons } from 'storybook/manager-api';
import {
  defaultConfig,
  type TagBadgeParameters,
} from 'storybook-addon-tag-badges/manager-helpers';

addons.setConfig({
  tagBadges: [
    {
      tags: 'test',
      badge: {
        text: 'Con tests',
        style: 'green',
        tooltip: 'Tiene tests de interacción (play functions).',
      },
    },
    {
      tags: 'a11y',
      badge: {
        text: 'Accesible',
        style: 'purple',
        tooltip: 'Cumple checks de accesibilidad (Axe).',
      },
    },
    {
      tags: 'autodocs',
      badge: {
        text: 'Docs',
        style: 'blue',
        tooltip: 'Genera documentación automática.',
      },
    },
    ...defaultConfig,
  ] satisfies TagBadgeParameters,
});