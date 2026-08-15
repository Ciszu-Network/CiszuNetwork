import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { RichText } from './index';

const meta = {
  title: 'Atoms/RichText',
  component: RichText,
  tags: ['autodocs', 'a11y', 'test'],
  args: {
    parts: [
      { text: 'Un texto con ' },
      { link: 'un enlace', href: 'https://example.com' },
      { text: ' y más contenido.' },
    ],
  },
} satisfies Meta<typeof RichText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: /un enlace/i });
    await expect(link).toHaveAttribute('href', 'https://example.com');
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  },
};

export const PlainText: Story = {
  args: { parts: [{ text: 'Solo texto sin enlaces.' }] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('link')).not.toBeInTheDocument();
    await expect(canvas.getByText('Solo texto sin enlaces.')).toBeInTheDocument();
  },
};

export const MultipleLinks: Story = {
  args: {
    parts: [
      { link: 'primero', href: 'https://a.com' },
      { text: ' entre ' },
      { link: 'segundo', href: 'https://b.com' },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const links = canvas.getAllByRole('link');
    await expect(links).toHaveLength(2);
    await expect(links[0]).toHaveAttribute('href', 'https://a.com');
    await expect(links[1]).toHaveAttribute('href', 'https://b.com');
  },
};