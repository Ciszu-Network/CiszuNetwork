import type { Meta, StoryObj } from '@storybook/react';
import SmartImage from '../src/SmartImage';

const meta = {
  title: 'SmartImage',
  component: SmartImage,
  tags: ['autodocs'],
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
};