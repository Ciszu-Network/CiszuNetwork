// @vitest-environment happy-dom
import React from 'react';
import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  FabStackProvider,
  useFabStack,
  useFabRestore,
  restoreFabButtons,
  FabRestore,
  FAB_BASE_BOTTOM,
  FAB_GAP,
  FAB_RESTORE_EVENT,
} from '../src/FabStack';

afterEach(() => {
  cleanup();
  localStorage.clear();
});

function Slot({ id, order, height, visible = true }: { id: string; order: number; height: number; visible?: boolean }) {
  const bottom = useFabStack(id, visible ? { order, height } : null);
  return <div data-testid={id} style={{ position: 'fixed', bottom }} />;
}

describe('FabStack', () => {
  it('apila los slots por order sobre la base', () => {
    const { getByTestId } = render(
      <FabStackProvider>
        <Slot id="pdwa" order={0} height={36} />
        <Slot id="feedback" order={1} height={36} />
      </FabStackProvider>
    );
    expect(getByTestId('pdwa').style.bottom).toBe(`${FAB_BASE_BOTTOM}px`);
    expect(getByTestId('feedback').style.bottom).toBe(`${FAB_BASE_BOTTOM + 36 + FAB_GAP}px`);
  });

  it('sin proveedor devuelve la base (fallback para no romper otros componentes)', () => {
    const { getByTestId } = render(<Slot id="pdwa" order={0} height={36} />);
    expect(getByTestId('pdwa').style.bottom).toBe(`${FAB_BASE_BOTTOM}px`);
  });

  it('al ocultar el slot de abajo, el de arriba baja hasta la base', async () => {
    const { getByTestId, rerender } = render(
      <FabStackProvider>
        <Slot id="pdwa" order={0} height={36} visible />
        <Slot id="feedback" order={1} height={36} visible />
      </FabStackProvider>
    );
    expect(getByTestId('feedback').style.bottom).toBe(`${FAB_BASE_BOTTOM + 36 + FAB_GAP}px`);

    rerender(
      <FabStackProvider>
        <Slot id="pdwa" order={0} height={36} visible={false} />
        <Slot id="feedback" order={1} height={36} visible />
      </FabStackProvider>
    );
    await waitFor(() => {
      expect(getByTestId('feedback').style.bottom).toBe(`${FAB_BASE_BOTTOM}px`);
    });
  });

  it('respeta alturas distintas entre slots', () => {
    const { getByTestId } = render(
      <FabStackProvider>
        <Slot id="a" order={0} height={40} />
        <Slot id="b" order={1} height={30} />
      </FabStackProvider>
    );
    expect(getByTestId('b').style.bottom).toBe(`${FAB_BASE_BOTTOM + 40 + FAB_GAP}px`);
  });
});

describe('restoreFabButtons', () => {
  it('limpia los flags de dismiss y emite el evento de restauración', () => {
    localStorage.setItem('ciszu-pdwa-dismissed', '1');
    localStorage.setItem('muzicmania-feedback-dismissed', '1');

    const handler = vi.fn();
    window.addEventListener(FAB_RESTORE_EVENT, handler);

    restoreFabButtons();

    expect(localStorage.getItem('ciszu-pdwa-dismissed')).toBeNull();
    expect(localStorage.getItem('muzicmania-feedback-dismissed')).toBeNull();
    expect(handler).toHaveBeenCalledTimes(1);
    window.removeEventListener(FAB_RESTORE_EVENT, handler);
  });

  it('con keys solo limpia y notifica esas claves (reactivación acotada)', () => {
    localStorage.setItem('ciszu-pdwa-dismissed', '1');
    localStorage.setItem('muzicmania-feedback-dismissed', '1');

    const handler = vi.fn((e: Event) => {
      result = (e as CustomEvent<{ keys?: string[] }>).detail?.keys ?? [];
    });
    let result: string[] = [];
    window.addEventListener(FAB_RESTORE_EVENT, handler);

    restoreFabButtons(['ciszu-pdwa-dismissed']);

    expect(localStorage.getItem('ciszu-pdwa-dismissed')).toBeNull();
    expect(localStorage.getItem('muzicmania-feedback-dismissed')).toBe('1');
    expect(handler).toHaveBeenCalledTimes(1);
    expect(result).toEqual(['ciszu-pdwa-dismissed']);
    window.removeEventListener(FAB_RESTORE_EVENT, handler);
  });
});

describe('useFabRestore', () => {
  it('invoca el callback al emitirse el evento', () => {
    const onRestore = vi.fn();
    function Listener() {
      useFabRestore(onRestore);
      return <div data-testid="l" />;
    }
    render(<Listener />);
    act(() => {
      window.dispatchEvent(new Event(FAB_RESTORE_EVENT));
    });
    expect(onRestore).toHaveBeenCalledTimes(1);
  });

  it('con keys ignora restauraciones que no tocan sus claves', () => {
    const onRestore = vi.fn();
    function Scoped() {
      useFabRestore(onRestore, ['ciszu-pdwa-dismissed']);
      return <div data-testid="l" />;
    }
    render(<Scoped />);

    act(() => {
      window.dispatchEvent(
        new CustomEvent(FAB_RESTORE_EVENT, { detail: { keys: ['ciszu-feedback-dismissed'] } })
      );
    });
    expect(onRestore).not.toHaveBeenCalled();

    act(() => {
      window.dispatchEvent(
        new CustomEvent(FAB_RESTORE_EVENT, { detail: { keys: ['ciszu-pdwa-dismissed'] } })
      );
    });
    expect(onRestore).toHaveBeenCalledTimes(1);
  });
});

describe('FabRestore', () => {
  it('al pulsar limpia localStorage y emite el evento', () => {
    const handler = vi.fn();
    window.addEventListener(FAB_RESTORE_EVENT, handler);
    localStorage.setItem('ciszu-feedback-dismissed', '1');

    const { getByRole } = render(<FabRestore />);
    fireEvent.click(getByRole('button', { name: /restaurar bot/i }));

    expect(localStorage.getItem('ciszu-feedback-dismissed')).toBeNull();
    expect(handler).toHaveBeenCalledTimes(1);
    window.removeEventListener(FAB_RESTORE_EVENT, handler);
  });

  it('con keys solo restaura las claves indicadas', () => {
    localStorage.setItem('ciszu-pdwa-dismissed', '1');
    localStorage.setItem('muzicmania-feedback-dismissed', '1');

    const { getByRole } = render(<FabRestore keys={['ciszu-pdwa-dismissed']} />);
    fireEvent.click(getByRole('button', { name: /restaurar bot/i }));

    expect(localStorage.getItem('ciszu-pdwa-dismissed')).toBeNull();
    expect(localStorage.getItem('muzicmania-feedback-dismissed')).toBe('1');
  });
});
