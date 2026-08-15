import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Icon, IconButton } from './index';
import type { IconButtonProps } from './index';

const meta = {
  title: 'Atoms/Icon',
  component: Icon,
  tags: ['autodocs', 'a11y', 'test'],
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
  args: { size: 32, name: 'search', color: '#e879f9' },
};

export const Button: StoryObj<typeof IconButton> = {
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/FILE_ID?node-id=0', 
    },
  },
  render: (args: IconButtonProps) => <IconButton {...args} />,
  args: {
    name: 'search',
    label: 'Buscar',
    title: 'Buscar',
    onClick: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /buscar/i }));
    await expect(args.onClick).toHaveBeenCalled();
  },
};