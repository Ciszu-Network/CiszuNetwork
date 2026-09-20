import { beforeEach, describe, expect, it } from 'vitest';
import {
  AUTH_CODE_MAX_ATTEMPTS,
  AUTH_CODE_MAX_RESENDS,
  AUTH_CODE_RESEND_COOLDOWN_MS,
  AUTH_CODE_SUSPENSION_MS,
  AUTH_CODE_TTL_MS,
} from '../src/authCodes';
import {
  createTwoFactorService,
  type TwoFactorMailer,
  type TwoFactorRecord,
  type TwoFactorStore,
} from '../src/twoFactor';

type Row = TwoFactorRecord & { userId: string; site: string };

/**
 * Store en memoria que imita la tabla `two_factor_codes`.
 * Filtra por (user, site) igual que la consulta real: si no lo hiciera, el test
 * de "código único por website" pasaría sin comprobar nada.
 */
function memoryStore() {
  const rows = new Map<string, Row>();
  let seq = 0;

  const store: TwoFactorStore = {
    async findLatest(userId, site) {
      const matches = [...rows.values()].filter((r) => r.userId === userId && r.site === site);
      return matches.length ? matches[matches.length - 1] : null;
    },
    async create(input) {
      seq += 1;
      const record: Row = {
        id: `row-${seq}`,
        userId: input.userId,
        site: input.site,
        code: input.code,
        createdAt: input.sentAt,
        used: false,
        attempts: 0,
        resends: input.resends,
        lastSentAt: input.sentAt,
        suspendedUntil: 0,
      };
      rows.set(record.id, record);
      return record;
    },
    async incrementAttempts(id) {
      const row = rows.get(id)!;
      row.attempts += 1;
      return row.attempts;
    },
    async markUsed(id) {
      rows.get(id)!.used = true;
    },
    async suspend(id, until) {
      rows.get(id)!.suspendedUntil = until;
    },
    async clearSuspension(id) {
      rows.get(id)!.suspendedUntil = 0;
    },
  };

  return { store, rows };
}

function collectingMailer() {
  const sent: Array<{ to: string; code: string }> = [];
  const mailer: TwoFactorMailer = {
    async send({ to, code }) {
      sent.push({ to, code });
      return { sent: true };
    },
  };
  return { mailer, sent };
}

describe('createTwoFactorService', () => {
  let clock: number;
  const now = () => clock;

  beforeEach(() => {
    clock = 1_700_000_000_000;
  });

  it('emite un código con el formato oficial y lo envía', async () => {
    const { store } = memoryStore();
    const { mailer, sent } = collectingMailer();
    const service = createTwoFactorService({ site: 'ciszubot', siteName: 'CiszuBot', store, mailer, now });

    const res = await service.request({ userId: 'u1', email: 'a@b.com' });
    expect(res.status).toBe(200);
    expect(sent).toHaveLength(1);
    expect(sent[0].code).toMatch(/^C-\d{3} \d{3}$/);
    expect(res.body.expiresInMinutes).toBe(AUTH_CODE_TTL_MS / 60000);
  });

  it('reutiliza el código vigente en vez de emitir otro', async () => {
    const { store } = memoryStore();
    const { mailer, sent } = collectingMailer();
    const service = createTwoFactorService({ site: 'ciszubot', siteName: 'CiszuBot', store, mailer, now });

    await service.request({ userId: 'u1', email: 'a@b.com' });
    const again = await service.request({ userId: 'u1', email: 'a@b.com' });

    expect(again.body.reused).toBe(true);
    expect(sent).toHaveLength(1);
  });

  it('verifica el código correcto y lo consume (un solo uso)', async () => {
    const { store } = memoryStore();
    const { mailer, sent } = collectingMailer();
    const service = createTwoFactorService({ site: 'ciszubot', siteName: 'CiszuBot', store, mailer, now });

    await service.request({ userId: 'u1', email: 'a@b.com' });
    const code = sent[0].code;

    const ok = await service.verify({ userId: 'u1', code });
    expect(ok.status).toBe(200);
    expect(ok.body.success).toBe(true);

    const reuse = await service.verify({ userId: 'u1', code });
    expect(reuse.status).toBe(400);
    expect(reuse.body.state).toBe('used');
  });

  it('acepta el código sin formato (solo los 6 dígitos)', async () => {
    const { store } = memoryStore();
    const { mailer, sent } = collectingMailer();
    const service = createTwoFactorService({ site: 'ciszubot', siteName: 'CiszuBot', store, mailer, now });

    await service.request({ userId: 'u1', email: 'a@b.com' });
    const digits = sent[0].code.replace(/[^0-9]/g, '');
    const res = await service.verify({ userId: 'u1', code: digits });
    expect(res.body.success).toBe(true);
  });

  it('rechaza un formato inválido sin contar intento', async () => {
    const { store } = memoryStore();
    const { mailer } = collectingMailer();
    const service = createTwoFactorService({ site: 'ciszubot', siteName: 'CiszuBot', store, mailer, now });

    const res = await service.verify({ userId: 'u1', code: 'hola' });
    expect(res.status).toBe(400);
    expect(res.body.state).toBe('invalid-format');
  });

  it('suspende al llegar al máximo de intentos fallidos', async () => {
    const { store } = memoryStore();
    const { mailer, sent } = collectingMailer();
    const service = createTwoFactorService({ site: 'ciszubot', siteName: 'CiszuBot', store, mailer, now });

    await service.request({ userId: 'u1', email: 'a@b.com' });
    const real = sent[0].code;
    const wrong = real === 'C-000 000' ? 'C-000 001' : 'C-000 000';

    const first = await service.verify({ userId: 'u1', code: wrong });
    expect(first.body.attemptsRemaining).toBe(AUTH_CODE_MAX_ATTEMPTS - 1);

    // El intento que AGOTA el cupo es el que suspende.
    let exhausting = first;
    for (let i = 1; i < AUTH_CODE_MAX_ATTEMPTS; i += 1) {
      exhausting = await service.verify({ userId: 'u1', code: wrong });
    }
    expect(exhausting.status).toBe(429);
    expect(exhausting.body.state).toBe('suspended');
    expect(exhausting.body.suspendedForMs).toBe(AUTH_CODE_SUSPENSION_MS);

    // Ni con el código correcto se pasa mientras dure la suspensión.
    const blocked = await service.verify({ userId: 'u1', code: real });
    expect(blocked.status).toBe(400);
    expect(blocked.body.state).toBe('suspended');

    // Pasada la suspensión, el registro con los intentos agotados NO revive:
    // hay que pedir un código nuevo (y el servicio debe permitirlo).
    clock += AUTH_CODE_SUSPENSION_MS + 1;
    const revive = await service.verify({ userId: 'u1', code: real });
    expect(revive.body.success).toBe(false);

    const fresh = await service.request({ userId: 'u1', email: 'a@b.com' });
    expect(fresh.status).toBe(200);
    expect(sent).toHaveLength(2);

    const after = await service.verify({ userId: 'u1', code: sent[1].code });
    expect(after.body.success).toBe(true);
  });

  it('exige enfriamiento entre reenvíos', async () => {
    const { store } = memoryStore();
    const { mailer } = collectingMailer();
    const service = createTwoFactorService({ site: 'ciszubot', siteName: 'CiszuBot', store, mailer, now });

    await service.request({ userId: 'u1', email: 'a@b.com' });
    const tooSoon = await service.resend({ userId: 'u1', email: 'a@b.com' });
    expect(tooSoon.status).toBe(429);
    expect(tooSoon.body.state).toBe('cooldown');

    clock += AUTH_CODE_RESEND_COOLDOWN_MS + 1;
    const allowed = await service.resend({ userId: 'u1', email: 'a@b.com' });
    expect(allowed.status).toBe(200);
  });

  it('suspende al agotar los reenvíos y arrastra el contador entre códigos', async () => {
    const { store } = memoryStore();
    const { mailer, sent } = collectingMailer();
    const service = createTwoFactorService({ site: 'ciszubot', siteName: 'CiszuBot', store, mailer, now });

    await service.request({ userId: 'u1', email: 'a@b.com' });
    for (let i = 0; i < AUTH_CODE_MAX_RESENDS; i += 1) {
      clock += AUTH_CODE_RESEND_COOLDOWN_MS + 1;
      const res = await service.resend({ userId: 'u1', email: 'a@b.com' });
      expect(res.status).toBe(200);
    }

    clock += AUTH_CODE_RESEND_COOLDOWN_MS + 1;
    const exhausted = await service.resend({ userId: 'u1', email: 'a@b.com' });
    expect(exhausted.status).toBe(429);
    expect(exhausted.body.state).toBe('suspended');

    // Los reenvíos son acumulativos: se envió el inicial + los permitidos.
    expect(sent).toHaveLength(1 + AUTH_CODE_MAX_RESENDS);
  });

  it('el código de una web no vale en otra', async () => {
    const { store } = memoryStore();
    const { mailer, sent } = collectingMailer();
    const bot = createTwoFactorService({ site: 'ciszubot', siteName: 'CiszuBot', store, mailer, now });
    const muzic = createTwoFactorService({ site: 'muzicmania', siteName: 'MuzicMania', store, mailer, now });

    await bot.request({ userId: 'u1', email: 'a@b.com' });
    const res = await muzic.verify({ userId: 'u1', code: sent[0].code });
    expect(res.status).toBe(404);
    expect(res.body.state).toBe('no-code');
  });

  it('informa el estado para pintar la pantalla', async () => {
    const { store } = memoryStore();
    const { mailer } = collectingMailer();
    const service = createTwoFactorService({ site: 'ciszubot', siteName: 'CiszuBot', store, mailer, now });

    const before = await service.status({ userId: 'u1' });
    expect(before.body.active).toBe(false);

    await service.request({ userId: 'u1', email: 'a@b.com' });
    const after = await service.status({ userId: 'u1' });
    expect(after.body.active).toBe(true);
    expect(after.body.state).toBe('valid');
    expect(after.body.resendsRemaining).toBe(AUTH_CODE_MAX_RESENDS);
  });

  it('propaga el fallo de envío en vez de dar éxito', async () => {
    const { store } = memoryStore();
    const mailer: TwoFactorMailer = {
      async send() {
        return { sent: false, error: 'sin proveedor' };
      },
    };
    const service = createTwoFactorService({ site: 'ciszubot', siteName: 'CiszuBot', store, mailer, now });

    const res = await service.request({ userId: 'u1', email: 'a@b.com' });
    expect(res.status).toBe(502);
    expect(res.body.state).toBe('delivery-failed');
  });
});
