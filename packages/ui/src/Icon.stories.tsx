import type { Meta, StoryObj } from '@storybook/react';
import { Icon, IconButton } from './index';
import type { IconButtonProps } from './index';

const meta = {
  title: 'Icon',
  component: Icon,
  tags: ['autodocs'],
  args: {
    name: 'home',
    size: 24,
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Large: Story = {
  args: { size: 48, name: 'settings' },
};

export const Colored: Story = {
  args: { size: 32, name: 'search', color: '#22d3ee' },
};

export const Button: StoryObj<typeof IconButton> = {
  render: (args: IconButtonProps) => <IconButton {...args} />,
  args: {
    name: 'search',
    title: 'Buscar',
    onClick: () => undefined,
  },
};