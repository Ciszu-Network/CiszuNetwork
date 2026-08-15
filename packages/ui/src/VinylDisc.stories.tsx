import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { VinylDisc } from './index';

const meta = {
  title: 'Atoms/VinylDisc',
  component: VinylDisc,
  tags: ['autodocs', 'a11y', 'test'],
  args: {
    color: '#22d3ee',
    className: 'w-32 h-32',
  },
} satisfies Meta<typeof VinylDisc>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const svg = canvasElement.querySelector('svg');
    await expect(svg).not.toBeNull();
  },
};

export const Spinning: Story = {
  args: { isSpinning: true, className: 'w-40 h-40' },
};

export const CustomColor: Story = {
  args: { color: '#f0abfc', className: 'w-48 h-48' },
};