import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { SocialIcon, SOCIAL_COLORS } from './index';

const meta = {
  title: 'Atoms/SocialIcon',
  component: SocialIcon,
  tags: ['autodocs', 'a11y', 'test'],
  args: {
    platform: 'github',
    size: 32,
  },
} satisfies Meta<typeof SocialIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Github: Story = {};

export const Discord: Story = {
  args: { platform: 'discord' },
};

export const Youtube: Story = {
  args: { platform: 'youtube' },
};

export const Instagram: Story = {
  args: { platform: 'instagram' },
};

export const Monochrome: Story = {
  args: { platform: 'youtube', colored: false },
  play: async ({ canvasElement }) => {
    const svg = canvasElement.querySelector('svg');
    await expect(svg).not.toBeNull();
    await expect((svg as unknown as SVGSVGElement).getAttribute('fill')).toBe('currentColor');
  },
};

export const Colored: Story = {
  args: { platform: 'youtube' },
  play: async ({ canvasElement }) => {
    const svg = canvasElement.querySelector('svg');
    await expect(svg).not.toBeNull();
    await expect((svg as unknown as SVGSVGElement).getAttribute('fill')).toBe(SOCIAL_COLORS.youtube);
  },
};