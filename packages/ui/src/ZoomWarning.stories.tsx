import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { ZoomWarning } from './index';

const meta = {
  title: 'Molecules/ZoomWarning',
  component: ZoomWarning,
  tags: ['autodocs', 'a11y', 'test'],
} satisfies Meta<typeof ZoomWarning>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText(/zoom alto detectado/i)).not.toBeInTheDocument();
  },
};