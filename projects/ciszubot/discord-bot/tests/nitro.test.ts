import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/services/configService', () => ({
  getGuildConfig: vi.fn(),
  updateGuildConfig: vi.fn(),
}));

vi.mock('../src/utils/permissions', () => ({
  isStaff: vi.fn(),
  STAFF_ERROR: 'staff only',
}));

vi.mock('../src/services/i18n', () => ({
  langOf: vi.fn(),
  tr: (lang: string, es: string, en: string) => (lang === 'en' ? en : es),
}));

import nitroCommand from '../src/commands/nitro';
import { getGuildConfig, updateGuildConfig } from '../src/services/configService';
import { hasExternalEmoji, isNitroRoleExcluded, sendNitroWebhook } from '../src/services/nitro';
import { langOf } from '../src/services/i18n';
import { isStaff } from '../src/utils/permissions';

const getConfig = vi.mocked(getGuildConfig);
const updateConfig = vi.mocked(updateGuildConfig);
const langOfMock = vi.mocked(langOf);
const isStaffMock = vi.mocked(isStaff);

function config(overrides: Record<string, unknown> = {}) {
  return {
    guild_id: 'g1',
    prefix: 'cz!',
    lang: 'es',
    nitro_repost_enabled: true,
    nitro_repost_mode: 'manual',
    nitro_excluded_role_ids: [],
    ...overrides,
  } as never;
}

function makeMessage(excluded: string[] = []) {
  const hookSend = vi.fn().mockResolvedValue({});
  const hook = { send: hookSend };
  const channel = {
    fetchWebhooks: vi.fn().mockResolvedValue({ find: vi.fn(() => hook) }),
    permissionsFor: vi.fn(() => ({ has: () => true })),
    createWebhook: vi.fn().mockResolvedValue(hook),
  };
  const guild = {
    id: 'g1',
    emojis: { cache: { has: () => false } },
    members: { me: { id: 'bot' } },
  };
  const member = {
    displayName: 'Tester',
    roles: { cache: { has: (roleId: string) => excluded.includes(roleId) } },
  };
  const message = {
    guild,
    channel,
    member,
    client: { user: { id: 'bot', displayAvatarURL: () => 'avatar' } },
    author: {
      username: 'tester',
      tag: 'tester#0001',
      displayAvatarURL: () => 'avatar',
    },
    content: 'cz!nitro <:party:999>',
    reference: null,
    reply: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
  };
  return { message, hookSend, channel };
}

beforeEach(() => {
  vi.clearAllMocks();
  langOfMock.mockResolvedValue('es');
  isStaffMock.mockResolvedValue(false);
  getConfig.mockResolvedValue(config());
});

describe('nitro helpers', () => {
  it('detecta emojis externos y respeta los del servidor', () => {
    expect(hasExternalEmoji('<:party:999>', { has: () => false })).toBe(true);
    expect(hasExternalEmoji('<:party:123>', { has: (id) => id === '123' })).toBe(false);
    expect(hasExternalEmoji('sin emojis', { has: () => false })).toBe(false);
  });

  it('excluye miembros con roles configurados', () => {
    const member = { roles: { cache: { has: (id: string) => id === 'r1' } } };
    expect(isNitroRoleExcluded(member as never, ['r1'])).toBe(true);
    expect(isNitroRoleExcluded(member as never, ['r2'])).toBe(false);
  });

  it('reenvía por webhook con identidad del autor y borra el original', async () => {
    const { message, hookSend } = makeMessage();
    const sent = await sendNitroWebhook(message as never, 'hola <:party:999>');
    expect(sent).toBe(true);
    expect(hookSend).toHaveBeenCalledWith(
      expect.objectContaining({ content: 'hola <:party:999>', username: 'Tester', allowedMentions: { parse: [] } }),
    );
    expect(message.delete).toHaveBeenCalled();
  });
});

describe('comando nitro manual', () => {
  it('permite a un usuario normal reenviar comando + emoji', async () => {
    const { message, hookSend } = makeMessage();
    await nitroCommand.execute(message as never, ['<:party:999>']);
    expect(hookSend).toHaveBeenCalled();
    expect(message.reply).not.toHaveBeenCalled();
    expect(isStaffMock).not.toHaveBeenCalled();
  });

  it('bloquea a miembros con rol excluido', async () => {
    getConfig.mockResolvedValue(config({ nitro_excluded_role_ids: ['r1'] }));
    const { message, hookSend } = makeMessage(['r1']);
    await nitroCommand.execute(message as never, ['<:party:999>']);
    expect(hookSend).not.toHaveBeenCalled();
    expect(message.reply).toHaveBeenCalledWith(expect.stringContaining('excluido'));
  });

  it('no reenvía si el sistema está desactivado', async () => {
    getConfig.mockResolvedValue(config({ nitro_repost_enabled: false }));
    const { message, hookSend } = makeMessage();
    await nitroCommand.execute(message as never, ['<:party:999>']);
    expect(hookSend).not.toHaveBeenCalled();
    expect(message.reply).toHaveBeenCalledWith(expect.stringContaining('desactivados'));
  });

  it('permite al staff cambiar el modo', async () => {
    isStaffMock.mockResolvedValue(true);
    const { message } = makeMessage();
    await nitroCommand.execute(message as never, ['mode', 'manual']);
    expect(updateConfig).toHaveBeenCalledWith('g1', { nitro_repost_mode: 'manual' });
  });
});
