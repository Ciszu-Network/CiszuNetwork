import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { FlagIcon } from './index';

const meta = {
  title: 'Atoms/FlagIcon',
  component: FlagIcon,
  tags: ['autodocs', 'a11y', 'test'],
  args: {
    code: 've',
    className: 'w-6 h-6',
  },
} satisfies Meta<typeof FlagIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Venezuela: Story = {
  args: { code: 've' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const flag = canvas.getByRole('img', { hidden: true });
    await expect(flag).toBeInTheDocument();
  },
};

export const Spain: Story = {
  args: { code: 'es' },
};

export const InvalidCode: Story = {
  args: { code: 'zz_invalid' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('img', { hidden: true })).not.toBeInTheDocument();
  },
};