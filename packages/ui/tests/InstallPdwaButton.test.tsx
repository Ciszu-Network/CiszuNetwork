// @vitest-environment happy-dom
import React from 'react';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import InstallPdwaButton, { detectPdwaBrowser } from '../src/InstallPdwaButton';

afterEach(() => {
  vi.unstubAllGlobals();
  cleanup();
  localStorage.clear();
});

describe('detectPdwaBrowser', () => {
  it('detecta Chrome, Edge, Opera GX, Firefox, Safari e iOS', () => {
    expect(detectPdwaBrowser('Mozilla/5.0 ... Chrome/131.0.0.0 Safari/537.36').id).toBe('chrome');
    expect(detectPdwaBrowser('Mozilla/5.0 ... Edg/131.0.0.0').id).toBe('edge');
    expect(detectPdwaBrowser('Mozilla/5.0 ... OPR/116.0.0.0 GX/2.5').id).toBe('opera-gx');
    expect(detectPdwaBrowser('Mozilla/5.0 ... Firefox/133.0').id).toBe('firefox');
    expect(detectPdwaBrowser('Mozilla/5.0 Macintosh ... Safari/605.1.15').id).toBe('safari');
    expect(detectPdwaBrowser('Mozilla/5.0 iPhone ... Safari/604.1').id).toBe('ios');
    expect(detectPdwaBrowser('Mozilla/5.0 (X11; FreeBSD) Spider/1.0').id).toBe('other');
  });
});

describe('InstallPdwaButton', () => {
  it('se muestra en esquina inferior izquierda con aria-label PDWA (sin dismiss)', () => {
    const { getByRole } = render(<InstallPdwaButton site="MuzicMania" />);
    const btn = getByRole('button', { name: /instalar muzicmania como pdwa/i });
    expect(btn).toBeTruthy();
    expect(btn.closest('[data-pdwa-host]')?.className ?? '').toContain('left-4');
    expect(btn.closest('[data-pdwa-host]')?.className ?? '').toContain('bottom-4');
  });

  it('si está descartado en localStorage no se renderiza nunca', () => {
    localStorage.setItem('ciszu-pdwa-dismissed', '1');
    const { queryByRole } = render(<InstallPdwaButton site="PCasizuko" />);
    expect(queryByRole('button', { name: /instalar/i })).toBeNull();
  });

  it('la X guarda en localStorage y el botón desaparece para siempre', () => {
    const { getByRole, queryByRole } = render(<InstallPdwaButton site="MuzicMania" />);
    const dismiss = getByRole('button', { name: /no volver a mostrar/i });
    fireEvent.click(dismiss);
    expect(localStorage.getItem('ciszu-pdwa-dismissed')).toBe('1');
    expect(queryByRole('button', { name: /instalar/i })).toBeNull();
    render(<InstallPdwaButton site="MuzicMania" />);
    expect(queryByRole('button', { name: /instalar/i })).toBeNull();
  });

  it('usa la storageKey pasada por prop (por sitio)', () => {
    const { getByRole } = render(
      <InstallPdwaButton site="CiszuBot" storageKey="ciszu-pdwa-dismissed-ciszubot" />
    );
    fireEvent.click(getByRole('button', { name: /no volver a mostrar/i }));
    expect(localStorage.getItem('ciszu-pdwa-dismissed-ciszubot')).toBe('1');
    expect(localStorage.getItem('ciszu-pdwa-dismissed')).toBeNull();
  });

  it('sin beforeinstallprompt abre panel con alternativas y passos (Opera GX)', async () => {
    const { getByRole, findByText } = render(
      <InstallPdwaButton site="MuzicMania" uaOverride="Mozilla/5.0 ... OPR/26.0.0.0 GX/2.5" />
    );
    fireEvent.click(getByRole('button', { name: /instalar muzicmania como pdwa/i }));
    const title = await findByText('Opera GX no instala PDWA directamente');
    expect(title).toBeTruthy();
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

    const { getByRole, findByRole } = render(<InstallPdwaButton site="Ciszu Network" />);
    window.dispatchEvent(event);

    const btn = await findByRole('button', { name: /instalar ciszu network como pdwa/i });
    fireEvent.click(btn);
    await waitFor(() => expect(prompt).toHaveBeenCalledTimes(1));
  });

  it('muestra disclaimer (cómo instalar) incluso siendo compatible', async () => {
    const { getByRole, findByText } = render(
      <InstallPdwaButton site="Cisnu Network" uaOverride="Mozilla/5.0 ... Chrome/131.0.0.0 Safari/537.36" />
    );
    fireEvent.click(getByRole('button', { name: /instalar/i }));
    const dialogTitle = await findByText('Instala esta PDWA');
    expect(dialogTitle).toBeTruthy();
  });

  it('no se renderiza si ya está instalada (display-mode standalone)', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    const { queryByRole } = render(<InstallPdwaButton site="PDELTA" />);
    expect(queryByRole('button', { name: /instalar/i })).toBeNull();
  });

  it('links a la app nativa de escritorio cuando desktopAppHref existe', async () => {
    const { getByRole, findByRole } = render(
      <InstallPdwaButton site="MuzicMania" desktopAppHref="/download" />
    );
    fireEvent.click(getByRole('button', { name: /instalar/i }));
    const link = await findByRole('link', { name: /descargar muzicmania para windows/i });
    expect(link.getAttribute('href')).toBe('/download');
  });
});
