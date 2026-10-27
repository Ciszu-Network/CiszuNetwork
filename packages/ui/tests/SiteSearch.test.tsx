// @vitest-environment happy-dom
import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import SiteSearch, { type SearchUserItem } from '../src/SiteSearch';

const pages = [
  { href: '/', label: 'Inicio', category: 'Páginas', keywords: ['home'] },
  { href: '/soporte', label: 'Soporte', category: 'Páginas', keywords: ['ayuda'] },
];

const users: SearchUserItem[] = [
  {
    id: 'u1',
    displayName: 'Ciszuko',
    username: 'ciszuko',
    avatar: null,
    href: '/profile/@ciszuko',
  },
];

afterEach(() => {
  cleanup();
});

describe('SiteSearch', () => {
  it('por defecto busca solo páginas y no llama a searchUsers', () => {
    const searchUsers = vi.fn().mockResolvedValue(users);
    const { getByLabelText, queryByText } = render(<SiteSearch pages={pages} searchUsers={searchUsers} />);

    fireEvent.change(getByLabelText('Buscar…'), { target: { value: 'sop' } });
    expect(queryByText('Soporte')).toBeTruthy();
    expect(searchUsers).not.toHaveBeenCalled();
  });

  it('activa usuarios, muestra ambos modos y permite desactivar páginas', async () => {
    const searchUsers = vi.fn().mockResolvedValue(users);
    const { getByLabelText, getByRole, queryByText } = render(
      <SiteSearch pages={pages} searchUsers={searchUsers} />
    );

    fireEvent.click(getByRole('button', { name: 'Usuarios' }));
    expect(screen.getByText('Escribe un @usuario para buscar.')).toBeTruthy();

    fireEvent.change(getByLabelText('Buscar…'), { target: { value: 'ci' } });
    await waitFor(() => expect(searchUsers).toHaveBeenCalledWith('ci'));
    expect(screen.getByText('Ciszuko')).toBeTruthy();
    expect(screen.getByText('@ciszuko')).toBeTruthy();
    expect(queryByText('Inicio')).toBeTruthy();

    fireEvent.click(screen.getAllByRole('button', { name: 'Páginas' })[0]);
    expect(queryByText('Inicio')).toBeNull();
    expect(screen.getByText('Ciszuko')).toBeTruthy();
  });

  it('@ fuerza usuarios, oculta páginas y quita la @ del término', async () => {
    const searchUsers = vi.fn().mockResolvedValue(users);
    const { getByLabelText, queryByText } = render(
      <SiteSearch pages={pages} searchUsers={searchUsers} />
    );

    fireEvent.change(getByLabelText('Buscar…'), { target: { value: '@ci' } });
    await waitFor(() => expect(searchUsers).toHaveBeenCalledWith('ci'));
    expect(screen.getByText('Ciszuko')).toBeTruthy();
    expect(queryByText('Soporte')).toBeNull();
    expect(screen.getByRole('button', { name: 'Páginas' }).hasAttribute('disabled')).toBe(true);
  });

  it('Enter refresca la búsqueda de usuarios', async () => {
    const searchUsers = vi.fn().mockResolvedValue(users);
    const { container, getByLabelText, getByRole } = render(
      <SiteSearch pages={pages} searchUsers={searchUsers} />
    );

    fireEvent.click(getByRole('button', { name: 'Usuarios' }));
    fireEvent.change(getByLabelText('Buscar…'), { target: { value: 'ci' } });
    await waitFor(() => expect(searchUsers).toHaveBeenCalledTimes(1));

    fireEvent.submit(container.querySelector('form') as HTMLFormElement);
    await waitFor(() => expect(searchUsers).toHaveBeenCalledTimes(2));
  });

  it('sin soporte de usuarios, @ no oculta las páginas', () => {
    const { getByLabelText, queryByText } = render(<SiteSearch pages={pages} />);

    fireEvent.change(getByLabelText('Buscar…'), { target: { value: '@sop' } });
    expect(queryByText('Soporte')).toBeTruthy();
  });
});
