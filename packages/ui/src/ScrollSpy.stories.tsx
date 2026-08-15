import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { ScrollSpy } from './index';

const meta = {
  title: 'Molecules/ScrollSpy',
  component: ScrollSpy,
  tags: ['autodocs', 'a11y', 'test'],
  args: {
    items: [
      { id: 'inicio', label: 'Inicio' },
      { id: 'sobre', label: 'Sobre' },
      { id: 'contacto', label: 'Contacto' },
    ],
  },
} satisfies Meta<typeof ScrollSpy>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const links = canvas.getAllByRole('link');
    await expect(links).toHaveLength(args.items.length);
    await expect(links[0]).toHaveAttribute('href', '#inicio');
  },
};

export const SingleItem: Story = {
  args: { items: [{ id: 'unico', label: 'Único' }] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link');
    await expect(link).toHaveAttribute('href', '#unico');
    await expect(link).toHaveTextContent('Único');
  },
};

export const Empty: Story = {
  args: { items: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryAllByRole('link')).toHaveLength(0);
  },
};