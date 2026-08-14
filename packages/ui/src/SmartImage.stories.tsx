import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import SmartImage from '../src/SmartImage';

const meta = {
  title: 'SmartImage',
  component: SmartImage,
  tags: ['autodocs', 'a11y', 'test'],
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/FILE_ID?node-id=0',
    },
  },
} satisfies Meta<typeof SmartImage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    src: 'ciszu/logo.png',
    alt: 'Logo de ejemplo',
    width: 120,
    height: 120,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByAltText('Logo de ejemplo')).toBeInTheDocument();
  },
};