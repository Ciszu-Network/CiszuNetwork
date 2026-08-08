// @vitest-environment happy-dom
import React from 'react';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import InstallPwaButton from '../src/InstallPwaButton';

afterEach(() => {
  vi.unstubAllGlobals();
  cleanup();
});

describe('InstallPwaButton', () => {
  it('sin beforeinstallprompt muestra botón y panel de instrucciones', async () => {
    const { getByRole, queryByRole, findByText } = render(<InstallPwaButton />);
    const btn = getByRole('button', { name: /instalar app/i });
    expect(btn).toBeTruthy();

    fireEvent.click(btn);
    const dialog = await findByText('Instalar la app');
    expect(dialog).toBeTruthy();
    expect(queryByRole('button', { name: /instalar app/i })).toBeTruthy();
  });

  it('con beforeinstallprompt lanza el prompt nativo al pulsar', async () => {
    const prompt = vi.fn().mockResolvedValue(undefined);
    const userChoice = Promise.resolve({ outcome: 'accepted' });
    const event = new Event('beforeinstallprompt') as Event & {
      prompt: () => Promise<void>;
      userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
    };
    event.prompt = prompt;
    event.userChoice = userChoice;

    const { getByRole, findByRole } = render(<InstallPwaButton />);
    window.dispatchEvent(event);

    const btn = await findByRole('button', { name: /instalar app/i });
    fireEvent.click(btn);

    await waitFor(() => expect(prompt).toHaveBeenCalledTimes(1));
  });
});