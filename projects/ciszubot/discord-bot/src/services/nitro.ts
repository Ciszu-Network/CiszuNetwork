import { GuildMember, Message, PermissionsBitField, TextChannel } from 'discord.js';
import { logger } from './logger';

export const NITRO_EMOJI_RE = /<a?:(\w+):(\d+)>/g;

type EmojiCache = { has(id: string): boolean };

export function hasExternalEmoji(content: string, emojis: EmojiCache): boolean {
  if (!content) return false;
  for (const match of content.matchAll(NITRO_EMOJI_RE)) {
    if (!emojis.has(match[2])) return true;
  }
  return false;
}

export function isNitroRoleExcluded(
  member: Pick<GuildMember, 'roles'> | null | undefined,
  excludedRoleIds: string[],
): boolean {
  if (!member || excludedRoleIds.length === 0) return false;
  return excludedRoleIds.some((roleId) => member.roles.cache.has(roleId));
}

export async function sendNitroWebhook(
  message: Message,
  content: string,
  options: { deleteOriginal?: boolean } = {},
): Promise<boolean> {
  const trimmed = content.trim();
  if (!trimmed || !message.guild) return false;
  const channel = message.channel as TextChannel;
  if (typeof channel.fetchWebhooks !== 'function') return false;
  const me = message.guild.members.me;
  if (!me || !channel.permissionsFor(me)?.has(PermissionsBitField.Flags.ManageWebhooks)) return false;

  try {
    const hooks = await channel.fetchWebhooks();
    let hook = hooks.find((candidate) => candidate.owner?.id === message.client.user?.id);
    if (!hook) hook = await channel.createWebhook({ name: 'CiszuBot Nitro' });
    await hook.send({
      content: trimmed.slice(0, 2000),
      username: message.member?.displayName ?? message.author.username,
      avatarURL: message.author.displayAvatarURL({ size: 128 }),
      allowedMentions: { parse: [] },
    });
    if (options.deleteOriginal !== false) await message.delete().catch(() => undefined);
    return true;
  } catch (error) {
    logger.warn('nitro repost:', error);
    return false;
  }
}
